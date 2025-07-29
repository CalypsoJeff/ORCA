import mongoose from 'mongoose';

const fitnessCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
}, { timestamps: true });

const FitnessCategory = mongoose.model('FitnessCategory', fitnessCategorySchema);
export default FitnessCategory;
