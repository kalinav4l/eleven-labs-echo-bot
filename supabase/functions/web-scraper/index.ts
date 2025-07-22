import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Advanced scraping started');
    
    const requestData = await req.json();
    const { url, deepScraping = false, maxDepth = 1 } = requestData;
    
    console.log(`🌐 Scraping URL: ${url}`);
    
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();
    console.log(`📄 HTML content retrieved: ${htmlContent.length} characters`);

    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Extract basic data
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

    // Extract products with enhanced selectors
    const productSelectors = [
      '.product, .product-item, .product-card, .item, .listing-item',
      '.produs, .articol, .oferta, .anunt',
      '[data-product], [data-item]',
      '.product-container, .item-container',
      '.shop-item, .store-item, .catalog-item'
    ];

    let products = [];
    
    for (const selector of productSelectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} products with selector: ${selector}`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          
          // Extract title
          let productTitle = '';
          const titleSelectors = ['h1, h2, h3, h4, h5, h6', '.title, .name, .product-name', '.nume, .produs-nume'];
          for (const tSel of titleSelectors) {
            const titleEl = element.querySelector(tSel);
            if (titleEl?.textContent?.trim()) {
              productTitle = titleEl.textContent.trim();
              break;
            }
          }
          
          // Extract price
          let productPrice = '';
          const priceSelectors = ['.price, .pret, .cost', '.product-price, .produs-pret', '[data-price]'];
          for (const pSel of priceSelectors) {
            const priceEl = element.querySelector(pSel);
            if (priceEl?.textContent?.trim()) {
              const priceText = priceEl.textContent.trim();
              if (priceText.match(/\d+/)) {
                productPrice = priceText;
                break;
              }
            }
          }
          
          // Extract image
          let productImage = '';
          const imgEl = element.querySelector('img');
          if (imgEl) {
            productImage = imgEl.src || imgEl.getAttribute('data-src') || '';
          }
          
          // Extract URL
          let productUrl = url;
          const linkEl = element.querySelector('a');
          if (linkEl?.href) {
            productUrl = linkEl.href.startsWith('http') ? linkEl.href : new URL(linkEl.href, url).href;
          }
          
          if (productTitle && (productPrice || productImage)) {
            products.push({
              id: `product_${Date.now()}_${i}`,
              title: productTitle,
              price: productPrice || 'Preț nu este disponibil',
              image: productImage || '',
              url: productUrl,
              description: '',
              availability: 'Unknown',
              brand: '',
              category: '',
              sku: '',
              specifications: {},
              reviews: { rating: 0, count: 0, topReviews: [] },
              images: productImage ? [{ src: productImage, alt: productTitle, title: productTitle, type: 'main' }] : [],
              seoData: { title: productTitle, description: '', keywords: [] }
            });
          }
        }
        
        if (products.length > 0) break;
      }
    }

    // Extract links
    const links = Array.from(doc.querySelectorAll('a')).map(link => ({
      url: link.href || link.getAttribute('href') || '',
      text: link.textContent?.trim() || '',
      type: 'link'
    }));

    // Extract images  
    const images = Array.from(doc.querySelectorAll('img')).map(img => ({
      src: img.src || img.getAttribute('src') || '',
      alt: img.alt || '',
      title: img.title || ''
    }));

    const result = {
      url,
      title,
      description,
      keywords,
      text: doc.body?.textContent?.substring(0, 10000) || '',
      links,
      images,
      products,
      success: true
    };

    console.log(`✅ Scraping completed: ${products.length} products found`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Eroare la scraping',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});