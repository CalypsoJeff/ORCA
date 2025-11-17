import GymOwner from "../models/gymOwnerModel.js";
import User from "../models/userModel.js";  
import Membership from "../models/membershipModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Register a gym owner
export const registerGymOwner = async (req, res) => {
    try {
        const { name, email, password, gymName, gymAddress, licenseId,phone} = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role: "GymOwner",phone });
        const gymOwner = await GymOwner.create({
            userId: user._id,
            gymName,
            gymAddress,
            licenseId,
            isApproved: false,
        });

        res.status(201).json({
            message: "Gym owner registered successfully. Pending admin approval.",
            gymOwner,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const loginGymOwner = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Check user
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(404).json({ message: "User not found." });

        // if (user.role !== "GymOwner")
        //     return res.status(403).json({ message: "Not a gym owner account." });

        // 2️⃣ Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(401).json({ message: "Invalid credentials." });
        console.log("REQ BODY:", req.body);
console.log("Password from req:", req.body.password);
console.log("Stored hashed password:", user.password);

        // 3️⃣ Check approval
        const gymOwner = await GymOwner.findOne({ userId: user._id });
        if (!gymOwner)
            return res.status(404).json({ message: "Gym owner profile missing." });

        if (!gymOwner.isApproved)
            return res
                .status(403)
                .json({ message: "Your account is pending admin approval." });

        // 4️⃣ Create JWT
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: view pending gym owners
export const getPendingGymOwners = async (req, res) => {
    const pending = await GymOwner.find({ isApproved: false }).populate("userId");
    res.json(pending);
};

export const getProfile = async (req, res) => {
  try {
    const gymOwner = await GymOwner.findById(req.gymOwnerId).select("-password");

    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    res.status(200).json(gymOwner);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/* -----------------------------------------
   UPDATE PROFILE (AUTH REQUIRED)
------------------------------------------ */
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const updatedOwner = await GymOwner.findByIdAndUpdate(
      req.gymOwnerId,
      updates,
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      gymOwner: updatedOwner,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Gym owner: add member
export const addMember = async (req, res) => {
    try {
        const { email, phone } = req.body;
        const gymOwnerId = req.user.gymOwnerId;

        let user = await User.findOne({ $or: [{ email }, { phone }] });
        if (!user) user = await User.create({ email, phone, role: "User" });

        const membership = await Membership.create({ gymOwnerId, userId: user._id });

        await GymOwner.findByIdAndUpdate(gymOwnerId, { $push: { members: membership._id } });
        await User.findByIdAndUpdate(user._id, { $push: { memberships: membership._id } });

        res.status(201).json({ message: "Member added successfully", membership });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Gym owner: list members
export const getMembers = async (req, res) => {
    const gymOwnerId = req.user.gymOwnerId;
    const gymOwner = await GymOwner.findById(gymOwnerId)
        .populate({ path: "members", populate: { path: "userId" } });
    res.json(gymOwner.members);
};
// Admin: Approve gym owner
export const approveGymOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const gymOwner = await GymOwner.findById(id).populate("userId");
        if (!gymOwner)
            return res.status(404).json({ message: "Gym owner not found" });

        gymOwner.isApproved = true;
        gymOwner.approvedAt = new Date();
        await gymOwner.save();

        await User.findByIdAndUpdate(gymOwner.userId._id, { status: "Active" });

        res.json({ message: "Gym owner approved successfully", gymOwner });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Reject gym owner
export const rejectGymOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const gymOwner = await GymOwner.findById(id).populate("userId");
        if (!gymOwner)
            return res.status(404).json({ message: "Gym owner not found" });

        gymOwner.isApproved = false;
        gymOwner.rejectionReason = reason || "Rejected by admin";
        gymOwner.rejectedAt = new Date();
        await gymOwner.save();

        await User.findByIdAndUpdate(gymOwner.userId._id, { status: "Inactive" });

        res.json({ message: "Gym owner rejected", gymOwner });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get single gym owner
export const getGymOwnerById = async (req, res) => {
    try {
        const gymOwner = await GymOwner.findById(req.params.id)
            .populate("userId", "name email phone");
        if (!gymOwner)
            return res.status(404).json({ message: "Gym owner not found" });
        res.json(gymOwner);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch gym owner details" });
    }
};

export default {
    registerGymOwner,
    loginGymOwner,
    getPendingGymOwners,
    addMember,
    getMembers,
    approveGymOwner,
    rejectGymOwner,
    getGymOwnerById,
};    