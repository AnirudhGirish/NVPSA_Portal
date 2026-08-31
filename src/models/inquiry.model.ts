import { Schema, models, model, InferSchemaType } from "mongoose";

const VALID_STATUSES = ["unread", "read", "resolved"] as const;

const inquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, trim: true, maxlength: 20 },
    subject: { type: String, trim: true, maxlength: 200, default: "General Inquiry" },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: [...VALID_STATUSES],
      default: "unread",
      index: true,
    },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });

export type InquiryRecord = InferSchemaType<typeof inquirySchema>;
export type InquiryStatus = (typeof VALID_STATUSES)[number];

export const Inquiry = models.Inquiry || model("Inquiry", inquirySchema);
