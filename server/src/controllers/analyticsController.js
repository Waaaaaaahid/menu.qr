import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import MenuAnalytics from '../models/MenuAnalytics.js';
import Category from '../models/Category.js';

// @desc    Record a menu view (Public)
// @route   POST /api/public/analytics/view
// @access  Public
export const recordMenuView = async (req, res, next) => {
  try {
    const { restaurantId, tableNumber } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID required' });
    }

    await MenuAnalytics.create({
      restaurant: restaurantId,
      type: 'view',
      tableNumber: tableNumber || '',
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({ success: true });
  } catch (error) {
    // Analytics failure should never break customer experience
    console.warn('Record menu view error:', error.message);
    res.status(200).json({ success: false });
  }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/analytics/dashboard
// @access  Private (Owner)
export const getDashboardStats = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant._id;

    // 1. Total Menu Views
    const totalViews = await MenuAnalytics.countDocuments({
      restaurant: restaurantId,
      type: 'view',
    });

    // 2. Active Menu Items count
    const activeItemsCount = await MenuItem.countDocuments({
      restaurant: restaurantId,
      isAvailable: true,
    });

    // 3. Orders & Revenue Aggregations
    const allOrders = await Order.find({ restaurant: restaurantId });
    const totalOrdersCount = allOrders.length;

    const completedOrders = allOrders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Today's Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders
      .filter((o) => o.status === 'completed')
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // 4. Past 7 Days Trend (Daily Revenue & Orders)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = allOrders.filter(
        (o) => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd
      );
      const dayRev = dayOrders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        day: dayName,
        orders: dayOrders.length,
        revenue: Number(dayRev.toFixed(2)),
      });
    }

    // 5. Popular Dishes Aggregation
    const dishSalesMap = {};
    for (const order of allOrders) {
      if (order.status !== 'cancelled') {
        for (const item of order.items) {
          const itemId = item.menuItem ? item.menuItem.toString() : item.name;
          if (!dishSalesMap[itemId]) {
            dishSalesMap[itemId] = {
              name: item.name,
              isVeg: item.isVeg,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          dishSalesMap[itemId].totalQuantity += item.quantity || 1;
          dishSalesMap[itemId].totalRevenue += (item.price || 0) * (item.quantity || 1);
        }
      }
    }

    const popularDishes = Object.values(dishSalesMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)
      .map((d) => ({
        ...d,
        totalRevenue: Number(d.totalRevenue.toFixed(2)),
      }));

    // 6. Recent Orders (5 latest)
    const recentOrders = await Order.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalViews,
        totalOrders: totalOrdersCount,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        activeItems: activeItemsCount,
        todayOrders: todayOrders.length,
        todayRevenue: Number(todayRevenue.toFixed(2)),
      },
      chartData: last7Days,
      popularDishes,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics for analytics page
// @route   GET /api/analytics/detailed
// @access  Private (Owner)
export const getDetailedAnalytics = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    // Fetch visits in range
    const views = await MenuAnalytics.find({
      restaurant: restaurantId,
      type: 'view',
      timestamp: { $gte: startDate },
    });

    // Fetch orders in range
    const orders = await Order.find({
      restaurant: restaurantId,
      createdAt: { $gte: startDate },
    });

    // Group views & orders by date
    const dailyMap = {};
    for (let i = Number(days) - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = {
        date: key,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: 0,
        orders: 0,
        revenue: 0,
      };
    }

    views.forEach((v) => {
      const key = new Date(v.timestamp).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].views++;
      }
    });

    orders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].orders++;
        if (o.status === 'completed') {
          dailyMap[key].revenue += o.totalAmount || 0;
        }
      }
    });

    const timeSeries = Object.values(dailyMap).map((d) => ({
      ...d,
      revenue: Number(d.revenue.toFixed(2)),
    }));

    // Status breakdown
    const statusCounts = {
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    res.status(200).json({
      success: true,
      timeSeries,
      statusBreakdown: Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })),
      totalVisits: views.length,
      totalOrdersInRange: orders.length,
    });
  } catch (error) {
    next(error);
  }
};
