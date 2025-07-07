
// Utilitare pentru optimizarea exportului și limitarea dimensiunii fișierelor

// Limitarea dimensiunii fișierului la 21MB (în bytes)
const MAX_FILE_SIZE = 21 * 1024 * 1024; // 21MB în bytes

interface OptimizedProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  brand?: string;
  availability: string;
  images: Array<{ src: string; alt: string }>;
  specifications: Record<string, string>;
  url: string;
  completenessScore?: number;
}

// Calculează dimensiunea estimată a unui obiect în bytes
const calculateObjectSize = (obj: any): number => {
  return new Blob([JSON.stringify(obj)]).size;
};

// Optimizează produsele pentru a încăpea în limita de dimensiune
export const optimizeProductsForExport = (products: any[]): OptimizedProduct[] => {
  let optimizedProducts: OptimizedProduct[] = [];
  let currentSize = 0;
  
  for (const product of products) {
    // Creează versiunea optimizată a produsului
    const optimizedProduct: OptimizedProduct = {
      id: product.id || `prod_${Date.now()}_${Math.random()}`,
      name: product.name || 'Produs fără nume',
      description: product.description ? 
        (product.description.length > 1000 ? 
          product.description.substring(0, 1000) + '...' : 
          product.description) : '',
      price: product.price || '',
      category: product.category || 'Necategorizat',
      brand: product.brand || undefined,
      availability: product.availability || 'Informații indisponibile',
      images: product.images ? 
        product.images.slice(0, 5).map((img: any) => ({
          src: img.src || '',
          alt: img.alt || ''
        })) : [],
      specifications: product.specifications ? 
        Object.fromEntries(
          Object.entries(product.specifications).slice(0, 10)
        ) : {},
      url: product.url || '',
      completenessScore: product.completenessScore || undefined
    };
    
    const productSize = calculateObjectSize(optimizedProduct);
    
    // Verifică dacă adăugarea acestui produs depășește limita
    if (currentSize + productSize > MAX_FILE_SIZE) {
      console.warn(`Limita de 21MB atinsă. Exportând ${optimizedProducts.length} produse din ${products.length}`);
      break;
    }
    
    optimizedProducts.push(optimizedProduct);
    currentSize += productSize;
  }
  
  return optimizedProducts;
};

// Creează un export optimizat în format JSON
export const createOptimizedJSONExport = (data: any) => {
  const optimizedData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      totalOriginalProducts: data.products?.length || 0,
      exportedProducts: 0,
      url: data.url || '',
      title: data.title || '',
      sizeOptimized: true,
      maxSizeMB: 21
    },
    products: []
  };
  
  if (data.products && data.products.length > 0) {
    optimizedData.products = optimizeProductsForExport(data.products);
    optimizedData.metadata.exportedProducts = optimizedData.products.length;
  }
  
  const finalSize = calculateObjectSize(optimizedData);
  console.log(`Dimensiune finală export: ${(finalSize / (1024 * 1024)).toFixed(2)} MB`);
  
  return optimizedData;
};

// Creează un export optimizat în format CSV
export const createOptimizedCSVExport = (products: any[]): string => {
  const optimizedProducts = optimizeProductsForExport(products);
  
  let csvContent = `ID,Nume,Preț,Categorie,Brand,Disponibilitate,Descriere (Scurtă),URL,Scor Completitudine\n`;
  
  for (const product of optimizedProducts) {
    const description = product.description.replace(/"/g, '""').replace(/\n/g, ' ');
    const row = [
      product.id,
      `"${product.name.replace(/"/g, '""')}"`,
      `"${product.price}"`,
      `"${product.category}"`,
      `"${product.brand || ''}"`,
      `"${product.availability}"`,
      `"${description.substring(0, 200)}${description.length > 200 ? '...' : ''}"`,
      `"${product.url}"`,
      product.completenessScore || ''
    ].join(',');
    
    csvContent += row + '\n';
    
    // Verifică dimensiunea
    if (new Blob([csvContent]).size > MAX_FILE_SIZE) {
      console.warn('CSV prea mare, se oprește exportul');
      break;
    }
  }
  
  return csvContent;
};

// Creează un export optimizat în format HTML
export const createOptimizedHTMLExport = (data: any): string => {
  const optimizedProducts = data.products ? optimizeProductsForExport(data.products) : [];
  
  const htmlContent = `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Date Extrase - ${data.title || 'Export'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .product { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 8px; }
        .product h3 { color: #333; margin-top: 0; }
        .price { font-weight: bold; color: #e74c3c; font-size: 1.2em; }
        .meta { color: #666; font-size: 0.9em; margin: 5px 0; }
        .description { margin: 10px 0; background: #f9f9f9; padding: 10px; border-radius: 4px; }
        .specs { background: #fff; border: 1px solid #eee; padding: 10px; margin: 10px 0; }
        .export-info { background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Date Extrase din: ${data.url || 'Website'}</h1>
        <p><strong>Titlu:</strong> ${data.title || 'N/A'}</p>
        <p><strong>Data extragerii:</strong> ${new Date().toLocaleString('ro-RO')}</p>
    </div>
    
    <div class="export-info">
        <h3>📊 Informații Export</h3>
        <p><strong>Total produse exportate:</strong> ${optimizedProducts.length}</p>
        <p><strong>Export optimizat:</strong> Da (max 21MB)</p>
        <p><strong>Produse cu descrieri:</strong> ${optimizedProducts.filter(p => p.description).length}</p>
    </div>
    
    <h2>🛍️ Produse Găsite (${optimizedProducts.length})</h2>
    ${optimizedProducts.map((product, index) => `
        <div class="product">
            <h3>${index + 1}. ${product.name}</h3>
            
            ${product.price ? `<div class="price">💰 Preț: ${product.price}</div>` : ''}
            
            <div class="meta">
                <strong>Categorie:</strong> ${product.category} | 
                <strong>Disponibilitate:</strong> ${product.availability}
                ${product.brand ? ` | <strong>Brand:</strong> ${product.brand}` : ''}
                ${product.completenessScore ? ` | <strong>Scor:</strong> ${product.completenessScore}/5.0` : ''}
            </div>
            
            ${product.description ? `<div class="description"><strong>Descriere:</strong><br>${product.description}</div>` : ''}
            
            ${Object.keys(product.specifications).length > 0 ? `
                <div class="specs">
                    <strong>Specificații:</strong><br>
                    ${Object.entries(product.specifications).map(([key, value]) => 
                        `<strong>${key}:</strong> ${value}`
                    ).join('<br>')}
                </div>
            ` : ''}
            
            ${product.images.length > 0 ? `<div class="meta">📸 Imagini: ${product.images.length}</div>` : ''}
            
            ${product.url ? `<div class="meta">🔗 <a href="${product.url}" target="_blank">Vezi produsul</a></div>` : ''}
        </div>
    `).join('')}
    
    <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 8px; text-align: center;">
        <p><em>Export generat automat cu limitare la 21MB</em></p>
        <p><small>Dacă lipsesc produse, acestea au fost omise pentru a respecta limita de dimensiune</small></p>
    </div>
</body>
</html>`;

  return htmlContent;
};

// Funcție pentru descărcarea fișierului cu verificare de dimensiune
export const downloadOptimizedFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const sizeMB = blob.size / (1024 * 1024);
  
  console.log(`Dimensiune fișier: ${sizeMB.toFixed(2)} MB`);
  
  if (sizeMB > 21) {
    console.warn('Fișierul depășește 21MB, dar va fi descărcat oricum');
  }
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return sizeMB;
};
