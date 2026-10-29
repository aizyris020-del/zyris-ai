import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Activity,
  Award,
  AlertTriangle,
  PieChart,
  Download,
  ArrowRight,
  LogOut,
  User,
  X,
  ShieldCheck,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
  KeyRound,
  Bell,
  Info,
  Cpu,
  Layers,
  Globe2,
  Rocket,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  auth, 
  loginWithGoogle, 
  loginWithEmail, 
  signUpWithEmail, 
  logoutUser 
} from './firebase';
import { onAuthStateChanged, getAdditionalUserInfo, updatePassword, signInWithEmailAndPassword } from 'firebase/auth';

const trajectoryData = [
  { month: 'Jan', current: 10 },
  { month: 'Feb', current: 15 },
  { month: 'Mar', current: 22 },
  { month: 'Apr', current: 35 },
  { month: 'May', current: 48 },
  { month: 'Jun', current: 75 },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // 'email' | 'otp' | 'new_password'
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  // Dynamic Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [analysisResult] = useState({
    entity: 'Lumina Coffee',
    vertical: 'Specialty coffee • Austin, TX • Independent roaster',
    metrics: {
      momentum: 'High',
      repeatRate: '68%',
      opportunities: '06',
      pressure: 'Moderate'
    },
    swot: {
      strengths: [
        '68% repeat purchase rate supports strong loyalty.',
        'Direct sourcing protects a premium brand position.'
      ],
      weaknesses: [
        '72% of revenue relies on walk-in traffic.',
        'Low online visibility limits new customer reach.'
      ],
      opportunities: [
        'Office subscriptions unlock recurring B2B sales.',
        'Cold-brew demand models +64.2% growth.'
      ],
      threats: [
        'Green coffee costs could compress margins.',
        'Chain expansion raises local acquisition costs.'
      ]
    },
    gaps: [
      { title: 'Office coffee, without the friction', desc: 'Direct-to-office 5lb bean delivery', priority: 'HIGH' },
      { title: 'A premium cold-brew entry point', desc: 'Standard cans fall short on roast story', priority: 'MEDIUM' },
      { title: 'Own the neighborhood search', desc: 'SEO leaves room for local discovery', priority: 'QUICK WIN' }
    ],
    roadmap: [
      { title: 'Launch office subscription pilot', timeline: 'Weeks 1-2 • Target 20 local teams', impact: 'HIGH IMPACT' },
      { title: 'Test a cold-brew discovery bundle', timeline: 'Weeks 3-4 • Direct-to-consumer digital push', impact: 'QUICK WIN' },
      { title: 'Scale the winning acquisition loop', timeline: 'Weeks 5-8 • Measure CAC & retention', impact: 'GROWTH' }
    ]
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch('http://localhost:5000/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setUserProfile(data.user);
          }
        } catch (err) {
          console.error('Failed to load persistent profile:', err);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const sendWelcomeEmail = async (userEmail, userName, uid) => {
    try {
      await fetch('http://localhost:5000/api/mail/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: userName, uid })
      });
      showToast('Welcome email sent to your inbox! 🚀', 'success');
    } catch (err) {
      console.error('Failed to send welcome mail:', err);
    }
  };

  const fetchAnalysis = async (businessName = 'Lumina Coffee', industry = 'Specialty coffee') => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ businessName, industry })
      });

      const data = await response.json();
      setApiResponse(data);
      if (data.remainingCredits !== undefined) {
        setUserProfile(prev => ({ ...prev, credits: data.remainingCredits }));
      }
      showToast('Market intelligence briefing loaded successfully!', 'success');
    } catch (err) {
      console.error('API Error:', err);
      showToast('Failed to connect to backend engine.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);
    try {
      const result = await loginWithGoogle();
      
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUserToken = result?._tokenResponse?.isNewUser;
      const isNewUserAdditional = additionalInfo?.isNewUser;
      const creationTime = result?.user?.metadata?.creationTime;
      const lastSignInTime = result?.user?.metadata?.lastSignInTime;
      const isBrandNewAccount = creationTime && lastSignInTime && creationTime === lastSignInTime;

      if (isNewUserToken || isNewUserAdditional || isBrandNewAccount) {
        sendWelcomeEmail(
          result.user.email, 
          result.user.displayName || result.user.email.split('@')[0],
          result.user.uid
        );
        showToast('Account created successfully via Google! 🎉', 'success');
      } else {
        showToast('Signed in successfully with Google! Welcome back 👋', 'success');
      }

      setShowAuthModal(false);
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
      showToast(err.message.replace('Firebase: ', ''), 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (isForgotPassword) {
      if (resetStep === 'email') {
        if (!email) {
          setAuthError('Please enter your email address.');
          showToast('Please enter your email address.', 'error');
          return;
        }
        setAuthLoading(true);
        try {
          const res = await fetch('http://localhost:5000/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
          
          setAuthSuccessMsg('A 6-digit verification code has been sent to your email.');
          showToast('🔑 OTP Code sent! Please check your email inbox.', 'info');
          setResetStep('otp');
        } catch (err) {
          setAuthError(err.message);
          showToast(err.message, 'error');
        } finally {
          setAuthLoading(false);
        }
      } else if (resetStep === 'otp') {
        if (!otpCode) {
          setAuthError('Please enter the 6-digit OTP code.');
          showToast('Please enter the 6-digit OTP code.', 'error');
          return;
        }
        setAuthLoading(true);
        try {
          const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpCode })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'OTP verification failed.');

          setAuthSuccessMsg('OTP Code verified! Enter your new password below.');
          showToast('✓ OTP Verified! Enter your new password.', 'success');
          setResetStep('new_password');
        } catch (err) {
          setAuthError(err.message);
          showToast(err.message, 'error');
        } finally {
          setAuthLoading(false);
        }
      } else if (resetStep === 'new_password') {
        if (!newPassword || newPassword.length < 6) {
          setAuthError('Password must be at least 6 characters.');
          showToast('Password must be at least 6 characters.', 'error');
          return;
        }
        setAuthLoading(true);
        try {
          const res = await fetch('http://localhost:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpCode, newPassword })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Password update failed.');

          showToast('🔐 Password updated successfully! You can now sign in.', 'success');
          setAuthSuccessMsg('Password reset completed! Please sign in with your new password.');
          setTimeout(() => {
            setIsForgotPassword(false);
            setResetStep('email');
            setIsSignUp(false);
            setAuthSuccessMsg('');
            setNewPassword('');
            setOtpCode('');
          }, 2000);
        } catch (err) {
          setAuthError(err.message);
          showToast(err.message, 'error');
        } finally {
          setAuthLoading(false);
        }
      }
      return;
    }

    if (!email || !password) {
      setAuthError('Please fill in all fields.');
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        const newUser = await signUpWithEmail(email, password);
        sendWelcomeEmail(newUser.email, email.split('@')[0], newUser.uid);
        showToast('Account created successfully! Welcome to ZyrisAI 🎉', 'success');
      } else {
        await loginWithEmail(email, password);
        showToast('Signed in successfully! Welcome back 👋', 'success');
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
      showToast(err.message.replace('Firebase: ', ''), 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setApiResponse(null);
    setUserProfile(null);
    await logoutUser();
    showToast('Signed out safely.', 'info');
  };

  // PROTECTED SCREEN FOR AUTHENTICATED USER
  if (user) {
    return (
      <div className="min-h-screen bg-[#030712] text-gray-100 font-sans relative flex flex-col justify-between overflow-hidden selection:bg-cyan-500 selection:text-white">
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-5 right-5 z-[100] flex items-center space-x-3 px-4 py-3 rounded-2xl bg-[#0b1329]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl text-xs font-medium text-white"
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none" />

        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-white/10 px-4 sm:px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0b1329] rounded-[11px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black text-base sm:text-lg">Z</span>
                </div>
              </div>
              <div className="flex items-center space-x-0.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Zyris</span>
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono tracking-tight shrink-0 flex items-center space-x-1">
                <span>⚡</span>
                <span className="font-medium">{userProfile ? userProfile.credits : 2}</span>
                <span className="hidden sm:inline text-cyan-400/70">Credits</span>
              </div>

              <button 
                onClick={() => setShowHelpModal(true)} 
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors hidden sm:flex"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Help & Policy</span>
              </button>

              <div className="flex items-center space-x-2 sm:space-x-3 bg-white/[0.04] border border-white/10 px-2.5 sm:px-3.5 py-1.5 rounded-xl">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-400/50" />
                ) : (
                  <User className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-xs font-medium text-white max-w-[100px] sm:max-w-none truncate">{user.displayName || user.email}</span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-rose-400 transition-colors p-1" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl w-full text-center p-6 sm:p-12 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-6 shadow-inner">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>VIP EARLY ACCESS CONFIRMED</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              ZyrisAI Engine <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Preparing for Deployment
              </span>
            </h1>

            <p className="text-gray-400 text-xs sm:text-base leading-relaxed mb-8">
              Welcome aboard, <span className="text-white font-semibold">{user.displayName || user.email}</span>! You are officially on the priority queue for our Groq LPU sub-100ms market reasoning engine.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
              <motion.div whileHover={{ scale: 1.02 }} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-gray-300 font-medium">Account Verified</span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center space-x-3">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-xs text-gray-300 font-medium">v1.0 Launch Queue Active</span>
              </motion.div>
            </div>

            <div className="mb-6 pt-2">
              <button
                onClick={() => fetchAnalysis()}
                className="w-full py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Test Authenticated Backend Connection</span>
              </button>

              {apiResponse && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] text-left font-mono">
                  ✓ Token Verified! Remaining Credits: {apiResponse.remainingCredits}
                </div>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-400 hover:text-white transition-all"
            >
              Sign out of session
            </button>
          </motion.div>
        </main>

        <footer className="border-t border-white/[0.08] py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ZyrisAI Inc. All rights reserved.
        </footer>
      </div>
    );
  }

  // LANDING PAGE & PREVIEW DASHBOARD
  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 right-5 z-[100] flex items-center space-x-3 px-4 py-3 rounded-2xl bg-[#0b1329]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl text-xs font-medium text-white"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600 blur-[180px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500 blur-[180px] rounded-full pointer-events-none" 
      />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b1329] rounded-[11px] flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black text-lg">Z</span>
              </div>
            </div>
            <div className="flex items-center space-x-0.5">
              <span className="text-2xl font-black tracking-tight text-white">Zyris</span>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-gray-300 shadow-inner absolute left-1/2 -translate-x-1/2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-medium tracking-wide">Your next strategic move, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 font-semibold">intelligently faster</span>.</span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Help & Support</span>
            </button>

            <button 
              onClick={() => { setIsSignUp(false); setIsForgotPassword(false); setShowAuthModal(true); }}
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setIsSignUp(true); setIsForgotPassword(false); setShowAuthModal(true); }}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-medium text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold mb-6 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>SUB-100MS INTELLIGENCE ENGINE • V1.0 READY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Next–Gen Business Intelligence <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Powered by Groq LPUs
            </span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Turn any business or industry vertical into your next strategic advantage. Surface market shifts, competitor blind spots, and instant execution roadmaps.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setIsSignUp(true); setIsForgotPassword(false); setShowAuthModal(true); }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-xl shadow-cyan-500/20 flex items-center space-x-2"
            >
              <Rocket className="w-4 h-4" />
              <span>Lock In Priority Access</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Auth Modal with Password Toggle Icons */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => { setShowAuthModal(false); setIsForgotPassword(false); setResetStep('email'); }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px] mx-auto mb-3 shadow-lg shadow-cyan-500/20">
                  <div className="w-full h-full bg-[#0b1329] rounded-[15px] flex items-center justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black text-xl">Z</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isForgotPassword 
                    ? (resetStep === 'email' ? 'Reset Password' : (resetStep === 'otp' ? 'Enter OTP Code' : 'Set New Password')) 
                    : (isSignUp ? 'Create your ZyrisAI Account' : 'Welcome back')}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isForgotPassword 
                    ? (resetStep === 'email' 
                        ? 'Enter your email to receive a 6-digit verification code.' 
                        : (resetStep === 'otp' 
                            ? 'Enter the 6-digit code sent to your email.' 
                            : 'Enter your new password below.')) 
                    : (isSignUp ? 'Sign up to lock in your early access slot.' : 'Sign in to access your dashboard.')}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
                  {authError}
                </div>
              )}

              {authSuccessMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium">
                  {authSuccessMsg}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email"
                    placeholder="Email address"
                    value={email}
                    disabled={isForgotPassword && resetStep !== 'email'}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                  />
                </div>

                {!isForgotPassword && (
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {isForgotPassword && resetStep === 'otp' && (
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="6-Digit OTP Code"
                      value={otpCode}
                      maxLength={6}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-cyan-400/50 text-xs text-white tracking-widest font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                )}

                {isForgotPassword && resetStep === 'new_password' && (
                  <div className="relative">
                    <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-cyan-400/50 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {authLoading 
                    ? 'Processing...' 
                    : (isForgotPassword 
                        ? (resetStep === 'email' 
                            ? 'Send OTP Code' 
                            : (resetStep === 'otp' ? 'Verify Code' : 'Save New Password')) 
                        : (isSignUp ? 'Sign Up' : 'Sign In'))}
                </button>
              </form>

              {!isForgotPassword && (
                <>
                  <div className="relative flex py-2 items-center mb-4">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-[11px] text-gray-500 uppercase font-mono">Or</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-gray-900 font-semibold text-xs flex items-center justify-center space-x-2.5 hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                {!isForgotPassword ? (
                  <>
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="hover:text-white transition-colors"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                    {!isSignUp && (
                      <button
                        onClick={() => { setIsForgotPassword(true); setResetStep('email'); setAuthError(''); setAuthSuccessMsg(''); }}
                        className="text-cyan-400 hover:underline transition-all"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => { setIsForgotPassword(false); setResetStep('email'); setAuthError(''); setAuthSuccessMsg(''); }}
                    className="text-cyan-400 hover:underline mx-auto transition-all"
                  >
                    ← Back to Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/[0.08] py-8 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <p>© {new Date().getFullYear()} ZyrisAI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}