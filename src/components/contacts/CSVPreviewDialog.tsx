import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Edit3, X } from 'lucide-react';

interface CSVPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  csvData: {
    headers: string[];
    rows: string[][];
  };
  onConfirmImport: (mapping: { [csvColumn: string]: string }, editedData?: string[][]) => void;
}

// Predefined contact fields for reference
const CONTACT_FIELDS = [
  { value: 'nume', label: 'Nume', required: true },
  { value: 'telefon', label: 'Telefon', required: true },
  { value: 'email', label: 'Email', required: false },
  { value: 'tara', label: 'Țară', required: false },
  { value: 'locatie', label: 'Locație', required: false },
  { value: 'company', label: 'Companie', required: false },
  { value: 'info', label: 'Informații', required: false },
  { value: 'notes', label: 'Notițe', required: false },
  { value: 'status', label: 'Status', required: false },
  { value: 'tags', label: 'Etichete', required: false }
];

// Automatic smart mapping function - maps ALL columns automatically
const getAutomaticMapping = (csvHeaders: string[]): { [csvColumn: string]: string } => {
  const mapping: { [csvColumn: string]: string } = {};
  
  const mappingRules = [
    // Telefon variations (HIGHEST priority)
    { patterns: ['telefon', 'phone', 'tel', 'mobile', 'celular', 'numar', 'contact', 'number'], field: 'telefon' },
    // Nume variations
    { patterns: ['nume', 'name', 'first_name', 'prenume', 'full_name', 'client'], field: 'nume' },
    // Email variations
    { patterns: ['email', 'e-mail', 'mail', 'adresa_email'], field: 'email' },
    // Tara variations
    { patterns: ['tara', 'country', 'nation', 'country_code'], field: 'tara' },
    // Locatie variations
    { patterns: ['locatie', 'location', 'city', 'oras', 'adresa', 'address'], field: 'locatie' },
    // Company variations
    { patterns: ['company', 'companie', 'firma', 'organizatie', 'organization'], field: 'company' },
    // Info variations
    { patterns: ['info', 'informatii', 'details', 'detalii', 'description'], field: 'info' },
    // Notes variations
    { patterns: ['notes', 'notite', 'observatii', 'comments', 'remarks'], field: 'notes' },
    // Status variations
    { patterns: ['status', 'stare', 'state', 'condition'], field: 'status' },
    // Tags variations
    { patterns: ['tags', 'etichete', 'labels', 'categories'], field: 'tags' }
  ];

  // First pass: Find phone number (priority)
  const phoneHeader = csvHeaders.find(header => {
    const normalized = header.toLowerCase().trim();
    return mappingRules[0].patterns.some(pattern => normalized.includes(pattern));
  });
  
  if (phoneHeader) {
    mapping[phoneHeader] = 'telefon';
  }

  // Map all other columns
  csvHeaders.forEach(header => {
    if (mapping[header]) return; // Skip already mapped (phone)
    
    const normalizedHeader = header.toLowerCase().trim();
    let mapped = false;
    
    // Try to match known fields
    for (const rule of mappingRules) {
      if (rule.patterns.some(pattern => normalizedHeader.includes(pattern))) {
        mapping[header] = rule.field;
        mapped = true;
        break;
      }
    }
    
    // If no match found, create custom field
    if (!mapped) {
      const cleanFieldName = normalizedHeader.replace(/[^a-z0-9]/g, '_');
      mapping[header] = `custom_${cleanFieldName}`;
    }
  });

  return mapping;
};

