import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileAudio, MessageSquare, User, Bot, Loader2, Play } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getSpeakerColor = (speaker: string) => {
    if (speaker.toLowerCase().includes('agent') || speaker.toLowerCase().includes('ai')) {
      return 'bg-purple-500';
    }
    return 'bg-blue-500';
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Parses the final, structured dialogue from the AI
  const parseStructuredDialogue = (dialogue: any[]): TranscriptEntry[] => {
    return dialogue.map((item: any, index: number) => ({
      speaker: item.speaker || 'Necunoscut',
      text: item.text || '',
      timestamp: formatTime(index * 5), // Mock timestamp, can be improved
      startTime: index * 5,
      endTime: (index + 1) * 5,
    }));
  };
  
  // A simple fallback parser if AI processing fails
  const fallbackParse = (text: string): TranscriptEntry[] => {
    return text.split('\n').filter(line => line.trim()).map((line, index) => ({
      speaker: `Vorbitor ${index % 2 + 1}`,
      text: line,
      timestamp: formatTime(index * 5),
      startTime: index * 5,
      endTime: (index + 1) * 5,
    }));
  };

  const processAndSetTranscript = async (rawText: string) => {
    if (!rawText) {
      toast({
        title: "Eroare",
        description: "Transcriptul generat este gol.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({ title: "Analiză AI", description: "Transcriptul este procesat pentru a identifica vorbitorii..." });
      const { data, error } = await supabase.functions.invoke('process-transcript', {
        body: { transcriptText: rawText }
      });

      if (error) throw error;

      if (data && data.dialogue && Array.isArray(data.dialogue)) {
        const processedEntries = parseStructuredDialogue(data.dialogue);
        setTranscriptEntries(processedEntries);
        toast({
          title: "Succes",
          description: `Dialog structurat generat cu succes! (${processedEntries.length} intrări)`
        });
      } else {
        throw new Error('Răspuns invalid de la AI. Se afișează textul brut.');
      }
    } catch (error: any) {
      console.error('Error processing with AI:', error);
      toast({
        title: "Avertisment",
        description: "Procesarea AI a eșuat. Se afișează transcriptul nestructurat.",
        variant: "destructive"
      });
      // Fallback to simple parsing on error
      const entries = fallbackParse(rawText);
      setTranscriptEntries(entries);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];
      if (!validTypes.some(type => file.type.startsWith('audio/'))) {
        toast({
          title: "Eroare",
          description: "Te rog selectează un fișier audio valid.",
          variant: "destructive"
        });
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Eroare",
          description: "Fișierul este prea mare. Mărimea maximă este 25 MB.",
          variant: "destructive"
        });
        return;
      }
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setTranscriptEntries([]);
      toast({
        title: "Fișier selectat",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      });
    }
  };

  const handleGenerateTranscript = async () => {
    if (!audioFile) {
      toast({ title: "Eroare", description: "Te rog selectează un fișier audio.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    setTranscriptEntries([]);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model_id", "scribe_v1"); // Using ElevenLabs' speech-to-text
      
      toast({ title: "Procesare Audio", description: "Fișierul tău este transcris..." });

      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: { "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873" },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eroare API ElevenLabs: ${errorText}`);
      }
      
      const body = await response.json();
      
      if (body.text) {
        // Automatically process the raw text to structure the dialogue
        await processAndSetTranscript(body.text);
      } else {
        throw new Error('Nu s-a primit text în răspuns de la ElevenLabs');
      }
    } catch (error: any) {
      console.error('Error during transcript generation:', error);
      toast({
        title: "Eroare Generală",
        description: `Nu s-a putut procesa fișierul audio: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownloadSRT = () => {
    if (transcriptEntries.length === 0) return;
    let srtContent = '';
    transcriptEntries.forEach((entry, index) => {
      const formatSRTTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor(seconds % 1 * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
      };

      const speakerId = entry.speaker.toLowerCase().includes('agent') ? 'Agent AI' : 'User';
      srtContent += `${index + 1}\n${formatSRTTime(entry.startTime)} --> ${formatSRTTime(entry.endTime)}\n[${speakerId}] ${entry.text}\n\n`;
    });
    
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Descărcare Completă", description: "Fișierul SRT a fost salvat." });
  };
  
  const testDemo = async () => {
    const demoText = `Agent AI: Bună ziua! Numele meu este Alex și sunt un agent AI. Cum vă pot ajuta astăzi?
User: Salut, Alex! Aș dori să aflu mai multe despre pachetele voastre de credite.
Agent AI: Desigur! Avem mai multe pachete disponibile, concepute pentru nevoi diferite. Cel mai popular este pachetul "Starter" care oferă 100.000 de credite.
User: Și ce pot face cu aceste credite?
Agent AI: Un minut de convorbire cu un agent AI consumă 1.000 de credite. Deci pachetul Starter vă oferă aproximativ 100 de minute de conversație.`;
    await processAndSetTranscript(demoText);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transcript Audio</h1>
            <p className="text-gray-600">Generează și structurează dialoguri din fișiere audio</p>
          </div>
          <Button onClick={testDemo} variant="outline" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
            <Play className="w-4 h-4 mr-2" />
            Test Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <Upload className="w-6 h-6 text-[#0A5B4C]" />
                Upload Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#0A5B4C]/50 transition-colors bg-gray-50/50">
                <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" id="audio-upload" />
                <Button variant="outline" onClick={() => document.getElementById('audio-upload')?.click()} className="mt-4 bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                  Selectează Fișier
                </Button>
              </div>

              {audioFile && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-5 h-5 text-[#0A5B4C]" />
                    {/* MODIFICARE: Am adăugat `min-w-0` pentru a permite trunchierea textului */}
                    <div className="flex-1 min-w-0">
                      {/* MODIFICARE: Am adăugat clasa `truncate` și un `title` pentru a afișa numele complet la hover */}
                      <p className="font-medium text-sm text-gray-900 truncate" title={audioFile.name}>
                        {audioFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {audioUrl && (
                    <div className="mt-3">
                      <audio controls className="w-full" src={audioUrl}>
                        Browser-ul tău nu suportă redarea audio.
                      </audio>
                    </div>
                  )}
                </div>
              )}
              
              <Button onClick={handleGenerateTranscript} disabled={!audioFile || isProcessing} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Se procesează...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Generează Transcript
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <MessageSquare className="w-6 h-6 text-[#0A5B4C]" />
                  Dialog ({transcriptEntries.length} replici)
                </CardTitle>
                {transcriptEntries.length > 0 && (
                  <Button onClick={handleDownloadSRT} variant="outline" size="sm" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export SRT
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                {transcriptEntries.length > 0 ? (
                  transcriptEntries.map((entry, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
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
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Dialogul structurat va apărea aici.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transcript;