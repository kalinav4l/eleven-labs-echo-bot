import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser, HTMLDocument } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Advanced scraping configuration
interface ScrapingConfig {
  userAgents: string[];
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  maxConcurrentRequests: number;
  rateLimitDelay: number;
  enableJavaScript: boolean;
  followRedirects: boolean;
  respectRobotsTxt: boolean;
  cacheDuration: number;
}

// Enhanced scraping request interface
interface ScrapingRequest {
  url: string;
  deepScraping?: boolean;
  maxDepth?: number;
  scrapingMode?: 'basic' | 'advanced' | 'ai_enhanced' | 'comprehensive';
  targetTypes?: ('products' | 'articles' | 'reviews' | 'images' | 'videos' | 'contacts' | 'emails' | 'phones' | 'social')[];
  customSelectors?: Record<string, string>;
  extractSchema?: boolean;
  extractJsonLd?: boolean;
  extractMicrodata?: boolean;
  extractOpenGraph?: boolean;
  extractTwitterCards?: boolean;
  analyzeContent?: boolean;
  detectLanguage?: boolean;
  extractSEOData?: boolean;
  monitorChanges?: boolean;
  performanceMetrics?: boolean;
  securityScan?: boolean;
  accessibilityCheck?: boolean;
  mobileCompatibility?: boolean;
  speedOptimization?: boolean;
  config?: Partial<ScrapingConfig>;
}

// Comprehensive product interface
interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  fullDescription?: string;
  price: string;
  originalPrice?: string;
  discountPrice?: string;
  discountPercentage?: number;
  currency?: string;
  priceHistory?: Array<{
    price: string;
    date: string;
    source: string;
  }>;
  category: string;
  subcategory?: string;
  categoryPath?: string[];
  brand?: string;
  brandUrl?: string;
  model?: string;
  sku?: string;
  ean?: string;
  upc?: string;
  gtin?: string;
  mpn?: string;
  isbn?: string;
  asin?: string;
  images: Array<{
    src: string;
    alt: string;
    title: string;
    type: 'main' | 'gallery' | 'thumbnail' | 'zoom' | 'lifestyle' | 'technical' | 'size_chart';
    width?: number;
    height?: number;
    format?: string;
    quality?: string;
    colorVariant?: string;
  }>;
  videos?: Array<{
    src: string;
    title: string;
    type: 'product_demo' | 'unboxing' | 'review' | 'tutorial' | 'advertisement';
    duration?: number;
    thumbnail?: string;
  }>;
  specifications: Record<string, string>;
  technicalSpecs?: Record<string, any>;
  features: string[];
  highlights?: string[];
  keyFeatures?: string[];
  benefits?: string[];
  useCases?: string[];
  targetAudience?: string[];
  compatibility?: string[];
  requirements?: string[];
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
    volume?: string;
  };
  materials?: string[];
  colors?: Array<{
    name: string;
    hex?: string;
    rgb?: string;
    image?: string;
    available: boolean;
  }>;
  sizes?: Array<{
    name: string;
    measurements?: Record<string, string>;
    available: boolean;
    stock?: number;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    price?: string;
    image?: string;
    attributes: Record<string, string>;
    available: boolean;
    stock?: number;
  }>;
  availability: string;
  inStock?: boolean;
  stockCount?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock' | 'pre_order' | 'back_order' | 'discontinued';
  deliveryInfo?: {
    freeShipping?: boolean;
    shippingCost?: string;
    deliveryTime?: string;
    availableShippingMethods?: string[];
    express?: boolean;
    sameDay?: boolean;
    pickup?: boolean;
  };
  seller?: {
    name: string;
    url?: string;
    rating?: number;
    reviews?: number;
    verified?: boolean;
    location?: string;
  };
  manufacturer?: {
    name: string;
    url?: string;
    country?: string;
    warranty?: string;
  };
  reviews?: {
    count: number;
    averageRating: number;
    ratingDistribution?: Record<string, number>;
    topReviews?: Array<{
      author: string;
      rating: number;
      title: string;
      content: string;
      date: string;
      verified: boolean;
      helpful?: number;
    }>;
  };
  qa?: Array<{
    question: string;
    answer: string;
    date: string;
    helpful?: number;
  }>;
  relatedProducts?: Array<{
    id: string;
    name: string;
    url: string;
    image?: string;
    price?: string;
    relationship: 'similar' | 'accessory' | 'bundle' | 'alternative' | 'upgrade';
  }>;
  bundles?: Array<{
    id: string;
    name: string;
    products: string[];
    totalPrice: string;
    savings: string;
  }>;
  accessories?: Array<{
    id: string;
    name: string;
    url: string;
    price: string;
    required: boolean;
  }>;
  promotions?: Array<{
    type: 'discount' | 'bogo' | 'free_shipping' | 'gift' | 'cashback';
    description: string;
    value?: string;
    validUntil?: string;
    conditions?: string;
  }>;
  awards?: Array<{
    name: string;
    year: string;
    organization: string;
    category?: string;
  }>;
  certifications?: Array<{
    name: string;
    organization: string;
    validUntil?: string;
    certificateUrl?: string;
  }>;
  sustainability?: {
    ecoFriendly?: boolean;
    recycled?: boolean;
    renewable?: boolean;
    carbonNeutral?: boolean;
    certificates?: string[];
  };
  url: string;
  canonicalUrl?: string;
  alternateUrls?: string[];
  scraped_at: string;
  last_updated?: string;
  source: string;
  confidence_score?: number;
  quality_score?: number;
  completeness_score?: number;
  reliability_score?: number;
  freshness_score?: number;
  metadata?: {
    scraping_method: string;
    processing_time: number;
    data_sources: string[];
    validation_status: string;
    error_count: number;
    warning_count: number;
  };
}

// Enhanced article interface
interface Article {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  authorUrl?: string;
  authorBio?: string;
  publishDate?: string;
  modifiedDate?: string;
  readingTime?: number;
  wordCount?: number;
  category?: string;
  tags?: string[];
  summary?: string;
  excerpt?: string;
  content: string;
  contentType?: 'article' | 'blog_post' | 'news' | 'press_release' | 'whitepaper' | 'case_study' | 'tutorial' | 'review';
  language?: string;
  images?: Array<{
    src: string;
    alt: string;
    caption?: string;
    credit?: string;
    type: 'featured' | 'inline' | 'gallery';
  }>;
  videos?: Array<{
    src: string;
    title: string;
    duration?: number;
    transcript?: string;
  }>;
  links?: Array<{
    url: string;
    text: string;
    type: 'internal' | 'external' | 'affiliate' | 'social';
  }>;
  citations?: Array<{
    text: string;
    url?: string;
    source: string;
  }>;
  relatedArticles?: Array<{
    title: string;
    url: string;
    summary?: string;
  }>;
  socialMetrics?: {
    shares?: number;
    likes?: number;
    comments?: number;
    reactions?: Record<string, number>;
  };
  seoMetrics?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    keywords?: string[];
    readabilityScore?: number;
    seoScore?: number;
  };
  url: string;
  canonicalUrl?: string;
  source: string;
  scraped_at: string;
  confidence_score?: number;
}

// Contact information interface
interface ContactInfo {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  department?: string;
  emails: string[];
  phones: string[];
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    type: 'business' | 'mailing' | 'billing' | 'shipping';
  }>;
  socialProfiles?: Array<{
    platform: string;
    url: string;
    username?: string;
  }>;
  website?: string;
  businessHours?: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  url: string;
  source: string;
  scraped_at: string;
}

// Social media post interface
interface SocialPost {
  id: string;
  platform: string;
  author?: string;
  authorHandle?: string;
  authorUrl?: string;
  content: string;
  publishDate?: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'live' | 'poll' | 'event';
  hashtags?: string[];
  mentions?: string[];
  mediaUrls?: string[];
  likes?: number;
  shares?: number;
  comments?: number;
  views?: number;
  engagement_rate?: number;
  url: string;
  source: string;
  scraped_at: string;
}

