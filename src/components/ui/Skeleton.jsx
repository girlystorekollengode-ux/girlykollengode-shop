import React from 'react';

// General base skeleton pulse animation class
const pulseClass = "animate-pulse bg-primary-100/50 rounded-lg";

export const ProductCardSkeleton = () => {
  return (
    <div className="group bg-white rounded-2xl border border-primary-50 shadow-pink-sm p-0 overflow-hidden flex flex-col h-full text-left">
      {/* Product Image Area */}
      <div className={`aspect-[3/4] w-full ${pulseClass} rounded-b-none`} />

      {/* Info Content Section */}
      <div className="p-2 sm:p-4 flex flex-col flex-1 space-y-2 sm:space-y-3">
        {/* Category Tag */}
        <div className={`h-3 w-1/3 ${pulseClass}`} />

        {/* Title */}
        <div className={`h-4 w-3/4 ${pulseClass}`} />

        {/* Description (only desktop) */}
        <div className="hidden sm:block space-y-1.5 min-h-[30px]">
          <div className={`h-2.5 w-full ${pulseClass}`} />
          <div className={`h-2.5 w-5/6 ${pulseClass}`} />
        </div>

        {/* Price list & Quick add */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-primary-50">
          <div className="space-y-1">
            <div className={`h-3 w-8 ${pulseClass}`} />
            <div className={`h-4 w-12 ${pulseClass}`} />
          </div>
          <div className={`h-6 w-12 rounded-full ${pulseClass}`} />
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden border border-primary-50 shadow-pink-sm bg-white animate-pulse">
      <div className="w-full h-full bg-primary-100/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
        <div className="h-4 w-2/3 bg-white/70 rounded-md mb-2" />
        <div className="h-2 w-1/3 bg-white/50 rounded-sm" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 4, className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6" }) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CategoryGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
};
