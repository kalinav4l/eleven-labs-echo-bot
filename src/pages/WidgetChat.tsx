
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const WidgetChat = () => {
  useEffect(() => {
    const handleChatRequest = async (event: MessageEvent) => {
      if (event.data?.type === 'BOREA_CHAT_REQUEST') {
        try {
          const { data, error } = await supabase.functions.invoke('widget-chat', {
            body: {
              message: event.data.message,
              agentId: event.data.agentId
            }
          });

          if (error) throw error;

          // Trimite răspunsul înapoi
          event.source?.postMessage({
            type: 'BOREA_CHAT_RESPONSE',
            requestId: event.data.requestId,
            response: data.response
          }, event.origin);

        } catch (error) {
          event.source?.postMessage({
            type: 'BOREA_CHAT_ERROR',
            requestId: event.data.requestId,
            error: error.message
          }, event.origin);
        }
      }
    };

    window.addEventListener('message', handleChatRequest);

    return () => {
      window.removeEventListener('message', handleChatRequest);
    };
  }, []);

  return null;
};

export default WidgetChat;
