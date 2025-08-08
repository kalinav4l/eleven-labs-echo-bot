import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, TrendingUp } from 'lucide-react';

interface BalancePanelProps {
  balance: number;
  monthlySpending: number;
  totalTransactions: number;
}

const BalancePanel: React.FC<BalancePanelProps> = ({ 
  balance, 
  monthlySpending, 
  totalTransactions 
}) => {
  return (
    <Card className="bg-card border-border p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Balance Section */}
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold text-foreground">${balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
          <div className="text-center lg:text-left">
            <p className="text-sm text-muted-foreground">Monthly Spending</p>
            <div className="flex items-center justify-center lg:justify-start space-x-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-lg font-semibold text-foreground">${monthlySpending.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="text-center lg:text-left">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-lg font-semibold text-foreground">{totalTransactions}</p>
          </div>
        </div>

        {/* Add Credit Button */}
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Credits
        </Button>
      </div>
    </Card>
  );
};

export default BalancePanel;