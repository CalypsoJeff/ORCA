import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
    gymOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GymOwner",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
    },
    durationDays: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        validate: {
            validator: function (value) {
                // ensures endDate >= startDate
                return !this.startDate || value >= this.startDate;
            },
            message: "End date must be after the start date",
        },
    },
    exercises: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
        },
    ],
    isActive: {
        type: Boolean,
        default: true, // allows easy toggling without deleting
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// 🧠 Optional virtual: auto-calculate endDate if not provided
challengeSchema.pre("save", function (next) {
    if (!this.endDate && this.startDate && this.durationDays) {
        const end = new Date(this.startDate);
        end.setDate(end.getDate() + this.durationDays);
        this.endDate = end;
    }
    next();
});

export default mongoose.model("Challenge", challengeSchema);
