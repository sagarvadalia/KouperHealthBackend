import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import { Router } from "express";
import dotenv from "dotenv";
import { UTApi } from "uploadthing/server";
import PDFParser from "pdf-parse";
// import fetch from "node-fetch";

dotenv.config();
const router = Router();
const utapi = new UTApi();

// Add new route to get and parse PDF
// router.get("/parse/:fileKey", async (req, res) => {
//   try {
//     // Get the file URL from UploadThing
//     const fileKey = req.params.fileKey;
//     const fileUrl = await utapi.getFileUrl(fileKey);

//     if (!fileUrl) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     // Fetch the PDF file
//     const response = await fetch(fileUrl);
//     const pdfBuffer = await response.buffer();

//     // Parse the PDF
//     const data = await PDFParser(pdfBuffer);

//     // Return the parsed content
//     res.json({
//       text: data.text,
//       numPages: data.numpages,
//       info: data.info
//     });

//   } catch (error) {
//     console.error("Error parsing PDF:", error);
//     res.status(500).json({ error: "Failed to parse PDF" });
//   }
// });

export { router as pdfRouter };
