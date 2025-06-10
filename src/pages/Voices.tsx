
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Play, Volume2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

interface Voice {
  voice_id: string;
  name: string;
  samples: any[];
  category: string;
  fine_tuning: {
    is_allowed_to_fine_tune: boolean;
    state: any;
    verification_failures: any[];
    verification_attempts_count: number;
    manual_verification_requested: boolean;
  };
  labels: { [key: string]: string };
  description: string;
  preview_url: string;
  available_for_tiers: any[];
  settings: any;
  sharing: any;
  high_quality_base_model_ids: string[];
  safety_control: any;
  voice_verification: {
    requires_verification: boolean;
    is_verified: boolean;
    verification_failures: any[];
    verification_attempts_count: number;
    language: any;
    manual_verification_requested: boolean;
  };
  owner_id: string;
  permission_on_resource: any;
}

const Voices = () => {
  const { user } = useAuth();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch("https://api.elevenlabs.io/v2/voices", {
        method: "GET",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.json();
      console.log(body);
      setVoices(body.voices || []);
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut încărca vocile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const playVoice = (previewUrl: string, voiceName: string) => {
    if (previewUrl) {
      const audio = new Audio(previewUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Eroare",
          description: "Nu am putut reda preview-ul vocal.",
          variant: "destructive"
        });
      });
      
      toast({
        title: "Se redă",
        description: `Preview pentru vocea "${voiceName}"`
      });
    } else {
      toast({
        title: "Eroare",
        description: "Nu există preview disponibil pentru această voce.",
        variant: "destructive"
      });
    }
  };

  const filteredVoices = voices.filter(voice =>
    voice.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Voices</h1>
            <p className="text-gray-600">Browse and preview available ElevenLabs voices</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search voices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        {/* Voices Table */}
        <div className="border border-gray-200 rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-gray-700 font-medium">Name</TableHead>
                <TableHead className="text-gray-700 font-medium">Category</TableHead>
                <TableHead className="text-gray-700 font-medium">Description</TableHead>
                <TableHead className="text-gray-700 font-medium">Verified</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoices.map((voice) => (
                <TableRow key={voice.voice_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell className="font-medium text-black">{voice.name}</TableCell>
                  <TableCell className="text-gray-600">{voice.category || 'General'}</TableCell>
                  <TableCell className="text-gray-600">
                    {voice.description || 'No description available'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {voice.voice_verification?.is_verified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-gray-400">Not verified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playVoice(voice.preview_url, voice.name)}
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Play Preview"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVoices.length === 0 && !loading && (
            <div className="p-8 text-center">
              <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No voices found</p>
            </div>
          )}
        </div>

        {/* Voice Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredVoices.length} of {voices.length} voices
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Voices;
