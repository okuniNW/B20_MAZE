import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Music,
  Trophy,
  Layers,
  Menu,
  ChevronDown,
  X,
  ChevronRight,
  HelpCircle,
  History,
  TrendingUp,
  Copy,
  Moon,
  Sun,
  Check,
  Star,
  Shield,
  FileText,
  CreditCard,
  Map,
  Send,
  Heart,
  Sparkles
} from 'lucide-react';
import { Difficulty, ScoreEntry } from './types';
import Onboarding from './components/Onboarding';
import MazeBoard from './components/MazeBoard';
import Leaderboard from './components/Leaderboard';
import { sound } from './components/SoundEngine';
import { Language, translations } from './lib/i18n';
import ClipboardPanel from './components/ClipboardPanel';
import FooterModals from './components/FooterModals';
// @ts-ignore
import soltWagnerImage from './assets/images/solt_wagner_1784096460966.jpg';
// @ts-ignore
import hillsBgImage from './assets/images/neoclassical_facade_1784182720447.jpg';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'playing' | 'leaderboard'>('home');
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('base_maze_lang') as Language) || 'en';
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('base_maze_player_name') || '';
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(() => {
    return localStorage.getItem('base_maze_music_on') !== 'false';
  });
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'features' | 'faq' | 'updates' | 'clipboard' | 'pricing' | 'privacy' | 'terms' | 'portal' | 'feedback' | 'roadmap'>('none');
  const [gameMode, setGameMode] = useState<'classic' | 'campaign'>('campaign');
  const [campaignLevel, setCampaignLevel] = useState<number>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    return Number(localStorage.getItem('base_maze_unlocked_level') || '1');
  });

  const [specialTokens, setSpecialTokens] = useState<number>(() => {
    return Number(localStorage.getItem('base_maze_special_tokens') || '1');
  });

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isBetaActive, setIsBetaActive] = useState(false);
  const [votedFeatures, setVotedFeatures] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('base_maze_special_tokens', String(specialTokens));
  }, [specialTokens]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('base_maze_dark_mode');
  }, []);

  // Sync music state with SoundEngine
  useEffect(() => {
    sound.setMusicEnabled(isMusicOn);
    return () => {
      sound.setMusicEnabled(false);
    };
  }, [isMusicOn]);

  // Auto-rotate news ticker updates
  useEffect(() => {
    const tickers = translations[lang].news_ticker;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [lang]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMute(nextMuted);
    sound.playMove();
  };

  const handleToggleMusic = () => {
    const nextMusic = !isMusicOn;
    setIsMusicOn(nextMusic);
    localStorage.setItem('base_maze_music_on', String(nextMusic));
    sound.playMove();
  };

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('base_maze_player_name', name);
    setScreen('playing');
  };

  const handleLevelCompleted = (nextLvl: number) => {
    sound.playPowerup();
    setCampaignLevel(nextLvl);
    const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
    setUnlockedLevel(currentUnlocked);
  };

  const handleBackToMenu = () => {
    const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
    setUnlockedLevel(currentUnlocked);
    setScreen('home');
  };

  const handleGameCompleted = (score: ScoreEntry) => {
    sound.playWin();
    setScreen('leaderboard');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-cerulean-sky/20 text-deep-navy cora-canvas">
      
      {/* FLOATING HEADER PILL (COOLDOCK / IMAGE 2 STYLE) */}
      <div className="sticky top-0 z-50 w-full px-4 pt-4 pb-2">
        <header className="relative mx-auto max-w-2xl bg-[#0052FF]/10 backdrop-blur-[24px] rounded-full border border-white/20 shadow-[0_12px_40px_rgba(0,82,255,0.15)] hover:shadow-[0_16px_48px_rgba(0,82,255,0.25)] hover:border-white/30 px-5 py-3 flex items-center justify-between transition-all duration-300">
          
          {/* Empty spacer to balance the menu button on the right */}
          <div className="w-10 h-10 flex-shrink-0" />

          {/* Centered Logo & Brand title */}
          <div 
            onClick={() => { sound.playMove(); setScreen('home'); }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center cursor-pointer group select-none z-10"
          >
            {/* Custom Base Wordmark SVG Logo */}
            <svg 
              viewBox="0 0 440 150" 
              className="h-5 w-auto text-white transition-all duration-300 group-hover:scale-105 flex-shrink-0"
              fill="currentColor"
            >
              {/* b-shape */}
              <path d="M 12 0 C 5.37 0 0 5.37 0 12 L 0 134 C 0 142.84 7.16 150 16 150 L 84 150 C 92.84 150 100 142.84 100 134 L 100 66 C 100 57.16 92.84 50 84 50 L 24 50 L 24 12 C 24 5.37 18.63 0 12 0 Z" />
              {/* second square */}
              <rect x="112" y="50" width="100" height="100" rx="16" />
              {/* third square */}
              <rect x="224" y="50" width="100" height="100" rx="16" />
              {/* fourth square */}
              <rect x="336" y="50" width="100" height="100" rx="16" />
            </svg>
          </div>

          {/* Menu Button with Hamburger Menu Icon */}
          <button
            onClick={() => { sound.playMove(); setIsMenuOpen(!isMenuOpen); }}
            className="p-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer select-none"
            aria-label="Toggle menu"
          >
            <Menu size={16} />
          </button>
        </header>
      </div>

      {/* FULL SCREEN OVERLAY MENU CARD */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Frosted Glass Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Menu Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-[#0A0A0A]/90 backdrop-blur-[24px] rounded-[32px] shadow-[0_25px_60px_rgba(0,82,255,0.25)] flex flex-col p-6 font-sans border border-white/10 z-10 max-h-[calc(100vh-2.5rem)] overflow-y-auto scrollbar-none text-left text-white"
            >
              {/* Header inside Menu Card */}
              <div className="flex items-center justify-between mb-6 select-none">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full border border-white/20 bg-[#0052FF] flex items-center justify-center shadow-sm">
                    <span className="font-serif italic font-extrabold text-xs text-white">B</span>
                    <span className="font-mono font-bold text-[8px] text-white relative -top-1">20</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-serif font-extrabold text-sm tracking-wide leading-tight text-white">
                      Find Your Way to B20
                    </span>
                    <span className="block text-[8px] font-mono text-white/70 uppercase tracking-widest leading-none mt-0.5">
                      {translations[lang].header.subtitle}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { sound.playMove(); setIsMenuOpen(false); }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu items */}
              <div className="flex flex-col gap-4 mb-6 text-left">
                {/* LANGUAGE SECTION */}
                <div className="flex flex-col select-none">
                  <div className="text-[10px] font-mono tracking-widest text-white/70 uppercase mb-2">
                    LANGUAGE / BAHASA
                  </div>
                  <div className="grid grid-cols-4 bg-white/5 p-1 rounded-[16px] border border-white/10">
                    {(['en', 'id', 'zh', 'fr'] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          sound.playMove();
                          setLang(l);
                          localStorage.setItem('base_maze_lang', l);
                        }}
                        className={`py-2 text-xs font-bold rounded-[12px] transition-all cursor-pointer ${
                          lang === l
                            ? 'bg-[#0052FF] text-white shadow-sm'
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider line */}
                <div className="h-px bg-white/10 my-2 w-full" />

                {/* Leaderboard option */}
                <button
                  onClick={() => {
                    sound.playMove();
                    setScreen('leaderboard');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white rounded-[20px] py-4 px-5 flex items-center justify-between font-sans font-medium text-base transition-all duration-200 cursor-pointer border border-white/10"
                >
                  <div className="flex items-center gap-3.5">
                    <Trophy className="w-5 h-5 text-white" />
                    <span>{translations[lang].header.leaderboard}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </button>

                {/* Mute sounds option */}
                <button
                  onClick={() => {
                    handleToggleMute();
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white rounded-[20px] py-4 px-5 flex items-center gap-3.5 font-sans font-medium text-base transition-all duration-200 cursor-pointer text-left border border-white/10"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-5 h-5 text-white" />
                      <span>{translations[lang].header.unmute}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 text-white" />
                      <span>{translations[lang].header.mute}</span>
                    </>
                  )}
                </button>

                {/* Play background music option */}
                <button
                  onClick={() => {
                    handleToggleMusic();
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white rounded-[20px] py-4 px-5 flex items-center gap-3.5 font-sans font-medium text-base transition-all duration-200 cursor-pointer text-left border border-white/10"
                >
                  <Music className={`w-5 h-5 text-white ${isMusicOn ? 'animate-spin' : ''}`} style={isMusicOn ? { animationDuration: '4s' } : undefined} />
                  <span>{isMusicOn ? translations[lang].header.music_off : translations[lang].header.music_on}</span>
                </button>

              </div>

              {/* Bottom Start Journey Action Button */}
              <button
                onClick={() => {
                  sound.playMove();
                  setIsMenuOpen(false);
                  const inputEl = document.getElementById('builder-name-input');
                  if (inputEl) {
                    inputEl.focus();
                  }
                  const boardEl = document.getElementById('maze-board-container');
                  if (boardEl) {
                    boardEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-[#0052FF] text-white hover:bg-[#0052FF]/90 active:scale-[0.98] rounded-[20px] py-4 px-5 font-sans font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,82,255,0.25)] transition-all duration-200 cursor-pointer border border-white/10"
              >
                <span>Mulai Perjalanan (Start Journey)</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COOLDOCK SUB-MODALS */}
      <AnimatePresence>
        {activeModal === 'features' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#061d33]/20 backdrop-blur-sm"
              onClick={() => setActiveModal('none')}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-deep-navy/15 z-10 text-deep-navy font-sans"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-deep-navy/5">
                <h3 className="text-lg font-serif font-light text-deep-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cerulean-sky animate-pulse" />
                  TOTS Core Features
                </h3>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded-full hover:bg-deep-navy/5 text-deep-navy/40 hover:text-deep-navy transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                <div className="p-3 bg-cloud-white/60 rounded-xl border border-deep-navy/5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cerulean-sky font-bold block mb-1">
                    01 · Procedural Maze Space
                  </span>
                  <p className="text-xs text-deep-navy/85 leading-relaxed">
                    Every level dynamically generates optimized grid networks. Paths are procedurally validated using depth-first search (DFS) with real-time feedback loops.
                  </p>
                </div>
                <div className="p-3 bg-cloud-white/60 rounded-xl border border-deep-navy/5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-warm-red font-bold block mb-1">
                    02 · Procedural Audio Synth
                  </span>
                  <p className="text-xs text-deep-navy/85 leading-relaxed">
                    No static wave files! Footsteps, collisions, and validator triggers are generated mathematically using Web Audio API oscillators and linear ramp frequency filters.
                  </p>
                </div>
                <div className="p-3 bg-cloud-white/60 rounded-xl border border-deep-navy/5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mb-1">
                    03 · Cora UI Aesthetic
                  </span>
                  <p className="text-xs text-deep-navy/85 leading-relaxed">
                    Ditching the chaotic dark slop gradients, Cora UI uses off-white glass, generous spacing, serif display fonts, and physical shadow elevations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-full mt-5 cora-btn-primary py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}

        {activeModal === 'faq' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#061d33]/20 backdrop-blur-sm"
              onClick={() => setActiveModal('none')}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-deep-navy/15 z-10 text-deep-navy font-sans"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-deep-navy/5">
                <h3 className="text-lg font-serif font-light text-deep-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warm-red animate-pulse" />
                  Frequently Asked Questions
                </h3>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded-full hover:bg-deep-navy/5 text-deep-navy/40 hover:text-deep-navy transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                <div className="p-3 bg-cloud-white/40 rounded-xl border border-deep-navy/5">
                  <h4 className="text-xs font-bold text-deep-navy mb-1">How is the score calculated?</h4>
                  <p className="text-[11px] text-deep-navy/75 leading-relaxed">
                    Your final Speedrun rating is derived from your total completion time and Transaction-Per-Second (TPS) processing throughput. Faster clears yield higher TPS.
                  </p>
                </div>
                <div className="p-3 bg-cloud-white/40 rounded-xl border border-deep-navy/5">
                  <h4 className="text-xs font-bold text-deep-navy mb-1">What are special tokens for?</h4>
                  <p className="text-[11px] text-deep-navy/75 leading-relaxed">
                    You can gather special tokens hidden in random grid locations. These tokens allow you to solve/validate complex nodes instantly or unlock secret corridors.
                  </p>
                </div>
                <div className="p-3 bg-cloud-white/40 rounded-xl border border-deep-navy/5">
                  <h4 className="text-xs font-bold text-deep-navy mb-1">How do I mute/unmute the music?</h4>
                  <p className="text-[11px] text-deep-navy/75 leading-relaxed">
                    Use the toggles in our beautiful unified Dashboard inside the <strong>Clipboard manager</strong> panel, or directly on the header bar indicators!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-full mt-5 cora-btn-primary py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Close FAQ
              </button>
            </motion.div>
          </div>
        )}

        {activeModal === 'updates' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#061d33]/20 backdrop-blur-sm"
              onClick={() => setActiveModal('none')}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-deep-navy/15 z-10 text-deep-navy font-sans"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-deep-navy/5">
                <h3 className="text-lg font-serif font-light text-deep-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Changelog & Updates
                </h3>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded-full hover:bg-deep-navy/5 text-deep-navy/40 hover:text-deep-navy transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                <div className="relative pl-4 border-l border-deep-navy/10">
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-cerulean-sky -translate-x-[4px]" />
                  <span className="text-[10px] font-mono font-bold text-cerulean-sky">v1.1.0 · CURRENT</span>
                  <h4 className="text-xs font-bold text-deep-navy mt-0.5">Cooldock Premium Header Integration</h4>
                  <p className="text-[11px] text-deep-navy/70 mt-1">
                    Re-designed the navigation header into a floating rounded pill. Added the high-end Cooldock glass dropdown menu modal overlay with detailed functional sub-systems.
                  </p>
                </div>
                <div className="relative pl-4 border-l border-deep-navy/10">
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-deep-navy/30 -translate-x-[4px]" />
                  <span className="text-[10px] font-mono font-bold text-deep-navy/40">v1.0.5</span>
                  <h4 className="text-xs font-bold text-deep-navy mt-0.5">Procedural Audio Enhancement</h4>
                  <p className="text-[11px] text-deep-navy/70 mt-1">
                    Engineered the Sound Engine to utilize continuous looping and linear ramps (1s fade) on volume transition to satisfy strict web compliance and smooth client-side audio.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-full mt-5 cora-btn-primary py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Excellent
              </button>
            </motion.div>
          </div>
        )}

        {activeModal === 'pricing' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#061d33]/20 backdrop-blur-sm"
              onClick={() => setActiveModal('none')}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-deep-navy/15 z-10 text-deep-navy font-sans"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-deep-navy/5">
                <h3 className="text-lg font-serif font-light text-deep-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Base Gas & Throughput
                </h3>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded-full hover:bg-deep-navy/5 text-deep-navy/40 hover:text-deep-navy transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-deep-navy/70 leading-relaxed">
                  Base operates as an ultra-fast L2. Transactions are batched and posted to L1 Ethereum, maintaining high safety at a fraction of the gas pricing.
                </p>
                <div className="p-4 bg-[#f8fafc] border border-deep-navy/5 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-deep-navy/50 uppercase tracking-widest font-bold">Gas Consumption Level</span>
                    <span className="text-xs font-mono font-bold text-amber-600">0.0001 Gwei</span>
                  </div>
                  <div className="flex items-end gap-2.5 h-20 pt-2 border-b border-deep-navy/10 select-none">
                    {/* Elegant mock bars */}
                    {[20, 35, 15, 60, 45, 80, 25, 90, 40].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-cerulean-sky rounded-t-sm transition-all duration-500" 
                          style={{ height: `${val}%` }} 
                        />
                        <span className="text-[8px] font-mono text-deep-navy/40">b{idx+1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-deep-navy/60">
                    <span>Throughput Limit: 4,000 TPS</span>
                    <span className="text-cerulean-sky font-bold">99.8% Efficiency</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-full mt-5 cora-btn-primary py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}

        {activeModal === 'clipboard' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#061d33]/20 backdrop-blur-sm"
              onClick={() => setActiveModal('none')}
            />
            <ClipboardPanel
              playerName={playerName}
              gameMode={gameMode}
              unlockedLevel={unlockedLevel}
              specialTokens={specialTokens}
              lang={lang}
              setLang={setLang}
              isMuted={isMuted}
              handleToggleMute={handleToggleMute}
              isMusicOn={isMusicOn}
              handleToggleMusic={handleToggleMusic}
              onClose={() => setActiveModal('none')}
            />
          </div>
        )}

        <FooterModals
          activeModal={activeModal}
          onClose={() => setActiveModal('none')}
          lang={lang}
        />
      </AnimatePresence>

      {/* MAIN SCREEN ROUTER WITH ANIMATIONS */}
      <main className="flex-grow flex flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          
          {screen === 'home' && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              {/* Onboarding Widget with nested builder start form */}
              <Onboarding onStart={handleStartGame} lang={lang} theme="light" specialTokens={specialTokens} />

              {/* LEVEL CONFIGURATION CARDS (Difficulty selector) */}
              <div className="w-full max-w-2xl px-4 mt-2">
                <div className="p-6 rounded-2xl border-t-2 border-t-warm-red cora-desk-card font-sans">
                  <h3 className="text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-1.5 text-deep-navy/70 font-bold">
                    <Layers size={12} className="text-cerulean-sky" />
                    {translations[lang].difficulty.choose_structure}
                  </h3>

                  {/* MODE TABS */}
                  <div className="flex gap-2 p-1 bg-cloud-white border border-deep-navy/10 rounded-xl mb-4">
                    <button
                      type="button"
                      onClick={() => { sound.playMove(); setGameMode('campaign'); }}
                      className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
                        gameMode === 'campaign'
                          ? 'cora-btn-primary shadow-sm'
                          : 'text-deep-navy/60 hover:text-deep-navy'
                      }`}
                    >
                      🏆 {translations[lang].difficulty.campaign_tab}
                    </button>
                    <button
                      type="button"
                      onClick={() => { sound.playMove(); setGameMode('classic'); }}
                      className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
                        gameMode === 'classic'
                          ? 'cora-btn-primary shadow-sm'
                          : 'text-deep-navy/60 hover:text-deep-navy'
                      }`}
                    >
                      ⚡ {translations[lang].difficulty.classic_tab}
                    </button>
                  </div>

                  {gameMode === 'campaign' ? (
                    <div>
                      {/* Campaign summary */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wide flex items-center gap-1 text-deep-navy/70">
                          {translations[lang].difficulty.campaign_progress}: <span className="text-cerulean-sky">{unlockedLevel} / 50</span>
                        </span>
                        <span className="text-[11px] font-mono text-cerulean-sky font-bold">
                          {Math.round((unlockedLevel / 50) * 100)}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-cloud-white rounded-full overflow-hidden mb-4 border border-deep-navy/5">
                        <div
                          className="h-full bg-gradient-to-r from-deep-navy to-cerulean-sky rounded-full transition-all duration-500"
                          style={{ width: `${(unlockedLevel / 50) * 100}%` }}
                        ></div>
                      </div>

                      <p className="text-[11px] mb-4 leading-relaxed text-deep-navy/70">
                        {translations[lang].difficulty.campaign_desc}
                      </p>

                      {/* 1 - 50 Level Grid */}
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-52 overflow-y-auto pr-1">
                        {Array.from({ length: 50 }).map((_, i) => {
                          const lvl = i + 1;
                          const isUnlocked = lvl <= unlockedLevel;
                          const isSelected = lvl === campaignLevel;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              disabled={!isUnlocked}
                              onClick={() => {
                                sound.playMove();
                                setCampaignLevel(lvl);
                              }}
                              className={`relative py-2 rounded-lg text-center text-xs font-mono font-bold border transition-all flex flex-col items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'bg-deep-navy border-deep-navy text-white shadow-sm scale-105 z-10'
                                  : isUnlocked
                                    ? 'bg-white border-deep-navy/10 text-deep-navy hover:border-cerulean-sky hover:bg-cloud-white'
                                    : 'bg-cloud-white/40 border-deep-navy/5 text-deep-navy/20 cursor-not-allowed'
                              }`}
                            >
                              {isUnlocked ? (
                                <span>{lvl}</span>
                              ) : (
                                <span className="text-[10px]">🔒</span>
                              )}
                              {isUnlocked && lvl < unlockedLevel && (
                                <span className="absolute bottom-0.5 right-1 text-[7px] text-warm-red font-bold">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
                      
                      {/* Level 1: Easy */}
                      <button
                        type="button"
                        onClick={() => { sound.playMove(); setDifficulty('standard'); }}
                        className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                          difficulty === 'standard'
                            ? 'bg-cloud-white border-2 border-deep-navy shadow-sm'
                            : 'bg-white/50 border-deep-navy/10 hover:border-deep-navy/30 text-deep-navy/80 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-deep-navy">{translations[lang].difficulty.easy_title}</span>
                          <span className="text-[10px] font-mono font-bold text-cerulean-sky">10 x 10</span>
                        </div>
                        <p className="text-[11px] mt-1.5 leading-relaxed text-deep-navy/70">
                          {translations[lang].difficulty.easy_desc}
                        </p>
                      </button>

                      {/* Level 2: Medium */}
                      <button
                        type="button"
                        onClick={() => { sound.playMove(); setDifficulty('batch'); }}
                        className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                          difficulty === 'batch'
                            ? 'bg-cloud-white border-2 border-deep-navy shadow-sm'
                            : 'bg-white/50 border-deep-navy/10 hover:border-deep-navy/30 text-deep-navy/80 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-deep-navy">{translations[lang].difficulty.medium_title}</span>
                          <span className="text-[10px] font-mono text-warm-red font-bold">15 x 15</span>
                        </div>
                        <p className="text-[11px] mt-1.5 leading-relaxed text-deep-navy/70">
                          {translations[lang].difficulty.medium_desc}
                        </p>
                      </button>

                      {/* Level 3: Hard */}
                      <button
                        type="button"
                        onClick={() => { sound.playMove(); setDifficulty('superchain'); }}
                        className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                          difficulty === 'superchain'
                            ? 'bg-cloud-white border-2 border-deep-navy shadow-sm'
                            : 'bg-white/50 border-deep-navy/10 hover:border-deep-navy/30 text-deep-navy/80 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-deep-navy">{translations[lang].difficulty.hard_title}</span>
                          <span className="text-[10px] font-mono font-bold text-deep-navy">21 x 21</span>
                        </div>
                        <p className="text-[11px] mt-1.5 leading-relaxed text-deep-navy/70">
                          {translations[lang].difficulty.hard_desc}
                        </p>
                      </button>

                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'playing' && (
            <motion.div
               key="playing-screen"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.3 }}
            >
              <MazeBoard
                playerName={playerName}
                difficulty={difficulty}
                isCampaign={gameMode === 'campaign'}
                campaignLevel={campaignLevel}
                onLevelCompleted={handleLevelCompleted}
                onGameCompleted={handleGameCompleted}
                onBackToMenu={handleBackToMenu}
                lang={lang}
                theme="light"
                specialTokens={specialTokens}
                setSpecialTokens={setSpecialTokens}
              />
            </motion.div>
          )}

          {screen === 'leaderboard' && (
            <motion.div
               key="leaderboard-screen"
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               transition={{ duration: 0.3 }}
            >
              <Leaderboard 
                onBackToMenu={() => setScreen('home')} 
                currentDifficulty={difficulty}
                playerName={playerName}
                lang={lang}
                theme="light"
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER & LIVE BLOCK UPDATES TICKER */}
      <footer className="bg-[#0200FA] border-t border-white/10 pt-16 pb-8 px-4 sm:px-6 md:px-8 font-sans relative overflow-hidden transition-colors duration-300 text-white">
        
        {/* Top dynamic news broadcast ticker bar */}
        <div className="max-w-6xl mx-auto mb-12 border border-white/10 rounded-2xl px-4 py-2.5 bg-white/5 backdrop-blur-md flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 overflow-hidden flex-grow">
            <span className="bg-white/10 text-white border border-white/10 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded flex-shrink-0 select-none">
              LIVE BROADCAST
            </span>
            
            <div className="relative flex-grow h-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tickerIndex}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-mono text-white/80 absolute inset-x-0 truncate text-left"
                >
                  {translations[lang].news_ticker[tickerIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-white/50 uppercase tracking-widest pl-3 border-l border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>B20 MAZE ENGINE ACTIVE</span>
          </div>
        </div>

        {/* Main Columns Content */}
        <div className="max-w-6xl mx-auto text-left relative z-10">
          
          {/* Main Section: Heading, Description, Credit */}
          <div className="max-w-xl flex flex-col items-start">
            {/* Big Heading */}
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-tight mt-6 mb-4">
              Find Your Way to B20
            </h2>

            {/* Description */}
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
              Explore the maze, overcome challenges, and discover the new B20 token standard on Base. Play, learn, and reach the launch portal.
            </p>

            {/* Copyright details */}
            <div className="text-white/55 text-xs font-sans mb-4">
              © 2026 sividelia6 - All rights reserved
            </div>

            {/* Credit lines built by sividelia_okuni */}
            <div className="flex items-center gap-2.5 text-sm text-white">
              <span>Built with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
              <span>by</span>
              <a 
                href="https://x.com/sividelia6" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-cyan-200 hover:text-white hover:underline cursor-pointer"
              >
                sividelia_okuni
              </a>
            </div>
          </div>

        </div>

        {/* Beautiful scrolling green hills container at the very bottom */}
        <div className="max-w-6xl mx-auto relative w-full h-[280px] sm:h-[400px] md:h-[450px] overflow-hidden rounded-3xl mt-16 shadow-2xl border border-white/10 select-none">
          {/* Rolling green hills background image replaced with Base brand image */}
          <img 
            src="https://brand.base.org/_next/image?url=%2F_next%2Fstatic%2Fmedia%2F4.0p3kmo7.-wstk.jpg&w=1920&q=75" 
            alt="Base Brand Footer Background" 
            className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-transform duration-700 hover:scale-100"
            referrerPolicy="no-referrer"
          />
        </div>

      </footer>

    </div>
  );
}
