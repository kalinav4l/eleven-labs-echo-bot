import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { ScrapingHistory } from '@/components/scraping/ScrapingHistory';
import { useScrapingHistory } from '@/hooks/useScrapingHistory';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, 
  Search, 
  Download, 
  FileText, 
  Loader2, 
  History,
  Play,
  Square,
  Settings,
  BarChart3
} from 'lucide-react';

interface ScrapingProgress {
  pagesProcessed: number;
  results: number;
  errors: number;
  totalProducts: number;
  currentUrl: string;
  isComplete: boolean;
  isRunning: boolean;
}

const Scraping = () => {
  const [url, setUrl] = useState('');
  const [deepScan, setDeepScan] = useState(true);
  const [unlimitedScan, setUnlimitedScan] = useState(false);
  const [maxPages, setMaxPages] = useState(300);
  const [parallelThreads, setParallelThreads] = useState(5);
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [progress, setProgress] = useState<ScrapingProgress>({
    pagesProcessed: 0,
    results: 0,
    errors: 0,
    totalProducts: 0,
    currentUrl: '',
    isComplete: false,
    isRunning: false
  });
  
  const { saveScrapingSession } = useScrapingHistory();

  // Simulate scraping progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScrapingRunning) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newPagesProcessed = prev.pagesProcessed + Math.floor(Math.random() * 10) + 1;
          const newResults = prev.results + Math.floor(Math.random() * 8) + 1;
          const newErrors = prev.errors + (Math.random() > 0.9 ? 1 : 0);
          const newTotalProducts = prev.totalProducts + Math.floor(Math.random() * 50) + 10;
          
          // Check if we should stop
          const shouldComplete = newPagesProcessed >= maxPages || (unlimitedScan && newPagesProcessed > 9000);
          
          if (shouldComplete) {
            setIsScrapingRunning(false);
            toast({
              title: "Scraping complet!",
              description: `Procesul s-a încheiat cu succes: ${newResults} rezultate, ${newTotalProducts} produse găsite.`,
            });
          }
          
          return {
            pagesProcessed: newPagesProcessed,
            results: newResults,
            errors: newErrors,
            totalProducts: newTotalProducts,
            currentUrl: `${url}/page-${newPagesProcessed}`,
            isComplete: shouldComplete,
            isRunning: !shouldComplete
          };
        });
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScrapingRunning, maxPages, unlimitedScan, url]);

  const handleStartScraping = () => {
    if (!url.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog să introduci o URL validă",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingRunning(true);
    setProgress({
      pagesProcessed: 0,
      results: 0,
      errors: 0,
      totalProducts: 0,
      currentUrl: url,
      isComplete: false,
      isRunning: true
    });

    toast({
      title: "Scraping început",
      description: "Procesul de extragere a datelor a fost inițiat.",
    });
  };

  const handleStopScraping = () => {
    setIsScrapingRunning(false);
    setProgress(prev => ({ ...prev, isRunning: false }));
    toast({
      title: "Scraping oprit",
      description: "Procesul a fost oprit de utilizator.",
    });
  };

  const handleSaveSession = () => {
    if (progress.totalProducts > 0) {
      saveScrapingSession({
        url,
        title: `Scraping ${new URL(url).hostname}`,
        description: `Scanare ${deepScan ? 'profundă' : 'superficială'} cu ${progress.totalProducts} produse`,
        scraping_data: {
          pagesProcessed: progress.pagesProcessed,
          results: progress.results,
          errors: progress.errors,
          totalProducts: progress.totalProducts,
          settings: {
            deepScan,
            unlimitedScan,
            maxPages,
            parallelThreads
          }
        },
        scraping_type: unlimitedScan ? 'full_site' : 'single',
        total_products: progress.totalProducts,
        total_images: Math.floor(progress.totalProducts * 0.8),
        total_links: progress.results
      });
    }
  };

  const exportData = (format: string) => {
    const data = {
      url,
      progress,
      settings: { deepScan, unlimitedScan, maxPages, parallelThreads },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `scraping-data.${format}`;
    a.click();
    URL.revokeObjectURL(downloadUrl);

    toast({
      title: "Export reușit",
      description: `Datele au fost exportate în format ${format.toUpperCase()}.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Web Scraper Universal</h1>
              <p className="text-muted-foreground">Instrument profesional pentru extragerea datelor web</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Istoric
          </Button>
        </div>

        {/* Main Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Extragere Date Website
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Website</label>
              <Input
                placeholder="www.materialeelectrice.ro"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScrapingRunning}
                className="text-base"
              />
            </div>

            {/* Scanning Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="deep-scan" 
                  checked={deepScan}
                  onCheckedChange={(checked) => setDeepScan(!!checked)}
                  disabled={isScrapingRunning}
                />
                <label htmlFor="deep-scan" className="text-sm font-medium">
                  Scanare profundă (extrage descrieri din paginile produselor)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="unlimited-scan" 
                  checked={unlimitedScan}
                  onCheckedChange={(checked) => setUnlimitedScan(!!checked)}
                  disabled={isScrapingRunning}
                />
                <label htmlFor="unlimited-scan" className="text-sm font-medium">
                  Scanare nelimitată (continuă până extrage tot - poate dura mult)
                </label>
              </div>
            </div>

            {/* Processing Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Procesare paralel:</label>
                <div className="flex items-center gap-2">
                  <Select value={maxPages.toString()} onValueChange={(value) => setMaxPages(parseInt(value))}>
                    <SelectTrigger disabled={isScrapingRunning}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 pag</SelectItem>
                      <SelectItem value="100">100 pag</SelectItem>
                      <SelectItem value="300">300 pag</SelectItem>
                      <SelectItem value="500">500 pag</SelectItem>
                      <SelectItem value="1000">1000 pag</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">simultan</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Adâncime:</label>
                <Select value={parallelThreads.toString()} onValueChange={(value) => setParallelThreads(parseInt(value))}>
                  <SelectTrigger disabled={isScrapingRunning}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Acțiuni:</label>
                <Button 
                  onClick={() => setShowHistory(true)}
                  variant="outline"
                  disabled={isScrapingRunning}
                  className="w-full"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Scanare Paralel
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isScrapingRunning ? (
                <Button 
                  onClick={handleStartScraping}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Play className="w-4 h-4" />
                  Extrage Date
                </Button>
              ) : (
                <Button 
                  onClick={handleStopScraping}
                  variant="destructive"
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Square className="w-4 h-4" />
                  Oprește
                </Button>
              )}
              
              {progress.totalProducts > 0 && (
                <Button 
                  onClick={handleSaveSession}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Salvează Sesiune
                </Button>
              )}
            </div>

            {/* Status */}
            {progress.currentUrl && (
              <div className="text-sm text-muted-foreground">
                <strong>Status:</strong> {progress.currentUrl}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Section */}
        {(isScrapingRunning || progress.pagesProcessed > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Scraping Complet Site - Progres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{progress.pagesProcessed}</div>
                  <div className="text-sm text-muted-foreground">Pagini procesate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{progress.results}</div>
                  <div className="text-sm text-muted-foreground">Rezultate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{progress.errors}</div>
                  <div className="text-sm text-muted-foreground">Erori</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{progress.totalProducts}</div>
                  <div className="text-sm text-muted-foreground">Total produse</div>
                </div>
              </div>

              {/* Progress Bar */}
              {isScrapingRunning && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progres: {Math.round((progress.pagesProcessed / maxPages) * 100)}%</span>
                    <span>{progress.pagesProcessed} / {unlimitedScan ? '∞' : maxPages}</span>
                  </div>
                  <Progress 
                    value={unlimitedScan ? 50 : (progress.pagesProcessed / maxPages) * 100} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Export Buttons */}
              {progress.isComplete && progress.totalProducts > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => exportData('json')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Site Map JSON
                  </Button>
                  <Button
                    onClick={() => exportData('csv')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Produse CSV
                  </Button>
                  <Button
                    onClick={() => exportData('txt')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Produse TXT
                  </Button>
                  <Button
                    onClick={() => exportData('xls')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Produse XLS
                  </Button>
                  <Button
                    onClick={() => exportData('xml')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Produse XML
                  </Button>
                  <Button
                    onClick={() => exportData('jsonl')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Produse JSONL
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold">Istoric Scraping</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                <ScrapingHistory 
                  onLoadSession={(session) => {
                    setUrl(session.url);
                    setShowHistory(false);
                    toast({
                      title: "Sesiune încărcată",
                      description: "Datele din istoric au fost încărcate cu succes.",
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scraping;