
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useCreditTracking } from '@/hooks/useCreditTracking';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, User, LogIn } from 'lucide-react';
import WelcomeCreditsAnimation from '@/components/WelcomeCreditsAnimation';
import { supabase } from '@/integrations/supabase/client';

const VoiceAgent = () => {
  const { user } = useAuth();
  const { deductCredits, trackConversation } = useCreditTracking();
  const navigate = useNavigate();
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Check if user is new and should see welcome animation
  useEffect(() => {
    if (user) {
      checkIfNewUser();
    }
  }, [user]);

  const checkIfNewUser = async () => {
    if (!user) return;
    
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!conversations || conversations.length === 0) {
        setIsNewUser(true);
        setShowWelcomeAnimation(true);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleVoiceInteraction = async () => {
    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Te rog să te conectezi pentru a folosi asistentul vocal.",
        variant: "destructive",
      });
      return;
    }

    // Track conversation
    const conversation = await trackConversation('default-agent', 'Assistant Vocal');
    setCurrentConversation(conversation);

    // Continue with normal voice interaction logic
    console.log('Voice interaction started for authenticated user');
    
    toast({
      title: "Conversație începută",
      description: "Asistentul vocal este acum activ. Vorbește natural!",
    });
  };

  const handleConversationEnd = async (durationMinutes: number) => {
    if (user && currentConversation && durationMinutes > 0) {
      const creditsToDeduct = Math.ceil(durationMinutes * 1000); // 1000 credits per minute
      
      const success = await deductCredits(
        creditsToDeduct,
        `Convorbire vocală - ${durationMinutes} minute`,
        currentConversation.id
      );

      if (success) {
        // Update conversation with final duration and credits
        await supabase
          .from('conversations')
          .update({
            duration_minutes: durationMinutes,
            credits_used: creditsToDeduct,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversation.id);

        toast({
          title: "Conversație încheiată",
          description: `Au fost deduse ${creditsToDeduct.toLocaleString()} credite pentru ${durationMinutes} minute de convorbire.`,
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="bg-black border-gray-800 max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Autentificare Necesară
            </h2>
            <p className="text-gray-400 mb-6">
              Pentru a folosi asistentul vocal, te rog să te conectezi la contul tău. 
              Vei primi 100.000 credite gratuite la înregistrare!
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-white text-black hover:bg-gray-200 px-8 py-3"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Conectează-te
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="bg-black border-gray-800 max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Asistent Vocal AI
            </h2>
            <p className="text-gray-400">
              Începe o conversație cu asistentul nostru vocal inteligent
            </p>
          </div>

          <Button 
            onClick={handleVoiceInteraction}
            size="lg"
            className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg"
          >
            <Mic className="w-5 h-5 mr-2" />
            Începe Conversația
          </Button>

          <p className="text-gray-500 text-sm mt-4">
            1 minut = 1.000 credite
          </p>
        </CardContent>
      </Card>

      <WelcomeCreditsAnimation
        isOpen={showWelcomeAnimation}
        onClose={() => setShowWelcomeAnimation(false)}
      />
    </div>
  );
};

export { VoiceAgent };
