import { Schema, model, Document } from 'mongoose';

export interface PatientSchema extends Document {
    name: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}

const patientSchema = new Schema<PatientSchema>({
    name: { type: String, required: true, trim: true },
    // TODO: should validate phone numbers
    phone: { type: String, required: true, trim: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


patientSchema.index({ name: 1 });
patientSchema.index({ phone: 1 }, { unique: true }); 

export const Patient = model<PatientSchema>('Patient', patientSchema);

