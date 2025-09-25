import { Schema, model } from 'mongoose';

export interface IOrganization {
  _id: string;
  name: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema({
  name: { type: String, required: true },
  clerkId: { type: String, required: true, unique: true }
}, { timestamps: true });

// Fix: Explicitly specify the model name and collection name
export const Organization = model<IOrganization>('Organization', organizationSchema, 'organizations');