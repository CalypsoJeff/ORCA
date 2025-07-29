import Fitness from "../models/fitnessModel.js";
const addFitness = async (req, res) => {
    console.log("Entering add fitness");
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Each workout must have an animated video.' });
    }
    try {
        const {
            name,
            description,
            categories,
            difficulty,
            duration,
            workouts,
            equipment,
            targetMuscles,
            caloriesBurned,
        } = req.body;
        if (!workouts || workouts.length === 0) {
            return res.status(400).json({ message: 'At least one workout must be added.' });
        }
        if (!categories || categories.length === 0) {
            return res.status(400).json({ message: 'At least one category must be selected.' });
        }
        const category = await FitnessCategory.findById(categories[0]); // Assuming single category for simplicity
        if (!category) {
            return res.status(400).json({ message: 'Invalid category selected.' });
        }
        const existingFitness = await Fitness.findOne({
            name: name.trim(),
            categories: categories[0],
        });
        if (existingFitness) {
            return res.status(400).json({ message: 'A fitness exercise with this name already exists in this category.' });
        }
        const formattedWorkouts = workouts.map((workout) => ({
            name: workout.name,
            restTime: workout.restTime,
            videoUrl: req.files[index].location,
        }));
        const fitness = new Fitness({
            name,
            description,
            categories,
            difficulty,
            duration,
            workouts: formattedWorkouts,
            equipment,
            targetMuscles,
            caloriesBurned: caloriesBurned || null,
        });
        await fitness.save();
        return res.status(200).json({
            message: 'Fitness exercise added successfully.',
            fitness,
        });
    } catch (error) {
        console.error('Error adding fitness exercise:', error);
        return res.status(500).json({
            message: 'Failed to add fitness exercise.',
            error: error.message,
        });
    }
};

const addFitnessCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const existingCategory = await FitnessCategory.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this name already exists.' });
        }
        const newCategory = new FitnessCategory({
            name: name.trim(),
        });
        await newCategory.save();
        return res.status(201).json({
            message: 'Fitness category added successfully.',
            category: newCategory,
        });
    } catch (error) {
        console.error('Error adding fitness category:', error);
        return res.status(500).json({
            message: 'Failed to add fitness category.',
            error: error.message,
        });
    }
};
export default {
    addFitness,
    addFitnessCategory,
}