import jwt from "jsonwebtoken";

export const gymOwnerAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.gymOwnerId = decoded.gymOwnerId;

        next();
    } catch {
        res.status(401).json({ message: "Unauthorized" });
    }
};
