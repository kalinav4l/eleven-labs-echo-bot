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

// Funcție pentru detectarea produselor - optimizată pentru materialeelectrice.ro
const detectProducts = (doc: Document, targetUrl: string): Product[] => {
  const products: Product[] = [];
  
  console.log('Începe detectarea produselor...');
  console.log('URL:', targetUrl);
  console.log('Document title:', doc.title);
  
  // Detectare simplificată pentru orice element cu imagine și text
  const allElements = doc.querySelectorAll('*');
  const potentialProducts: Element[] = [];
  
  console.log(`Analysing ${allElements.length} elements`);
  
  // Caută orice element care pare să fie un produs/categorie
  allElements.forEach((element, index) => {
    const text = element.textContent?.trim() || '';
    const hasImage = element.querySelector('img') !== null;
    const hasLink = element.querySelector('a') !== null;
    
    // Verifică dacă elementul conține cuvinte cheie pentru materiale electrice
    const hasElectricalKeywords = /(?:cablu|fir|întrerupător|priză|bec|led|transformator|siguranță|tablou|electric|electronic|component|material|aparat|fotovoltaic|cuplu|treseă|ventilație|automatizare|produs|categorie|vezi)/i.test(text);
    
    // Verifică dimensiunea elementului
    const rect = element.getBoundingClientRect();
    const hasReasonableSize = rect.width > 50 && rect.height > 50;
    
    if (hasElectricalKeywords && (hasImage || hasLink) && text.length > 5 && text.length < 500 && hasReasonableSize) {
      // Evită duplicatele (dacă elementul este deja în listă sau este copil al unui element din listă)
      const isDuplicate = potentialProducts.some(existing => 
        existing.contains(element) || element.contains(existing)
      );
      
      if (!isDuplicate) {
        potentialProducts.push(element);
      }
    }
  });
  
  console.log(`Găsite ${potentialProducts.length} produse potențiale`);

  // Folosește produsele potențiale găsite
  const foundProducts = potentialProducts.slice(0, 50);
  console.log(`Procesez ${foundProducts.length} produse`);

  // Extrage informațiile pentru fiecare produs
  foundProducts.forEach((element, index) => {
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

      // Extrage numele produsului/categoriei - optimizat pentru materialeelectrice.ro
      const titleSelectors = [
        'h1, h2, h3, h4, h5, h6',
        '.title, .name, .product-title, .product-name',
        '.nume, .denumire, .titlu',
        '[class*="title"], [class*="name"], [class*="nume"]',
        'a[title]',
        'img[alt]', // Pentru imagini cu text descriptiv în alt
        'figcaption', // Pentru caption-uri de imagini
        '.category-title, .cat-title'
      ];

      for (const selector of titleSelectors) {
        const titleElement = element.querySelector(selector);
        if (titleElement?.textContent?.trim()) {
          let title = titleElement.textContent.trim();
          title = title.replace(/(\$|€|£|lei|ron|mdl)[\d.,\s]+/gi, '').trim();
          title = title.replace(/vezi\s+produs|vezi\s+produse|view\s+product/gi, '').trim();
          if (title.length > 3 && title.length < 200) {
            product.name = title;
            break;
          }
        }
        // Dacă nu găsește text, încearcă să folosească alt-ul imaginii
        if (!product.name && selector === 'img[alt]') {
          const img = titleElement as HTMLImageElement;
          if (img.alt && img.alt.length > 3 && img.alt.length < 200) {
            product.name = img.alt.trim();
            break;
          }
        }
      }

      // Dacă nu găsește numele prin selectori, încearcă să extragă din textul elementului
      if (!product.name) {
        const elementText = element.textContent?.trim() || '';
        // Caută primul text semnificativ (nu doar keywords)
        const lines = elementText.split('\n').map(line => line.trim()).filter(line => line.length > 3 && line.length < 200);
        for (const line of lines) {
          // Evită liniile care sunt doar keywords sau acțiuni
          if (!/(vezi|view|produs|product|categorie|category)$/i.test(line) && !/^(vezi|view)/i.test(line)) {
            // Curăță textul de prețuri și cuvinte comune
            let cleanedText = line.replace(/(\$|€|£|lei|ron|mdl)[\d.,\s]+/gi, '').trim();
            cleanedText = cleanedText.replace(/\b(produs|product|categorie|category|vezi|view)\b/gi, '').trim();
            if (cleanedText.length > 3) {
              product.name = cleanedText;
              break;
            }
          }
        }
      }
      
      // Fallback: încearcă să extragă din link-uri
      if (!product.name) {
        const links = element.querySelectorAll('a');
        for (const link of links) {
          if (link.textContent?.trim() && link.textContent.trim() !== 'Vezi produs') {
            product.name = link.textContent.trim();
            // Extrage și URL-ul produsului
            const href = link.getAttribute('href');
            if (href) {
              product.url = href.startsWith('http') ? href : new URL(href, targetUrl).href;
            }
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