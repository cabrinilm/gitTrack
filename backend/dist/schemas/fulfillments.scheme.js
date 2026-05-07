"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillActivitySchema = void 0;
const zod_1 = require("zod");
exports.FulfillActivitySchema = zod_1.z.object({
    activityId: zod_1.z
        .number()
        .int({ message: 'activityId must be an integer' })
        .positive({ message: 'activityId must be a positive integer' })
        .describe('The ID of the activity being marked as completed'),
});
