import React from 'react';
import { Flame, Star, Sparkles } from 'lucide-react';

export const DietaryBadge = ({ isVeg, className = '' }) => {
  if (isVeg) {
    return (
      <span
        title="Vegetarian"
        className={`inline-flex items-center justify-center w-4 h-4 rounded border border-emerald-600 bg-white p-0.5 ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className={`inline-flex items-center justify-center w-4 h-4 rounded border border-rose-600 bg-white p-0.5 ${className}`}
    >
      <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-rose-600"></span>
    </span>
  );
};

export const TagBadge = ({ type, spiceLevel = 1, className = '' }) => {
  if (type === 'bestseller') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs ${className}`}
      >
        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
        Bestseller
      </span>
    );
  }

  if (type === 'spicy') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
      >
        <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
        {spiceLevel > 1 ? `Spicy (${spiceLevel})` : 'Spicy'}
      </span>
    );
  }

  if (type === 'new') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}
      >
        <Sparkles className="w-3 h-3 text-indigo-500" />
        New
      </span>
    );
  }

  return null;
};
