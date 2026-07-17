import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Cpu, Shield, Zap, Coins, Globe, Key, Flame, Lock, Sparkles } from 'lucide-react';
import { sound } from './SoundEngine';
import { Language, translations } from '../lib/i18n';

interface OnboardingProps {
  onStart: (playerName: string) => void;
  lang: Language;
  theme?: 'light' | 'dark';
  specialTokens: number;
}

export default function Onboarding({ onStart, lang, theme = 'light', specialTokens }: OnboardingProps) {
  const [name, setName] = useState(() => localStorage.getItem('base_maze_player_name') || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(translations[lang].onboarding.error_name);
      sound.playError();
      return;
    }
    sound.playPowerup();
    onStart(trimmed);
  };

  const t = translations[lang].onboarding;

  // Localized B20 features
  const features = {
    en: [
      {
        title: "Mint",
        desc: "Mint new standard B20 tokens instantly with optimized L2 gas fees.",
        icon: <Coins size={20} className="text-[#0052FF]" />,
        glowColor: "rgba(0, 82, 255, 0.15)",
      },
      {
        title: "Burn",
        desc: "Programmatically reduce the total supply to trigger deflation.",
        icon: <Flame size={20} className="text-red-500" />,
        glowColor: "rgba(239, 68, 68, 0.15)",
      },
      {
        title: "Roles",
        desc: "Manage standard permissions and roles with absolute security.",
        icon: <Shield size={20} className="text-emerald-500" />,
        glowColor: "rgba(16, 185, 129, 0.15)",
      },
      {
        title: "Supply Cap",
        desc: "Restrict token distribution with hard-coded smart contracts.",
        icon: <Lock size={20} className="text-amber-500" />,
        glowColor: "rgba(245, 158, 11, 0.15)",
      }
    ],
    id: [
      {
        title: "Mint",
        desc: "Cetak token standar B20 baru secara instan dengan biaya gas L2 optimal.",
        icon: <Coins size={20} className="text-[#0052FF]" />,
        glowColor: "rgba(0, 82, 255, 0.15)",
      },
      {
        title: "Burn",
        desc: "Kurangi suplai total secara terprogram untuk memicu deflasi.",
        icon: <Flame size={20} className="text-red-500" />,
        glowColor: "rgba(239, 68, 68, 0.15)",
      },
      {
        title: "Roles",
        desc: "Kelola hak akses dan peran standar dengan keamanan mutlak.",
        icon: <Shield size={20} className="text-emerald-500" />,
        glowColor: "rgba(16, 185, 129, 0.15)",
      },
      {
        title: "Supply Cap",
        desc: "Batasi distribusi token dengan smart contract tertulis.",
        icon: <Lock size={20} className="text-amber-500" />,
        glowColor: "rgba(245, 158, 11, 0.15)",
      }
    ],
    zh: [
      {
        title: "Mint",
        desc: "利用优化的 L2 Gas 费，即时铸造新的标准 B20 代币。",
        icon: <Coins size={20} className="text-[#0052FF]" />,
        glowColor: "rgba(0, 82, 255, 0.15)",
      },
      {
        title: "Burn",
        desc: "通过编程减少总供应量，以触发通缩机制。",
        icon: <Flame size={20} className="text-red-500" />,
        glowColor: "rgba(239, 68, 68, 0.15)",
      },
      {
        title: "Roles",
        desc: "以绝对安全性，轻松管理标准权限与角色分配。",
        icon: <Shield size={20} className="text-emerald-500" />,
        glowColor: "rgba(16, 185, 129, 0.15)",
      },
      {
        title: "Supply Cap",
        desc: "通过硬编码智能合约，严格限制代币的最大发行量。",
        icon: <Lock size={20} className="text-amber-500" />,
        glowColor: "rgba(245, 158, 11, 0.15)",
      }
    ],
    fr: [
      {
        title: "Mint",
        desc: "Création de nouveaux jetons B20 instantanément avec frais de gas L2 optimisés.",
        icon: <Coins size={20} className="text-[#0052FF]" />,
        glowColor: "rgba(0, 82, 255, 0.15)",
      },
      {
        title: "Burn",
        desc: "Réduisez l'approvisionnement total par programme pour déclencher la déflation.",
        icon: <Flame size={20} className="text-red-500" />,
        glowColor: "rgba(239, 68, 68, 0.15)",
      },
      {
        title: "Roles",
        desc: "Gérez les permissions et les rôles standard en toute sécurité.",
        icon: <Shield size={20} className="text-emerald-500" />,
        glowColor: "rgba(16, 185, 129, 0.15)",
      },
      {
        title: "Supply Cap",
        desc: "Limitez la distribution des jetons via des contrats intelligents codés en dur.",
        icon: <Lock size={20} className="text-amber-500" />,
        glowColor: "rgba(245, 158, 11, 0.15)",
      }
    ]
  };

  const currentFeatures = features[lang] || features['en'];

  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-10">
      
      {/* Decorative Stamp Seal with Glowing Base Blue Aura */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex items-center justify-center mb-6"
      >
        {/* Soft Blue Ambient Glow behind logo */}
        <div className="absolute -inset-4 bg-[#0052FF]/20 blur-2xl rounded-full" />
        
        {/* Circular Logo Card */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,82,255,0.25)] relative z-10 animate-pulse-ring">
          <div className="w-18 h-18 rounded-full bg-[#0052FF] flex items-center justify-center relative shadow-inner">
            <span className="font-serif italic font-extrabold text-2xl text-white tracking-tighter">B</span>
            <span className="font-mono font-black text-xs text-white relative -top-1">20</span>
          </div>
        </div>
      </motion.div>

      {/* Headings - Premium Typography Hierarchy */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-center mb-10 max-w-xl"
      >
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-deep-navy leading-tight">
          Find Your Way to B20
        </h1>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 font-sans font-normal">
          Explore the maze, collect essential B20 components, unlock hidden paths, and reach the launch portal. Learn the new B20 token standard while enjoying an interactive adventure built on Base.
        </p>
      </motion.div>

      {/* Premium Glassmorphic Feature Grid */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full mb-10 font-sans"
      >
        {currentFeatures.map((feat, index) => (
          <div 
            key={index} 
            className="p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 cora-desk-card hover:cora-desk-card-active group relative overflow-hidden"
          >
            {/* Subtle glow hover layer */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${feat.glowColor} 0%, transparent 70%)`
              }}
            />

            {/* Glowing Icon Wrapper */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 bg-[#0052FF]/10 border border-[#0052FF]/15 text-[#0052FF] shadow-inner group-hover:scale-105 transition-transform duration-300">
              {feat.icon}
            </div>

            <h3 className="text-xs font-bold tracking-wider uppercase text-deep-navy mb-2 font-serif">{feat.title}</h3>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {feat.desc}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Start Form - Pristine Styling */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-xl p-6 rounded-3xl border border-[#0052FF]/12 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,82,255,0.06)] font-sans"
      >
        <div className="mb-5">
          <label className="block text-[10px] font-mono uppercase tracking-widest mb-2.5 text-deep-navy/60 font-bold">
            {t.input_label}
          </label>
          <input
            type="text"
            maxLength={18}
            id="builder-name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder={t.input_placeholder}
            className="w-full border border-slate-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/30 rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-300 font-mono bg-slate-50 text-deep-navy placeholder-slate-400"
          />
          {error && (
            <p className="text-xs text-red-500 mt-2 font-mono flex items-center gap-1 font-bold">
              • {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full font-sans font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-white bg-[#0052FF] hover:bg-[#0052FF]/95 active:scale-[0.99] shadow-[0_4px_20px_rgba(0,82,255,0.25)] hover:shadow-[0_8px_30px_rgba(0,82,255,0.4)] transition-all duration-300 group cursor-pointer border border-[#0052FF]/10"
        >
          {t.start_btn}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-white/90" />
        </button>

        {/* Form Footer Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-6 text-[9px] font-mono border-t border-slate-100 pt-4 text-slate-400 select-none">
          <div className="flex items-center gap-1 justify-center sm:justify-start">
            <Cpu size={10} className="text-[#0052FF]" />
            <span>{t.est_confirmation}</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Globe size={10} className="text-[#0052FF]" />
            <span>{t.base_fees}</span>
          </div>
          <div className="flex items-center gap-1 justify-center sm:justify-end text-amber-600">
            <Key size={10} className="animate-pulse" />
            <span>
              {lang === 'id' ? `KUNCI: ${specialTokens}` : `KEYS: ${specialTokens}`}
            </span>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
