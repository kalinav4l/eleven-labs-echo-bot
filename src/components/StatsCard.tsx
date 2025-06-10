
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle }) => {
  return (
    <Card className="bg-white border-2 border-[#FFBB00] hover:border-[#E6A600] transition-colors shadow-md">
      <CardContent className="p-6">
        <div className="text-gray-600 text-sm font-medium mb-2">{title}</div>
        <div className="text-3xl font-bold text-black mb-1">{value}</div>
        {subtitle && (
          <div className="text-gray-500 text-sm">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
