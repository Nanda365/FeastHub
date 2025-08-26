import mongoose from 'mongoose';

const donationSchema = mongoose.Schema(
  {
    foodItem: {
      type: String,
      required: [true, 'Please add a food item'],
    },
    quantity: {
      type: String,
      required: [true, 'Please add a quantity'],
    },
    expirationDate: {
      type: Date,
      required: false, // Optional
    },
    pickupLocation: {
      type: String,
      required: [true, 'Please add a pickup location'],
    },
    contactName: {
      type: String,
      required: [true, 'Please add a contact name'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Please add a contact email'],
    },
    contactPhone: {
      type: String,
      required: false, // Optional
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'delivered'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Donation', donationSchema);
