import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Edit3, Check, X } from 'lucide-react';

interface CSVPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  csvData: {
    headers: string[];
    rows: string[][];
  };
  onConfirmImport: (mapping: { [csvColumn: string]: string }, editedData?: string[][]) => void;
}

// Predefined fields that contacts can have
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
  { value: 'tags', label: 'Etichete', required: false },
  { value: 'skip', label: 'Nu importa', required: false }
];

// Smart mapping function to suggest mappings
const getSmartMapping = (csvHeaders: string[]): { [csvColumn: string]: string } => {
  const mapping: { [csvColumn: string]: string } = {};
  
  const mappingRules = [
    // Nume variations
    { patterns: ['nume', 'name', 'first_name', 'prenume', 'full_name', 'client'], field: 'nume' },
    // Telefon variations (prioritized)
    { patterns: ['number', 'telefon', 'phone', 'tel', 'mobile', 'celular', 'numar', 'contact'], field: 'telefon' },
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

  csvHeaders.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    
    for (const rule of mappingRules) {
      if (rule.patterns.some(pattern => normalizedHeader.includes(pattern))) {
        mapping[header] = rule.field;
        break;
      }
    }
    
    // If no mapping found, set to skip
    if (!mapping[header]) {
      mapping[header] = 'skip';
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
  const [columnMapping, setColumnMapping] = useState<{ [csvColumn: string]: string }>(() => 
    getSmartMapping(csvData.headers)
  );
  const [editedData, setEditedData] = useState<string[][]>(csvData.rows);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(csvData.headers);

  const handleMappingChange = (csvColumn: string, targetField: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: targetField
    }));
  };

  const handleDeleteColumn = (columnToDelete: string) => {
    const newVisibleColumns = visibleColumns.filter(col => col !== columnToDelete);
    setVisibleColumns(newVisibleColumns);
    
    // Also remove from mapping
    const newMapping = { ...columnMapping };
    delete newMapping[columnToDelete];
    setColumnMapping(newMapping);
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
    // Filter out unmapped and skipped columns
    const finalMapping = Object.entries(columnMapping)
      .filter(([_, targetField]) => targetField !== '' && targetField !== 'skip')
      .reduce((acc, [csvColumn, targetField]) => {
        acc[csvColumn] = targetField;
        return acc;
      }, {} as { [csvColumn: string]: string });

    onConfirmImport(finalMapping, editedData);
    onClose();
  };

  // Check if required fields are mapped
  const requiredFields = CONTACT_FIELDS.filter(f => f.required).map(f => f.value);
  const mappedFields = Object.values(columnMapping).filter(v => v !== '' && v !== 'skip');
  const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview și mapare coloane CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mapping section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mapare Coloane</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleColumns.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {header}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                          onClick={() => handleDeleteColumn(header)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">→</span>
                    <div className="min-w-0 flex-1">
                      <Select
                        value={columnMapping[header] || 'skip'}
                        onValueChange={(value) => handleMappingChange(header, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Selectează câmpul" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              <div className="flex items-center gap-2">
                                <span>{field.label}</span>
                                {field.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    obligatoriu
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              
              {missingRequired.length > 0 && (
                <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">
                    Câmpuri obligatorii care nu sunt mapate: {missingRequired.join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preview Date ({editedData.length} rânduri)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.map((header, index) => {
                        const originalIndex = csvData.headers.indexOf(header);
                        return (
                          <TableHead key={index} className="text-xs">
                            <div className="space-y-1">
                              <div>{header}</div>
                              {columnMapping[header] && columnMapping[header] !== 'skip' && (
                                <Badge variant="secondary" className="text-xs">
                                  {CONTACT_FIELDS.find(f => f.value === columnMapping[header])?.label}
                                </Badge>
                              )}
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {visibleColumns.map((header, colIndex) => {
                          const originalColIndex = csvData.headers.indexOf(header);
                          const cellValue = row[originalColIndex];
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
                                  className="truncate cursor-pointer hover:bg-muted/50 rounded px-1 flex items-center gap-1"
                                  onClick={() => startEditing(rowIndex, originalColIndex)}
                                >
                                  <span>{cellValue}</span>
                                  <Edit3 className="h-2 w-2 opacity-0 group-hover:opacity-100" />
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    {editedData.length > 5 && (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length} className="text-center text-xs text-muted-foreground">
                          ... și încă {editedData.length - 5} rânduri
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
            disabled={missingRequired.length > 0}
          >
            Importă {editedData.length} contacte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};