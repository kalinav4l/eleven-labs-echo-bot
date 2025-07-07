import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; // Asigură-te că acest import este corect
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Search, Package, Image, FileText, Link2, Code, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast'; // Asigură-te că acest import este corect

// #region TypeScript Interfaces
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
  dominantLanguage: string;
  links: Array<{ url: string; text: string; type: string; target: string; title: string }>;
  images: Array<{ src: string; alt: string; title: string; width: string; height: string; loading: string }>;
  metadata: Record<string, string>;
  headings: Array<{ level: number; text: string; id: string; className: string }>;
  forms: Array<{ action: string; method: string; enctype: string; inputs: Array<{ name: string; type: string; placeholder: string; required: boolean; id: string }> }>;
  scripts: Array<{ src: string; content: string; type: string; async: boolean; defer: boolean }>;
  styles: Array<{ href: string; content: string; media: string; type: string }>;
  tables: Array<{ id: string; caption: string; headers: string[]; rows: string[][] }>;
  lists: Array<{ id: string; type: string; items: string[] }>;
  contactInfo: {
    emails: string[];
    phones: string[];
    addresses: string[];
    socialMedia: string[];
    website: string;
    companyName: string;
  };
  socialLinks: Array<{ url: string; text: string; type: string; target: string; title: string }>;
  structuredData: any[];
  media: { videos: Array<{ src: string; poster: string; controls: boolean; autoplay: boolean }>; audios: Array<{ src: string; controls: boolean; autoplay: boolean }> };
  technologies: { cms: string[]; frameworks: string[]; analytics: string[]; advertising: string[] };
  products: Product[];
  timestamp: string;
}
// #endregion

// #region Helper & Utility Functions
const cleanText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

const detectDominantLanguage = (doc: Document): string => {
    const htmlLang = doc.documentElement?.getAttribute('lang');
    if (htmlLang) {
        return htmlLang.split('-')[0].toLowerCase();
    }
    // O detectare simplă, bazată pe cuvinte cheie, doar ca o sugestie
    const textContent = (doc.body?.textContent || '').toLowerCase();
    if (textContent.includes(' preț ') || textContent.includes(' adaugă în coș ')) return 'ro';
    if (textContent.includes(' price ') || textContent.includes(' add to cart ')) return 'en';
    return 'N/A';
};

const extractAllImages = (element: Element, baseUrl: string): Array<{src: string; alt: string; title: string; type: 'main' | 'gallery' | 'thumbnail' | 'zoom'}> => {
  const images: Array<{src: string; alt: string; title: string; type: 'main' | 'gallery' | 'thumbnail' | 'zoom'}> = [];
  const imageSelectors = [ 'img', 'source', '[data-src]', '[data-lazy-src]', '[data-original]', '[style*="background-image"]', 'picture img', 'figure img' ];

  imageSelectors.forEach(selector => {
    const imageElements = element.querySelectorAll(selector);
    imageElements.forEach(img => {
      let src = '';
      if (img.tagName === 'IMG') {
        src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || '';
      } else if (img.tagName === 'SOURCE') {
        src = img.getAttribute('srcset')?.split(' ')[0] || '';
      } else {
        const style = img.getAttribute('style') || '';
        const bgMatch = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
        if (bgMatch) src = bgMatch[1];
      }

      if (src && !src.startsWith('data:') && !src.includes('placeholder') && !src.includes('loading')) {
        try {
          const fullSrc = new URL(src, baseUrl).href;
          let type: 'main' | 'gallery' | 'thumbnail' | 'zoom' = 'gallery';
          const className = img.className?.toLowerCase() || '';
          if (className.includes('main') || className.includes('primary')) type = 'main';
          else if (className.includes('thumb')) type = 'thumbnail';
          else if (className.includes('zoom')) type = 'zoom';

          images.push({
            src: fullSrc,
            alt: cleanText(img.getAttribute('alt')),
            title: cleanText(img.getAttribute('title')),
            type
          });
        } catch (e) {
          // Ignoră URL-urile invalide
        }
      }
    });
  });
  return images.filter((img, index, arr) => arr.findIndex(i => i.src === img.src) === index);
};

