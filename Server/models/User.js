import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      minlength: [2, "Name must be at least 2 characters long"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"]
    },
    role: {
      type: String,
      enum: ["customer", "restaurant", "delivery", "admin"],
      default: "customer"
    },
    agreeToTerms: {
      type: Boolean,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    restaurantRequestStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
    deliveryRequestStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    deliveryPartnerId: {
      type: String,
      default: null,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    cart: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Dish',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    favorites: [ // New favorites field
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
      },
    ],
    deliveryAddress: [
      {
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],
    deliveryRating: {
      type: Number,
      default: 0
    },
    numDeliveryReviews: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);

import bcrypt from "bcrypt";

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
