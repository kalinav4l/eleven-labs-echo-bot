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
import { Search, Download, Globe, Package, Image, Link, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

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

// Proxy-uri noi și funcționale
const proxyList = [
  'https://cors.bridged.cc/', // Proxy nou, foarte rapid
  'https://proxy.cors.sh/', // Proxy specialized pentru scraping
  'https://corsproxy.org/?', // Proxy stabil
  'https://api.allorigins.win/raw?url=', // Backup cunoscut
  'https://yacdn.org/proxy/', // Proxy avansat
  'https://cors-anywhere.herokuapp.com/', // Ultimul fallback
];

// Sistem inteligent de cache pentru optimizare
const urlCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute

// Funcția îmbunătățită handleScrape cu sistem avansat de retry și fallback
const handleScrape = async (targetUrl: string, useProxy: boolean = true): Promise<any> => {
  console.log(`🔍 Scraping avansat pentru: ${targetUrl}`);
  
  // Verifică cache-ul mai întâi
  const cacheKey = targetUrl;
  const cached = urlCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Folosind date din cache pentru ${targetUrl}`);
    return cached.data;
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout după 15 secunde')), 15000);
  });

  const tryProxyRequest = async (proxy: string, index: number): Promise<any> => {
    try {
      const proxiedUrl = proxy.includes('allorigins') 
        ? proxy + encodeURIComponent(targetUrl)
        : proxy + targetUrl;
      
      console.log(`🚀 Proxy ${index + 1}/${proxyList.length}: ${proxy.split('/')[2]}...`);
      
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let responseData;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const jsonData = await response.json();
        responseData = { text: jsonData.contents || jsonData.data || jsonData.text || '' };
      } else {
        const htmlText = await response.text();
        responseData = { text: htmlText };
      }

      // Salvează în cache dacă succesul
      urlCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });

      console.log(`✅ Proxy ${index + 1} a funcționat! Dimensiune: ${responseData.text?.length || 0} caractere`);
      return responseData;
      
    } catch (error) {
      console.warn(`❌ Proxy ${index + 1} eșuat:`, error.message);
      throw error;
    }
  };

  if (!useProxy) {
    try {
      console.log(`🌐 Încercare directă fără proxy...`);
      const response = await Promise.race([
        fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }),
        timeoutPromise
      ]);
      const data = { text: await response.text() };
      
      // Salvează în cache
      urlCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('❌ Conexiune directă eșuată:', error);
      throw error;
    }
  }

  // Încearcă proxy-urile unul câte unul, în paralel pentru primele 3
  const promises = proxyList.slice(0, 3).map((proxy, index) => 
    tryProxyRequest(proxy, index)
  );

  try {
    // Încearcă primele 3 proxy-uri în paralel
    return await Promise.race([
      Promise.race(promises),
      timeoutPromise
    ]);
  } catch (error) {
    console.warn('🔄 Primele proxy-uri au eșuat, încearcă backup-urile...');
    
    // Încearcă proxy-urile de backup unul câte unul
    for (let i = 3; i < proxyList.length; i++) {
      try {
        return await Promise.race([
          tryProxyRequest(proxyList[i], i),
          timeoutPromise
        ]);
      } catch (backupError) {
        console.warn(`Proxy backup ${i + 1} eșuat`);
        continue;
      }
    }
    
    throw new Error('🚫 Toate proxy-urile au eșuat - site-ul poate fi blocat sau indisponibil');
  }
};

// Funcție ULTRA-AVANSATĂ pentru extragerea descrierii de pe pagina produsului
const extractProductDescription = async (productUrl: string): Promise<string> => {
  try {
    const cleanUrl = productUrl.startsWith('http') ? productUrl : `https://${productUrl}`;
    console.log(`🔍 Extragere ULTRA-COMPLETĂ descriere din: ${cleanUrl}`);
    
    // Timeout mărit pentru site-uri complexe
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout după 20 secunde')), 20000);
    });
    
    // Încearcă mai multe strategii în paralel
    const strategies = [
      () => handleScrape(cleanUrl, true),  // Cu proxy
      () => handleScrape(cleanUrl, false), // Fără proxy
    ];
    
    let productData;
    for (const strategy of strategies) {
      try {
        productData = await Promise.race([strategy(), timeoutPromise]);
        if (productData?.text) break;
      } catch (error) {
        console.warn('Strategie eșuată, încearcă următoarea...');
        continue;
      }
    }
    
    if (productData && productData.text) {
      const parser = new DOMParser();
      const productDoc = parser.parseFromString(productData.text, 'text/html');
      
      // SELECTORI ULTRA-COMPLETI pentru descrieri (peste 100 de variante)
      const descriptionSelectors = [
        // Selectori directi pentru descrieri
        '.product-description, .product-desc, .description, .desc',
        '.product-details, .product-info, .details, .info',
        '.product-content, .content, .main-content',
        '.product-summary, .summary, .overview',
        '.product-overview, .product-about',
        
        // Selectori cu atribute data
        '[data-description], [data-desc], [data-content]',
        '[data-product-description], [data-product-info]',
        '[data-details], [data-summary]',
        
        // Selectori pentru tab-uri și acordeonuri
        '.tab-content, .tab-pane, .tabcontent',
        '.tab-description, .tab-descriere, .tab-detalii',
        '.accordion-content, .collapse-content',
        '.panel-body, .panel-content',
        
        // ID-uri comune
        '#description, #descriere, #detalii, #informatii',
        '#product-description, #product-details',
        '#content, #main-content, #product-content',
        '#overview, #summary, #about',
        
        // Selectori pentru magazine românești
        '.caracteristici, .caracteristici-produs',
        '.descriere, .descriere-produs, .descriere-completa',
        '.informatii, .informatii-produs, .informatii-complete',
        '.detalii, .detalii-produs, .detalii-complete',
        '.specificatii, .specificatii-tehnice',
        '.prezentare, .prezentare-produs',
        
        // Selectori pentru site-uri auto
        '.vehicle-description, .auto-description, .car-description',
        '.masina-description, .vehicul-description',
        '.vehicle-details, .auto-details, .car-details',
        '.masina-details, .vehicul-details',
        '.technical-data, .date-tehnice, .specificatii-tehnice',
        '.equipment, .echipament, .dotari',
        '.condition, .stare, .conditie',
        '.history, .istoric, .istoricul',
        
        // Selectori pentru magazine de haine
        '.product-composition, .composition',
        '.care-instructions, .instructiuni-ingrijire',
        '.size-guide, .ghid-marimi',
        '.material, .material-info',
        
        // Selectori pentru electronice
        '.tech-specs, .technical-specifications',
        '.features, .feature-list, .caracteristici-tehnice',
        '.compatibility, .compatibilitate',
        '.warranty, .garantie',
        
        // Selectori generici avansați
        '.main-desc, .main-description, .primary-description',
        '.full-desc, .full-description, .complete-description',
        '.long-desc, .long-description, .detailed-description',
        '.product-text, .item-text, .listing-text',
        '.body-text, .content-text, .main-text',
        '.rich-content, .wysiwyg, .editor-content',
        '.user-content, .custom-content',
        
        // Selectori structurali
        'main .description, main .content',
        'article .description, article .content',
        'section .description, section .content',
        '.container .description, .container .content',
        '.row .description, .col .description',
        '.product-page .description',
        '.item-page .description',
        
        // Selectori cu clase parțiale
        '[class*="description"], [class*="desc"]',
        '[class*="details"], [class*="info"]',
        '[class*="content"], [class*="summary"]',
        '[class*="features"], [class*="specs"]',
        '[class*="caracteristici"], [class*="informatii"]',
        
        // Selectori pentru paragrafe și diviziuni
        'div[class*="desc"], p[class*="desc"]',
        'div[class*="details"], p[class*="details"]',
        'div[class*="info"], p[class*="info"]',
        'section[class*="desc"], section[class*="details"]',
        
        // Selectori pentru structuri complexe
        '.product-info-tabs .description',
        '.product-details-tabs .content',
        '.product-accordion .description',
        '.specification-table ~ .description',
        '.price-box ~ .description',
        
        // Fallback-uri finale
        'main, .main, article, .article',
        '.primary-content, .secondary-content',
        '.product-wrapper .content',
        '.item-wrapper .content'
      ];

      let foundDescription = '';
      let bestScore = 0;
      
      console.log(`🔍 Căutare în ${descriptionSelectors.length} selectori...`);
      
      // Caută în toate selectorii cu sistem de scoring
      for (const selector of descriptionSelectors) {
        try {
          const descElements = productDoc.querySelectorAll(selector);
          for (const descElement of descElements) {
            if (descElement && descElement.textContent?.trim()) {
              const descText = descElement.textContent.trim();
              
              // Sistem avansat de scoring pentru descrieri
              let score = 0;
              
              // Punctaj pentru lungime (optim între 100-3000 caractere)
              if (descText.length >= 100 && descText.length <= 3000) {
                score += Math.min(descText.length / 10, 100);
              } else if (descText.length > 50 && descText.length < 100) {
                score += 20; // Descripții scurte, dar utile
              }
              
              // Punctaj pentru cuvinte cheie relevante
              const keywords = [
                'caracteristici', 'specificații', 'descriere', 'detalii',
                'features', 'specifications', 'description', 'details',
                'produs', 'product', 'item', 'vehicul', 'mașină',
                'material', 'dimensiuni', 'greutate', 'culoare'
              ];
              
              keywords.forEach(keyword => {
                if (descText.toLowerCase().includes(keyword)) {
                  score += 10;
                }
              });
              
              // Penalizare pentru conținut neutil
              const badWords = [
                'add to cart', 'buy now', 'cumpără acum', 'adaugă în coș',
                'cookies', 'javascript', 'loading', 'error',
                'subscribe', 'newsletter', 'follow us'
              ];
              
              badWords.forEach(badWord => {
                if (descText.toLowerCase().includes(badWord)) {
                  score -= 20;
                }
              });
              
              // Penalizare pentru texte care sunt doar numere/prețuri
              if (/^[\d\s\.,\-€$£lei]+$/.test(descText)) {
                score -= 50;
              }
              
              // Bonificație pentru selectori mai specifici
              if (selector.includes('description') || selector.includes('desc')) {
                score += 15;
              }
              if (selector.includes('product')) {
                score += 10;
              }
              if (selector.includes('caracteristici') || selector.includes('informatii')) {
                score += 20; // Bonus pentru română
              }
              
              // Actualizează dacă este cea mai bună descriere până acum
              if (score > bestScore && score > 30) { // Minim 30 puncte pentru a fi considerată
                bestScore = score;
                foundDescription = descText;
                console.log(`🎯 Descriere nouă găsită cu ${selector}: ${descText.length} chars, scor: ${score}`);
              }
            }
          }
        } catch (selectorError) {
          // Ignore erori de selectori
        }
      }
      
      if (foundDescription && bestScore > 30) {
        console.log(`✅ Descriere finală găsită: ${foundDescription.length} caractere, scor: ${bestScore}`);
        return foundDescription;
      }
      
      // Fallback EXTREM - extragere inteligentă din toate elementele
      console.log(`🔄 Fallback: căutare în toate elementele...`);
      const allElements = productDoc.querySelectorAll('p, div, span, li, td, th');
      let bestFallbackDescription = '';
      let bestFallbackScore = 0;
      
      for (const element of allElements) {
        const text = element.textContent?.trim() || '';
        if (text.length >= 80 && text.length <= 5000) {
          let score = 0;
          
          // Scoring pentru fallback
          score += Math.min(text.length / 15, 50);
          
          // Verifică dacă conține cuvinte relevante
          if (/\b(caracteristici|specificații|descriere|features|specs|produs|product)\b/i.test(text)) {
            score += 25;
          }
          
          // Penalizare pentru conținut de navigare/UI
          if (/\b(menu|navigation|header|footer|sidebar|cookie|login|register)\b/i.test(text)) {
            score -= 30;
          }
          
          if (score > bestFallbackScore && score > 20) {
            bestFallbackScore = score;
            bestFallbackDescription = text;
          }
        }
      }
      
      if (bestFallbackDescription.length > 60) {
        console.log(`🆘 Descriere fallback găsită: ${bestFallbackDescription.length} caractere, scor: ${bestFallbackScore}`);
        return bestFallbackDescription;
      }
    }
  } catch (error) {
    console.error(`❌ Eroare la extragerea descrierii din ${productUrl}:`, error);
  }
  
  return '';
};

