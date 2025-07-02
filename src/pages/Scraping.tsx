
import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Download, Play, Pause, Square, FileJson, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ScrapedProduct {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: string;
  description: string;
  images: string[];
  details: Record<string, any>;
  url: string;
  availability: string;
}

interface ScrapingSession {
  id: string;
  url: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  totalUrls: number;
  scrapedUrls: number;
  products: ScrapedProduct[];
  startTime?: Date;
  endTime?: Date;
  errors: string[];
}

const Scraping = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ScrapingSession[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [scrapingMode, setScrapingMode] = useState<'single' | 'complete'>('complete');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [scrapingSettings, setScrapingSettings] = useState({
    maxDepth: 5,
    delay: 1000,
    respectRobots: true,
    extractImages: true,
    extractPrices: true,
    extractCategories: true,
    customSelectors: ''
  });

  const workerRef = useRef<Worker | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const createNewSession = (): ScrapingSession => {
    return {
      id: Date.now().toString(),
      url: currentUrl,
      status: 'idle',
      progress: 0,
      totalUrls: 0,
      scrapedUrls: 0,
      products: [],
      errors: []
    };
  };

  const startScraping = async () => {
    if (!currentUrl.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un URL valid",
        variant: "destructive"
      });
      return;
    }

    const session = createNewSession();
    setSessions(prev => [session, ...prev]);
    setActiveSessionId(session.id);

    // Simulăm procesul de scraping cu Web Workers pentru performanță
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Creăm un Web Worker pentru scraping
    const workerCode = `
      class WebScraper {
        constructor() {
          this.scrapedUrls = new Set();
          this.urlsToScrape = [];
          this.products = [];
          this.errors = [];
        }

        async scrapeUrl(url, settings) {
          try {
            // Simulăm request-ul HTTP
            const response = await this.fetchWithTimeout(url, 10000);
            const html = await response.text();
            
            // Parsăm HTML-ul și extragem datele
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extragem linkurile pentru scraping complet
            if (settings.mode === 'complete') {
              const links = this.extractLinks(doc, url);
              links.forEach(link => {
                if (!this.scrapedUrls.has(link) && this.shouldScrapeUrl(link, url)) {
                  this.urlsToScrape.push(link);
                }
              });
            }

            // Extragem produsele
            const products = this.extractProducts(doc, url, settings);
            this.products.push(...products);

            this.scrapedUrls.add(url);
            
            return {
              success: true,
              products,
              newUrls: this.urlsToScrape.length
            };

          } catch (error) {
            this.errors.push(\`Error scraping \${url}: \${error.message}\`);
            return { success: false, error: error.message };
          }
        }

        extractProducts(doc, baseUrl, settings) {
          const products = [];
          
          // Detectează produsele folosind multiple strategii
          const productSelectors = [
            '[data-product]',
            '.product',
            '.item',
            '[itemtype*="Product"]',
            '.product-item',
            '.product-card'
          ];

          let productElements = [];
          for (const selector of productSelectors) {
            const elements = doc.querySelectorAll(selector);
            if (elements.length > 0) {
              productElements = Array.from(elements);
              break;
            }
          }

          // Dacă nu găsim produse cu selectorii comuni, căutăm structural
          if (productElements.length === 0) {
            productElements = this.findProductsStructurally(doc);
          }

          productElements.forEach((element, index) => {
            try {
              const product = this.extractProductData(element, baseUrl, settings, index);
              if (product && product.name) {
                products.push(product);
              }
            } catch (error) {
              console.warn('Error extracting product:', error);
            }
          });

          return products;
        }

        extractProductData(element, baseUrl, settings, index) {
          const product = {
            id: \`\${baseUrl}-product-\${index}\`,
            name: this.extractProductName(element),
            category: this.extractCategory(element),
            subcategory: this.extractSubcategory(element),
            price: settings.extractPrices ? this.extractPrice(element) : '',
            description: this.extractDescription(element),
            images: settings.extractImages ? this.extractImages(element, baseUrl) : [],
            details: this.extractDetails(element),
            url: baseUrl,
            availability: this.extractAvailability(element)
          };

          return product;
        }

        extractProductName(element) {
          const nameSelectors = [
            'h1', 'h2', 'h3',
            '.product-name', '.product-title', '.name', '.title',
            '[data-name]', '[data-title]',
            'a[title]'
          ];

          for (const selector of nameSelectors) {
            const nameEl = element.querySelector(selector);
            if (nameEl) {
              const text = nameEl.textContent?.trim() || nameEl.getAttribute('title')?.trim();
              if (text && text.length > 2) return text;
            }
          }

          return 'Produs necunoscut';
        }

        extractPrice(element) {
          const priceSelectors = [
            '.price', '.cost', '.amount',
            '[data-price]', '[data-cost]',
            '.price-current', '.price-now',
            '.sale-price', '.regular-price'
          ];

          const pricePatterns = [
            /[\$€£¥₽]\s*[\d,.]+ /g,
            /[\d,.]+ \s*(?:lei|ron|eur|usd|gbp)/gi,
            /[\d,.]+ \s*(?:₽|€|\$|£)/g
          ];

          for (const selector of priceSelectors) {
            const priceEl = element.querySelector(selector);
            if (priceEl) {
              const text = priceEl.textContent?.trim();
              if (text) {
                for (const pattern of pricePatterns) {
                  const match = text.match(pattern);
                  if (match) return match[0].trim();
                }
                // Fallback pentru orice număr cu simboluri monetare
                const numMatch = text.match(/[\d,.]+ /);
                if (numMatch) return text.trim();
              }
            }
          }

          return '';
        }

        extractDescription(element) {
          const descSelectors = [
            '.description', '.product-description', '.summary',
            '.details', '.product-details', '.info', '.product-info',
            'p', '.content'
          ];

          let descriptions = [];
          for (const selector of descSelectors) {
            const descEls = element.querySelectorAll(selector);
            descEls.forEach(el => {
              const text = el.textContent?.trim();
              if (text && text.length > 20 && text.length < 1000) {
                descriptions.push(text);
              }
            });
          }

          return descriptions.join(' ').substring(0, 500);
        }

        extractImages(element, baseUrl) {
          const images = [];
          const imgElements = element.querySelectorAll('img');
          
          imgElements.forEach(img => {
            let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy');
            if (src) {
              if (src.startsWith('/')) {
                src = new URL(src, baseUrl).href;
              }
              if (src.includes('product') || src.includes('item') || !src.includes('icon')) {
                images.push(src);
              }
            }
          });

          return [...new Set(images)]; // Remove duplicates
        }

        extractDetails(element) {
          const details = {};
          
          // Caută tabele cu specificații
          const tables = element.querySelectorAll('table');
          tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              const cells = row.querySelectorAll('td, th');
              if (cells.length === 2) {
                const key = cells[0].textContent?.trim();
                const value = cells[1].textContent?.trim();
                if (key && value) {
                  details[key] = value;
                }
              }
            });
          });

          // Caută liste cu specificații
          const specLists = element.querySelectorAll('.specs li, .specifications li, .details li');
          specLists.forEach(item => {
            const text = item.textContent?.trim();
            if (text && text.includes(':')) {
              const [key, ...valueParts] = text.split(':');
              details[key.trim()] = valueParts.join(':').trim();
            }
          });

          return details;
        }

        extractCategory(element) {
          const breadcrumbs = element.querySelectorAll('.breadcrumb a, .breadcrumbs a, nav a');
          const categories = [];
          
          breadcrumbs.forEach(link => {
            const text = link.textContent?.trim();
            if (text && text !== 'Home' && text !== 'Acasă') {
              categories.push(text);
            }
          });

          return categories.length > 0 ? categories[0] : 'General';
        }

        extractSubcategory(element) {
          const breadcrumbs = element.querySelectorAll('.breadcrumb a, .breadcrumbs a, nav a');
          const categories = [];
          
          breadcrumbs.forEach(link => {
            const text = link.textContent?.trim();
            if (text && text !== 'Home' && text !== 'Acasă') {
              categories.push(text);
            }
          });

          return categories.length > 1 ? categories[1] : '';
        }

        extractAvailability(element) {
          const availSelectors = [
            '.availability', '.stock', '.in-stock', '.out-of-stock',
            '[data-stock]', '[data-availability]'
          ];

          for (const selector of availSelectors) {
            const availEl = element.querySelector(selector);
            if (availEl) {
              const text = availEl.textContent?.trim().toLowerCase();
              if (text.includes('în stoc') || text.includes('disponibil') || text.includes('in stock')) {
                return 'În stoc';
              } else if (text.includes('indisponibil') || text.includes('out of stock')) {
                return 'Indisponibil';
              }
            }
          }

          return 'Necunoscut';
        }

        extractLinks(doc, baseUrl) {
          const links = new Set();
          const linkElements = doc.querySelectorAll('a[href]');
          
          linkElements.forEach(link => {
            let href = link.getAttribute('href');
            if (href) {
              if (href.startsWith('/')) {
                href = new URL(href, baseUrl).href;
              } else if (!href.startsWith('http')) {
                href = new URL(href, baseUrl).href;
              }
              
              if (this.shouldScrapeUrl(href, baseUrl)) {
                links.add(href);
              }
            }
          });

          return Array.from(links);
        }

        shouldScrapeUrl(url, baseUrl) {
          try {
            const urlObj = new URL(url);
            const baseUrlObj = new URL(baseUrl);
            
            // Doar linkuri de pe același domeniu
            if (urlObj.hostname !== baseUrlObj.hostname) return false;
            
            // Evită anumite tipuri de fișiere
            const excludeExtensions = ['.jpg', '.png', '.gif', '.pdf', '.zip', '.rar'];
            if (excludeExtensions.some(ext => url.toLowerCase().includes(ext))) return false;
            
            // Evită linkuri de navigare comune
            const excludePatterns = ['#', 'javascript:', 'mailto:', 'tel:', '/search', '/login', '/register'];
            if (excludePatterns.some(pattern => url.includes(pattern))) return false;
            
            return true;
          } catch {
            return false;
          }
        }

        async fetchWithTimeout(url, timeout) {
          return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
              reject(new Error('Request timeout'));
            }, timeout);

            fetch(url, { 
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            })
            .then(response => {
              clearTimeout(timeoutId);
              resolve(response);
            })
            .catch(error => {
              clearTimeout(timeoutId);
              reject(error);
            });
          });
        }

        findProductsStructurally(doc) {
          // Încearcă să găsească produsele bazat pe structura repetitivă
          const containers = doc.querySelectorAll('div, article, section');
          const potentialProducts = [];

          containers.forEach(container => {
            const hasPrice = container.querySelector('[class*="price"], [class*="cost"]');
            const hasTitle = container.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
            const hasImage = container.querySelector('img');

            if ((hasPrice || hasTitle) && container.textContent.trim().length > 50) {
              potentialProducts.push(container);
            }
          });

          return potentialProducts.slice(0, 50); // Limitez la 50 pentru performanță
        }
      }

      // Logica principală a worker-ului
      const scraper = new WebScraper();

      self.onmessage = async function(e) {
        const { url, settings } = e.data;
        
        try {
          self.postMessage({ type: 'status', status: 'started' });
          
          // Adaugă URL-ul inițial
          scraper.urlsToScrape.push(url);
          let processedCount = 0;
          
          while (scraper.urlsToScrape.length > 0 && processedCount < settings.maxDepth * 10) {
            const currentUrl = scraper.urlsToScrape.shift();
            
            if (scraper.scrapedUrls.has(currentUrl)) continue;
            
            self.postMessage({ 
              type: 'progress', 
              progress: Math.min((processedCount / (settings.maxDepth * 10)) * 100, 90),
              currentUrl,
              totalUrls: scraper.urlsToScrape.length + processedCount,
              scrapedUrls: processedCount
            });

            const result = await scraper.scrapeUrl(currentUrl, settings);
            
            if (result.success && result.products.length > 0) {
              self.postMessage({
                type: 'products',
                products: result.products
              });
            }

            processedCount++;
            
            // Delay între requests
            if (settings.delay > 0) {
              await new Promise(resolve => setTimeout(resolve, settings.delay));
            }
          }
          
          self.postMessage({ 
            type: 'completed', 
            totalProducts: scraper.products.length,
            errors: scraper.errors
          });
          
        } catch (error) {
          self.postMessage({ 
            type: 'error', 
            error: error.message 
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (e) => {
      const { type, ...data } = e.data;
      
      setSessions(prev => prev.map(s => {
        if (s.id === session.id) {
          switch (type) {
            case 'status':
              return { ...s, status: data.status === 'started' ? 'running' : s.status, startTime: new Date() };
            case 'progress':
              return { 
                ...s, 
                progress: data.progress, 
                totalUrls: data.totalUrls,
                scrapedUrls: data.scrapedUrls
              };
            case 'products':
              return { ...s, products: [...s.products, ...data.products] };
            case 'completed':
              return { 
                ...s, 
                status: 'completed', 
                progress: 100, 
                endTime: new Date(),
                errors: [...s.errors, ...data.errors]
              };
            case 'error':
              return { ...s, status: 'error', errors: [...s.errors, data.error] };
            default:
              return s;
          }
        }
        return s;
      }));
    };

    // Începe scraping-ul
    workerRef.current.postMessage({
      url: currentUrl,
      settings: {
        ...scrapingSettings,
        mode: scrapingMode
      }
    });

    toast({
      title: "Scraping pornit",
      description: `A început extracția datelor de pe ${currentUrl}`,
    });
  };

  const pauseScraping = () => {
    if (workerRef.current && activeSessionId) {
      workerRef.current.terminate();
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, status: 'paused' } : s
      ));
      setActiveSessionId(null);
    }
  };

  const stopScraping = () => {
    if (workerRef.current && activeSessionId) {
      workerRef.current.terminate();
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, status: 'completed', endTime: new Date() } : s
      ));
      setActiveSessionId(null);
    }
  };

  const exportData = (session: ScrapingSession, format: 'json' | 'csv') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(session.products, null, 2);
      filename = `scraping-${session.id}.json`;
      mimeType = 'application/json';
    } else {
      const headers = ['Nume', 'Categorie', 'Subcategorie', 'Preț', 'Descriere', 'Disponibilitate', 'URL', 'Imagini'];
      const rows = session.products.map(product => [
        product.name,
        product.category,
        product.subcategory || '',
        product.price,
        product.description,
        product.availability,
        product.url,
        product.images.join(';')
      ]);
      
      content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename = `scraping-${session.id}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export realizat",
      description: `Datele au fost exportate în ${filename}`,
    });
  };

  const getStatusIcon = (status: ScrapingSession['status']) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Web Scraping Universal</h1>
            <p className="text-muted-foreground">Extrage o pagină sau întregul site cu toate detaliile și linkurile</p>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Globe className="w-4 h-4 mr-2" />
            COMPLET
          </Badge>
        </div>

        {/* Configurare Scraping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Configurare Scraping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Site</label>
                <Input
                  placeholder="https://bicomplex.md/ro/"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mod de Scraping</label>
                <Tabs value={scrapingMode} onValueChange={(value: any) => setScrapingMode(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">O pagină</TabsTrigger>
                    <TabsTrigger value="complete">Site complet</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adâncime max</label>
                <Input
                  type="number"
                  value={scrapingSettings.maxDepth}
                  onChange={(e) => setScrapingSettings(prev => ({ ...prev, maxDepth: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delay (ms)</label>
                <Input
                  type="number"
                  value={scrapingSettings.delay}
                  onChange={(e) => setScrapingSettings(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
                  min="100"
                  max="5000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Progres general</label>
                <div className="flex items-center space-x-2">
                  {activeSession ? (
                    <>
                      <Progress value={activeSession.progress} className="flex-1" />
                      <span className="text-sm font-medium">{Math.round(activeSession.progress)}%</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Nu rulează</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={startScraping} 
                disabled={!!activeSessionId || !currentUrl.trim()}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Începe Scraping
              </Button>
              {activeSessionId && (
                <>
                  <Button variant="outline" onClick={pauseScraping}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pauză
                  </Button>
                  <Button variant="outline" onClick={stopScraping}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sesiuni de Scraping */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiuni de Scraping</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nu există sesiuni de scraping încă. Începe prima sesiune mai sus.
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(session.status)}
                          <div>
                            <h3 className="font-semibold">{session.url}</h3>
                            <p className="text-sm text-muted-foreground">
                              {session.products.length} produse • {session.scrapedUrls}/{session.totalUrls} URL-uri
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportData(session, 'json')}
                            disabled={session.products.length === 0}
                          >
                            <FileJson className="w-4 h-4 mr-2" />
                            JSON
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportData(session, 'csv')}
                            disabled={session.products.length === 0}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            CSV
                          </Button>
                        </div>
                      </div>
                      {session.status === 'running' && (
                        <Progress value={session.progress} className="mt-2" />
                      )}
                    </CardHeader>
                    {session.products.length > 0 && (
                      <CardContent>
                        <Tabs defaultValue="products">
                          <TabsList>
                            <TabsTrigger value="products">Produse ({session.products.length})</TabsTrigger>
                            <TabsTrigger value="errors">Erori ({session.errors.length})</TabsTrigger>
                          </TabsList>
                          <TabsContent value="products">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nume</TableHead>
                                  <TableHead>Categorie</TableHead>
                                  <TableHead>Preț</TableHead>
                                  <TableHead>Disponibilitate</TableHead>
                                  <TableHead>Imagini</TableHead>
                                  <TableHead>Acțiuni</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {session.products.slice(0, 10).map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>
                                      <Badge variant={product.availability === 'În stoc' ? 'default' : 'destructive'}>
                                        {product.availability}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{product.images.length} imagini</TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="sm" asChild>
                                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {session.products.length > 10 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Și încă {session.products.length - 10} produse... Exportă pentru lista completă.
                              </p>
                            )}
                          </TabsContent>
                          <TabsContent value="errors">
                            {session.errors.length > 0 ? (
                              <div className="space-y-2">
                                {session.errors.map((error, index) => (
                                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nu există erori.</p>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Scraping;