// SEO data interface
interface SEOData {
  title?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  language?: string;
  author?: string;
  publisher?: string;
  copyright?: string;
  headings?: Array<{
    level: number;
    text: string;
  }>;
  images?: Array<{
    src: string;
    alt: string;
    title?: string;
  }>;
  internalLinks?: number;
  externalLinks?: number;
  wordCount?: number;
  pageSpeed?: {
    loadTime?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    firstInputDelay?: number;
  };
  accessibility?: {
    score?: number;
    issues?: string[];
    wcagCompliance?: string;
  };
  mobileOptimization?: {
    responsive?: boolean;
    viewportMeta?: boolean;
    touchFriendly?: boolean;
  };
  structuredData?: any[];
  socialTags?: {
    openGraph?: Record<string, string>;
    twitterCard?: Record<string, string>;
    facebookMeta?: Record<string, string>;
  };
}

// Performance metrics interface
interface PerformanceMetrics {
  requestStartTime: number;
  responseTime: number;
  downloadTime: number;
  processingTime: number;
  totalTime: number;
  contentSize: number;
  imageCount: number;
  linkCount: number;
  scriptCount: number;
  styleSheetCount: number;
  httpRequests: number;
  cacheHitRatio?: number;
  compressionRatio?: number;
  errorCount: number;
  warningCount: number;
  retryCount: number;
  successRate: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

// Security scan results interface
interface SecurityScan {
  httpsEnabled: boolean;
  sslCertificateValid: boolean;
  securityHeaders: {
    contentSecurityPolicy?: string;
    xFrameOptions?: string;
    xContentTypeOptions?: string;
    strictTransportSecurity?: string;
    referrerPolicy?: string;
  };
  vulnerabilities?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  privacyPolicy?: string;
  cookiePolicy?: string;
  gdprCompliant?: boolean;
  ccpaCompliant?: boolean;
  dataCollection?: string[];
  thirdPartyTrackers?: string[];
}

// Advanced scraping configuration with multiple strategies
const DEFAULT_CONFIG: ScrapingConfig = {
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
    'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0'
  ],
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000,
  maxConcurrentRequests: 5,
  rateLimitDelay: 500,
  enableJavaScript: false,
  followRedirects: true,
  respectRobotsTxt: false,
  cacheDuration: 3600
};

// Language detection patterns
const LANGUAGE_PATTERNS = {
  'ro': /\b(și|sau|este|sunt|de|la|în|cu|pentru|pe|să|nu|mai|foarte|cum|când|unde|care|ce|după|prin|până|către|asupra|asupra|dintre|fără|contra|sub|peste|printre|înaintea|în timpul|după ce|înainte de|în loc de|în timpul|în spatele|în fața|în mijlocul|în jurul|în interiorul|în exteriorul)\b/gi,
  'en': /\b(the|and|or|is|are|to|from|in|with|for|on|at|by|of|about|into|through|during|before|after|above|below|up|down|out|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|can|will|just|should|now)\b/gi,
  'fr': /\b(le|la|les|et|ou|est|sont|de|à|dans|avec|pour|sur|par|du|des|un|une|ce|cette|ces|que|qui|dont|où|quand|comment|pourquoi|très|plus|moins|bien|mal|avant|après|pendant|depuis|jusqu|entre|parmi|contre|sous|over|devant|derrière|autour|dedans|dehors)\b/gi,
  'es': /\b(el|la|los|las|y|o|es|son|de|en|con|para|por|del|al|un|una|que|se|le|lo|su|sus|este|esta|estos|estas|cuando|donde|como|por qué|muy|más|menos|bien|mal|antes|después|durante|desde|hasta|entre|contra|bajo|sobre|delante|detrás|alrededor|dentro|fuera)\b/gi,
  'de': /\b(der|die|das|und|oder|ist|sind|von|zu|in|mit|für|auf|an|bei|nach|vor|über|unter|aus|durch|gegen|ohne|um|während|seit|bis|zwischen|hinter|neben|innerhalb|außerhalb|oberhalb|unterhalb|entlang|trotz|wegen|statt|anstatt)\b/gi,
  'it': /\b(il|la|lo|i|gli|le|e|o|è|sono|di|a|da|in|con|per|su|tra|fra|del|della|dello|dei|degli|delle|un|una|che|se|si|ci|vi|ne|quando|dove|come|perché|molto|più|meno|bene|male|prima|dopo|durante|da quando|fino a|tra|contro|sotto|sopra|davanti|dietro|intorno|dentro|fuori)\b/gi,
  'pt': /\b(o|a|os|as|e|ou|é|são|de|em|com|para|por|do|da|dos|das|um|uma|que|se|lhe|lhes|quando|onde|como|por que|muito|mais|menos|bem|mal|antes|depois|durante|desde|até|entre|contra|sob|sobre|diante|atrás|ao redor|dentro|fora)\b/gi
};

// Content type detection patterns
const CONTENT_TYPE_PATTERNS = {
  product: {
    selectors: [
      '[itemtype*="Product"]',
      '[data-product-id]',
      '.product',
      '.item',
      '.listing',
      '[class*="product"]',
      '[id*="product"]'
    ],
    keywords: /\b(price|cost|buy|purchase|add to cart|in stock|out of stock|sku|model|brand|rating|review|specification|feature|color|size|weight|dimension|warranty|shipping|delivery|discount|sale|offer|deal)\b/gi
  },
  article: {
    selectors: [
      'article',
      '[itemtype*="Article"]',
      '.post',
      '.blog-post',
      '.news',
      '.content',
      '[class*="article"]',
      '[class*="post"]'
    ],
    keywords: /\b(article|blog|post|news|author|published|date|category|tag|comment|share|read more|continue reading|related|similar|previous|next)\b/gi
  },
  review: {
    selectors: [
      '[itemtype*="Review"]',
      '.review',
      '.rating',
      '.testimonial',
      '[class*="review"]',
      '[class*="rating"]'
    ],
    keywords: /\b(review|rating|star|score|recommend|opinion|feedback|comment|testimonial|experience|satisfied|disappointed|excellent|good|bad|terrible|amazing)\b/gi
  },
  contact: {
    selectors: [
      '.contact',
      '.about',
      '.company',
      '[class*="contact"]',
      '[class*="about"]'
    ],
    keywords: /\b(contact|phone|email|address|location|office|headquarters|support|customer service|help|faq|about us|team|staff|management)\b/gi
  }
};

// E-commerce platforms detection
const ECOMMERCE_PLATFORMS = {
  shopify: {
    indicators: [
      'Shopify.shop',
      'cdn.shopify.com',
      '/products/',
      'shopify-section',
      'shopify-payment-button'
    ],
    selectors: {
      product: '.product-form, .product-single, .product-details',
      price: '.price, .money, .product-price',
      title: 'h1.product-single__title, .product-title',
      description: '.product-single__description, .product-description',
      images: '.product-single__photo img, .product-image img',
      rating: '.product-rating, .reviews-rating',
      availability: '.product-availability, .product-form__inventory'
    }
  },
  woocommerce: {
    indicators: [
      'woocommerce',
      'wp-content',
      'add-to-cart',
      'wc-',
      'product_cat'
    ],
    selectors: {
      product: '.product, .woocommerce-product',
      price: '.price, .woocommerce-Price-amount',
      title: '.product_title, h1.entry-title',
      description: '.woocommerce-product-details__short-description, .product-summary',
      images: '.woocommerce-product-gallery__image img',
      rating: '.star-rating, .woocommerce-product-rating',
      availability: '.stock, .out-of-stock'
    }
  },
  magento: {
    indicators: [
      'Magento',
      'mage-',
      'catalog/product',
      'checkout/cart',
      'customer/account'
    ],
    selectors: {
      product: '.product-info-main, .product-item',
      price: '.price, .price-box',
      title: '.page-title, .product-item-name',
      description: '.product-info-description, .short-description',
      images: '.product-image-main img, .product-item-photo img',
      rating: '.rating-summary, .reviews-summary',
      availability: '.stock, .availability'
    }
  },
  prestashop: {
    indicators: [
      'PrestaShop',
      'prestashop',
      'ps_',
      'id_product',
      'add-to-cart'
    ],
    selectors: {
      product: '.product-container, .product-miniature',
      price: '.price, .product-price',
      title: 'h1, .product-title',
      description: '.product-description, .short-description',
      images: '.product-cover img, .product-image img',
      rating: '.star-rating, .comments_note',
      availability: '.product-availability, .product-quantities'
    }
  }
};

