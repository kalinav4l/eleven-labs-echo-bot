
import React, { useEffect, useState } from 'react';

interface ActiveCallsWidgetProps {
  data: any;
  onRefresh: () => void;
}

const ActiveCallsWidget = ({ data }: ActiveCallsWidgetProps) => {
  const [activeCalls, setActiveCalls] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate active calls count
    const count = data?.recentCalls?.filter((call: any) => 
      call.call_status === 'active' || call.call_status === 'in_progress'
    ).length || 0;
    
    setActiveCalls(count);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  }, [data]);

  return (
    <div className="h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
      
      <div className="flex flex-col justify-center items-center h-full">
        <div className={`text-6xl font-bold mb-2 transition-transform duration-2000 ${
          isAnimating ? 'animate-pulse scale-110' : 'scale-100'
        }`}>
          {activeCalls}
        </div>
        <div className="text-blue-100 text-sm font-medium">
          Active Calls
        </div>
      </div>
      
      {/* Pulse animation overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white bg-opacity-5 rounded-2xl animate-ping"></div>
      )}
    </div>
  );
};

export default ActiveCallsWidget;
