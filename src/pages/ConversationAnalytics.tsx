import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Phone, MessageSquare, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConversationAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { callHistory, isLoading } = useCallHistory();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiat",
      description: "Conversation ID a fost copiat în clipboard",
    });
  };

  const filteredCalls = callHistory.filter(call => {
    const matchesSearch = call.phone_number.includes(searchTerm) || 
                         call.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (call.summary && call.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (call.conversation_id && call.conversation_id.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || call.call_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'initiated':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ro-RO', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUniqueAgents = () => {
    const agents = [...new Set(callHistory.map(call => call.agent_id).filter(Boolean))];
    return agents;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Se încarcă istoricul conversațiilor...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Conversation Analytics
          </h1>
          <p className="text-muted-foreground">
            Analizează conversațiile și performanța agenților
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Caută după ID conversație
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Introdu ID-ul unei conversații pentru a o găsi toate informațiile disponibile
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="conv_XXXXXXXXXX sau ID conversație..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toți agenții" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toți agenții</SelectItem>
              {getUniqueAgents().map((agentId) => (
                <SelectItem key={agentId} value={agentId}>
                  {agentId.slice(0, 8)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toate statusurile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate statusurile</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="failed">Error</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Call History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Call History</CardTitle>
            <div className="flex gap-2 text-sm">
              <Button variant="outline" size="sm">+ Date After</Button>
              <Button variant="outline" size="sm">+ Date Before</Button>
              <Button variant="outline" size="sm">+ Evaluation</Button>
              <Button variant="outline" size="sm">+ Agent</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Agent</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Duration</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Evaluation result</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Conversation ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        Nu sunt conversații disponibile
                      </td>
                    </tr>
                  ) : (
                    filteredCalls.map((call) => {
                      const dateTime = formatDate(call.call_date);
                      return (
                        <tr key={call.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="font-medium">{dateTime.date}</div>
                              <div className="text-muted-foreground text-xs">{dateTime.time}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {call.agent_id ? call.agent_id.slice(0, 12) + '...' : 'N/A'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center text-sm">
                              <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                              {formatDuration(call.duration_seconds || 0)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                              {call.phone_number}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge 
                              className={getStatusColor(call.call_status)}
                              variant="secondary"
                            >
                              {call.call_status === 'success' ? 'Successful' : 
                               call.call_status === 'initiated' ? 'Initiated' : 
                               call.call_status === 'busy' ? 'Busy' :
                               call.call_status === 'failed' ? 'Error' : 'Unknown'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {call.conversation_id ? (
                              <div className="flex items-center space-x-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {call.conversation_id.slice(0, 12)}...
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(call.conversation_id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {filteredCalls.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Afișând {filteredCalls.length} din {callHistory.length} conversații
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ConversationAnalytics;