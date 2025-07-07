import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Search, Package, Image, FileText, Link2, Code, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ScrapedData {
  url: string;
  title: string;
  description: string;
  text: string;
  links: Array<{ url: string; text: string }>;
  images: Array<{ src: string; alt: string }>;
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    images: Array<{ src: string; alt: string }>;
  }>;
  timestamp: string;
}

const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "URL necesar",
        description: "Te rog introdu un URL valid pentru a începe scraping-ul",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast({
        title: "URL invalid",
        description: "Te rog introdu un URL valid (ex: https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapedData(null);

    try {
      const response = await fetch(url);
      const htmlContent = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      const title = doc.querySelector('title')?.textContent || 'Fără titlu';
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const text = doc.body?.textContent?.substring(0, 1000) || '';

      const links = Array.from(doc.querySelectorAll('a'))
        .map(link => ({
          url: link.href || '',
          text: link.textContent?.trim() || ''
        }))
        .filter(link => link.url && link.text)
        .slice(0, 20);

      const images = Array.from(doc.querySelectorAll('img'))
        .map(img => ({
          src: img.src || '',
          alt: img.alt || ''
        }))
        .filter(img => img.src && !img.src.includes('data:'))
        .slice(0, 20);

      const products = [];
      const productElements = doc.querySelectorAll('.product, .product-item, [data-product]');
      
      productElements.forEach((element, index) => {
        const nameEl = element.querySelector('h1, h2, h3, .title, .name');
        const priceEl = element.querySelector('.price, [class*="price"]');
        const descEl = element.querySelector('.description, .desc');
        const imgEl = element.querySelector('img');

        if (nameEl && priceEl) {
          products.push({
            id: `product_${index}`,
            name: nameEl.textContent?.trim() || `Produs ${index + 1}`,
            description: descEl?.textContent?.trim() || '',
            price: priceEl.textContent?.trim() || '',
            images: imgEl ? [{ src: imgEl.src, alt: imgEl.alt || '' }] : []
          });
        }
      });

      const data: ScrapedData = {
        url,
        title,
        description,
        text,
        links,
        images,
        products,
        timestamp: new Date().toISOString()
      };

      setScrapedData(data);
      
      toast({
        title: "Scraping finalizat!",
        description: `Găsite ${products.length} produse, ${links.length} link-uri și ${images.length} imagini`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare la scraping';
      setError(errorMessage);
      
      toast({
        title: "Eroare la scraping",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Web Scraping</h1>
          <p className="text-gray-600 text-sm">
            Extrage informații și produse de pe site-uri web
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Scraping URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL Site Web</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleScrape} 
                  disabled={isLoading || !url.trim()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesez...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Extrage Date
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-900">Eroare</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Rezultate Scraping
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>{scrapedData.products.length} produse</span>
                <span>{scrapedData.images.length} imagini</span>
                <span>{scrapedData.links.length} link-uri</span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Prezentare</TabsTrigger>
                  <TabsTrigger value="products">Produse</TabsTrigger>
                  <TabsTrigger value="images">Imagini</TabsTrigger>
                  <TabsTrigger value="links">Link-uri</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Informații Site</h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>Titlu:</strong> {scrapedData.title}</div>
                          <div><strong>URL:</strong> {scrapedData.url}</div>
                          {scrapedData.description && (
                            <div><strong>Descriere:</strong> {scrapedData.description}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Statistici</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Produse găsite:</span>
                            <Badge variant="secondary">{scrapedData.products.length}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Imagini găsite:</span>
                            <Badge variant="secondary">{scrapedData.images.length}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Link-uri găsite:</span>
                            <Badge variant="secondary">{scrapedData.links.length}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {scrapedData.text && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Preview Text</h3>
                        <p className="text-sm text-gray-600 line-clamp-6">{scrapedData.text}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {scrapedData.products.map((product, index) => (
                        <Card key={product.id} className="p-4">
                          <div className="flex gap-4">
                            {product.images.length > 0 && (
                              <img 
                                src={product.images[0].src}
                                alt={product.images[0].alt}
                                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-gray-900">{product.name}</h3>
                              {product.price && (
                                <Badge variant="secondary">{product.price}</Badge>
                              )}
                              {product.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {scrapedData.products.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nu au fost găsite produse pe această pagină
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {scrapedData.images.map((image, index) => (
                        <div key={index} className="space-y-2">
                          <img 
                            src={image.src} 
                            alt={image.alt}
                            className="w-full h-32 object-cover rounded-lg bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          {image.alt && (
                            <p className="text-xs text-gray-600 truncate">{image.alt}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="links" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {scrapedData.links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                          <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{link.text}</div>
                            <div className="text-xs text-gray-500 truncate">{link.url}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scraping;