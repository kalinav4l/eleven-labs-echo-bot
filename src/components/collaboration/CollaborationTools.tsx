
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Mic, 
  Share, 
  BarChart3, 
  Megaphone, 
  Users,
  Video,
  FileText,
  BookOpen
} from 'lucide-react';

const CollaborationTools = () => {
  const [showTools, setShowTools] = useState(false);
  const [activeVoiceRoom, setActiveVoiceRoom] = useState<string | null>(null);

  const voiceRooms = [
    { id: '1', name: 'Daily Standup', participants: 5, active: true },
    { id: '2', name: 'Sales Strategy', participants: 3, active: false },
    { id: '3', name: 'Training Session', participants: 8, active: true },
  ];

  const quickActions = [
    { icon: Calendar, label: 'Schedule Meeting', color: 'bg-blue-500' },
    { icon: Mic, label: 'Start Voice Room', color: 'bg-green-500' },
    { icon: Share, label: 'Share Screen', color: 'bg-purple-500' },
    { icon: BarChart3, label: 'Create Poll', color: 'bg-orange-500' },
    { icon: Megaphone, label: 'Announce Update', color: 'bg-red-500' },
  ];

  return (
    <>
      {/* Quick Actions Floating Bar */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`transition-all duration-300 ${showTools ? 'mb-4' : ''}`}>
          {showTools && (
            <Card className="p-4 shadow-lg mb-4 w-80">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 justify-start p-3 h-auto"
                  >
                    <action.icon className={`h-4 w-4 text-white p-1 rounded ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>

              {/* Voice Rooms */}
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2 text-sm">Active Voice Rooms</h4>
                <div className="space-y-2">
                  {voiceRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        activeVoiceRoom === room.id
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveVoiceRoom(room.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            room.active ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm font-medium">{room.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {room.participants}
                        </Badge>
                      </div>
                      {activeVoiceRoom === room.id && (
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs h-6">
                            <Mic className="h-3 w-3 mr-1"  />
                            Mute
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-6">
                            <Video className="h-3 w-3 mr-1" />
                            Camera
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-6">
                            <Share className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Sharing */}
              <div className="border-t pt-3 mt-3">
                <h4 className="font-medium mb-2 text-sm">Knowledge Hub</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" size="sm" className="justify-start p-2 h-auto">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="text-xs">Best Practices</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start p-2 h-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-xs">Templates</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start p-2 h-auto">
                    <Video className="h-4 w-4 mr-2" />
                    <span className="text-xs">Tutorials</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start p-2 h-auto">
                    <Share className="h-4 w-4 mr-2" />
                    <span className="text-xs">Scripts</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Button
          onClick={() => setShowTools(!showTools)}
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {showTools ? (
            <span className="text-xl">×</span>
          ) : (
            <Users className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
};

export default CollaborationTools;
