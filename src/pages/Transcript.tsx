import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileAudio, MessageSquare, User, Bot, Wand2, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
  startTime: number;
  endTime: number;
}

const Transcript = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingWithAI, setIsProcessingWithAI] = useState(false);
  const [isFetchingDubbed, setIsFetchingDubbed] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [dubbingId, setDubbingId] = useState<string>('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getSpeakerColor = (speaker: string) => {
    if (speaker.toLowerCase().includes('agent') || speaker.toLowerCase().includes('ai')) {
      return 'bg-purple-500';
    } else if (speaker.toLowerCase().includes('user')) {
      return 'bg-blue-500';
    }
    
    const colors = [
      'bg-blue-500',
      'bg-purple-500', 
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500'
    ];
    const index = parseInt(speaker.replace(/\D/g, '')) || 0;
    return colors[index % colors.length];
  };

  const getSpeakerIcon = (speaker: string) => {
    if (speaker.toLowerCase().includes('agent') || speaker.toLowerCase().includes('ai')) {
      return <Bot className="w-4 h-4 text-white" />;
    }
    return <User className="w-4 h-4 text-white" />;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}.${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Eroare",
          description: "Te rog selectează un fișier audio valid.",
          variant: "destructive"
        });
        return;
      }
      setAudioFile(file);
      toast({
        title: "Fișier selectat",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      });
    }
  };

  const parseTranscriptResponse = (text: string): TranscriptEntry[] => {
    // Parse simple transcript - this would need to be adapted based on actual API response
    const entries: TranscriptEntry[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        entries.push({
          speaker: `Speaker ${index % 3}`,
          text: line.trim(),
          timestamp: formatTime(index * 5), // Mock timestamps
          startTime: index * 5,
          endTime: (index + 1) * 5
        });
      }
    });

    return entries;
  };

  const parseWebVTTResponse = (webvttText: string): TranscriptEntry[] => {
    const entries: TranscriptEntry[] = [];
    const lines = webvttText.split('\n');
    
    let currentEntry: Partial<TranscriptEntry> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip WEBVTT header and empty lines
      if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) {
        continue;
      }
      
      // Check if line contains timestamp (format: 00:00:00.000 --> 00:00:00.000)
      if (line.includes(' --> ')) {
        const [startTime, endTime] = line.split(' --> ');
        currentEntry.timestamp = startTime;
        currentEntry.startTime = parseTimeToSeconds(startTime);
        currentEntry.endTime = parseTimeToSeconds(endTime);
      } else if (line && currentEntry.timestamp) {
        // This is the text content
        // Try to identify speaker from the text
        const speakerMatch = line.match(/^(.*?):\s*(.*)$/);
        if (speakerMatch) {
          currentEntry.speaker = speakerMatch[1];
          currentEntry.text = speakerMatch[2];
        } else {
          currentEntry.speaker = 'Speaker';
          currentEntry.text = line;
        }
        
        entries.push(currentEntry as TranscriptEntry);
        currentEntry = {};
      }
    }
    
    return entries;
  };

  const parseTimeToSeconds = (timeString: string): number => {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleUpload = async () => {
    if (!audioFile) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un fișier audio.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model_id", "scribe_v1");

      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.json();
      console.log(body);
      
      if (body.text) {
        const entries = parseTranscriptResponse(body.text);
        setTranscriptEntries(entries);
      }
      
      toast({
        title: "Succes",
        description: "Transcriptul a fost generat cu succes!"
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut procesa fișierul audio.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const processWithGPT4o = async () => {
    if (!rawTranscript) {
      toast({
        title: "Eroare",
        description: "Nu există transcript pentru procesare.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingWithAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-transcript', {
        body: { transcriptText: rawTranscript }
      });

      if (error) {
        throw error;
      }

      if (data.dialogue && Array.isArray(data.dialogue)) {
        const processedEntries: TranscriptEntry[] = data.dialogue.map((item: any, index: number) => ({
          speaker: item.speaker || 'Unknown',
          text: item.text || '',
          timestamp: item.timestamp || formatTime(index * 5),
          startTime: index * 5,
          endTime: (index + 1) * 5
        }));

        setTranscriptEntries(processedEntries);
        
        toast({
          title: "Succes",
          description: "Transcriptul a fost procesat cu GPT-4o!"
        });
      }

    } catch (error) {
      console.error('Error processing with GPT-4o:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut procesa transcriptul cu AI.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingWithAI(false);
    }
  };

  const handleFetchDubbedTranscript = async () => {
    if (!dubbingId.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un dubbing ID valid.",
        variant: "destructive"
      });
      return;
    }

    setIsFetchingDubbed(true);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}/transcript/en?format_type=webvtt`, {
        method: "GET",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const webvttText = await response.text();
      console.log('Dubbed transcript:', webvttText);
      
      const entries = parseWebVTTResponse(webvttText);
      setTranscriptEntries(entries);
      
      toast({
        title: "Succes",
        description: "Transcriptul dubat a fost încărcat cu succes!"
      });

    } catch (error) {
      console.error('Error fetching dubbed transcript:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut obține transcriptul dubat.",
        variant: "destructive"
      });
    } finally {
      setIsFetchingDubbed(false);
    }
  };

  const handleDownloadSRT = () => {
    if (transcriptEntries.length === 0) {
      toast({
        title: "Eroare",
        description: "Nu există transcript pentru export.",
        variant: "destructive"
      });
      return;
    }

    let srtContent = '';
    transcriptEntries.forEach((entry, index) => {
      const startTime = `00:00:${entry.startTime.toString().padStart(2, '0')},000`;
      const endTime = `00:00:${entry.endTime.toString().padStart(2, '0')},000`;
      
      srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${entry.speaker}: ${entry.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Descărcare",
      description: "Fișierul SRT a fost descărcat."
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Transcript</h1>
            <p className="text-muted-foreground">Generează transcripturi din fișiere audio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-accent" />
                Upload Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-accent/50 transition-colors">
                  <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Drag & drop sau selectează un fișier audio
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="audio-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className="mt-2"
                    >
                      Selectează Fișier
                    </Button>
                  </div>
                </div>

                {audioFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileAudio className="w-5 h-5 text-accent" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{audioFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!audioFile || isUploading}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesează...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Generează Transcript
                  </div>
                )}
              </Button>

              {/* GPT-4o Processing Button */}
              {rawTranscript && (
                <Button
                  onClick={processWithGPT4o}
                  disabled={isProcessingWithAI}
                  variant="outline"
                  className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
                >
                  {isProcessingWithAI ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      Procesează cu GPT-4o...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Procesează cu GPT-4o
                    </div>
                  )}
                </Button>
              )}

              {/* Dubbed Transcript Section */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-accent" />
                  Transcript Dubat
                </h3>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Introdu dubbing ID"
                    value={dubbingId}
                    onChange={(e) => setDubbingId(e.target.value)}
                    className="w-full"
                  />
                  <Button
                    onClick={handleFetchDubbedTranscript}
                    disabled={!dubbingId.trim() || isFetchingDubbed}
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent/10"
                  >
                    {isFetchingDubbed ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        Obține Transcript...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Obține Transcript Dubat
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript Result Section */}
          <Card className="liquid-glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-accent" />
                  Transcript
                </CardTitle>
                {transcriptEntries.length > 0 && (
                  <Button
                    onClick={handleDownloadSRT}
                    variant="outline"
                    size="sm"
                    className="border-accent text-accent hover:bg-accent/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export SRT
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {transcriptEntries.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transcriptEntries.map((entry, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full ${getSpeakerColor(entry.speaker)} flex items-center justify-center`}>
                          {getSpeakerIcon(entry.speaker)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">{entry.speaker}</span>
                          <span className="text-xs text-gray-500">{entry.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Transcriptul va apărea aici după procesare
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="liquid-glass mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Formate Suportate</h3>
                <p className="text-sm text-muted-foreground">MP3, WAV, M4A, OGG</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Mărime Maximă</h3>
                <p className="text-sm text-muted-foreground">25 MB per fișier</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Calitate</h3>
                <p className="text-sm text-muted-foreground">ElevenLabs Scribe v1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transcript;
