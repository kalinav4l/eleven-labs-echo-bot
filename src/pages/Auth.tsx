
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

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
    <div className="auth-dark-page">
      {/* Animated Background Elements */}
      <div className="auth-bg-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
        <div className="floating-element element-4"></div>
        <div className="floating-element element-5"></div>
        <div className="floating-element element-6"></div>
      </div>

      {/* Gradient Lines */}
      <div className="auth-gradient-lines">
        <div className="gradient-line line-1"></div>
        <div className="gradient-line line-2"></div>
        <div className="gradient-line line-3"></div>
      </div>

      {/* Particle System */}
      <div className="auth-particles">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="auth-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">
              {isLogin ? 'CONECTARE' : 'ÎNREGISTRARE'}
            </h1>
            <div className="auth-title-line"></div>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Acces la platforma KALINA' 
                : 'Creează un cont nou pentru acces complet'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-row">
                <div className="auth-input-group">
                  <Input
                    type="text"
                    placeholder="Prenume"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                    className="auth-input"
                    disabled={loading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
                <div className="auth-input-group">
                  <Input
                    type="text"
                    placeholder="Nume"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                    className="auth-input"
                    disabled={loading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              </div>
            )}
            
            <div className="auth-input-group">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                disabled={loading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            
            <div className="auth-input-group auth-password-group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "Parolă" : "Parolă (minim 8 caractere)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isLogin ? undefined : 8}
                className="auth-input auth-password-input"
                disabled={loading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                disabled={loading}
                title={showPassword ? "Ascunde parola" : "Arată parola"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && (
              <div className="auth-error">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="auth-success">
                <p>{success}</p>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              <span>{loading ? 'SE PROCESEAZĂ...' : (isLogin ? 'CONECTARE' : 'ÎNREGISTRARE')}</span>
              <div className="auth-btn-glow"></div>
            </Button>
          </form>
          
          <div className="auth-switch">
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
              className="auth-switch-btn"
              disabled={loading}
            >
              {isLogin 
                ? 'Nu ai cont? Înregistrează-te' 
                : 'Ai deja cont? Conectează-te'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
