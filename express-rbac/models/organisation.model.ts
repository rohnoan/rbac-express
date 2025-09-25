import { Schema, model } from 'mongoose';

export interface IOrganisation {
  _id: string;
  name: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

const organisationSchema = new Schema({
  name: { type: String, required: true },
  clerkId: { type: String, required: true, unique: true }
}, { timestamps: true });

export const Organisation = model<IOrganisation>('Organisation', organisationSchema);
