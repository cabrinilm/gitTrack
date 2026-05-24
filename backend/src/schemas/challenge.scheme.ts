import { z } from "zod";

export const postChallengeSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(30, "Name too long"),
  description: z
    .string()
    .max(50, "Description must be 50 characters or less")
    .nullable()
    .optional(),
});

export type PostChallengeInput = z.infer<typeof postChallengeSchema>;
