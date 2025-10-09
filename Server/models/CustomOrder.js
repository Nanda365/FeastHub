import mongoose from 'mongoose';

const CustomOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  defaultIngredients: {
    type: [String],
    default: [],
  },
  extraIngredients: {
    type: [String],
    default: [],
  },
  specialInstructions: {
    type: String,
  },
  displayCode: {
    type: String,
    unique: true,
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed'],
    default: 'pending',
  },
  price: {
    type: Number,
    default: 0,
  },
  convertedToOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, { timestamps: true });

const CustomOrder = mongoose.model('CustomOrder', CustomOrderSchema);

export default CustomOrder;
