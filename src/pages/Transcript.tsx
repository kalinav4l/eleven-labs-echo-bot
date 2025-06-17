
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileAudio, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

const Transcript = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is audio
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
      // Create a new FormData instance
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model_id", JSON.stringify("scribe_v1"));

      // Create transcript (POST /v1/speech-to-text)
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
      
      setTranscriptResult(body.text || 'Nu s-a putut genera transcriptul.');
      
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

  const handleDownloadSRT = () => {
    if (!transcriptResult) {
      toast({
        title: "Eroare",
        description: "Nu există transcript pentru export.",
        variant: "destructive"
      });
      return;
    }

    // Convert transcript to basic SRT format
    const srtContent = `1
00:00:00,000 --> 00:00:30,000
${transcriptResult}`;

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
              {/* File Input */}
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

              {/* Upload Button */}
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
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-accent" />
                Rezultat Transcript
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {transcriptResult ? (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-80 overflow-y-auto">
                    <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                      {transcriptResult}
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleDownloadSRT}
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descarcă ca SRT
                  </Button>
                </>
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
