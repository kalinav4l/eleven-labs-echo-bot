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
import { Globe, Search, Package, Image, FileText, Link2, Code, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

// Funcție pentru generarea raportului structurat
const generateStructuredReport = (data: ScrapedData): string => {
  let report = `# 📊 RAPORT COMPLET DE SCRAPING WEB\n\n`;
  
  // Informații generale
  report += `## 🌐 INFORMAȚII GENERALE\n`;
  report += `**Titlu:** ${data.title}\n`;
  report += `**Descriere:** ${data.description}\n\n`;

  // Statistici generale
  report += `## 📈 STATISTICI GENERALE\n`;
  report += `- **Produse găsite:** ${data.products.length}\n`;
  report += `- **Link-uri totale:** ${data.links.length}\n`;
  report += `- **Imagini găsite:** ${data.images.length}\n`;
  report += `- **Secțiuni/Titluri:** ${data.headings.length}\n`;
  report += `- **Tabele găsite:** ${data.tables.length}\n`;
  report += `- **Liste găsite:** ${data.lists.length}\n\n`;

  // Produse găsite
  if (data.products.length > 0) {
    report += `## 🛍️ PRODUSE GĂSITE (${data.products.length})\n\n`;
    data.products.slice(0, 10).forEach((product, index) => {
      report += `### ${index + 1}. ${product.name}\n`;
      report += `- **Preț:** ${product.price}`;
      if (product.originalPrice) {
        report += ` (reducere de la ${product.originalPrice})`;
      }
      report += `\n`;
      report += `- **Descriere:** ${product.description.substring(0, 200)}...\n`;
      report += `- **Categorie:** ${product.category}\n`;
      if (product.brand) report += `- **Brand:** ${product.brand}\n`;
      report += `- **Disponibilitate:** ${product.availability}\n`;
      report += `- **Link:** ${product.url}\n`;
      if (product.images.length > 0) {
        report += `- **Imagini:** ${product.images.length} găsite\n`;
      }
      report += `\n`;
    });
    
    if (data.products.length > 10) {
      report += `*... și încă ${data.products.length - 10} produse*\n\n`;
    }
  }

  // Informații de contact
  if (data.contactInfo.emails.length > 0 || data.contactInfo.phones.length > 0) {
    report += `## 📞 INFORMAȚII DE CONTACT\n`;
    if (data.contactInfo.emails.length > 0) {
      report += `**Email-uri găsite:** ${data.contactInfo.emails.join(', ')}\n`;
    }
    if (data.contactInfo.phones.length > 0) {
      report += `**Telefoane găsite:** ${data.contactInfo.phones.join(', ')}\n`;
    }
    report += `\n`;
  }

  // Link-uri sociale
  if (data.socialLinks.length > 0) {
    report += `## 🔗 LINK-URI SOCIALE\n`;
    data.socialLinks.forEach(social => {
      report += `- **${social.platform}:** ${social.url}\n`;
    });
    report += `\n`;
  }

  // Tehnologii detectate
  const allTech = [...data.technologies.cms, ...data.technologies.frameworks, ...data.technologies.analytics, ...data.technologies.advertising];
  if (allTech.length > 0) {
    report += `## 🔧 TEHNOLOGII DETECTATE\n`;
    if (data.technologies.cms.length > 0) {
      report += `**CMS:** ${data.technologies.cms.join(', ')}\n`;
    }
    if (data.technologies.frameworks.length > 0) {
      report += `**Framework-uri:** ${data.technologies.frameworks.join(', ')}\n`;
    }
    if (data.technologies.analytics.length > 0) {
      report += `**Analytics:** ${data.technologies.analytics.join(', ')}\n`;
    }
    if (data.technologies.advertising.length > 0) {
      report += `**Advertising:** ${data.technologies.advertising.join(', ')}\n`;
    }
    report += `\n`;
  }

  // Structura conținutului
  if (data.headings.length > 0) {
    report += `## 📋 STRUCTURA CONȚINUTULUI\n`;
    const headingsByLevel = data.headings.reduce((acc, heading) => {
      if (!acc[heading.level]) acc[heading.level] = [];
      acc[heading.level].push(heading.text);
      return acc;
    }, {} as Record<number, string[]>);
    
    Object.entries(headingsByLevel).forEach(([level, headings]) => {
      report += `**H${level} (${headings.length}):** ${headings.slice(0, 5).join(', ')}`;
      if (headings.length > 5) {
        report += ` și încă ${headings.length - 5}...`;
      }
      report += `\n`;
    });
    report += `\n`;
  }

  report += `---\n**Raport generat automat de Web Scraper Universal**\n`;
  report += `**Total informații extrase:** ${data.products.length} produse, ${data.links.length} link-uri, ${data.images.length} imagini, ${data.tables.length} tabele, ${data.lists.length} liste\n`;

  return report;
};

const Scraping = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');
  const [structuredReport, setStructuredReport] = useState('');

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast({
        title: "URL necesar",
        description: "Te rog introdu un URL valid pentru a începe scraping-ul",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError('');
    setScrapedData(null);
    setStructuredReport('');

    try {
      console.log('🚀 Începem scraping-ul pentru:', url);
      
      // Apelează Edge Function-ul pentru scraping
      const { data, error: functionError } = await supabase.functions.invoke('web-scraper', {
        body: { url }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Eroare la apelarea funcției de scraping');
      }

      if (!data) {
        throw new Error('Nu s-au primit date de la serverul de scraping');
      }

      console.log('✅ Scraping finalizat cu succes!', data);
      
      setScrapedData(data);
      const report = generateStructuredReport(data);
      setStructuredReport(report);

      toast({
        title: "Scraping finalizat cu succes! 🎉",
        description: `Găsite ${data.products.length} produse, ${data.links.length} link-uri și ${data.images.length} imagini`,
      });

    } catch (err) {
      console.error('❌ Eroare la scraping:', err);
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută';
      setError(errorMessage);
      
      toast({
        title: "Eroare la scraping",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        description: "Nu s-a putut copia în clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Web Scraping Universal</h1>
            <p className="text-muted-foreground">
              Extrage automat toate datele de pe orice site web - produse, prețuri, imagini, contact și mult mai mult
            </p>
          </div>
        </div>

        {/* Formularul de input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Introdu URL-ul pentru scraping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL-ul site-ului</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://exemplu.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !url.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează scraping-ul...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Începe Scraping-ul Complet
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Indicatorul de progres */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Procesează scraping-ul...</p>
                  <p className="text-sm text-muted-foreground">
                    Se extrag toate datele disponibile de pe site
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Afișarea erorilor */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Eroare la scraping</h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Afișarea rezultatelor */}
        {scrapedData && (
          <div className="space-y-6">
            {/* Statistici generale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Scraping finalizat cu succes!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{scrapedData.products.length}</div>
                    <div className="text-sm text-muted-foreground">Produse</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Link2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{scrapedData.links.length}</div>
                    <div className="text-sm text-muted-foreground">Link-uri</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Image className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{scrapedData.images.length}</div>
                    <div className="text-sm text-muted-foreground">Imagini</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{scrapedData.headings.length}</div>
                    <div className="text-sm text-muted-foreground">Secțiuni</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Taburi cu rezultatele */}
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="products">Produse</TabsTrigger>
                <TabsTrigger value="links">Link-uri</TabsTrigger>
                <TabsTrigger value="images">Imagini</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="report">Raport</TabsTrigger>
                <TabsTrigger value="raw">Date Raw</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Produse găsite ({scrapedData.products.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4">
                        {scrapedData.products.map((product, index) => (
                          <div key={product.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <Badge variant="secondary">{product.category}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex items-center gap-4 mb-2">
                              <span className="font-bold text-lg text-primary">{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {product.originalPrice}
                                </span>
                              )}
                              {product.discountPercentage && (
                                <Badge variant="destructive">-{product.discountPercentage}%</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Disponibilitate: {product.availability}</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{product.images.length} imagini</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="links">
                <Card>
                  <CardHeader>
                    <CardTitle>Link-uri găsite ({scrapedData.links.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-2">
                        {scrapedData.links.slice(0, 100).map((link, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium truncate max-w-md">{link.text || 'Link fără text'}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-lg">{link.url}</p>
                            </div>
                            <Badge variant={link.type === 'external' ? 'destructive' : 'default'}>
                              {link.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle>Imagini găsite ({scrapedData.images.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {scrapedData.images.slice(0, 50).map((image, index) => (
                          <div key={index} className="border rounded-lg p-2">
                            <img 
                              src={image.src} 
                              alt={image.alt}
                              className="w-full h-32 object-cover rounded mb-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                            <p className="text-xs text-muted-foreground truncate">
                              {image.alt || 'Fără descriere'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Informații de contact și sociale</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scrapedData.contactInfo.emails.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Email-uri găsite</h3>
                        <div className="flex flex-wrap gap-2">
                          {scrapedData.contactInfo.emails.map((email, index) => (
                            <Badge key={index} variant="outline">{email}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {scrapedData.contactInfo.phones.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Telefoane găsite</h3>
                        <div className="flex flex-wrap gap-2">
                          {scrapedData.contactInfo.phones.map((phone, index) => (
                            <Badge key={index} variant="outline">{phone}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {scrapedData.socialLinks.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Link-uri sociale</h3>
                        <div className="space-y-2">
                          {scrapedData.socialLinks.map((social, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="font-medium">{social.platform}</span>
                              <a 
                                href={social.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline truncate max-w-xs"
                              >
                                {social.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="report">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Raport structurat</CardTitle>
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Code className="mr-2 h-4 w-4" />
                      Copiază raportul
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={structuredReport}
                      readOnly
                      className="min-h-[600px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="raw">
                <Card>
                  <CardHeader>
                    <CardTitle>Date JSON complete</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <pre className="text-xs bg-secondary p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(scrapedData, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scraping;