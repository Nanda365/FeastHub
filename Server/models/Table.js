import mongoose from 'mongoose';

const tableSchema = mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },

    tableNumber: {
      type: String,
      required: true,
    },
    seatingCapacity: {
      type: Number,
      required: true,
      default: 2,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    status: {
      type: String,
      required: true,
      default: 'available',
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure tableNumber is unique per restaurant
tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);

export default Table;
