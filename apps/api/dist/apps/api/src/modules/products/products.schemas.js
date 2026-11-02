import { z } from "zod";
export const listQuerySchema = z.object({
    category: z.string().trim().min(1).max(100).optional(),
    q: z.string().trim().min(1).max(200).optional(),
    page: z.coerce.number().int().min(1).default(1),
});
export const productIdSchema = z.coerce.number().int().positive();
export const updateProductSchema = z
    .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(2000),
})
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});
