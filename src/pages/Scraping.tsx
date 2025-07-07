import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Search, Package, Image, FileText, Link2, Code, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  links: Array<{ url: string; text: string; type: string; target: string; title: string }>;
  images: Array<{ src: string; alt: string; title: string; width: string; height: string; loading: string }>;
  metadata: Record<string, string>;
  headings: Array<{ level: number; text: string; id: string; className: string }>;
  forms: Array<{ action: string; method: string; enctype: string; inputs: Array<{ name: string; type: string; placeholder: string; required: boolean; id: string }> }>;
  scripts: Array<{ src: string; content: string; type: string; async: boolean; defer: boolean }>;
  styles: Array<{ href: string; content: string; media: string; type: string }>;
  tables: Array<{ id: string; caption: string; headers: string[]; rows: string[][] }>;
  lists: Array<{ id: string; type: string; items: string[] }>;
  contactInfo: { emails: string[]; phones: string[]; addresses: string[] };
  socialLinks: Array<{ url: string; text: string; type: string; target: string; title: string }>;
  structuredData: any[];
  media: { videos: Array<{ src: string; poster: string; controls: boolean; autoplay: boolean }>; audios: Array<{ src: string; controls: boolean; autoplay: boolean }> };
  technologies: { cms: string[]; frameworks: string[]; analytics: string[]; advertising: string[] };
  products: Product[];
  timestamp: string;
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

