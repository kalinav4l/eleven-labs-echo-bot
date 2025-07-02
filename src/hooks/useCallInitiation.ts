import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Asigură-te că ai configurat clientul Supabase
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
   * Inițiază un singur apel, îl monitorizează până la finalizare și salvează datele.
   * Aceasta este funcția cheie care rulează pentru fiecare contact din buclă.
   */
  const initiateAndMonitorSingleCall = async (contact: Contact, agentId: string) => {
    updateContactStatus(contact.id, 'se apelează', 'Se inițiază apelul...');

    try {
      // Pas 1: Inițiază apelul și obține conversation_id
      const { data: initiationData, error: initiationError } = await supabase.functions.invoke('initiate-call', {
        body: { agentId, phoneNumber: contact.phone, contactName: contact.name },
      });

      if (initiationError || !initiationData?.conversationId) {
        throw new Error(initiationError?.message || "Nu s-a putut obține ID-ul conversației.");
      }

      const { conversationId } = initiationData;
      updateContactStatus(contact.id, 'în conversație', `Apel în curs... (ID: ${conversationId.slice(-4)})`);

      // Pas 2: Monitorizează statusul într-o buclă până la finalizare
      let isCallActive = true;
      while (isCallActive) {
        await sleep(5000); // Așteaptă 5 secunde între verificări

        const { data: statusData, error: statusError } = await supabase.functions.invoke('get-conversation-details', {
          body: { conversationId },
        });
        
        if (statusError) {
          // Dacă primim eroare la verificare, considerăm apelul încheiat pentru a nu bloca procesul
          isCallActive = false;
          updateContactStatus(contact.id, 'eșuat', 'Eroare la verificarea statusului.');
          continue; // Treci la pasul de salvare
        }

        const terminalStatuses = ['done', 'completed', 'failed', 'rejected', 'no_answer', 'cancelled'];
        if (terminalStatuses.includes(statusData?.status)) {
          isCallActive = false; // Oprește bucla de monitorizare
        }
      }

      // Pas 3: Salvează informațiile complete în istoric (backend)
      // Funcția edge `save-call-history` ar trebui să preia toate detaliile de la ElevenLabs
      // și să le salveze în tabelele `call_history` și `analytics`.
      await supabase.functions.invoke('save-call-history', {
        body: { conversationId },
      });

      updateContactStatus(contact.id, 'finalizat', 'Apel terminat și salvat în istoric.');

    } catch (error: any) {
      console.error(`Eroare la procesarea apelului pentru ${contact.name}:`, error);
      updateContactStatus(contact.id, 'eșuat', error.message || "O eroare necunoscută a avut loc.");
      toast({
        title: `Eroare la apelul către ${contact.name}`,
        description: error.message,
        variant: 'destructive',
      });
    }
  };


  /**
   * Funcția principală care orchestrează procesarea secvențială a apelurilor batch.
   */
  const processBatchCalls = async (contacts: Contact[], agentId: string) => {
    setIsProcessingBatch(true);
    setTotalCalls(contacts.length);
    setCurrentProgress(0);

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
    toast({
      title: "Procesare Finalizată",
      description: "Toate apelurile din listă au fost procesate.",
    });
  };

  return {
    isProcessingBatch,
    currentProgress,
    totalCalls,
    callStatuses,
    processBatchCalls,
    // Poți adăuga aici și logica pentru apelul individual dacă e necesar
  };
};