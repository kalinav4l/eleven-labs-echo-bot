
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Globe, LogOut, Trash2, User, Mail, Lock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const AccountSettings = () => {
  const { user, signOut, updateEmail, updatePassword } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState({
    defaultLanguage: 'ro'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast({
        title: "Eroare",
        description: "Introduceți un email valid.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await updateEmail(newEmail);
      if (error) throw error;
      
      toast({
        title: "Email actualizat",
        description: "Emailul a fost actualizat cu succes. Verificați-vă emailul pentru confirmare."
      });
      setNewEmail('');
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut actualiza emailul.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Eroare",
        description: "Introduceți o parolă nouă.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Eroare",
        description: "Parolele nu se potrivesc.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Eroare",
        description: "Parola trebuie să aibă cel puțin 6 caractere.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      
      toast({
        title: "Parolă actualizată",
        description: "Parola a fost actualizată cu succes."
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut actualiza parola.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
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
                  <SelectTrigger className="liquid-glass border-white/20 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-white/20">
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
                <div className="p-3 liquid-glass rounded border border-white/20 text-foreground bg-white/5 text-sm sm:text-base break-all">
                  {user?.email || ''}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">Plan Curent</label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 liquid-glass rounded border border-white/20">
                  <span className="text-foreground text-sm sm:text-base">Plan Starter</span>
                  <Button size="sm" className="glass-button bg-accent/90 hover:bg-accent text-white w-full sm:w-auto">
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Update */}
          <Card className="liquid-glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Actualizare Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Email Nou</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Introduceți emailul nou"
                  className="liquid-glass border-white/20"
                />
              </div>
              <Button 
                onClick={handleUpdateEmail}
                disabled={isUpdatingEmail || !newEmail.trim()}
                className="glass-button bg-accent/90 hover:bg-accent text-white w-full"
              >
                {isUpdatingEmail ? 'Se actualizează...' : 'Actualizează Email'}
              </Button>
            </CardContent>
          </Card>

          {/* Password Update */}
          <Card className="liquid-glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                <Lock className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Actualizare Parolă</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Parolă Nouă</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Introduceți parola nouă"
                  className="liquid-glass border-white/20"
                />
              </div>
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Confirmă Parola</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmați parola nouă"
                  className="liquid-glass border-white/20"
                />
              </div>
              <Button 
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword.trim() || !confirmPassword.trim()}
                className="glass-button bg-accent/90 hover:bg-accent text-white w-full"
              >
                {isUpdatingPassword ? 'Se actualizează...' : 'Actualizează Parola'}
              </Button>
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
            className="border-orange-500 text-orange-500 hover:bg-orange-50/10 liquid-glass w-full"
          >
            <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Ieșire din Cont</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50/10 liquid-glass w-full"
              >
                <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Șterge Contul</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={`liquid-glass ${isMobile ? 'mx-4 max-w-[calc(100vw-2rem)]' : ''}`}>
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
                <AlertDialogCancel className={`liquid-glass ${isMobile ? 'w-full' : ''}`}>
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
