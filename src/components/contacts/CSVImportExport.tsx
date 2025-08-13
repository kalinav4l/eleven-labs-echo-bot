import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CSVPreviewDialog } from './CSVPreviewDialog';

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
  const [showPreview, setShowPreview] = useState(false);
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][] }>({ headers: [], rows: [] });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Enhanced CSV parsing with better delimiter detection
  const parseCSV = (text: string): { headers: string[]; rows: string[][] } => {
    // Try different delimiters
    const delimiters = [',', ';', '\t'];
    let bestDelimiter = ',';
    let maxColumns = 0;

    // Detect the best delimiter
    delimiters.forEach(delimiter => {
      const testLine = text.split('\n')[0];
      const columns = testLine.split(delimiter).length;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestDelimiter = delimiter;
      }
    });

    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Fișierul este gol');
    }

    // Parse with proper CSV handling (respecting quotes)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === bestDelimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    return { headers, rows };
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
      
      if (!text.trim()) {
        toast({
          title: "Eroare",
          description: "Fișierul CSV este gol.",
          variant: "destructive"
        });
        return;
      }

      const parsedData = parseCSV(text);
      
      if (parsedData.rows.length === 0) {
        toast({
          title: "Eroare", 
          description: "Fișierul CSV nu conține date.",
          variant: "destructive"
        });
        return;
      }

      // Set data and show preview dialog
      setCsvData(parsedData);
      setShowPreview(true);
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut procesa fișierul CSV. Verificați formatul fișierului.",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = (mapping: { [csvColumn: string]: string }, editedData?: string[][]) => {
    try {
      const finalData = editedData || csvData.rows;
      const mappedData = finalData.map(row => {
        const mappedRow: any = {};
        
        // Map ALL CSV columns to contact fields (including custom ones)
        Object.entries(mapping).forEach(([csvColumn, contactField]) => {
          const columnIndex = csvData.headers.indexOf(csvColumn);
          if (columnIndex !== -1 && row[columnIndex] !== undefined) {
            const cellValue = row[columnIndex]?.toString().trim() || '';
            
            if (cellValue) { // Only process non-empty values
              if (contactField === 'tags') {
                // Handle tags as array
                mappedRow[contactField] = cellValue.split(',').map((tag: string) => tag.trim()).filter(Boolean);
              } else if (contactField.startsWith('custom_')) {
                // Handle custom fields by storing them in info field
                if (!mappedRow.info) mappedRow.info = '';
                const fieldLabel = contactField.replace('custom_', '').replace(/_/g, ' ');
                mappedRow.info += `${fieldLabel}: ${cellValue}\n`;
              } else {
                // Standard fields - use exact mapping
                mappedRow[contactField] = cellValue;
              }
            }
          }
        });

        // Ensure required fields are present - prioritize phone number detection
        if (!mappedRow.telefon && !mappedRow.number) {
          // Skip rows without phone numbers
          return null;
        }
        
        // Standardize field names for different systems
        if (mappedRow.telefon) mappedRow.number = mappedRow.telefon;
        if (mappedRow.nume) mappedRow.name = mappedRow.nume;
        if (!mappedRow.nume && mappedRow.name) mappedRow.nume = mappedRow.name;
        if (!mappedRow.name && mappedRow.nume) mappedRow.name = mappedRow.nume;
        
        // Set defaults
        if (!mappedRow.name && !mappedRow.nume) mappedRow.name = 'Contact Nou';
        if (!mappedRow.status) mappedRow.status = 'active';

        return mappedRow;
      }).filter(Boolean); // Remove null entries

      onImportSuccess(mappedData);
      
      toast({
        title: "🚀 Import Automat Finalizat!",
        description: `${mappedData.length} contacte au fost importate cu toate coloanele detectate automat.`
      });
      
      setShowPreview(false);
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare în timpul importului automat.",
        variant: "destructive"
      });
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
        
        <div className="mt-3 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Settings className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">🚀 Import 100% Automat:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Detectează și importă TOATE coloanele din CSV</li>
                <li>• Mapare inteligentă automată (fără intervenție manuală)</li>
                <li>• Prioritizează numărul de telefon</li>
                <li>• Coloanele necunoscute devin câmpuri custom</li>
                <li>• Editare în timp real și ștergere coloane</li>
              </ul>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <CSVPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          csvData={csvData}
          onConfirmImport={handleConfirmImport}
        />
      </CardContent>
    </Card>
  );
};