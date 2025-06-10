
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
    <Card className="bg-[#181A1F] border-[#2A2D35]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg font-medium">Most called agents</CardTitle>
        <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
          See all 38 agents
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2D35]">
                <th className="text-left py-3 text-gray-400 font-medium text-sm">Agent name</th>
                <th className="text-left py-3 text-gray-400 font-medium text-sm">Number of calls</th>
                <th className="text-left py-3 text-gray-400 font-medium text-sm">Call minutes</th>
                <th className="text-left py-3 text-gray-400 font-medium text-sm">LLM cost</th>
                <th className="text-left py-3 text-gray-400 font-medium text-sm">Credits spent</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => (
                <tr key={index} className="border-b border-[#2A2D35] last:border-b-0">
                  <td className="py-3 text-white font-medium">{agent.name}</td>
                  <td className="py-3 text-white">{agent.calls}</td>
                  <td className="py-3 text-white">{agent.minutes}</td>
                  <td className="py-3 text-white">{agent.cost}</td>
                  <td className="py-3 text-white">{agent.credits.toLocaleString()}</td>
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
