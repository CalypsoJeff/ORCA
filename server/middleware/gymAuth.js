import { verifyToken } from "../helper/jwtHelper.js";
import User from "../models/userModel.js";
import GymOwner from "../models/gymOwnerModel.js";
export const isGymOwner = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        // if (user.role !== "GymOwner") {
        //     return res.status(403).json({ error: "Access denied. Not a gym owner." });
        // }
        const gymOwner = await GymOwner.findOne({ userId: user._id });
        if (!gymOwner) {
            return res.status(404).json({ error: "Gym owner profile not found." });
        }
        if (!gymOwner.isApproved) {
            return res.status(403).json({ error: "Your gym profile is pending admin approval." });
        }
        req.user = user;
        req.gymOwner = gymOwner;
        req.gymOwnerId = gymOwner._id;
        next();
    } catch (error) {
        console.error("Gym auth error:", error);
        return res.status(400).json({ error: "Invalid or expired token." });
    }
};