const extractPriceInfo = (element: Element) => {
  const priceInfo = { price: '', originalPrice: '', currency: '' };
  const priceSelectors = [ '.price', '.cost', '.amount', '[class*="price"]', '[data-price]' ];
  const originalPriceSelectors = [ '.old-price', '.original-price', '.was-price', '[class*="old-price"]', '[class*="original"]' ];

  for (const selector of priceSelectors) {
    const priceElement = element.querySelector(selector);
    if (priceElement && priceElement.textContent) {
      const priceText = cleanText(priceElement.textContent);
      const currencyMatch = priceText.match(/(lei|ron|\$|€|£|usd|eur|mdl)/i);
      if (currencyMatch) priceInfo.currency = currencyMatch[0].toUpperCase();
      const priceMatch = priceText.match(/[\d.,\s]+/);
      if (priceMatch) {
          priceInfo.price = cleanText(priceMatch[0]);
          break; // Am găsit prețul principal
      }
    }
  }

  for (const selector of originalPriceSelectors) {
    const originalElement = element.querySelector(selector);
    if (originalElement && originalElement.textContent) {
      priceInfo.originalPrice = cleanText(originalElement.textContent);
      break;
    }
  }
  return priceInfo;
};

const extractSpecifications = (element: Element): Record<string, string> => {
  const specs: Record<string, string> = {};
  const tables = element.querySelectorAll('table, .specs-table, .specifications-table, .product-attributes');
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr, .spec-row, .attribute-row');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th');
      if (cells.length >= 2) {
        const key = cleanText(cells[0].textContent);
        const value = cleanText(cells[1].textContent);
        if (key && value && key.length < 100 && value.length < 500) {
          specs[key] = value;
        }
      }
    });
  });
  return specs;
};
// #endregion

// #region Core Scraping Logic
const detectProducts = (doc: Document, targetUrl: string): Product[] => {
  const products: Product[] = [];
  const productSelectors = [
    '.product', '.product-item', '.product-card', '.item', '.listing-item',
    '[data-productid]', '[data-product-id]', '[data-sku]',
    '.product-container', '.product-wrapper', '.product_pod', '.s-result-item',
  ];

  let foundProducts: Element[] = [];
  for (const selector of productSelectors) {
    const elements = doc.querySelectorAll(selector);
    if (elements.length > 0) {
      foundProducts = Array.from(elements);
      break;
    }
  }

  // Heuristică de rezervă: dacă nu se găsesc selectori specifici
  if (foundProducts.length === 0) {
    const potentialProducts = doc.querySelectorAll('div, article, li');
    foundProducts = Array.from(potentialProducts).filter(element => {
      const hasPrice = element.querySelector('[class*="price"], [class*="cost"]');
      const hasTitle = element.querySelector('h1, h2, h3, h4, a[title]');
      const hasImage = element.querySelector('img');
      const textLength = element.textContent?.length || 0;
      return hasPrice && hasTitle && hasImage && textLength > 50 && textLength < 5000;
    });
  }

  foundProducts.forEach((productElement, index) => {
    try {
      const nameSelectors = ['h1', 'h2', 'h3', 'h4', '.title', '.name', '.product-title', '.product-name', 'a[title]'];
      let name = '';
      for (const selector of nameSelectors) {
        const titleElement = productElement.querySelector(selector);
        if (titleElement && titleElement.textContent) {
          const cleanedTitle = cleanText(titleElement.textContent);
          if (cleanedTitle.length > 3 && cleanedTitle.length < 200) {
            name = cleanedTitle;
            break;
          }
        }
      }
      
      const priceInfo = extractPriceInfo(productElement);

      const descSelectors = ['.description', '.desc', '.summary', '.content', '.product-description'];
      let description = '';
      for (const selector of descSelectors) {
          const descElement = productElement.querySelector(selector);
          if (descElement && descElement.textContent && descElement.textContent.length > 20) {
              description = cleanText(descElement.textContent);
              break;
          }
      }

      if (name && (priceInfo.price || description)) {
        const product: Product = {
          id: `product_${Date.now()}_${index}`,
          name,
          description,
          price: priceInfo.price,
          originalPrice: priceInfo.originalPrice,
          currency: priceInfo.currency,
          category: 'Necategorizat',
          images: extractAllImages(productElement, targetUrl),
          specifications: extractSpecifications(productElement),
          features: [],
          availability: productElement.querySelector('.availability, .stock, .in-stock')?.textContent?.trim() || 'N/A',
          url: (productElement.querySelector('a') as HTMLAnchorElement)?.href || targetUrl
        };
        products.push(product);
      }
    } catch (error) {
      console.error(`Eroare la extragerea produsului ${index + 1}:`, error);
    }
  });

  return products;
};

