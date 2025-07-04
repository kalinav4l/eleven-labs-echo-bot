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

// Interfețe TypeScript
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  discountPercentage?: string;
  currency?: string;
  category: string;
  subcategory?: string;
  breadcrumbs?: string[];
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  images: Array<{
    src: string;
    alt: string;
    title: string;
    type: 'main' | 'gallery' | 'thumbnail' | 'zoom';
  }>;
  specifications: Record<string, string>;
  features: string[];
  availability: string;
  stock?: string;
  rating?: string;
  reviewsCount?: string;
  reviews?: Array<{
    rating: string;
    text: string;
    author: string;
    date: string;
  }>;
  url: string;
  condition?: string;
  warranty?: string;
  shipping?: string;
  returnPolicy?: string;
  variants?: Array<{
    name: string;
    value: string;
    price?: string;
    image?: string;
  }>;
  relatedProducts?: string[];
  tags?: string[];
  seo?: {
    title: string;
    description: string;
    keywords: string;
  };
}

interface ScrapedData {
  url: string;
  title: string;
  description: string;
  keywords: string;
  text: string;
  links: Array<{ url: string; text: string; type: string }>;
  images: Array<{ src: string; alt: string; title: string }>;
  metadata: Record<string, string>;
  headings: Array<{ level: number; text: string }>;
  forms: Array<{ action: string; method: string; inputs: Array<{ name: string; type: string }> }>;
  scripts: string[];
  styles: string[];
  products: Product[];
  timestamp: string;
}

// Funcții de utilitate pentru extragerea imaginilor
const extractAllImages = (element: Element, baseUrl: string): Array<{src: string; alt: string; title: string; type: 'main' | 'gallery' | 'thumbnail' | 'zoom'}> => {
  const images: Array<{src: string; alt: string; title: string; type: 'main' | 'gallery' | 'thumbnail' | 'zoom'}> = [];
  
  const imageSelectors = [
    'img', 'source', '[data-src]', '[data-lazy-src]', '[data-original]',
    '[style*="background-image"]', 'picture img', 'figure img'
  ];

  imageSelectors.forEach(selector => {
    const imageElements = element.querySelectorAll(selector);
    imageElements.forEach(img => {
      let src = '';
      
      if (img.tagName === 'IMG') {
        src = img.getAttribute('src') || 
              img.getAttribute('data-src') || 
              img.getAttribute('data-lazy-src') || 
              img.getAttribute('data-original') || '';
      } else if (img.tagName === 'SOURCE') {
        src = img.getAttribute('srcset')?.split(' ')[0] || '';
      } else {
        const style = img.getAttribute('style') || '';
        const bgMatch = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
        if (bgMatch) src = bgMatch[1];
      }

      if (src && !src.includes('placeholder') && !src.includes('loading') && !src.includes('spinner')) {
        if (src.startsWith('//')) src = 'https:' + src;
        else if (src.startsWith('/')) src = new URL(baseUrl).origin + src;
        else if (!src.startsWith('http')) src = new URL(src, baseUrl).href;

        let type: 'main' | 'gallery' | 'thumbnail' | 'zoom' = 'gallery';
        const className = img.className?.toLowerCase() || '';
        const id = img.id?.toLowerCase() || '';
        
        if (className.includes('main') || className.includes('primary') || id.includes('main')) type = 'main';
        else if (className.includes('thumb') || className.includes('small') || id.includes('thumb')) type = 'thumbnail';
        else if (className.includes('zoom') || className.includes('large') || id.includes('zoom')) type = 'zoom';

        images.push({
          src,
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || '',
          type
        });
      }
    });
  });

  return images.filter((img, index, arr) => arr.findIndex(i => i.src === img.src) === index);
};

