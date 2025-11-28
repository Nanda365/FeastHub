import mongoose from 'mongoose';

const parentOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order',
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveryAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      default: 'Pending',
      enum: ['Paid', 'COD', 'Pending'],
    },
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const ParentOrder = mongoose.model('ParentOrder', parentOrderSchema);

export default ParentOrder;
