"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name cannot be empty")
        .max(50, "Name must be at most 50 characters"),
});
