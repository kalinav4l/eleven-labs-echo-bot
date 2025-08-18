import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useConversationAnalyticsCache } from '@/hooks/useConversationAnalyticsCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Phone, Copy, ExternalLink, RefreshCw, Clock, Database, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConversationDetailSidebar } from '@/components/outbound/ConversationDetailSidebar';

const ConversationAnalytics = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { callHistory, isLoading } = useCallHistory();
  const {
    getConversationData,
    autoRefreshRecentConversations,
    refreshAllConversations,
    refreshConversation,
    cachedConversations
  } = useConversationAnalyticsCache();
  const { toast } = useToast();

  // Aggregated stats from cache
  const aggregated = useMemo(() => {
    const items = cachedConversations || [];
    const total = items.length;
    const withAnalysis = items.filter(i => i.analysis).length;
    const totalDuration = items.reduce((s, i) => s + (i.duration_seconds || 0), 0);
    const totalCost = items.reduce((s, i) => s + (i.cost_credits || 0), 0);
    return { total, withAnalysis, totalDuration, totalCost };
  }, [cachedConversations]);

  // Auto-refresh recent conversations when call history changes
  useEffect(() => {
    if (callHistory.length > 0) {
      autoRefreshRecentConversations(callHistory);
    }
  }, [callHistory.length, autoRefreshRecentConversations]);

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedConversationId(null);
  };

  const handleManualRefresh = async () => {
    try {
      const result = await refreshAllConversations.mutateAsync(callHistory);
      toast({
        title: "Actualizare completă",
        description: `${result.successCount}/${result.totalCount} conversații au fost actualizate cu succes`
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare la actualizarea conversațiilor",
        variant: "destructive"
      });
    }
  };

  const handleRefreshSingle = async (conversationId: string) => {
    try {
      await refreshConversation.mutateAsync(conversationId);
      toast({
        title: "Conversație actualizată",
        description: "Datele conversației au fost actualizate cu succes"
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza conversația",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiat",
      description: "Conversation ID a fost copiat în clipboard"
    });
  };

  const filteredCalls = callHistory.filter(call => {
    const matchesSearch = call.phone_number.includes(searchTerm) || 
      call.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.summary && call.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.conversation_id && call.conversation_id.includes(searchTerm);
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

  const formatLastUpdated = (lastUpdated: string | null) => {
    if (!lastUpdated) return 'Nu este actualizat';
    const now = new Date();
    const updated = new Date(lastUpdated);
    const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Acum';
    if (diffMinutes < 60) return `${diffMinutes}m în urmă`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h în urmă`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d în urmă`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Se încarcă istoricul conversațiilor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-3 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Analytics Conversații</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleManualRefresh}
            disabled={refreshAllConversations.isPending}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshAllConversations.isPending ? 'animate-spin' : ''}`} />
            Actualizează toate
          </Button>
        </div>
      </div>

      {/* Aggregated Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Conversații în cache</div>
              <div className="text-sm font-semibold">{aggregated.total}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Cu analiză</div>
            <div className="text-sm font-semibold">{aggregated.withAnalysis}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Durată totală</div>
            <div className="text-sm font-semibold">{Math.floor(aggregated.totalDuration/60)}m</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Cost total (credite)</div>
            <div className="text-sm font-semibold">{aggregated.totalCost}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Responsive Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 py-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg px-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            type="text" 
            placeholder="Caută..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-10 h-9 text-sm bg-white border-0" 
          />
        </div>

        {/* Date Range - Stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Input 
            type="date" 
            value={dateAfter} 
            onChange={e => setDateAfter(e.target.value)} 
            className="h-9 w-full sm:w-36 text-sm bg-white border-0" 
            placeholder="De la" 
          />
          <span className="text-muted-foreground text-sm text-center sm:text-left">până la</span>
          <Input 
            type="date" 
            value={dateBefore} 
            onChange={e => setDateBefore(e.target.value)} 
            className="h-9 w-full sm:w-36 text-sm bg-white border-0" 
            placeholder="Până la" 
          />
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
              {getUniqueAgents().map(agentName => (
                <SelectItem key={agentName} value={agentName}>
                  {agentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        {(searchTerm || statusFilter !== 'all' || selectedAgent !== 'all' || dateAfter || dateBefore) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSelectedAgent('all');
              setDateAfter('');
              setDateBefore('');
            }} 
            className="h-9 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Button>
        )}
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
            ) : filteredCalls.map(call => {
              const conversationData = call.conversation_id ? getConversationData(call.conversation_id) : null;
              return (
                <div 
                  key={call.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" 
                  onClick={() => call.conversation_id && handleConversationClick(call.conversation_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm">
                      <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                      {call.phone_number}
                    </div>
                    <div className={getStatusStyle(call.call_status)}>
                      {call.call_status === 'done' ? '✓ Done' : 
                       call.call_status === 'initiated' ? '⚡ Initiated' : 
                       call.call_status === 'busy' ? '⏳ Busy' : 
                       call.call_status === 'failed' ? '✕ Error' : 
                       call.call_status === 'success' ? '✓ Success' : '? Unknown'}
                    </div>
                  </div>
                  <div className="text-sm font-medium mb-1">
                    {call.contact_name || 'Necunoscut'}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Agent: {call.agent_name || 'Agent necunoscut'}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Cost: {formatCost(conversationData?.cost || 0)}</span>
                    <span>Durată: {formatDuration(conversationData?.duration || call.duration_seconds || 0)}</span>
                  </div>
                  {conversationData?.isCached && (
                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Cache: {formatLastUpdated(conversationData.lastUpdated)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Agent</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cost</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Durată</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cache</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      Nu sunt conversații disponibile
                    </td>
                  </tr>
                ) : filteredCalls.map(call => {
                  const conversationData = call.conversation_id ? getConversationData(call.conversation_id) : null;
                  return (
                    <tr 
                      key={call.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:z-10 relative" 
                      onClick={() => call.conversation_id && handleConversationClick(call.conversation_id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{call.contact_name || 'Necunoscut'}</div>
                            <div className="text-muted-foreground text-xs">{call.phone_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {call.agent_name || 'Agent necunoscut'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">
                          {formatCost(conversationData?.cost || 0)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">
                          {formatDuration(conversationData?.duration || call.duration_seconds || 0)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={getStatusStyle(call.call_status)}>
                          {call.call_status === 'done' ? '✓ Done' : 
                           call.call_status === 'initiated' ? '⚡ Initiated' : 
                           call.call_status === 'busy' ? '⏳ Busy' : 
                           call.call_status === 'failed' ? '✕ Error' : 
                           call.call_status === 'success' ? '✓ Success' : '? Unknown'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center">
                          {conversationData?.isCached ? (
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {call.conversation_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRefreshSingle(call.conversation_id!);
                              }}
                              disabled={refreshConversation.isPending}
                              className="h-6 px-2"
                            >
                              <RefreshCw className={`w-3 h-3 ${refreshConversation.isPending ? 'animate-spin' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredCalls.length > 0 && (
            <div className="px-3 sm:px-6 py-4 text-sm text-gray-500">
              Afișând {filteredCalls.length} din {callHistory.length} conversații
            </div>
          )}
        </div>
      </div>
      
      {/* Conversation Detail Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="right" className="w-[50vw] max-w-[50vw] min-w-[50vw] p-0">
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
    </div>
  );
};

export default ConversationAnalytics;