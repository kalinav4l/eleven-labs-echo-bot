import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileAudio, MessageSquare, User, Bot, Loader2, Play, Save, Eye, Clock, History } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranscripts } from '@/hooks/useTranscripts';

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
  const [rawTranscriptText, setRawTranscriptText] = useState<string>('');
  const [viewingTranscript, setViewingTranscript] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { data: savedTranscripts, saveTranscript, isSaving, exportToSRT, exportToTXT, exportToJSON } = useTranscripts();

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
    
    setRawTranscriptText(rawText);
    
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

  const handleSaveTranscript = () => {
    if (transcriptEntries.length === 0) {
      toast({
        title: "Eroare",
        description: "Nu există transcript pentru salvare.",
        variant: "destructive"
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = (data: any) => {
    saveTranscript(data);
    setShowSaveDialog(false);
  };

  const handleLoadTranscript = (entries: TranscriptEntry[]) => {
    setTranscriptEntries(entries);
    setAudioFile(null);
    setAudioUrl('');
    setRawTranscriptText('');
    toast({
      title: "Transcript încărcat",
      description: "Transcriptul a fost încărcat cu succes.",
    });
  };

  const mockTranscripts = [
    {
      id: 1,
      title: "Transcript 25.06.2025",
      filename: "ElevenLabs_2025-06-17T11_19_31_Dicaprio_ivc_sp100_s50_sb75_se0_b_e2.mp3",
      date: "25 Jun. 2025, 16:06",
      duration: "0:37",
      replies: 10,
      entries: [
        { speaker: "Agent AI", text: "Hello! How can I help you today?", timestamp: "0:00", startTime: 0, endTime: 5 },
        { speaker: "User", text: "I need help with my account", timestamp: "0:05", startTime: 5, endTime: 10 },
        { speaker: "Agent AI", text: "I'd be happy to help you with your account. What specific issue are you experiencing?", timestamp: "0:10", startTime: 10, endTime: 15 }
      ]
    },
    {
      id: 2,
      title: "Transcript 25.06.2025",
      filename: "ElevenLabs_2025-06-17T11_19_31_Dicaprio_ivc_sp100_s50_sb75_se0_b_e2.mp3",
      date: "25 Jun. 2025, 16:05",
      duration: "0:37",
      replies: 11,
      entries: [
        { speaker: "Agent AI", text: "Welcome! I'm here to assist you.", timestamp: "0:00", startTime: 0, endTime: 5 },
        { speaker: "User", text: "Can you explain your pricing?", timestamp: "0:05", startTime: 5, endTime: 10 }
      ]
    }
  ];

  if (viewingTranscript) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingTranscript(null)}
                  className="text-gray-600 hover:text-gray-900 p-2"
                >
                  ←
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    {viewingTranscript.title}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    📁 {viewingTranscript.filename}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-6 mb-8 text-sm text-gray-600">
              <div className="flex items-center">
                📅 {viewingTranscript.date}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {viewingTranscript.duration}
              </div>
              <div>
                {viewingTranscript.replies} replies
              </div>
            </div>

            {/* Transcript Content */}
            <div className="space-y-6">
              {viewingTranscript.entries.map((entry, index) => (
                <div key={index} className="flex space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    entry.speaker === 'Agent AI' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {entry.speaker === 'Agent AI' ? 'A' : 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{entry.speaker}</span>
                      <span className="text-xs text-gray-500">{entry.timestamp}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Audio Transcript</h1>
              <p className="text-gray-600 text-sm">Generate and structure dialogues from audio files</p>
            </div>
            <Button 
              onClick={() => {/* demo handler */}} 
              variant="outline" 
              className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Audio</h3>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors mb-6">
                <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" id="audio-upload" />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('audio-upload')?.click()}
                  className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  Select File
                </Button>
              </div>

              {audioFile && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <FileAudio className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{audioFile.name}</p>
                      <p className="text-xs text-gray-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {audioUrl && (
                    <audio controls className="w-full mt-3" src={audioUrl}>
                      Your browser does not support audio playback.
                    </audio>
                  )}
                </div>
              )}
              
              <Button 
                onClick={handleGenerateTranscript} 
                disabled={!audioFile || isProcessing} 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Generate Transcript
                  </div>
                )}
              </Button>
            </div>

            {/* Dialogue Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Dialogue ({transcriptEntries.length} replies)
                </h3>
                {transcriptEntries.length > 0 && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export SRT
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto">
                {transcriptEntries.length > 0 ? (
                  <div className="space-y-4">
                    {transcriptEntries.map((entry, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                          entry.speaker.toLowerCase().includes('agent') ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.speaker.toLowerCase().includes('agent') ? 'A' : 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-xs text-gray-900">{entry.speaker}</span>
                            <span className="text-xs text-gray-500">{entry.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{entry.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Structured dialogue will appear here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcript History */}
          <div className="mt-12">
            <div className="flex items-center space-x-3 mb-6">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Transcript History (2)</h3>
            </div>

            <div className="space-y-3">
              {mockTranscripts.map((transcript) => (
                <div key={transcript.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{transcript.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">📁 {transcript.filename}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📅 {transcript.date}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {transcript.duration}
                        </span>
                        <span>{transcript.replies} replies</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingTranscript(transcript)}
                        className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transcript;
