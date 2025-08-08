import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  title: string;
  time: Date;
  amount: number;
  type: 'agent' | 'call' | 'conversation' | 'cost';
}

interface OrdersListProps {
  orders: Order[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  const getOrderIcon = (type: string) => {
    switch (type) {
      case 'agent':
        return { icon: '🤖', color: 'bg-blue-500' };
      case 'call':
        return { icon: '📞', color: 'bg-green-500' };
      case 'conversation':
        return { icon: '💬', color: 'bg-purple-500' };
      case 'cost':
        return { icon: '💰', color: 'bg-red-500' };
      default:
        return { icon: '📋', color: 'bg-gray-500' };
    }
  };

  const monthGrowth = 30; // Example value

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white">Activity Overview</CardTitle>
            <p className="text-emerald-500 text-sm">📈 +{monthGrowth}% this month</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order, index) => {
            const orderStyle = getOrderIcon(order.type);
            
            return (
              <div key={order.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${orderStyle.color} flex items-center justify-center text-white`}>
                  <span className="text-lg">{orderStyle.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {order.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(order.time, { addSuffix: true })}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {order.type === 'cost' ? `-$${order.amount.toFixed(2)}` : `+${order.amount}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersList;