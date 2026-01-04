import { z } from "zod";

export const postChallengeSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(200, "Name too long"),
  description: z.string().optional(),
});

export type PostChallengeInput = z.infer<typeof postChallengeSchema>;
