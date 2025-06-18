
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { MapPin, Globe } from 'lucide-react';

const ActivityMapWidget = () => {
  const { user } = useAuth();

  const { data: activityData } = useQuery({
    queryKey: ['activity-map', user?.id],
    queryFn: async () => {
      if (!user) return { totalCalls: 0, activeRegions: [] };
      
      const { data, error } = await supabase
        .from('call_history')
        .select('phone_number')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching activity data:', error);
        return { totalCalls: 0, activeRegions: [] };
      }

      // Mock regional data based on phone numbers
      const regions = [
        { name: 'Romania', calls: Math.floor(Math.random() * 50) + 20, color: '#007AFF', position: { top: '30%', left: '55%' } },
        { name: 'Moldova', calls: Math.floor(Math.random() * 30) + 10, color: '#34C759', position: { top: '28%', left: '58%' } },
        { name: 'Bulgaria', calls: Math.floor(Math.random() * 20) + 5, color: '#FF9500', position: { top: '35%', left: '52%' } },
        { name: 'Serbia', calls: Math.floor(Math.random() * 15) + 3, color: '#FF3B30', position: { top: '32%', left: '48%' } },
      ];

      return {
        totalCalls: data.length,
        activeRegions: regions
      };
    },
    enabled: !!user,
  });

  const { totalCalls = 0, activeRegions = [] } = activityData || {};

  return (
    <div className="h-96 bg-white rounded-2xl border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Global Activity</h3>
        <p className="text-sm text-gray-500">Real-time call distribution</p>
      </div>
      
      {/* Mock World Map */}
      <div className="relative h-64 bg-gradient-to-b from-blue-50 to-green-50 rounded-xl overflow-hidden">
        {/* Background Map Illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Globe className="w-32 h-32 text-gray-200" />
        </div>
        
        {/* Activity Points */}
        {activeRegions.map((region, index) => (
          <div key={region.name} className="absolute group">
            <div
              className="absolute w-4 h-4 rounded-full animate-ping"
              style={{
                backgroundColor: region.color,
                top: region.position.top,
                left: region.position.left,
                opacity: 0.6
              }}
            ></div>
            <div
              className="absolute w-3 h-3 rounded-full cursor-pointer"
              style={{
                backgroundColor: region.color,
                top: region.position.top,
                left: region.position.left,
                transform: 'translate(2px, 2px)'
              }}
            ></div>
            
            {/* Tooltip */}
            <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-10"
                 style={{
                   top: `calc(${region.position.top} - 40px)`,
                   left: region.position.left,
                   transform: 'translateX(-50%)'
                 }}>
              <div className="font-medium">{region.name}</div>
              <div>{region.calls} calls</div>
            </div>
          </div>
        ))}
        
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {activeRegions.map((region, index) => (
            index > 0 && (
              <line
                key={`line-${index}`}
                x1="50%"
                y1="50%"
                x2={region.position.left}
                y2={region.position.top}
                stroke={region.color}
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeDasharray="2,2"
              />
            )
          ))}
        </svg>
      </div>
      
      {/* Statistics */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">{totalCalls}</div>
          <div className="text-xs text-gray-500">Total Calls</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{activeRegions.length}</div>
          <div className="text-xs text-gray-500">Active Regions</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMapWidget;
