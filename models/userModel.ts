import { Schema, model, Document } from "mongoose";

export interface UserSchema extends Document {
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Opted not to add in passwords, salting, auth, etc.
// in a real app, we would want to use an oauth solution
const UserSchema = new Schema<UserSchema>({
  userName: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.index({ userName: 1 });

export const User = model<UserSchema>("User", UserSchema);
