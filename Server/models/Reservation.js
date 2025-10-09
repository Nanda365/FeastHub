import mongoose from 'mongoose';

const reservationSchema = mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null, // Table can be assigned later by the restaurant owner
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Not required if booking is made on behalf of a customer by the restaurant owner
    },
    customerName: {
      type: String,
      required: function() { return !this.user; }, // Required if no user is linked
    },
    customerEmail: {
      type: String,
      required: function() { return !this.user; }, // Required if no user is linked
    },
    customerPhone: {
      type: String,
      required: function() { return !this.user; }, // Required if no user is linked
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    reservationTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'confirmed', 'occupied', 'cancelled', 'completed'],
    },
    specialRequests: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
