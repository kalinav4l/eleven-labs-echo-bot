
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import CallsChart from '@/components/CallsChart';
import SuccessRateChart from '@/components/SuccessRateChart';
import AgentsTable from '@/components/AgentsTable';
import LanguageStats from '@/components/LanguageStats';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#111217] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-gray-400 text-sm">Active calls: 0</span>
              </div>
              <h1 className="text-2xl font-semibold text-white">Good evening, Mega</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                All agents
              </Button>
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                Last month
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatsCard title="Number of calls" value="567" />
            <StatsCard title="Average duration" value="0:47" />
            <StatsCard title="Total cost" value="331.150" subtitle="credits" />
            <StatsCard title="Average cost" value="584" subtitle="credits/call" />
            <StatsCard title="Total LLM cost" value="2,12" subtitle="USD" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <CallsChart />
            <SuccessRateChart />
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AgentsTable />
            </div>
            <LanguageStats />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
