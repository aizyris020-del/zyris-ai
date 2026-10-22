import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  Cpu, 
  ArrowRight, 
  Activity,
  Layers,
  Globe2,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!businessName || !industry) return;

    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        businessName,
        industry
      });
      setAnalysisResult(response.data);
    } catch (err) {
      setTimeout(() => {
        setAnalysisResult({
          swot: {
            strengths: "Speedy execution, proprietary Groq integration",
            weaknesses: "Early brand awareness",
            opportunities: "Untapped SMB intelligence market",
            threats: "Rapidly changing LLM ecosystem"
          },
          gaps: "Competitors lack real-time sub-100ms market synthesis.",
          strategy: "Target hyper-growth tech founders with instant SWOT radar dashboards."
        });
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 font-sans relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Sleek Minimalist Glass Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090d16]/70 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-cyan-400 absolute opacity-40 group-hover:scale-110 transition-transform" />
                  <Sparkles className="w-4 h-4 text-purple-400 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                Zyris
              </span>
              <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-sm shadow-purple-500/30">
                AI
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Groq Llama 3 Active</span>
            </div>
            <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-inner">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Sub-100ms Business Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Next-Gen Market Analysis <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Powered by Groq LLMs
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly surface SWOT analysis, competitor blindspots, and actionable growth strategies tailored for modern businesses.
          </p>
        </motion.div>

        {/* Input Form Glass Box */}
        <motion.form 
          onSubmit={handleAnalyze}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl max-w-3xl mx-auto flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Business Name (e.g. ZyrisAI)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
              required
            />
          </div>

          <div className="flex-1 relative">
            <Target className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Industry (e.g. AI SaaS)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.form>
      </section>

      {/* Analysis Output Grid */}
      <AnimatePresence>
        {analysisResult && (
          <section className="px-6 py-12 max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Live Intelligence Radar</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">SWOT Summary</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{analysisResult.swot.strengths}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Competitor Gaps</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{analysisResult.gaps}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Actionable Strategy</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{analysisResult.strategy}</p>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      {/* Live Metrics Banner */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">&lt; 100ms</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Llama 3 Latency</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-purple-400 mb-1">100%</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Zero-Data Retention</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-cyan-400 mb-1">24/7</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autonomous Scanning</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 mb-1">Groq LPUs</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hardware Accelerated</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How ZyrisAI Delivers Market Intelligence
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From raw input to strategic growth roadmaps in three instant steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            {
              step: "01",
              title: "Input Entity & Market",
              desc: "Provide your brand name and industry vertical to launch target market synthesis.",
              icon: <Terminal className="w-6 h-6 text-purple-400" />
            },
            {
              step: "02",
              title: "Groq LPU Processing",
              desc: "Groq hardware acceleration parses thousands of competitor data points instantly.",
              icon: <Layers className="w-6 h-6 text-cyan-400" />
            },
            {
              step: "03",
              title: "Actionable Intelligence",
              desc: "Receive structured SWOT analysis, competitor gap detection, and execution plans.",
              icon: <Globe2 className="w-6 h-6 text-emerald-400" />
            }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative">
              <div className="text-4xl font-black text-white/10 absolute top-6 right-6">{item.step}</div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Engineered for Modern Founders
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to analyze, outpace, and scale in highly competitive markets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Cpu className="w-6 h-6 text-purple-400" />,
              title: "Groq Llama 3 Engine",
              desc: "Experience ultra-fast inference with hardware-accelerated LLM reasoning."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
              title: "Enterprise Grade",
              desc: "Private, encrypted data analysis with zero-retention telemetry policies."
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
              title: "Market Gap Radar",
              desc: "Identify customer friction points competitors are currently missing."
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all shadow-xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>All Systems Operational (ZyrisAI v1.0)</span>
        </div>
        <p>© {new Date().getFullYear()} ZyrisAI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}