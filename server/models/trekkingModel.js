import mongoose from 'mongoose';

const trekkingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: [String],
    required: true,
    trim: true,
    enum: ['Adventure', 'Nature', 'Fitness', 'Exploration', 'others']
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  trekDistance: {
    type: Number,
    required: true,
    min: 1
  },
  trekDuration: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => /^[0-9]+ (hour|hours|day|days)$/.test(value),
      message: 'Duration must be in a valid format like "3 hours" or "1 day".'
    }
  },
  costPerPerson: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value >= new Date(),
      message: 'Start date must be a future date.'
    }
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Moderate', 'Difficult', 'Expert']
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1
  },
  registeredParticipants: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function (value) {
        return value <= this.maxParticipants;
      },
      message: 'Registered participants cannot exceed the maximum allowed participants.'
    }
  },
  place: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one state must be selected.'
    }
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

const Trekking = mongoose.model('Trekking', trekkingSchema);
export default Trekking;
