import { z } from "zod";

export const postChallengeSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(30, "Name too long"),
  description: z.string().max(50, "Description too long").nullish()
});

export type PostChallengeInput = z.infer<typeof postChallengeSchema>;
