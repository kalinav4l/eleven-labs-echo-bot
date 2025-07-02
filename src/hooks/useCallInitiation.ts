
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Definim tipurile pentru o mai bună organizare
interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface CallStatus {
  status: 'în așteptare' | 'se apelează' | 'în conversație' | 'finalizat' | 'eșuat' | 'nu a răspuns';
  message: string;
}

// Funcție ajutătoare pentru a crea o pauză
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCallInitiation = () => {
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [callStatuses, setCallStatuses] = useState<Record<string, CallStatus>>({});
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [currentCallStatus, setCurrentCallStatus] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);

  /**
   * Actualizează statusul pentru un contact specific.
   * Acesta va fi afișat în interfața utilizatorului.
   */
  const updateContactStatus = (contactId: string, status: CallStatus['status'], message: string = '') => {
    setCallStatuses(prev => ({
      ...prev,
      [contactId]: { status, message },
    }));
  };

  /**
   * Monitorizează conversațiile unui agent pentru a detecta apeluri noi
   */
  const monitorAgentConversations = async (agentId: string, existingConversationIds: Set<string>) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-agent-conversations', {
        body: { agentId },
      });

      if (error) {
        console.error('Eroare la monitorizarea conversațiilor:', error);
        return [];
      }

      // Filtrează doar conversațiile noi (care nu sunt în set)
      const newConversations = data?.conversations?.filter(
        (conv: any) => !existingConversationIds.has(conv.conversation_id)
      ) || [];

      return newConversations;
    } catch (error) {
      console.error('Eroare la monitorizarea conversațiilor:', error);
      return [];
    }
  };

  /**
   * Inițiază un singur apel și monitorizează pentru conversații noi
   */
  const initiateAndMonitorSingleCall = async (contact: Contact, agentId: string) => {
    updateContactStatus(contact.id, 'se apelează', 'Se inițiază apelul...');
    setCurrentContact(contact);
    setCurrentCallStatus('Se inițiază apelul...');

    try {
      // Pas 1: Obține lista conversațiilor existente înainte de apel
      const { data: existingData } = await supabase.functions.invoke('get-agent-conversations', {
        body: { agentId },
      });
      const existingConversationIds = new Set(
        existingData?.conversations?.map((conv: any) => conv.conversation_id) || []
      );

      // Pas 2: Inițiază apelul
      const { data: initiationData, error: initiationError } = await supabase.functions.invoke('initiate-call', {
        body: { agentId, phoneNumber: contact.phone, contactName: contact.name },
      });

      if (initiationError) {
        throw new Error(initiationError?.message || "Nu s-a putut inițializa apelul.");
      }

      updateContactStatus(contact.id, 'în conversație', 'Apel inițiat. Monitorizează conversații...');
      setCurrentCallStatus('Apel inițiat. Monitorizează conversații...');

      // Pas 3: Așteaptă 30 secunde apoi începe monitorizarea
      await sleep(30000);

      // Pas 4: Monitorizează pentru conversații noi timp de maxim 2 minute
      const maxMonitoringTime = 120000; // 2 minute
      const checkInterval = 10000; // 10 secunde
      const startTime = Date.now();
      let foundNewConversations = false;

      while (Date.now() - startTime < maxMonitoringTime && !foundNewConversations) {
        const newConversations = await monitorAgentConversations(agentId, existingConversationIds);
        
        if (newConversations.length > 0) {
          foundNewConversations = true;
          updateContactStatus(contact.id, 'în conversație', `Găsite ${newConversations.length} conversații noi. Salvez...`);
          setCurrentCallStatus(`Găsite ${newConversations.length} conversații noi. Salvez...`);

          // Salvează toate conversațiile noi
          for (const conversation of newConversations) {
            await supabase.functions.invoke('save-call-history', {
              body: { conversationId: conversation.conversation_id },
            });
          }

          updateContactStatus(contact.id, 'finalizat', 'Apel terminat și salvat în istoric.');
          setCurrentCallStatus('Apel terminat și salvat în istoric.');
          break;
        }

        // Așteaptă înainte de următoarea verificare
        await sleep(checkInterval);
        updateContactStatus(contact.id, 'în conversație', 'Verifică conversații noi...');
        setCurrentCallStatus('Verifică conversații noi...');
      }

      // Dacă nu s-au găsit conversații noi în timpul alocat
      if (!foundNewConversations) {
        updateContactStatus(contact.id, 'nu a răspuns', 'Nu s-au detectat conversații noi în timpul alocat.');
        setCurrentCallStatus('Nu s-au detectat conversații noi în timpul alocat.');
      }

    } catch (error: any) {
      console.error(`Eroare la procesarea apelului pentru ${contact.name}:`, error);
      updateContactStatus(contact.id, 'eșuat', error.message || "O eroare necunoscută a avut loc.");
      setCurrentCallStatus(`Eroare: ${error.message}`);
      toast({
        title: `Eroare la apelul către ${contact.name}`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCurrentContact(null);
    }
  };

  /**
   * Funcția principală care orchestrează procesarea secvențială a apelurilor batch.
   */
  const processBatchCalls = async (contacts: Contact[], agentId: string) => {
    setIsProcessingBatch(true);
    setTotalCalls(contacts.length);
    setCurrentProgress(0);
    setCurrentCallStatus('Începe procesarea batch...');

    // Inițializează statusurile pentru toate contactele ca 'în așteptare'
    const initialStatuses: Record<string, CallStatus> = {};
    contacts.forEach(c => {
      initialStatuses[c.id] = { status: 'în așteptare', message: '' };
    });
    setCallStatuses(initialStatuses);
    
    // Utilizează o buclă for...of pentru a procesa contactele secvențial (unul după altul)
    for (const [index, contact] of contacts.entries()) {
      setCurrentProgress(index + 1);
      
      // Așteaptă finalizarea completă a apelului curent înainte de a trece la următorul
      await initiateAndMonitorSingleCall(contact, agentId);
    }
    
    setIsProcessingBatch(false);
    setCurrentCallStatus('Procesare finalizată');
    toast({
      title: "Procesare Finalizată",
      description: "Toate apelurile din listă au fost procesate.",
    });
  };

  /**
   * Funcție pentru apeluri individuale
   */
  const initiateCall = async (agentId: string, phoneNumber: string, contactName: string = '') => {
    setIsInitiating(true);
    
    const contact: Contact = {
      id: `single-${Date.now()}`,
      name: contactName || 'Contact Individual',
      phone: phoneNumber
    };

    await initiateAndMonitorSingleCall(contact, agentId);
    setIsInitiating(false);
  };

  return {
    isProcessingBatch,
    currentProgress,
    totalCalls,
    callStatuses,
    currentContact,
    currentCallStatus,
    processBatchCalls,
    initiateCall,
    isInitiating
  };
};
