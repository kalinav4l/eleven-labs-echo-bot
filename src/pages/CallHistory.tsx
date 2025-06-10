
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, User, Filter } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface CallRecord {
  id: string;
  date: string;
  agent: string;
  duration: string;
  messages: number;
  evaluationResult: 'Successful' | 'Failed';
}

const CallHistory = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const callHistory: CallRecord[] = [
    {
      id: '1',
      date: '10 iun. 2025, 20:36',
      agent: 'speek',
      duration: '0:35',
      messages: 17,
      evaluationResult: 'Successful'
    },
    {
      id: '2',
      date: '10 iun. 2025, 20:36',
      agent: 'speek',
      duration: '0:02',
      messages: 1,
      evaluationResult: 'Successful'
    },
    {
      id: '3',
      date: '10 iun. 2025, 20:01',
      agent: 'Cipauto',
      duration: '0:30',
      messages: 3,
      evaluationResult: 'Successful'
    },
    {
      id: '4',
      date: '10 iun. 2025, 19:41',
      agent: 'JLC',
      duration: '0:26',
      messages: 1,
      evaluationResult: 'Successful'
    },
    {
      id: '5',
      date: '10 iun. 2025, 19:39',
      agent: 'Cipauto',
      duration: '0:49',
      messages: 1,
      evaluationResult: 'Successful'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#111217] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-white">Call history</h1>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                <Calendar className="w-4 h-4 mr-2" />
                Date After
              </Button>
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                <Calendar className="w-4 h-4 mr-2" />
                Date Before
              </Button>
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                <Filter className="w-4 h-4 mr-2" />
                Evaluation
              </Button>
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                <User className="w-4 h-4 mr-2" />
                Agent
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card className="bg-[#181A1F] border-[#2A2D35]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2D35]">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Agent</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Duration</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Messages</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Evaluation result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callHistory.map((call) => (
                      <tr key={call.id} className="border-b border-[#2A2D35] hover:bg-[#1F2128] transition-colors">
                        <td className="py-4 px-6 text-white">{call.date}</td>
                        <td className="py-4 px-6 text-white">{call.agent}</td>
                        <td className="py-4 px-6 text-white">{call.duration}</td>
                        <td className="py-4 px-6 text-white">{call.messages}</td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant={call.evaluationResult === 'Successful' ? 'default' : 'destructive'}
                            className={call.evaluationResult === 'Successful' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {call.evaluationResult}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CallHistory;
