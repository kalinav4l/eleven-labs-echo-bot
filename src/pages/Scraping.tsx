import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ShoppingCart, FileText, Link2, Image, DollarSign, Package, Percent, Star, Eye, Download, Globe, Search, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScrapedProduct {
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  images: Array<{
    src: string;
    alt: string;
    type: 'main' | 'gallery' | 'thumbnail';
  }>;
  availability: string;
  category: string;
  rating?: string;
  reviews?: string;
  quantity?: string;
  promotion?: string;
  specifications?: { [key: string]: string };
  features: string[];
  url: string;
  sku?: string;
  brand?: string;
  inStock?: boolean;
  deliveryInfo?: string;
  warranty?: string;
  returnPolicy?: string;
}

interface ScrapedLink {
  url: string;
  text: string;
  type: 'internal' | 'external' | 'product' | 'category' | 'navigation';
  title: string;
  target: string;
  discovered_from: string;
  depth: number;
  anchor_context: string;
}

interface ScrapedImage {
  src: string;
  alt: string;
  title: string;
  width: string;
  height: string;
  loading: string;
  type: 'product' | 'banner' | 'logo' | 'content' | 'background';
  context: string;
}

interface ScrapedData {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  text: string;
  products: ScrapedProduct[];
  links: ScrapedLink[];
  images: ScrapedImage[];
  headings: { level: number; text: string }[];
  metadata: { [key: string]: string };
  schema: any[];
  contentType: 'ecommerce' | 'informational' | 'mixed';
  language: string;
  lastModified?: string;
  totalPages: number;
  extractionStats: {
    totalProducts: number;
    totalLinks: number;
    totalImages: number;
    uniqueDomains: number;
    processingTime: number;
  };
}

