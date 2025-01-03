import pdfjs from "pdfjs-dist";
import { createUploadthing } from "uploadthing/express";
import { Patient } from "../../models/patientModel";
const f = createUploadthing();

// TODO: this should probably all be done in a worker node so we can scale without crashing the server.
export const uploadRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => {
      const userId = "test";
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // TODO: we should persist the fileUrl to the db and then mark the fileUrl as processed. Perhaps we also tag that by the title so we don't duplicate the work
      const response = await fetch(file.url);
      if (!response.ok) throw new Error("Failed to fetch PDF");
      const arrayBuffer = await response.arrayBuffer();

      const uint8Array = new Uint8Array(arrayBuffer);

      const doc = await pdfjs.getDocument(uint8Array).promise;
      // TODO: we should iterate over all the pages and get the text content
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => {
          if ("str" in item) {
            return item.str;
          }
          return "";
        })
        .join(" ");

      const content = await page.getTextContent();

      const dataRows = parsePdfData(content);
      // create the patient list
      // TODO: we should have error handling here
      // TODO: we should chunk these and perform this insert in batches
      // TODO: this is where we would validate data fields like phone numbers using twilio
      await Patient.create(dataRows);
    }),
};

// TODO: this whole function is super janky...NOT GREAT...Given the purposes of this coding challenge, it does the job for our given PDF but we need to find a better algo
// TODO: this should have error handling and retry mechanisms
function parsePdfData(content: any) {
  const items = content.items.map((item: any) => ({
    text: item.str,
    x: Math.round(item.transform[4]),
    y: Math.round(item.transform[5]),
  }));
  // Get header row
  const nameHeaderRow = items.find((item: any) => item.text.includes("Name"));
  const epicIdHeaderRow = items.find((item: any) => item.text.includes("Epic Id"));
  const dateHeaderRow = items.find((item: any) => item.text.includes("Date"));
  const primaryCareProviderHeaderRow = items.find((item: any) => item.text.includes("Primary Care Provider"));
  const insuranceHeaderRow = items.find((item: any) => item.text.includes("Insurance"));
  const dispositionHeaderRow = items.find((item: any) => item.text.includes("Disposition"));

  const dataRows: any = {};

  // Group items by y-coordinate
  items.forEach((item: any) => {
    if (!item.text || item.text === " ") return;
    if (!dataRows[item.y]) dataRows[item.y] = [];
    dataRows[item.y].push(item);
  });

  // Convert to array of records
  return Object.values(dataRows)
    .map((row: any) => {
      const rowItems = row.sort((a: any, b: any) => a.x - b.x);
      // using regexes over x coords since the pdf is not aligned and the phone row bleeds into attending physician
      // finds either a 10 digit number or a phone number with dashes
      const phoneMatch = rowItems.find((item: any) =>
        /^\d{3}-?\d{3}-?\d{4}$/.test(item.text)
      )?.text;
      const altPhoneMatch = rowItems
        .find((item: any) => /\d{10}/.test(item.text))
        ?.text.slice(0, 10);

      // TODO: we should probably use something like libPhoneNumber to format the phone number
      const formattedPhone = altPhoneMatch || phoneMatch;

      // using regexes over x coords since the pdf is not aligned and the phone row bleeds into attending physician
      const attendingRow = rowItems.find((item: any) => {
        return item.text.includes("MD") || item.text.includes("PA");
      })?.text?.replace(formattedPhone, "")
      .trim();

      return {
        name: rowItems.find((item: any) => Math.abs(item.x - nameHeaderRow.x) < 20)
          ?.text,
        epicId: rowItems.find((item: any) => Math.abs(item.x - epicIdHeaderRow.x) < 20)
          ?.text,
        phone: formattedPhone,
        attendingPhysician: attendingRow,
        primaryCareProvider: rowItems.find((item: any) => Math.abs(item.x - primaryCareProviderHeaderRow.x) < 20)?.text,
        date: rowItems.find((item: any) => Math.abs(item.x - dateHeaderRow.x) < 20)?.text,
        insurance: rowItems.find((item: any) => Math.abs(item.x - insuranceHeaderRow.x) < 20)?.text,
        disposition: rowItems.find((item: any) => Math.abs(item.x - dispositionHeaderRow.x) < 20)?.text,
      };
    })
    .filter((record) => record.name !== "Name" && record.name); // ignore the header row
}
