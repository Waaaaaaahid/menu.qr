import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Heart, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
                <QrCode className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Menu<span className="text-brand-500">QR</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              The modern contactless digital menu and real-time QR ordering platform for restaurants, cafes, and bars worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational (99.98% uptime)</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Digital QR Menus</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Table Ordering</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Live Kitchen Display</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">QR Tent Card Generator</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Sales & Visits Analytics</a></li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/menu/royal-biryani?table=T-01" target="_blank" className="hover:text-white transition-colors">Live Customer Demo</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Col 4: Platform Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform Quality</h4>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                <Zap className="w-4 h-4" />
                <span>Instant QR Scanning</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero app download required for diners. Works seamlessly on all iOS and Android smartphone cameras.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MenuQR SaaS Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
