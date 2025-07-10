import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { ScrapingHistory } from '@/components/scraping/ScrapingHistory';
import { useScrapingHistory } from '@/hooks/useScrapingHistory';
import { 
  Globe, 
  Search, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  ShoppingCart, 
  ExternalLink, 
  Loader2, 
  AlertTriangle,
  History,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';

interface ScrapedProduct {
  name: string;
  price: string;
  description?: string;
  image?: string;
  url?: string;
  category?: string;
}

interface ScrapedData {
  title: string;
  description: string;
  images: string[];
  links: string[];
  products: ScrapedProduct[];
  content: string;
}

interface SiteMapPage {
  url: string;
  title: string;
  status: 'pending' | 'success' | 'error';
  products: ScrapedProduct[];
  error?: string;
}

interface SiteMap {
  baseUrl: string;
  pages: SiteMapPage[];
  scrapedPages: number;
  errorPages: number;
  isComplete: boolean;
}

const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundScraping, setIsBackgroundScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [siteMap, setSiteMap] = useState<SiteMap | null>(null);
  const [scrapingType, setScrapingType] = useState<'single' | 'sitemap'>('single');
  const [maxPages, setMaxPages] = useState(10);
  const [isScrapingComplete, setIsScrapingComplete] = useState(false);
  const [backgroundProgress, setBackgroundProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const { saveScrapingSession } = useScrapingHistory();

  // Background scraping monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBackgroundScraping && siteMap) {
        const progress = (siteMap.scrapedPages + siteMap.errorPages) / siteMap.pages.length * 100;
        setBackgroundProgress(progress);
        
        if (progress >= 100) {
          setIsBackgroundScraping(false);
          setIsScrapingComplete(true);
          toast({
            title: "Scraping complet!",
            description: `Site-ul a fost procesat complet: ${siteMap.scrapedPages} pagini reușite, ${siteMap.errorPages} erori.`,
          });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isBackgroundScraping, siteMap]);

  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog să introduci o URL validă",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSiteMap(null);
    setScrapedData(null);
    setIsScrapingComplete(false);

    try {
      if (scrapingType === 'single') {
        await handleSinglePageScrape();
      } else {
        await handleSiteMapScrape();
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Eroare la scraping",
        description: "A apărut o eroare în timpul procesului de scraping.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSinglePageScrape = async () => {
    const mockData: ScrapedData = {
      title: "Pagină Test",
      description: "Descrierea paginii test",
      images: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      links: [
        "https://example.com/link1",
        "https://example.com/link2"
      ],
      products: [
        {
          name: "Produs Test 1",
          price: "99.99 RON",
          description: "Descrierea produsului test",
          image: "https://example.com/product1.jpg",
          url: "https://example.com/product1"
        },
        {
          name: "Produs Test 2", 
          price: "149.99 RON",
          description: "Alt produs test",
          image: "https://example.com/product2.jpg",
          url: "https://example.com/product2"
        }
      ],
      content: "Conținutul paginii..."
    };

    await new Promise(resolve => setTimeout(resolve, 2000));
    setScrapedData(mockData);
    
    saveScrapingSession({
      url,
      title: mockData.title,
      scraping_data: mockData,
      scraping_type: 'single',
      total_products: mockData.products.length,
      total_images: mockData.images.length,
      total_links: mockData.links.length
    });
  };

  const handleSiteMapScrape = async () => {
    const mockSiteMap: SiteMap = {
      baseUrl: url,
      pages: [
        { url: `${url}/page1`, title: "Pagina 1", status: 'pending', products: [] },
        { url: `${url}/page2`, title: "Pagina 2", status: 'pending', products: [] },
        { url: `${url}/page3`, title: "Pagina 3", status: 'pending', products: [] }
      ],
      scrapedPages: 0,
      errorPages: 0,
      isComplete: false
    };

    setSiteMap(mockSiteMap);
    setIsBackgroundScraping(true);
    
    toast({
      title: "Scraping în fundal pornit",
      description: "Procesul rulează în background. Poți ieși de pe pagină.",
    });
  };

  const stopBackgroundScraping = () => {
    setIsBackgroundScraping(false);
    toast({
      title: "Scraping oprit",
      description: "Procesul de scraping a fost oprit.",
    });
  };

  const restartScraping = () => {
    if (siteMap) {
      setIsBackgroundScraping(true);
      setIsScrapingComplete(false);
      toast({
        title: "Scraping restartat",
        description: "Procesul continuă din punctul în care a fost oprit.",
      });
    }
  };

  const exportToJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraped-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (products: ScrapedProduct[]) => {
    const headers = ['Nume', 'Preț', 'Descriere', 'URL', 'Categorie'];
    const rows = products.map(p => [
      p.name || '',
      p.price || '',
      p.description || '',
      p.url || '',
      p.category || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
      
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Scraping Web</h1>
            <p className="text-muted-foreground">Extrage date din site-uri web</p>
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

        {/* Background scraping status */}
        {isBackgroundScraping && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Scraping în desfășurare</p>
                    <p className="text-sm text-blue-700">Procesul rulează în background</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-900">{Math.round(backgroundProgress)}%</p>
                    <Progress value={backgroundProgress} className="w-32" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={stopBackgroundScraping}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Oprește
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main scraping form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurare Scraping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Site</label>
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading || isBackgroundScraping}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tip Scraping</label>
                <Tabs value={scrapingType} onValueChange={(value: any) => setScrapingType(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">O pagină</TabsTrigger>
                    <TabsTrigger value="sitemap">Site complet</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {scrapingType === 'sitemap' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Număr maxim de pagini</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value) || 10)}
                  disabled={isLoading || isBackgroundScraping}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleScrape} 
                disabled={isLoading || isBackgroundScraping}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isLoading ? 'Se procesează...' : 'Începe Scraping'}
              </Button>
              
              {isScrapingComplete && !isBackgroundScraping && siteMap && (
                <Button 
                  variant="outline" 
                  onClick={restartScraping}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Continuă Scraping
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results for single page */}
        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle>Rezultate Scraping</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="products">
                <TabsList>
                  <TabsTrigger value="products">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Produse ({scrapedData.products.length})
                  </TabsTrigger>
                  <TabsTrigger value="images">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagini ({scrapedData.images.length})
                  </TabsTrigger>
                  <TabsTrigger value="links">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link-uri ({scrapedData.links.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={() => exportToJSON(scrapedData.products)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      onClick={() => exportToCSV(scrapedData.products)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {scrapedData.products.map((product, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.description || 'Fără descriere'}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">{product.price}</Badge>
                              {product.url && (
                                <a 
                                  href={product.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Vezi produs
                                </a>
                              )}
                            </div>
                          </div>
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="images">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scrapedData.images.map((image, index) => (
                      <div key={index} className="border rounded p-2">
                        <img 
                          src={image} 
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {image}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="links">
                  <div className="space-y-2">
                    {scrapedData.links.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm truncate flex-1">{link}</span>
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Results for site map */}
        {siteMap && (
          <Card>
            <CardHeader>
              <CardTitle>Progres Scraping Site Complet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{siteMap.pages.length}</p>
                    <p className="text-sm text-muted-foreground">Pagini total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{siteMap.scrapedPages}</p>
                    <p className="text-sm text-muted-foreground">Reușite</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{siteMap.errorPages}</p>
                    <p className="text-sm text-muted-foreground">Erori</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {siteMap.pages.reduce((sum, page) => sum + page.products.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total produse</p>
                  </div>
                </div>

                {isScrapingComplete && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => exportToJSON(siteMap)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button
                      onClick={() => exportToCSV(siteMap.pages.flatMap(page => page.products))}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History modal */}
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
                    setScrapedData(session.scraping_data);
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