import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
    gymOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "GymOwner", required: true },
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ["Strength", "Cardio", "Yoga", "Other"], default: "Other" },
    duration: Number,
    videoUrl: String,
    caloriesBurned: Number,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Exercise", exerciseSchema);
