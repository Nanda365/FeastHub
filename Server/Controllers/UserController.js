import User from '../models/User.js';
import RestaurantRequest from '../models/RestaurantRequest.js';
import DeliveryRequest from '../models/DeliveryRequest.js';
import Restaurant from '../models/Restaurant.js';
import Dish from '../models/Dish.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  let { name, email, phone, password, role, agreeToTerms } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (email.toLowerCase().trim() === 'admin@feasthub.com') {
      role = 'admin';
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      agreeToTerms,
      isAdmin: role === 'admin' ? true : false,
      verificationCode,
    });

    if (user) {
      const message = `<h1>Welcome to FeastHub!</h1>
        <p>Please use the following code to verify your account:</p>
        <h2>${user.verificationCode}</h2>
        <p>This code is valid for 10 minutes.</p>`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'FeastHub Account Verification',
          message,
        });
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id),
          message: 'Verification code sent to your email.',
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        res.status(500).json({ message: 'Error sending verification email.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error clearing user cart:', error);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email }).select('+phone');

    if (user && (await user.comparePassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your account first.' });
      }
      if (user.role !== role) {
        res.status(401).json({ message: 'Invalid role selected for this user.' });
        return;
      }
      if (user.role === 'restaurant') {
        const restaurant = await Restaurant.findById(user.restaurantId);
        if (restaurant && restaurant.isBlocked) {
          res.status(401).json({ message: 'Your restaurant account has been blocked. Please contact support.' });
          return;
        }
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isAdmin: user.isAdmin,
        restaurantRequestStatus: user.restaurantRequestStatus,
        restaurantId: user.restaurantId,
        deliveryRequestStatus: user.deliveryRequestStatus,
        deliveryPartnerId: user.deliveryPartnerId,
        token: generateToken(user._id),
        cart: user.cart, // Include cart in login response
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+phone');

    if (user) {
      let restaurantName = null;
      if (user.restaurantId) {
        const restaurant = await Restaurant.findById(user.restaurantId);
        if (restaurant) {
          restaurantName = restaurant.name;
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.isAdmin,
        restaurantRequestStatus: user.restaurantRequestStatus,
        restaurantId: user.restaurantId,
        deliveryRequestStatus: user.deliveryRequestStatus,
        deliveryPartnerId: user.deliveryPartnerId,
        restaurantName: restaurantName, // Add restaurant name here
        deliveryRating: user.deliveryRating, // Include deliveryRating
        numDeliveryReviews: user.numDeliveryReviews, // Include numDeliveryReviews
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);






    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        restaurantRequestStatus: updatedUser.restaurantRequestStatus,
        restaurantId: updatedUser.restaurantId,
        deliveryRequestStatus: updatedUser.deliveryRequestStatus,
        deliveryPartnerId: updatedUser.deliveryPartnerId,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeRestaurants = await User.countDocuments({ restaurantId: { $ne: null } });
    const deliveryPartners = await User.countDocuments({ deliveryPartnerId: { $ne: null } });

    res.status(200).json({
      totalUsers,
      activeRestaurants,
      deliveryPartners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active restaurants (users with restaurantId)
// @route   GET /api/users/restaurants/active
// @access  Private/Admin
const getActiveRestaurants = async (req, res) => {
  try {
    const activeRestaurants = await User.find({ role: 'restaurant', restaurantId: { $ne: null } }).select('-password').lean();

    const restaurantsDetails = await Promise.all(
      activeRestaurants.map(async (user) => {
        const restaurant = await Restaurant.findById(user.restaurantId);
        return {
          ...user,
          restaurantName: restaurant ? restaurant.name : 'N/A',
          restaurantAddress: restaurant ? restaurant.address : 'N/A',
        };
      })
    );

    res.status(200).json(restaurantsDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all delivery partners (users with deliveryPartnerId)
// @route   GET /api/users/delivery-partners/active
// @access  Private/Admin
const getDeliveryPartners = async (req, res) => {
  try {
    const usersWithDeliveryPartnerId = await User.find({ deliveryPartnerId: { $ne: null } }).select('-password').lean(); // Use .lean() for plain JS objects

    const deliveryPartnersDetails = await Promise.all(
      usersWithDeliveryPartnerId.map(async (user) => {
        const request = await DeliveryRequest.findById(user.deliveryPartnerId);
        return {
          ...user,
          vehicleType: request ? request.vehicleType : 'N/A',
          licensePlate: request ? request.licensePlate : 'N/A',
        };
      })
    );

    res.status(200).json(deliveryPartnersDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to user's cart
// @route   POST /api/users/cart
// @access  Private
const addToCart = async (req, res) => {
  const { dishId, quantity } = req.body;

  

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const dish = await Dish.findById(dishId);
      if (!dish) {
        return res.status(404).json({ message: 'Dish not found' });
      }

      const itemIndex = user.cart.findIndex(
        (item) => item.dish.toString() === dishId
      );
















      // Ensure the user object has the 'name' field from req.user
      // This is a safeguard against potential schema caching issues where 'fullName' might still be expected
      if (user && req.user.name && !user.name) {
        user.name = req.user.name;
      }

      if (itemIndex > -1) {
        // Item exists in cart, update quantity
        user.cart[itemIndex].quantity += quantity;
      } else {
        // Item does not exist in cart, add new item
        user.cart.push({ dish: dishId, quantity });
      }

      try {
        await user.save();
        // Populate the dish field before sending the response
        await user.populate('cart.dish');
        console.log('Backend sending response:', user.cart);
    res.status(200).json(user.cart);
      } catch (saveError) {
        console.error('Error saving user cart:', saveError);
        res.status(500).json({ message: 'Error saving user cart: ' + saveError.message });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's cart
// @route   GET /api/users/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.dish');

    if (user) {
      res.status(200).json(user.cart);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity in user's cart or remove item
// @route   PUT /api/users/cart
// @access  Private
const updateCart = async (req, res) => {

    console.log('Reached updateCart controller');
    const { dishId, quantity } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const itemIndex = user.cart.findIndex(
        (item) => item.dish.toString() === dishId
      );

      if (itemIndex > -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          user.cart.splice(itemIndex, 1);
        } else {
          // Update quantity
          user.cart[itemIndex].quantity = quantity;
        }
      } else {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      await user.save();
      // Populate the dish field before sending the response
      await user.populate('cart.dish');
      res.status(200).json(user.cart);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear user's cart
// @route   DELETE /api/users/cart
// @access  Private
const clearUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.cart = []; // Clear the cart array
      await user.save();
      res.status(200).json({ message: 'Cart cleared successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify user account
// @route   POST /api/users/verify
// @access  Public
const verifyUser = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined; // Clear the verification code after successful verification
    await user.save();

    res.status(200).json({ message: 'Account verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from user's cart
// @route   DELETE /api/users/cart/:itemId
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const itemIndex = user.cart.findIndex(
        (item) => item._id.toString() === req.params.itemId
      );

      if (itemIndex > -1) {
        user.cart.splice(itemIndex, 1);
        await user.save();
        await user.populate('cart.dish');
        res.status(200).json(user.cart);
      } else {
        res.status(404).json({ message: 'Item not found in cart' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend verification code
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newVerificationCode;
    await user.save();

    const message = `<h1>Welcome to FeastHub!</h1>
      <p>Your new verification code is:</p>
      <h2>${newVerificationCode}</h2>
      <p>This code is valid for 10 minutes.</p>`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'FeastHub Account Verification (Resend)',
        message,
      });
      res.status(200).json({ message: 'New verification code sent to your email.' });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({ message: 'Error sending new verification email.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = role || user.role;
      await user.save();
      res.status(200).json({ message: 'User role updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user.deliveryAddress);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const { address, city, pincode, phone } = req.body;
      const newAddress = { address, city, pincode, phone };
      user.deliveryAddress.push(newAddress);
      await user.save();
      res.status(201).json(newAddress);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const address = user.deliveryAddress.id(req.params.id);
      if (address) {
        address.address = req.body.address || address.address;
        address.city = req.body.city || address.city;
        address.pincode = req.body.pincode || address.pincode;
        address.phone = req.body.phone || address.phone;
        await user.save();
        res.json(address);
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const address = user.deliveryAddress.id(req.params.id);
      if (address) {
        address.remove();
        await user.save();
        res.json({ message: 'Address removed' });
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


export {
  registerUser,
  loginUser,
  getUserProfile,
updateUserProfile,
  deleteUser,
  getUserStats,
  getActiveRestaurants,
  getDeliveryPartners,
  addToCart,
  getCart,
  updateCart,
  clearUserCart,
  removeCartItem,
  verifyUser,
  resendVerificationCode,
  getAllUsers,
  getUserById,
  updateUserRole,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
};