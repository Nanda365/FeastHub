import asyncHandler from '../middleware/asyncHandler.js';
import Donation from '../models/Donation.js';

// @desc    Create new donation
// @route   POST /api/donations
// @access  Public
const createDonation = asyncHandler(async (req, res) => {
  const { foodItem, quantity, expirationDate, pickupLocation, contactName, contactEmail, contactPhone } = req.body;

  // Basic validation
  if (!foodItem || !quantity || !pickupLocation || !contactName || !contactEmail) {
    res.status(400);
    throw new Error('Please enter all required fields: Food Item, Quantity, Pickup Location, Contact Name, Contact Email');
  }

  const donation = await Donation.create({
    foodItem,
    quantity,
    expirationDate,
    pickupLocation,
    contactName,
    contactEmail,
    contactPhone,
  });

  if (donation) {
    res.status(201).json({
      message: 'Donation created successfully',
      donation: {
        _id: donation._id,
        foodItem: donation.foodItem,
        quantity: donation.quantity,
        expirationDate: donation.expirationDate,
        pickupLocation: donation.pickupLocation,
        contactName: donation.contactName,
        contactEmail: donation.contactEmail,
        contactPhone: donation.contactPhone,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid donation data');
  }
});

// @desc    Get all donations
// @route   GET /api/donations
// @access  Public (or Private, depending on requirements - for now, assuming public for delivery dashboard)
const getAllDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({}).sort({ createdAt: -1 }).populate('deliveryPartner', 'name');
  res.status(200).json({ donations });
});

const acceptDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (donation) {
    if (donation.status === 'pending') {
      donation.deliveryPartner = req.user._id;
      donation.status = 'accepted';
      const updatedDonation = await donation.save();
      res.json(updatedDonation);
    } else {
      res.status(400);
      throw new Error('Donation already accepted');
    }
  } else {
    res.status(404);
    throw new Error('Donation not found');
  }
});

export {
  createDonation,
  getAllDonations,
  acceptDonation,
};