// Funcția principală de detectare a produselor ULTRA-AVANSATĂ
const detectProducts = async (doc: Document, targetUrl: string, deepScraping: boolean = false, updateProgress?: (message: string) => void): Promise<Product[]> => {
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

  console.log(`🛍️ Găsite ${foundProducts.length} produse potențiale în ${targetUrl}`);

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

      // Extrage numele produsului cu selectori îmbunătățiți
      const titleSelectors = [
        'h1, h2, h3, h4, h5, h6',
        '.title, .name, .product-title, .product-name',
        '[class*="title"], [class*="name"]',
        'a[title]',
        '.item-title, .listing-title',
        '[data-title], [data-name]'
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

      // Extrage informațiile despre preț cu algoritm îmbunătățit
      const priceInfo = extractPriceInfo(productElement);
      product.price = priceInfo.price;
      product.originalPrice = priceInfo.originalPrice;
      product.discount = priceInfo.discount;
      product.discountPercentage = priceInfo.discountPercentage;
      product.currency = priceInfo.currency;

      // Extrage URL-ul produsului cu selectori îmbunătățiți
      let productUrl = '';
      const linkSelectors = [
        'a[href*="product"], a[href*="item"], a[href*="/p/"]',
        'a[title], a.product-link, a.item-link',
        'h1 a, h2 a, h3 a, h4 a',
        '.title a, .name a, .product-title a',
        '[data-url], [data-link]'
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

      // Extrage descrierea cu selectori ULTRA-AVANSAȚI
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
        '.specifications, .specs, .features'
      ];

      let bestDescription = '';
      for (const selector of descSelectors) {
        const descElement = productElement.querySelector(selector);
        if (descElement && descElement.textContent?.trim()) {
          const descText = descElement.textContent.trim();
          if (descText.length > 20 && descText.length < 2000 && 
              !descText.match(/^[\d\s\.,\-€$£]+$/) &&
              descText.length > bestDescription.length) {
            bestDescription = descText;
          }
        }
      }
      product.description = bestDescription;

      // Extrage imaginile cu algoritm avansat
      product.images = extractAllImages(productElement, targetUrl);

      // Extrage specificațiile cu algoritm îmbunătățit
      product.specifications = extractSpecifications(productElement);

      // Deep scraping ULTRA-AVANSAT pentru descrieri complete
      if (deepScraping && productUrl && productUrl !== targetUrl) {
        console.log(`🚀 Deep scraping ULTRA pentru produs: ${product.name}`);
        
        try {
          // Timeout pentru fiecare produs individual
          const descriptionPromise = extractProductDescription(productUrl);
          const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout per produs')), 25000);
          });
          
          const detailedDescription = await Promise.race([
            descriptionPromise,
            timeoutPromise
          ]);
          
          if (detailedDescription && detailedDescription.length > Math.max(product.description.length, 50)) {
            product.description = detailedDescription;
            console.log(`✅ Descriere ULTRA îmbunătățită pentru: ${product.name} (${detailedDescription.length} caractere)`);
            
            // Actualizează progresul în timp real
            if (updateProgress) {
              updateProgress(`Descriere extrasă pentru: ${product.name.substring(0, 40)}...`);
            }
          } else {
            console.log(`⚠️ Descriere insuficientă pentru: ${product.name}`);
          }
        } catch (error) {
          console.warn(`❌ Deep scraping eșuat pentru ${product.name}:`, error.message);
          // Continuă cu următorul produs, nu se oprește
        }
      }

      // Adaugă produsul dacă are informații de bază
      if (product.name || product.price || product.images.length > 0) {
        products.push(product);
        if (updateProgress) {
          updateProgress(`Produs găsit: ${product.name || 'Produs fără nume'}`);
        }
      }

    } catch (error) {
      console.error(`Eroare la procesarea produsului ${index}:`, error);
    }
  }

  console.log(`✅ Extragere finalizată: ${products.length} produse procesate din ${foundProducts.length} potențiale`);
  return products;
};

