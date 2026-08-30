import { Schema, models, model, InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export type AdminRecord = InferSchemaType<typeof adminSchema>;

export const Admin = models.Admin || model("Admin", adminSchema);
