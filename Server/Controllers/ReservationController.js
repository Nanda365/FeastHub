import asyncHandler from '../middleware/asyncHandler.js';
import Reservation from '../models/Reservation.js';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';

// @desc    Create a new reservation (by user or restaurant owner)
// @route   POST /api/reservations
// @access  Private
export const createReservation = asyncHandler(async (req, res) => {
  const { restaurantId, tableId, numberOfGuests, reservationTime, specialRequests, customerName, customerEmail, customerPhone } = req.body;

  let reservationData = {
    restaurant: restaurantId,
    numberOfGuests,
    reservationTime,
    specialRequests,
  };

  // If authenticated user is a customer, link the reservation to them
  if (req.user && req.user.role === 'customer') {
    reservationData.user = req.user._id;
    reservationData.customerName = customerName;
    reservationData.customerEmail = customerEmail;
    reservationData.customerPhone = customerPhone;
  } else if (req.user && req.user.role === 'restaurant') {
    // Restaurant owner creating a reservation on behalf of a customer
    // Ensure the restaurantId matches the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || restaurant._id.toString() !== restaurantId) {
      res.status(401);
      throw new Error('Not authorized to create reservation for this restaurant');
    }
    reservationData.customerName = customerName;
    reservationData.customerEmail = customerEmail;
    reservationData.customerPhone = customerPhone;
  } else {
    res.status(401);
    throw new Error('Not authorized to create reservation');
  }

  // If a tableId is provided, check if it belongs to the restaurant
  if (tableId) {
    const table = await Table.findById(tableId);
    if (!table || table.restaurant.toString() !== restaurantId) {
      res.status(400);
      throw new Error('Invalid table ID for this restaurant');
    }
    reservationData.table = tableId;
  }

  const reservation = new Reservation(reservationData);

  const createdReservation = await reservation.save();
  res.status(201).json(createdReservation);
});

// @desc    Get all reservations (for restaurant owner or user)
// @route   GET /api/reservations
// @access  Private
export const getReservations = asyncHandler(async (req, res) => {
  if (req.user.role === 'restaurant') {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found for this user');
    }
    const reservations = await Reservation.find({ restaurant: restaurant._id })
      .populate('user', 'name email')
      .populate('table', 'tableNumber seatingCapacity');
    res.json(reservations);
  } else if (req.user.role === 'customer') {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('restaurant', 'name imageUrl')
      .populate('table', 'tableNumber seatingCapacity');
    res.json(reservations);
  } else {
    res.status(401);
    throw new Error('Not authorized to view reservations');
  }
});

// @desc    Get a single reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
export const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('user', 'name email')
    .populate('restaurant', 'name imageUrl')
    .populate('table', 'tableNumber seatingCapacity');

  if (reservation) {
    // Check authorization
    if (req.user.role === 'customer' && reservation.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this reservation');
    }
    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant || reservation.restaurant.toString() !== restaurant._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to view this reservation');
      }
    }
    res.json(reservation);
  } else {
    res.status(404);
    throw new Error('Reservation not found');
  }
});

// @desc    Update a reservation
// @route   PUT /api/reservations/:id
// @access  Private/Restaurant
export const updateReservation = asyncHandler(async (req, res) => {
  const { tableId, numberOfGuests, reservationTime, status, specialRequests, customerName, customerEmail, customerPhone } = req.body;

  const reservation = await Reservation.findById(req.params.id);

  if (reservation) {
    // Allow customer to cancel their own reservation
    if (req.user.role === 'customer') {
      if (reservation.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this reservation');
      }
      if (status && status !== 'cancelled') {
        res.status(400);
        throw new Error('Customers can only cancel their reservations.');
      }
      if (status === 'cancelled') {
        reservation.status = status;
        reservation.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
      }
    } else if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant || reservation.restaurant.toString() !== restaurant._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this reservation');
      }

      // Update fields for restaurant owner
      reservation.numberOfGuests = numberOfGuests || reservation.numberOfGuests;
      reservation.reservationTime = reservationTime || reservation.reservationTime;
      reservation.status = status || reservation.status;
      reservation.specialRequests = specialRequests || reservation.specialRequests;
      reservation.customerName = customerName || reservation.customerName;
      reservation.customerEmail = customerEmail || reservation.customerEmail;
      reservation.customerPhone = customerPhone || reservation.customerPhone;

      if (tableId) {
        const table = await Table.findById(tableId);
        if (!table || table.restaurant.toString() !== reservation.restaurant.toString()) {
          res.status(400);
          throw new Error('Invalid table ID for this restaurant');
        }
        reservation.table = tableId;
      } else if (tableId === null) { // Allow unassigning table
        reservation.table = null;
      }
    } else {
      res.status(401);
      throw new Error('Not authorized to update reservations');
    }
    const updatedReservation = await reservation.save();

    // If status is confirmed or occupied, update table availability
    if (updatedReservation.status === 'confirmed' || updatedReservation.status === 'occupied') {
      if (updatedReservation.table) {
        await Table.findByIdAndUpdate(updatedReservation.table, { isAvailable: false, status: updatedReservation.status });
      }
    } else if (updatedReservation.status === 'cancelled' || updatedReservation.status === 'completed') {
      if (updatedReservation.table) {
        await Table.findByIdAndUpdate(updatedReservation.table, { isAvailable: true, status: 'available' });
      }
    }

    // Populate fields before sending the response
    const populatedReservation = await Reservation.findById(updatedReservation._id)
      .populate('restaurant', 'name imageUrl')
      .populate('table', 'tableNumber seatingCapacity');

    res.json(populatedReservation);
  } else {
    res.status(404);
    throw new Error('Reservation not found');
  }
});

// @desc    Delete a reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Restaurant
export const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (reservation) {
    // Only restaurant owners can delete reservations
    if (req.user.role !== 'restaurant') {
      res.status(401);
      throw new Error('Not authorized to delete reservations');
    }

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || reservation.restaurant.toString() !== restaurant._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this reservation');
    }

    // If reservation was confirmed or occupied, make table available again
    if ((reservation.status === 'confirmed' || reservation.status === 'occupied') && reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { isAvailable: true, status: 'available' });
    }

    await Reservation.deleteOne({ _id: reservation._id });
    res.json({ message: 'Reservation removed' });
  } else {
    res.status(404);
    throw new Error('Reservation not found');
  }
});


