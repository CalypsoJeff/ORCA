const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ error: "Forbidden: Not an admin." });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};


export { verifyAdmin };