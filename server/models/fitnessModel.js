import mongoose from 'mongoose';

const fitnessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FitnessCategory',
      required: true,
    },
  ],
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value > 0,
      message: 'Duration must be a positive number.',
    },
  },
  workouts: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      restTime: {
        type: Number,
        required: true,
      },
      videoUrl: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  equipment: {
    type: [String],
    enum: [
      'None',
      'Dumbbells',
      'Barbell',
      'Resistance Bands',
      'Kettlebell',
      'Medicine Ball',
      'Pull-Up Bar',
      'Treadmill',
      'Yoga Mat',
      'Bicycle',
    ],
    default: [],
  },
  targetMuscles: {
    type: [String],
    enum: [
      'Chest',
      'Back',
      'Shoulders',
      'Biceps',
      'Triceps',
      'Abdominals',
      'Quadriceps',
      'Hamstrings',
      'Glutes',
      'Calves',
    ],
    default: [],
  },
  caloriesBurned: {
    type: Number,
    default: null,
    validate: {
      validator: (value) => value === null || value > 0,
      message: 'Calories burned must be a positive number.',
    },
  },
}, { timestamps: true });

const Fitness = mongoose.model('Fitness', fitnessSchema);
export default Fitness;
