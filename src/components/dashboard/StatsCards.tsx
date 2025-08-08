import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Phone, DollarSign } from 'lucide-react';

interface StatsCardsProps {
  todaysCalls: number;
  totalAgents: number;
  newConversations: number;
  totalCost: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  todaysCalls,
  totalAgents,
  newConversations,
  totalCost
}) => {
  const stats = [
    {
      title: "Today's Calls",
      value: todaysCalls.toString(),
      icon: Phone,
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      iconColor: "text-white"
    },
    {
      title: "Total Agents",
      value: totalAgents.toString(),
      icon: Users,
      bgColor: "bg-gradient-to-r from-green-500 to-green-600",
      iconColor: "text-white"
    },
    {
      title: "New Conversations",
      value: `+${newConversations}`,
      icon: TrendingUp,
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
      iconColor: "text-white"
    },
    {
      title: "Total Cost",
      value: `$${totalCost.toFixed(2)}`,
      icon: DollarSign,
      bgColor: "bg-gradient-to-r from-red-500 to-red-600",
      iconColor: "text-white"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden bg-gray-800 border-gray-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;