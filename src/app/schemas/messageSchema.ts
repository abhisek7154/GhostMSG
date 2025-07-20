import { z } from "zod";

export const acceptMessageSchema = z.object({
    content: z
        .string()
        .min( 10 , "Message must be at least 10 characters long")
        .max( 500 , "Message must not exceed 500 characters")
})