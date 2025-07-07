// Utilitare pentru optimizarea datelor pentru înțelegerea de către agent

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  currency?: string;
  category: string;
  brand?: string;
  specifications: Record<string, string>;
  features: string[];
  availability: string;
  images: Array<{ src: string; alt: string; title: string; type: string }>;
  url: string;
  condition?: string;
  warranty?: string;
  shipping?: string;
  [key: string]: any;
}

// Generează o descriere optimizată pentru înțelegerea de către agent
export const generateAgentOptimizedDescription = (product: Product): string => {
  const sections: string[] = [];
  
  // Informații de bază
  if (product.name) {
    sections.push(`PRODUS: ${product.name}`);
  }
  
  // Preț și oferte
  if (product.price) {
    let priceInfo = `PREȚ: ${product.price}`;
    if (product.currency) priceInfo += ` ${product.currency}`;
    if (product.originalPrice) {
      priceInfo += ` (redus de la ${product.originalPrice})`;
      if (product.discountPercentage) {
        priceInfo += ` - REDUCERE ${product.discountPercentage}`;
      }
    }
    sections.push(priceInfo);
  }
  
  // Categorie și brand
  if (product.category || product.brand) {
    let categoryInfo = 'CLASIFICARE: ';
    if (product.brand) categoryInfo += `Brand: ${product.brand}`;
    if (product.category && product.brand) categoryInfo += ` | `;
    if (product.category) categoryInfo += `Categorie: ${product.category}`;
    sections.push(categoryInfo);
  }
  
  // Disponibilitate
  if (product.availability) {
    sections.push(`DISPONIBILITATE: ${product.availability}`);
  }
  
  // Descrierea principală
  if (product.description) {
    sections.push(`DESCRIERE: ${product.description}`);
  }
  
  // Specificații tehnice (cele mai importante)
  if (Object.keys(product.specifications).length > 0) {
    const importantSpecs = Object.entries(product.specifications)
      .filter(([key]) => {
        const lowerKey = key.toLowerCase();
        return lowerKey.includes('model') || 
               lowerKey.includes('dimensi') || 
               lowerKey.includes('culoare') || 
               lowerKey.includes('material') || 
               lowerKey.includes('capacitate') || 
               lowerKey.includes('dimensiune') ||
               lowerKey.includes('greutate') ||
               lowerKey.includes('putere') ||
               lowerKey.includes('consum');
      })
      .slice(0, 8); // Maxim 8 specificații importante
      
    if (importantSpecs.length > 0) {
      const specsText = importantSpecs
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
      sections.push(`SPECIFICAȚII CHEIE: ${specsText}`);
    }
  }
  
  // Caracteristici principale
  if (product.features && product.features.length > 0) {
    const topFeatures = product.features.slice(0, 5).join(', ');
    sections.push(`CARACTERISTICI: ${topFeatures}`);
  }
  
  // Informații despre condiție și garanție
  const additionalInfo: string[] = [];
  if (product.condition) additionalInfo.push(`Stare: ${product.condition}`);
  if (product.warranty) additionalInfo.push(`Garanție: ${product.warranty}`);
  if (product.shipping) additionalInfo.push(`Livrare: ${product.shipping}`);
  
  if (additionalInfo.length > 0) {
    sections.push(`INFO SUPLIMENTARE: ${additionalInfo.join(' | ')}`);
  }
  
  // Imagini disponibile
  if (product.images && product.images.length > 0) {
    sections.push(`IMAGINI: ${product.images.length} imagini disponibile`);
  }
  
  // Link către produs
  if (product.url) {
    sections.push(`LINK: ${product.url}`);
  }
  
  return sections.join('\n\n');
};

// Generează etichete pentru categorisirea rapidă de către agent
export const generateAgentTags = (product: Product): string[] => {
  const tags: string[] = [];
  
  // Tag-uri pe baza prețului
  if (product.price) {
    const priceNum = parseFloat(product.price.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(priceNum)) {
      if (priceNum < 100) tags.push('buget-mic');
      else if (priceNum < 500) tags.push('preț-mediu');
      else if (priceNum < 1000) tags.push('preț-ridicat');
      else tags.push('premium');
    }
  }
  
  // Tag-uri pe baza disponibilității
  if (product.availability) {
    const avail = product.availability.toLowerCase();
    if (avail.includes('stoc') || avail.includes('disponibil')) tags.push('în-stoc');
    else if (avail.includes('epuizat') || avail.includes('indisponibil')) tags.push('epuizat');
    else if (avail.includes('comandă') || avail.includes('precomandă')) tags.push('pre-comandă');
  }
  
  // Tag-uri pe baza reducerii
  if (product.originalPrice && product.price) {
    tags.push('în-ofertă');
  }
  
  // Tag-uri pe baza categoriei
  if (product.category) {
    const category = product.category.toLowerCase();
    if (category.includes('auto') || category.includes('mașin')) tags.push('auto');
    else if (category.includes('electr') || category.includes('tech')) tags.push('electronice');
    else if (category.includes('îmbrăc') || category.includes('fashion')) tags.push('fashion');
    else if (category.includes('casă') || category.includes('home')) tags.push('casă-grădină');
    else if (category.includes('sport')) tags.push('sport');
  }
  
  // Tag-uri pe baza brandului
  if (product.brand) {
    tags.push(`brand-${product.brand.toLowerCase().replace(/\s+/g, '-')}`);
  }
  
  // Tag-uri pe baza stării
  if (product.condition) {
    const condition = product.condition.toLowerCase();
    if (condition.includes('nou')) tags.push('produs-nou');
    else if (condition.includes('folosit') || condition.includes('second')) tags.push('second-hand');
    else if (condition.includes('recondiționat')) tags.push('recondiționat');
  }
  
  // Tag pentru produse cu specificații complete
  if (Object.keys(product.specifications).length > 5) {
    tags.push('specificații-complete');
  }
  
  // Tag pentru produse cu multe imagini
  if (product.images && product.images.length > 3) {
    tags.push('imagini-multiple');
  }
  
  return tags;
};

