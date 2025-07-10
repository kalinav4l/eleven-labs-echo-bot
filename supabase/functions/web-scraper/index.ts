import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapingRequest {
  url: string;
  deepScraping?: boolean;
  maxDepth?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  currency?: string;
  category: string;
  brand?: string;
  images: Array<{
    src: string;
    alt: string;
    title: string;
    type: 'main' | 'gallery' | 'thumbnail' | 'zoom';
  }>;
  specifications: Record<string, string>;
  features: string[];
  availability: string;
  url: string;
}

// Funcție pentru detectarea produselor - optimizată pentru magazine românești
const detectProducts = (doc: Document, targetUrl: string): Product[] => {
  const products: Product[] = [];
  
  // Selectori îmbunătățiți pentru magazine românești
  const productSelectors = [
    '.product, .product-item, .product-card, .item, .listing-item',
    '.produs, .produs-item, .articol, .articol-item',
    '.oferta, .oferta-item, .promotie',
    '.product-miniature, .product-thumb, .product-list-item',
    '[data-product], [data-product-id], [data-item-id]',
    '.catalog-item, .grid-item',
    '.woocommerce-product',
    '.electrical-product, .electronic-item',
    '.material-item, .componenta-item'
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

  // Detectare avansată dacă nu găsește produse
  if (foundProducts.length === 0) {
    console.log('Folosesc detectarea avansată...');
    const potentialElements = doc.querySelectorAll('div, article, section, li');
    foundProducts = Array.from(potentialElements).filter(element => {
      const text = element.textContent || '';
      const hasPrice = /(\d+[.,]\d+\s*(?:lei|ron|mdl|\$|€|£)|(?:lei|ron|mdl|\$|€|£)\s*\d+[.,]\d+)/i.test(text);
      const hasTitle = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, .nume, a[title]');
      const hasImage = element.querySelector('img');
      const textLength = text.length;
      
      // Cuvinte cheie pentru materiale electrice
      const hasElectricalKeywords = /(?:cablu|fir|intrerupator|priza|becuri|led|transformator|siguranta|tablou|electric|electronic|component|material)/i.test(text);
      
      return hasPrice && hasTitle && textLength > 50 && textLength < 3000 && (hasImage || hasElectricalKeywords);
    });
    console.log(`Detectare avansată: găsite ${foundProducts.length} produse potențiale`);
  }

  // Extrage informațiile pentru fiecare produs
  foundProducts.slice(0, 50).forEach((element, index) => {
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
        '.nume, .denumire, .titlu',
        '[class*="title"], [class*="name"], [class*="nume"]',
        'a[title]'
      ];

      for (const selector of titleSelectors) {
        const titleElement = element.querySelector(selector);
        if (titleElement?.textContent?.trim()) {
          let title = titleElement.textContent.trim();
          title = title.replace(/(\$|€|£|lei|ron|mdl)[\d.,\s]+/gi, '').trim();
          if (title.length > 3 && title.length < 200) {
            product.name = title;
            break;
          }
        }
      }

      // Extrage prețul
      const priceSelectors = [
        '.price, .pret, .cost, .amount',
        '[class*="price"], [class*="pret"], [class*="cost"]',
        '.price-current, .pret-curent, .final-price'
      ];

      for (const selector of priceSelectors) {
        const priceElement = element.querySelector(selector);
        if (priceElement?.textContent?.trim()) {
          const priceText = priceElement.textContent.trim();
          const currencyMatch = priceText.match(/(lei|ron|\$|€|£|usd|eur|mdl)/i);
          if (currencyMatch) {
            product.currency = currencyMatch[0].toUpperCase();
          }
          if (/\d+[.,]\d+/.test(priceText)) {
            product.price = priceText;
            break;
          }
        }
      }

      // Extrage descrierea
      const descSelectors = [
        '.description, .desc, .summary',
        '.descriere, .detalii',
        '[class*="description"], [class*="desc"]'
      ];

      for (const selector of descSelectors) {
        const descElement = element.querySelector(selector);
        if (descElement?.textContent?.trim()) {
          const desc = descElement.textContent.trim();
          if (desc.length > 10 && desc.length < 1000) {
            product.description = desc;
            break;
          }
        }
      }

      // Extrage imaginile
      const images = element.querySelectorAll('img');
      images.forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          product.images.push({
            src: src.startsWith('http') ? src : new URL(src, targetUrl).href,
            alt: img.alt || '',
            title: img.title || '',
            type: 'gallery'
          });
        }
      });

      // Extrage categoria
      const categorySelectors = [
        '.category, .categorie, .cat',
        '[class*="category"], [class*="categorie"]'
      ];

      for (const selector of categorySelectors) {
        const catElement = element.querySelector(selector);
        if (catElement?.textContent?.trim()) {
          product.category = catElement.textContent.trim();
          break;
        }
      }

      if (!product.category) {
        product.category = 'Materiale Electrice';
      }

      // Disponibilitate
      product.availability = element.textContent?.includes('stoc') ? 'În stoc' : 'Verifică disponibilitatea';

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, deepScraping = false, maxDepth = 2 }: ScrapingRequest = await req.json();
    
    if (!url) {
      throw new Error('URL este obligatoriu');
    }

    console.log(`Încep scraping pentru: ${url}`);

    // Headers pentru a simula un browser real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1'
    };

    // Încearcă să acceseze direct site-ul
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();
    
    if (!htmlContent || htmlContent.trim().length < 100) {
      throw new Error('Conținut HTML prea mic sau invalid');
    }

    console.log(`HTML content obținut: ${htmlContent.length} caractere`);

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

    // Extrage link-urile
    const links = Array.from(doc.querySelectorAll('a')).map(link => ({
      url: link.href || link.getAttribute('href') || '',
      text: link.textContent?.trim() || '',
      type: link.getAttribute('rel') || 'link'
    }));

    // Extrage imaginile
    const images = Array.from(doc.querySelectorAll('img')).map(img => ({
      src: img.src || img.getAttribute('src') || '',
      alt: img.alt || '',
      title: img.title || ''
    }));

    // Extrage metadata
    const metadata: Record<string, string> = {};
    Array.from(doc.querySelectorAll('meta')).forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metadata[name] = content;
      }
    });

    // Detectează produsele
    const products = detectProducts(doc, url);
    
    console.log(`Produse detectate: ${products.length}`);

    const result = {
      url,
      title,
      description,
      keywords,
      text: doc.body?.textContent?.substring(0, 5000) || '',
      links: links.slice(0, 100),
      images: images.slice(0, 50),
      metadata,
      headings: Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: parseInt(h.tagName.replace('H', '')),
        text: h.textContent?.trim() || ''
      })),
      forms: [],
      scripts: [],
      styles: [],
      products,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Eroare la scraping:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Eroare la procesarea cererii',
        details: error.toString() 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});