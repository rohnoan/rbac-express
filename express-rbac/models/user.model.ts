import { Schema, model } from 'mongoose';

export type Role = 'superadmin' | 'admin' | 'member';

export interface IUser {
  _id: string;
  clerkId: string;
  role: Role;
  orgClerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['superadmin', 'admin', 'member'], required: true },
  orgClerkId: { type: String, required: true }
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);