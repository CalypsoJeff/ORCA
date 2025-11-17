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
      console.log("middleware JWT SECRET =", process.env.JWT_SECRET);
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // decoded token stays here
    req.user = decoded;

    // CASE 1 — token has gymOwnerId
    if (decoded.gymOwnerId) {
      
      // load user from DB but DO NOT overwrite req.user
      const userFromDb = await User.findById(decoded._id).select("+password -__v");
      if (!userFromDb) {
        return res.status(404).json({ error: "User not found." });
      }

      req.dbUser = userFromDb;

      // get gym owner entry
      const gymOwner = await GymOwner.findOne({ userId: userFromDb._id });
      if (!gymOwner) return res.status(403).json({ error: "Access denied. Not a gym owner." });
      if (!gymOwner.isApproved) return res.status(403).json({ error: "Your gym profile is pending admin approval." });

      req.gymOwner = gymOwner;
      req.gymOwnerId = gymOwner._id.toString();

      return next();
    }

    // CASE 2 — token role fallback
    if (decoded.role === "GymOwner") {

      const user = await User.findById(decoded._id).select("+password -__v");
      if (!user) return res.status(404).json({ error: "User not found." });

      const gymOwner = await GymOwner.findOne({ userId: user._id });
      if (!gymOwner) return res.status(403).json({ error: "Gym owner profile not found." });
      if (!gymOwner.isApproved) return res.status(403).json({ error: "Your gym profile is pending admin approval." });

      req.dbUser = user;
      req.gymOwner = gymOwner;
      req.gymOwnerId = gymOwner._id.toString();

      return next();
    }

    return res.status(403).json({ error: "Access denied. Not a gym owner." });

  } catch (err) {
    console.error("Gym auth error:", err);
    return res.status(500).json({ error: "Server error in auth middleware." });
  }
};