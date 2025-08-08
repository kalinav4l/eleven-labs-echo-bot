import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReferralChartProps {
  invitedCount: number;
  bonusAmount: number;
  score: number;
}

const ReferralChart: React.FC<ReferralChartProps> = ({ invitedCount, bonusAmount, score }) => {
  const maxScore = 10;
  const percentage = (score / maxScore) * 100;
  
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Active Agents</div>
            <div className="text-xl font-bold text-white">{invitedCount} agents</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Cost</div>
            <div className="text-xl font-bold text-white">${bonusAmount}</div>
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-center relative">
              <div className="w-32 h-32 relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    className="text-emerald-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{score}</div>
                    <div className="text-xs text-gray-400">Total Score</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-xs text-gray-400">Safety</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralChart;