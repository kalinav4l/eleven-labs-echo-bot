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
  return <div className="auth-minimal-page">
      {/* Left Side - 3D Vocal Visualization */}
      <div className="auth-visual-section">
        <div className="auth-3d-container">
          {/* Audio Wave Visualization */}
          <div className="audio-wave-3d">
            {Array.from({
            length: 50
          }, (_, i) => <div key={i} className="wave-bar-3d" style={{
            animationDelay: `${i * 0.1}s`,
            height: `${20 + Math.random() * 80}px`,
            left: `${i * 100 / 50}%`
          }} />)}
          </div>
          
          {/* Floating Sound Orbs */}
          <div className="sound-orbs">
            {Array.from({
            length: 8
          }, (_, i) => <div key={i} className="sound-orb" style={{
            animationDelay: `${i * 0.5}s`,
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`
          }} />)}
          </div>
          
          {/* Pulse Rings */}
          <div className="pulse-rings">
            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
            <div className="pulse-ring ring-3"></div>
          </div>
          
          {/* Logo/Title */}
          <div className="auth-visual-title">
            <h1>KALINA</h1>
            <p>AI Voice Platform</p>
          </div>
        </div>
      </div>

      {/* Right Side - Spectacular White Glass Login */}
      <div className="auth-glass-section">
        {/* Background Animations */}
        <div className="auth-glass-background">
          {/* Geometric Shapes */}
          <div className="geometric-shapes">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="geometric-shape" style={{
                animationDelay: `${i * 0.7}s`,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`
              }} />
            ))}
          </div>
          
          {/* Light Rays */}
          <div className="light-rays">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="light-ray" style={{
                animationDelay: `${i * 1.2}s`,
                transform: `rotate(${i * 45}deg)`
              }} />
            ))}
          </div>
          
          {/* Particle System */}
          <div className="particle-system">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="particle" style={{
                animationDelay: `${i * 0.3}s`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${4 + Math.random() * 2}s`
              }} />
            ))}
          </div>
          
          {/* Breathing Rings */}
          <div className="breathing-rings">
            <div className="breathing-ring ring-1"></div>
            <div className="breathing-ring ring-2"></div>
            <div className="breathing-ring ring-3"></div>
          </div>
        </div>
        
        {/* Glass Card */}
        <div className="auth-glass-card">
          <div className="auth-glass-header">
            <h2>{isLogin ? 'CONECTARE' : 'ÎNREGISTRARE'}</h2>
            <p>Acces la platforma KALINA</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-glass-form">
            {!isLogin && (
              <div className="auth-glass-row">
                <div className="glass-input-group">
                  <input 
                    type="text" 
                    placeholder="Prenume" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required={!isLogin} 
                    className="auth-glass-input" 
                    disabled={loading} 
                  />
                </div>
                <div className="glass-input-group">
                  <input 
                    type="text" 
                    placeholder="Nume" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    required={!isLogin} 
                    className="auth-glass-input" 
                    disabled={loading} 
                  />
                </div>
              </div>
            )}
            
            <div className="glass-input-group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="auth-glass-input" 
                disabled={loading} 
              />
            </div>
            
            <div className="glass-input-group">
              <div className="auth-glass-password">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Parolă" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="auth-glass-input" 
                  disabled={loading} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="auth-glass-toggle" 
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="auth-glass-error">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-glass-success">
                {success}
              </div>
            )}
            
            <button type="submit" disabled={loading} className="auth-glass-submit">
              <span className="button-text">
                {loading ? 'SE PROCESEAZĂ...' : isLogin ? 'CONECTARE' : 'ÎNREGISTRARE'}
              </span>
              <div className="button-ripple"></div>
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
            className="auth-glass-switch" 
            disabled={loading}
          >
            {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Conectează-te'}
          </button>
        </div>
      </div>
    </div>;
};
export default Auth;