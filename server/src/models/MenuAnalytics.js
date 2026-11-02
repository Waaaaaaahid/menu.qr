import mongoose from 'mongoose';

const menuAnalyticsSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['view', 'dish_view', 'order'],
      default: 'view',
      index: true,
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      default: null,
    },
    tableNumber: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

menuAnalyticsSchema.index({ restaurant: 1, timestamp: -1 });

const MenuAnalytics = mongoose.model('MenuAnalytics', menuAnalyticsSchema);
export default MenuAnalytics;
