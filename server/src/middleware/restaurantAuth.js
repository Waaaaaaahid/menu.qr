import Restaurant from '../models/Restaurant.js';

export const requireRestaurant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Find the restaurant owned by this user
    let restaurant = null;
    if (req.user.restaurant) {
      restaurant = await Restaurant.findOne({
        _id: req.user.restaurant,
        owner: req.user._id,
      });
    }

    // Fallback search by owner in case user.restaurant reference was not updated
    if (!restaurant) {
      restaurant = await Restaurant.findOne({ owner: req.user._id });
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        needsSetup: true,
        message: 'No restaurant found for this account. Please set up your restaurant first.',
      });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Restaurant ownership verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify restaurant ownership',
    });
  }
};
