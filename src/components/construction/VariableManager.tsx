import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Variable, Trash2 } from 'lucide-react';

interface Variable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  scope: 'global' | 'flow' | 'node';
  defaultValue?: string;
  description?: string;
}

interface VariableManagerProps {
  isOpen: boolean;
  onClose: () => void;
  variables: Variable[];
  onUpdateVariables: (variables: Variable[]) => void;
}

export const VariableManager: React.FC<VariableManagerProps> = ({
  isOpen,
  onClose,
  variables,
  onUpdateVariables
}) => {
  const [newVariable, setNewVariable] = useState<Partial<Variable>>({
    name: '',
    type: 'string',
    scope: 'global',
    defaultValue: '',
    description: ''
  });

  if (!isOpen) return null;

  const addVariable = () => {
    if (!newVariable.name) return;
    
    const variable: Variable = {
      id: `var_${Date.now()}`,
      name: newVariable.name!,
      type: newVariable.type as Variable['type'],
      scope: newVariable.scope as Variable['scope'],
      defaultValue: newVariable.defaultValue,
      description: newVariable.description
    };
    
    onUpdateVariables([...variables, variable]);
    setNewVariable({ name: '', type: 'string', scope: 'global', defaultValue: '', description: '' });
  };

  const removeVariable = (id: string) => {
    onUpdateVariables(variables.filter(v => v.id !== id));
  };

  const getScopeColor = (scope: Variable['scope']) => {
    switch (scope) {
      case 'global': return 'bg-blue-100 text-blue-800';
      case 'flow': return 'bg-green-100 text-green-800';
      case 'node': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-[800px] max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Variable className="h-5 w-5 text-purple-600" />
              <CardTitle>Variable Manager</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Manage variables that can be used throughout your workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Variable */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Add New Variable</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="varName">Variable Name</Label>
                <Input
                  id="varName"
                  placeholder="customer_name"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="varType">Type</Label>
                <Select value={newVariable.type} onValueChange={(value) => setNewVariable({ ...newVariable, type: value as Variable['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="varScope">Scope</Label>
                <Select value={newVariable.scope} onValueChange={(value) => setNewVariable({ ...newVariable, scope: value as Variable['scope'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="node">Node</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="varDefault">Default Value</Label>
                <Input
                  id="varDefault"
                  placeholder="Optional default value"
                  value={newVariable.defaultValue}
                  onChange={(e) => setNewVariable({ ...newVariable, defaultValue: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="varDescription">Description</Label>
              <Input
                id="varDescription"
                placeholder="Brief description of this variable"
                value={newVariable.description}
                onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
              />
            </div>
            <Button onClick={addVariable} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>

          {/* Variables List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Existing Variables ({variables.length})</h3>
            {variables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No variables defined yet. Add one above to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {variables.map((variable) => (
                  <div key={variable.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {`{{${variable.name}}}`}
                        </code>
                        <Badge className={getScopeColor(variable.scope)}>
                          {variable.scope}
                        </Badge>
                        <Badge variant="outline">
                          {variable.type}
                        </Badge>
                      </div>
                      {variable.description && (
                        <p className="text-sm text-gray-600">{variable.description}</p>
                      )}
                      {variable.defaultValue && (
                        <p className="text-xs text-gray-500">Default: {variable.defaultValue}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariable(variable.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};