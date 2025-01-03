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
async function parsePdfData(content: any) {
  const items = content.items.map((item: any) => ({
    text: item.str,
    x: Math.round(item.transform[4]),
    y: Math.round(item.transform[5]),
  }));

  // Get header row
  const headerRow = items.find((item: any) => item.text.includes("Name"));

  const dataRows: any = {};

  // Group items by y-coordinate
  items.forEach((item: any) => {
    if (!item.text || item.text === " ") return;
    if (!dataRows[item.y]) dataRows[item.y] = [];
    dataRows[item.y].push(item);
  });

  // Convert to array of records
  return Object.values(dataRows)
    .filter((row: any) => row.length > 1) // Remove single-item rows
    .map((row: any) => {
      const rowItems = row.sort((a: any, b: any) => a.x - b.x);
      // finds either a 10 digit number or a phone number with dashes
      const phoneMatch = rowItems.find((item: any) =>
        /^\d{3}-?\d{3}-?\d{4}$/.test(item.text)
      )?.text;
      const altPhoneMatch = rowItems
        .find((item: any) => /\d{10}/.test(item.text))
        ?.text.slice(0, 10);

      // TODO: we should probably use something like libPhoneNumber to format the phone number
      const formattedPhone = altPhoneMatch || phoneMatch;

      const attendingRow = rowItems.find((item: any) => {
        return item.text.includes("MD") || item.text.includes("PA");
      })?.text;

      // the x coordinate of the phone number is overlapping here so we hackily replace it
      const attendingPhysician = attendingRow
        ?.replace(formattedPhone, "")
        .trim();
      return {
        name: rowItems.find((item: any) => Math.abs(item.x - headerRow.x) < 20)
          ?.text,
        epicId: rowItems.find((item: any) => item.text.startsWith("EP"))?.text,
        phone: formattedPhone,
        attendingPhysician: attendingPhysician,
        primaryCareProvider: rowItems.find((item: any) => {
          const isPCP = item.text.includes("MD") || item.text.includes("PA");
          // attending also uses isPCP so we need to ignore that
          const notAttending =
            item !== rowItems.find((i: any) => i.text === attendingRow);
          return isPCP && notAttending;
        })?.text,
        date: rowItems.find((item: any) => /\d{2}-\d{2}-\d{4}/.test(item.text))
          ?.text,
        insurance: rowItems.find((item: any) =>
          // TODO: we can use a library to get a list of insurance providers and then use that to match
          ["BCBS", "Aetna Health", "Self Pay", "Humana Health"].includes(
            item.text
          )
        )?.text,
        // TODO: we can use a library to get a list of disposition types and then use that to match
        disposition: rowItems.find((item: any) =>
          ["Home", "HHS", "SNF"].includes(item.text)
        )?.text,
      };
    })
    .filter((record) => record.name && record.epicId); // Only return complete records
}