// Romanian e-commerce specific patterns
const ROMANIAN_ECOMMERCE_PATTERNS = {
  keywords: /\b(preț|cost|cumpără|comandă|adaugă în coș|în stoc|stoc epuizat|cod produs|model|marcă|evaluare|recenzie|specificații|caracteristici|culoare|mărime|greutate|dimensiuni|garanție|livrare|reducere|ofertă|promoție)\b/gi,
  currency: /\b(lei|ron|mdl)\b/gi,
  availability: /\b(în stoc|stoc disponibil|stoc epuizat|indisponibil|la comandă|precomandă|ultimele bucăți|stoc limitat)\b/gi,
  shipping: /\b(livrare|transport|expediere|curier|gratuit|taxa de livrare|cost transport)\b/gi,
  categories: {
    'materiale_electrice': /\b(cablu|fir|întrerupător|priză|bec|led|neon|transformator|siguranță|tablou electric|component electronic|aparat electric|fotovoltaic|solar|ventilație|automatizare|senzor|detector|termostat|doza|mufa|conector|releu|contactor|disjunctor|diferențial)\b/gi,
    'electronice': /\b(telefon|laptop|computer|televizor|monitor|cameră|audio|video|gaming|accesorii|încărcător|cabluri|căști|boxe|microfon)\b/gi,
    'electrocasnice': /\b(frigider|mașină de spălat|cuptor|aragaz|aspirator|robot|cafetieră|blender|mixer|prăjitor|fierbător|fier de călcat)\b/gi,
    'iluminat': /\b(lampă|candelabru|plafonieră|spot|proiector|led|halogen|incandescent|fluorescent|smart|dimmer|întrerupător)\b/gi,
    'climatizare': /\b(aer condiționat|ventilator|încălzire|răcire|purificator|umidificator|dezumidificator|pompa de căldură)\b/gi
  }
};

// Content quality scoring factors
const QUALITY_FACTORS = {
  length: { min: 50, optimal: 500, max: 2000 },
  images: { min: 1, optimal: 3, max: 20 },
  links: { min: 0, optimal: 5, max: 50 },
  structure: { headings: true, paragraphs: true, lists: true },
  freshness: { days: 30 }, // Content older than 30 days gets lower score
  uniqueness: { threshold: 0.8 }, // Similarity threshold for duplicate detection
  readability: { avgWordsPerSentence: 20, avgSentencesPerParagraph: 4 }
};

// Anti-bot detection patterns and bypass strategies
const ANTI_BOT_PATTERNS = {
  cloudflare: {
    indicators: ['__cf_bm', 'cf-ray', 'cloudflare', 'checking your browser'],
    headers: {
      'cf-connecting-ip': '127.0.0.1',
      'cf-ipcountry': 'US'
    }
  },
  recaptcha: {
    indicators: ['recaptcha', 'captcha', 'robot verification'],
    strategies: ['delay', 'user-agent-rotation', 'header-variation']
  },
  rateLimit: {
    indicators: ['rate limit', 'too many requests', '429'],
    strategies: ['exponential-backoff', 'user-agent-rotation', 'ip-rotation']
  }
};

// Utility functions for advanced text processing
class TextProcessor {
  static detectLanguage(text: string): string {
    const scores: Record<string, number> = {};
    
    for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      const matches = text.match(pattern);
      scores[lang] = matches ? matches.length : 0;
    }
    
    return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
  }
  
  static calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  }
  
  private static countSyllables(word: string): number {
    const vowels = 'aeiouyAEIOUY';
    let count = 0;
    let previousChar = '';
    
    for (const char of word) {
      if (vowels.includes(char) && !vowels.includes(previousChar)) {
        count++;
      }
      previousChar = char;
    }
    
    // Adjust for silent 'e'
    if (word.endsWith('e') && count > 1) count--;
    
    return Math.max(1, count);
  }
  
  static extractKeywords(text: string, maxKeywords: number = 20): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const frequency: Record<string, number> = {};
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }
  
  static summarizeText(text: string, maxSentences: number = 3): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= maxSentences) return text;
    
    // Simple extractive summarization based on sentence position and length
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence: sentence.trim(),
      score: this.scoreSentence(sentence, index, sentences.length)
    }));
    
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .map(item => item.sentence)
      .join('. ') + '.';
  }
  
  private static scoreSentence(sentence: string, position: number, totalSentences: number): number {
    let score = 0;
    
    // Position scoring (first and last sentences are often important)
    if (position === 0 || position === totalSentences - 1) score += 2;
    if (position < totalSentences * 0.3) score += 1;
    
    // Length scoring (medium-length sentences are often better)
    const words = sentence.split(/\s+/).length;
    if (words >= 10 && words <= 30) score += 2;
    if (words >= 5 && words <= 50) score += 1;
    
    // Keyword scoring (sentences with important words)
    const importantWords = /\b(important|key|main|primary|essential|crucial|significant|major|central|core|fundamental|critical|vital|principal)\b/gi;
    const matches = sentence.match(importantWords);
    if (matches) score += matches.length;
    
    return score;
  }
}

// Advanced schema extraction class
class SchemaExtractor {
  static extractStructuredData(doc: Document): any[] {
    const schemas: any[] = [];
    
    // JSON-LD extraction
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        schemas.push({ type: 'json-ld', data });
      } catch (e) {
        console.warn('Failed to parse JSON-LD:', e);
      }
    });
    
    // Microdata extraction
    const microdataItems = doc.querySelectorAll('[itemscope]');
    microdataItems.forEach(item => {
      const microdata = this.extractMicrodata(item);
      if (microdata) {
        schemas.push({ type: 'microdata', data: microdata });
      }
    });
    
    // RDFa extraction (basic)
    const rdfaItems = doc.querySelectorAll('[typeof]');
    rdfaItems.forEach(item => {
      const rdfa = this.extractRDFa(item);
      if (rdfa) {
        schemas.push({ type: 'rdfa', data: rdfa });
      }
    });
    
    return schemas;
  }
  
  private static extractMicrodata(element: Element): any {
    const item: any = {};
    
    const itemType = element.getAttribute('itemtype');
    if (itemType) item['@type'] = itemType;
    
    const properties = element.querySelectorAll('[itemprop]');
    properties.forEach(prop => {
      const name = prop.getAttribute('itemprop');
      if (!name) return;
      
      let value: any;
      if (prop.hasAttribute('content')) {
        value = prop.getAttribute('content');
      } else if (prop.tagName === 'META') {
        value = prop.getAttribute('content');
      } else if (prop.tagName === 'IMG') {
        value = prop.getAttribute('src');
      } else if (prop.tagName === 'A') {
        value = prop.getAttribute('href');
      } else if (prop.tagName === 'TIME') {
        value = prop.getAttribute('datetime') || prop.textContent;
      } else {
        value = prop.textContent?.trim();
      }
      
      if (value) {
        if (item[name]) {
          if (!Array.isArray(item[name])) {
            item[name] = [item[name]];
          }
          item[name].push(value);
        } else {
          item[name] = value;
        }
      }
    });
    
    return Object.keys(item).length > 0 ? item : null;
  }
  
  private static extractRDFa(element: Element): any {
    const item: any = {};
    
    const type = element.getAttribute('typeof');
    if (type) item['@type'] = type;
    
    const properties = element.querySelectorAll('[property]');
    properties.forEach(prop => {
      const name = prop.getAttribute('property');
      const value = prop.getAttribute('content') || prop.textContent?.trim();
      if (name && value) {
        item[name] = value;
      }
    });
    
    return Object.keys(item).length > 0 ? item : null;
  }
}

