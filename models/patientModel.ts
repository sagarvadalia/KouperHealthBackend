import { Schema, model, Document } from "mongoose";

export interface PatientSchema extends Document {
  name: string;
  epicId: string;
  phoneNumber: string;
  attendingPhysician: string;
  dischargeDate: string;
  primaryCareProvider: string;
  insurance: string;
  disposition: string;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<PatientSchema>({
  name: { type: String, required: true, trim: true },
  epicId: { type: String },
  phoneNumber: { type: String },
  attendingPhysician: { type: String },
  dischargeDate: { type: String },
  primaryCareProvider: { type: String },
  insurance: { type: String },
  disposition: { type: String },
  lastModifiedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

patientSchema.index({ name: 1 });
patientSchema.index({ phone: 1 });

export const Patient = model<PatientSchema>("Patient", patientSchema);
