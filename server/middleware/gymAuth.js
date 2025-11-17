// server/middleware/gymAuth.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import GymOwner from "../models/gymOwnerModel.js";

// If you have a helper verifyToken, you can use that; using jwt.verify directly here
export const isGymOwner = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const parts = authHeader.split(" ");
    const token = parts.length === 2 && parts[0].toLowerCase() === "bearer" ? parts[1] : null;
    if (!token) {
      return res.status(401).json({ error: "Access denied. Invalid authorization header." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Token verify error:", err);
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // attach decoded payload so other handlers can use it
    req.user = decoded;

    // If token carries gymOwnerId, use it directly
    if (decoded.gymOwnerId) {
      req.gymOwnerId = decoded.gymOwnerId;
      // Optionally populate req.user from DB to check status/role
      try {
        const userFromDb = await User.findById(decoded._id).select("+password -__v");
        if (!userFromDb) {
          return res.status(404).json({ error: "User not found." });
        }
        // attach full user doc as req.user for convenience (keep decoded as minimum)
        req.user = userFromDb;
      } catch (dbErr) {
        console.error("DB lookup error:", dbErr);
        // do not fail here if you prefer — but safest to return error
        return res.status(500).json({ error: "Server error while verifying user." });
      }

      // finally confirm gymOwner entry exists and is approved
      const gymOwner = await GymOwner.findOne({ userId: req.user._id });
      if (!gymOwner) {
        return res.status(403).json({ error: "Access denied. Not a gym owner." });
      }
      if (!gymOwner.isApproved) {
        return res.status(403).json({ error: "Your gym profile is pending admin approval." });
      }

      // attach gymOwner doc for handlers that need it
      req.gymOwner = gymOwner;
      req.gymOwnerId = gymOwner._id.toString();

      return next();
    }

    // If token doesn't contain gymOwnerId, fallback to role check
    // Some tokens might include role: "GymOwner"
    if (decoded.role && decoded.role === "GymOwner") {
      // load user and gymOwner records
      const user = await User.findById(decoded._id).select("+password -__v");
      if (!user) return res.status(404).json({ error: "User not found." });

      const gymOwner = await GymOwner.findOne({ userId: user._id });
      if (!gymOwner) return res.status(403).json({ error: "Gym owner profile not found." });
      if (!gymOwner.isApproved) return res.status(403).json({ error: "Your gym profile is pending admin approval." });

      req.user = user;
      req.gymOwner = gymOwner;
      req.gymOwnerId = gymOwner._id.toString();

      return next();
    }

    // No gymOwnerId and no GymOwner role -> deny
    return res.status(403).json({ error: "Access denied. Not a gym owner." });
  } catch (error) {
    console.error("Gym auth error:", error);
    return res.status(500).json({ error: "Server error in auth middleware." });
  }
};