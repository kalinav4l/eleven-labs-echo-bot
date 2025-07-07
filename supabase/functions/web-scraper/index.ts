import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedData {
  title: string;
  description: string;
  text: string;
  products: Product[];
  links: Link[];
  images: Image[];
  headings: Heading[];
  tables: Table[];
  lists: List[];
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  technologies: Technologies;
}

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
  rating?: string;
  url: string;
}

interface Link {
  url: string;
  text: string;
  type: string;
  target?: string;
  title?: string;
}

interface Image {
  src: string;
  alt: string;
  title: string;
  width?: string;
  height?: string;
  loading?: string;
}

interface Heading {
  level: number;
  text: string;
}

interface Table {
  headers: string[];
  rows: string[][];
}

interface List {
  type: 'ordered' | 'unordered';
  items: string[];
}

interface ContactInfo {
  emails: string[];
  phones: string[];
  addresses: string[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface Technologies {
  cms: string[];
  frameworks: string[];
  analytics: string[];
  advertising: string[];
}

// Funcție pentru extragerea produselor
const extractProducts = (doc: Document, baseUrl: string): Product[] => {
  const products: Product[] = [];
  
  // Selectori comuni pentru produse
  const productSelectors = [
    '[class*="product"]',
    '[class*="item"]',
    '[itemtype*="Product"]',
    '[data-product]',
    '.card',
    '.product-card',
    '.item-card'
  ];
  
  const productElements = new Set<Element>();
  
  productSelectors.forEach(selector => {
    try {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => productElements.add(el));
    } catch (e) {
      // Ignoră selectorii invalizi
    }
  });
  
  productElements.forEach((element, index) => {
    try {
      // Extrage numele produsului
      const nameSelectors = [
        'h1', 'h2', 'h3', 'h4',
        '[class*="title"]',
        '[class*="name"]',
        '[class*="product-title"]',
        'a[title]'
      ];
      
      let name = '';
      for (const selector of nameSelectors) {
        const nameEl = element.querySelector(selector);
        if (nameEl?.textContent?.trim()) {
          name = nameEl.textContent.trim();
          break;
        }
      }
      
      if (!name) name = `Produs ${index + 1}`;
      
      // Extrage prețul
      const priceSelectors = [
        '[class*="price"]',
        '[class*="cost"]',
        '[data-price]',
        '.price-current',
        '.price-now'
      ];
      
      let price = '';
      let originalPrice = '';
      
      for (const selector of priceSelectors) {
        const priceEl = element.querySelector(selector);
        if (priceEl?.textContent?.trim()) {
          const priceText = priceEl.textContent.trim();
          if (priceText.match(/\d+[.,]\d+|\d+/)) {
            if (!price) {
              price = priceText;
            } else if (!originalPrice) {
              originalPrice = priceText;
            }
          }
        }
      }
      
      if (!price) price = 'Preț nedisponibil';
      
      // Extrage descrierea
      const descSelectors = [
        '[class*="description"]',
        '[class*="summary"]',
        'p',
        '.content'
      ];
      
      let description = '';
      for (const selector of descSelectors) {
        const descEl = element.querySelector(selector);
        if (descEl?.textContent?.trim() && descEl.textContent.length > 20) {
          description = descEl.textContent.trim().substring(0, 300);
          break;
        }
      }
      
      // Extrage imaginile
      const images: Array<{src: string; alt: string; title: string; type: 'main' | 'gallery' | 'thumbnail' | 'zoom'}> = [];
      const imgElements = element.querySelectorAll('img');
      
      imgElements.forEach((img, imgIndex) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (src) {
          let fullSrc = src;
          if (src.startsWith('/')) {
            const urlObj = new URL(baseUrl);
            fullSrc = `${urlObj.protocol}//${urlObj.host}${src}`;
          } else if (!src.startsWith('http')) {
            fullSrc = new URL(src, baseUrl).href;
          }
          
          images.push({
            src: fullSrc,
            alt: img.getAttribute('alt') || '',
            title: img.getAttribute('title') || '',
            type: imgIndex === 0 ? 'main' : 'gallery'
          });
        }
      });
      
      // Extrage link-ul produsului
      let productUrl = baseUrl;
      const linkEl = element.querySelector('a[href]');
      if (linkEl) {
        const href = linkEl.getAttribute('href');
        if (href) {
          if (href.startsWith('/')) {
            const urlObj = new URL(baseUrl);
            productUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
          } else if (href.startsWith('http')) {
            productUrl = href;
          } else {
            productUrl = new URL(href, baseUrl).href;
          }
        }
      }
      
      // Calculează reducerea dacă există
      let discount = '';
      let discountPercentage = '';
      
      if (originalPrice && price) {
        const originalNum = parseFloat(originalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
        const currentNum = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
        
        if (originalNum > currentNum) {
          discount = (originalNum - currentNum).toFixed(2);
          discountPercentage = Math.round(((originalNum - currentNum) / originalNum) * 100).toString();
        }
      }
      
      const product: Product = {
        id: `product-${Date.now()}-${index}`,
        name,
        description: description || `Descriere pentru ${name}`,
        price,
        originalPrice: originalPrice || undefined,
        discount: discount || undefined,
        discountPercentage: discountPercentage || undefined,
        currency: 'MDL', // Detectează automat valuta
        category: 'General',
        brand: '',
        images,
        specifications: {},
        features: [],
        availability: 'În stoc',
        url: productUrl
      };
      
      products.push(product);
      
    } catch (error) {
      console.error(`Eroare la extragerea produsului ${index}:`, error);
    }
  });
  
  return products;
};

// Funcție pentru extragerea link-urilor
const extractLinks = (doc: Document, baseUrl: string): Link[] => {
  const links: Link[] = [];
  const linkElements = doc.querySelectorAll('a[href]');
  
  linkElements.forEach(link => {
    try {
      const href = link.getAttribute('href');
      if (!href) return;
      
      let fullUrl = href;
      if (href.startsWith('/')) {
        const urlObj = new URL(baseUrl);
        fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
      } else if (!href.startsWith('http')) {
        fullUrl = new URL(href, baseUrl).href;
      }
      
      const text = link.textContent?.trim() || '';
      const title = link.getAttribute('title') || '';
      const target = link.getAttribute('target') || '';
      
      // Determină tipul link-ului
      let type = 'internal';
      if (href.startsWith('mailto:')) type = 'email';
      else if (href.startsWith('tel:')) type = 'phone';
      else if (href.startsWith('http') && !href.includes(new URL(baseUrl).hostname)) type = 'external';
      
      links.push({
        url: fullUrl,
        text: text.substring(0, 100),
        type,
        target,
        title
      });
      
    } catch (error) {
      // Ignoră link-urile invalide
    }
  });
  
  return links;
};

// Funcție pentru extragerea imaginilor
const extractImages = (doc: Document, baseUrl: string): Image[] => {
  const images: Image[] = [];
  const imgElements = doc.querySelectorAll('img');
  
  imgElements.forEach(img => {
    try {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (!src) return;
      
      let fullSrc = src;
      if (src.startsWith('/')) {
        const urlObj = new URL(baseUrl);
        fullSrc = `${urlObj.protocol}//${urlObj.host}${src}`;
      } else if (!src.startsWith('http')) {
        fullSrc = new URL(src, baseUrl).href;
      }
      
      images.push({
        src: fullSrc,
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        width: img.getAttribute('width') || '',
        height: img.getAttribute('height') || '',
        loading: img.getAttribute('loading') || ''
      });
      
    } catch (error) {
      // Ignoră imaginile invalide
    }
  });
  
  return images;
};

// Funcție principală de scraping
const scrapeWebsite = async (url: string): Promise<ScrapedData> => {
  console.log(`🚀 Începem scraping pentru: ${url}`);
  
  try {
    // Fă cererea HTTP cu headers normale de browser
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ HTML descărcat: ${Math.round(html.length / 1024)}KB`);
    
    // Parsează HTML-ul
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extrage metadatele de bază
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const textContent = doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';
    
    // Extrage produsele
    console.log('🛍️ Extrag produsele...');
    const products = extractProducts(doc, url);
    console.log(`✅ Găsite ${products.length} produse`);
    
    // Extrage link-urile
    console.log('🔗 Extrag link-urile...');
    const links = extractLinks(doc, url);
    console.log(`✅ Găsite ${links.length} link-uri`);
    
    // Extrage imaginile
    console.log('🖼️ Extrag imaginile...');
    const images = extractImages(doc, url);
    console.log(`✅ Găsite ${images.length} imagini`);
    
    // Extrage heading-urile
    const headings: Heading[] = [];
    for (let i = 1; i <= 6; i++) {
      const headingElements = doc.querySelectorAll(`h${i}`);
      headingElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text) {
          headings.push({ level: i, text });
        }
      });
    }
    
    // Extrage tabelele
    const tables: Table[] = [];
    const tableElements = doc.querySelectorAll('table');
    tableElements.forEach(table => {
      const headers: string[] = [];
      const rows: string[][] = [];
      
      const headerCells = table.querySelectorAll('th');
      headerCells.forEach(cell => {
        headers.push(cell.textContent?.trim() || '');
      });
      
      const bodyRows = table.querySelectorAll('tr');
      bodyRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          const rowData: string[] = [];
          cells.forEach(cell => {
            rowData.push(cell.textContent?.trim() || '');
          });
          rows.push(rowData);
        }
      });
      
      if (headers.length > 0 || rows.length > 0) {
        tables.push({ headers, rows });
      }
    });
    
    // Extrage listele
    const lists: List[] = [];
    const ulElements = doc.querySelectorAll('ul');
    const olElements = doc.querySelectorAll('ol');
    
    ulElements.forEach(ul => {
      const items: string[] = [];
      const liElements = ul.querySelectorAll('li');
      liElements.forEach(li => {
        const text = li.textContent?.trim();
        if (text) items.push(text);
      });
      if (items.length > 0) {
        lists.push({ type: 'unordered', items });
      }
    });
    
    olElements.forEach(ol => {
      const items: string[] = [];
      const liElements = ol.querySelectorAll('li');
      liElements.forEach(li => {
        const text = li.textContent?.trim();
        if (text) items.push(text);
      });
      if (items.length > 0) {
        lists.push({ type: 'ordered', items });
      }
    });
    
    // Extrage informațiile de contact
    const emails: string[] = [];
    const phones: string[] = [];
    const addresses: string[] = [];
    
    // Email-uri
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = textContent.match(emailRegex);
    if (emailMatches) {
      emails.push(...emailMatches.slice(0, 10));
    }
    
    // Telefoane
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatches = textContent.match(phoneRegex);
    if (phoneMatches) {
      phones.push(...phoneMatches.slice(0, 10));
    }
    
    // Link-uri sociale
    const socialLinks: SocialLink[] = [];
    const socialPlatforms = {
      'facebook.com': 'Facebook',
      'instagram.com': 'Instagram',
      'twitter.com': 'Twitter',
      'linkedin.com': 'LinkedIn',
      'youtube.com': 'YouTube',
      'tiktok.com': 'TikTok'
    };
    
    links.forEach(link => {
      for (const [domain, platform] of Object.entries(socialPlatforms)) {
        if (link.url.includes(domain)) {
          socialLinks.push({ platform, url: link.url });
          break;
        }
      }
    });
    
    // Detectează tehnologiile folosite
    const technologies: Technologies = {
      cms: [],
      frameworks: [],
      analytics: [],
      advertising: []
    };
    
    // Detectează CMS-uri
    if (html.includes('wp-content') || html.includes('wordpress')) {
      technologies.cms.push('WordPress');
    }
    if (html.includes('shopify')) {
      technologies.cms.push('Shopify');
    }
    if (html.includes('magento')) {
      technologies.cms.push('Magento');
    }
    
    // Detectează analytics
    if (html.includes('google-analytics') || html.includes('gtag')) {
      technologies.analytics.push('Google Analytics');
    }
    if (html.includes('facebook.com/tr')) {
      technologies.analytics.push('Facebook Pixel');
    }
    
    const result: ScrapedData = {
      title: title.substring(0, 200),
      description: description.substring(0, 500),
      text: textContent.substring(0, 5000),
      products,
      links: links.slice(0, 100), // Limitează la 100 link-uri
      images: images.slice(0, 50), // Limitează la 50 imagini
      headings: headings.slice(0, 50),
      tables: tables.slice(0, 10),
      lists: lists.slice(0, 20),
      contactInfo: {
        emails: [...new Set(emails)],
        phones: [...new Set(phones)],
        addresses
      },
      socialLinks,
      technologies
    };
    
    console.log(`🎉 Scraping finalizat cu succes! Produse: ${products.length}, Link-uri: ${links.length}, Imagini: ${images.length}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Eroare la scraping:', error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL-ul este necesar' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🚀 Procesez cererea de scraping pentru: ${url}`);
    
    const scrapedData = await scrapeWebsite(url);
    
    return new Response(
      JSON.stringify(scrapedData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Eroare în Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Eroare necunoscută la scraping'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});