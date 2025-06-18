
import React, { useEffect, useRef } from 'react';

interface ActivityMapWidgetProps {
  data: any;
  onRefresh: () => void;
}

const ActivityMapWidget = ({ data }: ActivityMapWidgetProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple animated globe placeholder
    if (mapRef.current) {
      // Add rotating animation
      mapRef.current.style.animation = 'spin 20s linear infinite';
    }
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden row-span-2 col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Global Activity</h3>
        <div className="text-sm opacity-75">Real-time</div>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <div 
          ref={mapRef}
          className="w-48 h-48 bg-white bg-opacity-10 rounded-full flex items-center justify-center relative"
        >
          {/* Simulated globe */}
          <div className="w-40 h-40 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="text-4xl">🌍</div>
            </div>
          </div>
          
          {/* Activity dots */}
          <div className="absolute top-8 left-12 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-16 right-8 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-12 left-16 w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex justify-between text-sm opacity-75">
          <span>Active Regions: 12</span>
          <span>Live Connections: {data?.recentCalls?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityMapWidget;
