import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileAudio, MessageSquare, User, Bot, Wand2, Loader2, Play, Pause, AlertCircle } from 'lucide-react';
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
  const {
    user
  } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingWithAI, setIsProcessingWithAI] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const getSpeakerColor = (speaker: string) => {
    if (speaker.toLowerCase().includes('agent') || speaker.toLowerCase().includes('ai')) {
      return 'bg-purple-500';
    } else if (speaker.toLowerCase().includes('user')) {
      return 'bg-blue-500';
    }
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500'];
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verifică tipul fișierului
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];
      if (!validTypes.some(type => file.type === type || file.name.toLowerCase().endsWith(type.split('/')[1]))) {
        toast({
          title: "Eroare",
          description: "Te rog selectează un fișier audio valid (MP3, WAV, M4A, OGG).",
          variant: "destructive"
        });
        return;
      }

      // Verifică mărimea fișierului (max 25MB)
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
      toast({
        title: "Fișier selectat",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      });
    }
  };
  const parseTranscriptResponse = (text: string): TranscriptEntry[] => {
    const entries: TranscriptEntry[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      if (line.trim()) {
        // Detectează dacă linia conține un speaker
        const speakerMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (speakerMatch) {
          entries.push({
            speaker: speakerMatch[1].trim(),
            text: speakerMatch[2].trim(),
            timestamp: formatTime(index * 5),
            startTime: index * 5,
            endTime: (index + 1) * 5
          });
        } else {
          entries.push({
            speaker: `Speaker ${index % 2 === 0 ? 'A' : 'B'}`,
            text: line.trim(),
            timestamp: formatTime(index * 5),
            startTime: index * 5,
            endTime: (index + 1) * 5
          });
        }
      }
    });
    return entries;
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
      console.log('Uploading file:', audioFile.name, 'Size:', audioFile.size);
      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
        body: formData
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs error:', errorText);
        throw new Error(`Eroare API: ${response.status}`);
      }
      const body = await response.json();
      console.log('ElevenLabs response:', body);
      if (body.text) {
        setRawTranscript(body.text);
        const entries = parseTranscriptResponse(body.text);
        setTranscriptEntries(entries);
        toast({
          title: "Succes",
          description: `Transcript generat cu succes! (${entries.length} intrări)`
        });
      } else {
        throw new Error('Nu s-a primit text în răspuns');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Eroare",
        description: `Nu s-a putut procesa fișierul audio: ${error.message}`,
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
      console.log('Processing with GPT-4o, transcript length:', rawTranscript.length);
      const {
        data,
        error
      } = await supabase.functions.invoke('process-transcript', {
        body: {
          transcriptText: rawTranscript
        }
      });
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Eroare la procesarea cu AI');
      }
      console.log('GPT-4o response:', data);
      if (data && data.dialogue && Array.isArray(data.dialogue)) {
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
          description: `Transcript procesat cu GPT-4o! (${processedEntries.length} intrări)`
        });
      } else {
        throw new Error('Răspuns invalid de la GPT-4o');
      }
    } catch (error) {
      console.error('Error processing with GPT-4o:', error);
      toast({
        title: "Eroare",
        description: `Nu s-a putut procesa transcriptul cu AI: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessingWithAI(false);
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
      // Convert seconds to SRT timestamp format (HH:MM:SS,mmm)
      const formatSRTTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor(seconds % 1 * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
      };

      // Determine speaker number based on speaker name
      const getSpeakerNumber = (speakerName: string) => {
        if (speakerName.toLowerCase().includes('agent') || speakerName.toLowerCase().includes('ai')) {
          return '0';
        } else if (speakerName.toLowerCase().includes('user')) {
          return '1';
        } else {
          // Extract number from speaker name if it exists, otherwise assign based on index
          const numberMatch = speakerName.match(/\d+/);
          if (numberMatch) {
            return numberMatch[0];
          }
          // Alternate between speaker 0 and 1 based on index
          return (index % 2).toString();
        }
      };
      const startTime = formatSRTTime(entry.startTime);
      const endTime = formatSRTTime(entry.endTime);
      const speakerNumber = getSpeakerNumber(entry.speaker);
      srtContent += `${startTime} --> ${endTime} [Speaker ${speakerNumber}]\n${entry.text}\n\n`;
    });
    const blob = new Blob([srtContent], {
      type: 'text/plain;charset=utf-8'
    });
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
      description: "Fișierul SRT a fost descărcat cu succes în formatul cerut."
    });
  };
  const testDemo = () => {
    const demoText = `Agent AI: Bună ziua! Cum vă pot ajuta astăzi?
User: Salut! Aș vrea să știu mai multe despre serviciile voastre.
Agent AI: Cu plăcere! Oferim transcripturi automate pentru fișiere audio folosind tehnologia ElevenLabs.
User: Sună interesant. Cât durează să procesez un fișier?
Agent AI: De obicei, procesarea durează câteva minute, în funcție de lungimea fișierului audio.`;
    setRawTranscript(demoText);
    const entries = parseTranscriptResponse(demoText);
    setTranscriptEntries(entries);
    toast({
      title: "Demo încărcat",
      description: "Un exemplu de transcript a fost încărcat pentru testare."
    });
  };
  return <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transcript Audio</h1>
            <p className="text-gray-600">Generează transcripturi din fișiere audio folosind AI</p>
          </div>
          <Button onClick={testDemo} variant="outline" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
            <Play className="w-4 h-4 mr-2" />
            Test Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <Upload className="w-6 h-6 text-[#0A5B4C]" />
                Upload Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#0A5B4C]/50 transition-colors bg-gray-50/50">
                  <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Drag & drop sau selectează un fișier audio
                    </p>
                    <p className="text-xs text-gray-500">
                      Formate acceptate: MP3, WAV, M4A, OGG (max 25MB)
                    </p>
                    <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" id="audio-upload" />
                    <Button variant="outline" onClick={() => document.getElementById('audio-upload')?.click()} className="mt-4 bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                      Selectează Fișier
                    </Button>
                  </div>
                </div>

                {audioFile && <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileAudio className="w-5 h-5 text-[#0A5B4C]" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{audioFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {audioUrl && <div className="mt-3">
                        <audio controls className="w-full">
                          <source src={audioUrl} type={audioFile.type} />
                          Browser-ul tău nu suportă redarea audio.
                        </audio>
                      </div>}
                  </div>}
              </div>

              <Button onClick={handleUpload} disabled={!audioFile || isUploading} className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-700">
                {isUploading ? <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesează...
                  </div> : <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Generează Transcript
                  </div>}
              </Button>

              {/* GPT-4o Processing Button */}
              {rawTranscript && <Button onClick={processWithGPT4o} disabled={isProcessingWithAI} variant="outline" className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                  {isProcessingWithAI ? <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesează cu GPT-4o...
                    </div> : <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Îmbunătățește cu GPT-4o
                    </div>}
                </Button>}
            </CardContent>
          </Card>

          {/* Transcript Result Section */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <MessageSquare className="w-6 h-6 text-[#0A5B4C]" />
                  Transcript ({transcriptEntries.length} intrări)
                </CardTitle>
                {transcriptEntries.length > 0 && <Button onClick={handleDownloadSRT} variant="outline" size="sm" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export SRT
                  </Button>}
              </div>
            </CardHeader>
            <CardContent className="px-[14px] my-[14px] mx-0 py-[27px]">
              {transcriptEntries.length > 0 ? <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transcriptEntries.map((entry, index) => <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
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
                    </div>)}
                </div> : <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    Transcriptul va apărea aici după procesare
                  </p>
                  <p className="text-xs text-gray-400">
                    Poți testa cu demo-ul din dreapta sus
                  </p>
                </div>}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Formate Suportate</h3>
                <p className="text-sm text-gray-600">MP3, WAV, M4A, OGG</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mărime Maximă</h3>
                <p className="text-sm text-gray-600">25 MB per fișier</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Calitate</h3>
                <p className="text-sm text-gray-600">ElevenLabs Scribe v1</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Processing</h3>
                <p className="text-sm text-gray-600">GPT-4o Speaker Detection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>;
};
export default Transcript;