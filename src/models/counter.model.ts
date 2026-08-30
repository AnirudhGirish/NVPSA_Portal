import { Schema, models, model } from "mongoose";

const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

export type CounterRecord = {
  _id: string;
  seq: number;
};

export const Counter = models.Counter || model("Counter", counterSchema);
