
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      title: 'Conversație cu Assistant Personal',
      date: '2024-06-03 14:30',
      duration: '5 min',
      messages: 12,
      agent: 'Assistant Personal',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Support pentru problema tehnică',
      date: '2024-06-03 10:15',
      duration: '8 min',
      messages: 18,
      agent: 'Support Client',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Informații despre produse',
      date: '2024-06-02 16:45',
      duration: '3 min',
      messages: 7,
      agent: 'Vânzări',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Consultație generală',
      date: '2024-06-02 09:20',
      duration: '12 min',
      messages: 25,
      agent: 'Assistant Personal',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Raportare problemă',
      date: '2024-06-01 18:30',
      duration: '6 min',
      messages: 14,
      agent: 'Support Client',
      status: 'completed'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Istoric Chat</h1>
            <p className="text-gray-400">Toate conversațiile tale cu agenții AI</p>
          </div>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Exportă Istoric
          </Button>
        </div>

        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="text-white font-medium text-lg">{conversation.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {conversation.date}
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <User className="w-4 h-4 mr-1" />
                          {conversation.agent}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">{conversation.duration}</div>
                    <div className="text-gray-400 text-sm">{conversation.messages} mesaje</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Anterior
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">1</Button>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">2</Button>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">3</Button>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Următor
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountChatHistory;
