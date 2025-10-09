import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    cuisineType: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
    },
    healthyBadge: {
      type: Boolean,
      default: false,
    },
    cuisine: [
      {
        type: String,
      },
    ],
    imageUrl: {
      type: String,
    },
    // Aggregated stats (can be updated periodically or on relevant actions)
    avgRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    avgPrepTime: {
      type: Number,
      default: 0, // in minutes
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    hasRecipeBox: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;