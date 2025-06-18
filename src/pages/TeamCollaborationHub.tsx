
import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TeamActivityFeed from '../components/collaboration/TeamActivityFeed';
import PerformanceSection from '../components/collaboration/PerformanceSection';
import RecognitionSystem from '../components/collaboration/RecognitionSystem';
import CollaborationTools from '../components/collaboration/CollaborationTools';
import { Button } from '@/components/ui/button';
import { Users, Award, TrendingUp, MessageCircle } from 'lucide-react';

const TeamCollaborationHub = () => {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <div className="h-20 bg-gradient-to-r from-white to-gray-100 border-b px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Collaboration Hub</h1>
            <p className="text-gray-600">Unite, perform, and grow together</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeView === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant={activeView === 'manager' ? 'default' : 'outline'}
              onClick={() => setActiveView('manager')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Manager View
            </Button>
          </div>
        </div>

        {activeView === 'dashboard' ? (
          /* Main Dashboard - 3 Column Layout */
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
            {/* Column 1: Team Activity Feed (40%) */}
            <div className="flex-1 lg:w-2/5 p-6 border-r border-gray-200">
              <TeamActivityFeed />
            </div>

            {/* Column 2: Performance Metrics (35%) */}
            <div className="flex-1 lg:w-1/3 p-6 border-r border-gray-200">
              <PerformanceSection />
            </div>

            {/* Column 3: Recognition & Goals (25%) */}
            <div className="flex-1 lg:w-1/4 p-6">
              <RecognitionSystem />
            </div>
          </div>
        ) : (
          /* Manager Tools View */
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Manager tools will be implemented here */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Team Health Dashboard</h3>
                  <p className="text-gray-600">Monitor team performance and well-being metrics</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">1-on-1 Scheduling</h3>
                  <p className="text-gray-600">Schedule and track individual meetings</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
                  <p className="text-gray-600">Analyze long-term performance patterns</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collaboration Tools - Fixed Position */}
        <CollaborationTools />
      </div>
    </DashboardLayout>
  );
};

export default TeamCollaborationHub;
