import jwt from "jsonwebtoken";
import User from "../models/users.js";

const JWT_SECRET = process.env.JWT_SECRET || "sitenex_jwt_secret_key_2026";

// @desc    Verifies JWT token and attaches full MongoDB user to req.user
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        // Look up user by MongoDB _id from the JWT payload
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Your account has been deactivated" });
        }

        // Update last login (fire and forget) - skip during tests to prevent async errors after DB clear
        if (process.env.NODE_ENV !== 'test') {
            user.lastLoginAt = new Date();
            user.save().catch(err => console.error("Failed updating last login:", err));
        }
        // Attach the full MongoDB doc — controllers use req.user._id
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verify error:", error.message);
        return res.status(401).json({ success: false, message: "Token verification failed" });
    }
};

// Helper to generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
};

export default protect;
