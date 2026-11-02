import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export default function RestaurantSetupPage() {
  const { setRestaurant, refreshRestaurant } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    cuisine: 'Modern Bistro, Grill, Burgers',
    description: 'Fresh local ingredients, handcrafted cocktails, and unforgettable flavors.',
    phone: '+1 (555) 234-5678',
    currencySymbol: '$',
    currencyCode: 'USD',
    taxPercentage: 5,
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter your restaurant name', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        cuisine: formData.cuisine,
        description: formData.description,
        phone: formData.phone,
        currency: {
          symbol: formData.currencySymbol,
          code: formData.currencyCode,
          position: 'before',
        },
        taxPercentage: Number(formData.taxPercentage),
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
        },
        logo: formData.logo,
        coverImage: formData.coverImage,
      };

      const res = await api.post('/restaurant', payload);
      if (res.data.success) {
        setRestaurant(res.data.restaurant);
        await refreshRestaurant();
        addToast('Restaurant setup complete! Welcome to your dashboard.', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error setting up restaurant', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/25">
            <Store className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Set Up Your Restaurant Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Tell us about your restaurant. We’ll generate your custom public digital menu and first table QR code automatically!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Copper Chimney Bistro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cuisine Specialty
              </label>
              <input
                type="text"
                placeholder="e.g. Italian, Woodfired Pizza, Pasta"
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Short Description / Tagline
              </label>
              <textarea
                rows={2}
                placeholder="Describe your culinary specialty..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 font-bold"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="₹">₹ (INR)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="AED">AED (Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.taxPercentage}
                onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 (555) 019-2831"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="San Francisco, CA"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Categories & Table 1 QR code will be generated instantly
            </span>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Restaurant & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