// Funcția principală de detectare a produselor
const detectProducts = (doc: Document, targetUrl: string): Product[] => {
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

  foundProducts.forEach((productElement, index) => {
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

      // Extrage descrierea
      const descSelectors = [
        '.description, .desc, .summary, .content',
        '[class*="description"], [class*="desc"]',
        '.product-description'
      ];

      for (const selector of descSelectors) {
        const descElement = productElement.querySelector(selector);
        if (descElement && descElement.textContent?.trim() && descElement.textContent.length > 20) {
          product.description = descElement.textContent.trim();
          break;
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
  });

  return products;
};

// Funcția pentru generarea raportului text structurat
const generateStructuredReport = (data: ScrapedData): string => {
  let report = `# RAPORT COMPLET SCRAPING SITE WEB\n\n`;
  report += `## INFORMAȚII GENERALE\n`;
  report += `**URL:** ${data.url}\n`;
  report += `**Titlu:** ${data.title}\n`;
  report += `**Descriere:** ${data.description}\n`;
  report += `**Cuvinte cheie:** ${data.keywords}\n`;
  report += `**Data extragerii:** ${new Date(data.timestamp).toLocaleString('ro-RO')}\n\n`;

  // Produse și prețuri
  if (data.products.length > 0) {
    report += `## PRODUSE ȘI PREȚURI (${data.products.length} produse găsite)\n\n`;
    data.products.forEach((product, index) => {
      report += `### ${index + 1}. ${product.name}\n`;
      if (product.price) report += `**Preț:** ${product.price} ${product.currency || ''}\n`;
      if (product.originalPrice) report += `**Preț original:** ${product.originalPrice}\n`;
      if (product.discount) report += `**Reducere:** ${product.discount}\n`;
      if (product.description) report += `**Descriere:** ${product.description}\n`;
      if (product.category) report += `**Categorie:** ${product.category}\n`;
      if (product.availability) report += `**Disponibilitate:** ${product.availability}\n`;
      if (product.brand) report += `**Brand:** ${product.brand}\n`;
      if (product.model) report += `**Model:** ${product.model}\n`;
      if (product.sku) report += `**SKU:** ${product.sku}\n`;
      
      if (Object.keys(product.specifications).length > 0) {
        report += `**Specificații:**\n`;
        Object.entries(product.specifications).forEach(([key, value]) => {
          report += `  - ${key}: ${value}\n`;
        });
      }
      
      if (product.features.length > 0) {
        report += `**Caracteristici:** ${product.features.join(', ')}\n`;
      }
      
      if (product.images.length > 0) {
        report += `**Imagini:** ${product.images.length} imagini disponibile\n`;
      }
      report += `\n`;
    });
  }

  // Informații de contact
  if (data.contactInfo.emails.length > 0 || data.contactInfo.phones.length > 0) {
    report += `## INFORMAȚII DE CONTACT\n`;
    if (data.contactInfo.emails.length > 0) {
      report += `**Email-uri:**\n`;
      data.contactInfo.emails.forEach(email => report += `  - ${email}\n`);
    }
    if (data.contactInfo.phones.length > 0) {
      report += `**Telefoane:**\n`;
      data.contactInfo.phones.forEach(phone => report += `  - ${phone}\n`);
    }
    report += `\n`;
  }

  // Link-uri sociale
  if (data.socialLinks.length > 0) {
    report += `## REȚELE SOCIALE\n`;
    data.socialLinks.forEach(link => {
      report += `  - ${link.text || 'Link social'}: ${link.url}\n`;
    });
    report += `\n`;
  }

  // Structura conținutului
  if (data.headings.length > 0) {
    report += `## STRUCTURA CONȚINUTULUI\n`;
    data.headings.forEach(heading => {
      const indent = '  '.repeat(heading.level - 1);
      report += `${indent}- H${heading.level}: ${heading.text}\n`;
    });
    report += `\n`;
  }

  // Tabele importante
  if (data.tables.length > 0) {
    report += `## TABELE ȘI DATE STRUCTURATE\n`;
    data.tables.forEach((table, index) => {
      if (table.rows.length > 0) {
        report += `### Tabel ${index + 1}:\n`;
        if (table.caption) report += `**Titlu:** ${table.caption}\n`;
        if (table.headers.length > 0) {
          report += `**Coloane:** ${table.headers.join(' | ')}\n`;
        }
        table.rows.slice(0, 5).forEach(row => {
          if (row.some(cell => cell.trim())) {
            report += `  ${row.join(' | ')}\n`;
          }
        });
        if (table.rows.length > 5) {
          report += `  [... și încă ${table.rows.length - 5} rânduri]\n`;
        }
        report += `\n`;
      }
    });
  }

  // Liste importante
  if (data.lists.length > 0) {
    report += `## LISTE ȘI ENUMERĂRI\n`;
    data.lists.forEach((list, index) => {
      if (list.items.length > 0) {
        report += `### Lista ${index + 1} (${list.type.toUpperCase()}):\n`;
        list.items.slice(0, 10).forEach(item => {
          if (item.trim()) report += `  - ${item}\n`;
        });
        if (list.items.length > 10) {
          report += `  [... și încă ${list.items.length - 10} elemente]\n`;
        }
        report += `\n`;
      }
    });
  }

  // Link-uri importante
  const importantLinks = data.links.filter(link => 
    link.text && link.text.length > 5 && link.text.length < 100 && 
    !link.url.includes('#') && link.url !== data.url
  );
  
  if (importantLinks.length > 0) {
    report += `## LINK-URI IMPORTANTE\n`;
    importantLinks.slice(0, 20).forEach(link => {
      report += `  - ${link.text}: ${link.url}\n`;
    });
    if (importantLinks.length > 20) {
      report += `  [... și încă ${importantLinks.length - 20} link-uri]\n`;
    }
    report += `\n`;
  }

  // Conținut media
  if (data.media.videos.length > 0 || data.media.audios.length > 0 || data.images.length > 0) {
    report += `## CONȚINUT MULTIMEDIA\n`;
    if (data.media.videos.length > 0) {
      report += `**Video-uri:** ${data.media.videos.length} video-uri găsite\n`;
      data.media.videos.slice(0, 5).forEach(video => {
        if (video.src) report += `  - ${video.src}\n`;
      });
    }
    if (data.media.audios.length > 0) {
      report += `**Audio:** ${data.media.audios.length} fișiere audio\n`;
    }
    if (data.images.length > 0) {
      report += `**Imagini:** ${data.images.length} imagini găsite\n`;
    }
    report += `\n`;
  }

  // Tehnologii detectate
  const allTechs = [...data.technologies.cms, ...data.technologies.frameworks, ...data.technologies.analytics, ...data.technologies.advertising];
  if (allTechs.length > 0) {
    report += `## TEHNOLOGII DETECTATE\n`;
    report += `**CMS:** ${data.technologies.cms.join(', ') || 'Niciunul detectat'}\n`;
    report += `**Framework-uri:** ${data.technologies.frameworks.join(', ') || 'Niciunul detectat'}\n`;
    report += `**Analytics:** ${data.technologies.analytics.join(', ') || 'Niciunul detectat'}\n`;
    report += `**Publicitate:** ${data.technologies.advertising.join(', ') || 'Niciunul detectat'}\n\n`;
  }

  // Formulare
  if (data.forms.length > 0) {
    report += `## FORMULARE DISPONIBILE\n`;
    data.forms.forEach((form, index) => {
      report += `### Formular ${index + 1}:\n`;
      report += `  - Acțiune: ${form.action || 'Nu este specificată'}\n`;
      report += `  - Metodă: ${form.method}\n`;
      if (form.inputs.length > 0) {
        report += `  - Câmpuri: ${form.inputs.map(input => input.name || input.type).join(', ')}\n`;
      }
      report += `\n`;
    });
  }

  // Metadata important
  const importantMeta = Object.entries(data.metadata).filter(([key, value]) => 
    !key.startsWith('og:') && !key.startsWith('twitter:') && value.length > 5 && value.length < 200
  );
  
  if (importantMeta.length > 0) {
    report += `## METADATA IMPORTANT\n`;
    importantMeta.forEach(([key, value]) => {
      report += `**${key}:** ${value}\n`;
    });
    report += `\n`;
  }

  // Text complet pentru context AI
  report += `## CONȚINUT TEXT COMPLET (pentru analiză AI)\n`;
  const cleanText = data.text.replace(/\s+/g, ' ').trim();
  if (cleanText.length > 2000) {
    report += `${cleanText.substring(0, 3000)}...\n`;
    report += `\n[Text truncat pentru brevitate - ${cleanText.length} caractere în total]\n`;
  } else {
    report += `${cleanText}\n`;
  }

  report += `\n---\n**Raport generat automat de Web Scraper Universal**\n`;
  report += `**Total informații extrase:** ${data.products.length} produse, ${data.links.length} link-uri, ${data.images.length} imagini, ${data.tables.length} tabele, ${data.lists.length} liste\n`;

  return report;
};

// Funcția principală de extragere a conținutului
const extractAllContent = async (htmlContent: string, targetUrl: string): Promise<ScrapedData> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  const textContent = doc.body?.textContent || '';

  // Extrage toate link-urile cu informații detaliate
  const links = Array.from(doc.querySelectorAll('a')).map(link => {
    let url = link.href || link.getAttribute('href') || '';
    if (url.startsWith('/') && !url.startsWith('//')) {
      url = new URL(targetUrl).origin + url;
    }
    return {
      url,
      text: link.textContent?.trim() || '',
      type: link.getAttribute('rel') || 'link',
      target: link.getAttribute('target') || '',
      title: link.getAttribute('title') || ''
    };
  });

  // Extrage toate imaginile cu informații complete
  const images = Array.from(doc.querySelectorAll('img')).map(img => {
    let src = img.src || img.getAttribute('src') || img.getAttribute('data-src') || '';
    if (src.startsWith('/') && !src.startsWith('//')) {
      src = new URL(targetUrl).origin + src;
    }
    return {
      src,
      alt: img.alt || '',
      title: img.title || '',
      width: img.getAttribute('width') || '',
      height: img.getAttribute('height') || '',
      loading: img.getAttribute('loading') || ''
    };
  });

  // Extrage toate meta tag-urile
  const metadata: Record<string, string> = {};
  Array.from(doc.querySelectorAll('meta')).forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
    const content = meta.getAttribute('content');
    if (name && content) {
      metadata[name] = content;
    }
  });

  // Extrage structura titlurilor
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(heading => ({
    level: parseInt(heading.tagName.replace('H', '')),
    text: heading.textContent?.trim() || '',
    id: heading.getAttribute('id') || '',
    className: heading.getAttribute('class') || ''
  }));

  // Extrage toate formularele
  const forms = Array.from(doc.querySelectorAll('form')).map(form => ({
    action: form.action || '',
    method: form.method || 'GET',
    enctype: form.getAttribute('enctype') || '',
    inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
      name: input.getAttribute('name') || '',
      type: input.getAttribute('type') || input.tagName.toLowerCase(),
      placeholder: input.getAttribute('placeholder') || '',
      required: input.hasAttribute('required'),
      id: input.getAttribute('id') || ''
    }))
  }));

  // Extrage toate script-urile
  const scripts = Array.from(doc.querySelectorAll('script')).map(script => ({
    src: script.src || '',
    content: script.textContent?.slice(0, 500) || '',
    type: script.getAttribute('type') || '',
    async: script.hasAttribute('async'),
    defer: script.hasAttribute('defer')
  })).filter(script => script.src || script.content);

  // Extrage toate stilurile
  const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"], style')).map(style => ({
    href: style.getAttribute('href') || '',
    content: style.textContent?.slice(0, 500) || '',
    media: style.getAttribute('media') || '',
    type: style.getAttribute('type') || ''
  })).filter(style => style.href || style.content);

  // Extrage toate tabelele
  const tables = Array.from(doc.querySelectorAll('table')).map((table, index) => ({
    id: `table_${index}`,
    caption: table.querySelector('caption')?.textContent?.trim() || '',
    headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim() || ''),
    rows: Array.from(table.querySelectorAll('tr')).map(tr => 
      Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim() || '')
    ).filter(row => row.length > 0)
  }));

  // Extrage toate listele
  const lists = Array.from(doc.querySelectorAll('ul, ol')).map((list, index) => ({
    id: `list_${index}`,
    type: list.tagName.toLowerCase(),
    items: Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim() || '')
  }));

  // Extrage informații de contact
  const contactInfo = {
    emails: Array.from(new Set(textContent.match(/[\w\.-]+@[\w\.-]+\.\w+/g) || [])),
    phones: Array.from(new Set(textContent.match(/(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g) || [])),
    addresses: Array.from(doc.querySelectorAll('[itemtype*="PostalAddress"], .address, [class*="address"]')).map(el => el.textContent?.trim() || '')
  };

  // Extrage link-uri sociale
  const socialLinks = links.filter(link => 
    /facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest|snapchat/i.test(link.url)
  );

  // Extrage date structurate JSON-LD
  const structuredData = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map(script => {
    try {
      return JSON.parse(script.textContent || '');
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Extrage toate elementele video și audio
  const media = {
    videos: Array.from(doc.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]')).map(video => ({
      src: video.getAttribute('src') || '',
      poster: video.getAttribute('poster') || '',
      controls: video.hasAttribute('controls'),
      autoplay: video.hasAttribute('autoplay')
    })),
    audios: Array.from(doc.querySelectorAll('audio')).map(audio => ({
      src: audio.getAttribute('src') || '',
      controls: audio.hasAttribute('controls'),
      autoplay: audio.hasAttribute('autoplay')
    }))
  };

  // Detectează tehnologiile folosite
  const technologies = {
    cms: detectCMS(doc),
    frameworks: detectFrameworks(doc),
    analytics: detectAnalytics(doc),
    advertising: detectAdvertising(doc)
  };

  const products = detectProducts(doc, targetUrl);

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
    tables,
    lists,
    contactInfo,
    socialLinks,
    structuredData,
    media,
    technologies,
    products,
    timestamp: new Date().toISOString()
  };
};

