
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle }) => {
  return (
    <Card className="bg-[#181A1F] border-[#2A2D35] hover:border-[#3A3D45] transition-colors">
      <CardContent className="p-6">
        <div className="text-gray-400 text-sm font-medium mb-2">{title}</div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {subtitle && (
          <div className="text-gray-400 text-sm">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
