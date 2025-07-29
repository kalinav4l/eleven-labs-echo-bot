import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function AdminHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card border-b px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administrare</h1>
        <p className="text-sm text-muted-foreground">
          Gestionați utilizatorii și monitorizați activitatea
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span>{user?.email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Deconectare
        </Button>
      </div>
    </header>
  );
}