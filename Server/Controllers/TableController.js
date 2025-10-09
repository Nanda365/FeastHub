import asyncHandler from '../middleware/asyncHandler.js';
import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import Reservation from '../models/Reservation.js';

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Restaurant
export const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, seatingCapacity, status, amount } = req.body;

  // Check if restaurant exists and is owned by the authenticated user
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found for this user');
  }

  const table = new Table({
    restaurant: restaurant._id,    tableNumber,

    seatingCapacity,
    status: status || 'available',
    amount,
  });

  const createdTable = await table.save();
  res.status(201).json(createdTable);
});

// @desc    Get all tables for a restaurant
// @route   GET /api/tables
// @access  Private/Restaurant
export const getTables = asyncHandler(async (req, res) => {
  const { numberOfGuests, reservationTime, restaurantId } = req.query;

  let restaurant;

  // If restaurantId is provided, find by ID. Otherwise, find by owner.
  if (restaurantId) {
    restaurant = await Restaurant.findById(restaurantId);
  } else if (req.user) {
    restaurant = await Restaurant.findOne({ owner: req.user._id });
  }

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  let query = { restaurant: restaurant._id };

  if (numberOfGuests) {
    query.seatingCapacity = { $gte: Number(numberOfGuests) };
  }

  let tables = await Table.find(query);

  // If reservationTime is provided, filter out tables that are already reserved
  if (reservationTime) {
    const time = new Date(reservationTime);
    const oneHourBefore = new Date(time.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(time.getTime() + 60 * 60 * 1000);

    const reservedTables = await Reservation.find({
      restaurant: restaurant._id,
      reservationTime: {
        $gte: oneHourBefore,
        $lte: oneHourAfter,
      },
      status: { $in: ['pending', 'confirmed', 'occupied'] },
    }).select('table');

    const reservedTableIds = reservedTables.map(res => res.table?.toString());

    tables = tables.filter(table => !reservedTableIds.includes(table._id.toString()));
  }

  res.json(tables);
});

// @desc    Get a single table by ID
// @route   GET /api/tables/:id
// @access  Private/Restaurant
export const getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    // Check if the table belongs to the authenticated restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (restaurant && table.restaurant.toString() === restaurant._id.toString()) {
      res.json(table);
    } else {
      res.status(401);
      throw new Error('Not authorized to view this table');
    }
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private/Restaurant
export const updateTable = asyncHandler(async (req, res) => {
  const { tableNumber, seatingCapacity, isAvailable, status, amount } = req.body;

  const table = await Table.findById(req.params.id);

  if (table) {
    // Check if the table belongs to the authenticated restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (restaurant && table.restaurant.toString() === restaurant._id.toString()) {
      table.tableNumber = tableNumber || table.tableNumber;
      table.seatingCapacity = seatingCapacity !== undefined ? seatingCapacity : table.seatingCapacity;
      table.isAvailable = isAvailable !== undefined ? isAvailable : table.isAvailable;
      table.status = status || table.status;
      table.amount = amount !== undefined ? amount : table.amount;

      const updatedTable = await table.save();
      res.json(updatedTable);
    } else {
      res.status(401);
      throw new Error('Not authorized to update this table');
    }
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Restaurant
export const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    // Check if the table belongs to the authenticated restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (restaurant && table.restaurant.toString() === restaurant._id.toString()) {
      await Table.deleteOne({ _id: table._id });
      res.json({ message: 'Table removed' });
    } else {
      res.status(401);
      throw new Error('Not authorized to delete this table');
    }
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});


