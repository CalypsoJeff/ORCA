import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
    gymOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "GymOwner", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    plan: { type: String, enum: ["Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    status: { type: String, enum: ["Active", "Expired", "Cancelled"], default: "Active" },
    assignedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
}, { timestamps: true });

export default mongoose.model("Membership", membershipSchema);
