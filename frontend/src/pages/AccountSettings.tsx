
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
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Could not sign out.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Delete user data from our tables
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

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

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        throw deleteError;
      }

      await signOut();
      navigate('/');
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Could not delete account. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailSettings.newEmail) {
      toast({
        title: "Error",
        description: "Please enter a new email address.",
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
        title: "Email updated",
        description: "Email address has been updated. Check your email for confirmation."
      });
      setEmailSettings(prev => ({ ...prev, newEmail: '' }));
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: "Could not update email address.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!emailSettings.newPassword || !emailSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }

    if (emailSettings.newPassword !== emailSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
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
        title: "Password updated",
        description: "Password has been updated successfully."
      });
      setEmailSettings(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Could not update password.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h1>
            <p className="text-gray-600 text-sm">Manage your account preferences and configurations</p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* Account Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Email</Label>
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 text-sm">
                      {user?.email || ''}
                    </div>
                    <Input
                      placeholder="New email"
                      value={emailSettings.newEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, newEmail: e.target.value }))}
                      className="flex-1 bg-white border-gray-200"
                    />
                    <Button onClick={handleUpdateEmail} size="sm">
                      Update
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Password</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      type="password"
                      placeholder="New password"
                      value={emailSettings.newPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-white border-gray-200"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={emailSettings.confirmPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-white border-gray-200"
                    />
                    <Button onClick={handleUpdatePassword} size="sm">
                      Update Password
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Plan</Label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900 text-sm">Starter Plan</span>
                    <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Default Language</Label>
                  <Select 
                    value={settings.defaultLanguage} 
                    onValueChange={(value) => setSettings({...settings, defaultLanguage: value})}
                  >
                    <SelectTrigger className="bg-white border-gray-200 max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="ro">Română</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Integrations Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Integrations</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Telegram Bot</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="password"
                      placeholder="Bot Token"
                      value={telegramSettings.botToken}
                      onChange={(e) => setTelegramSettings(prev => ({ ...prev, botToken: e.target.value }))}
                      className="bg-white border-gray-200"
                    />
                    <Input
                      placeholder="Chat ID"
                      value={telegramSettings.chatId}
                      onChange={(e) => setTelegramSettings(prev => ({ ...prev, chatId: e.target.value }))}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <Button className="mt-2" size="sm">
                    <Bot className="w-4 h-4 mr-2" />
                    Save Telegram Settings
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gmail Integration</p>
                      <p className="text-xs text-gray-500">Coming soon</p>
                    </div>
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={`${isMobile ? 'mx-4 max-w-[calc(100vw-2rem)]' : ''}`}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base sm:text-lg">
                        Are you sure you want to delete your account?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm sm:text-base">
                        This action cannot be undone. All your data will be permanently deleted,
                        including agents, conversations, and settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className={`${isMobile ? 'flex-col gap-2' : ''}`}>
                      <AlertDialogCancel className={`${isMobile ? 'w-full' : ''}`}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className={`bg-red-500 hover:bg-red-600 ${isMobile ? 'w-full' : ''}`}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