// Funcții pentru detectarea tehnologiilor
const detectCMS = (doc: Document): string[] => {
  const cms = [];
  if (doc.querySelector('meta[name="generator"][content*="WordPress"]')) cms.push('WordPress');
  if (doc.querySelector('script[src*="drupal"]')) cms.push('Drupal');
  if (doc.querySelector('script[src*="joomla"]')) cms.push('Joomla');
  if (doc.querySelector('meta[name="generator"][content*="Shopify"]')) cms.push('Shopify');
  if (doc.querySelector('script[src*="wix"]')) cms.push('Wix');
  return cms;
};

const detectFrameworks = (doc: Document): string[] => {
  const frameworks = [];
  if (doc.querySelector('script[src*="react"]')) frameworks.push('React');
  if (doc.querySelector('script[src*="vue"]')) frameworks.push('Vue.js');
  if (doc.querySelector('script[src*="angular"]')) frameworks.push('Angular');
  if (doc.querySelector('script[src*="jquery"]')) frameworks.push('jQuery');
  if (doc.querySelector('script[src*="bootstrap"]')) frameworks.push('Bootstrap');
  return frameworks;
};

const detectAnalytics = (doc: Document): string[] => {
  const analytics = [];
  if (doc.querySelector('script[src*="google-analytics"]') || doc.querySelector('script[src*="gtag"]')) analytics.push('Google Analytics');
  if (doc.querySelector('script[src*="facebook.net"]')) analytics.push('Facebook Pixel');
  if (doc.querySelector('script[src*="hotjar"]')) analytics.push('Hotjar');
  if (doc.querySelector('script[src*="mixpanel"]')) analytics.push('Mixpanel');
  return analytics;
};

const detectAdvertising = (doc: Document): string[] => {
  const advertising = [];
  if (doc.querySelector('script[src*="googlesyndication"]')) advertising.push('Google AdSense');
  if (doc.querySelector('script[src*="doubleclick"]')) advertising.push('Google Ad Manager');
  if (doc.querySelector('script[src*="amazon-adsystem"]')) advertising.push('Amazon Ads');
  return advertising;
};

// Funcție pentru detectarea TUTUROR link-urilor interne de pe site
const detectAllInternalLinks = (doc: Document, baseUrl: string): string[] => {
  const internalLinks: Set<string> = new Set();
  const baseDomain = new URL(baseUrl).hostname;
  
  // Găsește toate link-urile de pe pagină
  const allLinks = doc.querySelectorAll('a[href]');
  
  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    try {
      let fullUrl = '';
      
      // Construiește URL-ul complet
      if (href.startsWith('http')) {
        fullUrl = href;
      } else if (href.startsWith('/')) {
        fullUrl = new URL(baseUrl).origin + href;
      } else if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return; // Skip anchors, emails, and phone links
      } else {
        fullUrl = new URL(href, baseUrl).href;
      }
      
      const linkUrl = new URL(fullUrl);
      
      // Verifică dacă este link intern (același domeniu)
      if (linkUrl.hostname === baseDomain || linkUrl.hostname.endsWith(`.${baseDomain}`)) {
        // Exclude fișierele care nu sunt pagini web
        const excludeExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.zip', '.rar', 
                                 '.mp3', '.mp4', '.avi', '.css', '.js', '.xml', '.json', '.csv'];
        const hasExcludedExtension = excludeExtensions.some(ext => 
          linkUrl.pathname.toLowerCase().endsWith(ext)
        );
        
        if (!hasExcludedExtension) {
          // Curăță URL-ul de parametri irelevanti
          const cleanUrl = `${linkUrl.protocol}//${linkUrl.hostname}${linkUrl.pathname}`;
          internalLinks.add(cleanUrl);
        }
      }
    } catch (e) {
      // Ignoră link-urile invalide
    }
  });
  
  return Array.from(internalLinks);
};

// Funcție pentru detectarea link-urilor de paginare (păstrată pentru compatibilitate)
const detectPaginationLinks = (doc: Document, baseUrl: string): string[] => {
  const paginationLinks: Set<string> = new Set();
  
  const paginationSelectors = [
    'a[href*="page="]',
    'a[href*="p="]',
    'a[href*="pagina="]',
    '.pagination a, .pager a, .page-numbers a',
    'a:contains("Next"), a:contains("Următoarea"), a:contains("Următor")',
    'a:contains("›"), a:contains("»")',
    '.next a, .next-page a',
    'a[class*="next"], a[class*="page"]',
    'nav a[href*="page"]',
    '.paginate a, .paging a'
  ];

  paginationSelectors.forEach(selector => {
    try {
      const links = doc.querySelectorAll(selector);
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          let fullUrl = '';
          if (href.startsWith('http')) {
            fullUrl = href;
          } else if (href.startsWith('/')) {
            fullUrl = new URL(baseUrl).origin + href;
          } else {
            fullUrl = new URL(href, baseUrl).href;
          }
          
          // Verifică dacă link-ul pare să fie pentru paginare
          if (fullUrl.includes('page=') || fullUrl.includes('p=') || fullUrl.includes('pagina=') || 
              /\/\d+\/?$/.test(fullUrl) || /page\/\d+/.test(fullUrl)) {
            paginationLinks.add(fullUrl);
          }
        }
      });
    } catch (e) {
      // Ignoră erorile pentru selectori invalizi
    }
  });

  return Array.from(paginationLinks).slice(0, 20);
};

// Funcție pentru scraping cu paginare
const scrapePageWithProxy = async (url: string): Promise<string | null> => {
  const proxyServices = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://cors-anywhere.herokuapp.com/${url}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url
  ];

  for (let i = 0; i < proxyServices.length; i++) {
    const proxyUrl = proxyServices[i];
    
    try {
      const headers: Record<string, string> = {
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

      return htmlContent;
      
    } catch (err) {
      console.error(`Eroare cu proxy ${i + 1} pentru ${url}:`, err);
      if (i === proxyServices.length - 1) {
        throw err;
      }
    }
  }
  
  return null;
};

