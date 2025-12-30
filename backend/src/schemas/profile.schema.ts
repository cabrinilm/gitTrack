import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(50, "Name must be at most 50 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
