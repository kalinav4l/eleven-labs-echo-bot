import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="liquid-glass">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Bine ai venit, {user.email}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Aceasta este pagina principală a aplicației.
            </p>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.href = '/account'}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Contul meu
              </Button>
              
              <Button 
                onClick={signOut}
                variant="outline"
              >
                Deconectare
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;