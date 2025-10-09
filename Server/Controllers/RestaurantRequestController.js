import RestaurantRequest from '../models/RestaurantRequest.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';

// @desc    Create a new restaurant request
// @route   POST /api/restaurant-requests
// @access  Private (Restaurant user)
const createRestaurantRequest = async (req, res) => {
  const { restaurantName, restaurantAddress } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a request already exists for this user
    const existingRequest = await RestaurantRequest.findOne({ userId });
    if (existingRequest) {
      // If a request exists, check its status
      if (existingRequest.status === 'rejected') {
        // If the request was rejected, allow the user to submit a new one
        // by first deleting the old one.
        await RestaurantRequest.findByIdAndDelete(existingRequest._id);
      } else {
        // If the request is pending or approved, prevent a new one
        return res.status(400).json({
          message: `You already have a ${existingRequest.status} restaurant request.`,
        });
      }
    }

    const restaurantRequest = await RestaurantRequest.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      restaurantName,
      restaurantAddress,
    });

    // Update user's restaurantRequestStatus to 'pending'
    user.restaurantRequestStatus = 'pending';
    await user.save();

    res.status(201).json(restaurantRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all restaurant requests
// @route   GET /api/restaurant-requests
// @access  Private (Admin only)
const getRestaurantRequests = async (req, res) => {
  try {
    const requests = await RestaurantRequest.find({}).populate('userId', 'name email');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update restaurant request status (approve/reject)
// @route   PUT /api/restaurant-requests/:id/status
// @access  Private (Admin only)
const updateRestaurantRequestStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  const { id } = req.params;

  try {
    const request = await RestaurantRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Restaurant request not found' });
    }

    request.status = status;
    request.adminNotes = adminNotes || '';
    await request.save();

    // Update user's restaurantRequestStatus and restaurantId if approved
    const user = await User.findById(request.userId);
    if (user) {
      user.restaurantRequestStatus = status;
      if (status === 'approved') {
        // Create a new Restaurant document
        const newRestaurant = await Restaurant.create({
          owner: user._id,
          name: request.restaurantName,
          address: request.restaurantAddress,
          // You might want to add default description, cuisine, imageUrl here
        });
        user.restaurantId = newRestaurant._id; // Set user.restaurantId to the new Restaurant's _id
        user.role = 'restaurant'; // Change user role to restaurant
      } else if (status === 'rejected') {
        user.restaurantId = null; // Clear restaurantId if rejected
      }
      await user.save();
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveRestaurantRequest = async (req, res) => {
  req.body.status = 'approved';
  await updateRestaurantRequestStatus(req, res);
};

const rejectRestaurantRequest = async (req, res) => {
  req.body.status = 'rejected';
  await updateRestaurantRequestStatus(req, res);
};

export {
  createRestaurantRequest,
  getRestaurantRequests,
  updateRestaurantRequestStatus,
  approveRestaurantRequest,
  rejectRestaurantRequest,
};