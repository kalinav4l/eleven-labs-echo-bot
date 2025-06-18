
import React from 'react';
import ActiveCallsWidget from './widgets/ActiveCallsWidget';
import SentimentWidget from './widgets/SentimentWidget';
import ConversionWidget from './widgets/ConversionWidget';
import CallVolumeWidget from './widgets/CallVolumeWidget';
import TopAgentsWidget from './widgets/TopAgentsWidget';
import ActivityMapWidget from './widgets/ActivityMapWidget';

const WidgetGrid = () => {
  return (
    <div className="grid grid-cols-12 gap-5 auto-rows-min">
      {/* Small Widgets Row */}
      <div className="col-span-3">
        <ActiveCallsWidget />
      </div>
      <div className="col-span-3">
        <SentimentWidget />
      </div>
      <div className="col-span-3">
        <ConversionWidget />
      </div>
      <div className="col-span-3">
        {/* Placeholder for future widget */}
        <div className="h-45 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Add Widget</span>
        </div>
      </div>
      
      {/* Medium Widgets Row */}
      <div className="col-span-6">
        <CallVolumeWidget />
      </div>
      <div className="col-span-6">
        <TopAgentsWidget />
      </div>
      
      {/* Large Widget */}
      <div className="col-span-6">
        <ActivityMapWidget />
      </div>
      <div className="col-span-6">
        {/* Placeholder for future large widget */}
        <div className="h-96 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Conversation Topics Cloud</span>
        </div>
      </div>
    </div>
  );
};

export default WidgetGrid;
