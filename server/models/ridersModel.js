import mongoose from 'mongoose';

const bikeRideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value >= new Date(),
      message: 'Date must be today or a future date.'
    }
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
      message: 'Start time must be in HH:MM format.'
    }
  },
  startPoint: {
    type: String,
    required: true,
    trim: true
  },
  endPoint: {
    type: String,
    required: true,
    trim: true
  },
  distance: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value > 0,
      message: 'Distance must be a positive number.'
    }
  },
  duration: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value > 0,
      message: 'Duration must be a positive number.'
    }
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Moderate', 'Hard']
  },
  cost: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value >= 0,
      message: 'Cost must be a non-negative number.'
    }
  },
  maxParticipants: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value > 0,
      message: 'Max participants must be a positive number.'
    }
  },
  registeredParticipants: {
    type: [
      {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        registrationDate: { type: Date, default: Date.now }
      }
    ],
    validate: {
      validator: function (value) {
        return value.length <= this.maxParticipants;
      },
      message: 'Number of registered participants cannot exceed the maximum allowed.'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

const BikeRide = mongoose.model('BikeRide', bikeRideSchema);
export default BikeRide;
