
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Volume2, Play, Pause, Upload, Download, MoreHorizontal, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserAgents } from '@/hooks/useUserAgents';

const Voices = () => {
  const { user } = useAuth();
  const { data: userAgents, isLoading } = useUserAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Get unique voices used by user's agents
  const userVoices = userAgents?.reduce((voices, agent) => {
    if (agent.voice_id && !voices.find(v => v.voice_id === agent.voice_id)) {
      voices.push({
        voice_id: agent.voice_id,
        name: `Voice pentru ${agent.name}`,
        description: `Voce folosită de agentul ${agent.name}`,
        language: 'Română',
        gender: 'Neutru',
        agent_count: userAgents.filter(a => a.voice_id === agent.voice_id).length,
        created_at: agent.created_at
      });
    }
    return voices;
  }, [] as any[]) || [];

  const filteredVoices = userVoices.filter(voice => 
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayVoice = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voiceId);
      // Simulate playing for 3 seconds
      setTimeout(() => setPlayingVoice(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Se încarcă vocile...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Biblioteca de Voci</h1>
            <p className="text-muted-foreground">Gestionează vocile pentru agenții tăi AI</p>
          </div>
          <Button className="glass-button">
            <Upload className="w-4 h-4 mr-2" />
            Încarcă Voce Nouă
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Caută voci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-input"
          />
        </div>

        {/* Voice Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Voci</p>
                  <p className="text-2xl font-bold text-foreground">{userVoices.length}</p>
                </div>
                <Volume2 className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Voci Active</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userVoices.filter(voice => voice.agent_count > 0).length}
                  </p>
                </div>
                <Play className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Limbi Disponibile</p>
                  <p className="text-2xl font-bold text-foreground">1</p>
                </div>
                <Badge variant="secondary">RO</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calitate</p>
                  <p className="text-2xl font-bold text-foreground">HD</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVoices.length > 0 ? (
            filteredVoices.map((voice) => (
              <Card key={voice.voice_id} className="liquid-glass hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground text-lg">{voice.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{voice.language}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {voice.agent_count} agent{voice.agent_count !== 1 ? 'i' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {voice.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gen:</span>
                      <span className="text-foreground">{voice.gender}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Voice ID:</span>
                      <span className="text-foreground font-mono text-xs">
                        {voice.voice_id.substring(0, 8)}...
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 glass-button" 
                        onClick={() => handlePlayVoice(voice.voice_id)}
                      >
                        {playingVoice === voice.voice_id ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Se redă...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Testează
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="glass-button border-border">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="liquid-glass border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {searchQuery ? 'Nu s-au găsit voci' : 'Nu ai încă voci configurate'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 
                        `Nu există voci care să corespundă căutării "${searchQuery}"` : 
                        'Vocile vor apărea automat când creezi agenți cu voci personalizate'
                      }
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button className="glass-button">
                      Creează primul agent
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Voices;
