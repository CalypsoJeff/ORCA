import Membership from "../models/membershipModel.js";
import { verifyToken } from "../helper/jwtHelper.js";

export const isMember = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token provided" });

        const decoded = verifyToken(token);
        req.user = decoded;

        const membership = await Membership.findOne({ userId: decoded._id });
        if (!membership)
            return res.status(403).json({ error: "You are not a gym member" });

        req.membership = membership;
        req.gymOwnerId = membership.gymOwnerId;

        next();
    } catch (err) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }
};