const detectCMS = (doc: Document): string[] => {
  const cms: string[] = [];
  if (doc.querySelector('meta[name="generator"][content*="WordPress"]')) cms.push('WordPress');
  if (doc.querySelector('script[src*="shopify"]')) cms.push('Shopify');
  if (doc.querySelector('script[src*="drupal"]')) cms.push('Drupal');
  return cms;
};

const detectFrameworks = (doc: Document): string[] => {
  const frameworks: string[] = [];
  if (doc.querySelector('#__next')) frameworks.push('Next.js');
  if (doc.querySelector('[data-reactroot]')) frameworks.push('React');
  if (doc.querySelector('#app[data-v-app]')) frameworks.push('Vue.js');
  return frameworks;
};

const detectAnalytics = (doc: Document): string[] => {
  const analytics: string[] = [];
  if (doc.querySelector('script[src*="google-analytics.com"]') || doc.querySelector('script[src*="gtag/js"]')) analytics.push('Google Analytics');
  if (doc.querySelector('script[src*="connect.facebook.net"]')) analytics.push('Facebook Pixel');
  return analytics;
};

const detectAdvertising = (doc: Document): string[] => {
  const advertising: string[] = [];
  if (doc.querySelector('script[src*="googlesyndication.com"]')) advertising.push('Google AdSense');
  return advertising;
};

const extractAllContent = async (htmlContent: string, targetUrl: string): Promise<ScrapedData> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const textContent = doc.body?.textContent || '';
  const links = Array.from(doc.querySelectorAll('a')).map(link => ({
    url: new URL(link.getAttribute('href') || '', targetUrl).href,
    text: cleanText(link.textContent),
    type: link.getAttribute('rel') || 'link',
    target: link.getAttribute('target') || '',
    title: cleanText(link.getAttribute('title'))
  }));
  const images = Array.from(doc.querySelectorAll('img')).map(img => ({
    src: new URL(img.src || img.getAttribute('data-src') || '', targetUrl).href,
    alt: cleanText(img.alt),
    title: cleanText(img.title),
    width: img.getAttribute('width') || '',
    height: img.getAttribute('height') || '',
    loading: img.getAttribute('loading') || ''
  }));

  const metadata: Record<string, string> = {};
  doc.querySelectorAll('meta').forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property');
    if (name && meta.content) metadata[name] = meta.content;
  });

  return {
    url: targetUrl,
    title: doc.querySelector('title')?.textContent || '',
    description: metadata['description'] || metadata['og:description'] || '',
    keywords: metadata['keywords'] || '',
    text: textContent,
    dominantLanguage: detectDominantLanguage(doc),
    links,
    images,
    metadata,
    headings: Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      level: parseInt(h.tagName.replace('H', '')),
      text: cleanText(h.textContent), id: h.id, className: h.className
    })),
    forms: [],
    scripts: [],
    styles: [],
    tables: Array.from(doc.querySelectorAll('table')).map((table, index) => ({
      id: `table_${index}`,
      caption: cleanText(table.querySelector('caption')?.textContent),
      headers: Array.from(table.querySelectorAll('th')).map(th => cleanText(th.textContent)),
      rows: Array.from(table.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => cleanText(td.textContent))).filter(row => row.length > 0)
    })),
    lists: [],
    contactInfo: {
      emails: Array.from(new Set(textContent.match(/[\w\.-]+@[\w\.-]+\.\w+/g) || [])),
      phones: Array.from(new Set(textContent.match(/(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g) || [])),
      addresses: [],
      socialMedia: [],
      website: '',
      companyName: ''
    },
    socialLinks: links.filter(link => /facebook|twitter|instagram|linkedin|youtube/i.test(link.url)),
    structuredData: Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map(s => {
      try { return JSON.parse(s.textContent || ''); } catch { return null; }
    }).filter(Boolean),
    media: { videos: [], audios: [] },
    technologies: {
      cms: detectCMS(doc),
      frameworks: detectFrameworks(doc),
      analytics: detectAnalytics(doc),
      advertising: detectAdvertising(doc)
    },
    products: detectProducts(doc, targetUrl),
    timestamp: new Date().toISOString()
  };
};

