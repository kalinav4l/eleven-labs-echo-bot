import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useScrapingHistory, ScrapingHistoryEntry } from '@/hooks/useScrapingHistory';
import { Download, Trash2, Eye, Search, Globe, Package, Image, Link, MoreVertical, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ScrapingHistoryProps {
  onLoadSession?: (session: ScrapingHistoryEntry) => void;
}

export const ScrapingHistory: React.FC<ScrapingHistoryProps> = ({ onLoadSession }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<ScrapingHistoryEntry | null>(null);
  
  const {
    scrapingHistory,
    isLoading,
    isDeleting,
    deleteScrapingSession,
    exportToJSON,
    exportToCSV,
    formatDate,
  } = useScrapingHistory();

  const filteredHistory = scrapingHistory.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (session: ScrapingHistoryEntry, format: 'json' | 'csv') => {
    switch (format) {
      case 'json':
        exportToJSON(session.scraping_data, session.title);
        break;
      case 'csv':
        const products = session.scraping_data?.products || [];
        exportToCSV(products, session.title);
        break;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'single':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'full_site':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'in_progress':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Istoric Scraping</h2>
          <p className="text-muted-foreground">
            Sesiunile tale de scraping salvate ({scrapingHistory.length})
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Caută după titlu sau URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* History List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Niciun istoric găsit</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Nu există sesiuni care să corespundă termenului de căutare."
                  : "Nu ai încă sesiuni de scraping salvate."}
              </p>
            </Card>
          ) : (
            filteredHistory.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">
                            {session.title}
                          </h3>
                          <p className="text-sm text-muted-foreground break-all">
                            {session.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={getTypeColor(session.scraping_type)}>
                            {session.scraping_type === 'single' ? 'Pagină unică' : 'Site complet'}
                          </Badge>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status === 'completed' ? 'Completat' : 
                             session.status === 'error' ? 'Eroare' : 'În progres'}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      {session.description && (
                        <p className="text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{session.total_products}</span>
                          <span className="text-muted-foreground">produse</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Image className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{session.total_images}</span>
                          <span className="text-muted-foreground">imagini</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{session.total_links}</span>
                          <span className="text-muted-foreground">link-uri</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(session.created_at)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {onLoadSession && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onLoadSession(session)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Încarcă
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-1" />
                                Export
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => handleExport(session, 'json')}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Export JSON
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleExport(session, 'csv')}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Export CSV
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isDeleting === session.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ești sigur că vrei să ștergi această sesiune de scraping? 
                                  Această acțiune nu poate fi anulată.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anulează</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteScrapingSession(session.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Șterge
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};