// Funcția pentru scraping profund al unui produs individual
const scrapeProductDetails = async (productUrl: string): Promise<any> => {
  try {
    console.log(`🔍 Scraping detalii produs: ${productUrl}`);
    
    const htmlContent = await scrapePageWithProxy(productUrl);
    if (!htmlContent || htmlContent.length < 100) {
      return null;
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Extrage toate detaliile posibile automat
    const details: any = {};
    
    // Titlul principal - încearcă mai multe selectori
    const titleSelectors = [
      'h1', '.product-title', '.title', '.name', '.product-name',
      '[class*="title"]', '[class*="name"]', '[data-title]', '.heading',
      '.product-heading', '.item-title', '.page-title'
    ];
    for (const selector of titleSelectors) {
      const titleEl = doc.querySelector(selector);
      if (titleEl?.textContent?.trim()) {
        details.title = titleEl.textContent.trim();
        break;
      }
    }
    
    // Preț - selectori extinși
    const priceSelectors = [
      '[class*="price"]', '[class*="cost"]', '[class*="amount"]', '[class*="valor"]',
      '.price', '.cost', '.amount', '[data-price]', '.pricing', '.price-current',
      '.sale-price', '.regular-price', '.product-price', '.item-price',
      '.precio', '.pret', '.pris', '.prix'
    ];
    for (const selector of priceSelectors) {
      const priceEl = doc.querySelector(selector);
      if (priceEl?.textContent?.trim()) {
        const priceText = priceEl.textContent.trim();
        if (/[\d,.\s]+/.test(priceText)) {
          details.price = priceText;
          break;
        }
      }
    }
    
    // Descriere completă
    const descSelectors = [
      '.description', '.product-description', '[class*="desc"]', '.content',
      '.details', '.summary', '.info', '.product-info', '.overview',
      '.about', '.features', '.product-features', '.detail', '.specification'
    ];
    let fullDescription = '';
    for (const selector of descSelectors) {
      const descEl = doc.querySelector(selector);
      if (descEl?.textContent?.trim()) {
        const desc = descEl.textContent.trim();
        if (desc.length > fullDescription.length) {
          fullDescription = desc;
        }
      }
    }
    if (fullDescription) details.description = fullDescription;
    
    // Specificații și caracteristici - extragere automată avansată
    const specs: any = {};
    
    // Caută tabele cu specificații
    const specTables = doc.querySelectorAll('table, .specs-table, .specifications, .specs, .attributes, .properties');
    specTables.forEach(table => {
      const rows = table.querySelectorAll('tr, .row, .spec-item, .attribute, .property');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th, .key, .value, .label, .name, .spec-name, .spec-value');
        if (cells.length >= 2) {
          const key = cells[0].textContent?.trim();
          const value = cells[1].textContent?.trim();
          if (key && value && key.length < 200 && value.length < 1000) {
            specs[key] = value;
          }
        }
      });
    });
    
    // Caută specificații în format listă cu două puncte
    const listItems = doc.querySelectorAll('li, p, div, span');
    listItems.forEach(item => {
      const text = item.textContent?.trim();
      if (text && text.includes(':') && text.length < 300) {
        const [key, ...valueParts] = text.split(':');
        const value = valueParts.join(':').trim();
        if (key.trim() && value && key.length < 100 && value.length < 500) {
          specs[key.trim()] = value;
        }
      }
    });
    
    // Caută specificații în elemente cu clase specifice
    const specSelectors = [
      '.spec', '.attribute', '.property', '.feature', '.characteristic',
      '[class*="spec"]', '[class*="attribute"]', '[class*="property"]',
      '[class*="feature"]', '[class*="detail"]'
    ];
    specSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.includes(':')) {
          const [key, ...valueParts] = text.split(':');
          const value = valueParts.join(':').trim();
          if (key.trim() && value && key.length < 100 && value.length < 500) {
            specs[key.trim()] = value;
          }
        }
      });
    });
    
    if (Object.keys(specs).length > 0) {
      details.specifications = specs;
    }
    
    // Dimensiuni - caută automat
    const dimensionKeywords = ['dimensiuni', 'mărime', 'size', 'dimensions', 'lungime', 'lățime', 'înălțime', 'greutate', 'weight'];
    const dimensions: any = {};
    
    Object.entries(specs).forEach(([key, value]) => {
      if (dimensionKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
        dimensions[key] = value;
      }
    });
    
    // Caută dimensiuni și în textul principal
    const dimensionPatterns = [
      /dimensiuni[:\s]*([^\n\r.;]+)/i,
      /mărime[:\s]*([^\n\r.;]+)/i,
      /size[:\s]*([^\n\r.;]+)/i,
      /(\d+[x×]\d+[x×]?\d*\s*(?:cm|mm|m|inch|in)?)/gi
    ];
    
    const bodyText = doc.body.textContent || '';
    dimensionPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!dimensions['Dimensiuni detectate']) {
            dimensions['Dimensiuni detectate'] = [];
          }
          if (Array.isArray(dimensions['Dimensiuni detectate'])) {
            dimensions['Dimensiuni detectate'].push(match.trim());
          }
        });
      }
    });
    
    if (Object.keys(dimensions).length > 0) {
      details.dimensions = dimensions;
    }
    
    // Imagini - extragere completă
    const images = [];
    const imgElements = doc.querySelectorAll('img, source, [style*="background-image"]');
    imgElements.forEach(img => {
      let src = '';
      if (img.tagName === 'IMG') {
        src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
      } else if (img.tagName === 'SOURCE') {
        src = img.getAttribute('srcset')?.split(' ')[0] || '';
      } else {
        const style = img.getAttribute('style') || '';
        const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
        if (match) src = match[1];
      }
      
      if (src && !src.includes('data:') && !src.includes('placeholder')) {
        try {
          const fullUrl = new URL(src, productUrl).href;
          images.push({
            src: fullUrl,
            alt: img.getAttribute('alt') || '',
            title: img.getAttribute('title') || ''
          });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    if (images.length > 0) {
      details.images = images.slice(0, 20); // Limitează la 20 imagini
    }
    
    // Brand/Producător
    const brandSelectors = [
      '.brand', '.manufacturer', '[class*="brand"]', '[class*="manufacturer"]',
      '[data-brand]', '.make', '.producer', '.fabricant'
    ];
    for (const selector of brandSelectors) {
      const brandEl = doc.querySelector(selector);
      if (brandEl?.textContent?.trim()) {
        details.brand = brandEl.textContent.trim();
        break;
      }
    }
    
    // Disponibilitate/Stock
    const stockSelectors = [
      '.stock', '.availability', '[class*="available"]', '[class*="stock"]',
      '.in-stock', '.out-of-stock', '[data-stock]', '.inventory'
    ];
    for (const selector of stockSelectors) {
      const stockEl = doc.querySelector(selector);
      if (stockEl?.textContent?.trim()) {
        details.availability = stockEl.textContent.trim();
        break;
      }
    }
    
    // Categorie/Breadcrumbs
    const categorySelectors = [
      '.breadcrumb', '.breadcrumbs', '.category', '.categories',
      '[class*="breadcrumb"]', '[class*="category"]', 'nav a', '.nav a'
    ];
    const categories = [];
    for (const selector of categorySelectors) {
      const catElements = doc.querySelectorAll(selector);
      catElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length < 100 && !categories.includes(text)) {
          categories.push(text);
        }
      });
      if (categories.length > 0) break;
    }
    if (categories.length > 0) {
      details.category = categories.join(' > ');
    }
    
    // Rating/Recenzii
    const ratingSelectors = [
      '.rating', '.stars', '[class*="rating"]', '[class*="review"]',
      '[class*="star"]', '.score', '.reviews'
    ];
    for (const selector of ratingSelectors) {
      const ratingEl = doc.querySelector(selector);
      if (ratingEl?.textContent?.trim()) {
        details.rating = ratingEl.textContent.trim();
        break;
      }
    }
    
    // Informații suplimentare - extrage tot textul util
    const additionalInfo = [];
    const textSelectors = ['p', 'li', 'span', 'div'];
    const textElements = doc.querySelectorAll(textSelectors.join(', '));
    
    textElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 20 && text.length < 500 && 
          !text.includes('cookie') && !text.includes('privacy') &&
          !text.includes('copyright') && !text.includes('©')) {
        additionalInfo.push(text);
      }
    });
    
    details.additionalInfo = additionalInfo.slice(0, 50); // Primele 50 texte relevante
    
    // Meta informații
    const metaSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="keywords"]'
    ];
    
    metaSelectors.forEach(selector => {
      const metaEl = doc.querySelector(selector);
      if (metaEl) {
        const content = metaEl.getAttribute('content');
        if (content) {
          details.metaInfo = details.metaInfo || {};
          details.metaInfo[selector.replace(/[^a-zA-Z]/g, '')] = content;
        }
      }
    });
    
    // Conținut complet de pe pagină (primele 3000 caractere)
    details.fullPageContent = doc.body.textContent?.trim().substring(0, 3000);
    
    console.log(`✅ Extras detalii pentru: ${details.title || 'Produs neidentificat'}`);
    return details;
    
  } catch (error) {
    console.error('❌ Eroare la scraping detalii produs:', error);
    return null;
  }
};

