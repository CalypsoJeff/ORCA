import Exercise from "../models/exerciseModel.js";
import GymOwner from "../models/gymOwnerModel.js";
import WorkoutLog from "../models/workoutLogModel.js";

const getLoggedInUserId = (req) => req.user?._id || req.user?.id;

const parseWorkoutDate = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid workout date");
    }

    return parsedDate;
};

const parseNumber = (value, fieldName) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw new Error(`${fieldName} must be a valid number`);
    }

    return parsed;
};

const isWorkoutValidationError = (error) =>
    error?.message === "Invalid workout date" ||
    error?.message?.includes("must be a valid number");

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

export const createWorkoutLog = async (req, res) => {
    try {
        const userId = getLoggedInUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {
            exerciseName,
            category,
            weight,
            sets,
            reps,
            mood,
            date,
        } = req.body;

        if (!exerciseName || !category || weight === undefined || sets === undefined || reps === undefined || !mood) {
            return res.status(400).json({
                message: "exerciseName, category, weight, sets, reps, and mood are required",
            });
        }

        const workoutLog = await WorkoutLog.create({
            userId,
            exerciseName: String(exerciseName).trim(),
            category: String(category).trim(),
            weight: parseNumber(weight, "weight"),
            sets: parseNumber(sets, "sets"),
            reps: parseNumber(reps, "reps"),
            mood: String(mood).trim(),
            ...(date !== undefined ? { date: parseWorkoutDate(date) } : {}),
        });

        res.status(201).json({
            message: "Workout log created successfully",
            workoutLog,
        });
    } catch (err) {
        if (isWorkoutValidationError(err)) {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: err.message });
    }
};

export const getWorkoutLogs = async (req, res) => {
    try {
        const userId = getLoggedInUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const workoutLogs = await WorkoutLog.find({ userId }).sort({
            date: -1,
            createdAt: -1,
        });

        res.json(workoutLogs);
    } catch (err) {
        if (isWorkoutValidationError(err)) {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: err.message });
    }
};

export const getWorkoutLogById = async (req, res) => {
    try {
        const userId = getLoggedInUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;

        const workoutLog = await WorkoutLog.findOne({
            _id: id,
            userId,
        });

        if (!workoutLog) {
            return res.status(404).json({ message: "Workout log not found" });
        }

        res.json(workoutLog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateWorkoutLog = async (req, res) => {
    try {
        const userId = getLoggedInUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        const updates = {};

        if (req.body.exerciseName !== undefined) {
            updates.exerciseName = String(req.body.exerciseName).trim();
        }

        if (req.body.category !== undefined) {
            updates.category = String(req.body.category).trim();
        }

        if (req.body.weight !== undefined) {
            updates.weight = parseNumber(req.body.weight, "weight");
        }

        if (req.body.sets !== undefined) {
            updates.sets = parseNumber(req.body.sets, "sets");
        }

        if (req.body.reps !== undefined) {
            updates.reps = parseNumber(req.body.reps, "reps");
        }

        if (req.body.mood !== undefined) {
            updates.mood = String(req.body.mood).trim();
        }

        if (req.body.date !== undefined) {
            updates.date = parseWorkoutDate(req.body.date);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields provided to update" });
        }

        const updatedWorkoutLog = await WorkoutLog.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedWorkoutLog) {
            return res.status(404).json({ message: "Workout log not found" });
        }

        res.json({
            message: "Workout log updated successfully",
            workoutLog: updatedWorkoutLog,
        });
    } catch (err) {
        if (isWorkoutValidationError(err)) {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: err.message });
    }
};

export const deleteWorkoutLog = async (req, res) => {
    try {
        const userId = getLoggedInUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;

        const deletedWorkoutLog = await WorkoutLog.findOneAndDelete({
            _id: id,
            userId,
        });

        if (!deletedWorkoutLog) {
            return res.status(404).json({ message: "Workout log not found" });
        }

        res.json({ message: "Workout log deleted successfully" });
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
