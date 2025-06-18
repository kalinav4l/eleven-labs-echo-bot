import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Step4CallInitiation } from '../components/Step4CallInitiation';
import { useCallInitiation } from '../hooks/useCallInitiation';

interface CallInitiationModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
}

const CallInitiationModal: React.FC<CallInitiationModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     agentId,
                                                                 }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [finalAgentId, setFinalAgentId] = useState(agentId);

    useEffect(() => {
        setFinalAgentId(agentId);
    }, [agentId]);

    const { initiateCall, isInitiating } = useCallInitiation({
        customAgentId: finalAgentId,
        createdAgentId: '', // Not used in this context, but required by hook
        phoneNumber: phoneNumber,
    });

    const handleInitiatePhoneCall = async () => {
        await initiateCall(finalAgentId, phoneNumber);
        // Optionally close modal after initiating call
        // onClose();
    };

    const handleInitiateOnlineCall = () => {
        // This part needs to be implemented based on your online call logic.
        // The Step4CallInitiation component has an isOnlineCallActive prop.
        // You might need another hook or state to manage the online call.
        console.log(`Initiating online call for agent ${finalAgentId}`);
        alert('Online call initiation not yet implemented.');
        // onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                <Step4CallInitiation
                    cardTitle={"Testează Apel"}
                    showAgentId={false}
                    phoneNumber={phoneNumber}
                    setPhoneNumber={setPhoneNumber}
                    finalAgentId={finalAgentId}
                    setFinalAgentId={setFinalAgentId}
                    onInitiateCall={handleInitiatePhoneCall}
                    onInitiateOnlineCall={handleInitiateOnlineCall}
                    isInitiatingCall={isInitiating}
                    isOnlineCallActive={false} // This needs to be managed by actual online call status
                />
            </DialogContent>
        </Dialog>
    );
};

export default CallInitiationModal;