const Scraping: React.FC = () => {
  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [deepScraping, setDeepScraping] = useState(false);
  const [unlimitedScraping, setUnlimitedScraping] = useState(false);
  const [extractData, setExtractData] = useState(true);
  const [maxDepth, setMaxDepth] = useState(4);
  const [siteMapData, setSiteMapData] = useState<SiteMapData | null>(null);
  const [isFullSiteMode, setIsFullSiteMode] = useState(false);
  const [currentProgress, setCurrentProgress] = useState('');

  const handleSinglePageScraping = async () => {
    if (!url.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un URL valid",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setIsFullSiteMode(false);
    setSiteMapData(null);
    setScrapedData(null);

    try {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      console.log('Încep scraping pentru:', cleanUrl);

      const response = await handleScrape(cleanUrl);
      
      if (!response || !response.text) {
        throw new Error('Nu s-au putut obține datele de la URL');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(response.text, 'text/html');
      
      const extractedData: ScrapedData = {
        url: cleanUrl,
        title: doc.title || '',
        description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
        text: doc.body?.textContent?.trim() || '',
        links: [],
        images: [],
        metadata: {},
        headings: [],
        forms: [],
        scripts: [],
        styles: [],
        products: [],
        timestamp: new Date().toISOString()
      };

      // Extrage produsele
      extractedData.products = await detectProducts(doc, cleanUrl, deepScraping);

      // Extrage linkurile
      const links = Array.from(doc.querySelectorAll('a[href]'));
      extractedData.links = links.map(link => ({
        url: link.getAttribute('href') || '',
        text: link.textContent?.trim() || '',
        type: 'internal'
      }));

      // Extrage imaginile
      extractedData.images = extractAllImages(doc.body || doc.documentElement, cleanUrl);

      setScrapedData(extractedData);

      toast({
        title: "Scraping completat!",
        description: `Găsite ${extractedData.products.length} produse și ${extractedData.images.length} imagini`,
      });

    } catch (error) {
      console.error('Eroare în scraping:', error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la scraping",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFullSiteScraping = async () => {
    if (!url.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un URL valid",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setIsFullSiteMode(true);
    setSiteMapData(null);
    setScrapedData(null);
    setCurrentProgress(''); // Reset progres

    console.log('🚀 === ÎNCEPERE SCANARE ULTRA-AVANSATĂ ===');
    console.log('URL:', url);
    console.log('Adâncime maximă:', maxDepth);
    console.log('Scanare profundă:', deepScraping);
    console.log('Scanare nelimitată:', unlimitedScraping);
    console.log('Extragere date:', extractData);

    try {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      const baseUrl = new URL(cleanUrl).origin;
      
      const initialSiteMap: SiteMapData = {
        baseUrl,
        pages: [],
        totalPages: 0,
        scrapedPages: 0,
        errorPages: 0,
        startTime: new Date().toISOString(),
        maxDepth
      };

      setSiteMapData(initialSiteMap);
      setCurrentProgress('🔍 Scanez pagina principală...');

      // Pas 1: Scanare ULTRA-AVANSATĂ a paginii principale
      console.log('🎯 Pas 1: Scanare ULTRA-AVANSATĂ a paginii principale...');
      let mainPageData;
      
      // Încearcă multiple strategii pentru pagina principală
      try {
        mainPageData = await handleScrape(cleanUrl);
      } catch (error) {
        console.warn('Prima încercare a eșuat, încearcă din nou...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        mainPageData = await handleScrape(cleanUrl);
      }
      
      if (!mainPageData || !mainPageData.text) {
        throw new Error('Nu s-au putut obține datele paginii principale după multiple încercări');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(mainPageData.text, 'text/html');
      
      setCurrentProgress('🔗 Extrag linkurile site-ului...');

      // Extragere ULTRA-AVANSATĂ a linkurilor
      const allLinks = Array.from(doc.querySelectorAll('a[href], area[href], link[href]'))
        .map(link => link.getAttribute('href'))
        .filter(href => href && href.trim() !== '' && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#'))
        .map(href => {
          try {
            if (href!.startsWith('/')) return new URL(href!, baseUrl).href;
            if (href!.startsWith('http')) return href!;
            return new URL(href!, cleanUrl).href;
          } catch {
            return null;
          }
        })
        .filter(url => url && url.startsWith(baseUrl))
        .filter((url, index, arr) => arr.indexOf(url) === index);

      // Detectare INTELIGENTĂ a tipurilor de pagini
      const categorizedLinks = {
        products: allLinks.filter(url => 
          /(\/(produs|product|item|p|articol)[\/-])/i.test(url) || 
          /id=\d+/i.test(url) ||
          /[\/-](masini|cars|auto|vehicule)[\/-]/i.test(url)
        ),
        categories: allLinks.filter(url => 
          /(\/(categorie|category|cat|sectiune)[\/-])/i.test(url)
        ),
        other: allLinks.filter(url => 
          !(/\/(produs|product|item|p|articol|categorie|category)[\/-]/i.test(url))
        )
      };

      console.log(`📊 Linkuri categorized: ${categorizedLinks.products.length} produse, ${categorizedLinks.categories.length} categorii, ${categorizedLinks.other.length} altele`);

      // Prioritizează produsele și categoriile
      const prioritizedLinks = [
        ...categorizedLinks.products.slice(0, unlimitedScraping ? 200 : 30),
        ...categorizedLinks.categories.slice(0, unlimitedScraping ? 50 : 10),
        ...categorizedLinks.other.slice(0, unlimitedScraping ? 100 : 20)
      ];

      console.log(`🎯 Se vor procesa ${prioritizedLinks.length} linkuri prioritizate din ${allLinks.length} totale`);

      // Creează lista OPTIMIZATĂ de pagini de procesat
      
      // Adaugă pagina principală cu prioritate maximă
      const pagesToProcess: SiteMapPage[] = [];
      pagesToProcess.push({
        id: `page_${Date.now()}_0`,
        url: cleanUrl,
        title: doc.title || '',
        description: '',
        keywords: '',
        text: '',
        links: [],
        images: [],
        metadata: {},
        headings: [],
        forms: [],
        scripts: [],
        styles: [],
        products: [],
        timestamp: new Date().toISOString(),
        depth: 0,
        status: 'pending'
      });

      // Adaugă linkurile prioritizate
      prioritizedLinks.forEach((linkUrl, index) => {
        if (linkUrl !== cleanUrl) {
          pagesToProcess.push({
            id: `page_${Date.now()}_${index + 1}`,
            url: linkUrl,
            title: '',
            description: '',
            keywords: '',
            text: '',
            links: [],
            images: [],
            metadata: {},
            headings: [],
            forms: [],
            scripts: [],
            styles: [],
            products: [],
            timestamp: new Date().toISOString(),
            depth: 1,
            parentUrl: cleanUrl,
            status: 'pending'
          });
        }
      });

      const updatedSiteMap = {
        ...initialSiteMap,
        pages: pagesToProcess,
        totalPages: pagesToProcess.length
      };
      setSiteMapData(updatedSiteMap);

      console.log(`🚀 Pas 2: Procesare ULTRA-AVANSATĂ a ${pagesToProcess.length} pagini...`);

      // Funcție helper pentru actualizarea progresului
      const updateProgress = (message: string) => {
        setCurrentProgress(message);
      };

      // Procesare ULTRA-AVANSATĂ cu PARALLELISM CONTROLAT
      const BATCH_SIZE = 3; // Procesează 3 pagini în paralel pentru optimizare
      
      for (let batchStart = 0; batchStart < pagesToProcess.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, pagesToProcess.length);
        const currentBatch = pagesToProcess.slice(batchStart, batchEnd);
        
        console.log(`🔄 Procesez batch ${Math.floor(batchStart/BATCH_SIZE) + 1}/${Math.ceil(pagesToProcess.length/BATCH_SIZE)}: pagini ${batchStart + 1}-${batchEnd}`);
        updateProgress(`📄 Procesez paginile ${batchStart + 1}-${batchEnd} din ${pagesToProcess.length}...`);

        // Procesează batch-ul în paralel
        const batchPromises = currentBatch.map(async (page, batchIndex) => {
          const globalIndex = batchStart + batchIndex;
          
          try {
            console.log(`⚡ Procesează pagina ${globalIndex + 1}/${pagesToProcess.length}: ${page.url}`);
            
            let pageData;
            if (globalIndex === 0) {
              // Folosește datele deja încărcate pentru prima pagină
              pageData = mainPageData;
            } else {
              // Pentru alte pagini, încearcă cu strategii multiple
              try {
                pageData = await handleScrape(page.url);
              } catch (error) {
                console.warn(`Retry pentru pagina ${globalIndex + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                pageData = await handleScrape(page.url);
              }
            }

            if (pageData && pageData.text) {
              const pageDoc = parser.parseFromString(pageData.text, 'text/html');
              
              // Extragere ULTRA-AVANSATĂ a informațiilor
              const title = pageDoc.title || '';
              const metaDescription = pageDoc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
              const metaKeywords = pageDoc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
              
              // Extrage textul principal cu filtrare avansată
              const mainContent = pageDoc.querySelector('main, .main-content, .content, article, .article') || pageDoc.body;
              const textContent = mainContent?.textContent?.trim() || '';
              
              // Extrage linkurile cu categorisire
              const pageLinks = Array.from(pageDoc.querySelectorAll('a[href]')).map(link => ({
                url: link.getAttribute('href') || '',
                text: link.textContent?.trim() || '',
                type: 'internal'
              }));

              // Extrage imaginile cu algorim avansat
              const pageImages = extractAllImages(pageDoc.body || pageDoc.documentElement, page.url);
              
              updateProgress(`🛍️ Extrag produsele din: ${title.substring(0, 30)}...`);
              
              // Extrage produsele cu algoritm ULTRA-AVANSAT
              const pageProducts = await detectProducts(pageDoc, page.url, deepScraping, updateProgress);
              
              // Actualizează pagina cu toate datele
              page.title = title;
              page.description = metaDescription;
              page.keywords = metaKeywords;
              page.text = textContent.substring(0, 10000); // Mărim limita pentru mai multe detalii
              page.links = pageLinks;
              page.images = pageImages;
              page.products = pageProducts;
              page.status = 'scraped';
              
              console.log(`✅ Pagina ${globalIndex + 1} ULTRA procesată: ${pageProducts.length} produse găsite, ${pageImages.length} imagini`);
            } else {
              page.status = 'error';
              page.error = 'Nu s-au putut obține datele';
              console.log(`❌ Eroare la pagina ${globalIndex + 1}: Nu s-au putut obține datele`);
            }
          } catch (error) {
            console.error(`❌ Eroare la procesarea paginii ${globalIndex + 1}:`, error);
            page.status = 'error';
            page.error = error.message;
          }
        });

        // Așteaptă să se termine toate din batch
        await Promise.allSettled(batchPromises);

        // Actualizează progresul după fiecare batch
        const updatedSiteMapProgress = {
          ...updatedSiteMap,
          pages: [...pagesToProcess],
          scrapedPages: pagesToProcess.filter(p => p.status === 'scraped').length,
          errorPages: pagesToProcess.filter(p => p.status === 'error').length
        };
        setSiteMapData(updatedSiteMapProgress);

        // Pauză inteligentă între batch-uri pentru a evita rate limiting
        if (batchEnd < pagesToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Finalizează cu statistici detaliate
      const finalSiteMap = {
        ...updatedSiteMap,
        pages: pagesToProcess,
        scrapedPages: pagesToProcess.filter(p => p.status === 'scraped').length,
        errorPages: pagesToProcess.filter(p => p.status === 'error').length,
        endTime: new Date().toISOString()
      };
      setSiteMapData(finalSiteMap);

      // Calculează statistici finale
      const totalProducts = finalSiteMap.pages.reduce((sum, page) => sum + page.products.length, 0);
      const totalImages = finalSiteMap.pages.reduce((sum, page) => sum + page.images.length, 0);
      const avgProductsPerPage = finalSiteMap.scrapedPages > 0 ? (totalProducts / finalSiteMap.scrapedPages).toFixed(1) : '0';

      console.log('🎉 === SCANARE ULTRA-AVANSATĂ FINALIZATĂ ===');
      console.log(`📊 Statistici finale:`);
      console.log(`  - Pagini procesate: ${finalSiteMap.scrapedPages}/${finalSiteMap.totalPages}`);
      console.log(`  - Produse găsite: ${totalProducts}`);
      console.log(`  - Imagini găsite: ${totalImages}`);
      console.log(`  - Produse pe pagină: ${avgProductsPerPage} în medie`);
      console.log(`  - Erori: ${finalSiteMap.errorPages}`);

      setCurrentProgress(`🎉 Finalizat: ${totalProducts} produse găsite!`);

      toast({
        title: "🎉 Scanare ULTRA-AVANSATĂ completă!",
        description: `${totalProducts} produse găsite în ${finalSiteMap.scrapedPages} pagini din ${finalSiteMap.totalPages} totale`,
      });

    } catch (error) {
      console.error('❌ Eroare în scanarea ULTRA-AVANSATĂ:', error);
      setCurrentProgress('❌ Eroare la scanare');
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la scanarea ULTRA-AVANSATĂ",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setIsFullSiteMode(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Scanare Web Avansată
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Extrage informații detaliate despre produse, imagini și conținut de pe orice site web
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Configurare Scanare</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="Introdu URL-ul site-ului (ex: https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="text-lg py-3"
                />
                
                <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deepScraping}
                      onChange={(e) => setDeepScraping(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Scanare profundă</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unlimitedScraping}
                      onChange={(e) => setUnlimitedScraping(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Scanare nelimitată</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extractData}
                      onChange={(e) => setExtractData(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Extrage date</span>
                  </label>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Adâncime:</span>
                    <select
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </div>
                  
                  <Button onClick={handleSinglePageScraping} disabled={isScanning}>
                    <Globe className="h-4 w-4 mr-2" />
                    Scanează site
                  </Button>
                </div>
              </div>

              {isScanning && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Se scanează...</span>
                  </div>
                  {currentProgress && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                          {currentProgress}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rezultatele scanării */}
          {(scrapedData || siteMapData) && (
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Rezultate Scanare</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="products" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="products">
                        <Package className="h-4 w-4 mr-2" />
                        Produse
                      </TabsTrigger>
                      <TabsTrigger value="images">
                        <Image className="h-4 w-4 mr-2" />
                        Imagini
                      </TabsTrigger>
                      <TabsTrigger value="links">
                        <Link className="h-4 w-4 mr-2" />
                        Linkuri
                      </TabsTrigger>
                      <TabsTrigger value="content">
                        <FileText className="h-4 w-4 mr-2" />
                        Conținut
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="space-y-4">
                      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        {isFullSiteMode && siteMapData ? (
                          <div className="space-y-4">
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold mb-2">
                                Statistici Site: {siteMapData.baseUrl}
                              </h3>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                  <div className="font-semibold">Pagini Totale</div>
                                  <div className="text-2xl font-bold text-blue-600">{siteMapData.totalPages}</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                                  <div className="font-semibold">Scanate</div>
                                  <div className="text-2xl font-bold text-green-600">{siteMapData.scrapedPages}</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                                  <div className="font-semibold">Erori</div>
                                  <div className="text-2xl font-bold text-red-600">{siteMapData.errorPages}</div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                                  <div className="font-semibold">Produse Totale</div>
                                  <div className="text-2xl font-bold text-purple-600">
                                    {siteMapData.pages.reduce((sum, page) => sum + page.products.length, 0)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {siteMapData.pages.map((page) => (
                              <div key={page.id} className="border rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm truncate flex-1 mr-2">
                                    {page.title || page.url}
                                  </h4>
                                  <Badge variant={page.status === 'scraped' ? 'default' : page.status === 'error' ? 'destructive' : 'secondary'}>
                                    {page.status}
                                  </Badge>
                                </div>
                                {page.products.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                      {page.products.length} produse găsite
                                    </div>
                                    <div className="grid gap-2">
                                      {page.products.slice(0, 3).map((product: Product, idx: number) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-sm">
                                          <div className="font-medium truncate">{product.name}</div>
                                          {product.price && <div className="text-green-600 font-semibold">{product.price}</div>}
                                          {product.description && (
                                            <div className="text-slate-600 dark:text-slate-400 text-xs truncate">
                                              {product.description.substring(0, 100)}...
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      {page.products.length > 3 && (
                                        <div className="text-xs text-slate-500">
                                          +{page.products.length - 3} produse suplimentare
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {page.error && (
                                  <div className="text-red-600 text-sm">{page.error}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : scrapedData?.products.length ? (
                          <div className="space-y-4">
                            {scrapedData.products.map((product, index) => (
                              <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                    {product.name || `Produs ${index + 1}`}
                                  </h3>
                                  {product.price && (
                                    <Badge variant="secondary" className="ml-2">
                                      {product.price}
                                    </Badge>
                                  )}
                                </div>
                                
                                {product.description && (
                                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    {product.description.substring(0, 200)}
                                    {product.description.length > 200 && '...'}
                                  </p>
                                )}
                                
                                {product.images.length > 0 && (
                                  <div className="flex space-x-2 overflow-x-auto">
                                    {product.images.slice(0, 3).map((img, imgIndex) => (
                                      <img
                                        key={imgIndex}
                                        src={img.src}
                                        alt={img.alt}
                                        className="w-16 h-16 object-cover rounded border"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    ))}
                                    {product.images.length > 3 && (
                                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded border flex items-center justify-center text-xs">
                                        +{product.images.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {Object.keys(product.specifications).length > 0 && (
                                  <div className="mt-2">
                                    <h4 className="font-medium text-sm mb-1">Specificații:</h4>
                                    <div className="text-xs space-y-1">
                                      {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                          <span className="text-slate-600 dark:text-slate-400">{key}:</span>
                                          <span>{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            Nu au fost găsite produse pe această pagină
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-4">
                      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        {isFullSiteMode && siteMapData ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {siteMapData.pages.flatMap(page => page.images).slice(0, 50).map((image, index) => (
                              <div key={index} className="space-y-2">
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                  {image.alt || 'Fără descriere'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : scrapedData?.images.length ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {scrapedData.images.map((image, index) => (
                              <div key={index} className="space-y-2">
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                  {image.alt || 'Fără descriere'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            Nu au fost găsite imagini
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="links" className="space-y-4">
                      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        {isFullSiteMode && siteMapData ? (
                          <div className="space-y-2">
                            {siteMapData.pages.flatMap(page => page.links).slice(0, 100).map((link, index) => (
                              <div key={index} className="flex items-center space-x-2 py-2 border-b">
                                <Link className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{link.text || 'Fără text'}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{link.url}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : scrapedData?.links.length ? (
                          <div className="space-y-2">
                            {scrapedData.links.map((link, index) => (
                              <div key={index} className="flex items-center space-x-2 py-2 border-b">
                                <Link className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{link.text || 'Fără text'}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{link.url}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            Nu au fost găsite linkuri
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        {scrapedData ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">Titlu:</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{scrapedData.title}</p>
                            </div>
                            <Separator />
                            <div>
                              <h3 className="font-semibold mb-2">Descriere:</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{scrapedData.description}</p>
                            </div>
                            <Separator />
                            <div>
                              <h3 className="font-semibold mb-2">Conținut text:</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                {scrapedData.text.substring(0, 2000)}
                                {scrapedData.text.length > 2000 && '...'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            Nu sunt date de conținut disponibile
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Scraping;
