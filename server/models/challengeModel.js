import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
    gymOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "GymOwner", required: true },
    title: { type: String, required: true },
    description: String,
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    durationDays: { type: Number, required: true },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Challenge", challengeSchema);
