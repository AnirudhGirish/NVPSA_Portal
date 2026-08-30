import { Counter } from "@/models/counter.model";

/**
 * Atomically increments and returns the next alumni serial number.
 * Uses a findOneAndUpdate with $inc + upsert so concurrent
 * registrations never collide.
 */
export async function getNextSerialNumber(): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    "alumni_serial_number",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}
