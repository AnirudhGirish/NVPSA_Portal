import { z } from "zod";

export const adminSchema = z.object({
  username: z
    .string()
    .min(5, "Username must be at least 5 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(/[a-zA-Z0-9_]+$/, "Username must not have special characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(12, "Password must be at most 12 characters"),
});

export type AdminInput = z.infer<typeof adminSchema>;
