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

// @desc    Get mood-based dish recommendations
// @route   GET /api/dishes/mood-recommendations
// @access  Public
const getMoodRecommendations = async (req, res) => {
  const { mood } = req.query;
  let dishes = [];
  let title = "";
  let description = "";

  try {
    switch (mood) {
      case 'happy':
        title = "Happy & Energetic Meals!";
        description = "Fuel your good vibes with these vibrant and energizing dishes.";
        dishes = await Dish.aggregate([{ $sample: { size: 3 } }]);
        break;
      case 'tired':
        title = "Comforting & Rejuvenating Bites.";
        description = "Nourish your body and soul with these comforting and easy-to-digest options.";
        dishes = await Dish.aggregate([{ $sample: { size: 3 } }]);
        break;
      case 'stressed':
        title = "Soothing & Relaxing Flavors.";
        description = "Unwind with these calming and delicious dishes designed to ease your mind.";
        dishes = await Dish.aggregate([{ $sample: { size: 3 } }]);
        break;
      default:
        title = "Delicious Recommendations!";
        description = "Explore a variety of dishes tailored to delight your taste buds.";
        dishes = await Dish.aggregate([{ $sample: { size: 3 } }]);
        break;
    }

    res.status(200).json({ title, description, dishes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a dish
// @route   DELETE /api/dishes/:id
// @access  Private/Admin
const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (dish) {
      await dish.deleteOne();
      res.json({ message: 'Dish removed' });
    } else {
      res.status(404).json({ message: 'Dish not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all dishes
// @route   GET /api/dishes
// @access  Private/Admin
const getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({}).populate('restaurant', 'name');
    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAllDishes, getAllDishesRandomly, getMoodRecommendations, deleteDish };