// Funcție pentru extragerea informațiilor despre preț
const extractPriceInfo = (element: Element) => {
  const priceInfo = {
    price: '',
    originalPrice: '',
    discount: '',
    discountPercentage: '',
    currency: ''
  };

  const priceSelectors = [
    '.price, .cost, .amount, .pricing',
    '[class*="price"], [class*="cost"], [class*="amount"]',
    '.price_color, .price-current, .current-price, .sale-price',
    '.priceValue, .price-value, .price_value',
    '[data-price], [data-cost]',
    '.product-price, .item-price'
  ];

  for (const selector of priceSelectors) {
    const priceElement = element.querySelector(selector);
    if (priceElement && priceElement.textContent?.trim()) {
      const priceText = priceElement.textContent.trim();
      const currencyMatch = priceText.match(/(lei|ron|\$|€|£|USD|EUR|MDL)/i);
      if (currencyMatch) priceInfo.currency = currencyMatch[0];
      
      const priceMatch = priceText.match(/[\d.,]+/);
      if (priceMatch) priceInfo.price = priceText;
      break;
    }
  }

  const originalPriceSelectors = [
    '.old-price, .original-price, .was-price',
    '.price-old, .regular-price, .list-price',
    '[class*="old-price"], [class*="original"]'
  ];

  for (const selector of originalPriceSelectors) {
    const originalElement = element.querySelector(selector);
    if (originalElement && originalElement.textContent?.trim()) {
      priceInfo.originalPrice = originalElement.textContent.trim();
      break;
    }
  }

  return priceInfo;
};

// Funcție pentru extragerea specificațiilor
const extractSpecifications = (element: Element): Record<string, string> => {
  const specs: Record<string, string> = {};

  const tables = element.querySelectorAll('table, .specs-table, .specifications-table, .product-attributes');
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr, .spec-row, .attribute-row, .feature-row');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th, .spec-name, .spec-value');
      if (cells.length >= 2) {
        const key = cells[0].textContent?.trim();
        const value = cells[1].textContent?.trim();
        if (key && value && key.length < 100 && value.length < 500) {
          specs[key] = value;
        }
      }
    });
  });

  return specs;
};

// Funcția principală de detectare a produselor
const detectProducts = (doc: Document, targetUrl: string): Product[] => {
  const products: Product[] = [];
  
  const productSelectors = [
    '.product, .product-item, .product-card, .item, .listing-item',
    '[data-product], [data-product-id], [data-item-id], [data-sku]',
    '.woocommerce-product, .product-container, .product-box, .product-wrapper',
    '.product_pod, .product-pod',
    '.s-result-item, .s-item',
    '.product-tile, .product-grid-item',
    '.productCard, .product-card'
  ];

  let foundProducts: Element[] = [];
  
  for (const selector of productSelectors) {
    const elements = doc.querySelectorAll(selector);
    if (elements.length > 0) {
      foundProducts = Array.from(elements);
      break;
    }
  }

  if (foundProducts.length === 0) {
    const potentialProducts = doc.querySelectorAll('div, article, section, li, .item');
    foundProducts = Array.from(potentialProducts).filter(element => {
      const text = element.textContent || '';
      const hasPrice = /(\$|€|£|lei|ron|mdl|\d+[.,]\d+)/i.test(text);
      const hasTitle = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, [class*="title"], [class*="name"], a[title]');
      const hasImage = element.querySelector('img');
      const textLength = text.length;
      
      return hasPrice && hasTitle && textLength > 30 && textLength < 3000;
    });
  }

  foundProducts.forEach((productElement, index) => {
    try {
      const product: Product = {
        id: `product_${Date.now()}_${index}`,
        name: '',
        description: '',
        price: '',
        category: '',
        images: [],
        specifications: {},
        features: [],
        availability: '',
        url: targetUrl
      };

      // Extrage numele produsului
      const titleSelectors = [
        'h1, h2, h3, h4, h5, h6',
        '.title, .name, .product-title, .product-name',
        '[class*="title"], [class*="name"]',
        'a[title]'
      ];

      for (const selector of titleSelectors) {
        const titleElement = productElement.querySelector(selector);
        if (titleElement && titleElement.textContent?.trim()) {
          let title = titleElement.textContent.trim();
          title = title.replace(/(\$|€|£|lei|ron|mdl)[\d.,\s]+/gi, '').trim();
          if (title.length > 3 && title.length < 200) {
            product.name = title;
            break;
          }
        }
      }

      // Extrage informațiile despre preț
      const priceInfo = extractPriceInfo(productElement);
      product.price = priceInfo.price;
      product.originalPrice = priceInfo.originalPrice;
      product.discount = priceInfo.discount;
      product.discountPercentage = priceInfo.discountPercentage;
      product.currency = priceInfo.currency;

      // Extrage descrierea
      const descSelectors = [
        '.description, .desc, .summary, .content',
        '[class*="description"], [class*="desc"]',
        '.product-description'
      ];

      for (const selector of descSelectors) {
        const descElement = productElement.querySelector(selector);
        if (descElement && descElement.textContent?.trim() && descElement.textContent.length > 20) {
          product.description = descElement.textContent.trim();
          break;
        }
      }

      // Extrage imaginile
      product.images = extractAllImages(productElement, targetUrl);

      // Extrage categoria
      const categorySelectors = [
        '.breadcrumb, .breadcrumbs, .category, .categories',
        '[class*="breadcrumb"], [class*="category"]',
        'nav a, .nav a'
      ];

      const breadcrumbs: string[] = [];
      for (const selector of categorySelectors) {
        const categoryElements = productElement.querySelectorAll(selector);
        categoryElements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length < 100 && !breadcrumbs.includes(text)) {
            breadcrumbs.push(text);
          }
        });
        if (breadcrumbs.length > 0) break;
      }
      
      product.breadcrumbs = breadcrumbs;
      product.category = breadcrumbs.join(' > ') || 'Necategorizat';

      // Extrage specificațiile
      product.specifications = extractSpecifications(productElement);

      // Extrage disponibilitatea
      const availabilitySelectors = [
        '.availability, .stock, .in-stock, .out-of-stock',
        '[class*="availability"], [class*="stock"]'
      ];

      for (const selector of availabilitySelectors) {
        const availElement = productElement.querySelector(selector);
        if (availElement && availElement.textContent?.trim()) {
          product.availability = availElement.textContent.trim();
          break;
        }
      }

      if (!product.availability) {
        product.availability = 'Informații indisponibile';
      }

      // Adaugă produsul doar dacă are informații esențiale
      if (product.name && (product.price || product.description || product.images.length > 0)) {
        products.push(product);
      }

    } catch (error) {
      console.error(`Eroare la extragerea produsului ${index + 1}:`, error);
    }
  });

  return products;
};

