"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const profile_controller_1 = require("./controllers/profile.controller");
const challenges_controller_1 = require("./controllers/challenges.controller");
const activities_controller_1 = require("./controllers/activities.controller");
const active_challenge_controller_1 = require("./controllers/active_challenge.controller");
const fulfillments_controller_1 = require("./controllers/fulfillments.controller");
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = (process.env.FRONTEND_URLS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.log(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use("/api", auth_1.authMiddleware);
/* Profile */
app.get("/api/profile", profile_controller_1.getMyProfile);
app.patch("/api/profile", profile_controller_1.updateMyProfile);
/* Challenges */
app.get("/api/challenges", challenges_controller_1.getMyChallenges);
app.get("/api/challenges/:challengeId", challenges_controller_1.getMyChallengeById);
app.post("/api/challenges", challenges_controller_1.createMyChallenge);
app.patch("/api/challenges/:challengeId", challenges_controller_1.updateMyChallenge);
app.delete("/api/challenges/:challengeId", challenges_controller_1.deleteMyChallenge);
/* Activities */
app.get("/api/challenges/:challengeId/activities", activities_controller_1.getMyActivities);
app.get("/api/challenges/:challengeId/activities/:activityId", activities_controller_1.getMyActivityById);
app.post("/api/challenges/:challengeId/activities", activities_controller_1.createMyActivity);
app.patch("/api/challenges/:challengeId/activities/:activityId", activities_controller_1.updateMyActivity);
app.delete("/api/challenges/:challengeId/activities/:activityId", activities_controller_1.deleteMyActivity);
/* Active Challenge */
app.get("/api/active-challenge", active_challenge_controller_1.getMyActiveChallenge);
app.post("/api/challenges/:challengeId/activate", active_challenge_controller_1.activateMyChallenge);
app.delete("/api/activate-challenge", active_challenge_controller_1.deleteMyActiveChallenge);
/* Progress */
app.post("/api/progress/fulfillments", fulfillments_controller_1.postMyFulfillActivity);
app.get("/api/progress/heatmap", fulfillments_controller_1.getMyHeatMapData);
app.get("/api/progress/streak", fulfillments_controller_1.getMyStreak);
app.get("/api/progress/:date/fulfillments", fulfillments_controller_1.getMyFulfillActivitiesByDate);
exports.default = app;
if (process.env.NODE_ENV !== "test") {
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
}
