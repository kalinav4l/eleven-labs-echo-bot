
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

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, firstName, lastName);
      }

      if (result.error) {
        setError(result.error.message);
      } else if (!isLogin) {
        setError('Verifică-ți emailul pentru a confirma contul!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-center">
            {isLogin ? 'Conectare' : 'Înregistrare'}
          </CardTitle>
          <CardDescription className="text-gray-400 text-center">
            {isLogin 
              ? 'Conectează-te la contul tău' 
              : 'Creează un cont nou'
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
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Input
                  type="text"
                  placeholder="Nume"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
            
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              {loading ? 'Se încarcă...' : (isLogin ? 'Conectare' : 'Înregistrare')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white text-sm"
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