// E-commerce platform detector
class PlatformDetector {
  static detectPlatform(doc: Document, url: string): string | null {
    const html = doc.documentElement.outerHTML.toLowerCase();
    
    for (const [platform, config] of Object.entries(ECOMMERCE_PLATFORMS)) {
      const matchCount = config.indicators.filter(indicator => 
        html.includes(indicator.toLowerCase()) || url.toLowerCase().includes(indicator.toLowerCase())
      ).length;
      
      if (matchCount >= 2) {
        return platform;
      }
    }
    
    return null;
  }
  
  static getPlatformSelectors(platform: string): any {
    return ECOMMERCE_PLATFORMS[platform as keyof typeof ECOMMERCE_PLATFORMS]?.selectors || {};
  }
}

// Advanced product detection with multiple strategies
class ProductDetector {
  static detectProducts(doc: Document, targetUrl: string, config: Partial<ScrapingConfig> = {}): Product[] {
    const startTime = Date.now();
    console.log('🚀 Starting advanced product detection...');
    
    const products: Product[] = [];
    const platform = PlatformDetector.detectPlatform(doc, targetUrl);
    const language = TextProcessor.detectLanguage(doc.body?.textContent || '');
    
    console.log(`📊 Detected platform: ${platform || 'unknown'}, Language: ${language}`);
    
    // Multiple detection strategies
    const strategies = [
      () => this.detectByStructuredData(doc, targetUrl),
      () => this.detectByPlatformSelectors(doc, targetUrl, platform),
      () => this.detectBySemanticAnalysis(doc, targetUrl, language),
      () => this.detectByVisualCues(doc, targetUrl),
      () => this.detectByTextAnalysis(doc, targetUrl, language),
      () => this.detectByUrlPatterns(doc, targetUrl),
      () => this.detectByImageAnalysis(doc, targetUrl),
      () => this.detectByLinkAnalysis(doc, targetUrl)
    ];
    
    // Execute all strategies and combine results
    const allProducts: Product[] = [];
    for (const strategy of strategies) {
      try {
        const strategyProducts = strategy();
        allProducts.push(...strategyProducts);
        console.log(`📈 Strategy found ${strategyProducts.length} products`);
      } catch (error) {
        console.error('❌ Strategy failed:', error);
      }
    }
    
    // Deduplicate and score products
    const uniqueProducts = this.deduplicateProducts(allProducts);
    const scoredProducts = this.scoreProducts(uniqueProducts, doc, targetUrl);
    
    // Sort by quality score and return ALL results (removed limit)
    const finalProducts = scoredProducts
      .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
    
    console.log(`✅ Detection completed in ${Date.now() - startTime}ms, found ${finalProducts.length} products`);
    return finalProducts;
  }
  
  private static detectByStructuredData(doc: Document, targetUrl: string): Product[] {
    const products: Product[] = [];
    const schemas = SchemaExtractor.extractStructuredData(doc);
    
    for (const schema of schemas) {
      if (schema.type === 'json-ld' && schema.data) {
        const data = Array.isArray(schema.data) ? schema.data : [schema.data];
        
        for (const item of data) {
          if (this.isProductSchema(item)) {
            const product = this.extractFromSchema(item, targetUrl);
            if (product) {
              product.metadata = {
                ...product.metadata,
                scraping_method: 'structured_data',
                data_sources: ['json-ld'],
                validation_status: 'schema_validated',
                error_count: 0,
                warning_count: 0,
                processing_time: 0
              };
              products.push(product);
            }
          }
        }
      }
    }
    
    return products;
  }
  
  private static detectByPlatformSelectors(doc: Document, targetUrl: string, platform: string | null): Product[] {
    if (!platform) return [];
    
    const products: Product[] = [];
    const selectors = PlatformDetector.getPlatformSelectors(platform);
    
    const productElements = doc.querySelectorAll(selectors.product || '.product');
    
    productElements.forEach((element, index) => {
      const product = this.extractFromElement(element, targetUrl, selectors);
      if (product) {
        product.metadata = {
          ...product.metadata,
          scraping_method: 'platform_specific',
          data_sources: [platform],
          validation_status: 'platform_validated',
          error_count: 0,
          warning_count: 0,
          processing_time: 0
        };
        products.push(product);
      }
    });
    
    return products;
  }
  
