import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Phone, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConversationDetailSidebar } from '@/components/outbound/ConversationDetailSidebar';
import { supabase } from '@/integrations/supabase/client';
const ConversationAnalytics = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversationDurations, setConversationDurations] = useState<Record<string, number>>({});
  const [conversationCosts, setConversationCosts] = useState<Record<string, number>>({});
  const {
    callHistory,
    isLoading
  } = useCallHistory();
  const {
    toast
  } = useToast();

  // Function to get duration and cost from conversation data
  const getConversationData = async (conversationId: string) => {
    if (!conversationId || conversationDurations[conversationId] !== undefined && conversationCosts[conversationId] !== undefined) {
      return {
        duration: conversationDurations[conversationId] || 0,
        cost: conversationCosts[conversationId] || 0
      };
    }
    try {
      const {
        data
      } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: {
          conversationId
        }
      });
      if (data?.metadata) {
        const duration = Math.round(data.metadata.call_duration_secs || 0);
        const cost = data.metadata.cost || 0;
        setConversationDurations(prev => ({
          ...prev,
          [conversationId]: duration
        }));
        setConversationCosts(prev => ({
          ...prev,
          [conversationId]: cost
        }));
        return {
          duration,
          cost
        };
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    }
    return {
      duration: 0,
      cost: 0
    };
  };
  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsSidebarOpen(true);
  };
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedConversationId(null);
  };

  // Load conversation data when call history changes
  useEffect(() => {
    const loadConversationData = async () => {
      const conversationsToLoad = callHistory.filter(call => call.conversation_id && (conversationDurations[call.conversation_id] === undefined || conversationCosts[call.conversation_id] === undefined));
      for (const call of conversationsToLoad) {
        if (call.conversation_id) {
          await getConversationData(call.conversation_id);
        }
      }
    };
    if (callHistory.length > 0) {
      loadConversationData();
    }
  }, [callHistory.length]); // Only depend on length to avoid infinite loop

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiat",
      description: "Conversation ID a fost copiat în clipboard"
    });
  };
  const filteredCalls = callHistory.filter(call => {
    const matchesSearch = call.phone_number.includes(searchTerm) || call.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) || call.summary && call.summary.toLowerCase().includes(searchTerm.toLowerCase()) || call.conversation_id && call.conversation_id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || call.call_status === statusFilter;
    const matchesAgent = selectedAgent === 'all' || call.agent_name === selectedAgent;

    // Date filtering
    const callDate = new Date(call.call_date);
    const matchesDateAfter = !dateAfter || callDate >= new Date(dateAfter);
    const matchesDateBefore = !dateBefore || callDate <= new Date(dateBefore + 'T23:59:59');
    return matchesSearch && matchesStatus && matchesAgent && matchesDateAfter && matchesDateBefore;
  });
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'done':
        return 'bg-green-500 text-white shadow-lg shadow-green-500/30 rounded-full px-4 py-1.5 font-semibold text-xs border-2 border-green-400';
      case 'failed':
      case 'error':
        return 'bg-red-500 text-white shadow-lg shadow-red-500/30 rounded-lg px-4 py-1.5 font-semibold text-xs border-2 border-red-400';
      case 'initiated':
      case 'in_progress':
        return 'bg-green-500 text-white shadow-lg shadow-green-500/30 rounded-md px-4 py-1.5 font-semibold text-xs border-2 border-green-400';
      case 'busy':
        return 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 rounded-lg px-4 py-1.5 font-semibold text-xs border-2 border-blue-400';
      default:
        return 'bg-gray-500 text-white shadow-lg shadow-gray-500/30 rounded-md px-4 py-1.5 font-semibold text-xs border-2 border-gray-400';
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
  const formatCost = (cost: number) => {
    if (!cost || cost === 0) return '0 credite';
    return `${cost} credite`;
  };
  const getUniqueAgents = () => {
    const agentNames = [...new Set(callHistory.map(call => call.agent_name).filter(Boolean))];
    return agentNames;
  };
  if (isLoading) {
    return <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Se încarcă istoricul conversațiilor...</p>
          </div>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Analytics Conversații</h1>
        </div>

        {/* Mobile-Responsive Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 py-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg px-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input type="text" placeholder="Caută..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-9 text-sm bg-white border-0" />
          </div>

          {/* Date Range - Stacked on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Input type="date" value={dateAfter} onChange={e => setDateAfter(e.target.value)} className="h-9 w-full sm:w-36 text-sm bg-white border-0" placeholder="De la" />
            <span className="text-muted-foreground text-sm text-center sm:text-left">până la</span>
            <Input type="date" value={dateBefore} onChange={e => setDateBefore(e.target.value)} className="h-9 w-full sm:w-36 text-sm bg-white border-0" placeholder="Până la" />
          </div>

          {/* Filters - Full width on mobile */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 flex-1 sm:w-28 text-sm bg-white border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-0 z-50">
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="initiated">Initiated</SelectItem>
                <SelectItem value="failed">Error</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="h-9 flex-1 sm:w-28 text-sm bg-white border-0">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent className="bg-white border-0 z-50">
                <SelectItem value="all">Toți</SelectItem>
                {getUniqueAgents().map(agentName => <SelectItem key={agentName} value={agentName}>
                    {agentName}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Button */}
          {(searchTerm || statusFilter !== 'all' || selectedAgent !== 'all' || dateAfter || dateBefore) && <Button variant="ghost" size="sm" onClick={() => {
          setSearchTerm('');
          setStatusFilter('all');
          setSelectedAgent('all');
          setDateAfter('');
          setDateBefore('');
        }} className="h-9 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50">
              Clear
            </Button>}
        </div>

        {/* Analytics Table - Mobile Responsive */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="px-3 sm:px-6 py-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Istoric Conversații</h2>
          </div>
          <div className="bg-white">
            {/* Mobile Card Layout */}
            <div className="block sm:hidden space-y-3 p-3">
              {filteredCalls.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  Nu sunt conversații disponibile
                </div>
              ) : (
                filteredCalls.map(call => {
                  const dateTime = formatDate(call.call_date);
                  return (
                    <div key={call.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => call.conversation_id && handleConversationClick(call.conversation_id)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                          {call.phone_number}
                        </div>
                        <div className={getStatusStyle(call.call_status)}>
                          {call.call_status === 'done' ? '✓ Done' : call.call_status === 'initiated' ? '⚡ Initiated' : call.call_status === 'busy' ? '⏳ Busy' : call.call_status === 'failed' ? '✕ Error' : call.call_status === 'success' ? '✓ Success' : '? Unknown'}
                        </div>
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {call.contact_name || 'Necunoscut'}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        Agent: {call.agent_name || 'Agent necunoscut'}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Cost: {call.conversation_id ? formatCost(conversationCosts[call.conversation_id] || 0) : formatCost(0)}</span>
                        <span>Durată: {call.conversation_id ? formatDuration(conversationDurations[call.conversation_id] || 0) : formatDuration(call.duration_seconds || 0)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact Number</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nume Contact</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Agent</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cost total:</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Evaluation result</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.length === 0 ? <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        Nu sunt conversații disponibile
                      </td>
                    </tr> : filteredCalls.map(call => {
                  const dateTime = formatDate(call.call_date);
                  return <tr key={call.id} className="hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:z-10 relative" onClick={() => call.conversation_id && handleConversationClick(call.conversation_id)}>
                          <td className="p-3">
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                              {call.phone_number}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium">
                              {call.contact_name || 'Necunoscut'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {call.agent_name || 'Agent necunoscut'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="font-medium">
                                {call.conversation_id ? formatCost(conversationCosts[call.conversation_id] || 0) : formatCost(0)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className={getStatusStyle(call.call_status)}>
                              {call.call_status === 'done' ? '✓ Done' : call.call_status === 'initiated' ? '⚡ Initiated' : call.call_status === 'busy' ? '⏳ Busy' : call.call_status === 'failed' ? '✕ Error' : call.call_status === 'success' ? '✓ Success' : '? Unknown'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="font-medium">Durată:</div>
                              <div className="text-muted-foreground">
                                {call.conversation_id ? formatDuration(conversationDurations[call.conversation_id] || 0) : formatDuration(call.duration_seconds || 0)}
                              </div>
                            </div>
                          </td>
                        </tr>;
                })}
                </tbody>
              </table>
            </div>
            
            {filteredCalls.length > 0 && <div className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                Afișând {filteredCalls.length} din {callHistory.length} conversații
              </div>}
          </div>
        </div>
      </div>
      
      {/* Conversation Detail Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[50vw] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>Detalii Conversație</SheetTitle>
          </SheetHeader>
          <div className="p-6">
            {selectedConversationId && (
              <ConversationDetailSidebar conversationId={selectedConversationId} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>;
};
export default ConversationAnalytics;