// Funcția de extragere completă pentru produse (E-COMMERCE)
const extractCompleteProductDetails = (element: Element, pageUrl: string): ScrapedProduct => {
  const product: ScrapedProduct = {
    name: '',
    price: '',
    description: '',
    images: [],
    availability: '',
    category: '',
    features: [],
    url: pageUrl,
    specifications: {}
  };

  // EXTRAGERE NUME PRODUS - căutare în multiple locuri
  const nameSelectors = [
    'h1', '.product-title', '.product-name', '[data-testid*="product-title"]',
    '.title', '.name', '.product-heading', '.item-title', '.product-info h1',
    '.product-details h1', '.product-header h1', '[itemprop="name"]'
  ];
  
  for (const selector of nameSelectors) {
    const nameEl = element.querySelector(selector);
    if (nameEl?.textContent?.trim()) {
      product.name = nameEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE PREȚ - extragere detaliată cu reduceri
  const priceSelectors = [
    '.price', '.product-price', '.current-price', '.sale-price', '.offer-price',
    '[data-testid*="price"]', '.price-current', '.price-now', '[itemprop="price"]',
    '.cost', '.amount', '.value', '.product-cost', '.final-price'
  ];
  
  for (const selector of priceSelectors) {
    const priceEl = element.querySelector(selector);
    if (priceEl?.textContent?.trim()) {
      product.price = priceEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE PREȚ ORIGINAL (înainte de reducere)
  const originalPriceSelectors = [
    '.original-price', '.old-price', '.regular-price', '.was-price',
    '.price-before', '.crossed-price', '.list-price', '.msrp'
  ];
  
  for (const selector of originalPriceSelectors) {
    const originalPriceEl = element.querySelector(selector);
    if (originalPriceEl?.textContent?.trim()) {
      product.originalPrice = originalPriceEl.textContent.trim();
      break;
    }
  }

  // CALCULARE REDUCERE
  if (product.price && product.originalPrice) {
    const currentPrice = parseFloat(product.price.replace(/[^\d.]/g, ''));
    const originalPrice = parseFloat(product.originalPrice.replace(/[^\d.]/g, ''));
    if (!isNaN(currentPrice) && !isNaN(originalPrice) && originalPrice > currentPrice) {
      const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      product.discount = `${discountPercent}%`;
    }
  }

  // EXTRAGERE DESCRIERE COMPLETĂ
  const descSelectors = [
    '.description', '.product-description', '.product-info', '.product-details',
    '[data-testid*="description"]', '.about', '.overview', '.summary',
    '.content', '.details', '.info', '[itemprop="description"]'
  ];
  
  const descriptions: string[] = [];
  for (const selector of descSelectors) {
    const descEl = element.querySelector(selector);
    if (descEl?.textContent?.trim()) {
      descriptions.push(descEl.textContent.trim());
    }
  }
  product.description = descriptions.join(' | ');

  // EXTRAGERE IMAGINI COMPLETE
  const imgSelectors = [
    '.product-image img', '.product-photo img', '.gallery img', '.carousel img',
    '.slider img', '.thumbnail img', '.zoom img', '[data-testid*="image"] img',
    '.main-image img', '.featured-image img', 'img[itemprop="image"]'
  ];
  
  const imageSet = new Set<string>();
  for (const selector of imgSelectors) {
    const images = element.querySelectorAll(selector);
    images.forEach((img, index) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
      if (src && !imageSet.has(src)) {
        imageSet.add(src);
        product.images.push({
          src: src.startsWith('//') ? 'https:' + src : src.startsWith('/') ? new URL(pageUrl).origin + src : src,
          alt: img.getAttribute('alt') || product.name || `Product image ${index + 1}`,
          type: index === 0 ? 'main' : 'gallery'
        });
      }
    });
  }

  // EXTRAGERE DISPONIBILITATE
  const availabilitySelectors = [
    '.availability', '.stock', '.in-stock', '.out-of-stock', '.stock-status',
    '[data-testid*="stock"]', '.inventory', '.quantity-available'
  ];
  
  for (const selector of availabilitySelectors) {
    const availEl = element.querySelector(selector);
    if (availEl?.textContent?.trim()) {
      product.availability = availEl.textContent.trim();
      product.inStock = !availEl.textContent.toLowerCase().includes('out of stock');
      break;
    }
  }

  // EXTRAGERE CANTITATE
  const quantitySelectors = [
    '.quantity', '.qty', '.amount-available', '.stock-quantity',
    '[data-testid*="quantity"]', '.inventory-count'
  ];
  
  for (const selector of quantitySelectors) {
    const qtyEl = element.querySelector(selector);
    if (qtyEl?.textContent?.trim()) {
      product.quantity = qtyEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE PROMOȚII
  const promotionSelectors = [
    '.promotion', '.offer', '.deal', '.special', '.badge', '.label',
    '.discount-badge', '.sale-badge', '.promo-text', '.offer-text'
  ];
  
  const promotions: string[] = [];
  for (const selector of promotionSelectors) {
    const promoEls = element.querySelectorAll(selector);
    promoEls.forEach(promo => {
      if (promo.textContent?.trim()) {
        promotions.push(promo.textContent.trim());
      }
    });
  }
  product.promotion = promotions.join(' | ');

  // EXTRAGERE RATING
  const ratingSelectors = [
    '.rating', '.stars', '.score', '.review-score', '[data-testid*="rating"]',
    '[itemprop="ratingValue"]', '.star-rating', '.rating-value'
  ];
  
  for (const selector of ratingSelectors) {
    const ratingEl = element.querySelector(selector);
    if (ratingEl?.textContent?.trim()) {
      product.rating = ratingEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE NUMĂR REVIEW-URI
  const reviewSelectors = [
    '.reviews', '.review-count', '.rating-count', '[data-testid*="review"]',
    '[itemprop="reviewCount"]', '.reviews-number'
  ];
  
  for (const selector of reviewSelectors) {
    const reviewEl = element.querySelector(selector);
    if (reviewEl?.textContent?.trim()) {
      product.reviews = reviewEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE SPECIFICAȚII TEHNICE
  const specSelectors = [
    '.specifications', '.specs', '.tech-specs', '.product-specs',
    '.attributes', '.properties', '.features-list', '.details-table'
  ];
  
  for (const selector of specSelectors) {
    const specEl = element.querySelector(selector);
    if (specEl) {
      const specItems = specEl.querySelectorAll('tr, li, .spec-item, .attribute');
      specItems.forEach(item => {
        const label = item.querySelector('.label, .key, .name, td:first-child, .spec-label');
        const value = item.querySelector('.value, .spec-value, td:last-child');
        if (label?.textContent && value?.textContent) {
          product.specifications![label.textContent.trim()] = value.textContent.trim();
        }
      });
    }
  }

  // EXTRAGERE BRAND
  const brandSelectors = [
    '.brand', '.manufacturer', '[itemprop="brand"]', '.brand-name',
    '[data-testid*="brand"]', '.producer', '.make'
  ];
  
  for (const selector of brandSelectors) {
    const brandEl = element.querySelector(selector);
    if (brandEl?.textContent?.trim()) {
      product.brand = brandEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE SKU
  const skuSelectors = [
    '.sku', '.product-code', '.item-code', '[itemprop="sku"]',
    '.model', '.product-id', '.part-number'
  ];
  
  for (const selector of skuSelectors) {
    const skuEl = element.querySelector(selector);
    if (skuEl?.textContent?.trim()) {
      product.sku = skuEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE INFORMAȚII LIVRARE
  const deliverySelectors = [
    '.delivery', '.shipping', '.delivery-info', '.shipping-info',
    '.delivery-time', '.shipping-time', '.arrival-time'
  ];
  
  for (const selector of deliverySelectors) {
    const deliveryEl = element.querySelector(selector);
    if (deliveryEl?.textContent?.trim()) {
      product.deliveryInfo = deliveryEl.textContent.trim();
      break;
    }
  }

  // EXTRAGERE CATEGORIE
  const categorySelectors = [
    '.category', '.breadcrumb', '.nav-path', '.product-category',
    '[itemprop="category"]', '.section', '.department'
  ];
  
  for (const selector of categorySelectors) {
    const catEl = element.querySelector(selector);
    if (catEl?.textContent?.trim()) {
      product.category = catEl.textContent.trim();
      break;
    }
  }

  return product;
};

// Funcția de extragere completă pentru conținut informațional
const extractInformationalContent = (doc: Document, url: string): ScrapedData => {
  const data: ScrapedData = {
    url,
    title: '',
    description: '',
    keywords: [],
    text: '',
    products: [],
    links: [],
    images: [],
    headings: [],
    metadata: {},
    schema: [],
    contentType: 'informational',
    language: 'ro',
    totalPages: 1,
    extractionStats: {
      totalProducts: 0,
      totalLinks: 0,
      totalImages: 0,
      uniqueDomains: 0,
      processingTime: 0
    }
  };

  // EXTRAGERE TITLE
  const titleEl = doc.querySelector('title');
  data.title = titleEl?.textContent?.trim() || '';

  // EXTRAGERE META DESCRIPTION
  const descriptionEl = doc.querySelector('meta[name="description"]');
  data.description = descriptionEl?.getAttribute('content') || '';

  // EXTRAGERE KEYWORDS
  const keywordsEl = doc.querySelector('meta[name="keywords"]');
  if (keywordsEl?.getAttribute('content')) {
    data.keywords = keywordsEl.getAttribute('content')!.split(',').map(k => k.trim());
  }

  // EXTRAGERE TOATE HEADINGS (H1-H6)
  for (let i = 1; i <= 6; i++) {
    const headings = doc.querySelectorAll(`h${i}`);
    headings.forEach(heading => {
      if (heading.textContent?.trim()) {
        data.headings.push({
          level: i,
          text: heading.textContent.trim()
        });
      }
    });
  }

  // EXTRAGERE TEXT COMPLET
  const textSelectors = ['p', 'article', 'section', '.content', '.main', '.text', '.description'];
  const textParts: string[] = [];
  
  textSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.textContent?.trim()) {
        textParts.push(el.textContent.trim());
      }
    });
  });
  
  data.text = textParts.join(' ');

  // EXTRAGERE METADATA COMPLETĂ
  const metaTags = doc.querySelectorAll('meta');
  metaTags.forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
    const content = meta.getAttribute('content');
    if (name && content) {
      data.metadata[name] = content;
    }
  });

  // EXTRAGERE SCHEMA.ORG DATA
  const schemaScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  schemaScripts.forEach(script => {
    try {
      const schemaData = JSON.parse(script.textContent || '');
      data.schema.push(schemaData);
    } catch (e) {
      // Ignoră erorile JSON
    }
  });

  return data;
};

// Funcția de extragere COMPLETĂ pentru E-commerce
const extractEcommerceData = (doc: Document, url: string): ScrapedData => {
  const data = extractInformationalContent(doc, url);
  data.contentType = 'ecommerce';
  
  // DETECTARE PRODUSE - căutare în toate containerele posibile
  const productSelectors = [
    '.product', '.item', '.product-item', '.product-card', '.product-box',
    '.product-container', '.listing-item', '.catalog-item', '.shop-item',
    '[data-testid*="product"]', '[itemtype*="Product"]', '.product-tile',
    '.product-summary', '.product-info', '.product-details', '.single-product'
  ];

  const products: ScrapedProduct[] = [];
  const processedUrls = new Set<string>();

  productSelectors.forEach(selector => {
    const productElements = doc.querySelectorAll(selector);
    productElements.forEach(element => {
      try {
        const product = extractCompleteProductDetails(element, url);
        
        // Verifică dacă produsul are informații suficiente și nu este duplicat
        if (product.name && product.price && !processedUrls.has(product.name + product.price)) {
          processedUrls.add(product.name + product.price);
          products.push(product);
        }
      } catch (error) {
        console.warn('Eroare la extragerea produsului:', error);
      }
    });
  });

  data.products = products;
  return data;
};

// Funcția de extragere COMPLETĂ a link-urilor cu detalii
const extractAllLinksWithDetails = (doc: Document, baseUrl: string, depth: number = 0): ScrapedLink[] => {
  const links: ScrapedLink[] = [];
  const domain = new URL(baseUrl).hostname;
  
  const linkElements = doc.querySelectorAll('a[href]');
  
  linkElements.forEach((link, index) => {
    try {
      const href = link.getAttribute('href');
      if (!href) return;

      let fullUrl = '';
      if (href.startsWith('//')) {
        fullUrl = 'https:' + href;
      } else if (href.startsWith('/')) {
        fullUrl = new URL(baseUrl).origin + href;
      } else if (href.startsWith('http')) {
        fullUrl = href;
      } else {
        fullUrl = new URL(href, baseUrl).href;
      }

      const linkUrl = new URL(fullUrl);
      const isInternal = linkUrl.hostname === domain;
      
      // Detectare tip link
      let linkType: 'internal' | 'external' | 'product' | 'category' | 'navigation' = isInternal ? 'internal' : 'external';
      
      const linkText = link.textContent?.trim().toLowerCase() || '';
      const linkHref = href.toLowerCase();
      
      if (linkHref.includes('/product') || linkHref.includes('/p/') || linkText.includes('produs')) {
        linkType = 'product';
      } else if (linkHref.includes('/category') || linkHref.includes('/cat/') || linkText.includes('categorie')) {
        linkType = 'category';
      } else if (link.closest('nav, .navigation, .menu, .navbar, header')) {
        linkType = 'navigation';
      }

      // Context în care se află link-ul
      const parent = link.parentElement;
      const contextSelectors = ['nav', '.menu', '.breadcrumb', '.product', '.category', 'footer', 'header'];
      let context = 'content';
      
      for (const selector of contextSelectors) {
        if (link.closest(selector)) {
          context = selector.replace('.', '');
          break;
        }
      }

      links.push({
        url: fullUrl,
        text: link.textContent?.trim() || '',
        type: linkType,
        title: link.getAttribute('title') || '',
        target: link.getAttribute('target') || '',
        discovered_from: baseUrl,
        depth: depth,
        anchor_context: context
      });

      // LOG DETALIAT pentru fiecare link descoperit
      console.log(`🔗 LINK ${index + 1} DESCOPERIT:`);
      console.log(`   📍 URL: ${fullUrl}`);
      console.log(`   📝 Text: "${link.textContent?.trim() || 'No text'}"}`);
      console.log(`   🏷️ Tip: ${linkType}`);
      console.log(`   📦 Context: ${context}`);
      console.log(`   🌐 ${isInternal ? 'INTERN' : 'EXTERN'}`);
      console.log(`   ⬇️ Descoperit din: ${baseUrl}`);
      console.log(`   📊 Adâncime: ${depth}`);
      console.log('   ───────────────────────────────');

    } catch (error) {
      console.warn(`Eroare la procesarea link-ului ${index}:`, error);
    }
  });

  return links;
};

// Funcția de extragere completă a imaginilor
const extractAllImagesWithDetails = (doc: Document, baseUrl: string): ScrapedImage[] => {
  const images: ScrapedImage[] = [];
  const imageElements = doc.querySelectorAll('img');
  
  imageElements.forEach((img, index) => {
    try {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
      if (!src) return;

      let fullSrc = '';
      if (src.startsWith('//')) {
        fullSrc = 'https:' + src;
      } else if (src.startsWith('/')) {
        fullSrc = new URL(baseUrl).origin + src;
      } else if (src.startsWith('http')) {
        fullSrc = src;
      } else {
        fullSrc = new URL(src, baseUrl).href;
      }

      // Detectare tip imagine
      let imageType: 'product' | 'banner' | 'logo' | 'content' | 'background' = 'content';
      
      const alt = img.getAttribute('alt')?.toLowerCase() || '';
      const className = img.className.toLowerCase();
      const parent = img.parentElement;
      
      if (alt.includes('logo') || className.includes('logo') || img.closest('.logo')) {
        imageType = 'logo';
      } else if (img.closest('.product, .item, [data-testid*="product"]')) {
        imageType = 'product';
      } else if (img.closest('.banner, .hero, .carousel, .slider')) {
        imageType = 'banner';
      } else if (className.includes('background') || img.closest('.background')) {
        imageType = 'background';
      }

      // Context imagine
      let context = 'general';
      const contextSelectors = ['.product', '.banner', '.header', '.footer', '.content', '.gallery'];
      for (const selector of contextSelectors) {
        if (img.closest(selector)) {
          context = selector.replace('.', '');
          break;
        }
      }

      images.push({
        src: fullSrc,
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        width: img.getAttribute('width') || '',
        height: img.getAttribute('height') || '',
        loading: img.getAttribute('loading') || '',
        type: imageType,
        context: context
      });

    } catch (error) {
      console.warn(`Eroare la procesarea imaginii ${index}:`, error);
    }
  });

  return images;
};

// Funcția de CRAWLING COMPLET fără limite
const performUnlimitedCrawling = async (
  startUrl: string, 
  scrapingType: 'ecommerce' | 'informational',
  onProgress?: (current: number, total: number, details: string) => void
): Promise<ScrapedData> => {
  const startTime = Date.now();
  console.log(`🚀 ÎNCEPE CRAWLING ${scrapingType.toUpperCase()} NELIMITAT: ${startUrl}`);

  const urlsToVisit: string[] = [startUrl];
  const visitedUrls = new Set<string>();
  const allProducts: ScrapedProduct[] = [];
  const allLinks: ScrapedLink[] = [];
  const allImages: ScrapedImage[] = [];
  const domain = new URL(startUrl).hostname;
  let mainData: ScrapedData | null = null;
  let totalPagesProcessed = 0;
  const maxConcurrentRequests = 3;
  const delayBetweenRequests = 1000;

  // Proces de crawling nelimitat
  while (urlsToVisit.length > 0) {
    const currentBatch = urlsToVisit.splice(0, maxConcurrentRequests);
    const batchPromises = currentBatch.map(async (currentUrl) => {
      if (visitedUrls.has(currentUrl)) return;
      
      visitedUrls.add(currentUrl);
      totalPagesProcessed++;
      
      console.log(`\n📄 PROCESEZ PAGINA ${totalPagesProcessed}: ${currentUrl}`);
      
      try {
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          console.warn(`❌ HTTP ${response.status} pentru ${currentUrl}`);
          return;
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extrage datele în funcție de tipul de scraping
        let pageData: ScrapedData;
        if (scrapingType === 'ecommerce') {
          pageData = extractEcommerceData(doc, currentUrl);
        } else {
          pageData = extractInformationalContent(doc, currentUrl);
        }

        // Salvează datele principale de la prima pagină
        if (!mainData) {
          mainData = pageData;
        }

        // Adaugă produsele găsite (pentru e-commerce)
        if (scrapingType === 'ecommerce') {
          pageData.products.forEach(product => {
            const exists = allProducts.some(existing => 
              existing.name === product.name && existing.url === product.url
            );
            if (!exists) {
              allProducts.push(product);
            }
          });
        }

        // Extrage și adaugă toate link-urile cu detalii complete
        const pageLinks = extractAllLinksWithDetails(doc, currentUrl, totalPagesProcessed);
        pageLinks.forEach(link => {
          const exists = allLinks.some(existing => existing.url === link.url);
          if (!exists) {
            allLinks.push(link);
            
            // Adaugă link-uri noi interne pentru crawling
            const linkUrl = new URL(link.url);
            if (linkUrl.hostname === domain && 
                !visitedUrls.has(link.url) && 
                !urlsToVisit.includes(link.url) &&
                !link.url.includes('#') &&
                !link.url.match(/\.(pdf|jpg|jpeg|png|gif|svg|css|js|ico|xml|zip|doc|docx)$/i)) {
              
              urlsToVisit.push(link.url);
              console.log(`➕ ADĂUGAT PENTRU CRAWLING: ${link.url}`);
            }
          }
        });

        // Extrage și adaugă toate imaginile
        const pageImages = extractAllImagesWithDetails(doc, currentUrl);
        pageImages.forEach(image => {
          const exists = allImages.some(existing => existing.src === image.src);
          if (!exists) {
            allImages.push(image);
          }
        });

        // Actualizează progresul
        const progressDetails = `Pagina ${totalPagesProcessed}: ${allProducts.length} produse, ${allLinks.length} link-uri, ${allImages.length} imagini`;
        if (onProgress) {
          onProgress(totalPagesProcessed, visitedUrls.size + urlsToVisit.length, progressDetails);
        }

        console.log(`✅ FINALIZAT ${currentUrl}:`);
        console.log(`   🛍️ Produse găsite: ${pageData.products.length}`);
        console.log(`   🔗 Link-uri găsite: ${pageLinks.length}`);
        console.log(`   🖼️ Imagini găsite: ${pageImages.length}`);
        console.log(`   📊 Total acumulat: ${allProducts.length} produse, ${allLinks.length} link-uri, ${allImages.length} imagini`);
        console.log(`   🚀 Rămase în coadă: ${urlsToVisit.length} pagini`);

      } catch (error) {
        console.error(`❌ EROARE la procesarea ${currentUrl}:`, error);
      }
    });

    // Așteaptă procesarea batch-ului curent
    await Promise.all(batchPromises);
    
    // Pauză între batch-uri
    if (urlsToVisit.length > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }
  }

  if (!mainData) {
    throw new Error('Nu s-a putut procesa pagina principală');
  }

  const processingTime = Date.now() - startTime;
  const uniqueDomains = new Set(allLinks.map(link => new URL(link.url).hostname)).size;

  console.log(`\n🎉 CRAWLING NELIMITAT FINALIZAT!`);
  console.log(`⏱️ Timp procesare: ${(processingTime / 1000).toFixed(2)} secunde`);
  console.log(`📄 Pagini procesate: ${totalPagesProcessed}`);
  console.log(`🛍️ Total produse: ${allProducts.length}`);
  console.log(`🔗 Total link-uri: ${allLinks.length}`);
  console.log(`🖼️ Total imagini: ${allImages.length}`);
  console.log(`🌐 Domenii unice: ${uniqueDomains}`);

  // Returnează datele complete combinate
  return {
    ...mainData,
    products: allProducts,
    links: allLinks,
    images: allImages,
    totalPages: totalPagesProcessed,
    extractionStats: {
      totalProducts: allProducts.length,
      totalLinks: allLinks.length,
      totalImages: allImages.length,
      uniqueDomains: uniqueDomains,
      processingTime: processingTime
    },
    text: mainData.text + `\n\n[CRAWLING NELIMITAT FINALIZAT - ${totalPagesProcessed} PAGINI - ${allProducts.length} PRODUSE - ${allLinks.length} LINK-URI - ${allImages.length} IMAGINI]`
  };
};

const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');
  const [scrapingType, setScrapingType] = useState<'ecommerce' | 'informational'>('ecommerce');
  const [progress, setProgress] = useState({ current: 0, total: 0, details: '' });

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Te rog introdu un URL valid');
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapedData(null);
    setProgress({ current: 0, total: 0, details: '' });

    try {
      console.log(`🎯 ÎNCEPE SCRAPING ${scrapingType.toUpperCase()} PENTRU: ${url}`);
      
      const data = await performUnlimitedCrawling(
        url, 
        scrapingType, 
        (current, total, details) => {
          setProgress({ current, total, details });
        }
      );
      
      setScrapedData(data);
      console.log('✅ SCRAPING FINALIZAT CU SUCCES!');
      
    } catch (err) {
      console.error('❌ EROARE LA SCRAPING:', err);
      setError(err instanceof Error ? err.message : 'Eroare la scraping');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJson = () => {
    if (!scrapedData) return;
    
    const dataStr = JSON.stringify(scrapedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `scraped-data-${scrapingType}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🕷️ Web Scraper Profesional NELIMITAT
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Extrage TOATE datele de pe orice site web - fără limite! 
            Specializat pentru magazine online și site-uri informaționale.
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-600" />
              Configurare Scraping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tip de scraping */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tip de scraping:</label>
              <Tabs value={scrapingType} onValueChange={(value) => setScrapingType(value as 'ecommerce' | 'informational')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ecommerce" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    E-commerce (Produse)
                  </TabsTrigger>
                  <TabsTrigger value="informational" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Informațional (Conținut)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">URL pentru scraping:</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplu.com"
                  className="flex-1"
                />
                <Button 
                  onClick={handleScrape} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Procesez...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Începe Scraping
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Descrieri tipuri de scraping */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className={`border-2 transition-colors ${
                scrapingType === 'ecommerce' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">E-commerce Scraping</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Perfect pentru magazine online. Extrage:
                  </p>
                  <div className="space-y-1 text-xs">
                    <Badge variant="secondary" className="mr-1">Nume produse</Badge>
                    <Badge variant="secondary" className="mr-1">Prețuri & Reduceri</Badge>
                    <Badge variant="secondary" className="mr-1">Descrieri complete</Badge>
                    <Badge variant="secondary" className="mr-1">Imagini produse</Badge>
                    <Badge variant="secondary" className="mr-1">Disponibilitate</Badge>
                    <Badge variant="secondary" className="mr-1">Cantități</Badge>
                    <Badge variant="secondary" className="mr-1">Promoții</Badge>
                    <Badge variant="secondary" className="mr-1">Rating & Review-uri</Badge>
                    <Badge variant="secondary" className="mr-1">Specificații</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-2 transition-colors ${
                scrapingType === 'informational' ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Informational Scraping</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Perfect pentru site-uri cu conținut. Extrage:
                  </p>
                  <div className="space-y-1 text-xs">
                    <Badge variant="outline" className="mr-1">Titluri & Headings</Badge>
                    <Badge variant="outline" className="mr-1">Text complet</Badge>
                    <Badge variant="outline" className="mr-1">Meta informații</Badge>
                    <Badge variant="outline" className="mr-1">Toate link-urile</Badge>
                    <Badge variant="outline" className="mr-1">Imagini & Context</Badge>
                    <Badge variant="outline" className="mr-1">Structura site-ului</Badge>
                    <Badge variant="outline" className="mr-1">Schema.org data</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isLoading && (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 animate-pulse text-blue-600" />
                    Progres Crawling Nelimitat
                  </h3>
                  <Badge variant="outline">
                    {progress.current} / {progress.total || '∞'} pagini
                  </Badge>
                </div>
                <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} />
                <p className="text-sm text-gray-600">{progress.details}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {scrapedData && (
          <div className="space-y-6">
            {/* Stats */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-6 w-6 text-green-600" />
                    Rezultate Scraping Nelimitat
                  </CardTitle>
                  <Button 
                    onClick={downloadJson}
                    variant="outline"
                    className="bg-white/80"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descarcă JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/80 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{scrapedData.totalPages}</div>
                    <div className="text-sm text-gray-600">Pagini</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{scrapedData.products.length}</div>
                    <div className="text-sm text-gray-600">Produse</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{scrapedData.links.length}</div>
                    <div className="text-sm text-gray-600">Link-uri</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{scrapedData.images.length}</div>
                    <div className="text-sm text-gray-600">Imagini</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{scrapedData.extractionStats.uniqueDomains}</div>
                    <div className="text-sm text-gray-600">Domenii</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Badge variant="outline" className="text-sm">
                    ⏱️ Procesat în {(scrapedData.extractionStats.processingTime / 1000).toFixed(2)} secunde
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="products" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Produse ({scrapedData.products.length})
                </TabsTrigger>
                <TabsTrigger value="links" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Link-uri ({scrapedData.links.length})
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Imagini ({scrapedData.images.length})
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Conținut
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                {scrapedData.products.length > 0 ? (
                  <div className="grid gap-6">
                    {scrapedData.products.map((product, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            {/* Product Images */}
                            <div className="space-y-2">
                              {product.images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {product.images.slice(0, 4).map((img, imgIndex) => (
                                    <img
                                      key={imgIndex}
                                      src={img.src}
                                      alt={img.alt}
                                      className="w-full h-24 object-cover rounded-lg border"
                                      loading="lazy"
                                    />
                                  ))}
                                  {product.images.length > 4 && (
                                    <div className="bg-gray-100 rounded-lg border flex items-center justify-center h-24">
                                      <span className="text-sm text-gray-600">
                                        +{product.images.length - 4} imagini
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-gray-100 rounded-lg border flex items-center justify-center h-24">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="md:col-span-2 space-y-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {product.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {product.price}
                                  </Badge>
                                  {product.originalPrice && (
                                    <Badge variant="outline" className="line-through">
                                      {product.originalPrice}
                                    </Badge>
                                  )}
                                  {product.discount && (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                      <Percent className="h-3 w-3" />
                                      -{product.discount}
                                    </Badge>
                                  )}
                                </div>
                                {product.rating && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm">{product.rating}</span>
                                    {product.reviews && (
                                      <span className="text-sm text-gray-500">({product.reviews})</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                {product.description && (
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Descriere:</h4>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                      {product.description}
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {product.brand && (
                                    <div>
                                      <span className="font-medium">Brand:</span> {product.brand}
                                    </div>
                                  )}
                                  {product.category && (
                                    <div>
                                      <span className="font-medium">Categorie:</span> {product.category}
                                    </div>
                                  )}
                                  {product.availability && (
                                    <div>
                                      <span className="font-medium">Disponibilitate:</span> {product.availability}
                                    </div>
                                  )}
                                  {product.quantity && (
                                    <div>
                                      <span className="font-medium">Cantitate:</span> {product.quantity}
                                    </div>
                                  )}
                                  {product.sku && (
                                    <div>
                                      <span className="font-medium">SKU:</span> {product.sku}
                                    </div>
                                  )}
                                  {product.deliveryInfo && (
                                    <div>
                                      <span className="font-medium">Livrare:</span> {product.deliveryInfo}
                                    </div>
                                  )}
                                </div>

                                {product.promotion && (
                                  <div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      🎁 {product.promotion}
                                    </Badge>
                                  </div>
                                )}

                                {product.specifications && Object.keys(product.specifications).length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Specificații:</h4>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                      {Object.entries(product.specifications).slice(0, 6).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 p-2 rounded">
                                          <span className="font-medium">{key}:</span> {value}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nu au fost găsite produse pe această pagină.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Toate Link-urile Descoperite</h3>
                        <Badge variant="outline">{scrapedData.links.length} link-uri totale</Badge>
                      </div>
                      
                      <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {scrapedData.links.map((link, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge 
                                    variant={link.type === 'external' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {link.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Adâncime: {link.depth}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {link.anchor_context}
                                  </Badge>
                                </div>
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm truncate block"
                                >
                                  {link.url}
                                </a>
                                {link.text && (
                                  <p className="text-sm text-gray-600 mt-1 truncate">
                                    "{link.text}"
                                  </p>
                                )}
                                {link.title && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Title: {link.title}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  Descoperit din: {link.discovered_from}
                                </p>
                              </div>
                              <Link2 className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Toate Imaginile Descoperite</h3>
                        <Badge variant="outline">{scrapedData.images.length} imagini totale</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                        {scrapedData.images.map((image, index) => (
                          <div key={index} className="border rounded-lg p-2 hover:shadow-md transition-shadow">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-32 object-cover rounded mb-2"
                              loading="lazy"
                            />
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {image.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs ml-1">
                                {image.context}
                              </Badge>
                              {image.alt && (
                                <p className="text-xs text-gray-600 truncate" title={image.alt}>
                                  {image.alt}
                                </p>
                              )}
                              {(image.width || image.height) && (
                                <p className="text-xs text-gray-400">
                                  {image.width}x{image.height}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <div className="grid gap-6">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Informații Generale</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="font-medium text-sm">Titlu:</label>
                        <p className="text-gray-700">{scrapedData.title}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Descriere:</label>
                        <p className="text-gray-700">{scrapedData.description}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">URL:</label>
                        <a href={scrapedData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                          {scrapedData.url}
                        </a>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Tip conținut:</label>
                        <Badge variant="outline">{scrapedData.contentType}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Headings */}
                  {scrapedData.headings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Structura Heading-urilor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {scrapedData.headings.map((heading, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Badge variant="outline" className="text-xs">
                                H{heading.level}
                              </Badge>
                              <p className="text-sm flex-1">{heading.text}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Keywords */}
                  {scrapedData.keywords.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Cuvinte Cheie</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {scrapedData.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Full Text Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Conținut Text Complet</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={scrapedData.text}
                        readOnly
                        className="min-h-64 text-sm"
                        placeholder="Conținutul text al paginii..."
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scraping;