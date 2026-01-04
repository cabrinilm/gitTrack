import { z } from "zod";

export const postChallengeSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(50, "Name too long"),
  description: z.string().nullish(),
});

export type PostChallengeInput = z.infer<typeof postChallengeSchema>;
