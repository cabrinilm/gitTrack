"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivitySchema = void 0;
const zod_1 = require("zod");
exports.createActivitySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Activity name is required")
        .max(30, "Activity name must be at most 150 characters"),
    duration_minutes: zod_1.z
        .number()
        .int("Duration must be a whole number")
        .min(1, "Duration must be at least 1 minute")
        .max(1440, "Duration must be at most 24 hours (1440 minutes)"),
});
