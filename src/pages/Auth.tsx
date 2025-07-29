import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
const Auth = () => {
  const {
    user,
    signIn,
    signUp
  } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Parola trebuie să aibă cel puțin 8 caractere';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Parola trebuie să conțină cel puțin o literă mare, o literă mică și o cifră';
    }
    return null;
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  if (user) {
    return <Navigate to="/" replace />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Input validation
      if (!validateEmail(email)) {
        setError('Vă rugăm să introduceți o adresă de email validă');
        setLoading(false);
        return;
      }
      let result;
      if (isLogin) {
        console.log('Attempting login for:', email);
        result = await signIn(email, password);
        if (result.error) {
          console.error('Login error:', result.error);
          let errorMessage = 'Eroare la conectare';
          if (result.error.message?.includes('Invalid login credentials')) {
            errorMessage = 'Email sau parolă incorectă';
          } else if (result.error.message?.includes('Email not confirmed')) {
            errorMessage = 'Vă rugăm să vă confirmați emailul înainte de a vă conecta';
          } else if (result.error.message) {
            errorMessage = result.error.message;
          }
          setError(errorMessage);
        } else {
          // Redirect to home page after successful login
          window.location.href = '/';
        }
      } else {
        // Enhanced validation for sign up
        if (!firstName.trim() || !lastName.trim()) {
          setError('Prenumele și numele sunt obligatorii');
          setLoading(false);
          return;
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }
        console.log('Attempting signup for:', email, 'with name:', firstName, lastName);
        const redirectUrl = `${window.location.origin}/`;
        result = await signUp(email, password, firstName, lastName);
        if (result.error) {
          console.error('Signup error:', result.error);
          let errorMessage = 'Eroare la înregistrare';
          if (result.error.message?.includes('User already registered')) {
            errorMessage = 'Un utilizator cu acest email există deja';
          } else if (result.error.message?.includes('Password should be at least')) {
            errorMessage = 'Parola trebuie să aibă cel puțin 8 caractere și să conțină litere mari, mici și cifre';
          } else if (result.error.message?.includes('Database error')) {
            errorMessage = 'Eroare de bază de date. Vă rugăm să încercați din nou.';
          } else if (result.error.message) {
            errorMessage = result.error.message;
          }
          setError(errorMessage);
        } else {
          console.log('Signup successful');
          setSuccess('Cont creat cu succes! Verifică-ți emailul pentru confirmare.');
          // Reset form
          setEmail('');
          setPassword('');
          setFirstName('');
          setLastName('');
        }
      }
    } catch (err: any) {
      console.error('Auth exception:', err);
      setError(`Eroare neașteptată: ${err.message || 'Ceva nu a mers bine'}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Section */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10">
          <h1 className="text-8xl font-black text-gray-900 mb-4 tracking-wider">KALINA</h1>
          <p className="text-xl text-gray-600 font-light tracking-wide">AI Voice Platform</p>
        </div>
        
        {/* Floating circles animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="circle-float circle-1"></div>
          <div className="circle-float circle-2"></div>
          <div className="circle-float circle-3"></div>
          <div className="circle-float circle-4"></div>
          <div className="circle-float circle-5"></div>
        </div>
      </div>

      {/* Right Side - Liquid Glass Login */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 relative">
        {/* Subtle animated background */}
        <div className="absolute inset-0 liquid-bg-animation"></div>
        
        <div className="liquid-glass w-full max-w-md mx-8 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'CONECTARE' : 'ÎNREGISTRARE'}
            </h2>
            <p className="text-gray-600">Acces la platforma KALINA</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prenume"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={!isLogin}
                  className="glass-input w-full px-4 py-3 text-sm"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Nume"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={!isLogin}
                  className="glass-input w-full px-4 py-3 text-sm"
                  disabled={loading}
                />
              </div>
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input w-full px-4 py-3 text-sm"
              disabled={loading}
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Parolă"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-input w-full px-4 py-3 pr-12 text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                {success}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'SE PROCESEAZĂ...' : isLogin ? 'CONECTARE' : 'ÎNREGISTRARE'}
            </button>
          </form>
          
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
              setEmail('');
              setPassword('');
              setFirstName('');
              setLastName('');
              setShowPassword(false);
            }}
            className="w-full mt-6 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            disabled={loading}
          >
            {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Conectează-te'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Auth;