import DeliveryRequest from '../models/DeliveryRequest.js';
import User from '../models/User.js';

// @desc    Create a new delivery request
// @route   POST /api/delivery-requests
// @access  Private (Delivery user)
const createDeliveryRequest = async (req, res) => {
  const { vehicleType, licensePlate } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a request already exists for this user
    const existingRequest = await DeliveryRequest.findOne({ userId });
    if (existingRequest) {
      return res.status(400).json({ message: 'A delivery request already exists for this user.' });
    }

    const deliveryRequest = await DeliveryRequest.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      vehicleType,
      licensePlate,
    });

    // Update user's deliveryRequestStatus to 'pending'
    user.deliveryRequestStatus = 'pending';
    await user.save();

    res.status(201).json(deliveryRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all delivery requests
// @route   GET /api/delivery-requests
// @access  Private (Admin only)
const getDeliveryRequests = async (req, res) => {
  try {
    const requests = await DeliveryRequest.find({}).populate('userId', 'name email');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery request status (approve/reject)
// @route   PUT /api/delivery-requests/:id/status
// @access  Private (Admin only)
const updateDeliveryRequestStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  const { id } = req.params;

  try {
    const request = await DeliveryRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Delivery request not found' });
    }

    request.status = status;
    request.adminNotes = adminNotes || '';
    await request.save();

    // Update user's deliveryRequestStatus and deliveryPartnerId if approved
    const user = await User.findById(request.userId);
    if (user) {
      user.deliveryRequestStatus = status;
      if (status === 'approved') {
        // For now, just use the request ID as deliveryPartnerId.
        user.deliveryPartnerId = request._id.toString(); 
      } else if (status === 'rejected') {
        user.deliveryPartnerId = null; // Clear deliveryPartnerId if rejected
      }
      await user.save();
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveDeliveryRequest = async (req, res) => {
  req.body.status = 'approved';
  await updateDeliveryRequestStatus(req, res);
};

const rejectDeliveryRequest = async (req, res) => {
  req.body.status = 'rejected';
  await updateDeliveryRequestStatus(req, res);
};

export {
  createDeliveryRequest,
  getDeliveryRequests,
  updateDeliveryRequestStatus,
  approveDeliveryRequest,
  rejectDeliveryRequest,
};