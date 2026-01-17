import { z } from 'zod';

export const FulfillActivitySchema = z.object({
    activityId: z
      .number()
      .int({ message: 'activityId must be an integer' })
      .positive({ message: 'activityId must be a positive integer' })
      .describe('The ID of the activity being marked as completed'),
  });

export type FulfillActivityInput = z.infer<typeof FulfillActivitySchema>;