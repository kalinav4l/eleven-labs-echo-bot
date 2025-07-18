import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface RedialConfig {
  maxAttempts: number;
  delayBetweenAttempts: number; // in seconds
  enabled: boolean;
  onlyFailedCalls: boolean;
  priorityNumbers: string[];
}

interface RedialContact {
  id: string;
  name: string;
  phone: string;
  agentId: string;
  attempts: number;
  lastAttempt?: Date;
  status: 'pending' | 'calling' | 'success' | 'failed' | 'max_attempts';
  originalCallId?: string;
}

interface UseAutoRedialReturn {
  isRedialActive: boolean;
  redialQueue: RedialContact[];
  config: RedialConfig;
  updateConfig: (newConfig: Partial<RedialConfig>) => void;
  addToRedialQueue: (contact: RedialContact) => void;
  removeFromQueue: (contactId: string) => void;
  startAutoRedial: () => void;
  stopAutoRedial: () => void;
  pauseAutoRedial: () => void;
  resumeAutoRedial: () => void;
  isPaused: boolean;
  currentContact: RedialContact | null;
  stats: {
    totalQueued: number;
    totalCompleted: number;
    totalFailed: number;
    successRate: number;
  };
}

export const useAutoRedial = (): UseAutoRedialReturn => {
  const { user } = useAuth();
  const [isRedialActive, setIsRedialActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [redialQueue, setRedialQueue] = useState<RedialContact[]>([]);
  const [currentContact, setCurrentContact] = useState<RedialContact | null>(null);
  const [stats, setStats] = useState({
    totalQueued: 0,
    totalCompleted: 0,
    totalFailed: 0,
    successRate: 0
  });
  
  const [config, setConfig] = useState<RedialConfig>({
    maxAttempts: 3,
    delayBetweenAttempts: 300, // 5 minutes
    enabled: true,
    onlyFailedCalls: true,
    priorityNumbers: []
  });

  const redialIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('autoRedialConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Error loading redial config:', error);
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('autoRedialConfig', JSON.stringify(config));
  }, [config]);

  // Update stats when queue changes
  useEffect(() => {
    const totalQueued = redialQueue.length;
    const totalCompleted = redialQueue.filter(c => c.status === 'success').length;
    const totalFailed = redialQueue.filter(c => c.status === 'failed' || c.status === 'max_attempts').length;
    const successRate = totalQueued > 0 ? (totalCompleted / totalQueued) * 100 : 0;

    setStats({
      totalQueued,
      totalCompleted,
      totalFailed,
      successRate
    });
  }, [redialQueue]);

  const updateConfig = useCallback((newConfig: Partial<RedialConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const addToRedialQueue = useCallback((contact: RedialContact) => {
    if (!config.enabled) return;

    setRedialQueue(prev => {
      // Check if contact already exists
      const existingIndex = prev.findIndex(c => c.phone === contact.phone && c.agentId === contact.agentId);
      
      if (existingIndex !== -1) {
        // Update existing contact
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          attempts: 0, // Reset attempts for new addition
          status: 'pending',
          lastAttempt: undefined
        };
        return updated;
      } else {
        // Add new contact
        return [...prev, { ...contact, attempts: 0, status: 'pending' }];
      }
    });

    toast({
      title: "Contact adăugat în coadă",
      description: `${contact.name} a fost adăugat pentru re-apelare automată`,
    });
  }, [config.enabled]);

  const removeFromQueue = useCallback((contactId: string) => {
    setRedialQueue(prev => prev.filter(c => c.id !== contactId));
  }, []);

  const initiateCall = async (contact: RedialContact): Promise<boolean> => {
    try {
      console.log(`🔄 Initiating redial for ${contact.name} (attempt ${contact.attempts + 1})`);
      
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: contact.agentId,
          phone_number: contact.phone,
          contact_name: contact.name,
          user_id: user?.id,
          redial_attempt: contact.attempts + 1
        }
      });

      if (error || !data?.success) {
        console.error(`❌ Redial failed for ${contact.name}:`, error || data?.error);
        return false;
      }

      console.log(`✅ Redial initiated successfully for ${contact.name}`);
      
      // Save redial attempt to database
      await supabase.from('call_history').insert({
        user_id: user?.id,
        phone_number: contact.phone,
        contact_name: contact.name,
        call_status: 'pending',
        summary: `Redial attempt ${contact.attempts + 1}`,
        agent_id: contact.agentId,
        call_date: new Date().toISOString(),
        dialog_json: JSON.stringify({
          redial_attempt: contact.attempts + 1,
          original_call_id: contact.originalCallId,
          auto_redial: true
        })
      });

      return true;
    } catch (error) {
      console.error(`💥 Exception during redial for ${contact.name}:`, error);
      return false;
    }
  };

  const processRedialQueue = useCallback(async () => {
    if (isProcessingRef.current || isPaused || !config.enabled) {
      return;
    }

    isProcessingRef.current = true;

    try {
      const pendingContacts = redialQueue
        .filter(c => c.status === 'pending' && c.attempts < config.maxAttempts)
        .sort((a, b) => {
          // Priority: priority numbers first, then by attempts (fewer attempts first)
          const aIsPriority = config.priorityNumbers.includes(a.phone);
          const bIsPriority = config.priorityNumbers.includes(b.phone);
          
          if (aIsPriority && !bIsPriority) return -1;
          if (!aIsPriority && bIsPriority) return 1;
          
          return a.attempts - b.attempts;
        });

      if (pendingContacts.length === 0) {
        setIsRedialActive(false);
        setCurrentContact(null);
        return;
      }

      for (const contact of pendingContacts) {
        if (isPaused || !isRedialActive) break;

        // Check if enough time has passed since last attempt
        if (contact.lastAttempt) {
          const timeSinceLastAttempt = (Date.now() - contact.lastAttempt.getTime()) / 1000;
          if (timeSinceLastAttempt < config.delayBetweenAttempts) {
            continue; // Skip this contact for now
          }
        }

        setCurrentContact(contact);

        // Update contact status to 'calling'
        setRedialQueue(prev => prev.map(c => 
          c.id === contact.id 
            ? { ...c, status: 'calling', lastAttempt: new Date() }
            : c
        ));

        const success = await initiateCall(contact);
        
        // Update contact based on result
        setRedialQueue(prev => prev.map(c => {
          if (c.id === contact.id) {
            const newAttempts = c.attempts + 1;
            const maxReached = newAttempts >= config.maxAttempts;
            
            return {
              ...c,
              attempts: newAttempts,
              status: success ? 'success' : (maxReached ? 'max_attempts' : 'pending'),
              lastAttempt: new Date()
            };
          }
          return c;
        }));

        if (success) {
          toast({
            title: "Re-apelare reușită",
            description: `Apelul către ${contact.name} a fost inițiat cu succes`,
          });
        } else {
          const newAttempts = contact.attempts + 1;
          if (newAttempts >= config.maxAttempts) {
            toast({
              title: "Re-apelare eșuată",
              description: `${contact.name} - numărul maxim de încercări (${config.maxAttempts}) a fost atins`,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Încercare eșuată",
              description: `${contact.name} - va fi încercat din nou în ${Math.round(config.delayBetweenAttempts / 60)} minute`,
              variant: "destructive"
            });
          }
        }

        // Wait before processing next contact (to avoid overwhelming the system)
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error processing redial queue:', error);
    } finally {
      isProcessingRef.current = false;
      setCurrentContact(null);
    }
  }, [redialQueue, config, isPaused, isRedialActive, user?.id]);

  const startAutoRedial = useCallback(() => {
    if (!config.enabled) {
      toast({
        title: "Re-apelare dezactivată",
        description: "Activează sistemul de re-apelare din setări",
        variant: "destructive"
      });
      return;
    }

    setIsRedialActive(true);
    setIsPaused(false);
    
    // Start processing immediately
    processRedialQueue();
    
    // Set up interval for continuous processing
    redialIntervalRef.current = setInterval(() => {
      processRedialQueue();
    }, 30000); // Check every 30 seconds

    toast({
      title: "Re-apelare automată activată",
      description: `Procesarea va începe cu o întârziere de ${Math.round(config.delayBetweenAttempts / 60)} minute între încercări`,
    });
  }, [config.enabled, config.delayBetweenAttempts, processRedialQueue]);

  const stopAutoRedial = useCallback(() => {
    setIsRedialActive(false);
    setIsPaused(false);
    setCurrentContact(null);
    
    if (redialIntervalRef.current) {
      clearInterval(redialIntervalRef.current);
      redialIntervalRef.current = null;
    }

    toast({
      title: "Re-apelare oprită",
      description: "Sistemul de re-apelare automată a fost oprit",
    });
  }, []);

  const pauseAutoRedial = useCallback(() => {
    setIsPaused(true);
    toast({
      title: "Re-apelare în pauză",
      description: "Sistemul de re-apelare a fost pus în pauză",
    });
  }, []);

  const resumeAutoRedial = useCallback(() => {
    setIsPaused(false);
    toast({
      title: "Re-apelare reluată",
      description: "Sistemul de re-apelare a fost reluat",
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redialIntervalRef.current) {
        clearInterval(redialIntervalRef.current);
      }
    };
  }, []);

  return {
    isRedialActive,
    redialQueue,
    config,
    updateConfig,
    addToRedialQueue,
    removeFromQueue,
    startAutoRedial,
    stopAutoRedial,
    pauseAutoRedial,
    resumeAutoRedial,
    isPaused,
    currentContact,
    stats
  };
};