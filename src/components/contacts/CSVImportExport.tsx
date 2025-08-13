import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CSVImportExportProps {
  onImportSuccess: (data: any[]) => void;
  onDownloadTemplate: () => void;
  expectedHeaders: string[];
  data: any[];
  filename?: string;
}

export const CSVImportExport: React.FC<CSVImportExportProps> = ({
  onImportSuccess,
  onDownloadTemplate,
  expectedHeaders,
  data,
  filename = 'export'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Eroare",
        description: "Vă rugăm să selectați un fișier CSV valid.",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Eroare",
          description: "Fișierul CSV trebuie să conțină cel puțin o linie de header și o linie de date.",
          variant: "destructive"
        });
        return;
      }

      // Parse CSV headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Validate required headers
      const missingHeaders = expectedHeaders.filter(header => 
        !headers.some(h => h.toLowerCase() === header.toLowerCase())
      );

      if (missingHeaders.length > 0) {
        toast({
          title: "Eroare",
          description: `Lipsesc coloanele obligatorii: ${missingHeaders.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Parse data rows
      const parsedData = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        parsedData.push(row);
      }

      onImportSuccess(parsedData);
      
      toast({
        title: "Succes",
        description: `Au fost importate ${parsedData.length} înregistrări.`
      });
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut procesa fișierul CSV.",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      toast({
        title: "Atenție",
        description: "Nu există date pentru export.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => `"${item[header] || ''}"`).join(',')
      )
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Import/Export CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleFileSelect}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          
          <Button
            onClick={onDownloadTemplate}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Template
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          CSV-ul trebuie să conțină coloanele: {expectedHeaders.join(', ')}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </CardContent>
    </Card>
  );
};