  private static detectBySemanticAnalysis(doc: Document, targetUrl: string, language: string): Product[] {
    const products: Product[] = [];
    const contentPatterns = CONTENT_TYPE_PATTERNS.product;
    
    // Find semantic product containers
    const semanticSelectors = [
      '[itemtype*="Product"]',
      '[vocab*="schema.org"]',
      '[typeof*="Product"]',
      '.product, .item, .listing',
      '[data-product]',
      '[class*="product"]',
      '[id*="product"]'
    ];
    
    for (const selector of semanticSelectors) {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isProductElement(element, language)) {
          const product = this.extractFromElement(element, targetUrl);
          if (product) {
            product.metadata = {
              ...product.metadata,
              scraping_method: 'semantic_analysis',
              data_sources: ['semantic_markup'],
              validation_status: 'semantic_validated',
              error_count: 0,
              warning_count: 0,
              processing_time: 0
            };
            products.push(product);
          }
        }
      });
    }
    
    return products;
  }
  
  private static detectByVisualCues(doc: Document, targetUrl: string): Product[] {
    const products: Product[] = [];
    
    // Find elements with visual product indicators
    const allElements = doc.querySelectorAll('*');
    
    allElements.forEach(element => {
      const hasProductVisualCues = this.hasProductVisualCues(element);
      if (hasProductVisualCues) {
        const product = this.extractFromElement(element, targetUrl);
        if (product) {
          product.metadata = {
            ...product.metadata,
            scraping_method: 'visual_analysis',
            data_sources: ['visual_cues'],
            validation_status: 'visual_validated',
            error_count: 0,
            warning_count: 0,
            processing_time: 0
          };
          products.push(product);
        }
      }
    });
    
    return products;
  }
  
  private static detectByTextAnalysis(doc: Document, targetUrl: string, language: string): Product[] {
    const products: Product[] = [];
    const patterns = language === 'ro' ? ROMANIAN_ECOMMERCE_PATTERNS : CONTENT_TYPE_PATTERNS.product;
    
    const allElements = doc.querySelectorAll('*');
    
    allElements.forEach(element => {
      const text = element.textContent || '';
      if (this.hasProductTextPatterns(text, patterns)) {
        const product = this.extractFromElement(element, targetUrl);
        if (product) {
          product.metadata = {
            ...product.metadata,
            scraping_method: 'text_analysis',
            data_sources: ['text_patterns'],
            validation_status: 'text_validated',
            error_count: 0,
            warning_count: 0,
            processing_time: 0
          };
          products.push(product);
        }
      }
    });
    
    return products;
  }
  
  private static detectByUrlPatterns(doc: Document, targetUrl: string): Product[] {
    const products: Product[] = [];
    
    // Look for product URLs in links
    const links = doc.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (this.isProductUrl(href)) {
        const product = this.extractFromElement(link.closest('[class*="product"], .item, .listing') || link, targetUrl);
        if (product) {
          product.url = href.startsWith('http') ? href : new URL(href, targetUrl).href;
          product.metadata = {
            ...product.metadata,
            scraping_method: 'url_pattern',
            data_sources: ['url_analysis'],
            validation_status: 'url_validated',
            error_count: 0,
            warning_count: 0,
            processing_time: 0
          };
          products.push(product);
        }
      }
    });
    
    return products;
  }
  
  private static detectByImageAnalysis(doc: Document, targetUrl: string): Product[] {
    const products: Product[] = [];
    
    const images = doc.querySelectorAll('img');
    
    images.forEach(img => {
      if (this.isProductImage(img)) {
        const container = this.findProductContainer(img);
        if (container) {
          const product = this.extractFromElement(container, targetUrl);
          if (product) {
            product.metadata = {
              ...product.metadata,
              scraping_method: 'image_analysis',
              data_sources: ['image_cues'],
              validation_status: 'image_validated',
              error_count: 0,
              warning_count: 0,
              processing_time: 0
            };
            products.push(product);
          }
        }
      }
    });
    
    return products;
  }
  
  private static detectByLinkAnalysis(doc: Document, targetUrl: string): Product[] {
    const products: Product[] = [];
    
    const links = doc.querySelectorAll('a');
    
    links.forEach(link => {
      if (this.isProductLink(link)) {
        const container = this.findProductContainer(link);
        if (container) {
          const product = this.extractFromElement(container, targetUrl);
          if (product) {
            const href = link.getAttribute('href');
            if (href) {
              product.url = href.startsWith('http') ? href : new URL(href, targetUrl).href;
            }
            product.metadata = {
              ...product.metadata,
              scraping_method: 'link_analysis',
              data_sources: ['link_patterns'],
              validation_status: 'link_validated',
              error_count: 0,
              warning_count: 0,
              processing_time: 0
            };
            products.push(product);
          }
        }
      }
    });
    
    return products;
  }
  
  private static extractFromSchema(schema: any, targetUrl: string): Product | null {
    try {
      const product: Product = {
        id: `schema_${Date.now()}_${Math.random()}`,
        name: schema.name || '',
        description: schema.description || '',
        price: this.extractPrice(schema.offers || schema.price),
        category: schema.category || '',
        images: this.extractImages(schema.image, targetUrl),
        specifications: this.extractSpecifications(schema),
        features: this.extractFeatures(schema),
        availability: this.extractAvailability(schema.offers),
        url: schema.url || targetUrl,
        scraped_at: new Date().toISOString(),
        source: 'structured_data',
        confidence_score: 0.95
      };
      
      // Extract additional schema properties
      if (schema.brand) product.brand = schema.brand.name || schema.brand;
      if (schema.model) product.model = schema.model;
      if (schema.sku) product.sku = schema.sku;
      if (schema.gtin) product.gtin = schema.gtin;
      if (schema.mpn) product.mpn = schema.mpn;
      
      // Extract reviews
      if (schema.aggregateRating || schema.review) {
        product.reviews = this.extractReviews(schema);
      }
      
      // Extract seller information
      if (schema.seller) {
        product.seller = {
          name: schema.seller.name || '',
          url: schema.seller.url,
          rating: schema.seller.aggregateRating?.ratingValue,
          reviews: schema.seller.aggregateRating?.reviewCount
        };
      }
      
      return product.name ? product : null;
    } catch (error) {
      console.error('Error extracting from schema:', error);
      return null;
    }
  }
  
  private static extractFromElement(element: Element, targetUrl: string, selectors?: any): Product | null {
    try {
      const product: Product = {
        id: `element_${Date.now()}_${Math.random()}`,
        name: this.extractName(element, selectors),
        description: this.extractDescription(element, selectors),
        price: this.extractPriceFromElement(element, selectors),
        category: this.extractCategory(element, selectors),
        images: this.extractImagesFromElement(element, targetUrl),
        specifications: this.extractSpecificationsFromElement(element),
        features: this.extractFeaturesFromElement(element),
        availability: this.extractAvailabilityFromElement(element),
        url: this.extractUrl(element, targetUrl),
        scraped_at: new Date().toISOString(),
        source: 'element_extraction',
        confidence_score: 0.7
      };
      
      // Extract additional product information
      product.brand = this.extractBrand(element);
      product.model = this.extractModel(element);
      product.sku = this.extractSku(element);
      product.colors = this.extractColors(element);
      product.sizes = this.extractSizes(element);
      product.dimensions = this.extractDimensions(element);
      product.materials = this.extractMaterials(element);
      product.reviews = this.extractReviewsFromElement(element);
      product.promotions = this.extractPromotions(element);
      product.deliveryInfo = this.extractDeliveryInfo(element);
      
      return product.name ? product : null;
    } catch (error) {
      console.error('Error extracting from element:', error);
      return null;
    }
  }
  
  private static extractName(element: Element, selectors?: any): string {
    const nameSelectors = selectors?.title ? [selectors.title] : [
      'h1, h2, h3, h4, h5, h6',
      '.title, .name, .product-title, .product-name',
      '.nume, .denumire, .titlu',
      '[class*="title"], [class*="name"], [class*="nume"]',
      'a[title]',
      'img[alt]',
      'figcaption',
      '.category-title, .cat-title'
    ];
    
    for (const selector of nameSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement?.textContent?.trim()) {
        let title = titleElement.textContent.trim();
        title = title.replace(/(\$|€|£|lei|ron|mdl)[\d.,\s]+/gi, '').trim();
        title = title.replace(/vezi\s+produs|vezi\s+produse|view\s+product/gi, '').trim();
        if (title.length > 3 && title.length < 200) {
          return title;
        }
      }
    }
    
    // Fallback to element text analysis
    const elementText = element.textContent?.trim() || '';
    const lines = elementText.split('\n').map(line => line.trim()).filter(line => line.length > 3 && line.length < 200);
    
    for (const line of lines) {
      if (!/(vezi|view|produs|product|categorie|category)$/i.test(line) && !/^(vezi|view)/i.test(line)) {
        let cleanedText = line.replace(/(\$|€|£|lei|ron|mdl)[\d.,\s]+/gi, '').trim();
        cleanedText = cleanedText.replace(/\b(produs|product|categorie|category|vezi|view)\b/gi, '').trim();
        if (cleanedText.length > 3) {
          return cleanedText;
        }
      }
    }
    
    return '';
  }
  
  private static extractDescription(element: Element, selectors?: any): string {
    const descSelectors = selectors?.description ? [selectors.description] : [
      '.description, .desc, .summary',
      '.descriere, .detalii',
      '[class*="description"], [class*="desc"]',
      '.product-description, .item-description',
      '.content, .details'
    ];
    
    for (const selector of descSelectors) {
      const descElement = element.querySelector(selector);
      if (descElement?.textContent?.trim()) {
        const desc = descElement.textContent.trim();
        if (desc.length > 10 && desc.length < 2000) {
          return desc;
        }
      }
    }
    
    return '';
  }
  
  private static extractPriceFromElement(element: Element, selectors?: any): string {
    const priceSelectors = selectors?.price ? [selectors.price] : [
      '.price, .pret, .cost, .amount',
      '[class*="price"], [class*="pret"], [class*="cost"]',
      '.price-current, .pret-curent, .final-price',
      '.money, .currency'
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = element.querySelector(selector);
      if (priceElement?.textContent?.trim()) {
        const priceText = priceElement.textContent.trim();
        if (/\d+[.,]\d+/.test(priceText)) {
          return priceText;
        }
      }
    }
    
    return '';
  }
  
  private static extractCategory(element: Element, selectors?: any): string {
    const categorySelectors = [
      '.category, .categorie, .cat',
      '[class*="category"], [class*="categorie"]',
      '.breadcrumb, .breadcrumbs',
      '.nav, .navigation'
    ];
    
    for (const selector of categorySelectors) {
      const catElement = element.querySelector(selector);
      if (catElement?.textContent?.trim()) {
        return catElement.textContent.trim();
      }
    }
    
    // Try to detect category from text patterns
    const text = element.textContent || '';
    for (const [category, pattern] of Object.entries(ROMANIAN_ECOMMERCE_PATTERNS.categories)) {
      if (pattern.test(text)) {
        return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }
    
    return 'General';
  }
  
  private static extractImagesFromElement(element: Element, targetUrl: string): Array<any> {
    const images: Array<any> = [];
    const imgElements = element.querySelectorAll('img');
    
    imgElements.forEach(img => {
      const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
      if (src && !src.includes('placeholder') && !src.includes('loading')) {
        images.push({
          src: src.startsWith('http') ? src : new URL(src, targetUrl).href,
          alt: img.alt || '',
          title: img.title || '',
          type: 'gallery',
          width: img.naturalWidth || undefined,
          height: img.naturalHeight || undefined
        });
      }
    });
    
    return images;
  }
  
  private static extractSpecificationsFromElement(element: Element): Record<string, string> {
    const specs: Record<string, string> = {};
    
    // Look for specification tables or lists
    const specElements = element.querySelectorAll('.spec, .specification, .specifications, .details, .detalii');
    
    specElements.forEach(specElement => {
      // Try to extract from table format
      const rows = specElement.querySelectorAll('tr, .row');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th, .cell, .label, .value');
        if (cells.length >= 2) {
          const key = cells[0].textContent?.trim() || '';
          const value = cells[1].textContent?.trim() || '';
          if (key && value) {
            specs[key] = value;
          }
        }
      });
      
      // Try to extract from list format
      const listItems = specElement.querySelectorAll('li, .item');
      listItems.forEach(item => {
        const text = item.textContent?.trim() || '';
        const colonIndex = text.indexOf(':');
        if (colonIndex > 0) {
          const key = text.substring(0, colonIndex).trim();
          const value = text.substring(colonIndex + 1).trim();
          if (key && value) {
            specs[key] = value;
          }
        }
      });
    });
    
    return specs;
  }
  
  private static extractFeaturesFromElement(element: Element): string[] {
    const features: string[] = [];
    
    // Look for feature lists
    const featureElements = element.querySelectorAll('.features, .caracteristici, .benefits, .highlights');
    
    featureElements.forEach(featureElement => {
      const listItems = featureElement.querySelectorAll('li, .feature, .benefit');
      listItems.forEach(item => {
        const text = item.textContent?.trim();
        if (text && text.length > 5 && text.length < 200) {
          features.push(text);
        }
      });
    });
    
    return features;
  }
  
  private static extractAvailabilityFromElement(element: Element): string {
    const text = element.textContent || '';
    
    if (ROMANIAN_ECOMMERCE_PATTERNS.availability.test(text)) {
      const match = text.match(ROMANIAN_ECOMMERCE_PATTERNS.availability);
      return match ? match[0] : 'Verifică disponibilitatea';
    }
    
    if (text.includes('in stock') || text.includes('available')) return 'In Stock';
    if (text.includes('out of stock') || text.includes('sold out')) return 'Out of Stock';
    
    return 'Check Availability';
  }
  
  private static extractUrl(element: Element, targetUrl: string): string {
    const link = element.querySelector('a[href]');
    if (link) {
      const href = link.getAttribute('href') || '';
      return href.startsWith('http') ? href : new URL(href, targetUrl).href;
    }
    return targetUrl;
  }
  
  // Helper methods for product detection
  private static isProductSchema(schema: any): boolean {
    const type = schema['@type'] || schema.type;
    return type && (
      type.includes('Product') ||
      type.includes('Offer') ||
      (schema.name && schema.price)
    );
  }
  
  private static isProductElement(element: Element, language: string): boolean {
    const text = element.textContent || '';
    const hasImage = element.querySelector('img') !== null;
    const hasPrice = /\$|€|£|lei|ron|price|pret/i.test(text);
    const hasProductKeywords = language === 'ro' 
      ? ROMANIAN_ECOMMERCE_PATTERNS.keywords.test(text)
      : CONTENT_TYPE_PATTERNS.product.keywords.test(text);
    
    return (hasImage || hasPrice) && hasProductKeywords;
  }
  
  private static hasProductVisualCues(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const hasReasonableSize = rect.width > 100 && rect.height > 100;
    const hasImage = element.querySelector('img') !== null;
    const hasButton = element.querySelector('button, .btn, .add-to-cart') !== null;
    const hasPrice = element.querySelector('.price, .pret, .cost') !== null;
    
    return hasReasonableSize && (hasImage || hasPrice || hasButton);
  }
  
  private static hasProductTextPatterns(text: string, patterns: any): boolean {
    if (typeof patterns.keywords === 'object' && patterns.keywords.test) {
      return patterns.keywords.test(text);
    }
    return false;
  }
  
  private static isProductUrl(url: string): boolean {
    const productUrlPatterns = [
      /\/product\//i,
      /\/item\//i,
      /\/p\//i,
      /\/produs\//i,
      /\/articol\//i,
      /product_id=/i,
      /item_id=/i
    ];
    
    return productUrlPatterns.some(pattern => pattern.test(url));
  }
  
  private static isProductImage(img: Element): boolean {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    const className = img.className || '';
    
    const productImagePatterns = [
      /product/i,
      /item/i,
      /produs/i,
      /articol/i
    ];
    
    return productImagePatterns.some(pattern => 
      pattern.test(src) || pattern.test(alt) || pattern.test(className)
    );
  }
  
  private static isProductLink(link: Element): boolean {
    const href = link.getAttribute('href') || '';
    const text = link.textContent || '';
    const className = link.className || '';
    
    return this.isProductUrl(href) || 
           /product|item|produs|vezi|view/i.test(text) ||
           /product|item/i.test(className);
  }
  
  private static findProductContainer(element: Element): Element | null {
    let current = element.parentElement;
    
    while (current) {
      const className = current.className || '';
      const hasProductClass = /product|item|listing/i.test(className);
      const hasProductData = current.hasAttribute('data-product') || 
                            current.hasAttribute('itemtype') ||
                            current.hasAttribute('data-id');
      
      if (hasProductClass || hasProductData) {
        return current;
      }
      
      current = current.parentElement;
    }
    
    return null;
  }
  
  private static deduplicateProducts(products: Product[]): Product[] {
    const unique = new Map<string, Product>();
    
    for (const product of products) {
      const key = this.generateProductKey(product);
      const existing = unique.get(key);
      
      if (!existing || (product.confidence_score || 0) > (existing.confidence_score || 0)) {
        unique.set(key, product);
      }
    }
    
    return Array.from(unique.values());
  }
  
  private static generateProductKey(product: Product): string {
    const name = product.name.toLowerCase().replace(/[^\w]/g, '');
    const price = product.price.replace(/[^\d]/g, '');
    return `${name}_${price}`;
  }
  
  private static scoreProducts(products: Product[], doc: Document, targetUrl: string): Product[] {
    return products.map(product => {
      let score = 0;
      
      // Name quality (0-25 points)
      if (product.name) {
        score += Math.min(25, product.name.length / 4);
      }
      
      // Description quality (0-20 points)
      if (product.description) {
        score += Math.min(20, product.description.length / 25);
      }
      
      // Price presence (0-15 points)
      if (product.price) {
        score += 15;
      }
      
      // Image quality (0-15 points)
      score += Math.min(15, product.images.length * 3);
      
      // Specifications (0-10 points)
      score += Math.min(10, Object.keys(product.specifications).length);
      
      // Features (0-10 points)
      score += Math.min(10, product.features.length);
      
      // URL quality (0-5 points)
      if (product.url !== targetUrl) {
        score += 5;
      }
      
      product.quality_score = Math.round(score);
      product.completeness_score = this.calculateCompleteness(product);
      product.reliability_score = this.calculateReliability(product);
      
      return product;
    });
  }
  
  private static calculateCompleteness(product: Product): number {
    let score = 0;
    const fields = [
      'name', 'description', 'price', 'category', 'brand', 'model',
      'sku', 'availability', 'currency'
    ];
    
    for (const field of fields) {
      if (product[field as keyof Product]) score++;
    }
    
    if (product.images.length > 0) score++;
    if (Object.keys(product.specifications).length > 0) score++;
    if (product.features.length > 0) score++;
    
    return Math.round((score / (fields.length + 3)) * 100);
  }
  
  private static calculateReliability(product: Product): number {
    let score = 100;
    
    // Deduct points for missing critical fields
    if (!product.name) score -= 30;
    if (!product.price && !product.description) score -= 20;
    if (product.images.length === 0) score -= 15;
    if (!product.category) score -= 10;
    
    // Deduct points for suspicious data
    if (product.name.length < 3) score -= 20;
    if (product.description && product.description.length < 10) score -= 10;
    
    return Math.max(0, score);
  }
  
  // Additional extraction methods
  private static extractPrice(offers: any): string {
    if (!offers) return '';
    
    if (Array.isArray(offers)) {
      for (const offer of offers) {
        if (offer.price) return offer.price.toString();
        if (offer.priceSpecification?.price) return offer.priceSpecification.price.toString();
      }
    } else if (offers.price) {
      return offers.price.toString();
    }
    
    return '';
  }
  
  private static extractImages(images: any, targetUrl: string): Array<any> {
    if (!images) return [];
    
    const imageArray = Array.isArray(images) ? images : [images];
    
    return imageArray.map((img, index) => ({
      src: typeof img === 'string' ? img : img.url || img.contentUrl,
      alt: img.alternateName || img.caption || '',
      title: img.name || '',
      type: index === 0 ? 'main' : 'gallery'
    })).filter(img => img.src);
  }
  
  private static extractSpecifications(schema: any): Record<string, string> {
    const specs: Record<string, string> = {};
    
    if (schema.additionalProperty) {
      const props = Array.isArray(schema.additionalProperty) ? schema.additionalProperty : [schema.additionalProperty];
      for (const prop of props) {
        if (prop.name && prop.value) {
          specs[prop.name] = prop.value.toString();
        }
      }
    }
    
    // Extract other common specification fields
    const specFields = ['weight', 'height', 'width', 'depth', 'material', 'color', 'size'];
    for (const field of specFields) {
      if (schema[field]) {
        specs[field] = schema[field].toString();
      }
    }
    
    return specs;
  }
  
  private static extractFeatures(schema: any): string[] {
    const features: string[] = [];
    
    if (schema.hasFeature || schema.features) {
      const featureArray = Array.isArray(schema.hasFeature || schema.features) 
        ? (schema.hasFeature || schema.features) 
        : [schema.hasFeature || schema.features];
      
      for (const feature of featureArray) {
        const featureText = typeof feature === 'string' ? feature : feature.name || feature.description;
        if (featureText) {
          features.push(featureText);
        }
      }
    }
    
    return features;
  }
  
  private static extractAvailability(offers: any): string {
    if (!offers) return 'Check Availability';
    
    const offerArray = Array.isArray(offers) ? offers : [offers];
    
    for (const offer of offerArray) {
      if (offer.availability) {
        const availability = offer.availability.toLowerCase();
        if (availability.includes('instock')) return 'In Stock';
        if (availability.includes('outofstock')) return 'Out of Stock';
        if (availability.includes('preorder')) return 'Pre-order';
        if (availability.includes('limitedavailability')) return 'Limited Stock';
      }
    }
    
    return 'Check Availability';
  }
  
  private static extractReviews(schema: any): any {
    const reviews: any = {
      count: 0,
      averageRating: 0
    };
    
    if (schema.aggregateRating) {
      reviews.averageRating = parseFloat(schema.aggregateRating.ratingValue) || 0;
      reviews.count = parseInt(schema.aggregateRating.reviewCount) || 0;
      
      if (schema.aggregateRating.ratingCount) {
        reviews.count = parseInt(schema.aggregateRating.ratingCount);
      }
    }
    
    if (schema.review) {
      const reviewArray = Array.isArray(schema.review) ? schema.review : [schema.review];
      reviews.topReviews = reviewArray.slice(0, 5).map((review: any) => ({
        author: review.author?.name || 'Anonymous',
        rating: parseFloat(review.reviewRating?.ratingValue) || 0,
        title: review.name || '',
        content: review.reviewBody || review.description || '',
        date: review.datePublished || '',
        verified: review.verified || false
      }));
    }
    
    return reviews;
  }
  
  private static extractBrand(element: Element): string {
    const brandSelectors = [
      '.brand, .marca, .manufacturer',
      '[class*="brand"], [class*="marca"]',
      '[itemprop="brand"]'
    ];
    
    for (const selector of brandSelectors) {
      const brandElement = element.querySelector(selector);
      if (brandElement?.textContent?.trim()) {
        return brandElement.textContent.trim();
      }
    }
    
    return '';
  }
  
  private static extractModel(element: Element): string {
    const modelSelectors = [
      '.model, .modelul',
      '[class*="model"]',
      '[itemprop="model"]'
    ];
    
    for (const selector of modelSelectors) {
      const modelElement = element.querySelector(selector);
      if (modelElement?.textContent?.trim()) {
        return modelElement.textContent.trim();
      }
    }
    
    return '';
  }
  
  private static extractSku(element: Element): string {
    const skuSelectors = [
      '.sku, .cod, .code',
      '[class*="sku"], [class*="cod"]',
      '[itemprop="sku"]'
    ];
    
    for (const selector of skuSelectors) {
      const skuElement = element.querySelector(selector);
      if (skuElement?.textContent?.trim()) {
        return skuElement.textContent.trim();
      }
    }
    
    return '';
  }
  
  private static extractColors(element: Element): Array<any> {
    const colors: Array<any> = [];
    const colorElements = element.querySelectorAll('.color, .culoare, [class*="color"]');
    
    colorElements.forEach(colorElement => {
      const name = colorElement.textContent?.trim() || '';
      const style = colorElement.getAttribute('style') || '';
      const bgMatch = style.match(/background-color:\s*([^;]+)/);
      
      if (name) {
        colors.push({
          name,
          available: true,
          hex: bgMatch ? bgMatch[1] : undefined
        });
      }
    });
    
    return colors;
  }
  
  private static extractSizes(element: Element): Array<any> {
    const sizes: Array<any> = [];
    const sizeElements = element.querySelectorAll('.size, .marime, [class*="size"]');
    
    sizeElements.forEach(sizeElement => {
      const name = sizeElement.textContent?.trim() || '';
      if (name) {
        sizes.push({
          name,
          available: !sizeElement.classList.contains('disabled'),
          stock: undefined
        });
      }
    });
    
    return sizes;
  }
  
  private static extractDimensions(element: Element): any {
    const dimensions: any = {};
    const text = element.textContent || '';
    
    // Try to extract dimensions from text
    const dimensionPatterns = {
      length: /lungime[:\s]*([0-9.,]+)\s*(cm|mm|m)/gi,
      width: /lățime[:\s]*([0-9.,]+)\s*(cm|mm|m)/gi,
      height: /înălțime[:\s]*([0-9.,]+)\s*(cm|mm|m)/gi,
      weight: /greutate[:\s]*([0-9.,]+)\s*(g|kg)/gi
    };
    
    for (const [key, pattern] of Object.entries(dimensionPatterns)) {
      const match = text.match(pattern);
      if (match) {
        dimensions[key] = match[0];
      }
    }
    
    return Object.keys(dimensions).length > 0 ? dimensions : undefined;
  }
  
  private static extractMaterials(element: Element): string[] {
    const materials: string[] = [];
    const text = element.textContent || '';
    
    const materialPatterns = [
      /\b(oțel|aluminiu|plastic|lemn|sticlă|ceramică|metal|cauciuc|textil|piele|bumbac|mătase|lână)\b/gi
    ];
    
    for (const pattern of materialPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        materials.push(...matches.map(m => m.toLowerCase()));
      }
    }
    
    return [...new Set(materials)]; // Remove duplicates
  }
  
  private static extractReviewsFromElement(element: Element): any {
    const reviews: any = {
      count: 0,
      averageRating: 0
    };
    
    // Try to extract rating
    const ratingElement = element.querySelector('.rating, .review, .star');
    if (ratingElement) {
      const ratingText = ratingElement.textContent || '';
      const ratingMatch = ratingText.match(/([0-9.]+)/);
      if (ratingMatch) {
        reviews.averageRating = parseFloat(ratingMatch[1]);
      }
    }
    
    // Try to extract review count
    const reviewCountElement = element.querySelector('.review-count, .reviews');
    if (reviewCountElement) {
      const countText = reviewCountElement.textContent || '';
      const countMatch = countText.match(/(\d+)/);
      if (countMatch) {
        reviews.count = parseInt(countMatch[1]);
      }
    }
    
    return (reviews.count > 0 || reviews.averageRating > 0) ? reviews : undefined;
  }
  
  private static extractPromotions(element: Element): Array<any> {
    const promotions: Array<any> = [];
    const text = element.textContent || '';
    
    // Look for promotion keywords
    const promotionPatterns = [
      { type: 'discount', pattern: /reducere[:\s]*([0-9]+)%/gi },
      { type: 'free_shipping', pattern: /transport\s+gratuit/gi },
      { type: 'sale', pattern: /ofertă|promoție|reducere/gi }
    ];
    
    for (const { type, pattern } of promotionPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        promotions.push({
          type,
          description: matches[0],
          validUntil: undefined
        });
      }
    }
    
    return promotions;
  }
  
  private static extractDeliveryInfo(element: Element): any {
    const text = element.textContent || '';
    const deliveryInfo: any = {};
    
    if (/transport\s+gratuit|livrare\s+gratuită/gi.test(text)) {
      deliveryInfo.freeShipping = true;
    }
    
    if (/livrare\s+rapidă|express/gi.test(text)) {
      deliveryInfo.express = true;
    }
    
    const deliveryTimeMatch = text.match(/livrare\s+în\s+([0-9-]+)\s*zile?/gi);
    if (deliveryTimeMatch) {
      deliveryInfo.deliveryTime = deliveryTimeMatch[0];
    }
    
    return Object.keys(deliveryInfo).length > 0 ? deliveryInfo : undefined;
  }
}

