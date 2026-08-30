import { Schema, models, model, InferSchemaType } from "mongoose";
import type { PassCategory } from "@/types";

const passValues: PassCategory[] = ["SSLC", "PUC", "Degree", "Others"];

const formSchema = new Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    number: {
      type: Number,
      unique: true,
      required: [true, "Phone number is required"],
    },
    email: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    aadhar: {
      type: String,
    },
    pass: {
      type: String,
      enum: passValues,
    },
    year: {
      type: String,
    },
  },
  { timestamps: true }
);

formSchema.index({ createdAt: -1 });

export type FormRecord = InferSchemaType<typeof formSchema>;

export const Form = models.Form || model("Form", formSchema);
