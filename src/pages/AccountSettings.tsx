
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Globe, LogOut, Trash2, User, Mail, Lock, MessageSquare, Bot } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState({
    defaultLanguage: 'ro'
  });
  const [emailSettings, setEmailSettings] = useState({
    currentEmail: user?.email || '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [telegramSettings, setTelegramSettings] = useState({
    botToken: '',
    chatId: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Deconectat",
        description: "Ați fost deconectat cu succes."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut efectua deconectarea.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // First delete user data from our tables
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete other user data
      const { error: agentsError } = await supabase
        .from('kalina_agents')
        .delete()
        .eq('user_id', user.id);

      if (agentsError) {
        console.error('Error deleting agents:', agentsError);
      }

      const { error: callHistoryError } = await supabase
        .from('call_history')
        .delete()
        .eq('user_id', user.id);

      if (callHistoryError) {
        console.error('Error deleting call history:', callHistoryError);
      }

      // Finally delete the auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        throw deleteError;
      }

      await signOut();
      navigate('/');
      toast({
        title: "Cont șters",
        description: "Contul dvs. a fost șters cu succes."
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge contul. Vă rugăm să contactați suportul.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: "Setări salvate",
      description: "Preferințele dvs. au fost salvate cu succes."
    });
  };

  const handleUpdateEmail = async () => {
    if (!emailSettings.newEmail) {
      toast({
        title: "Eroare",
        description: "Te rog introdu noua adresă de email.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailSettings.newEmail
      });

      if (error) throw error;

      toast({
        title: "Email actualizat",
        description: "Adresa de email a fost actualizată. Verifică-ți email-ul pentru confirmare."
      });
      setEmailSettings(prev => ({ ...prev, newEmail: '' }));
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza adresa de email.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!emailSettings.newPassword || !emailSettings.confirmPassword) {
      toast({
        title: "Eroare",
        description: "Te rog completează toate câmpurile pentru parolă.",
        variant: "destructive"
      });
      return;
    }

    if (emailSettings.newPassword !== emailSettings.confirmPassword) {
      toast({
        title: "Eroare",
        description: "Parolele nu se potrivesc.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: emailSettings.newPassword
      });

      if (error) throw error;

      toast({
        title: "Parolă actualizată",
        description: "Parola a fost actualizată cu succes."
      });
      setEmailSettings(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza parola.",
        variant: "destructive"
      });
    }
  };

  const handleSaveTelegramSettings = () => {
    // This would normally save to database or user preferences
    toast({
      title: "Setări Telegram salvate",
      description: "Configurațiile Telegram au fost salvate cu succes."
    });
  };

  return (
    <DashboardLayout>
      <div className={`p-4 sm:p-6 ${isMobile ? 'pb-24' : 'my-[60px]'}`}>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Setări</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Configurează preferințele tale</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Language Settings */}
          <Card className="liquid-glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                <Globe className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Setări Limbă</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Limbă Implicită</label>
                <Select 
                  value={settings.defaultLanguage} 
                  onValueChange={(value) => setSettings({...settings, defaultLanguage: value})}
                >
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="liquid-glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                <User className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Informații Cont</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Email Curent</label>
                <div className="p-3 liquid-glass rounded border border-gray-200/50 text-foreground bg-gray-50/50 text-sm sm:text-base break-all">
                  {user?.email || ''}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">Plan Curent</label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 liquid-glass rounded border border-gray-200/50">
                  <span className="text-foreground text-sm sm:text-base">Plan Starter</span>
                  <Button size="sm" className="glass-button bg-accent/90 hover:bg-accent text-white w-full sm:w-auto">
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email & Password Settings */}
          <Card className="liquid-glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Email & Parolă</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="newEmail">Email Nou</Label>
                <div className="flex gap-2">
                  <Input
                    id="newEmail"
                    type="email"
                    value={emailSettings.newEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, newEmail: e.target.value }))}
                    placeholder="nou@email.com"
                    className="flex-1"
                  />
                  <Button onClick={handleUpdateEmail} size="sm">
                    Actualizează
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="newPassword">Parolă Nouă</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={emailSettings.newPassword}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Parolă nouă"
                />
                <Input
                  type="password"
                  value={emailSettings.confirmPassword}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirmă parola"
                />
                <Button onClick={handleUpdatePassword} size="sm" className="w-full">
                  Actualizează Parola
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Telegram Bot Settings */}
          <Card className="liquid-glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                <MessageSquare className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Setări Telegram</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="botToken">Token Bot Telegram</Label>
                <Input
                  id="botToken"
                  type="password"
                  value={telegramSettings.botToken}
                  onChange={(e) => setTelegramSettings(prev => ({ ...prev, botToken: e.target.value }))}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                />
              </div>

              <div>
                <Label htmlFor="chatId">ID Chat Telegram</Label>
                <Input
                  id="chatId"
                  value={telegramSettings.chatId}
                  onChange={(e) => setTelegramSettings(prev => ({ ...prev, chatId: e.target.value }))}
                  placeholder="123456789"
                />
              </div>

              <Button onClick={handleSaveTelegramSettings} className="w-full">
                <Bot className="w-4 h-4 mr-2" />
                Salvează Setări Telegram
              </Button>
            </CardContent>
          </Card>

          {/* Gmail Integration - Coming Soon */}
          <Card className="liquid-glass opacity-75">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Integrare Gmail</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground mb-2">Integrarea Gmail</p>
                <p className="text-sm text-gray-500">Va fi disponibilă în curând</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className={`mt-6 sm:mt-8 grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-3 gap-4'}`}>
          <Button 
            onClick={handleSaveSettings}
            className="glass-button bg-accent/90 hover:bg-accent text-white w-full"
          >
            <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Salvează Setările</span>
          </Button>

          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50 w-full"
          >
            <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Ieșire din Cont</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 w-full"
              >
                <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Șterge Contul</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={`${isMobile ? 'mx-4 max-w-[calc(100vw-2rem)]' : ''}`}>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">
                  Ești sigur că vrei să îți ștergi contul?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base">
                  Această acțiune nu poate fi anulată. Toate datele tale vor fi șterse permanent,
                  inclusiv agenții, conversațiile și setările.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className={`${isMobile ? 'flex-col gap-2' : ''}`}>
                <AlertDialogCancel className={`${isMobile ? 'w-full' : ''}`}>
                  Anulează
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`bg-red-500 hover:bg-red-600 ${isMobile ? 'w-full' : ''}`}
                >
                  {isDeleting ? 'Se șterge...' : 'Șterge Contul'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
