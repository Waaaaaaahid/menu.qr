import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-subtle animate-pulse">
      <div className="h-12 bg-slate-100/80 border-b border-slate-200"></div>
      <div className="divide-y divide-slate-100">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
            {[...Array(cols)].map((_, j) => (
              <div
                key={j}
                className="h-4 bg-slate-200/80 rounded"
                style={{ width: `${Math.max(20, Math.floor(80 / cols))}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle animate-pulse space-y-4"
        >
          <div className="w-full h-44 bg-slate-200/80 rounded-xl"></div>
          <div className="h-5 bg-slate-200/80 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200/60 rounded w-full"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-6 bg-slate-200/80 rounded w-16"></div>
            <div className="h-8 bg-slate-200/80 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle animate-pulse space-y-3"
        >
          <div className="flex justify-between">
            <div className="h-4 bg-slate-200/80 rounded w-24"></div>
            <div className="w-8 h-8 rounded-lg bg-slate-200/80"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-32"></div>
          <div className="h-3 bg-slate-200/60 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
};
