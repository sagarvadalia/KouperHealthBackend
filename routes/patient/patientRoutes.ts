import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../../middleware/authMiddleware";
import { Patient } from "../../models/patientModel";

// TODO: UT for all routes
const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { patient } = req.body;
    const newPatient = await Patient.create(patient);
    res.status(200).json({ message: "Patient created", newPatient });
  } catch (error) {
    next(error);
  }
};

const getAllPatients = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patients = await Patient.find();
    res.status(200).json({ message: "Patients fetched", patients });
  } catch (error) {
    next(error);
  }
};

const getPatient = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const patient = await Patient.findById(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }
  res.status(200).json({ message: "Patient fetched", patient });
};

const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { user } = req.session;
  console.log(id);
  const patient = await Patient.findById(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }
  const updatedPatient = await Patient.findByIdAndUpdate(
    id,
    { ...req.body, lastModifiedBy: user?.userName },
    { new: true },
  );
  res.status(200).json({ message: "Patient Updated", updatedPatient });
};

const router = Router();

// TODO: fix to proper crud routes
router.post("/create", createPatient);
router.get("/", isAuthenticated, getAllPatients);
router.get("/:id", getPatient);
router.put("/:id", isAuthenticated, updatePatient);
export { router as patientRoutes };

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
