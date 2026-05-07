"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseClient_1 = require("../services/supabaseClient");
async function authMiddleware(req, res, next) {
    if (req.method === "OPTIONS")
        return next();
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    const { data: { user }, error } = await supabaseClient_1.supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: error?.message || "Invalid or expired token" });
    }
    const userSupabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
    });
    req.user = { id: user.id };
    req.supabase = userSupabase;
    next();
}
