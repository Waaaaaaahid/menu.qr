import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ShoppingBag,
  DollarSign,
  Utensils,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatRelativeTime, getOrderStatusInfo } from '../../utils/formatters';
import { StatsSkeleton } from '../../components/common/LoadingSkeleton';
import { DietaryBadge } from '../../components/common/Badge';

export default function OverviewPage() {
  const { restaurant } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setChartData(res.data.chartData);
          setPopularDishes(res.data.popularDishes);
          setRecentOrders(res.data.recentOrders);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <div className="h-80 bg-white rounded-2xl border border-slate-200/80 animate-pulse"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Menu Visits',
      value: stats?.totalViews?.toLocaleString() || '0',
      subtitle: 'Contactless QR scans',
      icon: Eye,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toLocaleString() || '0',
      subtitle: `${stats?.todayOrders || 0} placed today`,
      icon: ShoppingBag,
      iconColor: 'text-brand-500',
      iconBg: 'bg-brand-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue, restaurant?.currency),
      subtitle: `${formatCurrency(stats?.todayRevenue, restaurant?.currency)} today`,
      icon: DollarSign,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Active Dishes',
      value: stats?.activeItems?.toLocaleString() || '0',
      subtitle: 'Available on digital menu',
      icon: Utensils,
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span>Live Restaurant Operations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {restaurant?.name || 'Chef'}!
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Here is your restaurant’s real-time performance summary. Diners are scanning your table QR codes and placing orders right now.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/menu"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add New Dish
            </Link>
            <Link
              to="/dashboard/tables"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
            >
              Table QR Codes
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Popular Dishes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue & Orders Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Revenue & Order Trends</h3>
              <p className="text-xs text-slate-500">Live order values over the past 7 days</p>
            </div>
            <Link
              to="/dashboard/analytics"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View Analytics
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value, restaurant?.currency) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Dishes Widget */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900">Popular Dishes</h3>
              <span className="text-xs font-semibold text-slate-400">By sales volume</span>
            </div>

            <div className="space-y-4">
              {popularDishes.length > 0 ? (
                popularDishes.map((dish, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-xs font-black text-slate-400">{idx + 1}</span>
                      <DietaryBadge isVeg={dish.isVeg} />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                          {dish.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {dish.totalQuantity} orders placed
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 flex-shrink-0">
                      {formatCurrency(dish.totalRevenue, restaurant?.currency)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  No orders recorded yet. Share your QR codes to begin!
                </div>
              )}
            </div>
          </div>

          <Link
            to="/dashboard/menu"
            className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Manage Complete Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Table Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Table Orders</h3>
            <p className="text-xs text-slate-500">Live incoming diner orders and kitchen statuses</p>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            Open Kitchen Display
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Order #</th>
                  <th className="px-4 py-3">Table</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => {
                  const statusInfo = getOrderStatusInfo(ord.status);
                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {ord.table?.tableNumber || 'Table'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {ord.customer?.name || 'Guest'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="px-4 py-3.5 font-black text-slate-900">
                        {formatCurrency(ord.totalAmount, restaurant?.currency)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${statusInfo.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {formatRelativeTime(ord.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No orders placed yet. As soon as customers scan your table QR, their orders will appear here in real time!
          </div>
        )}
      </div>
    </div>
  );
}
