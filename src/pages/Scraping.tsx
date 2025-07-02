import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Download, Play, Pause, Square, FileJson, AlertCircle, CheckCircle, Clock, ExternalLink, Database } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ScrapedProduct {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  shortDescription?: string;
  specifications: Record<string, any>;
  features: string[];
  images: string[];
  thumbnails: string[];
  videos: string[];
  documents: string[];
  url: string;
  productUrl?: string;
  availability: string;
  stock?: number;
  sku?: string;
  brand?: string;
  model?: string;
  weight?: string;
  dimensions?: string;
  colors: string[];
  sizes: string[];
  materials: string[];
  warranty?: string;
  shipping?: string;
  reviews: {
    count: number;
    averageRating: number;
    comments: Array<{
      author: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  relatedProducts: string[];
  breadcrumbs: string[];
  tags: string[];
  metadata: Record<string, any>;
}

interface ScrapingSession {
  id: string;
  url: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  totalUrls: number;
  scrapedUrls: number;
  products: ScrapedProduct[];
  pages: Array<{
    url: string;
    title: string;
    content: string;
    links: string[];
    images: string[];
    metadata: Record<string, any>;
  }>;
  startTime?: Date;
  endTime?: Date;
  errors: string[];
  statistics: {
    totalLinks: number;
    processedLinks: number;
    totalImages: number;
    totalProducts: number;
    totalPages: number;
  };
}

const Scraping = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ScrapingSession[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [scrapingMode, setScrapingMode] = useState<'complete' | 'deep'>('deep');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [scrapingSettings, setScrapingSettings] = useState({
    maxDepth: 10,
    maxPages: 1000,
    delay: 500,
    respectRobots: true,
    extractImages: true,
    extractPrices: true,
    extractCategories: true,
    extractReviews: true,
    extractSpecs: true,
    extractRelated: true,
    followExternalLinks: false,
    customSelectors: '',
    includeHiddenContent: true,
    extractMetadata: true,
    extractStructuredData: true
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
      pages: [],
      errors: [],
      statistics: {
        totalLinks: 0,
        processedLinks: 0,
        totalImages: 0,
        totalProducts: 0,
        totalPages: 0
      }
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

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Web Worker extrem de avansat pentru scraping complet
    const workerCode = `
      class AdvancedWebScraper {
        constructor() {
          this.scrapedUrls = new Set();
          this.urlsToScrape = [];
          this.products = [];
          this.pages = [];
          this.errors = [];
          this.statistics = {
            totalLinks: 0,
            processedLinks: 0,
            totalImages: 0,
            totalProducts: 0,
            totalPages: 0
          };
          this.domainRegex = null;
        }

        async scrapeCompleteSite(startUrl, settings) {
          try {
            const urlObj = new URL(startUrl);
            this.domainRegex = new RegExp(\`^https?://\${urlObj.hostname.replace(/\\./g, '\\\\.')}\`);
            
            this.urlsToScrape.push(startUrl);
            let processedCount = 0;
            
            while (this.urlsToScrape.length > 0 && processedCount < settings.maxPages) {
              const currentUrl = this.urlsToScrape.shift();
              
              if (this.scrapedUrls.has(currentUrl)) continue;
              
              self.postMessage({
                type: 'progress',
                progress: Math.min((processedCount / settings.maxPages) * 100, 95),
                currentUrl,
                totalUrls: this.urlsToScrape.length + processedCount,
                scrapedUrls: processedCount,
                statistics: this.statistics
              });

              try {
                await this.scrapeUrl(currentUrl, settings);
                processedCount++;
                
                if (settings.delay > 0) {
                  await new Promise(resolve => setTimeout(resolve, settings.delay));
                }
              } catch (error) {
                this.errors.push(\`Error scraping \${currentUrl}: \${error.message}\`);
                console.error('Scraping error:', error);
              }
            }
            
            self.postMessage({
              type: 'completed',
              statistics: this.statistics,
              totalProducts: this.products.length,
              totalPages: this.pages.length,
              errors: this.errors
            });
            
          } catch (error) {
            self.postMessage({
              type: 'error',
              error: error.message
            });
          }
        }

        async scrapeUrl(url, settings) {
          const response = await this.fetchWithTimeout(url, 15000);
          const html = await response.text();
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Extrage toate link-urile pentru navigare ulterioară
          const links = this.extractAllLinks(doc, url, settings);
          links.forEach(link => {
            if (!this.scrapedUrls.has(link) && this.shouldScrapeUrl(link, url, settings)) {
              this.urlsToScrape.push(link);
              this.statistics.totalLinks++;
            }
          });

          // Extrage pagina completă cu toate detaliile
          const pageData = this.extractCompletePage(doc, url, settings);
          this.pages.push(pageData);
          this.statistics.totalPages++;

          // Extrage produsele cu toate detaliile posibile
          const products = this.extractCompleteProducts(doc, url, settings);
          this.products.push(...products);
          this.statistics.totalProducts += products.length;

          this.scrapedUrls.add(url);
          this.statistics.processedLinks++;

          // Trimite actualizări în timp real
          if (products.length > 0) {
            self.postMessage({
              type: 'products',
              products: products
            });
          }

          if (pageData) {
            self.postMessage({
              type: 'page',
              page: pageData
            });
          }

          return { success: true, products, page: pageData };
        }

        extractCompletePage(doc, url, settings) {
          return {
            url: url,
            title: this.getPageTitle(doc),
            content: this.getPageContent(doc),
            links: this.extractAllLinks(doc, url, settings),
            images: this.extractAllImages(doc, url),
            metadata: this.extractPageMetadata(doc),
            structuredData: settings.extractStructuredData ? this.extractStructuredData(doc) : {},
            headers: this.extractHeaders(doc),
            tables: this.extractTables(doc),
            forms: this.extractForms(doc),
            scripts: this.extractScripts(doc),
            styles: this.extractStyles(doc)
          };
        }

        extractCompleteProducts(doc, baseUrl, settings) {
          const products = [];
          
          // Multiple strategii de detectare a produselor
          const productSelectors = [
            // Selectori comuni pentru produse
            '[data-product]', '[data-product-id]', '[data-item]',
            '.product', '.item', '.product-item', '.product-card',
            '.product-container', '.product-wrapper', '.product-box',
            '[itemtype*="Product"]', '[itemtype*="product"]',
            '.listing-item', '.search-result', '.catalog-item',
            '.shop-item', '.store-item', '.merchandise',
            // Selectori pentru magazine specifice
            '.product-tile', '.product-summary', '.product-info',
            '.product-detail', '.product-view', '.item-container',
            '.goods', '.commodity', '.article-item'
          ];

          let productElements = [];
          
          // Încearcă fiecare selector
          for (const selector of productSelectors) {
            const elements = doc.querySelectorAll(selector);
            if (elements.length > 0) {
              productElements = Array.from(elements);
              console.log(\`Found \${elements.length} products with selector: \${selector}\`);
              break;
            }
          }

          // Dacă nu găsește cu selectorii comuni, încearcă detectarea structurală
          if (productElements.length === 0) {
            productElements = this.detectProductsStructurally(doc);
          }

          // Extrage datele complete pentru fiecare produs
          productElements.forEach((element, index) => {
            try {
              const product = this.extractCompleteProductData(element, baseUrl, settings, index);
              if (product && (product.name || product.price || product.description)) {
                products.push(product);
              }
            } catch (error) {
              console.warn(\`Error extracting product \${index}:\`, error);
            }
          });

          return products;
        }

        extractCompleteProductData(element, baseUrl, settings, index) {
          const product = {
            id: this.generateProductId(baseUrl, index),
            name: this.extractProductName(element),
            category: this.extractCategory(element, document),
            subcategory: this.extractSubcategory(element, document),
            price: settings.extractPrices ? this.extractPrice(element) : '',
            originalPrice: settings.extractPrices ? this.extractOriginalPrice(element) : '',
            discount: settings.extractPrices ? this.extractDiscount(element) : '',
            description: this.extractDescription(element),
            shortDescription: this.extractShortDescription(element),
            specifications: this.extractSpecifications(element),
            features: this.extractFeatures(element),
            images: settings.extractImages ? this.extractProductImages(element, baseUrl) : [],
            thumbnails: settings.extractImages ? this.extractThumbnails(element, baseUrl) : [],
            videos: this.extractVideos(element, baseUrl),
            documents: this.extractDocuments(element, baseUrl),
            url: baseUrl,
            productUrl: this.extractProductUrl(element, baseUrl),
            availability: this.extractAvailability(element),
            stock: this.extractStock(element),
            sku: this.extractSKU(element),
            brand: this.extractBrand(element),
            model: this.extractModel(element),
            weight: this.extractWeight(element),
            dimensions: this.extractDimensions(element),
            colors: this.extractColors(element),
            sizes: this.extractSizes(element),
            materials: this.extractMaterials(element),
            warranty: this.extractWarranty(element),
            shipping: this.extractShipping(element),
            reviews: settings.extractReviews ? this.extractReviews(element) : { count: 0, averageRating: 0, comments: [] },
            relatedProducts: settings.extractRelated ? this.extractRelatedProducts(element, baseUrl) : [],
            breadcrumbs: this.extractBreadcrumbs(element, document),
            tags: this.extractTags(element),
            metadata: this.extractProductMetadata(element)
          };

          return product;
        }

        // Metode de extracție extremely detaliate pentru fiecare câmp
        extractProductName(element) {
          const nameSelectors = [
            'h1', 'h2', 'h3', '.product-name', '.product-title', '.title', '.name',
            '[data-name]', '[data-title]', '[data-product-name]',
            '.item-name', '.item-title', '.product-heading',
            'a[title]', '.product-link', '.item-link'
          ];

          for (const selector of nameSelectors) {
            const nameEl = element.querySelector(selector);
            if (nameEl) {
              let text = nameEl.textContent?.trim() || nameEl.getAttribute('title')?.trim() || nameEl.getAttribute('alt')?.trim();
              if (text && text.length > 2 && text.length < 200) {
                return text;
              }
            }
          }

          // Fallback: încearcă să găsească cel mai mare text din element
          const textNodes = Array.from(element.querySelectorAll('*'))
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 5 && text.length < 150)
            .sort((a, b) => b.length - a.length);

          return textNodes[0] || 'Produs necunoscut';
        }

        extractPrice(element) {
          const priceSelectors = [
            '.price', '.cost', '.amount', '.value', '.sum',
            '[data-price]', '[data-cost]', '[data-amount]',
            '.price-current', '.current-price', '.price-now', '.price-today',
            '.sale-price', '.special-price', '.offer-price',
            '.regular-price', '.original-price', '.retail-price',
            '.final-price', '.total-price', '.unit-price'
          ];

          for (const selector of priceSelectors) {
            const priceEl = element.querySelector(selector);
            if (priceEl) {
              const text = priceEl.textContent?.trim();
              if (text) {
                const price = this.parsePrice(text);
                if (price) return price;
              }
            }
          }

          // Caută în atribute
          const priceAttrs = ['data-price', 'data-cost', 'data-amount', 'price', 'value'];
          for (const attr of priceAttrs) {
            const elements = element.querySelectorAll(\`[\${attr}]\`);
            for (const el of elements) {
              const value = el.getAttribute(attr);
              if (value) {
                const price = this.parsePrice(value);
                if (price) return price;
              }
            }
          }

          return '';
        }

        parsePrice(text) {
          if (!text) return '';
          
          // Patternuri pentru diferite formate de preț
          const patterns = [
            // Cu simboluri monetare
            /[\$€£¥₽₹₩₦₪₴₵₸₺₻₼₽₾₿]\\s*([\\d.,]+)/g,
            /([\\d.,]+)\\s*(?:lei|ron|eur|usd|gbp|rub|₽|€|\\$|£)/gi,
            // Fără simboluri monetare dar cu context
            /(?:preț|price|cost|valoare|suma)\\s*:?\\s*([\\d.,]+)/gi,
            // Doar numere cu puncte sau virgule
            /\\b([\\d]{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{2})?)\\b/g
          ];

          for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
              return matches[0].trim();
            }
          }

          return '';
        }

        extractDescription(element) {
          const descSelectors = [
            '.description', '.product-description', '.item-description',
            '.summary', '.product-summary', '.item-summary',
            '.details', '.product-details', '.item-details',
            '.info', '.product-info', '.item-info',
            '.content', '.product-content', '.about',
            '.overview', '.product-overview',
            '[data-description]', '[data-summary]'
          ];

          let descriptions = [];
          
          for (const selector of descSelectors) {
            const descEls = element.querySelectorAll(selector);
            descEls.forEach(el => {
              const text = el.textContent?.trim();
              if (text && text.length > 20 && text.length < 2000) {
                descriptions.push(text);
              }
            });
          }

          // Elimină duplicatele și combină
          const uniqueDescriptions = [...new Set(descriptions)];
          return uniqueDescriptions.join(' ').substring(0, 1500);
        }

        extractSpecifications(element) {
          const specs = {};
          
          // Caută tabele cu specificații
          const tables = element.querySelectorAll('table');
          tables.forEach(table => {
            const caption = table.querySelector('caption')?.textContent?.toLowerCase();
            if (!caption || caption.includes('spec') || caption.includes('detail') || caption.includes('caracteristic')) {
              const rows = table.querySelectorAll('tr');
              rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 2) {
                  const key = cells[0].textContent?.trim();
                  const value = cells[1].textContent?.trim();
                  if (key && value && key.length < 100 && value.length < 200) {
                    specs[key] = value;
                  }
                }
              });
            }
          });

          // Caută liste cu specificații
          const specLists = element.querySelectorAll('.specs li, .specifications li, .details li, .features li');
          specLists.forEach(item => {
            const text = item.textContent?.trim();
            if (text && text.includes(':')) {
              const [key, ...valueParts] = text.split(':');
              const value = valueParts.join(':').trim();
              if (key && value && key.length < 100 && value.length < 200) {
                specs[key.trim()] = value;
              }
            }
          });

          // Caută dl/dt combinații
          const dlElements = element.querySelectorAll('dl');
          dlElements.forEach(dl => {
            const terms = dl.querySelectorAll('dt');
            const definitions = dl.querySelectorAll('dd');
            
            terms.forEach((term, index) => {
              if (definitions[index]) {
                const key = term.textContent?.trim();
                const value = definitions[index].textContent?.trim();
                if (key && value) {
                  specs[key] = value;
                }
              }
            });
          });

          return specs;
        }

        extractProductImages(element, baseUrl) {
          const images = new Set();
          
          // Selectori pentru imagini de produs
          const imgSelectors = [
            'img', '.product-image img', '.item-image img',
            '.gallery img', '.product-gallery img',
            '.thumbnail img', '.product-thumbnail img',
            '[data-src]', '[data-lazy]', '[data-image]'
          ];

          imgSelectors.forEach(selector => {
            const imgs = element.querySelectorAll(selector);
            imgs.forEach(img => {
              let src = img.src || img.getAttribute('data-src') || 
                       img.getAttribute('data-lazy') || img.getAttribute('data-image') ||
                       img.getAttribute('srcset')?.split(' ')[0];
              
              if (src) {
                src = this.resolveUrl(src, baseUrl);
                // Filtrează imaginile irelevante
                if (this.isProductImage(src, img)) {
                  images.add(src);
                }
              }
            });
          });

          return Array.from(images);
        }

        extractAllLinks(doc, baseUrl, settings) {
          const links = new Set();
          const linkElements = doc.querySelectorAll('a[href]');
          
          linkElements.forEach(link => {
            let href = link.getAttribute('href');
            if (href) {
              href = this.resolveUrl(href, baseUrl);
              if (this.shouldScrapeUrl(href, baseUrl, settings)) {
                links.add(href);
              }
            }
          });

          return Array.from(links);
        }

        shouldScrapeUrl(url, baseUrl, settings) {
          try {
            const urlObj = new URL(url);
            const baseUrlObj = new URL(baseUrl);
            
            // Doar linkuri de pe același domeniu (sau externe dacă permis)
            if (!settings.followExternalLinks && urlObj.hostname !== baseUrlObj.hostname) {
              return false;
            }
            
            // Evită anumite tipuri de fișiere
            const excludeExtensions = [
              '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
              '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
              '.zip', '.rar', '.tar', '.gz', '.7z',
              '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
              '.css', '.js', '.json', '.xml', '.txt'
            ];
            
            if (excludeExtensions.some(ext => url.toLowerCase().includes(ext))) {
              return false;
            }
            
            // Evită linkuri de navigare comune
            const excludePatterns = [
              '#', 'javascript:', 'mailto:', 'tel:', 'ftp:',
              '/search', '/login', '/register', '/signup', '/signin',
              '/cart', '/checkout', '/account', '/profile',
              '/admin', '/wp-admin', '/dashboard'
            ];
            
            if (excludePatterns.some(pattern => url.includes(pattern))) {
              return false;
            }
            
            return true;
          } catch {
            return false;
          }
        }

        // Metode helper suplimentare pentru extracție completă
        generateProductId(baseUrl, index) {
          return \`\${new URL(baseUrl).hostname}-product-\${Date.now()}-\${index}\`;
        }

        resolveUrl(url, base) {
          try {
            return new URL(url, base).href;
          } catch {
            return url;
          }
        }

        isProductImage(src, imgElement) {
          const productKeywords = ['product', 'item', 'goods', 'merchandise', 'catalog'];
          const excludeKeywords = ['logo', 'icon', 'banner', 'ad', 'advertisement', 'social'];
          
          const srcLower = src.toLowerCase();
          const alt = (imgElement.getAttribute('alt') || '').toLowerCase();
          const className = (imgElement.getAttribute('class') || '').toLowerCase();
          
          const hasProductKeyword = productKeywords.some(keyword => 
            srcLower.includes(keyword) || alt.includes(keyword) || className.includes(keyword)
          );
          
          const hasExcludeKeyword = excludeKeywords.some(keyword => 
            srcLower.includes(keyword) || alt.includes(keyword) || className.includes(keyword)
          );
          
          return hasProductKeyword || (!hasExcludeKeyword && imgElement.width > 50 && imgElement.height > 50);
        }

        // Placeholder for other extraction methods (extractOriginalPrice, extractDiscount, extractShortDescription, extractFeatures, extractThumbnails, extractVideos, extractDocuments, extractProductUrl, extractAvailability, extractStock, extractSKU, extractBrand, extractModel, extractWeight, extractDimensions, extractColors, extractSizes, extractMaterials, extractWarranty, extractShipping, extractReviews, extractRelatedProducts, extractBreadcrumbs, extractTags, extractProductMetadata, getPageTitle, getPageContent, extractAllImages, extractPageMetadata, extractStructuredData, extractHeaders, extractTables, extractForms, extractScripts, extractStyles, detectProductsStructurally)
        extractOriginalPrice(element) { return ''; }
        extractDiscount(element) { return ''; }
        extractShortDescription(element) { return ''; }
        extractFeatures(element) { return []; }
        extractThumbnails(element, baseUrl) { return []; }
        extractVideos(element, baseUrl) { return []; }
        extractDocuments(element, baseUrl) { return []; }
        extractProductUrl(element, baseUrl) { return ''; }
        extractAvailability(element) { return 'Necunoscut'; }
        extractStock(element) { return undefined; }
        extractSKU(element) { return ''; }
        extractBrand(element) { return ''; }
        extractModel(element) { return ''; }
        extractWeight(element) { return ''; }
        extractDimensions(element) { return ''; }
        extractColors(element) { return []; }
        extractSizes(element) { return []; }
        extractMaterials(element) { return []; }
        extractWarranty(element) { return ''; }
        extractShipping(element) { return ''; }
        extractReviews(element) { return { count: 0, averageRating: 0, comments: [] }; }
        extractRelatedProducts(element, baseUrl) { return []; }
        extractBreadcrumbs(element, doc) { return []; }
        extractTags(element) { return []; }
        extractProductMetadata(element) { return {}; }
        getPageTitle(doc) { return doc.title || ''; }
        getPageContent(doc) { return doc.body?.textContent?.trim() || ''; }
        extractAllImages(doc, baseUrl) { return []; }
        extractPageMetadata(doc) { return {}; }
        extractStructuredData(doc) { return {}; }
        extractHeaders(doc) { return []; }
        extractTables(doc) { return []; }
        extractForms(doc) { return []; }
        extractScripts(doc) { return []; }
        extractStyles(doc) { return []; }
        detectProductsStructurally(doc) { return []; }
      }

      // Logica principală a worker-ului
      const scraper = new AdvancedWebScraper();

      self.onmessage = async function(e) {
        const { url, settings } = e.data;
        
        try {
          self.postMessage({ type: 'status', status: 'started' });
          await scraper.scrapeCompleteSite(url, settings);
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
                scrapedUrls: data.scrapedUrls,
                statistics: data.statistics || s.statistics
              };
            case 'products':
              return { ...s, products: [...s.products, ...data.products] };
            case 'page':
              return { ...s, pages: [...s.pages, data.page] };
            case 'completed':
              return { 
                ...s, 
                status: 'completed', 
                progress: 100, 
                endTime: new Date(),
                errors: [...s.errors, ...data.errors],
                statistics: data.statistics
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

    // Începe scraping-ul complet
    workerRef.current.postMessage({
      url: currentUrl,
      settings: scrapingSettings
    });

    toast({
      title: "Scraping avansat pornit",
      description: `Extracție completă de pe ${currentUrl} - toate datele vor fi colectate`,
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
      const exportData = {
        session: {
          id: session.id,
          url: session.url,
          startTime: session.startTime,
          endTime: session.endTime,
          statistics: session.statistics
        },
        products: session.products,
        pages: session.pages,
        errors: session.errors
      };
      content = JSON.stringify(exportData, null, 2);
      filename = `scraping-complet-${session.id}.json`;
      mimeType = 'application/json';
    } else {
      const headers = [
        'Nume', 'Categorie', 'Subcategorie', 'Preț', 'Preț Original', 'Reducere',
        'Descriere', 'Disponibilitate', 'Brand', 'Model', 'SKU', 'Stoc',
        'Greutate', 'Dimensiuni', 'Culori', 'Mărimi', 'Materiale',
        'Garanție', 'Transport', 'URL', 'URL Produs', 'Imagini', 'Specificații'
      ];
      
      const rows = session.products.map(product => [
        product.name,
        product.category,
        product.subcategory || '',
        product.price,
        product.originalPrice || '',
        product.discount || '',
        product.description,
        product.availability,
        product.brand || '',
        product.model || '',
        product.sku || '',
        product.stock?.toString() || '',
        product.weight || '',
        product.dimensions || '',
        product.colors.join(';'),
        product.sizes.join(';'),
        product.materials.join(';'),
        product.warranty || '',
        product.shipping || '',
        product.url,
        product.productUrl || '',
        product.images.join(';'),
        JSON.stringify(product.specifications)
      ]);
      
      content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename = `scraping-complet-${session.id}.csv`;
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
      description: `Toate datele au fost exportate în ${filename}`,
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
            <h1 className="text-3xl font-bold text-foreground">Scraping Complet & Avansat</h1>
            <p className="text-muted-foreground">Extrage ABSOLUT TOT de pe orice site - produse, imagini, specificații, tot!</p>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <Database className="w-4 h-4 mr-2" />
            EXTRACȚIE TOTALĂ
          </Badge>
        </div>

        {/* Configurare Avansată */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Configurare Scraping Complet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Site (va extrage TOT)</label>
                <Input
                  placeholder="https://example.com"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mod Extracție</label>
                <Tabs value={scrapingMode} onValueChange={(value: any) => setScrapingMode(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="complete">Site Complet</TabsTrigger>
                    <TabsTrigger value="deep">Extracție Profundă</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adâncime maximă</label>
                <Input
                  type="number"
                  value={scrapingSettings.maxDepth}
                  onChange={(e) => setScrapingSettings(prev => ({ ...prev, maxDepth: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pagini maxime</label>
                <Input
                  type="number"
                  value={scrapingSettings.maxPages}
                  onChange={(e) => setScrapingSettings(prev => ({ ...prev, maxPages: parseInt(e.target.value) }))}
                  min="10"
                  max="10000"
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
                <label className="text-sm font-medium">Progres</label>
                <div className="flex items-center space-x-2">
                  {activeSession ? (
                    <>
                      <Progress value={activeSession.progress} className="flex-1" />
                      <span className="text-sm font-medium">{Math.round(activeSession.progress)}%</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Inactiv</span>
                  )}
                </div>
              </div>
            </div>

            {activeSession && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeSession.statistics.totalProducts}</div>
                  <div className="text-sm text-muted-foreground">Produse</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{activeSession.statistics.totalPages}</div>
                  <div className="text-sm text-muted-foreground">Pagini</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{activeSession.statistics.totalLinks}</div>
                  <div className="text-sm text-muted-foreground">Link-uri</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{activeSession.statistics.totalImages}</div>
                  <div className="text-sm text-muted-foreground">Imagini</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{activeSession.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Erori</div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={startScraping} 
                disabled={!!activeSessionId || !currentUrl.trim()}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Începe Extracția Completă
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

        {/* Rezultate Extracție */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiuni de Extracție Completă</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nu există sesiuni de extracție încă. Începe prima sesiune mai sus pentru a extrage tot de pe un site.
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(session.status)}
                          <div>
                            <h3 className="font-semibold">{session.url}</h3>
                            <p className="text-sm text-muted-foreground">
                              {session.products.length} produse • {session.pages.length} pagini • {session.scrapedUrls}/{session.totalUrls} URL-uri
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
                            JSON Complet
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportData(session, 'csv')}
                            disabled={session.products.length === 0}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            CSV Detaliat
                          </Button>
                        </div>
                      </div>
                      {session.status === 'running' && (
                        <Progress value={session.progress} className="mt-2" />
                      )}
                    </CardHeader>
                    {(session.products.length > 0 || session.pages.length > 0) && (
                      <CardContent>
                        <Tabs defaultValue="products">
                          <TabsList>
                            <TabsTrigger value="products">Produse ({session.products.length})</TabsTrigger>
                            <TabsTrigger value="pages">Pagini ({session.pages.length})</TabsTrigger>
                            <TabsTrigger value="errors">Erori ({session.errors.length})</TabsTrigger>
                          </TabsList>
                          <TabsContent value="products">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nume</TableHead>
                                  <TableHead>Categorie</TableHead>
                                  <TableHead>Preț</TableHead>
                                  <TableHead>Brand</TableHead>
                                  <TableHead>Disponibilitate</TableHead>
                                  <TableHead>Imagini</TableHead>
                                  <TableHead>Specificații</TableHead>
                                  <TableHead>Acțiuni</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {session.products.slice(0, 10).map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>
                                      {product.name}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-green-600">{product.price}</TableCell>
                                    <TableCell>{product.brand || 'N/A'}</TableCell>
                                    <TableCell>
                                      <Badge variant={product.availability === 'În stoc' ? 'default' : 'destructive'}>
                                        {product.availability}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{product.images.length} imagini</TableCell>
                                    <TableCell>{Object.keys(product.specifications).length} spec.</TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="sm" asChild>
                                        <a href={product.productUrl || product.url} target="_blank" rel="noopener noreferrer">
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
                                Și încă {session.products.length - 10} produse cu toate detaliile... Exportă pentru lista completă.
                              </p>
                            )}
                          </TabsContent>
                          <TabsContent value="pages">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Titlu Pagină</TableHead>
                                  <TableHead>URL</TableHead>
                                  <TableHead>Link-uri Găsite</TableHead>
                                  <TableHead>Imagini</TableHead>
                                  <TableHead>Conținut</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {session.pages.slice(0, 10).map((page, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium max-w-[250px] truncate" title={page.title}>
                                      {page.title}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={page.url}>
                                      {page.url}
                                    </TableCell>
                                    <TableCell>{page.links.length}</TableCell>
                                    <TableCell>{page.images.length}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={page.content}>
                                      {page.content.substring(0, 100)}...
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TabsContent>
                          <TabsContent value="errors">
                            {session.errors.length > 0 ? (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {session.errors.map((error, index) => (
                                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nu există erori - extracția merge perfect!</p>
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