export const CSVPreviewDialog: React.FC<CSVPreviewDialogProps> = ({
  isOpen,
  onClose,
  csvData,
  onConfirmImport
}) => {
  const [automaticMapping, setAutomaticMapping] = useState<{ [csvColumn: string]: string }>({});
  const [editedData, setEditedData] = useState<string[][]>([]);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Apply automatic mapping when CSV data changes
  useEffect(() => {
    if (csvData.headers.length > 0) {
      const smartMapping = getAutomaticMapping(csvData.headers);
      setAutomaticMapping(smartMapping);
      setEditedData(csvData.rows);
      setVisibleColumns(csvData.headers);
    }
  }, [csvData]);

  const handleDeleteColumn = (columnToDelete: string) => {
    const newVisibleColumns = visibleColumns.filter(col => col !== columnToDelete);
    setVisibleColumns(newVisibleColumns);
    
    // Remove from automatic mapping
    const newMapping = { ...automaticMapping };
    delete newMapping[columnToDelete];
    setAutomaticMapping(newMapping);
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, newValue: string) => {
    const newData = [...editedData];
    newData[rowIndex][colIndex] = newValue;
    setEditedData(newData);
    setEditingCell(null);
  };

  const startEditing = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
  };

  const handleConfirm = () => {
    // Use all visible columns with their automatic mappings
    const finalMapping = Object.entries(automaticMapping)
      .filter(([csvColumn]) => visibleColumns.includes(csvColumn))
      .reduce((acc, [csvColumn, targetField]) => {
        acc[csvColumn] = targetField;
        return acc;
      }, {} as { [csvColumn: string]: string });

    onConfirmImport(finalMapping, editedData);
    onClose();
  };

  // Check if phone number is detected
  const hasPhoneNumber = Object.values(automaticMapping).includes('telefon');

  const getFieldDisplayName = (fieldValue: string) => {
    if (fieldValue.startsWith('custom_')) {
      return `Câmp Custom: ${fieldValue.replace('custom_', '').replace(/_/g, ' ')}`;
    }
    return CONTACT_FIELDS.find(f => f.value === fieldValue)?.label || fieldValue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🚀 Import Automat CSV - Toate coloanele detectate
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Automatic mapping info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                ⚡ Mapare Automată Aplicată
                <Badge variant="outline" className="text-xs">
                  {visibleColumns.length} coloane detectate
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleColumns.map((header, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {header}
                      </Badge>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xs font-medium">
                        {getFieldDisplayName(automaticMapping[header])}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/20"
                      onClick={() => handleDeleteColumn(header)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {!hasPhoneNumber && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Nu s-a detectat coloana cu numărul de telefon!
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    Verifică că CSV-ul conține o coloană cu numere de telefon (telefon, phone, contact, etc.)
                  </p>
                </div>
              )}
              
              {hasPhoneNumber && (
                <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success font-medium">
                    ✅ Perfect! Toate coloanele au fost detectate automat.
                  </p>
                  <p className="text-xs text-success/80 mt-1">
                    Poți edita datele în tabelul de mai jos sau șterge coloane nedorite.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview section with editing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                👁️ Preview Date
                <Badge variant="secondary" className="text-xs">
                  {editedData.length} rânduri
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.map((header, index) => (
                        <TableHead key={index} className="text-xs min-w-32">
                          <div className="space-y-1">
                            <div className="font-mono">{header}</div>
                            <Badge variant="secondary" className="text-xs">
                              {getFieldDisplayName(automaticMapping[header])}
                            </Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedData.slice(0, 8).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {visibleColumns.map((header, colIndex) => {
                          const originalColIndex = csvData.headers.indexOf(header);
                          const cellValue = row[originalColIndex] || '';
                          const isEditing = editingCell?.row === rowIndex && editingCell?.col === originalColIndex;
                          
                          return (
                            <TableCell key={colIndex} className="text-xs max-w-32">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    defaultValue={cellValue}
                                    className="h-6 text-xs"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCellEdit(rowIndex, originalColIndex, e.currentTarget.value);
                                      } else if (e.key === 'Escape') {
                                        setEditingCell(null);
                                      }
                                    }}
                                    onBlur={(e) => {
                                      handleCellEdit(rowIndex, originalColIndex, e.target.value);
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                    onClick={() => setEditingCell(null)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div 
                                  className="truncate cursor-pointer hover:bg-muted/50 rounded px-1 flex items-center gap-1 group"
                                  onClick={() => startEditing(rowIndex, originalColIndex)}
                                >
                                  <span>{cellValue || '-'}</span>
                                  <Edit3 className="h-2 w-2 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    {editedData.length > 8 && (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length} className="text-center text-xs text-muted-foreground py-4">
                          ... și încă {editedData.length - 8} rânduri vor fi importate
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!hasPhoneNumber}
            className="bg-primary hover:bg-primary/90"
          >
            🚀 Importă Automat {editedData.length} contacte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};