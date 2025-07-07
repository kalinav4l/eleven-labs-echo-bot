import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts"

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
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL este necesar' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🔍 Încep scraping pentru: ${url}`);

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();
    
    // Parse HTML using DOMParser equivalent for Deno
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    // Extract basic information
    const title = doc.querySelector('title')?.textContent || 'Fără titlu';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const text = doc.body?.textContent?.substring(0, 1000) || '';

    // Extract links
    const links = Array.from(doc.querySelectorAll('a'))
      .map(link => {
        const href = link.getAttribute('href') || '';
        const fullUrl = href.startsWith('http') ? href : (href.startsWith('/') ? new URL(url).origin + href : url + '/' + href);
        return {
          url: fullUrl,
          text: link.textContent?.trim() || ''
        };
      })
      .filter(link => link.url && link.text && link.url.startsWith('http'))
      .slice(0, 20);

    // Extract images
    const images = Array.from(doc.querySelectorAll('img'))
      .map(img => {
        const src = img.getAttribute('src') || '';
        const fullSrc = src.startsWith('http') ? src : (src.startsWith('/') ? new URL(url).origin + src : new URL(url).origin + '/' + src);
        return {
          src: fullSrc,
          alt: img.getAttribute('alt') || ''
        };
      })
      .filter(img => img.src && !img.src.includes('data:') && img.src.startsWith('http'))
      .slice(0, 20);

    // Extract products
    const products = [];
    const productSelectors = [
      '.product', '.product-item', '.product-card', '[data-product]',
      '.item', '.listing-item', '.card', '.box'
    ];

    let productElements: Element[] = [];
    
    for (const selector of productSelectors) {
      productElements = Array.from(doc.querySelectorAll(selector));
      if (productElements.length > 0) {
        console.log(`✅ Găsite ${productElements.length} elemente cu selectorul: ${selector}`);
        break;
      }
    }

    // If no specific product elements found, look for general containers with price indicators
    if (productElements.length === 0) {
      const allElements = Array.from(doc.querySelectorAll('div, article, section, li'));
      productElements = allElements.filter(element => {
        const text = element.textContent || '';
        const hasPrice = /(\d+[.,]\d+\s*(lei|ron|mdl|\$|€|£))/i.test(text);
        const hasTitle = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name');
        const textLength = text.length;
        
        return hasPrice && hasTitle && textLength > 30 && textLength < 3000;
      }).slice(0, 10);
    }

    productElements.forEach((element, index) => {
      try {
        const nameEl = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, .product-title, .product-name');
        const priceEl = element.querySelector('.price, [class*="price"], .cost, [class*="cost"]');
        const descEl = element.querySelector('.description, .desc, .summary, .content');
        const imgEl = element.querySelector('img');

        const name = nameEl?.textContent?.trim() || '';
        const price = priceEl?.textContent?.trim() || '';
        
        if (name || price) {
          products.push({
            id: `product_${index}`,
            name: name || `Produs ${index + 1}`,
            description: descEl?.textContent?.trim() || '',
            price: price,
            images: imgEl ? [{
              src: imgEl.getAttribute('src') || '',
              alt: imgEl.getAttribute('alt') || ''
            }] : []
          });
        }
      } catch (error) {
        console.error(`Eroare la procesarea produsului ${index}:`, error);
      }
    });

    const scrapedData = {
      url,
      title,
      description,
      text,
      links,
      images,
      products,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Scraping finalizat: ${products.length} produse, ${links.length} link-uri, ${images.length} imagini`);

    return new Response(
      JSON.stringify(scrapedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Eroare la scraping:', error);
    
    return new Response(
      JSON.stringify({ 
        error: `Eroare la scraping: ${error.message}`,
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});