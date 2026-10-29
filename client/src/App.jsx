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
  EyeOff,
  ChevronDown,
  Calculator,
  Play,
  Check
} from 'lucide-react';
import { 
  auth, 
  loginWithGoogle, 
  loginWithEmail, 
  signUpWithEmail, 
  logoutUser 
} from './firebase';
import { onAuthStateChanged, getAdditionalUserInfo } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Password Visibility Eye Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  // Dynamic Toast Notification State
  const [toast, setToast] = useState(null);

  // --- INTERACTIVE LANDING PAGE STATES ---
  // 1. Live Interactive Demo Simulator
  const [demoInput, setDemoInput] = useState('');
  const [demoIndustry, setDemoIndustry] = useState('E-Commerce');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedReport, setSimulatedReport] = useState(null);

  // 2. Interactive ROI Calculator
  const [teamSize, setTeamSize] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(65);

  // 3. Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

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

  const handleSimulateDemo = () => {
    if (!demoInput.trim()) {
      showToast('Please enter a business or product name to simulate.', 'error');
      return;
    }
    setIsSimulating(true);
    setSimulatedReport(null);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedReport({
        name: demoInput,
        industry: demoIndustry,
        growthPotential: '+38.4%',
        opportunityScore: '92/100',
        keyGap: `High demand for automated ${demoIndustry} delivery loops`,
        executionTime: '88ms'
      });
      showToast('Instant demo intelligence generated in 88ms!', 'success');
    }, 1200);
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

  // PROTECTED DASHBOARD FOR AUTHENTICATED USER
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

        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-white/10 px-4 sm:px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2.5 cursor-pointer">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0b1329] rounded-[11px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black text-base sm:text-lg">Z</span>
                </div>
              </div>
              <div className="flex items-center space-x-0.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Zyris</span>
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </div>
            </motion.div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono tracking-tight shrink-0 flex items-center space-x-1">
                <span>⚡</span>
                <span className="font-medium">{userProfile ? userProfile.credits : 2}</span>
                <span className="hidden sm:inline text-cyan-400/70">Credits</span>
              </motion.div>

              <div className="flex items-center space-x-2 sm:space-x-3 bg-white/[0.04] border border-white/10 px-2.5 sm:px-3.5 py-1.5 rounded-xl">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-400/50" />
                ) : (
                  <User className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-xs font-medium text-white max-w-[100px] sm:max-w-none truncate">{user.displayName || user.email}</span>
                <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={handleLogout} className="text-gray-400 hover:text-rose-400 transition-colors p-1" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
            className="max-w-xl w-full text-center p-6 sm:p-12 rounded-3xl bg-[#080d1a] border border-cyan-500/20 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
          >
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 4 }} 
              className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" 
            />

            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-6 shadow-inner"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>VIP EARLY ACCESS CONFIRMED</span>
            </motion.div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              ZyrisAI Engine <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Preparing for Deployment
              </span>
            </h1>

            <p className="text-gray-400 text-xs sm:text-base leading-relaxed mb-8">
              Welcome aboard, <span className="text-white font-semibold">{user.displayName || user.email}</span>! You are officially on the priority queue for our Groq LPU sub-100ms market reasoning engine.
            </p>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-400 hover:text-white transition-all shadow-lg"
            >
              Sign out of session
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  // PUBLIC LANDING PAGE WITH INTERACTIVE TOOLS
  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Animated Ambient Glows */}
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 8 }} 
        className="fixed -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 10, delay: 2 }} 
        className="fixed -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" 
      />

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

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b1329] rounded-[11px] flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black text-lg">Z</span>
              </div>
            </div>
            <div className="flex items-center space-x-0.5">
              <span className="text-2xl font-black tracking-tight text-white">Zyris</span>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </div>
          </motion.div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsSignUp(false); setIsForgotPassword(false); setShowAuthModal(true); }}
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsSignUp(true); setIsForgotPassword(false); setShowAuthModal(true); }}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold mb-6 shadow-inner cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SUB-100MS INTELLIGENCE ENGINE • V1.0 READY</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Next–Gen Business Intelligence <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Powered by Groq LPUs
            </span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Turn any business or industry vertical into your next strategic advantage. Surface market shifts, competitor blind spots, and instant execution roadmaps.
          </p>
        </motion.div>
      </section>

      {/* INTERACTIVE FEATURE #1: LIVE DEMO SIMULATOR */}
      <section className="px-4 sm:px-6 pb-16 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}
          className="p-6 sm:p-8 rounded-3xl bg-[#080d1a] border border-cyan-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl transition-colors"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }} className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Play className="w-5 h-5 fill-cyan-400" />
            </motion.div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Interactive Strategy Simulator</h2>
              <p className="text-xs text-gray-400">Test drive the Groq LPU engine on any sample business instantly.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <input 
              type="text" 
              placeholder="e.g., Lumina Coffee, Acme SaaS"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
            <select 
              value={demoIndustry} 
              onChange={(e) => setDemoIndustry(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#0b1329] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all"
            >
              <option value="E-Commerce">E-Commerce</option>
              <option value="B2B SaaS">B2B SaaS</option>
              <option value="Local Business">Local Business</option>
              <option value="Fintech">Fintech</option>
            </select>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSimulateDemo}
            disabled={isSimulating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center justify-center space-x-2"
          >
            {isSimulating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scanning Groq LPUs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Instant Analysis Preview</span>
              </>
            )}
          </motion.button>

          {simulatedReport && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-cyan-500/20 text-xs space-y-2 text-left shadow-inner"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold text-cyan-300">{simulatedReport.name} ({simulatedReport.industry})</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{simulatedReport.executionTime}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-gray-400 block text-[10px]">Growth Potential</span>
                  <span className="text-emerald-400 font-bold">{simulatedReport.growthPotential}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Opportunity Score</span>
                  <span className="text-cyan-400 font-bold">{simulatedReport.opportunityScore}</span>
                </div>
              </div>
              <p className="text-gray-300 pt-1"><strong>Primary Gap:</strong> {simulatedReport.keyGap}</p>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* INTERACTIVE FEATURE #2: ROI CALCULATOR */}
      <section className="px-4 sm:px-6 pb-16 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          className="p-6 sm:p-8 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl backdrop-blur-xl transition-colors"
        >
          <div className="flex items-center space-x-3 mb-6">
            <motion.div whileHover={{ scale: 1.1 }} className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Calculator className="w-5 h-5" />
            </motion.div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Interactive ROI Calculator</h2>
              <p className="text-xs text-gray-400">See how much engineering & strategy time ZyrisAI saves your team every month.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs text-gray-300 font-medium block mb-2">Team Strategy Hours / Month: <span className="text-cyan-400 font-bold">{teamSize * 10} hrs</span></label>
              <input 
                type="range" min="1" max="25" value={teamSize} 
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 font-medium block mb-2">Average Hourly Rate: <span className="text-cyan-400 font-bold">${hourlyRate}/hr</span></label>
              <input 
                type="range" min="25" max="200" step="5" value={hourlyRate} 
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-cyan-500/30 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[11px] text-gray-400 block uppercase font-mono">Estimated Monthly Savings</span>
              <motion.span 
                key={teamSize * hourlyRate}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-black text-emerald-400 block"
              >
                ${(teamSize * 10 * hourlyRate * 0.85).toLocaleString()}
              </motion.span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsSignUp(true); setShowAuthModal(true); }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-gray-900 font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              Claim Your Savings
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* INTERACTIVE FEATURE #3: FAQ ACCORDION */}
      <section className="px-4 sm:px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "How fast is the sub-100ms reasoning engine?", a: "By leveraging Groq LPU hardware acceleration, ZyrisAI compiles market intelligence briefings in 88ms to 120ms—over 50x faster than traditional LLM chains." },
            { q: "Is my business strategy data private?", a: "Yes! We operate on a strict Zero Data Retention model. Queries run in memory and are never saved or used to train public models." },
            { q: "How many free trial credits do I get?", a: "Every new account receives 2 free full-length strategy briefs upon account creation." }
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden backdrop-blur-xl"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left text-xs sm:text-sm font-semibold text-white flex justify-between items-center hover:bg-white/[0.02] transition-colors"
              >
                <span>{item.q}</span>
                <motion.div animate={{ rotate: openFaq === idx ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 pt-0 text-xs text-gray-400 border-t border-white/5 leading-relaxed"
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Auth Modal with Password Visibility Toggles */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#080d1a] border border-cyan-500/20 shadow-2xl relative overflow-hidden"
            >
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setShowAuthModal(false); setIsForgotPassword(false); setResetStep('email'); }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {isForgotPassword 
                    ? (resetStep === 'email' ? 'Reset Password' : (resetStep === 'otp' ? 'Enter OTP Code' : 'Set New Password')) 
                    : (isSignUp ? 'Create your ZyrisAI Account' : 'Welcome back')}
                </h3>
              </div>

              {authError && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
                  {authError}
                </motion.div>
              )}

              {authSuccessMsg && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium">
                  {authSuccessMsg}
                </motion.div>
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-cyan-400/50 text-xs text-white tracking-widest font-mono"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-cyan-400/50 text-xs text-white"
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
                >
                  {authLoading ? 'Processing...' : (isForgotPassword ? (resetStep === 'email' ? 'Send OTP Code' : (resetStep === 'otp' ? 'Verify Code' : 'Save New Password')) : (isSignUp ? 'Sign Up' : 'Sign In'))}
                </motion.button>
              </form>

              {!isForgotPassword && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-gray-900 font-semibold text-xs flex items-center justify-center space-x-2.5 hover:bg-gray-100 transition-all shadow-md"
                >
                  <span>Continue with Google</span>
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-gray-500 relative z-10">
        © {new Date().getFullYear()} ZyrisAI Inc. All rights reserved.
      </footer>
    </div>
  );
}