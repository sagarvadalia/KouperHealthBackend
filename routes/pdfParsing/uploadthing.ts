import { createUploadthing, type FileRouter } from "uploadthing/express";
import pdf from "pdf-parse";
import pdfjs from "pdfjs-dist";
import { Patient } from "../../models/patientModel";
const f = createUploadthing();

export const uploadRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => {
      const userId = "test";
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
     
      const doc = await pdfjs.getDocument(uint8Array).promise;
    const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      }).join(' ');


      const content = await page.getTextContent();
  
      const dataRows = parsePdfData(content)
      // console.log("================")
      // console.log(text)
      // console.log("================")
      console.log(dataRows)
    })


}


export type OurFileRouter = typeof uploadRouter;

// TODO: this whole function is super janky...NOT production ready....
// TODO: it mostly works so I can use it while I iterate through the rest of the functionality
// TODO: this should have error handling and retry mechanisms. We should probably persist the fileUrl to the db and the processed state
async function parsePdfData(content: any) {
  const items = content.items.map((item: any) => ({
    text: item.str.trim(),
    x: Math.round(item.transform[4]),
    y: Math.round(item.transform[5])
  }));
 
  // Group items by y-coordinate
  const rows: any = {};
  items.forEach((item: any) => {
    if (!item.text || item.text === ' ') return;
    if (!rows[item.y]) rows[item.y] = [];
    rows[item.y].push(item);
  });
 
  // Find header row
  // @ts-ignore
  const headerRow: any = Object.values(rows).find((row: any) => 
    row.some((item: any) => item.text === 'Name')
  ).sort((a: any, b: any) => a.x - b.x);
 
  const patientRecords = Object.values(rows)
    .filter((row: any) => row.length > 1 && row !== headerRow)
    .map((row: any) => {
      const rowItems = row.sort((a: any, b: any) => a.x - b.x);
      return headerRow.reduce((record: any, header: any, index: any) => {
        const nextHeader = headerRow[index + 1];
        const value = rowItems.find((item:any) => {
          const endX = nextHeader?.x || Infinity;
            // For Date column, allow items slightly left
            if (header.text === 'Date') {
              return item.x >= header.x - 20 && (!nextHeader || item.x < nextHeader.x);
            }
          if (header.text === 'Phone number') {
            // TODO: this is not working for Chris P Bacon
            // Find item that contains phone number within column bounds
            const phoneItem = rowItems.find((i:any) => i.x <= endX && /\d{3}-?\d{3}-?\d{4}|\d{10}/.test(i.text));
            if (phoneItem) {
              // Extract just the phone portion
              const phoneMatch = phoneItem.text.match(/\d{3}-?\d{3}-?\d{4}|\d{10}/);
              return phoneMatch[0];
            }
          }
 
          // Default column matching
          return item.x >= header.x && (!nextHeader || item.x < nextHeader.x);
         })?.text;
         const key = header.text.toLowerCase().split(" ").map((word: string, index: number) => 
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        ).join("");
        record[key] = value;
        return record;
      }, {});
    }); 
    console.log(patientRecords)
    Patient.create(patientRecords)
 }







// TODO: this is the old function that I used to use before I switched to pdfjs
// async function parsePdfData(content: any) {
//   const items = content.items.map((item: any) => ({
//     text: item.str.trim(),
//     x: Math.round(item.transform[4]),
//     y: Math.round(item.transform[5])
//   }));

//   // Get header row and data rows
//   const headerRow = items.find((item: any) => item.text.includes("Name"));
//   const dataRows: any = {};

//   // Group items by y-coordinate
//   items.forEach((item: any) => {
//     if (!item.text || item.text === ' ') return;
//     // @ts-ignore
//     if (!dataRows[item.y]) dataRows[item.y] = [];
//     // @ts-ignore
//     dataRows[item.y].push(item);
//   });

//   // Convert to array of records
//   return Object.values(dataRows)
//     .filter((row: any) => row.length > 1) // Remove single-item rows
//     .map((row: any) => {
//       const rowItems = row.sort((a: any, b: any) => a.x - b.x);
//       const phoneMatch = rowItems.find((item: any) => /^\d{3}-?\d{3}-?\d{4}$/.test(item.text))?.text;
// const formattedPhone = phoneMatch?.includes('-') ? phoneMatch : 
//  phoneMatch?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

// const attendingPhysician = rowItems.find((item: any) => 
//  (item.text.includes('MD') || item.text.includes('PA')) && 
//  !item.text.includes(phoneMatch))?.text;
//       return {
//         name: rowItems.find((item: any) => Math.abs(item.x - headerRow.x) < 20)?.text,
//         epicId: rowItems.find((item: any) => item.text.startsWith('EP'))?.text,
//         phone: formattedPhone,
//         attendingPhysician: attendingPhysician,
//         primaryCareProvider: rowItems.find((item: any) => {
//           const isPCP = item.text.includes('MD') || item.text.includes('PA');
//           const notAttending = item !== rowItems.find((i: any) => i.text === attendingPhysician);
//           return isPCP && notAttending;
//          })?.text,
//         date: rowItems.find((item: any) => /\d{2}-\d{2}-\d{4}/.test(item.text))?.text,
//         insurance: rowItems.find((item: any) => ['BCBS', 'Aetna Health', 'Self Pay', 'Humana Health'].includes(item.text))?.text,
//         disposition: rowItems.find((item: any) => ['Home', 'HHS', 'SNF'].includes(item.text))?.text
//       };
//     })
//     .filter(record => record.name && record.epicId); // Only return complete records
// }