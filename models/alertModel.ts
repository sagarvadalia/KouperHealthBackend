import { Schema, model, Document } from "mongoose";

export interface AlertSchema extends Document {
  type: string;
  severity: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<AlertSchema>({
  type: { type: String, required: true },
  severity: { type: String, required: true },
  resolved: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

alertSchema.index({ type: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ resolved: 1 });

// Compound indexes for common query patterns
alertSchema.index({ resolved: 1, createdAt: -1 }); // For finding unresolved alerts sorted by date
alertSchema.index({ type: 1, severity: 1 }); // For filtering by type and severity

export const Alert = model<AlertSchema>("Alert", alertSchema);
