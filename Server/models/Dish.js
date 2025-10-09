import mongoose from 'mongoose';

const dishSchema = mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    nutrition: {
      calories: { type: Number, required: false },
      protein: { type: Number, required: false },
      carbs: { type: Number, required: false },
      fat: { type: Number, required: false },
    },
    dietTypes: {
      type: [String],
      required: false,
    },
    healthGoals: {
      type: [String],
      required: false,
    },
    rating: {
      type: Number,
      required: false,
      default: 0,
    },
    prepTime: {
      type: Number,
      required: false,
    },
    numReviews: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Dish = mongoose.model('Dish', dishSchema);

export default Dish;
