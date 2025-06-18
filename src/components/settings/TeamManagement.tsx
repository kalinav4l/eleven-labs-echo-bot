
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, Shield, Crown, User, Mail, MoreVertical, Trash2, Edit } from 'lucide-react';

interface TeamManagementProps {
  onChanges?: (hasChanges: boolean) => void;
}

const TeamManagement = ({ onChanges }: TeamManagementProps) => {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Ion Popescu',
      email: 'ion.popescu@company.com',
      role: 'admin',
      avatar: '',
      status: 'active',
      lastActive: '2 minute ago',
      department: 'Management',
    },
    {
      id: 2,
      name: 'Maria Ionescu',
      email: 'maria.ionescu@company.com',
      role: 'manager',
      avatar: '',
      status: 'active',
      lastActive: '1 hour ago',
      department: 'Sales',
    },
    {
      id: 3,
      name: 'Andrei Georgescu',
      email: 'andrei.georgescu@company.com',
      role: 'agent',
      avatar: '',
      status: 'inactive',
      lastActive: '2 days ago',
      department: 'Support',
    },
  ]);

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'agent',
    department: '',
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      default:
        return 'Agent';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const handleInvite = () => {
    if (inviteData.email) {
      onChanges?.(true);
      // Reset form
      setInviteData({ email: '', role: 'agent', department: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestionare echipă</h2>
          <p className="text-gray-600">Invită și gestionează membrii echipei tale</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invită membru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invită un nou membru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="nume@company.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Departament</label>
                <Select value={inviteData.department} onValueChange={(value) => setInviteData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează departamentul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleInvite} className="w-full">
                Trimite invitația
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total membri</span>
            </div>
            <div className="text-2xl font-bold mt-2">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Activi</span>
            </div>
            <div className="text-2xl font-bold mt-2">{members.filter(m => m.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Administratori</span>
            </div>
            <div className="text-2xl font-bold mt-2">{members.filter(m => m.role === 'admin').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membrii echipei</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {member.department}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                        {member.status === 'active' ? 'Activ' : 'Inactiv'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">{getRoleLabel(member.role)}</div>
                    <div className="text-xs text-gray-500">Activ {member.lastActive}</div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matrice de permisiuni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Permisiune</th>
                  <th className="text-center p-2">Agent</th>
                  <th className="text-center p-2">Manager</th>
                  <th className="text-center p-2">Admin</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Vizualizare conversații</td>
                  <td className="text-center p-2">✅</td>
                  <td className="text-center p-2">✅</td>
                  <td className="text-center p-2">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Editare agenți</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">✅</td>
                  <td className="text-center p-2">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Gestionare echipă</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Acces facturare</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
