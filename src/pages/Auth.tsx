
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
        if (result.error) {
          setError(`Eroare la conectare: ${result.error.message}`);
        }
      } else {
        // Validation for sign up
        if (!firstName.trim() || !lastName.trim()) {
          setError('Prenumele și numele sunt obligatorii');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Parola trebuie să aibă cel puțin 6 caractere');
          setLoading(false);
          return;
        }

        result = await signUp(email, password, firstName, lastName);
        if (result.error) {
          setError(`Eroare la înregistrare: ${result.error.message}`);
        } else {
          setSuccess('Cont creat cu succes! Verifică-ți emailul pentru confirmare.');
          // Reset form
          setEmail('');
          setPassword('');
          setFirstName('');
          setLastName('');
        }
      }
    } catch (err: any) {
      setError(`Eroare neașteptată: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glass Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md liquid-glass relative z-10 animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-foreground text-2xl font-semibold">
            {isLogin ? 'Conectare' : 'Înregistrare'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin 
              ? 'Conectează-te la contul tău' 
              : 'Creează un cont nou pentru acces complet'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  type="text"
                  placeholder="Prenume"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={!isLogin}
                  className="glass-input"
                />
                <Input
                  type="text"
                  placeholder="Nume"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={!isLogin}
                  className="glass-input"
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input"
            />
            <Input
              type="password"
              placeholder={isLogin ? "Parolă" : "Parolă (minim 6 caractere)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? undefined : 6}
              className="glass-input"
            />
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              {loading ? 'Se procesează...' : (isLogin ? 'Conectare' : 'Înregistrare')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
              }}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {isLogin 
                ? 'Nu ai cont? Înregistrează-te' 
                : 'Ai deja cont? Conectează-te'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
