
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface PhoneNumber {
  id: string;
  name: string;
  number: string;
  assignedAgent: string;
  provider: string;
}

const PhoneNumbers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const phoneNumbers: PhoneNumber[] = [
    {
      id: '1',
      name: 'twilio',
      number: '+1 620 557 8742',
      assignedAgent: 'speek 2',
      provider: 'Twilio'
    },
    {
      id: '2',
      name: 'kalina 1',
      number: '+373 793 15 040',
      assignedAgent: 'No agent',
      provider: 'SIP Trunk'
    },
    {
      id: '3',
      name: 'cartel_test',
      number: '+373 22 800 388',
      assignedAgent: 'Cipauto',
      provider: 'SIP Trunk'
    }
  ];

  const filteredNumbers = phoneNumbers.filter(number =>
    number.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    number.number.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#111217] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">Phone numbers</h1>
              <p className="text-gray-400 text-sm">Import and manage your phone numbers</p>
            </div>
            <Button className="bg-white text-black hover:bg-gray-100 font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Import number
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1F2128] border-[#2A2D35] text-white placeholder-gray-400 focus:border-white"
              />
            </div>
          </div>

          {/* Table */}
          <Card className="bg-[#181A1F] border-[#2A2D35]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2D35]">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Name</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Phone number</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Assigned agent</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Provider</th>
                      <th className="w-12 py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNumbers.map((number) => (
                      <tr key={number.id} className="border-b border-[#2A2D35] hover:bg-[#1F2128] transition-colors">
                        <td className="py-4 px-6 text-white font-medium">{number.name}</td>
                        <td className="py-4 px-6 text-white">{number.number}</td>
                        <td className="py-4 px-6 text-white">{number.assignedAgent}</td>
                        <td className="py-4 px-6 text-gray-400">{number.provider}</td>
                        <td className="py-4 px-6">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#2A2D35]">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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

export default PhoneNumbers;
