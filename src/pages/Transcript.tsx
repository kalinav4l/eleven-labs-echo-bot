import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Search, Clock, Eye, Download, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTranscripts } from '@/hooks/useTranscripts';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Transcript = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    savedTranscripts, 
    isLoading, 
    saveTranscript, 
    deleteTranscript,
    exportToSRT,
    exportToTXT,
    exportToJSON
  } = useTranscripts();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Eroare",
        description: "Vă rugăm să selectați un fișier audio.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    toast({
      title: "Procesare",
      description: "Se transcrie fișierul audio...",
    });

    try {
      // Convert audio file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      console.log('Calling speech-to-text function...');
      
      // Call Supabase edge function for transcription
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Speech-to-text error:', error);
        throw new Error('Transcrierea a eșuat: ' + error.message);
      }

      console.log('Transcription result:', data);

      // Process the transcription result
      const transcriptText = data.text || '';
      
      console.log('Calling process-transcript function...');
      
      // Call process-transcript function to structure the dialogue
      const { data: processedData, error: processError } = await supabase.functions.invoke('process-transcript', {
        body: { transcriptText }
      });

      if (processError) {
        console.warn('Could not process transcript structure:', processError);
        // Continue with basic transcript if processing fails
      }

      console.log('Processed data:', processedData);

      // Create transcript entries from processed data or fallback
      let transcriptEntries = [];
      if (processedData?.dialogue && Array.isArray(processedData.dialogue)) {
        transcriptEntries = processedData.dialogue.map((entry: any, index: number) => ({
          speaker: entry.speaker || `Speaker ${index + 1}`,
          text: entry.text || '',
          timestamp: `${Math.floor(index * 10 / 60)}:${(index * 10 % 60).toString().padStart(2, '0')}`,
          startTime: index * 10,
          endTime: (index + 1) * 10
        }));
      } else {
        // Fallback to simple transcript
        transcriptEntries = [{
          speaker: "Speaker 1",
          text: transcriptText,
          timestamp: "0:00",
          startTime: 0,
          endTime: 60
        }];
      }

      await saveTranscript({
        title: file.name.replace(/\.[^/.]+$/, ""),
        transcriptEntries: transcriptEntries,
        durationSeconds: Math.ceil(file.size / 16000), // Rough estimate
        fileSizeMb: file.size / (1024 * 1024),
        originalFilename: file.name,
        rawText: transcriptText
      });

      toast({
        title: "Succes",
        description: "Audio transcris cu succes!",
      });

    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut transcrie audio-ul. Încercați din nou.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredTranscripts = savedTranscripts.filter(transcript =>
    transcript.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTranscript = (transcript: any) => {
    setSelectedTranscript(transcript);
  };

  const handleDeleteTranscript = async (transcriptId: string) => {
    if (confirm('Sunteți sigur că doriți să ștergeți acest transcript?')) {
      await deleteTranscript(transcriptId);
    }
  };

  const handleExport = (transcript: any, format: 'srt' | 'txt' | 'json') => {
    switch (format) {
      case 'srt':
        exportToSRT(transcript.transcript_entries, transcript.title);
        break;
      case 'txt':
        exportToTXT(transcript.transcript_entries, transcript.title);
        break;
      case 'json':
        exportToJSON(transcript.transcript_entries, transcript.title);
        break;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Se încarcă transcripturile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {!selectedTranscript ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">Transcripturi</h1>
                  <p className="text-gray-600 text-sm">Încărcați și gestionați transcripțiile audio</p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Se procesează...' : 'Încarcă Audio'}
                </Button>
              </div>

              <div className="relative mb-8 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Caută transcripturi..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200" 
                />
              </div>

              <div className="space-y-3">
                {filteredTranscripts.map((transcript) => (
                  <div 
                    key={transcript.id} 
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{transcript.title}</h3>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {Math.floor(transcript.duration_seconds / 60)}m {transcript.duration_seconds % 60}s
                            </span>
                            <span>{new Date(transcript.created_at).toLocaleDateString('ro-RO')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewTranscript(transcript)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Vezi
                        </Button>
                        <div className="relative group">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="p-1">
                              <button
                                onClick={() => handleExport(transcript, 'txt')}
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                              >
                                TXT
                              </button>
                              <button
                                onClick={() => handleExport(transcript, 'srt')}
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                              >
                                SRT
                              </button>
                              <button
                                onClick={() => handleExport(transcript, 'json')}
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                              >
                                JSON
                              </button>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTranscript(transcript.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTranscripts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Niciun transcript încă</h3>
                    <p className="text-gray-600 mb-6 text-center max-w-md mx-auto">
                      Încărcați primul fișier audio pentru a începe transcrierea automată.
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedTranscript(null)}
                    className="text-gray-600 hover:text-gray-900 mb-2"
                  >
                    ← Înapoi la transcripturi
                  </Button>
                  <h1 className="text-2xl font-semibold text-gray-900">{selectedTranscript.title}</h1>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExport(selectedTranscript, 'txt')}
                    className="text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportă TXT
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport(selectedTranscript, 'srt')}
                    className="text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportă SRT
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {Array.isArray(selectedTranscript.transcript_entries) && 
                  selectedTranscript.transcript_entries.map((entry: any, index: number) => (
                    <div key={index} className="flex space-x-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                        {entry.speaker?.charAt(entry.speaker.length - 1) || 'S'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-xs text-gray-900">{entry.speaker}</span>
                          <span className="text-xs text-gray-500">{entry.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transcript;