// Advanced article detection class
class ArticleDetector {
  static detectArticles(doc: Document, targetUrl: string): Article[] {
    const articles: Article[] = [];
    const articleElements = doc.querySelectorAll('article, .article, .post, .blog-post, .news-item, [itemtype*="Article"]');
    
    articleElements.forEach((element, index) => {
      const article: Article = {
        id: `article_${Date.now()}_${index}`,
        title: this.extractArticleTitle(element),
        content: this.extractArticleContent(element),
        author: this.extractAuthor(element),
        publishDate: this.extractPublishDate(element),
        category: this.extractArticleCategory(element),
        tags: this.extractTags(element),
        url: targetUrl,
        source: 'article_extraction',
        scraped_at: new Date().toISOString(),
        confidence_score: 0.8
      };
      
      if (article.title && article.content) {
        articles.push(article);
      }
    });
    
    return articles;
  }
  
  private static extractArticleTitle(element: Element): string {
    const titleSelectors = ['h1', 'h2', '.title', '.headline', '[itemprop="headline"]'];
    
    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement?.textContent?.trim()) {
        return titleElement.textContent.trim();
      }
    }
    
    return '';
  }
  
  private static extractArticleContent(element: Element): string {
    const contentSelectors = ['.content', '.article-content', '.post-content', '[itemprop="articleBody"]'];
    
    for (const selector of contentSelectors) {
      const contentElement = element.querySelector(selector);
      if (contentElement?.textContent?.trim()) {
        return contentElement.textContent.trim();
      }
    }
    
    return element.textContent?.trim() || '';
  }
  
  private static extractAuthor(element: Element): string {
    const authorSelectors = ['.author', '.byline', '[itemprop="author"]', '[rel="author"]'];
    
    for (const selector of authorSelectors) {
      const authorElement = element.querySelector(selector);
      if (authorElement?.textContent?.trim()) {
        return authorElement.textContent.trim();
      }
    }
    
    return '';
  }
  
  private static extractPublishDate(element: Element): string {
    const dateSelectors = ['time', '.date', '.published', '[itemprop="datePublished"]'];
    
    for (const selector of dateSelectors) {
      const dateElement = element.querySelector(selector);
      if (dateElement) {
        const datetime = dateElement.getAttribute('datetime');
        if (datetime) return datetime;
        
        const text = dateElement.textContent?.trim();
        if (text) return text;
      }
    }
    
    return '';
  }
  
  private static extractArticleCategory(element: Element): string {
    const categorySelectors = ['.category', '.section', '[itemprop="articleSection"]'];
    
    for (const selector of categorySelectors) {
      const categoryElement = element.querySelector(selector);
      if (categoryElement?.textContent?.trim()) {
        return categoryElement.textContent.trim();
      }
    }
    
    return '';
  }
  
  private static extractTags(element: Element): string[] {
    const tags: string[] = [];
    const tagElements = element.querySelectorAll('.tag, .tags a, [rel="tag"]');
    
    tagElements.forEach(tagElement => {
      const tag = tagElement.textContent?.trim();
      if (tag) {
        tags.push(tag);
      }
    });
    
    return tags;
  }
}

