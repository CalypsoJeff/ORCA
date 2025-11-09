import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Invalid email format.',
    },
  },

  password: {
    type: String,
    minlength: 8,
    select: false,
    required: function () {
      // password required only if not Google login
      return !this.provider || this.provider !== 'google';
    },
  },

  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        // only validate if phone is provided
        return !value || /^[0-9]{10}$/.test(value);
      },
      message: 'Phone number must be a 10-digit number.',
    },
    required: function () {
      // phone required only if not Google login
      return !this.provider || this.provider !== 'google';
    },
  },

  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  avatar: {
    type: String,
  },

  registeredCompetitions: [
    {
      competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
      },
      registrationDate: { type: Date, default: Date.now },
    },
  ],

  registeredTrekkingEvents: [
    {
      trekkingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trekking',
      },
      registrationDate: { type: Date, default: Date.now },
    },
  ],

  registeredBikeRides: [
    {
      rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BikeRide',
      },
      registrationDate: { type: Date, default: Date.now },
    },
  ],

  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Banned'],
    default: 'Active',
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
