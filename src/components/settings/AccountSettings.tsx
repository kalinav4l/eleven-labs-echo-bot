
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Shield, Key, Camera } from 'lucide-react';

interface AccountSettingsProps {
  onChanges?: (hasChanges: boolean) => void;
}

const AccountSettings = ({ onChanges }: AccountSettingsProps) => {
  const [profile, setProfile] = useState({
    firstName: 'Ion',
    lastName: 'Popescu',
    email: 'ion.popescu@example.com',
    phone: '+40 722 123 456',
    company: 'Kalina AI',
    avatar: '',
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    onChanges?.(true);
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
    onChanges?.(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Setări cont</h2>
        <p className="text-gray-600">Gestionează informațiile și preferințele contului tău</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informații profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-lg">
                {profile.firstName[0]}{profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Schimbă avatar
              </Button>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG până la 5MB</p>
            </div>
          </div>

          <Separator />

          {/* Profile Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prenume</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                placeholder="Prenumele tău"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nume</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                placeholder="Numele tău"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="+40 722 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Companie</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => handleProfileChange('company', e.target.value)}
                placeholder="Numele companiei"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Securitate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Autentificare cu doi factori</h4>
              <p className="text-sm text-gray-600">Adaugă un nivel suplimentar de securitate</p>
            </div>
            <Button variant="outline">Configurează</Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Schimbă parola</h4>
              <p className="text-sm text-gray-600">Actualizează parola contului tău</p>
            </div>
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Schimbă
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Preferințe notificări
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Actualizări email</h4>
              <p className="text-sm text-gray-600">Primește actualizări importante prin email</p>
            </div>
            <Switch
              checked={notifications.emailUpdates}
              onCheckedChange={(checked) => handleNotificationChange('emailUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Alertă SMS</h4>
              <p className="text-sm text-gray-600">Alertă urgentă prin SMS</p>
            </div>
            <Switch
              checked={notifications.smsAlerts}
              onCheckedChange={(checked) => handleNotificationChange('smsAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificări push</h4>
              <p className="text-sm text-gray-600">Notificări în browser</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Rapoarte săptămânale</h4>
              <p className="text-sm text-gray-600">Rezumat săptămânal al activității</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