// Main scraping function with comprehensive capabilities
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const requestData: ScrapingRequest = await req.json();
    
    console.log('🚀 Advanced scraping started for:', requestData.url);
    
    if (!requestData.url) {
      throw new Error('URL este obligatoriu');
    }

    const config = { ...DEFAULT_CONFIG, ...requestData.config };
    const userAgent = config.userAgents[Math.floor(Math.random() * config.userAgents.length)];
    
    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8,fr;q=0.7,de;q=0.6',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'Connection': 'keep-alive'
    };

    const response = await fetch(requestData.url, {
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

    console.log(`📄 HTML content retrieved: ${htmlContent.length} characters`);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html') as HTMLDocument;

    // Extract basic metadata
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const language = TextProcessor.detectLanguage(doc.body?.textContent || '');

    // Advanced content detection
    const products = ProductDetector.detectProducts(doc, requestData.url, config);
    const articles = ArticleDetector.detectArticles(doc, requestData.url);
    
    // Extract structured data
    const structuredData = SchemaExtractor.extractStructuredData(doc);
    
    // Extract SEO data
    const seoData: SEOData = {
      title,
      metaDescription: description,
      metaKeywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      canonicalUrl: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      robots: doc.querySelector('meta[name="robots"]')?.getAttribute('content'),
      language,
      headings: Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: parseInt(h.tagName.replace('H', '')),
        text: h.textContent?.trim() || ''
      })),
      internalLinks: Array.from(doc.querySelectorAll('a[href]')).filter(a => {
        const href = a.getAttribute('href') || '';
        return href.startsWith('/') || href.includes(new URL(requestData.url).hostname);
      }).length,
      externalLinks: Array.from(doc.querySelectorAll('a[href]')).filter(a => {
        const href = a.getAttribute('href') || '';
        return href.startsWith('http') && !href.includes(new URL(requestData.url).hostname);
      }).length,
      wordCount: (doc.body?.textContent || '').split(/\s+/).length,
      structuredData
    };

    // Performance metrics
    const performanceMetrics: PerformanceMetrics = {
      requestStartTime: startTime,
      responseTime: Date.now() - startTime,
      downloadTime: Date.now() - startTime,
      processingTime: Date.now() - startTime,
      totalTime: Date.now() - startTime,
      contentSize: htmlContent.length,
      imageCount: doc.querySelectorAll('img').length,
      linkCount: doc.querySelectorAll('a').length,
      scriptCount: doc.querySelectorAll('script').length,
      styleSheetCount: doc.querySelectorAll('link[rel="stylesheet"]').length,
      httpRequests: 1,
      errorCount: 0,
      warningCount: 0,
      retryCount: 0,
      successRate: 100
    };

    const result = {
      url: requestData.url,
      title,
      description,
      keywords,
      language,
      text: doc.body?.textContent?.substring(0, 10000) || '',
      links: Array.from(doc.querySelectorAll('a')).map(link => ({
        url: link.href || link.getAttribute('href') || '',
        text: link.textContent?.trim() || '',
        type: link.getAttribute('rel') || 'link'
      })),
      images: Array.from(doc.querySelectorAll('img')).map(img => ({
        src: img.src || img.getAttribute('src') || '',
        alt: img.alt || '',
        title: img.title || '',
        width: img.naturalWidth || undefined,
        height: img.naturalHeight || undefined
      })),
      metadata: Array.from(doc.querySelectorAll('meta')).reduce((acc: Record<string, string>, meta) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          acc[name] = content;
        }
        return acc;
      }, {}),
      headings: seoData.headings,
      products,
      articles,
      structuredData,
      seoData,
      performanceMetrics,
      platform: PlatformDetector.detectPlatform(doc, requestData.url),
      contentQuality: {
        readabilityScore: TextProcessor.calculateReadability(doc.body?.textContent || ''),
        keywords: TextProcessor.extractKeywords(doc.body?.textContent || ''),
        summary: TextProcessor.summarizeText(doc.body?.textContent || '')
      },
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      success: true
    };

    console.log(`✅ Scraping completed successfully in ${Date.now() - startTime}ms`);
    console.log(`📊 Results: ${products.length} products, ${articles.length} articles`);

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Eroare la procesarea cererii',
        details: error.toString(),
        timestamp: new Date().toISOString(),
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});