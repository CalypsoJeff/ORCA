import mongoose from 'mongoose';

const competitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: [String],
    required: true,
    trim: true,
    enum: ['Sports', 'Technology', 'Cultural', 'Art', 'Music', 'Dance', 'Fitness', 'Education'],
  },
  image: {
    type: [String],
    trim: true
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value >= new Date(),
      message: 'Date must be today or a future date.'
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
  town: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value > 0,
      message: 'Duration must be a positive number.'
    }
  },
  type: {
    type: [String],
    required: true,
    enum: ['Inter Corporates', 'Inter College', 'Intra College', 'State Level', 'National Level', 'others'],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one type must be selected.'
    }
  },
  cost: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value >= 0,
      message: 'Cost must be a non-negative number.'
    }
  },
  maxRegistrations: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value > 0,
      message: 'Max registrations must be a positive number.'
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
        return value.length <= this.maxRegistrations;
      },
      message: 'Number of registered participants cannot exceed the maximum allowed.'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
}, { timestamps: true });

const Competition = mongoose.model('Competition', competitionSchema);
export default Competition;
