import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import MenuAnalytics from '../models/MenuAnalytics.js';
import { getIO } from '../socket/socketHandler.js';

// Helper to generate readable order number
const generateOrderNumber = () => {
  const chars = '0123456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `#ORD-${rand}`;
};

// @desc    Place a new table order (Customer)
// @route   POST /api/public/orders
// @access  Public
export const placeOrder = async (req, res, next) => {
  try {
    const {
      restaurantSlug,
      tableNumber,
      customerName,
      customerPhone,
      items,
      specialNotes,
      paymentMethod,
    } = req.body;

    if (!restaurantSlug || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order request. Restaurant and items are required.',
      });
    }

    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    if (!restaurant.tableOrderingEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Online table ordering is currently disabled for this restaurant.',
      });
    }

    // Lookup Table if tableNumber provided
    let tableDoc = null;
    if (tableNumber) {
      tableDoc = await Table.findOne({
        restaurant: restaurant._id,
        tableNumber: tableNumber.trim(),
      });
    }

    // Fetch and verify all items server-side to guarantee accurate pricing
    let subtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const dbItem = await MenuItem.findOne({
        _id: item.menuItemId || item._id,
        restaurant: restaurant._id,
      });

      if (!dbItem) {
        return res.status(400).json({
          success: false,
          message: `Item not found or unavailable in restaurant: ${item.name || item.menuItemId}`,
        });
      }

      if (!dbItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Dish "${dbItem.name}" is currently sold out. Please adjust your cart.`,
        });
      }

      const quantity = Math.max(1, Number(item.quantity) || 1);
      const itemTotal = dbItem.price * quantity;
      subtotal += itemTotal;

      verifiedOrderItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity,
        specialInstructions: item.specialInstructions || '',
        isVeg: dbItem.isVeg,
      });
    }

    // Calculate tax & service charge based on restaurant configuration
    const tax = Number(((subtotal * (restaurant.taxPercentage || 0)) / 100).toFixed(2));
    const serviceCharge = Number(
      ((subtotal * (restaurant.serviceChargePercentage || 0)) / 100).toFixed(2)
    );
    const totalAmount = Number((subtotal + tax + serviceCharge).toFixed(2));

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      restaurant: restaurant._id,
      orderNumber,
      table: {
        id: tableDoc ? tableDoc._id : null,
        tableNumber: tableNumber ? tableNumber.trim() : 'Takeaway / Counter',
      },
      customer: {
        name: customerName ? customerName.trim() : 'Guest',
        phone: customerPhone ? customerPhone.trim() : '',
      },
      items: verifiedOrderItems,
      subtotal,
      tax,
      serviceCharge,
      totalAmount,
      status: 'pending',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'unpaid',
      specialNotes: specialNotes || '',
    });

    // Update table status if table exists
    if (tableDoc) {
      tableDoc.status = 'occupied';
      tableDoc.activeOrder = order._id;
      await tableDoc.save();
    }

    // Log analytics event
    await MenuAnalytics.create({
      restaurant: restaurant._id,
      type: 'order',
      tableNumber: tableNumber || '',
    });

    // Broadcast real-time event to restaurant owner room via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.to(`restaurant_${restaurant._id}`).emit('new_order', order);
      }
    } catch (socketErr) {
      console.warn('Socket notification error (non-fatal):', socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! The kitchen has received your order.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for restaurant owner dashboard
// @route   GET /api/orders
// @access  Private (Owner)
export const getOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, date } = req.query;

    const query = { restaurant: req.restaurant._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startOfDay };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Owner)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;

    // If completed or cancelled, mark paid or release table
    if (status === 'completed') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    // Release table if completed or cancelled
    if (order.table?.id && (status === 'completed' || status === 'cancelled')) {
      await Table.findByIdAndUpdate(order.table.id, {
        status: 'available',
        activeOrder: null,
      });
    }

    // Broadcast real-time update
    try {
      const io = getIO();
      if (io) {
        // Emit to restaurant dashboard
        io.to(`restaurant_${req.restaurant._id}`).emit('order_status_updated', order);
        // Emit to diner tracking
        io.to(`order_${order._id}`).emit('customer_order_status', order);
      }
    } catch (socketErr) {
      console.warn('Socket notification error:', socketErr.message);
    }

    res.status(200).json({
      success: true,
      order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID (for live customer order tracking)
// @route   GET /api/public/orders/:id
// @access  Public
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const restaurant = await Restaurant.findById(order.restaurant).select(
      'name slug logo currency phone'
    );

    res.status(200).json({
      success: true,
      order,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};