// Funcții auxiliare pentru crawling sistematic
const extractAllDataFromPage = async (doc: Document, url: string): Promise<ScrapedData> => {
  const htmlContent = doc.documentElement.outerHTML;
  return await extractAllContent(htmlContent, url);
};

const isProductPage = (doc: Document, url: string): boolean => {
  // Detectează dacă o pagină este pagină de produs bazat pe indicatori comuni
  const productIndicators = [
    'div[class*="product"]',
    'div[class*="item"]',
    '[itemtype*="Product"]',
    '.product-details',
    '.product-info',
    '.add-to-cart',
    '.buy-now',
    '.price',
    '[data-product-id]'
  ];
  
  const urlIndicators = [
    '/product/',
    '/item/',
    '/p/',
    '/prod/',
    '/products/',
    '/shop/'
  ];
  
  // Verifică indicatori în HTML
  const hasProductElements = productIndicators.some(selector => {
    try {
      return doc.querySelector(selector) !== null;
    } catch {
      return false;
    }
  });
  
  // Verifică indicatori în URL
  const hasProductUrl = urlIndicators.some(indicator => 
    url.toLowerCase().includes(indicator)
  );
  
  return hasProductElements || hasProductUrl;
};

const scrapeIndividualProductPage = async (doc: Document, url: string, baseUrl: URL): Promise<Product | null> => {
  try {
    // Extrage date basic de produs
    const name = (
      doc.querySelector('h1')?.textContent ||
      doc.querySelector('[class*="product-title"]')?.textContent ||
      doc.querySelector('[class*="product-name"]')?.textContent ||
      doc.querySelector('.title')?.textContent ||
      'Produs necunoscut'
    ).trim();

    const description = (
      doc.querySelector('[class*="product-description"]')?.textContent ||
      doc.querySelector('[class*="description"]')?.textContent ||
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      ''
    ).trim();

    const price = (
      doc.querySelector('[class*="price"]')?.textContent ||
      doc.querySelector('[class*="cost"]')?.textContent ||
      doc.querySelector('[data-price]')?.textContent ||
      'Preț nedisponibil'
    ).trim();

    // Extrage imagini
    const images: Array<{ src: string; alt: string; title: string; type: 'main' | 'gallery' | 'thumbnail' | 'zoom' }> = [];
    const imgElements = doc.querySelectorAll('img');
    
    imgElements.forEach((img, index) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (src && (src.startsWith('http') || src.startsWith('/'))) {
        let fullSrc = src;
        if (src.startsWith('/')) {
          fullSrc = `${baseUrl.protocol}//${baseUrl.host}${src}`;
        }
        
        images.push({
          src: fullSrc,
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || '',
          type: index === 0 ? 'main' : 'gallery'
        });
      }
    });

    // Extrage specificații
    const specifications: Record<string, string> = {};
    const specElements = doc.querySelectorAll('[class*="spec"], [class*="detail"], tr');
    
    specElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.includes(':')) {
        const [key, ...valueParts] = text.split(':');
        const value = valueParts.join(':').trim();
        if (key && value && key.length < 100 && value.length < 500) {
          specifications[key.trim()] = value;
        }
      }
    });

    const product: Product = {
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      price,
      category: 'General',
      images,
      specifications,
      features: [],
      availability: 'Necunoscut',
      url
    };

    return product;
    
  } catch (error) {
    console.error('❌ Eroare la extragerea produsului individual:', error);
    return null;
  }
};

const discoverAllInternalLinks = (doc: Document, currentUrl: string, baseUrl?: URL, domain?: string): string[] => {
  const urlObj = baseUrl || new URL(currentUrl);
  const targetDomain = domain || urlObj.hostname;
  const links: string[] = [];
  
  const linkElements = doc.querySelectorAll('a[href]');
  
  linkElements.forEach(link => {
    try {
      const href = link.getAttribute('href');
      if (!href) return;
      
      let fullUrl = '';
      if (href.startsWith('//')) {
        fullUrl = 'https:' + href;
      } else if (href.startsWith('/')) {
        fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
      } else if (href.startsWith('http')) {
        fullUrl = href;
      } else {
        fullUrl = new URL(href, currentUrl).href;
      }
      
      const linkUrl = new URL(fullUrl);
      
      // Filtrează doar link-urile interne
      if (linkUrl.hostname === targetDomain && 
          !fullUrl.includes('#') &&
          !fullUrl.match(/\.(pdf|jpg|jpeg|png|gif|svg|css|js|ico|xml|zip|doc|docx)$/i)) {
        links.push(fullUrl);
      }
    } catch (error) {
      // Ignoră URL-urile invalide
    }
  });
  
  return [...new Set(links)]; // Elimină duplicatele
};

