import React from 'react';
// Adjust the filename below to match your file (e.g., logo.svg, logo.png)
import logoAsset from '../assets/logo.svg';

export const ZyrisLogo = ({ size = "md", showText = true }) => {
  const dimensions = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Container with Ambient Glow */}
      <div className={`relative flex items-center justify-center ${dimensions[size]}`}>
        {/* Neon Glow background effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-violet-600 rounded-xl blur-md opacity-70 animate-pulse"></div>
        
        {/* Logo Box */}
        <div className="relative w-full h-full bg-slate-900 border border-slate-700/60 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-inner">
          <img 
            src={logoAsset} 
            alt="ZyrisAI Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className="text-xl font-bold tracking-tight text-white font-sans">
          Zyris<span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">AI</span>
        </span>
      )}
    </div>
  );
};