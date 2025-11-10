import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
    {
        gymOwnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GymOwner",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ["Strength", "Cardio", "Yoga", "Flexibility", "Balance", "Other"],
            default: "Other",
        },
        category: {
            type: String,
            enum: [
                "Full Body",
                "Upper Body",
                "Lower Body",
                "Core",
                "HIIT",
                "Endurance",
                "Warm-up",
                "Cool-down",
                "Other",
            ],
            default: "Other",
        },
        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },
        duration: {
            type: Number, // in minutes
            min: 1,
        },
        sets: {
            type: Number,
            default: 3,
        },
        reps: {
            type: Number,
            default: 10,
        },
        restTime: {
            type: Number, // seconds between sets
            default: 30,
        },
        equipment: {
            type: [String], // e.g. ["Dumbbell", "Resistance Band"]
            default: [],
        },
        targetMuscles: {
            type: [String], // e.g. ["Chest", "Triceps"]
            default: [],
        },
        videoUrl: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        caloriesBurned: {
            type: Number, // estimated calories burned per session
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Exercise", exerciseSchema);
