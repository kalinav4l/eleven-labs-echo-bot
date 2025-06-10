
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-2 border-[#FFBB00] shadow-lg animate-fade-in">
        <CardHeader className="bg-gradient-primary text-center">
          <CardTitle className="text-black font-bold">
            {isLogin ? 'Conectare' : 'Înregistrare'}
          </CardTitle>
          <CardDescription className="text-gray-700">
            {isLogin 
              ? 'Conectează-te la contul tău' 
              : 'Creează un cont nou'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  type="text"
                  placeholder="Prenume"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white border-2 border-[#FFBB00] text-black placeholder-gray-500 focus:border-[#E6A600]"
                />
                <Input
                  type="text"
                  placeholder="Nume"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white border-2 border-[#FFBB00] text-black placeholder-gray-500 focus:border-[#E6A600]"
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-2 border-[#FFBB00] text-black placeholder-gray-500 focus:border-[#E6A600]"
            />
            <Input
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-2 border-[#FFBB00] text-black placeholder-gray-500 focus:border-[#E6A600]"
            />
            
            {error && (
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFBB00] text-black hover:bg-[#E6A600] transition-colors font-bold border-2 border-black"
            >
              {loading ? 'Se încarcă...' : (isLogin ? 'Conectare' : 'Înregistrare')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-black text-sm transition-colors font-medium"
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
