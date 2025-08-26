import Dish from '../models/Dish.js';

// Get all dishes randomly
const getAllDishesRandomly = async (req, res) => {
  try {
    const dishes = await Dish.aggregate([{ $sample: { size: 100 } }]); // Get up to 100 random dishes
    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAllDishesRandomly };