import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        imageUrl: { type: String, required: false }, // Assuming image might be optional
        price: { type: Number, required: true },
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Dish',
        },
        rating: {
          type: Number,
        },
      },
    ],
    deliveryRating: {
      type: Number,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'preparing', 'ready', 'on-the-way', 'delivered', 'cancelled'],
    },
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    basicItems: [
      {
        dish: { type: String, required: true }, // Using String for basic item ID like 'extra_sauce'
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    deliveryAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    estimatedTime: {
      type: Number,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: { // Add this field
      type: String,
      required: true,
      default: 'Pending',
      enum: ['Paid', 'COD', 'Pending'],
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomOrder',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
