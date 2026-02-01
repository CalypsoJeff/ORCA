import Exercise from "../models/exerciseModel.js";
import Member from "../models/memberModel.js";

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
        const memberId = req.userId; // from member auth middleware
        const member = await Member.findById(memberId).select("gymOwnerId");

        console.log("📥 getExercisesForMember called");
        console.log("📥 req.userId:", req.userId);

        if (!member?.gymOwnerId) {
            return res.status(400).json({ message: "Member not linked to a gym" });
        }

        const exercises = await Exercise.find({ gymOwnerId: member.gymOwnerId });
        return res.json(exercises);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
