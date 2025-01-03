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