// Calculează un scor de completitudine a informațiilor (0-5)
export const calculateCompletenessScore = (product: Product): number => {
  let score = 0;
  const maxScore = 5;
  
  // Informații de bază (1 punct)
  if (product.name && product.name.length > 5) score += 0.2;
  if (product.price) score += 0.2;
  if (product.category) score += 0.2;
  if (product.availability) score += 0.2;
  if (product.url) score += 0.2;
  
  // Descriere (1 punct)
  if (product.description) {
    if (product.description.length > 200) score += 1;
    else if (product.description.length > 100) score += 0.7;
    else if (product.description.length > 50) score += 0.5;
    else if (product.description.length > 20) score += 0.3;
  }
  
  // Specificații tehnice (1 punct)
  const specsCount = Object.keys(product.specifications).length;
  if (specsCount > 10) score += 1;
  else if (specsCount > 5) score += 0.7;
  else if (specsCount > 2) score += 0.5;
  else if (specsCount > 0) score += 0.3;
  
  // Imagini (1 punct)
  if (product.images && product.images.length > 0) {
    if (product.images.length > 5) score += 1;
    else if (product.images.length > 3) score += 0.8;
    else if (product.images.length > 1) score += 0.6;
    else score += 0.4;
  }
  
  // Informații adiționale (1 punct)
  let additionalInfoCount = 0;
  if (product.brand) additionalInfoCount++;
  if (product.condition) additionalInfoCount++;
  if (product.warranty) additionalInfoCount++;
  if (product.shipping) additionalInfoCount++;
  if (product.features && product.features.length > 0) additionalInfoCount++;
  if (product.originalPrice) additionalInfoCount++;
  
  if (additionalInfoCount >= 4) score += 1;
  else if (additionalInfoCount >= 3) score += 0.8;
  else if (additionalInfoCount >= 2) score += 0.6;
  else if (additionalInfoCount >= 1) score += 0.4;
  
  return Math.round(Math.min(score, maxScore) * 100) / 100;
};

// Exportă datele în format optimizat pentru agent
export const exportForAgent = (products: Product[]): string => {
  const summary = {
    totalProducts: products.length,
    averageCompleteness: products.reduce((acc, p) => acc + calculateCompletenessScore(p), 0) / products.length,
    withDescriptions: products.filter(p => p.description && p.description.length > 50).length,
    withSpecifications: products.filter(p => Object.keys(p.specifications).length > 0).length,
    withImages: products.filter(p => p.images && p.images.length > 0).length,
    categories: [...new Set(products.map(p => p.category))].filter(Boolean),
    brands: [...new Set(products.map(p => p.brand))].filter(Boolean),
    priceRange: {
      min: Math.min(...products.map(p => parseFloat(p.price?.replace(/[^\d.,]/g, '').replace(',', '.') || '0')).filter(n => !isNaN(n))),
      max: Math.max(...products.map(p => parseFloat(p.price?.replace(/[^\d.,]/g, '').replace(',', '.') || '0')).filter(n => !isNaN(n)))
    }
  };
  
  return `REZUMAT SCANARE PRODUSE:
Total produse: ${summary.totalProducts}
Scor mediu completitudine: ${summary.averageCompleteness.toFixed(2)}/5.0
Cu descrieri detaliate: ${summary.withDescriptions}
Cu specificații: ${summary.withSpecifications}
Cu imagini: ${summary.withImages}
Categorii identificate: ${summary.categories.join(', ')}
Branduri identificate: ${summary.brands.join(', ')}
Interval preț: ${summary.priceRange.min} - ${summary.priceRange.max}

PRODUSE OPTIMIZATE PENTRU AGENT:
${products.map((product, index) => 
  `\n--- PRODUS ${index + 1} ---\n${generateAgentOptimizedDescription(product)}\nTAG-URI: ${generateAgentTags(product).join(', ')}\nSCOR COMPLETITUDINE: ${calculateCompletenessScore(product)}/5.0`
).join('\n')}`;
};