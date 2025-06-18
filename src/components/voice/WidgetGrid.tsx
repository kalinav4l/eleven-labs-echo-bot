
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ActiveCallsWidget from './widgets/ActiveCallsWidget';
import CallVolumeWidget from './widgets/CallVolumeWidget';
import TopAgentsWidget from './widgets/TopAgentsWidget';
import SentimentWidget from './widgets/SentimentWidget';
import ConversionWidget from './widgets/ConversionWidget';
import ActivityMapWidget from './widgets/ActivityMapWidget';
import EmptyState from './EmptyState';

interface WidgetGridProps {
  data: any;
  searchQuery: string;
  onRefresh: () => void;
}

const WidgetGrid = ({ data, searchQuery, onRefresh }: WidgetGridProps) => {
  const [widgets, setWidgets] = useState([
    { id: 'active-calls', type: 'small', component: 'ActiveCallsWidget' },
    { id: 'sentiment', type: 'small', component: 'SentimentWidget' },
    { id: 'conversion', type: 'small', component: 'ConversionWidget' },
    { id: 'call-volume', type: 'medium', component: 'CallVolumeWidget' },
    { id: 'top-agents', type: 'medium', component: 'TopAgentsWidget' },
    { id: 'activity-map', type: 'large', component: 'ActivityMapWidget' },
  ]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const renderWidget = (widget: any) => {
    const props = { data, onRefresh };
    
    switch (widget.component) {
      case 'ActiveCallsWidget':
        return <ActiveCallsWidget {...props} />;
      case 'SentimentWidget':
        return <SentimentWidget {...props} />;
      case 'ConversionWidget':
        return <ConversionWidget {...props} />;
      case 'CallVolumeWidget':
        return <CallVolumeWidget {...props} />;
      case 'TopAgentsWidget':
        return <TopAgentsWidget {...props} />;
      case 'ActivityMapWidget':
        return <ActivityMapWidget {...props} />;
      default:
        return null;
    }
  };

  const getWidgetClasses = (type: string) => {
    switch (type) {
      case 'small':
        return 'w-full md:w-45 h-45';
      case 'medium':
        return 'w-full md:w-95 h-45';
      case 'large':
        return 'w-full md:w-95 h-95';
      default:
        return 'w-full md:w-45 h-45';
    }
  };

  if (!data || widgets.length === 0) {
    return <EmptyState onAddWidget={() => {}} />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="widgets">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-min"
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${getWidgetClasses(widget.type)} ${
                      snapshot.isDragging ? 'rotate-3 scale-105' : ''
                    } transition-transform duration-200`}
                  >
                    {renderWidget(widget)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default WidgetGrid;