const scrapePageWithProxy = async (url: string): Promise<string | null> => {
    // API-ul `allorigins` este adesea o opțiune bună și fiabilă.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Proxy error: ${response.statusText}`);
        const data = await response.json();
        if (!data.contents) throw new Error('Proxy returned empty content.');
        return data.contents;
    } catch (error) {
        console.error(`Failed to fetch via proxy for ${url}:`, error);
        toast({ title: "Eroare la Fetch", description: "Nu s-a putut accesa URL-ul prin proxy. Site-ul ar putea fi protejat.", variant: "destructive" });
        throw error;
    }
};

const handleScrape = async (url: string): Promise<ScrapedData | null> => {
    try {
        const htmlContent = await scrapePageWithProxy(url);
        if (!htmlContent) throw new Error('Nu s-a putut obține conținutul paginii');
        const data = await extractAllContent(htmlContent, url);
        return data;
    } catch (error) {
        console.error('❌ Eroare la scraping:', error);
        throw error;
    }
};
// #endregion

// #region Report Generation
const generateStructuredReport = (data: ScrapedData): string => {
  let report = `# RAPORT SCRAPING PENTRU: ${data.url}\n\n`;
  report += `## INFORMAȚII GENERALE\n`;
  report += `**Titlu:** ${data.title}\n`;
  report += `**Descriere:** ${data.description}\n`;
  report += `**Limbă Detectată:** ${data.dominantLanguage.toUpperCase()}\n`;
  report += `**Data extragerii:** ${new Date(data.timestamp).toLocaleString('ro-RO')}\n\n`;
  
  if (data.products.length > 0) {
    report += `## PRODUSE GĂSITE (${data.products.length})\n\n`;
    data.products.forEach((product, index) => {
      report += `### ${index + 1}. ${product.name}\n`;
      if (product.price) report += `**Preț:** ${product.price} ${product.currency || ''}\n`;
      if (product.originalPrice) report += `**Preț Original:** ${product.originalPrice}\n`;
      if (product.description) report += `**Descriere:** ${product.description.substring(0, 300)}...\n`;
      if (product.category) report += `**Categorie:** ${product.category}\n`;
      if (product.availability) report += `**Disponibilitate:** ${product.availability}\n`;
      if (product.images.length > 0) report += `**Imagini:** ${product.images.length} imagini disponibile.\n`;
      if (Object.keys(product.specifications).length > 0) report += `**Specificații:** ${Object.keys(product.specifications).length} specificații găsite.\n`;
      report += `\n`;
    });
  }

  const { emails, phones } = data.contactInfo;
  if (emails.length > 0 || phones.length > 0) {
    report += `## INFORMAȚII DE CONTACT\n`;
    if (emails.length > 0) report += `**Email-uri:** ${emails.join(', ')}\n`;
    if (phones.length > 0) report += `**Telefoane:** ${phones.join(', ')}\n`;
    report += `\n`;
  }

  const allTechs = [...data.technologies.cms, ...data.technologies.frameworks, ...data.technologies.analytics];
  if (allTechs.length > 0) {
      report += `## TEHNOLOGII DETECTATE\n`;
      report += `- ${allTechs.join(', ')}\n\n`;
  }

  if (data.headings.length > 0) {
      report += `## STRUCTURA CONȚINUTULUI (TITLURI)\n`;
      data.headings.slice(0, 10).forEach(h => {
          report += `${'  '.repeat(h.level - 1)}- (H${h.level}) ${h.text}\n`;
      });
      report += `\n`;
  }
  
  report += `---\n**Raport generat la ${new Date().toLocaleTimeString('ro-RO')}**\n`;
  return report;
};
// #endregion

