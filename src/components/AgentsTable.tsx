
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Agent {
  name: string;
  calls: number;
  minutes: number;
  cost: string;
  credits: number;
}

const AgentsTable = () => {
  const agents: Agent[] = [
    { name: 'Cipauto', calls: 179, minutes: 100, cost: '0.24 USD', credits: 79608 },
    { name: 'imunibox.com', calls: 116, minutes: 115, cost: '1.26 USD', credits: 88913 },
    { name: 'kalina 0.1', calls: 67, minutes: 38, cost: '0.24 USD', credits: 17182 }
  ];

  return (
    <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-primary">
        <CardTitle className="text-black text-lg font-bold">Most called agents</CardTitle>
        <Button variant="ghost" className="text-black hover:text-gray-700 text-sm font-medium hover:bg-[#FFD666]">
          See all 38 agents
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#FFBB00]">
                <th className="text-left py-3 text-gray-600 font-bold text-sm">Agent name</th>
                <th className="text-left py-3 text-gray-600 font-bold text-sm">Number of calls</th>
                <th className="text-left py-3 text-gray-600 font-bold text-sm">Call minutes</th>
                <th className="text-left py-3 text-gray-600 font-bold text-sm">LLM cost</th>
                <th className="text-left py-3 text-gray-600 font-bold text-sm">Credits spent</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0 hover:bg-[#FFD666] transition-colors">
                  <td className="py-3 text-black font-bold">{agent.name}</td>
                  <td className="py-3 text-black">{agent.calls}</td>
                  <td className="py-3 text-black">{agent.minutes}</td>
                  <td className="py-3 text-black">{agent.cost}</td>
                  <td className="py-3 text-black font-medium">{agent.credits.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentsTable;
