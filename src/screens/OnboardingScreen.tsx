import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useStore } from '../store/useStore';
import { ChevronRight, Shield, TrendingUp, PieChart, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const slides = [
  {
    icon: '💰',
    title: 'Track Every Penny',
    description: 'Monitor your income, expenses, and savings goals all in one beautiful dashboard. Know exactly where your money goes.',
    gradient: 'from-indigo-600/30 via-purple-600/20 to-transparent',
    accent: '#6C63FF',
  },
  {
    icon: '📊',
    title: 'Smart Budgeting',
    description: 'Set budgets per category, track spending in real-time, and get notified before you overspend. Stay on top of your finances.',
    gradient: 'from-emerald-600/30 via-teal-600/20 to-transparent',
    accent: '#00C896',
  },
  {
    icon: '🎯',
    title: 'Achieve Your Goals',
    description: 'Create savings goals, track debt, manage subscriptions, and collaborate on shared expenses with family or friends.',
    gradient: 'from-amber-600/30 via-orange-600/20 to-transparent',
    accent: '#FFB830',
  },
];

const features = [
  { icon: <TrendingUp size={16} />, text: 'Multi-account tracking' },
  { icon: <PieChart size={16} />, text: 'Advanced analytics' },
  { icon: <Shield size={16} />, text: 'Bank-level security' },
  { icon: <CheckCircle size={16} />, text: '150+ currencies' },
];

export const OnboardingScreen: React.FC = () => {
  const { signUp, signIn, isLoading } = useAuth();
  const { setAuthenticated, setPinVerified, completeOnboarding, updateProfile } = useStore();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStage, setPinStage] = useState<'enter' | 'confirm'>('enter');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setError('Please enter email and password');
      return;
    }

    setError(null);
    const { error: authError } = await signIn(loginEmail, loginPassword);

    if (authError) {
      setError(authError.message || 'Failed to sign in');
    } else {
      // Auth successful, proceed to PIN
      setShowPin(true);
      setShowLogin(false);
      setPinStage('enter');
      setPin('');
      setConfirmPin('');
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    const { error: authError } = await signUp(email, password, name);

    if (authError) {
      setError(authError.message || 'Failed to create account');
    } else {
      // Account created, go to PIN setup
      updateProfile({ full_name: name, email });
      setShowSignup(false);
      setShowPin(true);
      setPinStage('enter');
      setPin('');
      setConfirmPin('');
      setError(null);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pinStage === 'enter') {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => setPinStage('confirm'), 300);
      }
    } else {
      const newConfirm = confirmPin + digit;
      setConfirmPin(newConfirm);
      if (newConfirm.length === 4) {
        setTimeout(() => {
          if (newConfirm === pin) {
            setAuthenticated(true);
            setPinVerified(true);
            completeOnboarding();
          } else {
            setConfirmPin('');
            setError('PINs do not match');
            setTimeout(() => setError(null), 2000);
          }
        }, 300);
      }
    }
  };

  const handlePinDelete = () => {
    if (pinStage === 'enter') setPin(p => p.slice(0, -1));
    else setConfirmPin(p => p.slice(0, -1));
  };

  const slide = slides[currentSlide];
  const currentPinValue = pinStage === 'enter' ? pin : confirmPin;

  // PIN Setup Screen
  if (showPin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {pinStage === 'enter' ? 'Set Your PIN' : 'Confirm PIN'}
          </h2>
          <p className="text-gray-400 mb-10 text-sm">
            {pinStage === 'enter' ? 'Choose a 4-digit PIN to secure your app' : 'Enter your PIN again to confirm'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* PIN Dots */}
          <div className="flex justify-center gap-4 mb-12">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  i < currentPinValue.length
                    ? 'bg-indigo-500 border-indigo-500 scale-110'
                    : 'border-white/30'
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => (
              <button
                key={i}
                onClick={() => key === '⌫' ? handlePinDelete() : key && handlePinInput(key)}
                className={`h-16 rounded-2xl text-xl font-semibold transition-all duration-150 active:scale-90 ${
                  key === '' ? 'invisible' :
                  key === '⌫' ? 'text-gray-400 bg-white/5 hover:bg-white/10' :
                  'text-white bg-white/10 hover:bg-white/20'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Screen
  if (showSignup) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col p-6">
        <button onClick={() => setShowSignup(false)} className="text-gray-400 mb-8 text-left text-sm">← Back</button>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-3xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-gray-400 mb-8">Start your financial journey today</p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Johnson"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
          </div>

          <Button onClick={handleSignup} disabled={isLoading} className="mt-8 w-full py-4" size="lg">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-gray-500 text-sm text-center mt-4">
            Already have an account?{' '}
            <button onClick={() => { setShowSignup(false); setShowLogin(true); }} className="text-indigo-400">Sign In</button>
          </p>
        </div>
      </div>
    );
  }

  // Sign In Screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col p-6">
        <button onClick={() => setShowLogin(false)} className="text-gray-400 mb-8 text-left text-sm">← Back</button>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-4xl mb-4">💎</div>
          <h2 className="text-3xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="alex@example.com"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <Button onClick={handleLogin} disabled={isLoading} className="mt-8 w-full py-4" size="lg">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Demo Access */}
          <button
            onClick={() => { setAuthenticated(true); setPinVerified(true); completeOnboarding(); }}
            className="mt-4 w-full py-3 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors"
          >
            🚀 Continue with Demo
          </button>

          <p className="text-gray-500 text-sm text-center mt-4">
            Don't have an account?{' '}
            <button onClick={() => { setShowLogin(false); setShowSignup(true); }} className="text-indigo-400">Sign Up</button>
          </p>
        </div>
      </div>
    );
  }

  // Onboarding Slides
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${slide.gradient} pointer-events-none transition-all duration-700`} />

      {/* Skip Button */}
      <div className="relative z-10 flex justify-end p-6">
        <button
          onClick={() => setShowLogin(true)}
          className="text-gray-400 text-sm hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Animated Icon */}
        <div
          className="text-8xl mb-8 transition-all duration-500"
          style={{ filter: `drop-shadow(0 0 30px ${slide.accent}66)` }}
        >
          {slide.icon}
        </div>

        {/* Title */}
        <h1
          key={currentSlide}
          className="text-3xl font-bold text-white mb-4 leading-tight transition-all duration-500"
        >
          {slide.title}
        </h1>

        {/* Description */}
        <p
          key={`desc-${currentSlide}`}
          className="text-gray-400 text-base leading-relaxed max-w-xs transition-all duration-500"
        >
          {slide.description}
        </p>

        {/* Feature Pills (last slide) */}
        {currentSlide === 2 && (
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300"
              >
                <span className="text-amber-400">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 p-8">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? 'w-8 h-2 bg-indigo-500'
                  : 'w-2 h-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}88)`,
            boxShadow: `0 8px 32px ${slide.accent}44`,
          }}
        >
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
          <ChevronRight size={20} />
        </button>

        {currentSlide === slides.length - 1 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account?{' '}
            <button onClick={() => setShowLogin(true)} className="text-indigo-400">Sign In</button>
          </p>
        )}
      </div>
    </div>
  );
};