// #region React Component
const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');
  const [structuredReport, setStructuredReport] = useState('');

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast({ title: "URL necesar", description: "Introdu un URL valid.", variant: "destructive" });
      return;
    }
    try { new URL(url); } catch {
      toast({ title: "URL invalid", description: "Formatul URL-ului este incorect.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapedData(null);
    setStructuredReport('');

    try {
      const data = await handleScrape(url);
      if (data) {
        setScrapedData(data);
        const report = generateStructuredReport(data);
        setStructuredReport(report);
        toast({ title: "Scraping finalizat!", description: `Găsite ${data.products.length} produse.` });
      } else {
        throw new Error("Datele primite sunt goale.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută';
      setError(errorMessage);
      toast({ title: "Eroare la scraping", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiat!", description: "Raportul a fost copiat în clipboard." });
    } catch (err) {
      toast({ title: "Eroare", description: "Nu s-a putut copia textul.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Web Scraper Inteligent</h1>
          <p className="text-gray-600 text-sm">Extrage produse și informații relevante de pe o singură pagină web.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Introduceți URL-ul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplu.com/produse"
                disabled={isLoading}
              />
              <Button onClick={handleSubmit} disabled={isLoading || !url.trim()}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesez...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Extrage Date</>
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Rezultate Scraping</CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2">
                <Badge variant="secondary">{scrapedData.products.length} produse</Badge>
                <Badge variant="secondary">{scrapedData.images.length} imagini</Badge>
                <Badge variant="secondary">{scrapedData.links.length} link-uri</Badge>
                <Badge variant="secondary">{scrapedData.headings.length} titluri</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="report" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="report">Raport Structurat</TabsTrigger>
                  <TabsTrigger value="products">Produse Găsite</TabsTrigger>
                  <TabsTrigger value="data">Date Complete (JSON)</TabsTrigger>
                </TabsList>

                <TabsContent value="report" className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Raport pentru AI</h3>
                    <Button onClick={() => copyToClipboard(structuredReport)} variant="outline" size="sm">Copiază Raportul</Button>
                  </div>
                  <ScrollArea className="h-[500px] w-full bg-gray-50 rounded-lg border p-4">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">{structuredReport}</pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="products" className="mt-4">
                  <ScrollArea className="h-[600px] p-1">
                    <div className="space-y-4">
                      {scrapedData.products.length > 0 ? scrapedData.products.map((product) => (
                        <Card key={product.id} className="p-4 flex gap-4">
                          {product.images.length > 0 && (
                            <img src={product.images[0].src} alt={product.images[0].alt} className="w-24 h-24 object-cover rounded bg-gray-100" />
                          )}
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-green-700 font-medium">{product.price} {product.currency}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <Badge variant="outline">{product.availability}</Badge>
                          </div>
                        </Card>
                      )) : <p className="text-center text-gray-500 py-8">Nu au fost găsite produse pe această pagină.</p>}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="data" className="mt-4">
                   <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Toate Datele Extrase</h3>
                    <Button onClick={() => copyToClipboard(JSON.stringify(scrapedData, null, 2))} variant="outline" size="sm">Copiază JSON</Button>
                  </div>
                  <ScrollArea className="h-[500px] w-full bg-gray-900 text-white rounded-lg p-4">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{JSON.stringify(scrapedData, null, 2)}</pre>
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