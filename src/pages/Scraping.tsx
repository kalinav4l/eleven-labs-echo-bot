import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Search, Download, Globe, Package, Image, Link, FileText, AlertCircle, CheckCircle, Loader2, HardDrive } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { generateAgentOptimizedDescription, generateAgentTags, calculateCompletenessScore, exportForAgent } from '@/utils/agentOptimization';
import { 
  createOptimizedJSONExport, 
  createOptimizedCSVExport, 
  createOptimizedHTMLExport, 
  downloadOptimizedFile 
} from '@/utils/exportOptimization';

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

interface SiteMapPage {
  id: string;
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
  products: any[];
  timestamp: string;
  depth: number;
  parentUrl?: string;
  status: 'pending' | 'scraped' | 'error';
  error?: string;
}

interface SiteMapData {
  baseUrl: string;
  pages: SiteMapPage[];
  totalPages: number;
  scrapedPages: number;
  errorPages: number;
  startTime: string;
  endTime?: string;
  maxDepth: number;
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

// Funcție pentru extragerea descrierii de pe pagina produsului cu extragere MAXIMĂ
const extractProductDescription = async (productUrl: string): Promise<string> => {
  try {
    const cleanUrl = productUrl.startsWith('http') ? productUrl : `https://${productUrl}`;
    console.log(`Extragere COMPLETĂ descriere din: ${cleanUrl}`);
    
    // Timeout pentru a evita blocajele
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 15000); // Măresc timeout-ul
    });
    
    const productData = await Promise.race([
      handleScrape(cleanUrl, false),
      timeoutPromise
    ]);
    
    if (productData && productData.text) {
      const parser = new DOMParser();
      const productDoc = parser.parseFromString(productData.text, 'text/html');
      
      // SELECTORI EXTREM DE COMPLETI pentru descrieri
      const descriptionSelectors = [
        // Selectori specifici pentru produse
        '.product-description, .product-desc, .description',
        '.product-details, .product-info, .details',
        '.product-content, .content, .main-content',
        '[data-description], [data-desc]',
        '.tab-content, .tab-pane',
        '.product-summary, .summary',
        '.product-overview, .overview',
        '.specifications, .specs, .features',
        'article, .article',
        '.text-content, .rich-text',
        
        // Selectori avansați
        '.product-description-content, .desc-content',
        '.product-detail-description, .detail-description',
        '.product-full-description, .full-description',
        '.product-long-description, .long-description',
        '.product-info-description, .info-description',
        '.caracteristici, .caracteristici-produs',
        '.descriere, .descriere-produs',
        '.informatii, .informatii-produs',
        '.detalii, .detalii-produs',
        
        // Selectori pentru site-uri auto
        '.vehicle-description, .auto-description',
        '.car-description, .masina-description',
        '.vehicle-details, .auto-details',
        '.technical-data, .date-tehnice',
        '.equipment, .echipament',
        '.condition, .stare',
        
        // Selectori generici
        '.main-desc, .main-description',
        '.full-desc, .full-description',
        '.long-desc, .long-description',
        '.product-text, .item-text',
        '.body-text, .content-text',
        '.rich-content, .wysiwyg',
        'section[class*="desc"]',
        'div[class*="desc"]',
        'p[class*="desc"]',
        
        // Pentru tab-uri
        '#description, #descriere, #detalii',
        '.tab-description, .tab-descriere',
        '.tabcontent, .tab-content',
        '.accordion-content',
        
        // Meta și structurale
        'main, .main',
        '.container .description',
        '.row .description',
        '.col .description'
      ];

      let foundDescription = '';
      
      // Caută în toate selectorii
      for (const selector of descriptionSelectors) {
        const descElements = productDoc.querySelectorAll(selector);
        for (const descElement of descElements) {
          if (descElement && descElement.textContent?.trim()) {
            const descText = descElement.textContent.trim();
            // Verifică dacă textul este o descriere validă și nu prea scurtă
            if (descText.length > 30 && descText.length < 10000 && 
                !descText.match(/^[\d\s\.,\-€$£]+$/) && // Nu doar preturi
                !descText.toLowerCase().includes('add to cart') &&
                !descText.toLowerCase().includes('buy now') &&
                !descText.toLowerCase().includes('cookie') &&
                !descText.toLowerCase().includes('javascript')) {
              
              // Ia cea mai lungă descriere găsită
              if (descText.length > foundDescription.length) {
                foundDescription = descText;
                console.log(`Descriere îmbunătățită găsită cu ${selector}: ${descText.length} caractere`);
              }
            }
          }
        }
      }
      
      if (foundDescription) {
        return foundDescription;
      }
      
      // Fallback EXTREM - extrage din paragrafe și divuri
      const allParagraphs = productDoc.querySelectorAll('p, div');
      let bestDescription = '';
      
      for (const element of allParagraphs) {
        const text = element.textContent?.trim() || '';
        if (text.length > 100 && text.length < 5000 && 
            !text.match(/^[\d\s\.,\-€$£]+$/) && 
            !text.toLowerCase().includes('cookie') &&
            !text.toLowerCase().includes('price') &&
            !text.toLowerCase().includes('buy') &&
            text.length > bestDescription.length) {
          bestDescription = text;
        }
      }
      
      if (bestDescription.length > 50) {
        console.log(`Descriere fallback găsită: ${bestDescription.length} caractere`);
        return bestDescription;
      }
    }
  } catch (error) {
    console.warn(`Nu s-a putut extrage descrierea din ${productUrl}:`, error);
  }
  
  return '';
};