// Funcția principală de extragere a conținutului
const extractAllContent = async (htmlContent: string, targetUrl: string): Promise<ScrapedData> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  const textContent = doc.body?.textContent || '';

  const links = Array.from(doc.querySelectorAll('a')).map(link => ({
    url: link.href || link.getAttribute('href') || '',
    text: link.textContent?.trim() || '',
    type: link.getAttribute('rel') || 'link'
  }));

  const images = Array.from(doc.querySelectorAll('img')).map(img => ({
    src: img.src || img.getAttribute('src') || '',
    alt: img.alt || '',
    title: img.title || ''
  }));

  const metadata: Record<string, string> = {};
  Array.from(doc.querySelectorAll('meta')).forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
    const content = meta.getAttribute('content');
    if (name && content) {
      metadata[name] = content;
    }
  });

  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(heading => ({
    level: parseInt(heading.tagName.replace('H', '')),
    text: heading.textContent?.trim() || ''
  }));

  const forms = Array.from(doc.querySelectorAll('form')).map(form => ({
    action: form.action || '',
    method: form.method || 'GET',
    inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
      name: input.getAttribute('name') || '',
      type: input.getAttribute('type') || input.tagName.toLowerCase()
    }))
  }));

  const scripts = Array.from(doc.querySelectorAll('script')).map(script => 
    script.src || script.textContent || ''
  ).filter(Boolean);

  const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"], style')).map(style => 
    style.getAttribute('href') || style.textContent || ''
  ).filter(Boolean);

  const products = detectProducts(doc, targetUrl);

  return {
    url: targetUrl,
    title,
    description,
    keywords,
    text: textContent,
    links,
    images,
    metadata,
    headings,
    forms,
    scripts,
    styles,
    products,
    timestamp: new Date().toISOString()
  };
};

// Funcția principală de scraping
const handleScrape = async (url: string): Promise<ScrapedData | null> => {
  const proxyServices = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://cors-anywhere.herokuapp.com/${url}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url
  ];

  for (let i = 0; i < proxyServices.length; i++) {
    const proxyUrl = proxyServices[i];
    
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      if (proxyUrl.includes('cors-anywhere')) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
      }

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let htmlContent = '';
      
      if (proxyUrl.includes('allorigins.win')) {
        const data = await response.json();
        htmlContent = data.contents;
      } else if (proxyUrl.includes('codetabs.com')) {
        htmlContent = await response.text();
      } else {
        htmlContent = await response.text();
      }

      if (!htmlContent || htmlContent.trim().length < 100) {
        throw new Error('Conținut HTML prea mic sau invalid');
      }

      return await extractAllContent(htmlContent, url);
      
    } catch (err) {
      console.error(`Eroare cu proxy ${i + 1}:`, err);
      if (i === proxyServices.length - 1) {
        throw err;
      }
    }
  }
  
  return null;
};

