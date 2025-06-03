
import React, { useState, useEffect } from 'react';
import { Phone, Play, Pause, Volume2, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HamburgerMenu from '@/components/HamburgerMenu';

const Calls = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callAnimation, setCallAnimation] = useState(false);
  const [soundWaves, setSoundWaves] = useState([1, 0.8, 1.2, 0.6, 1.4, 0.9, 1.1]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setSoundWaves(prev => prev.map(() => Math.random() * 1.5 + 0.3));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const startCall = () => {
    setIsCallActive(true);
    setCallAnimation(true);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallAnimation(false);
    setSoundWaves([1, 0.8, 1.2, 0.6, 1.4, 0.9, 1.1]);
  };

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Telefonie Inteligentă
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Demonstrația live a agentului nostru AI în acțiune. Vezi cum funcționează tehnologia noastră avansată.
          </p>
        </div>

        {/* Demo Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">
                Demonstrație Live Agent AI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Agent Avatar with Animation */}
              <div className="flex justify-center mb-8">
                <div className={`relative ${callAnimation ? 'animate-pulse' : ''}`}>
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  
                  {/* Sound Waves Animation */}
                  {isCallActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex space-x-1">
                        {soundWaves.map((height, index) => (
                          <div
                            key={index}
                            className="w-1 bg-blue-400 rounded-full transition-all duration-200"
                            style={{
                              height: `${height * 40}px`,
                              transform: `translateY(${(1 - height) * 20}px)`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Status */}
              <div className="text-center mb-8">
                {isCallActive ? (
                  <div>
                    <div className="text-green-500 text-lg font-semibold mb-2 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 mr-2" />
                      Apel în desfășurare...
                    </div>
                    <p className="text-gray-400">
                      Agentul AI vorbește acum cu clientul despre serviciile noastre.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-lg font-semibold mb-2">
                      Agent AI pregătit
                    </div>
                    <p className="text-gray-400">
                      Apasă pentru a începe o demonstrație de apel.
                    </p>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                {!isCallActive ? (
                  <Button
                    onClick={startCall}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Începe Apelul Demo
                  </Button>
                ) : (
                  <Button
                    onClick={endCall}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Închide Apelul
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Call Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Apeluri de Vânzări</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-green-500 font-semibold mb-2">Scenariul 1: Prospectare</div>
                    <p className="text-gray-300 text-sm">
                      "Bună ziua! Sunt Ana de la compania XYZ. V-am sunat pentru a vă prezenta noua noastră soluție care vă poate reduce costurile cu 30%..."
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-blue-500 font-semibold mb-2">Scenariul 2: Follow-up</div>
                    <p className="text-gray-300 text-sm">
                      "Îmi amintesc că v-am trimis o ofertă săptămâna trecută. Ați avut timp să o analizați? Aș dori să discutăm despre beneficiile pentru compania dumneavoastră..."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Suport Clienți</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-purple-500 font-semibold mb-2">Scenariul 1: Asistență Tehnică</div>
                    <p className="text-gray-300 text-sm">
                      "Înțeleg că întâmpinați probleme cu aplicația. Vă voi ghida pas cu pas pentru a rezolva această situație rapid și eficient..."
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-orange-500 font-semibold mb-2">Scenariul 2: Informații Comandă</div>
                    <p className="text-gray-300 text-sm">
                      "Comanda dumneavoastră #12345 a fost expediată ieri și va ajunge în 2-3 zile lucrătoare. Puteți urmări progresul în timp real..."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Caracteristici Tehnice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Volume2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Voce Naturală</h3>
                  <p className="text-gray-400 text-sm">
                    Tehnologie avansată de sinteză vocală pentru conversații naturale
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Răspuns Instant</h3>
                  <p className="text-gray-400 text-sm">
                    Timp de răspuns sub 200ms pentru conversații fluide
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">AI Inteligent</h3>
                  <p className="text-gray-400 text-sm">
                    Înțelegere contextuală și adaptare în timp real
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Bot = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a7 7 0 0 1-7 7H8a7 7 0 0 1-7-7v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM8 9a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H8zm2 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

export default Calls;
