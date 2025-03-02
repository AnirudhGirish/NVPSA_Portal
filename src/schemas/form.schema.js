import {z} from 'zod';

export const formSchema = z.object({
    name: z.string().regex(/[a-zA-Z ]+$/,"Name must not have special characters"), 
    number: z.number().refine((val) => val.toString().length === 10, {message: "Phone number must be 10 digits"}),
    email: z.string().email({message:"Invalid email address"}), 
    address: z.string(), 
    aadhar: z.number().refine((val) => val.toString().length === 12, {message: "Aadhar number must be 12 digits"}), 
    pass: z.enum(["SSLC", "PUC", "Degree", "Others"]),
    year: z.string(),
})