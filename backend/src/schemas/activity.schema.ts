import { z } from "zod";

export const createActivitySchema = z.object({
  name: z
    .string()
    .min(1, "Activity name is required")
    .max(150, "Activity name must be at most 150 characters"),

  duration_minutes: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration must be at most 24 hours (1440 minutes)"),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
