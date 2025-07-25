import {z} from "zod";

export const usernameValidation = z
       .string()
       .min(2 , "Username must be at least 2 characters")
       .max(20, "Username must be at most 20 characters")
       .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");



export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters" })
        .max(50, { message: "Password must be at most 50 characters" }),        
})