import mongoose from "mongoose";

const gymOwnerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gymName: { type: String, required: true },
    gymAddress: { type: String, required: true },
    licenseId: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Membership" }],
}, { timestamps: true });

export default mongoose.model("GymOwner", gymOwnerSchema);
