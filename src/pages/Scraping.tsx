import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Search, Download, Globe, Package, Image, Link, FileText, AlertCircle, CheckCircle, Loader2, History, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { ScrapingHistory } from '@/components/scraping/ScrapingHistory';
import { useScrapingHistory } from '@/hooks/useScrapingHistory';
import { supabase } from '@/integrations/supabase/client';

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

// Funcție pentru extragerea informațiilor despre preț - ÎMBUNĂTĂȚITĂ pentru România
const extractPriceInfo = (element: Element) => {
  const priceInfo = {
    price: '',
    originalPrice: '',
    discount: '',
    discountPercentage: '',
    currency: ''
  };

  // Selectori pentru prețuri - îmbunătățiți pentru magazine românești
  const priceSelectors = [
    // Selectori standard
    '.price, .cost, .amount, .pricing',
    '[class*="price"], [class*="cost"], [class*="amount"]',
    '.price_color, .price-current, .current-price, .sale-price',
    '.priceValue, .price-value, .price_value',
    '[data-price], [data-cost]',
    '.product-price, .item-price',
    
    // Selectori în română
    '.pret, .pret-current, .pret-curent, .pret-final',
    '[class*="pret"], [class*="cost"]',
    '.suma, .valoare, .tarif',
    '.product-pret, .item-pret, .articol-pret',
    '.oferta-pret, .promotie-pret',
    
    // Selectori specifici platforme românești
    '.price-new, .price-actual, .pretul',
    '.product-price-value, .item-price-value',
    '.final-price, .current-price-value',
    '.price-box .price, .price-container .price'
  ];

  for (const selector of priceSelectors) {
    const priceElement = element.querySelector(selector);
    if (priceElement && priceElement.textContent?.trim()) {
      const priceText = priceElement.textContent.trim();
      
      // Detectează moneda română
      const currencyMatch = priceText.match(/(lei|ron|\$|€|£|USD|EUR|MDL|usd|eur|mdl)/i);
      if (currencyMatch) {
        priceInfo.currency = currencyMatch[0].toUpperCase();
      }
      
      // Extrage prețul numeric cu pattern îmbunătățit pentru România
      const priceMatch = priceText.match(/[\d.,]+(?:\s*(?:lei|ron|mdl|\$|€|£))?/i);
      if (priceMatch) {
        priceInfo.price = priceText;
        break;
      }
    }
  }

  // Selectori pentru prețul original/vechi
  const originalPriceSelectors = [
    '.old-price, .original-price, .was-price',
    '.price-old, .regular-price, .list-price',
    '[class*="old-price"], [class*="original"]',
    '.pret-vechi, .pret-initial, .pret-recomandat',
    '.crossed-price, .strike-price, .discount-price'
  ];

  for (const selector of originalPriceSelectors) {
    const originalElement = element.querySelector(selector);
    if (originalElement && originalElement.textContent?.trim()) {
      priceInfo.originalPrice = originalElement.textContent.trim();
      break;
    }
  }

  // Detectează discountul/reducerea
  const discountSelectors = [
    '.discount, .sale, .reduction',
    '.reducere, .oferta, .promotie',
    '[class*="discount"], [class*="reducere"]'
  ];

  for (const selector of discountSelectors) {
    const discountElement = element.querySelector(selector);
    if (discountElement && discountElement.textContent?.trim()) {
      const discountText = discountElement.textContent.trim();
      const percentMatch = discountText.match(/(\d+)%/);
      if (percentMatch) {
        priceInfo.discountPercentage = percentMatch[1] + '%';
      }
      priceInfo.discount = discountText;
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

// Funcția principală de detectare a produselor - ÎMBUNĂTĂȚITĂ pentru magazine românești
const detectProducts = async (doc: Document, targetUrl: string, deepScraping: boolean = false): Promise<Product[]> => {
  const products: Product[] = [];
  
  // Selectori îmbunătățiți pentru magazine online românești
  const productSelectors = [
    // Selectori generici pentru produse
    '.product, .product-item, .product-card, .item, .listing-item',
    '[data-product], [data-product-id], [data-item-id], [data-sku]',
    '.woocommerce-product, .product-container, .product-box, .product-wrapper',
    '.product_pod, .product-pod',
    '.s-result-item, .s-item',
    '.product-tile, .product-grid-item',
    '.productCard, .product-card',
    
    // Selectori specifici pentru magazine românești
    '.produs, .produs-item, .articol, .articol-item',
    '.oferta, .oferta-item, .promotie',
    '.item-produs, .card-produs, .container-produs',
    '.lista-produse .item, .grid-produse .item',
    '.catalog-item, .categorie-item',
    '.magazin-item, .shop-item',
    '.element-produs, .box-produs',
    
    // Pentru PrestaShop și alte platforme populare în România
    '.product-miniature, .product-thumb, .product-list-item',
    '.ajax_block_product, .product_block',
    '.hproduct, .product-info',
    '.thumbnail-wrapper, .thumbnail-container',
    
    // Pentru site-uri specifice de electrice/electronice
    '.electrical-product, .electronic-item',
    '.material-item, .componenta-item',
    '.echipament-item, .device-item'
  ];

  let foundProducts: Element[] = [];
  
  // Încearcă să găsească produse cu selectorii specifici
  for (const selector of productSelectors) {
    const elements = doc.querySelectorAll(selector);
    if (elements.length > 0) {
      foundProducts = Array.from(elements);
      console.log(`Găsite ${foundProducts.length} produse cu selectorul: ${selector}`);
      break;
    }
  }

  // Dacă nu găsește produse cu selectorii specifici, folosește detectarea avansată
  if (foundProducts.length === 0) {
    console.log('Nu s-au găsit produse cu selectorii specifici, folosesc detectarea avansată...');
    const potentialProducts = doc.querySelectorAll('div, article, section, li, .item, .card, .box');
    foundProducts = Array.from(potentialProducts).filter(element => {
      const text = element.textContent || '';
      const hasPrice = /(\$|€|£|lei|ron|mdl|usd|eur|\d+[.,]\d+\s*(lei|ron|mdl|\$|€|£))/i.test(text);
      const hasTitle = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, .nume, [class*="title"], [class*="name"], [class*="nume"], a[title]');
      const hasImage = element.querySelector('img');
      const textLength = text.length;
      
      // Verifică dacă conține cuvinte cheie pentru produse electrice
      const hasElectricalKeywords = /(?:cablu|fir|intrerupator|priza|becuri|led|transformator|siguranta|tablou|cupla|mufa|adaptor|contor|releu|contact|switch|socket|wire|cable|electric|electronic|component|material|echipament)/i.test(text);
      
      return hasPrice && hasTitle && textLength > 30 && textLength < 5000 && (hasImage || hasElectricalKeywords);
    });
    console.log(`Detectare avansată: găsite ${foundProducts.length} elemente potențiale`);
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

      // Extrage numele produsului - ÎMBUNĂTĂȚIT pentru românește
      const titleSelectors = [
        // Selectori standard
        'h1, h2, h3, h4, h5, h6',
        '.title, .name, .product-title, .product-name',
        '[class*="title"], [class*="name"]',
        'a[title]',
        
        // Selectori în română
        '.nume, .denumire, .titlu, .product-nume',
        '[class*="nume"], [class*="denumire"], [class*="titlu"]',
        '.produs-nume, .item-nume, .articol-nume',
        '.product-heading, .item-heading',
        
        // Pentru magazine online românești
        '.product-name-link, .item-title-link',
        '.product-info h3, .product-info h4',
        '.card-title, .box-title, .element-title',
        '.product-description h3, .product-description h4'
      ];

      for (const selector of titleSelectors) {
        const titleElement = productElement.querySelector(selector);
        if (titleElement && titleElement.textContent?.trim()) {
          let title = titleElement.textContent.trim();
          // Curăță titlul de prețuri și alte elemente nedorite
          title = title.replace(/(\$|€|£|lei|ron|mdl|usd|eur)[\d.,\s]+/gi, '').trim();
          title = title.replace(/vezi\s+detalii|adauga\s+in\s+cos|cumpara\s+acum|comanda/gi, '').trim();
          if (title.length > 3 && title.length < 300) {
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

// Funcția principală de scraping - ÎMBUNĂTĂȚITĂ cu Edge Function
const handleScrape = async (url: string, deepScraping: boolean = false): Promise<ScrapedData | null> => {
  try {
    console.log(`Încep scraping pentru: ${url}`);
    
    // Încearcă să folosească edge function-ul pentru scraping mai robust
    const { data, error } = await supabase.functions.invoke('web-scraper', {
      body: {
        url: url,
        deepScraping: deepScraping,
        maxDepth: deepScraping ? 3 : 1
      }
    });

    if (error) {
      console.error('Eroare la edge function:', error);
      throw new Error(`Eroare la scraping: ${error.message}`);
    }

    if (data && data.products) {
      console.log(`Scraping reușit: ${data.products.length} produse găsite`);
      return data as ScrapedData;
    }

    throw new Error('Nu s-au primit date valide de la server');

  } catch (error) {
    console.error('Eroare la scraping:', error);
    
    // Fallback la scraping-ul local în caz de eroare
    console.log('Încerc fallback-ul local...');
    return handleScrapeFallback(url, deepScraping);
  }
};

// Funcția de fallback pentru scraping local
const handleScrapeFallback = async (url: string, deepScraping: boolean = false): Promise<ScrapedData | null> => {
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8'
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
  const { saveScrapingSession } = useScrapingHistory();

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

    while (urlsToVisit.length > 0 && (unlimitedScraping || visitedUrls.size < 5000)) { // Măresc limita la 5000 sau unlimited
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
                urlsToVisit.length < (unlimitedScraping ? Infinity : 5000)) { // Elimin limitele complet sau măresc la 5000
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
    
    // Salvare automată în istoric pentru scraping complet
    const finalSiteMap = {
      ...siteMapData,
      endTime: new Date().toISOString()
    };
    
    const allProducts = finalSiteMap.pages.flatMap(page => page.products);
    const allImages = finalSiteMap.pages.flatMap(page => page.images);
    const allLinks = finalSiteMap.pages.flatMap(page => page.links);
    
    saveScrapingSession({
      url: baseUrl,
      title: `Scraping complet - ${new URL(baseUrl).hostname}`,
      description: `Site scanat complet cu ${finalSiteMap.pages.length} pagini`,
      scraping_data: finalSiteMap,
      scraping_type: 'full_site',
      total_products: allProducts.length,
      total_images: allImages.length,
      total_links: allLinks.length,
    });
    
  }, []);

  return {
    siteMap,
    isScrapingComplete,
    currentProgress,
    startFullSiteScraping
  };
};

// Funcții utilitare pentru export în diferite formate
const exportToJSON = (data: any) => {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scraped-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportToCSV = (products: any[]) => {
  let content = `ID,Nume,Preț,Categorie,Brand,Disponibilitate,Descriere,URL\n`;
  content += products.map(product => 
    `"${product.id}","${product.name}","${product.price}","${product.category}","${product.brand || ''}","${product.availability}","${product.description}","${product.url}"`
  ).join('\n');
  
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `products-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportToTXT = (products: any[]) => {
  let content = `PRODUSE EXTRASE - ${new Date().toLocaleDateString('ro-RO')}\n`;
  content += `Total produse: ${products.length}\n\n`;
  content += '='.repeat(80) + '\n\n';
  
  products.forEach((product, index) => {
    content += `PRODUS ${index + 1}:\n`;
    content += `-`.repeat(40) + '\n';
    content += `ID: ${product.id}\n`;
    content += `Nume: ${product.name}\n`;
    content += `Preț: ${product.price} ${product.currency || ''}\n`;
    content += `Categorie: ${product.category}\n`;
    content += `Brand: ${product.brand || 'N/A'}\n`;
    content += `Disponibilitate: ${product.availability}\n`;
    content += `URL: ${product.url}\n`;
    content += `Descriere: ${product.description || 'Fără descriere'}\n`;
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      content += `Specificații:\n`;
      Object.entries(product.specifications).forEach(([key, value]) => {
        content += `  - ${key}: ${value}\n`;
      });
    }
    content += '\n' + '='.repeat(80) + '\n\n';
  });
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produse_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportToXML = (products: any[]) => {
  let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
  content += `<produse timestamp="${new Date().toISOString()}" total="${products.length}">\n`;
  
  products.forEach(product => {
    content += '  <produs>\n';
    content += `    <id>${escapeXml(product.id)}</id>\n`;
    content += `    <nume>${escapeXml(product.name)}</nume>\n`;
    content += `    <pret valuta="${escapeXml(product.currency || '')}">${escapeXml(product.price)}</pret>\n`;
    content += `    <categorie>${escapeXml(product.category)}</categorie>\n`;
    content += `    <brand>${escapeXml(product.brand || '')}</brand>\n`;
    content += `    <disponibilitate>${escapeXml(product.availability)}</disponibilitate>\n`;
    content += `    <url>${escapeXml(product.url)}</url>\n`;
    content += `    <descriere>${escapeXml(product.description || '')}</descriere>\n`;
    
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      content += '    <specificatii>\n';
      Object.entries(product.specifications).forEach(([key, value]) => {
        content += `      <specificatie nume="${escapeXml(key)}">${escapeXml(value as string)}</specificatie>\n`;
      });
      content += '    </specificatii>\n';
    }
    
    if (product.images && product.images.length > 0) {
      content += '    <imagini>\n';
      product.images.forEach((image: any) => {
        content += `      <imagine src="${escapeXml(image.src)}" alt="${escapeXml(image.alt)}" tip="${escapeXml(image.type)}" />\n`;
      });
      content += '    </imagini>\n';
    }
    
    content += '  </produs>\n';
  });
  
  content += '</produse>';
  
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produse_${Date.now()}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportToJSONL = (products: any[]) => {
  const content = products.map(product => JSON.stringify(product)).join('\n');
  
  const blob = new Blob([content], { type: 'application/jsonl;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produse_${Date.now()}.jsonl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportToExcel = (products: any[]) => {
  // Creăm un TSV (Tab Separated Values) care se deschide în Excel
  let content = 'ID\tNume\tPreț\tMonedă\tCategorie\tBrand\tDisponibilitate\tDescriere\tSpecificații\tURL\n';
  content += products.map(product => {
    const specs = product.specifications ? 
      Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join('; ') : '';
    
    return [
      product.id,
      product.name,
      product.price,
      product.currency || '',
      product.category,
      product.brand || '',
      product.availability,
      product.description || '',
      specs,
      product.url
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join('\t');
  }).join('\n');
  
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produse_${Date.now()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Funcție helper pentru escape XML
const escapeXml = (unsafe: string): string => {
  return String(unsafe || '').replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

const exportToHTML = (data: any) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Date Extrase - ${data.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .product { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .product h3 { color: #333; }
        .price { font-weight: bold; color: #e74c3c; }
        .meta { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Date Extrase din: ${data.url}</h1>
    <p><strong>Titlu:</strong> ${data.title}</p>
    <p><strong>Descriere:</strong> ${data.description}</p>
    <p><strong>Data extragerii:</strong> ${new Date(data.timestamp).toLocaleString('ro-RO')}</p>
    
    <h2>Produse Găsite (${data.products.length})</h2>
    ${data.products.map((product: any) => `
        <div class="product">
            <h3>${product.name}</h3>
            <div class="price">Preț: ${product.price} ${product.currency || ''}</div>
            ${product.originalPrice ? `<div class="meta">Preț original: ${product.originalPrice}</div>` : ''}
            <div class="meta">Categorie: ${product.category}</div>
            ${product.brand ? `<div class="meta">Brand: ${product.brand}</div>` : ''}
            <div class="meta">Disponibilitate: ${product.availability}</div>
            ${product.description ? `<p>${product.description}</p>` : ''}
            ${product.images.length > 0 ? `<div class="meta">Imagini: ${product.images.length}</div>` : ''}
        </div>
    `).join('')}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scraped-data-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Componentă principală Scraping
const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [deepScraping, setDeepScraping] = useState(false);
  const [unlimitedScraping, setUnlimitedScraping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [fullSiteData, setFullSiteData] = useState<SiteMapData | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const { saveScrapingSession } = useScrapingHistory();

  // Salvare automată în localStorage
  React.useEffect(() => {
    if (scrapedData && autoSaveEnabled) {
      localStorage.setItem('lastScrapedData', JSON.stringify(scrapedData));
    }
  }, [scrapedData, autoSaveEnabled]);

  React.useEffect(() => {
    if (fullSiteData && autoSaveEnabled) {
      localStorage.setItem('lastFullSiteData', JSON.stringify(fullSiteData));
    }
  }, [fullSiteData, autoSaveEnabled]);

  // Restaurare automată la încărcare
  React.useEffect(() => {
    const savedScrapedData = localStorage.getItem('lastScrapedData');
    const savedFullSiteData = localStorage.getItem('lastFullSiteData');
    const savedUrl = localStorage.getItem('lastScrapedUrl');
    
    if (savedScrapedData) {
      try {
        setScrapedData(JSON.parse(savedScrapedData));
        toast({
          title: "Datele au fost restaurate",
          description: "Sesiunea anterioară a fost încărcată automat.",
        });
      } catch (error) {
        console.error('Eroare la restaurarea datelor:', error);
      }
    }
    
    if (savedFullSiteData) {
      try {
        setFullSiteData(JSON.parse(savedFullSiteData));
      } catch (error) {
        console.error('Eroare la restaurarea datelor site complet:', error);
      }
    }
    
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }, []);

  // Salvare URL în localStorage
  React.useEffect(() => {
    if (url) {
      localStorage.setItem('lastScrapedUrl', url);
    }
  }, [url]);

  // Funcție pentru ștergerea datelor
  const clearAllData = () => {
    setScrapedData(null);
    setFullSiteData(null);
    setUrl('');
    setError('');
    
    // Șterge și din localStorage
    localStorage.removeItem('lastScrapedData');
    localStorage.removeItem('lastFullSiteData');
    localStorage.removeItem('lastScrapedUrl');
    
    toast({
      title: "Date șterse",
      description: "Toate datele au fost șterse cu succes",
    });
  };
  
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

    try {
      const data = await handleScrape(url, deepScraping);
      setScrapedData(data);
      
      if (data) {
        // Salvare automată în istoric
        saveScrapingSession({
          url: url,
          title: data.title || 'Sesiune de scraping',
          description: data.description,
          scraping_data: data,
          scraping_type: 'single',
          total_products: data.products.length,
          total_images: data.images.length,
          total_links: data.links.length,
        });

        toast({
          title: "Scraping finalizat!",
          description: `Găsite ${data.products.length} produse și ${data.links.length} link-uri`,
        });
      }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Web Scraper Universal</h1>
          </div>
          
          {/* Butoane în colțul drept */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHistory(true)}
              className={`flex items-center gap-2 transition-all duration-200 ${
                showHistory
                  ? 'bg-black text-white' 
                  : 'bg-gray-500 hover:bg-black text-white'
              }`}
            >
              <History className="w-4 h-4" />
              Istoric
            </Button>
            
            {(scrapedData || fullSiteData) && (
              <Button
                onClick={clearAllData}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                Șterge Tot
              </Button>
            )}
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

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="deepScraping"
                  checked={deepScraping}
                  onChange={(e) => setDeepScraping(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="deepScraping" className="text-sm text-muted-foreground">
                  Scanare profundă (extrage descrieri din paginile produselor)
                </label>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="unlimitedScraping"
                  checked={unlimitedScraping}
                  onChange={(e) => setUnlimitedScraping(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="unlimitedScraping" className="text-sm text-muted-foreground">
                  Scanare nelimitată (continuă până extrage tot - poate dura mult)
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  size="sm"
                  className={`h-8 text-xs transition-all duration-200 ${
                    isLoading 
                      ? 'bg-black text-white' 
                      : 'bg-gray-500 hover:bg-black text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      <Search className="w-3 h-3 mr-1" />
                      Extrage Date
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg bg-muted/30 h-8">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Adâncime:</span>
                  <select
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="elevenlabs-input w-12 p-1 text-center h-6 text-xs"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <Button
                  onClick={handleFullSiteScraping}
                  disabled={isLoading}
                  size="sm"
                  className={`h-8 text-xs transition-all duration-200 ${
                    isLoading 
                      ? 'bg-black text-white' 
                      : 'bg-gray-500 hover:bg-black text-white'
                  }`}
                >
                  <Globe className="w-3 h-3 mr-1" />
                  Scanează Site
                </Button>
              </div>
            </div>

            {currentProgress.currentUrl && (
              <div className="text-sm text-muted-foreground">
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => exportToJSON(scrapedData)}
                    className="bg-gray-500 hover:bg-black text-white transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => exportToCSV(scrapedData.products)}
                    className="bg-gray-500 hover:bg-black text-white transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => exportToTXT(scrapedData.products)}
                    className="bg-gray-500 hover:bg-black text-white transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export TXT
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => exportToExcel(scrapedData.products)}
                    className="bg-gray-500 hover:bg-black text-white transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export XLS
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => exportToXML(scrapedData.products)}
                    className="bg-gray-500 hover:bg-black text-white transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export XML
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => exportToJSONL(scrapedData.products)}
                    className="bg-gray-500 hover:bg-black text-white transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSONL
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportToHTML(scrapedData)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export HTML
                </Button>
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
                      <h3 className="text-lg font-semibold">Produse Extrase</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => exportToCSV(scrapedData.products)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                        <Button
                          onClick={() => exportToTXT(scrapedData.products)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          TXT
                        </Button>
                        <Button
                          onClick={() => exportToExcel(scrapedData.products)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          XLS
                        </Button>
                        <Button
                          onClick={() => exportToXML(scrapedData.products)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          XML
                        </Button>
                        <Button
                          onClick={() => exportToJSONL(scrapedData.products)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          JSONL
                        </Button>
                      </div>
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
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => exportToJSON(siteMap)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Site Map JSON
                      </Button>
                      <Button
                        onClick={() => exportToCSV(siteMap.pages.flatMap(page => page.products))}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Produse CSV
                      </Button>
                      <Button
                        onClick={() => exportToTXT(siteMap.pages.flatMap(page => page.products))}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Produse TXT
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => exportToExcel(siteMap.pages.flatMap(page => page.products))}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Produse XLS
                      </Button>
                      <Button
                        onClick={() => exportToXML(siteMap.pages.flatMap(page => page.products))}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Produse XML
                      </Button>
                      <Button
                        onClick={() => exportToJSONL(siteMap.pages.flatMap(page => page.products))}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Produse JSONL
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog pentru istoric */}
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