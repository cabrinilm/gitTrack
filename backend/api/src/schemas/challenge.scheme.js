"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postChallengeSchema = void 0;
const zod_1 = require("zod");
exports.postChallengeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name cannot be empty").max(30, "Name too long"),
    description: zod_1.z.string().max(50, "Description too long").optional(),
});
