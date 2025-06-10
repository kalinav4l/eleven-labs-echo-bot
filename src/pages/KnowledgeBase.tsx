
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, FileText, Upload, Search, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface KnowledgeItem {
  id: string;
  name: string;
  type: 'file' | 'url' | 'text';
  size?: string;
  createdBy: string;
  lastUpdated: string;
}

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const knowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      name: 'CATALOGOO AS HUMENO.pdf',
      type: 'file',
      size: '174.2 kB',
      createdBy: 'Mega Promoting',
      lastUpdated: '12 mai 2025, 14:07'
    },
    {
      id: '2',
      name: 'untitled',
      type: 'text',
      size: '13.0 kB',
      createdBy: 'Mega Promoting',
      lastUpdated: '27 apr. 2025, 18:44'
    },
    {
      id: '3',
      name: 'https://achiat.md/ro',
      type: 'url',
      createdBy: 'Mega Promoting',
      lastUpdated: '27 feb. 2025, 16:47'
    }
  ];

  const filteredItems = knowledgeItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'url':
        return <Link className="w-4 h-4 text-gray-400" />;
      case 'text':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#111217] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-8">Knowledge Base</h1>
            
            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                <Link className="w-4 h-4 mr-2" />
                Add URL
              </Button>
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                <Upload className="w-4 h-4 mr-2" />
                Add Files
              </Button>
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                <FileText className="w-4 h-4 mr-2" />
                Create Text
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search Knowledge Base..."
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
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Created by</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Last updated</th>
                      <th className="w-12 py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b border-[#2A2D35] hover:bg-[#1F2128] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {getIcon(item.type)}
                            <div>
                              <div className="text-white font-medium">{item.name}</div>
                              {item.size && (
                                <div className="text-gray-400 text-sm">{item.size}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-white">{item.createdBy}</td>
                        <td className="py-4 px-6 text-gray-400">{item.lastUpdated}</td>
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

export default KnowledgeBase;
