import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Invalid email format.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => /^[0-9]{10}$/.test(value),
      message: 'Phone number must be a 10-digit number.'
    }
  },
  addresses: [
    {
      street: { type: String, trim: true, required: true },
      city: { type: String, trim: true, required: true },
      state: { type: String, trim: true, required: true },
      country: { type: String, trim: true, required: true },
      postalCode: {
        type: String,
        trim: true,
        validate: {
          validator: (value) => /^[0-9]{5,6}$/.test(value),
          message: 'Postal code must be 5-6 digits.'
        }
      },
      isDefault: { type: Boolean, default: false }
    }
  ],
  registeredCompetitions: [
    {
      competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition'
      },
      registrationDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  registeredTrekkingEvents: [
    {
      trekkingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trekking'
      },
      registrationDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  registeredBikeRides: [
    {
      rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BikeRide'
      },
      registrationDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Banned'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
