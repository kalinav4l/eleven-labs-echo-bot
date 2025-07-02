
import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Play, Pause, Download, Search, Clock, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTranscripts } from '@/hooks/useTranscripts';
import { toast } from '@/components/ui/use-toast';

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
  time: number;
}

const Transcript = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { savedTranscripts, isLoading, saveTranscript, deleteTranscript } = useTranscripts();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Error",
        description: "Please select an audio file.",
        variant: "destructive"
      });
      return;
    }

    // Show loading toast
    const loadingToast = toast({
      title: "Processing",
      description: "Transcribing your audio file...",
    });

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      
      // Mock transcript entries for demo
      const mockEntries: TranscriptEntry[] = [
        { speaker: "Speaker 1", text: "Hello, welcome to our meeting today.", timestamp: "0:00", time: 0 },
        { speaker: "Speaker 2", text: "Thank you for having me. I'm excited to discuss the project.", timestamp: "0:05", time: 5 },
        { speaker: "Speaker 1", text: "Let's start with the main objectives.", timestamp: "0:12", time: 12 },
      ];

      await saveTranscript({
        title: file.name.replace(/\.[^/.]+$/, ""),
        transcript_entries: mockEntries,
        duration_seconds: 180,
        file_size_mb: file.size / (1024 * 1024),
        original_filename: file.name
      });

      toast({
        title: "Success",
        description: "Audio transcribed successfully!",
      });

    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredTranscripts = savedTranscripts.filter(transcript =>
    transcript.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTranscript = (transcript: any) => {
    setSelectedTranscript(transcript);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading transcripts...</p>
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
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">Transcripts</h1>
                  <p className="text-gray-600 text-sm">Upload and manage your audio transcriptions</p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-8 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search transcripts..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200" 
                />
              </div>

              {/* Transcripts List */}
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
                            <span>{new Date(transcript.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewTranscript(transcript)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredTranscripts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transcripts yet</h3>
                    <p className="text-gray-600 mb-6 text-center max-w-md mx-auto">
                      Upload your first audio file to get started with automatic transcription.
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
                    ← Back to transcripts
                  </Button>
                  <h1 className="text-2xl font-semibold text-gray-900">{selectedTranscript.title}</h1>
                </div>
              </div>

              <div className="space-y-4">
                {Array.isArray(selectedTranscript.transcript_entries) && 
                  selectedTranscript.transcript_entries.map((entry: TranscriptEntry, index: number) => (
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
