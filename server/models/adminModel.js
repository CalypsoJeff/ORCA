import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
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
      lowercase: true,
      validate: {
        validator: function (value) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: true,
    },
    isMainAdmin: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

  },
  { timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