// Funcția principală de detectare a produselor
const detectProducts = async (doc: Document, targetUrl: string, deepScraping: boolean = false): Promise<Product[]> => {
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

  for (let index = 0; index < foundProducts.length; index++) {
    const productElement = foundProducts[index];
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

      // Extrage URL-ul produsului dacă există
      let productUrl = '';
      const linkSelectors = [
        'a[href*="product"], a[href*="item"], a[href*="/p/"]',
        'a[title], a.product-link, a.item-link',
        'h1 a, h2 a, h3 a, h4 a',
        '.title a, .name a, .product-title a'
      ];
      
      for (const selector of linkSelectors) {
        const linkElement = productElement.querySelector(selector);
        if (linkElement) {
          const href = linkElement.getAttribute('href');
          if (href) {
            productUrl = href.startsWith('http') ? href : new URL(href, targetUrl).href;
            break;
          }
        }
      }
      
      if (productUrl) {
        product.url = productUrl;
      }

      // Extrage descrierea - versiune MAXIMĂ
      const descSelectors = [
        // Selectori de bază
        '.description, .desc, .summary, .content, .product-description',
        '[class*="description"], [class*="desc"], [class*="summary"]',
        '.product-desc, .item-desc, .product-summary',
        '.product-details, .details, .product-info',
        '.excerpt, .short-description, .product-excerpt',
        'p[class*="desc"], div[class*="desc"]',
        '.product-content, .item-content',
        '[data-description], [data-desc]',
        '.text, .product-text, .item-text',
        
        // Selectori avansați
        '.caracteristici, .informatii, .detalii',
        '.vehicle-info, .auto-info, .car-info',
        '.masina-info, .vehicul-info',
        '.technical-specs, .tech-specs',
        '.equipment, .echipament',
        '.condition, .stare',
        '.features, .caracteristici-principale',
        
        // Selectori structurali
        '.product-item-desc, .item-description',
        '.listing-description, .listing-desc',
        '.card-description, .card-desc',
        '.tile-description, .tile-desc',
        
        // Meta și altele
        'article p, section p',
        '.main p, .content p',
        'div[class*="text"] p'
      ];

      let bestDescription = '';
      
      // Caută descripții în toate elementele posibile
      for (const selector of descSelectors) {
        const descElements = productElement.querySelectorAll(selector);
        for (const descElement of descElements) {
          if (descElement && descElement.textContent?.trim()) {
            const descText = descElement.textContent.trim();
            // Verifică dacă textul este o descriere validă și ia cea mai lungă
            if (descText.length > 20 && descText.length < 5000 && 
                !descText.match(/^[\d\s\.,\-€$£]+$/) && // Nu doar preturi
                !descText.toLowerCase().includes('add to cart') &&
                !descText.toLowerCase().includes('buy now') &&
                descText.length > bestDescription.length) {
              bestDescription = descText;
            }
          }
        }
      }
      
      if (bestDescription) {
        product.description = bestDescription;
      }

      // Dacă nu s-a găsit descriere și avem URL-ul produsului, încearcă să acceseze pagina pentru descriere
      // FĂRĂ LIMITĂRI - pentru toate produsele
      if (!product.description && productUrl && deepScraping) {
        try {
          console.log(`Încercare extragere descriere pentru produsul ${index + 1}: ${productUrl}`);
          const detailedDescription = await extractProductDescription(productUrl);
          if (detailedDescription) {
            product.description = detailedDescription;
            console.log(`Descriere extrasă cu succes pentru produsul ${index + 1}`);
          }
        } catch (error) {
          console.warn(`Nu s-a putut extrage descrierea din ${productUrl}:`, error);
          // Continuă fără a bloca procesul
        }
      }

      // Dacă tot nu s-a găsit descriere, încearcă să extragă din textul general
      if (!product.description) {
        const allText = productElement.textContent || '';
        const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 30);
        const validSentences = sentences.filter(s => 
          !s.match(/^[\d\s\.,\-€$£]+$/) && 
          !s.toLowerCase().includes('price') &&
          !s.toLowerCase().includes('buy') &&
          s.length < 500
        );
        if (validSentences.length > 0) {
          product.description = validSentences[0].trim();
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
  }

  return products;
};

// Funcția principală de extragere a conținutului
const extractAllContent = async (htmlContent: string, targetUrl: string, deepScraping: boolean = false): Promise<ScrapedData> => {
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

  const products = await detectProducts(doc, targetUrl, deepScraping);

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
const handleScrape = async (url: string, deepScraping: boolean = false): Promise<ScrapedData | null> => {
  const proxyServices = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://cors-anywhere.herokuapp.com/${url}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url
  ];

  for (let i = 0; i < proxyServices.length; i++) {
    const proxyUrl = proxyServices[i];
    
    try {
      const headers: any = {
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

      return await extractAllContent(htmlContent, url, deepScraping);
      
    } catch (err) {
      console.error(`Eroare cu proxy ${i + 1}:`, err);
      if (i === proxyServices.length - 1) {
        throw err;
      }
    }
  }
  
  return null;
};

// Hook personalizat pentru scraping complet al site-ului
const useFullSiteScraper = () => {
  const [siteMap, setSiteMap] = useState<SiteMapData | null>(null);
  const [isScrapingComplete, setIsScrapingComplete] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0, currentUrl: '' });

  const normalizeUrl = (url: string, baseUrl: string): string => {
    try {
      if (url.startsWith('//')) return 'https:' + url;
      if (url.startsWith('/')) return new URL(baseUrl).origin + url;
      if (url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:')) return '';
      if (!url.startsWith('http')) return new URL(url, baseUrl).href;
      return url;
    } catch {
      return '';
    }
  };

  const isSameDomain = (url: string, baseUrl: string): boolean => {
    try {
      const urlDomain = new URL(url).hostname;
      const baseDomain = new URL(baseUrl).hostname;
      return urlDomain === baseDomain;
    } catch {
      return false;
    }
  };

  const startFullSiteScraping = useCallback(async (baseUrl: string, maxDepth: number = 3, deepScraping: boolean = false, unlimitedScraping: boolean = false) => {
    const siteMapData: SiteMapData = {
      baseUrl,
      pages: [],
      totalPages: 0,
      scrapedPages: 0,
      errorPages: 0,
      startTime: new Date().toISOString(),
      maxDepth
    };

    setSiteMap(siteMapData);
    setIsScrapingComplete(false);

    const visitedUrls = new Set<string>();
    const urlsToVisit: Array<{ url: string; depth: number; parentUrl?: string }> = [
      { url: baseUrl, depth: 0 }
    ];

    while (urlsToVisit.length > 0 && (unlimitedScraping || visitedUrls.size < 500)) { // Folosește unlimited sau 500
      const { url, depth, parentUrl } = urlsToVisit.shift()!;
      
      if (visitedUrls.has(url) || depth > maxDepth) {
        continue;
      }

      visitedUrls.add(url);
      setCurrentProgress(prev => ({ ...prev, currentUrl: url, current: visitedUrls.size }));
      
      try {
        const pageData = await handleScrape(url, false); // Nu folosim deep scraping în full site scan pentru performanță
        if (pageData) {
          // Procesează linkurile pentru a continua crawling-ul
          pageData.links.forEach(link => {
            const normalizedUrl = normalizeUrl(link.url, baseUrl);
            if (normalizedUrl && 
                isSameDomain(normalizedUrl, baseUrl) && 
                !visitedUrls.has(normalizedUrl) && 
                urlsToVisit.length < (unlimitedScraping ? 10000 : 1000)) { // Elimin limitele dacă e unlimited
              urlsToVisit.push({ url: normalizedUrl, depth: depth + 1, parentUrl: url });
            }
          });

          setSiteMap(prev => ({
            ...prev!,
            pages: [...prev!.pages, {
              ...pageData,
              id: `page_${Date.now()}_${visitedUrls.size}`,
              depth,
              parentUrl,
              status: 'scraped' as const
            }],
            scrapedPages: prev!.scrapedPages + 1,
            totalPages: visitedUrls.size + urlsToVisit.length
          }));
        }
      } catch (error) {
        console.error(`Eroare la procesarea paginii ${url}:`, error);
        setSiteMap(prev => ({
          ...prev!,
          errorPages: prev!.errorPages + 1
        }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setSiteMap(prev => ({
      ...prev!,
      endTime: new Date().toISOString()
    }));

    setIsScrapingComplete(true);
    
  }, []);

  return {
    siteMap,
    isScrapingComplete,
    currentProgress,
    startFullSiteScraping
  };
};

// Funcții utilitare pentru export în diferite formate cu optimizare
const exportToJSON = (data: any) => {
  const optimizedData = createOptimizedJSONExport(data);
  const content = JSON.stringify(optimizedData, null, 2);
  const sizeMB = downloadOptimizedFile(content, `scraped-data-${Date.now()}.json`, 'application/json');
  
  toast({
    title: "Export JSON finalizat",
    description: `Fișier descărcat: ${sizeMB.toFixed(2)} MB (max 21MB)`,
  });
};

const exportToCSV = (products: any[]) => {
  const content = createOptimizedCSVExport(products);
  const sizeMB = downloadOptimizedFile(content, `products-${Date.now()}.csv`, 'text/csv');
  
  toast({
    title: "Export CSV finalizat",
    description: `Fișier descărcat: ${sizeMB.toFixed(2)} MB (max 21MB)`,
  });
};

const exportToHTML = (data: any) => {
  const content = createOptimizedHTMLExport(data);
  const sizeMB = downloadOptimizedFile(content, `scraped-data-${Date.now()}.html`, 'text/html');
  
  toast({
    title: "Export HTML finalizat",
    description: `Fișier descărcat: ${sizeMB.toFixed(2)} MB (max 21MB)`,
  });
};

// Componentă principală Scraping
const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [deepScraping, setDeepScraping] = useState(true); // Activez implicit pentru descrieri complete
  const [unlimitedScraping, setUnlimitedScraping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ro'); // Limba pentru scanare
  const [extractionOptions, setExtractionOptions] = useState({
    products: true,
    price: true,
    description: true,
    images: true,
    specifications: true,
    availability: true,
    brand: true,
    category: true,
    reviews: false,
    ratings: false
  });
  const [currentScanStatus, setCurrentScanStatus] = useState<{
    stage: string;
    progress: number;
    details: string;
    items: Array<{ type: string; count: number; details: string }>;
  } | null>(null);
  
  const {
    siteMap,
    isScrapingComplete,
    currentProgress,
    startFullSiteScraping
  } = useFullSiteScraper();

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
    setCurrentScanStatus({
      stage: 'Inițializare scanare',
      progress: 0,
      details: 'Se pregătește extragerea datelor...',
      items: []
    });

    try {
      // Etapa 1: Scanare pagină principală
      setCurrentScanStatus({
        stage: 'Scanare pagină principală',
        progress: 20,
        details: `Se accesează ${url}`,
        items: []
      });

      const data = await handleScrape(url, deepScraping);
      if (!data) throw new Error('Nu s-au putut extrage date');

      setCurrentScanStatus({
        stage: 'Analiza structurii site-ului',
        progress: 40,
        details: 'Se identifică tipurile de conținut...',
        items: [
          { type: 'Link-uri', count: data.links.length, details: 'link-uri găsite' },
          { type: 'Imagini', count: data.images.length, details: 'imagini detectate' },
          { type: 'Produse', count: data.products.length, details: 'produse identificate' }
        ]
      });

      // Etapa 2: Îmbunătățire descrieri produse
      let enhancedProducts = [...data.products];
      if (data.products.length > 0) {
        setCurrentScanStatus({
          stage: 'Îmbunătățire descrieri produse',
          progress: 60,
          details: 'Se extrag descrieri complete pentru produse...',
          items: [
            { type: 'Produse', count: data.products.length, details: 'produse procesate' },
            { type: 'Descrieri', count: data.products.filter(p => p.description).length, details: 'descrieri găsite' }
          ]
        });

        // Proces în paralel pentru descrieri - MAXIMUM 10 simultan pentru performanță
        const batchSize = 10;
        for (let i = 0; i < data.products.length; i += batchSize) {
          const batch = data.products.slice(i, i + batchSize);
          const enhancedBatch = await Promise.allSettled(
            batch.map(async (product, index) => {
              const actualIndex = i + index;
              setCurrentScanStatus(prev => ({
                ...prev!,
                progress: 60 + (actualIndex / data.products.length) * 30,
                details: `Se procesează produsul ${actualIndex + 1}/${data.products.length}: ${product.name.substring(0, 50)}...`,
                items: [
                  { type: 'Produse procesate', count: actualIndex + 1, details: `din ${data.products.length}` },
                  { type: 'Descrieri complete', count: enhancedProducts.filter(p => p.description && p.description.length > 100).length, details: 'descrieri detaliate' }
                ]
              }));

              if (!product.description && product.url && deepScraping) {
                const enhancedDescription = await extractProductDescription(product.url);
                return { ...product, description: enhancedDescription || product.description };
              }
              return product;
            })
          );

          // Actualizează produsele procesate
          enhancedBatch.forEach((result, index) => {
            const actualIndex = i + index;
            if (result.status === 'fulfilled') {
              enhancedProducts[actualIndex] = result.value;
            }
          });
        }
      }

      // Etapa 3: Structurare finală și traducere (dacă e cazul)
      setCurrentScanStatus({
        stage: 'Finalizare și structurare',
        progress: 90,
        details: 'Se organizează datele pentru înțelegerea optimă de către agent...',
        items: [
          { type: 'Produse finalizate', count: enhancedProducts.length, details: 'produse complete' },
          { type: 'Cu descrieri complete', count: enhancedProducts.filter(p => p.description && p.description.length > 50).length, details: 'descrieri detaliate' },
          { type: 'Cu specificații', count: enhancedProducts.filter(p => Object.keys(p.specifications).length > 0).length, details: 'produse cu specificații' }
        ]
      });

      // Crează datele finale optimizate pentru agent
      const finalData: ScrapedData = {
        ...data,
        products: enhancedProducts.map(product => ({
          ...product,
          // Structurează datele pentru înțelegerea optimă de către agent
          agentOptimizedDescription: generateAgentOptimizedDescription(product),
          // Adaugă etichete pentru categorisire rapidă
          agentTags: generateAgentTags(product),
          // Scor de completitudine informații
          completenessScore: calculateCompletenessScore(product)
        }))
      };

      setScrapedData(finalData);
      
      setCurrentScanStatus({
        stage: 'Scanare completă!',
        progress: 100,
        details: 'Toate datele au fost extrase și structurate pentru agent',
        items: [
          { type: 'Produse totale', count: finalData.products.length, details: 'produse complete' },
          { type: 'Descrieri complete', count: finalData.products.filter(p => p.description && p.description.length > 50).length, details: 'cu descrieri detaliate' },
          { type: 'Scor mediu completitudine', count: Math.round(finalData.products.reduce((acc, p) => acc + (p as any).completenessScore, 0) / finalData.products.length * 100) / 100, details: 'din 5.0' }
        ]
      });

      toast({
        title: "Scanare finalizată cu succes!",
        description: `${finalData.products.length} produse complete cu descrieri detaliate și ${finalData.links.length} link-uri`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută';
      setError(errorMessage);
      setCurrentScanStatus(null);
      toast({
        title: "Eroare la scraping",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Păstrează statusul final pentru 5 secunde apoi îl ascunde
      setTimeout(() => setCurrentScanStatus(null), 5000);
    }
  };

  const handleFullSiteScraping = async () => {
    if (!url.trim()) {
      toast({
        title: "URL necesar",
        description: "Te rog introdu un URL valid pentru scraping complet",
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

    toast({
      title: "Scraping complet început",
      description: `Se va scana site-ul la adâncimea ${maxDepth}`,
    });

    await startFullSiteScraping(url, maxDepth, deepScraping, unlimitedScraping);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Web Scraper Universal</h1>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <HardDrive className="w-4 h-4" />
            <span>Export limitat la 21MB</span>
          </div>
        </div>

        <Card className="liquid-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Extragere Date Website
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Introdu URL-ul site-ului (ex: https://example.com)"
                className="glass-input"
              />
            </div>

            {/* Selector limbă */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Limba pentru scanare</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { code: 'ro', label: 'Română', flag: '🇷🇴' },
                  { code: 'en', label: 'English', flag: '🇺🇸' },
                  { code: 'es', label: 'Español', flag: '🇪🇸' },
                  { code: 'fr', label: 'Français', flag: '🇫🇷' },
                  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
                  { code: 'pt', label: 'Português', flag: '🇵🇹' },
                  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                  { code: 'zh', label: '中文', flag: '🇨🇳' },
                  { code: 'ja', label: '日本語', flag: '🇯🇵' },
                  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                  { code: 'auto', label: 'Auto-detect', flag: '🌐' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`p-2 rounded-lg border text-xs transition-all hover:scale-105 ${
                      selectedLanguage === lang.code
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-background border-border hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Limba selectată va fi folosită pentru extragerea și structurarea optimă a informațiilor pentru agent
              </p>
            </div>

            {/* Extraction Options */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-semibold text-lg">🎯 Opțiuni de Extragere</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="products"
                    checked={extractionOptions.products}
                    onChange={(e) => setExtractionOptions(prev => ({ ...prev, products: e.target.checked }))}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="products" className="text-sm font-medium">
                    🛍️ Produse (prioritate maximă)
                  </label>
                </div>

                <div className="ml-6 grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="price"
                      checked={extractionOptions.price}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, price: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="price" className="text-sm">💰 Preț</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="description"
                      checked={extractionOptions.description}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, description: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="description" className="text-sm">📝 Descriere</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="images"
                      checked={extractionOptions.images}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, images: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="images" className="text-sm">📸 Imagini</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="specifications"
                      checked={extractionOptions.specifications}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, specifications: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="specifications" className="text-sm">⚙️ Specificații</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="availability"
                      checked={extractionOptions.availability}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, availability: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="availability" className="text-sm">📦 Disponibilitate</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="brand"
                      checked={extractionOptions.brand}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, brand: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="brand" className="text-sm">🏷️ Brand</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="category"
                      checked={extractionOptions.category}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, category: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="category" className="text-sm">📂 Categorie</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="reviews"
                      checked={extractionOptions.reviews}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, reviews: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="reviews" className="text-sm">💬 Recenzii</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ratings"
                      checked={extractionOptions.ratings}
                      onChange={(e) => setExtractionOptions(prev => ({ ...prev, ratings: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={!extractionOptions.products}
                    />
                    <label htmlFor="ratings" className="text-sm">⭐ Rating</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Toate controalele pe un singur rând */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Scanare profundă */}
              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setDeepScraping(!deepScraping)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${deepScraping ? 'bg-primary border-primary' : 'border-border'}`}>
                  {deepScraping && <div className="w-2 h-2 bg-primary-foreground rounded-sm"></div>}
                </div>
                <span className="text-sm text-foreground">Scanare profundă</span>
              </div>
              
              {/* Scanare nelimitată */}
              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setUnlimitedScraping(!unlimitedScraping)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${unlimitedScraping ? 'bg-primary border-primary' : 'border-border'}`}>
                  {unlimitedScraping && <div className="w-2 h-2 bg-primary-foreground rounded-sm"></div>}
                </div>
                <span className="text-sm text-foreground">Scanare nelimitată</span>
              </div>
              
              {/* Extrage date */}
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extrage date
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Extrage date
                  </>
                )}
              </button>

              {/* Adâncime */}
              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg">
                <span className="text-sm text-foreground">Adâncime:</span>
                <select
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="bg-transparent border-none text-sm text-foreground focus:outline-none cursor-pointer"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              
              {/* Scanează site */}
              <button
                onClick={handleFullSiteScraping}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-foreground"
              >
                <Globe className="w-4 h-4" />
                Scanează site
              </button>
            </div>

            {/* Progres scanare în timp real */}
            {currentScanStatus && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="font-medium text-foreground">{currentScanStatus.stage}</span>
                  </div>
                  <span className="text-sm text-primary font-medium">{currentScanStatus.progress}%</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                    style={{ width: `${currentScanStatus.progress}%` }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground animate-fade-in">
                  {currentScanStatus.details}
                </p>
                
                {currentScanStatus.items.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 animate-slide-in-right">
                    {currentScanStatus.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-background/50 p-2 rounded border border-border/50">
                        <span className="text-xs text-foreground font-medium">{item.type}:</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-primary">{item.count}</span>
                          <p className="text-xs text-muted-foreground">{item.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentProgress.currentUrl && !currentScanStatus && (
              <div className="text-sm text-muted-foreground animate-fade-in">
                Se procesează: {currentProgress.currentUrl}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Eroare:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {scrapedData && (
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Rezultate Scraping
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportToJSON(scrapedData)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                  <span className="text-xs opacity-70">(≤21MB)</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportToCSV(scrapedData.products)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                  <span className="text-xs opacity-70">(≤21MB)</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportToHTML(scrapedData)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export HTML
                  <span className="text-xs opacity-70">(≤21MB)</span>
                </Button>
              </div>
              
              {/* Informații despre dimensiune */}
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Optimizare automată:</span>
                  <span className="text-muted-foreground">
                    Fișierele vor fi automat optimizate pentru a nu depăși 21MB.
                    Dacă datele sunt prea multe, descrierile vor fi scurtate și va fi exportat un număr limitat de produse.
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Prezentare</TabsTrigger>
                  <TabsTrigger value="products">
                    Produse ({scrapedData.products.length})
                  </TabsTrigger>
                  <TabsTrigger value="links">
                    Link-uri ({scrapedData.links.length})
                  </TabsTrigger>
                  <TabsTrigger value="images">
                    Imagini ({scrapedData.images.length})
                  </TabsTrigger>
                  <TabsTrigger value="content">Conținut</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{scrapedData.products.length}</p>
                            <p className="text-sm text-muted-foreground">Produse</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Link className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">{scrapedData.links.length}</p>
                            <p className="text-sm text-muted-foreground">Link-uri</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Image className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-2xl font-bold">{scrapedData.images.length}</p>
                            <p className="text-sm text-muted-foreground">Imagini</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-2xl font-bold">{scrapedData.headings.length}</p>
                            <p className="text-sm text-muted-foreground">Titluri</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Informații Site</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Titlu:</p>
                        <p className="text-sm text-muted-foreground">{scrapedData.title}</p>
                      </div>
                      <div>
                        <p className="font-medium">URL:</p>
                        <p className="text-sm text-muted-foreground break-all">{scrapedData.url}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-medium">Descriere:</p>
                        <p className="text-sm text-muted-foreground">{scrapedData.description}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="products">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Produse Extrase - Vizualizare CSV</h3>
                      <Button
                        onClick={() => exportToCSV(scrapedData.products)}
                        size="sm"
                        variant="outline"
                        className="elevenlabs-button-secondary"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descarcă CSV
                      </Button>
                    </div>
                    
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 max-h-[500px] overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted border-b">
                            <tr>
                              <th className="text-left p-3 font-medium min-w-[200px]">Nume</th>
                              <th className="text-left p-3 font-medium min-w-[100px]">Preț</th>
                              <th className="text-left p-3 font-medium min-w-[120px]">Categorie</th>
                              <th className="text-left p-3 font-medium min-w-[100px]">Brand</th>
                              <th className="text-left p-3 font-medium min-w-[120px]">Disponibilitate</th>
                              <th className="text-left p-3 font-medium min-w-[300px]">Descriere</th>
                              <th className="text-left p-3 font-medium min-w-[80px]">URL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scrapedData.products.map((product: any, index: number) => (
                              <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="p-3 font-medium">{product.name || '-'}</td>
                                <td className="p-3">{product.price ? `${product.price} ${product.currency || ''}` : '-'}</td>
                                <td className="p-3">{product.category || '-'}</td>
                                <td className="p-3">{product.brand || '-'}</td>
                                <td className="p-3">{product.availability || '-'}</td>
                                <td className="p-3 max-w-[300px]">
                                  {product.description ? (
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">
                                        {product.description.length > 200 
                                          ? `${product.description.substring(0, 200)}...` 
                                          : product.description}
                                      </p>
                                      {product.description.length > 200 && (
                                        <details className="cursor-pointer">
                                          <summary className="text-xs text-primary hover:underline">Vezi tot</summary>
                                          <p className="text-xs mt-1">{product.description}</p>
                                        </details>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground italic text-xs">
                                      Fără descriere
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {product.url ? (
                                    <a href={product.url} target="_blank" rel="noopener noreferrer" 
                                       className="text-primary hover:underline text-xs">
                                      Vezi
                                    </a>
                                  ) : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      <strong>Total produse:</strong> {scrapedData.products.length} | 
                      <strong> Cu descriere:</strong> {scrapedData.products.filter((p: any) => p.description).length} |
                      <strong> Fără descriere:</strong> {scrapedData.products.filter((p: any) => !p.description).length}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="links">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {scrapedData.links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <Link className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{link.text}</p>
                            <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {link.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="images">
                  <ScrollArea className="h-[600px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scrapedData.images.map((image, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-2">
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                              {image.src ? (
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  className="max-w-full max-h-full object-contain rounded-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Image className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate" title={image.alt}>
                                {image.alt || 'Fără descriere'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate" title={image.src}>
                                {image.src}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="content">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Titluri Găsite</h4>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-1">
                          {scrapedData.headings.map((heading, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                H{heading.level}
                              </Badge>
                              <span className="text-sm">{heading.text}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Conținut Text</h4>
                      <ScrollArea className="h-[300px]">
                        <Textarea
                          value={scrapedData.text.substring(0, 2000) + (scrapedData.text.length > 2000 ? '...' : '')}
                          readOnly
                          className="min-h-[280px] resize-none"
                        />
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {siteMap && (
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle>Scraping Complet Site - Progres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{siteMap.pages.length}</p>
                    <p className="text-sm text-muted-foreground">Pagini procesate</p>
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
                      Export Site Map JSON
                    </Button>
                    <Button
                      onClick={() => exportToCSV(siteMap.pages.flatMap(page => page.products))}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Toate Produsele CSV
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scraping;