// Funcția principală de scraping cu LOGICA SISTEMATICĂ DE CRAWLING ȘI EXTRAGERE COMPLETĂ
const handleScrape = async (url: string, onProgress?: (current: number, total: number) => void): Promise<ScrapedData | null> => {
  try {
    console.log('🚀 INIȚIEZ CRAWLING-UL SISTEMATIC PROFUND...');
    
    // === PASUL 1: INIȚIALIZAREA STRUCTURILOR DE DATE ===
    const urlsDeVizitat: string[] = [url]; // Coada de URL-uri de procesat
    const urlsVizitate = new Set<string>(); // Set pentru evitarea duplicatelor 
    let mainData: ScrapedData | null = null;
    
    // Colectori pentru TOATE datele de pe TOATE paginile
    const produseTotale: Product[] = [];
    const linkuriTotale: Array<{ url: string; text: string; type: string; target: string; title: string }> = [];
    const imaginiTotale: Array<{ src: string; alt: string; title: string; width: string; height: string; loading: string }> = [];
    const dateleToatePaginilor: ScrapedData[] = [];
    
    // === PASUL 2: CONFIGURAREA PENTRU PERFORMANȚĂ ȘI POLITEȚE ===
    const limitaPagini = 100; // Creștem limita pentru mai multe date
    const delayIntreRequest = 800; // 0.8 secunde între cereri pentru politețe
    let pagineProcesate = 0;
    
    // Analiză domeniu pentru filtrarea link-urilor
    const baseUrl = new URL(url);
    const domeniuPrincipal = baseUrl.hostname;
    
    console.log(`📍 Domeniu țintă: ${domeniuPrincipal}`);
    console.log(`⚙️ Configurare: max ${limitaPagini} pagini, delay ${delayIntreRequest}ms`);
    console.log(`🎯 User-Agent: KalinaDeepScraper/2.0 pentru respectarea robots.txt`);

    // === PASUL 3: BUCLA PRINCIPALĂ DE CRAWLING SISTEMATIC ===
    while (urlsDeVizitat.length > 0 && pagineProcesate < limitaPagini) {
      const urlCurent = urlsDeVizitat.shift()!;
      
      // Evită procesarea duplicatelor (crucial pentru evitarea buclelor infinite)
      if (urlsVizitate.has(urlCurent)) {
        console.log(`⏭️ Skip URL duplicat: ${urlCurent}`);
        continue;
      }
      
      urlsVizitate.add(urlCurent);
      pagineProcesate++;
      
      // Actualizează progresul pentru UI
      const totalEstimat = Math.min(urlsDeVizitat.length + pagineProcesate, limitaPagini);
      if (onProgress) {
        onProgress(pagineProcesate, totalEstimat);
      }

      console.log(`\n📄 === PROCESEZ PAGINA ${pagineProcesate}/${totalEstimat} ===`);
      console.log(`🌐 URL: ${urlCurent}`);

      try {
        // === PASUL 4: POLITEȚEA FAȚĂ DE SERVER (RATE LIMITING) ===
        if (pagineProcesate > 1) {
          console.log(`⏳ Pauză de ${delayIntreRequest}ms pentru politețe...`);
          await new Promise(resolve => setTimeout(resolve, delayIntreRequest));
        }

        // === PASUL 5: DESCĂRCAREA CONȚINUTULUI PAGINII ===
        console.log(`📥 Descarc HTML-ul pentru ${urlCurent}...`);
        const response = await fetch(urlCurent, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; KalinaDeepScraper/2.0; +https://kalina.ai) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        });
        
        if (!response.ok) {
          console.warn(`❌ Eroare HTTP ${response.status} pentru ${urlCurent} - ${response.statusText}`);
          continue;
        }
        
        const htmlContent = await response.text();
        console.log(`✅ HTML descărcat: ${Math.round(htmlContent.length / 1024)}KB`);
        
        // === PASUL 6: PARSAREA HTML-ULUI ===
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // === PASUL 7: EXTRAGEREA COMPLETĂ A DATELOR ===
        console.log(`🔍 EXTRAG TOATE DATELE din ${urlCurent}...`);
        const scrapedPageData = await extractAllDataFromPage(doc, urlCurent);
        dateleToatePaginilor.push(scrapedPageData);
        
        // Salvează prima pagină ca date principale
        if (!mainData) {
          console.log(`🏠 Pagina principală procesată cu ${scrapedPageData.products.length} produse`);
          mainData = scrapedPageData;
        }

        // === PASUL 8: PROCESARE SPECIALĂ PENTRU PAGINI DE PRODUSE ===
        console.log(`🛍️ Verific dacă ${urlCurent} este pagină de produs...`);
        if (isProductPage(doc, urlCurent)) {
          console.log(`✨ PAGINĂ DE PRODUS DETECTATĂ! Extrag detalii complete...`);
          const produsDetaliat = await scrapeIndividualProductPage(doc, urlCurent, baseUrl);
          if (produsDetaliat) {
            produseTotale.push(produsDetaliat);
            console.log(`🎯 Produs detaliat extras: ${produsDetaliat.name}`);
            console.log(`📊 Specificații: ${Object.keys(produsDetaliat.specifications).length}`);
            console.log(`🖼️ Imagini: ${produsDetaliat.images.length}`);
          }
        }
        
        // Adaugă produsele generale găsite pe pagină
        produseTotale.push(...scrapedPageData.products);
        linkuriTotale.push(...scrapedPageData.links);
        imaginiTotale.push(...scrapedPageData.images);

        // === PASUL 9: DESCOPERIREA LINK-URILOR INTERNE (CRAWLING) ===
        console.log(`🔗 DESCOPĂR LINK-URI NOI în ${urlCurent}...`);
        const linkuriNoi = await discoverAllInternalLinks(doc, urlCurent, baseUrl, domeniuPrincipal);
        
        let linkuriAdaugate = 0;
        linkuriNoi.forEach(linkNou => {
          if (!urlsVizitate.has(linkNou) && !urlsDeVizitat.includes(linkNou)) {
            urlsDeVizitat.push(linkNou);
            linkuriAdaugate++;
          }
        });

        console.log(`✅ PAGINĂ ${pagineProcesate} PROCESATĂ CU SUCCES!`);
        console.log(`📈 Statistici pagină: ${scrapedPageData.products.length} produse, ${linkuriNoi.length} link-uri găsite`);
        console.log(`➕ Link-uri noi adăugate în coadă: ${linkuriAdaugate}`);
        console.log(`📊 Total produse până acum: ${produseTotale.length}`);
        console.log(`🔗 Total link-uri în coadă: ${urlsDeVizitat.length}`);

      } catch (pageError) {
        console.error(`❌ EROARE la procesarea paginii ${urlCurent}:`, pageError);
        // Continuă cu următoarea pagină în loc să se oprească complet
        continue;
      }
    }
    
    if (!mainData) {
      throw new Error('Nu s-a putut procesa pagina principală - verifică URL-ul');
    }
    
    console.log(`\n🎉 === CRAWLING SISTEMATIC COMPLETAT ===`);
    console.log(`📊 STATISTICI FINALE:`);
    console.log(`   • Pagini procesate: ${pagineProcesate}`);
    console.log(`   • Produse totale: ${produseTotale.length}`);
    console.log(`   • Link-uri totale: ${linkuriTotale.length}`);
    console.log(`   • Imagini totale: ${imaginiTotale.length}`);
    console.log(`   • Domain principal: ${domeniuPrincipal}`);

    // === PASUL 10: COMBINAREA FINALĂ A TUTUROR DATELOR ===
    console.log(`🔄 Combin toate datele într-un rezultat final...`);
    
    // Elimină duplicatele și combină datele
    const produseFiltrate = produseTotale.filter((product, index, arr) => 
      arr.findIndex(p => p.name === product.name && p.url === product.url) === index
    );
    
    const linkuriFiltrate = linkuriTotale.filter((link, index, arr) => 
      arr.findIndex(l => l.url === link.url) === index
    );
    
    const imaginiFiltrate = imaginiTotale.filter((img, index, arr) => 
      arr.findIndex(i => i.src === img.src) === index
    );

    // Returnează rezultatul final cu TOATE datele combinate
    const rezultatFinal: ScrapedData = {
      ...mainData,
      products: produseFiltrate,
      links: linkuriFiltrate,
      images: imaginiFiltrate,
      text: mainData.text + `\n\n[CRAWLING SISTEMATIC FINALIZAT - ${pagineProcesate} PAGINI PROCESATE - ${produseFiltrate.length} PRODUSE CU DETALII COMPLETE]`,
      // Combină toate metadatele
      headings: dateleToatePaginilor.flatMap(d => d.headings),
      tables: dateleToatePaginilor.flatMap(d => d.tables),
      lists: dateleToatePaginilor.flatMap(d => d.lists),
      contactInfo: {
        emails: [...new Set(dateleToatePaginilor.flatMap(d => d.contactInfo.emails))],
        phones: [...new Set(dateleToatePaginilor.flatMap(d => d.contactInfo.phones))],
        addresses: [...new Set(dateleToatePaginilor.flatMap(d => d.contactInfo.addresses))]
      },
      socialLinks: dateleToatePaginilor.flatMap(d => d.socialLinks).filter((link, index, arr) => 
        arr.findIndex(l => l.url === link.url) === index
      ),
      technologies: {
        cms: [...new Set(dateleToatePaginilor.flatMap(d => d.technologies.cms))],
        frameworks: [...new Set(dateleToatePaginilor.flatMap(d => d.technologies.frameworks))],
        analytics: [...new Set(dateleToatePaginilor.flatMap(d => d.technologies.analytics))],
        advertising: [...new Set(dateleToatePaginilor.flatMap(d => d.technologies.advertising))]
      }
    };
    
    console.log(`✅ REZULTAT FINAL GENERAT CU SUCCES!`);
    return rezultatFinal;
    
  } catch (error) {
    console.error('❌ EROARE CRITICĂ la crawling sistematic:', error);
    throw error;
  }
};

const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');
  const [structuredReport, setStructuredReport] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

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
    setStructuredReport('');
    setProgress({ current: 0, total: 0 });

    try {
      const data = await handleScrape(url, (current, total) => {
        setProgress({ current, total });
      });
      setScrapedData(data);
      
      // Generăm raportul structurat
      const report = generateStructuredReport(data);
      setStructuredReport(report);
      
      toast({
        title: "Crawling profund finalizat",
        description: `Am extras ${data?.products.length || 0} produse și ${data?.links.length || 0} link-uri din ${progress.current} pagini procesate`,
      });
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
      setProgress({ current: 0, total: 0 });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(structuredReport);
      toast({
        title: "Copiat în clipboard",
        description: "Raportul a fost copiat cu succes în clipboard"
      });
    } catch (err) {
      toast({
        title: "Eroare la copiere",
        description: "Nu am putut copia raportul în clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Web Scraping</h1>
          <p className="text-gray-600 text-sm">
            Extrage automat toate datele dintr-un site urmărind fiecare pagină internă
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Scraping URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL Site Web</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !url.trim()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesez...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Extrage Date
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-900">Eroare</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {isLoading && progress.current > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Crawling profund în progres...
                  </span>
                </div>
                <div className="text-sm text-blue-700 mb-2">
                  Procesez pagina {progress.current} din {progress.total} 
                  {progress.total > 50 ? " (limitat la 50 pentru performanță)" : ""}
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Urmăresc toate link-urile interne pentru extragerea completă a datelor...
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Rezultate Scraping
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>{scrapedData.products.length} produse</span>
                <span>{scrapedData.images.length} imagini</span>
                <span>{scrapedData.links.length} link-uri</span>
                <span>{scrapedData.tables.length} tabele</span>
                <span>{scrapedData.contactInfo.emails.length} email-uri</span>
                <span>{scrapedData.technologies.cms.length + scrapedData.technologies.frameworks.length} tehnologii</span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="report" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 text-xs">
                  <TabsTrigger value="report">Raport</TabsTrigger>
                  <TabsTrigger value="overview">General</TabsTrigger>
                  <TabsTrigger value="content">Conținut</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="links">Link-uri</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="tech">Tehnologii</TabsTrigger>
                  <TabsTrigger value="products">Produse</TabsTrigger>
                  <TabsTrigger value="data">Date</TabsTrigger>
                </TabsList>

                <TabsContent value="report" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Raport Text Structurat</h3>
                    <Button 
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="ml-2"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Copiază Raportul
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Acest raport conține toate informațiile extrase din site într-un format structurat,
                      perfect pentru a fi analizat de un agent AI.
                    </p>
                    
                    <ScrollArea className="h-[500px] w-full">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono bg-white p-4 rounded border">
                        {structuredReport}
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Titlu</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{scrapedData.title}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg break-all">{scrapedData.url}</p>
                    </div>
                  </div>
                  
                  {scrapedData.description && (
                    <div className="space-y-2">
                      <Label>Descriere</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{scrapedData.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-900">{scrapedData.products.length}</div>
                      <div className="text-sm text-blue-700">Produse</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Image className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-900">{scrapedData.images.length}</div>
                      <div className="text-sm text-green-700">Imagini</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Link2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-900">{scrapedData.links.length}</div>
                      <div className="text-sm text-purple-700">Link-uri</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Code className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold text-orange-900">{scrapedData.headings.length}</div>
                      <div className="text-sm text-orange-700">Titluri</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {scrapedData.products.map((product) => (
                        <Card key={product.id} className="p-4">
                          <div className="flex gap-4">
                            {product.images.length > 0 && (
                              <img 
                                src={product.images[0].src} 
                                alt={product.images[0].alt}
                                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-gray-900">{product.name}</h3>
                              {product.price && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{product.price}</Badge>
                                  {product.currency && <span className="text-sm text-gray-500">{product.currency}</span>}
                                </div>
                              )}
                              {product.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{product.category}</Badge>
                                <Badge variant="outline">{product.availability}</Badge>
                              </div>
                              {Object.keys(product.specifications).length > 0 && (
                                <div className="text-xs text-gray-500">
                                  {Object.keys(product.specifications).length} specificații disponibile
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {scrapedData.products.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nu au fost găsite produse pe această pagină
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {scrapedData.images.slice(0, 50).map((image, index) => (
                        <div key={index} className="space-y-2">
                          <img 
                            src={image.src} 
                            alt={image.alt}
                            className="w-full h-32 object-cover rounded-lg bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <p className="text-xs text-gray-500 truncate" title={image.alt}>
                            {image.alt || 'Fără descriere'}
                          </p>
                        </div>
                      ))}
                    </div>
                    {scrapedData.images.length > 50 && (
                      <p className="text-center text-gray-500 mt-4">
                        Afișez primele 50 din {scrapedData.images.length} imagini
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="links" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {scrapedData.links.slice(0, 100).map((link, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {link.text || 'Link fără text'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{link.url}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {link.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {scrapedData.links.length > 100 && (
                      <p className="text-center text-gray-500 mt-4">
                        Afișez primele 100 din {scrapedData.links.length} link-uri
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      <Card className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Titluri și Structură</h4>
                        <div className="space-y-1">
                          {scrapedData.headings.map((heading, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">H{heading.level}</Badge>
                              <span className="text-gray-700">{heading.text}</span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {scrapedData.tables.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Tabele ({scrapedData.tables.length})</h4>
                          <div className="space-y-3">
                            {scrapedData.tables.slice(0, 3).map((table) => (
                              <div key={table.id} className="border rounded-lg p-3 bg-gray-50">
                                {table.caption && <h5 className="font-medium mb-2">{table.caption}</h5>}
                                {table.headers.length > 0 && (
                                  <div className="text-xs text-gray-600 mb-1">
                                    Coloane: {table.headers.join(', ')}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {table.rows.length} rânduri de date
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {scrapedData.lists.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Liste ({scrapedData.lists.length})</h4>
                          <div className="space-y-3">
                            {scrapedData.lists.slice(0, 5).map((list) => (
                              <div key={list.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">{list.type.toUpperCase()}</Badge>
                                  <span className="text-xs text-gray-500">{list.items.length} elemente</span>
                                </div>
                                <div className="text-sm text-gray-700">
                                  {list.items.slice(0, 3).map((item, i) => (
                                    <div key={i} className="truncate">• {item}</div>
                                  ))}
                                  {list.items.length > 3 && (
                                    <div className="text-xs text-gray-500">...și încă {list.items.length - 3}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {scrapedData.images.slice(0, 20).map((image, index) => (
                          <Card key={index} className="p-3">
                            <img 
                              src={image.src} 
                              alt={image.alt}
                              className="w-full h-24 object-cover rounded mb-2 bg-gray-100"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="text-xs space-y-1">
                              <p className="truncate font-medium" title={image.alt}>
                                {image.alt || 'Fără descriere'}
                              </p>
                              {image.width && image.height && (
                                <p className="text-gray-500">{image.width}×{image.height}</p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>

                      {scrapedData.media.videos.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Video ({scrapedData.media.videos.length})</h4>
                          <div className="space-y-2">
                            {scrapedData.media.videos.map((video, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm truncate">{video.src}</p>
                                <div className="flex gap-2 mt-1">
                                  {video.controls && <Badge variant="outline" className="text-xs">Controls</Badge>}
                                  {video.autoplay && <Badge variant="outline" className="text-xs">Autoplay</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {scrapedData.media.audios.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Audio ({scrapedData.media.audios.length})</h4>
                          <div className="space-y-2">
                            {scrapedData.media.audios.map((audio, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm truncate">{audio.src}</p>
                                <div className="flex gap-2 mt-1">
                                  {audio.controls && <Badge variant="outline" className="text-xs">Controls</Badge>}
                                  {audio.autoplay && <Badge variant="outline" className="text-xs">Autoplay</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        Email ({scrapedData.contactInfo.emails.length})
                      </h4>
                      <div className="space-y-1">
                        {scrapedData.contactInfo.emails.map((email, index) => (
                          <p key={index} className="text-sm text-gray-700 truncate">{email}</p>
                        ))}
                        {scrapedData.contactInfo.emails.length === 0 && (
                          <p className="text-sm text-gray-500">Nu au fost găsite email-uri</p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        Telefon ({scrapedData.contactInfo.phones.length})
                      </h4>
                      <div className="space-y-1">
                        {scrapedData.contactInfo.phones.map((phone, index) => (
                          <p key={index} className="text-sm text-gray-700">{phone}</p>
                        ))}
                        {scrapedData.contactInfo.phones.length === 0 && (
                          <p className="text-sm text-gray-500">Nu au fost găsite telefoane</p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        Adrese ({scrapedData.contactInfo.addresses.length})
                      </h4>
                      <div className="space-y-1">
                        {scrapedData.contactInfo.addresses.map((address, index) => (
                          <p key={index} className="text-sm text-gray-700">{address}</p>
                        ))}
                        {scrapedData.contactInfo.addresses.length === 0 && (
                          <p className="text-sm text-gray-500">Nu au fost găsite adrese</p>
                        )}
                      </div>
                    </Card>
                  </div>

                  {scrapedData.socialLinks.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Social Media ({scrapedData.socialLinks.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {scrapedData.socialLinks.map((social, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{social.text || 'Link social'}</p>
                              <p className="text-xs text-gray-500 truncate">{social.url}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="tech" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">CMS & Platforme</h4>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.technologies.cms.map((cms, index) => (
                          <Badge key={index} variant="outline">{cms}</Badge>
                        ))}
                        {scrapedData.technologies.cms.length === 0 && (
                          <p className="text-sm text-gray-500">Nu au fost detectate</p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Framework-uri</h4>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.technologies.frameworks.map((framework, index) => (
                          <Badge key={index} variant="outline">{framework}</Badge>
                        ))}
                        {scrapedData.technologies.frameworks.length === 0 && (
                          <p className="text-sm text-gray-500">Nu au fost detectate</p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Analytics</h4>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.technologies.analytics.map((analytics, index) => (
                          <Badge key={index} variant="outline">{analytics}</Badge>
                        ))}
                        {scrapedData.technologies.analytics.length === 0 && (
                          <p className="text-sm text-gray-500">Nu au fost detectate</p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Publicitate</h4>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.technologies.advertising.map((ad, index) => (
                          <Badge key={index} variant="outline">{ad}</Badge>
                        ))}
                        {scrapedData.technologies.advertising.length === 0 && (
                          <p className="text-sm text-gray-500">Nu au fost detectate</p>
                        )}
                      </div>
                    </Card>
                  </div>

                  {scrapedData.scripts.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Script-uri ({scrapedData.scripts.length})</h4>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {scrapedData.scripts.slice(0, 10).map((script, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                              <p className="truncate font-mono">{script.src || 'Script inline'}</p>
                              <div className="flex gap-2 mt-1">
                                {script.type && <Badge variant="outline" className="text-xs">{script.type}</Badge>}
                                {script.async && <Badge variant="outline" className="text-xs">async</Badge>}
                                {script.defer && <Badge variant="outline" className="text-xs">defer</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Meta Tags</h4>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {Object.entries(scrapedData.metadata).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <span className="font-medium text-gray-700">{key}</span>
                              <span className="md:col-span-2 text-gray-600 break-words">{value}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>

                    {scrapedData.structuredData.length > 0 && (
                      <Card className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Date Structurate JSON-LD ({scrapedData.structuredData.length})</h4>
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {scrapedData.structuredData.map((data, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded">
                                <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    )}

                    {scrapedData.forms.length > 0 && (
                      <Card className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Formulare ({scrapedData.forms.length})</h4>
                        <div className="space-y-3">
                          {scrapedData.forms.map((form, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">{form.method}</Badge>
                                {form.enctype && <Badge variant="outline" className="text-xs">{form.enctype}</Badge>}
                              </div>
                              <p className="text-sm truncate mb-2">{form.action || 'Fără action'}</p>
                              <div className="text-xs text-gray-600">
                                {form.inputs.length} câmpuri: {form.inputs.map(i => i.type).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    <div className="text-xs text-gray-500">
                      Extras la: {new Date(scrapedData.timestamp).toLocaleString('ro-RO')}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scraping;