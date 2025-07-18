import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  RefreshCcw, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trash2,
  BarChart3
} from 'lucide-react';
import { useAutoRedial } from '@/hooks/useAutoRedial';

export const AutoRedialPanel: React.FC = () => {
  const {
    isRedialActive,
    redialQueue,
    config,
    updateConfig,
    removeFromQueue,
    startAutoRedial,
    stopAutoRedial,
    pauseAutoRedial,
    resumeAutoRedial,
    isPaused,
    currentContact,
    stats
  } = useAutoRedial();

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'calling': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'max_attempts': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'În așteptare';
      case 'calling': return 'Sună acum';
      case 'success': return 'Reușit';
      case 'failed': return 'Eșuat';
      case 'max_attempts': return 'Max încercări';
      default: return 'Necunoscut';
    }
  };

  const handleConfigSave = () => {
    updateConfig(tempConfig);
    setConfigDialogOpen(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5" />
              Re-apelare Automată
            </CardTitle>
            <CardDescription>
              Sistem inteligent de re-apelare pentru apelurile eșuate
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setTempConfig(config)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurare Re-apelare</DialogTitle>
                  <DialogDescription>
                    Configurează parametrii pentru sistemul de re-apelare automată
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Activează re-apelarea</Label>
                    <Switch
                      id="enabled"
                      checked={tempConfig.enabled}
                      onCheckedChange={(checked) => setTempConfig(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Numărul maxim de încercări</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={tempConfig.maxAttempts}
                      onChange={(e) => setTempConfig(prev => ({ 
                        ...prev, 
                        maxAttempts: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delay">Întârziere între încercări (minute)</Label>
                    <Input
                      id="delay"
                      type="number"
                      min="1"
                      max="1440"
                      value={Math.round(tempConfig.delayBetweenAttempts / 60)}
                      onChange={(e) => setTempConfig(prev => ({ 
                        ...prev, 
                        delayBetweenAttempts: (parseInt(e.target.value) || 1) * 60 
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="onlyFailed">Doar apeluri eșuate</Label>
                    <Switch
                      id="onlyFailed"
                      checked={tempConfig.onlyFailedCalls}
                      onCheckedChange={(checked) => setTempConfig(prev => ({ ...prev, onlyFailedCalls: checked }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setConfigDialogOpen(false)} className="flex-1">
                    Anulează
                  </Button>
                  <Button onClick={handleConfigSave} className="flex-1">
                    Salvează
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status și Control */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isRedialActive ? (isPaused ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-400'
              }`} />
              <span className="font-medium">
                {isRedialActive ? (isPaused ? 'În pauză' : 'Activ') : 'Inactiv'}
              </span>
            </div>
            {currentContact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Sună: {currentContact.name}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isRedialActive ? (
              <Button onClick={startAutoRedial} disabled={!config.enabled || redialQueue.length === 0}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button variant="outline" onClick={pauseAutoRedial}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pauză
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resumeAutoRedial}>
                    <Play className="h-4 w-4 mr-2" />
                    Continuă
                  </Button>
                )}
                <Button variant="destructive" onClick={stopAutoRedial}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Statistici */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQueued}</div>
            <div className="text-sm text-muted-foreground">În coadă</div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalCompleted}</div>
            <div className="text-sm text-muted-foreground">Completate</div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
            <div className="text-sm text-muted-foreground">Eșuate</div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(stats.successRate)}%</div>
            <div className="text-sm text-muted-foreground">Rata succes</div>
          </div>
        </div>

        {/* Progress */}
        {isRedialActive && stats.totalQueued > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progres total</span>
              <span>{stats.totalCompleted + stats.totalFailed}/{stats.totalQueued}</span>
            </div>
            <Progress 
              value={(stats.totalCompleted + stats.totalFailed) / stats.totalQueued * 100} 
              className="h-2"
            />
          </div>
        )}

        <Separator />

        {/* Coadă Re-apelare */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Coadă Re-apelare</h3>
            <Badge variant="secondary">{redialQueue.length} contacte</Badge>
          </div>
          
          {redialQueue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nu există contacte în coada de re-apelare</p>
              <p className="text-sm">Contactele vor fi adăugate automat când apelurile eșuează</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {redialQueue.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)}`} />
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {contact.attempts}/{config.maxAttempts}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(contact.status)}
                      </Badge>
                      {contact.lastAttempt && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime((Date.now() - contact.lastAttempt.getTime()) / 1000)} în urmă
                        </div>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Șterge din coadă</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ești sigur că vrei să ștergi {contact.name} din coada de re-apelare?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anulează</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeFromQueue(contact.id)}>
                              Șterge
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Configurare rapidă */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium">Configurare Curentă</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Max încercări:</span>
              <span className="ml-2 font-medium">{config.maxAttempts}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Întârziere:</span>
              <span className="ml-2 font-medium">{formatTime(config.delayBetweenAttempts)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2 font-medium">{config.enabled ? 'Activat' : 'Dezactivat'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Doar eșuate:</span>
              <span className="ml-2 font-medium">{config.onlyFailedCalls ? 'Da' : 'Nu'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};