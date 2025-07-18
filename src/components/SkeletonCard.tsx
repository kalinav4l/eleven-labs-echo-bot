
import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="p-6 border border-gray-200 rounded-xl bg-white">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 bg-gray-200 rounded-full w-20 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded-full w-16 animate-pulse" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonCard;
