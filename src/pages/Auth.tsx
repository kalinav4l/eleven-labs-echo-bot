import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
const Auth = () => {
  const navigate = useNavigate();
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
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google login error:', error);
        setError('Eroare la conectarea cu Google: ' + error.message);
      }
    } catch (err: any) {
      console.error('Google login exception:', err);
      setError('Eroare neașteptată la conectarea cu Google');
    } finally {
      setLoading(false);
    }
  };

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
          navigate('/');
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
  return <div className="auth-minimal-page">
      {/* Left Side - 3D Vocal Visualization */}
      <div className="auth-visual-section">
        <div className="auth-3d-container">
          <div className="w-full h-full relative flex items-center justify-center">
            <spline-viewer url="https://prod.spline.design/n-YvIXxfmd6DNmtp/scene.splinecode" style={{ width: "100%", height: "100%" }}></spline-viewer>
            {/* Overlay to mask Spline badge - solid dark */}
            <div
              className="pointer-events-none absolute bottom-2 right-2 w-40 h-12 rounded-md bg-foreground dark:bg-background z-50"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Clean White Login */}
      <div className="auth-clean-section">
        <div className="auth-clean-card">
          <div className="auth-clean-header">
            <h2>{isLogin ? 'CONECTARE' : 'ÎNREGISTRARE'}</h2>
            
          </div>
          
          <form onSubmit={handleSubmit} className="auth-clean-form">
            {!isLogin && <div className="auth-clean-row">
                <input type="text" placeholder="Prenume" value={firstName} onChange={e => setFirstName(e.target.value)} required={!isLogin} className="auth-clean-input" disabled={loading} />
                <input type="text" placeholder="Nume" value={lastName} onChange={e => setLastName(e.target.value)} required={!isLogin} className="auth-clean-input" disabled={loading} />
              </div>}
            
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="auth-clean-input" disabled={loading} />
            
            <div className="auth-clean-password">
              <input type={showPassword ? "text" : "password"} placeholder="Parolă" value={password} onChange={e => setPassword(e.target.value)} required className="auth-clean-input" disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-clean-toggle" disabled={loading}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {error && <div className="auth-clean-error">
                {error}
              </div>}

            {success && <div className="auth-clean-success">
                {success}
              </div>}
            
            <button type="submit" disabled={loading} className="auth-clean-submit">
              {loading ? 'SE PROCESEAZĂ...' : isLogin ? 'CONECTARE' : 'ÎNREGISTRARE'}
            </button>

            <div className="auth-divider">
              <span>sau</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="auth-google-button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'SE CONECTEAZĂ...' : 'Conectare cu Google'}
            </button>
          </form>
          
          <button onClick={() => {
          setIsLogin(!isLogin);
          setError('');
          setSuccess('');
          setEmail('');
          setPassword('');
          setFirstName('');
          setLastName('');
          setShowPassword(false);
        }} className="auth-clean-switch" disabled={loading}>
            {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Conectează-te'}
          </button>
        </div>
      </div>
    </div>;
};
export default Auth;