const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast({
        title: "URL necesar",
        description: "Te rog introdu un URL valid pentru a începe scraping-ul",
        variant: "destructive",
      });
      return;
    }
    
    // Validare URL
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
      const data = await handleScrape(url);
      setScrapedData(data);
      
      toast({
        title: "Scraping finalizat",
        description: `Am extras ${data?.products.length || 0} produse și ${data?.links.length || 0} link-uri`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută';
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Web Scraping</h1>
          <p className="text-gray-600 text-sm">
            Extrage automat date și produse din site-uri web
          </p>
        </div>

        {/* Input Section */}
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
                  onClick={handleSubmit} 
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

        {/* Results Section */}
        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Rezultate Scraping
              </CardTitle>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{scrapedData.products.length} produse găsite</span>
                <span>{scrapedData.images.length} imagini</span>
                <span>{scrapedData.links.length} link-uri</span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Prezentare</TabsTrigger>
                  <TabsTrigger value="products">Produse</TabsTrigger>
                  <TabsTrigger value="images">Imagini</TabsTrigger>
                  <TabsTrigger value="links">Link-uri</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Titlu</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{scrapedData.title}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg break-all">{scrapedData.url}</p>
                    </div>
                  </div>
                  
                  {scrapedData.description && (
                    <div className="space-y-2">
                      <Label>Descriere</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{scrapedData.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-900">{scrapedData.products.length}</div>
                      <div className="text-sm text-blue-700">Produse</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Image className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-900">{scrapedData.images.length}</div>
                      <div className="text-sm text-green-700">Imagini</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Link2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-900">{scrapedData.links.length}</div>
                      <div className="text-sm text-purple-700">Link-uri</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Code className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold text-orange-900">{scrapedData.headings.length}</div>
                      <div className="text-sm text-orange-700">Titluri</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {scrapedData.products.map((product) => (
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
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{product.price}</Badge>
                                  {product.currency && <span className="text-sm text-gray-500">{product.currency}</span>}
                                </div>
                              )}
                              {product.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{product.category}</Badge>
                                <Badge variant="outline">{product.availability}</Badge>
                              </div>
                              {Object.keys(product.specifications).length > 0 && (
                                <div className="text-xs text-gray-500">
                                  {Object.keys(product.specifications).length} specificații disponibile
                                </div>
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
                      {scrapedData.images.slice(0, 50).map((image, index) => (
                        <div key={index} className="space-y-2">
                          <img 
                            src={image.src} 
                            alt={image.alt}
                            className="w-full h-32 object-cover rounded-lg bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <p className="text-xs text-gray-500 truncate" title={image.alt}>
                            {image.alt || 'Fără descriere'}
                          </p>
                        </div>
                      ))}
                    </div>
                    {scrapedData.images.length > 50 && (
                      <p className="text-center text-gray-500 mt-4">
                        Afișez primele 50 din {scrapedData.images.length} imagini
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="links" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {scrapedData.links.slice(0, 100).map((link, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {link.text || 'Link fără text'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{link.url}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {link.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {scrapedData.links.length > 100 && (
                      <p className="text-center text-gray-500 mt-4">
                        Afișez primele 100 din {scrapedData.links.length} link-uri
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Meta Tags</h4>
                      <div className="space-y-2">
                        {Object.entries(scrapedData.metadata).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <span className="font-medium text-gray-700">{key}</span>
                            <span className="md:col-span-2 text-gray-600 break-words">{value}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Structura Titlurilor</h4>
                      <div className="space-y-1">
                        {scrapedData.headings.map((heading, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                              H{heading.level}
                            </Badge>
                            <span className="text-gray-700">{heading.text}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <div className="text-xs text-gray-500">
                      Extras la: {new Date(scrapedData.timestamp).toLocaleString('ro-RO')}
                    </div>
                  </div>
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