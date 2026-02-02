import Exercise from "../models/exerciseModel.js";
import Member from "../models/userModel.js";
import GymOwner from "../models/gymOwnerModel.js";

export const addExercise = async (req, res) => {
    try {
        const gymOwnerId = req.gymOwnerId;
        const exercise = await Exercise.create({ ...req.body, gymOwnerId });
        res.status(201).json({ message: "Exercise added successfully", exercise });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getExercises = async (req, res) => {
    try {
        const gymOwnerId = req.gymOwnerId;
        const exercises = await Exercise.find({ gymOwnerId });
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;

        const exercise = await Exercise.findOne({
            _id: id,
            gymOwnerId: req.gymOwnerId   // ensures owner can access only his data
        });

        if (!exercise)
            return res.status(404).json({ message: "Exercise not found" });

        res.json(exercise);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        await Exercise.findByIdAndDelete(id);
        res.json({ message: "Exercise deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateExercise = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Exercise.findOneAndUpdate(
            { _id: id, gymOwnerId: req.gymOwnerId }, // secure owner check
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ message: "Exercise not found or unauthorized" });

        res.json({
            message: "Exercise updated successfully",
            exercise: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getExercisesForMember = async (req, res) => {
    try {
        console.log("📥 getExercisesForMember called");
        console.log("📥 req.user:", req.user);

        const memberId = req.user?._id || req.user?.id;
        console.log("📥 memberId:", memberId);

        if (!memberId) {
            return res.status(401).json({ message: "Unauthorized: memberId missing" });
        }

        // ✅ Find gym owner where this member is linked
        const gymOwner = await GymOwner.findOne({ members: memberId }).select("_id userId gymName");
        console.log("🏢 gymOwner found:", gymOwner);

        if (!gymOwner) {
            return res.status(400).json({ message: "Member not linked to a gym" });
        }

        // ⚠️ IMPORTANT: which field do your exercises store as gymOwnerId?
        // In addExercise you used: gymOwnerId = req.gymOwnerId
        // That could be gymOwner._id OR gymOwner.userId depending on your gymOwnerAuth middleware.

        // ✅ Try with _id first:
        let exercises = await Exercise.find({ gymOwnerId: gymOwner._id });
        console.log("🏋️ exercises count (using gymOwner._id):", exercises.length);

        // ✅ If 0, try userId (common pattern)
        if (exercises.length === 0 && gymOwner.userId) {
            exercises = await Exercise.find({ gymOwnerId: gymOwner.userId });
            console.log("🏋️ exercises count (using gymOwner.userId):", exercises.length);
        }

        return res.json(exercises);
    } catch (err) {
        console.error("❌ getExercisesForMember error:", err);
        return res.status(500).json({ message: err.message });
    }
};
