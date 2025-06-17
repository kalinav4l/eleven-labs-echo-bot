
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, User, Clock, DollarSign, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallHistory } from '@/hooks/useCallHistory';

const CallDetails = () => {
  const { callId } = useParams<{ callId: string }>();
  const { user } = useAuth();
  const { callHistory } = useCallHistory();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const call = callHistory.find(c => c.id === callId);

  if (!call) {
    return (
      <DashboardLayout>
        <div className="p-6 my-[60px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Apel nu a fost găsit</h1>
            <Button onClick={() => window.close()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Închide
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const extractFullDialogFromJson = (dialogJson: string): string => {
    try {
      const parsed = JSON.parse(dialogJson);
      const cleanConversations = parsed?.clean_conversations;
      const dialog = cleanConversations?.dialog || [];
      
      if (Array.isArray(dialog) && dialog.length > 0) {
        return dialog.map((item: any, index: number) => 
          `${index + 1}. ${item.speaker || 'Unknown'}: ${item.message || 'No message'}`
        ).join('\n\n');
      }
      return 'Nu există dialog disponibil';
    } catch (error) {
      console.error('Error parsing dialog JSON:', error);
      return 'Eroare la parsarea dialogului';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'busy':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'no-answer':
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Succes';
      case 'failed':
        return 'Eșuat';
      case 'busy':
        return 'Ocupat';
      case 'no-answer':
        return 'Nu răspunde';
      default:
        return 'Necunoscut';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 my-[60px]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => window.close()} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Închide
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Detalii Apel</h1>
            <p className="text-muted-foreground">Informații complete despre apelul selectat</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Call Information */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-accent" />
                Informații Apel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(call.call_status)}
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">{getStatusText(call.call_status)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{call.contact_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-medium">Număr Telefon</p>
                  <p className="text-sm text-muted-foreground font-mono">{call.phone_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-medium">Data Apel</p>
                  <p className="text-sm text-muted-foreground">{call.call_date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-medium">Cost</p>
                  <p className="text-sm text-muted-foreground font-mono">${call.cost_usd}</p>
                </div>
              </div>

              {call.language && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-accent" />
                  <div>
                    <p className="font-medium">Limbă</p>
                    <p className="text-sm text-muted-foreground">{call.language}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-accent" />
                Rezumat Apel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {call.summary || 'Nu există rezumat disponibil pentru acest apel.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Dialog */}
        <Card className="liquid-glass mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-accent" />
              Dialog Complet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {extractFullDialogFromJson(call.dialog_json)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Raw Data (for debugging) */}
        {call.dialog_json && (
          <Card className="liquid-glass mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-accent" />
                Date JSON Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(JSON.parse(call.dialog_json), null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CallDetails;
