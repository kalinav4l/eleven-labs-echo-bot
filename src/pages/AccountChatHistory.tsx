
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, User, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const AccountChatHistory = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const conversations = [
    {
      id: 1,
      title: 'Test cu Borea',
      date: '2024-06-03 14:30',
      duration: '5 min',
      messages: 12,
      agent: 'Borea',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Conversație cu Jesica',
      date: '2024-06-03 10:15',
      duration: '8 min',
      messages: 18,
      agent: 'Jesica',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Test cu Ana',
      date: '2024-06-02 16:45',
      duration: '3 min',
      messages: 7,
      agent: 'Ana',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Sesiune cu Borea',
      date: '2024-06-02 09:20',
      duration: '12 min',
      messages: 25,
      agent: 'Borea',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Test cu Jesica',
      date: '2024-06-01 18:30',
      duration: '6 min',
      messages: 14,
      agent: 'Jesica',
      status: 'completed'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Istoric Chat</h1>
            <p className="text-gray-600">Toate conversațiile tale cu agenții AI</p>
          </div>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
            <Download className="w-4 h-4 mr-2" />
            Exportă Istoric
          </Button>
        </div>

        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="bg-white border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="w-8 h-8 text-gray-700" />
                    <div>
                      <h3 className="text-black font-medium text-lg">{conversation.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {conversation.date}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <User className="w-4 h-4 mr-1" />
                          {conversation.agent}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-black font-medium">{conversation.duration}</div>
                    <div className="text-gray-600 text-sm">{conversation.messages} mesaje</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Anterior
            </Button>
            <Button size="sm" className="bg-black hover:bg-gray-800 text-white">1</Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">2</Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">3</Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Următor
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountChatHistory;
