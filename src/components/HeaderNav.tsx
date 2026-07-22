import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Play,
  CheckSquare,
  Calendar,
  User,
  Award,
  Trophy,
  Droplet,
  Settings,
  Zap,
  Volume2,
  VolumeX,
  Music,
  Globe,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Flame,
  Shield,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { L2Theme } from '../types';
import { L2_THEMES } from '../lib/themes';
import { sound } from './SoundEngine';

export type ScreenType =
  | 'home'
  | 'play_hub'
  | 'quests'
  | 'events'
  | 'profile'
  | 'passport'
  | 'leaderboard'
  | 'faucet'
  | 'settings'
  | 'playing';

export type PageView = ScreenType;

export interface HeaderNavProps {
  currentScreen?: ScreenType;
  currentView?: ScreenType;
  onNavigate: (view: ScreenType) => void;
  lang: Language;
  setLang?: (lang: Language) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isMusicOn?: boolean;
  onToggleMusic?: () => void;
  l2Theme?: L2Theme;
  onQuickPlay: () => void;
  pendingRewardsCount?: number;
  xp?: number;
  reputation?: number;
  builderLevel?: number;
  specialTokens?: number;
  unlockedLevel?: number;
  customUsername?: string;
  customPfp?: string;
  activeSkin?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentScreen,
  currentView,
  onNavigate,
  lang,
  setLang,
  isMuted = false,
  onToggleMute = () => {},
  isMusicOn = true,
  onToggleMusic = () => {},
  l2Theme = 'base-blue',
  onQuickPlay,
  pendingRewardsCount = 0
}) => {
  const activeView = currentScreen || currentView || 'home';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const themeConfig = L2_THEMES[l2Theme] || L2_THEMES['base-blue'];

  const handleNavClick = (view: ScreenType) => {
    sound.playMove();
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const navItems: { id: PageView; labelEn: string; labelId: string; icon: React.ReactNode }[] = [
    { id: 'home', labelEn: 'Home', labelId: 'Beranda', icon: <Home size={16} /> },
    { id: 'play_hub', labelEn: 'Play Hub', labelId: 'Pusat Main', icon: <Play size={16} /> },
    { id: 'quests', labelEn: 'Quests', labelId: 'Misi', icon: <CheckSquare size={16} /> },
    { id: 'events', labelEn: 'Events', labelId: 'Acara', icon: <Calendar size={16} /> },
    { id: 'profile', labelEn: 'Profile', labelId: 'Profil', icon: <User size={16} /> },
    { id: 'passport', labelEn: 'Passport', labelId: 'Paspor', icon: <Award size={16} /> },
    { id: 'leaderboard', labelEn: 'Ranks', labelId: 'Peringkat', icon: <Trophy size={16} /> },
    { id: 'faucet', labelEn: 'Faucet', labelId: 'Faucet', icon: <Droplet size={16} /> },
    { id: 'settings', labelEn: 'Settings', labelId: 'Pengaturan', icon: <Settings size={16} /> },
  ];

  return (
    <>
      {/* STICKY TOP HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-deep-navy/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          {/* BRAND LOGO & L2 BADGE */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
          >
            <div className="relative w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center shadow-md shadow-[#0052FF]/20 group-hover:scale-105 transition-transform">
              <span className="font-serif italic font-extrabold text-white text-sm">B</span>
              <span className="font-mono font-bold text-[9px] text-white absolute top-1 right-1.5">20</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-black text-sm text-deep-navy tracking-tight group-hover:text-[#0052FF] transition-colors">
                  B20 MAZE
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20">
                  {themeConfig.ticker}
                </span>
              </div>
              <span className="text-[9px] font-mono text-deep-navy/60 hidden sm:block">
                Base L2 Gaming Ecosystem
              </span>
            </div>
          </button>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-deep-navy/5">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const label = lang === 'id' ? item.labelId : item.labelEn;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-white text-[#0052FF] shadow-sm font-bold'
                      : 'text-deep-navy/70 hover:text-deep-navy hover:bg-white/50'
                  }`}
                >
                  <span className={isActive ? 'text-[#0052FF]' : 'text-deep-navy/50'}>
                    {item.icon}
                  </span>
                  <span>{label}</span>

                  {/* Badge for quests pending rewards */}
                  {item.id === 'quests' && pendingRewardsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center gap-2">
            
            {/* QUICK PLAY CTA */}
            <button
              onClick={() => {
                sound.playMove();
                onQuickPlay();
              }}
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-sans font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm shadow-[#0052FF]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Zap size={14} className="fill-current text-amber-300" />
              <span className="hidden sm:inline">
                {lang === 'id' ? 'Main Cepat' : 'Quick Play'}
              </span>
            </button>

            {/* SOUND MUTE TOGGLE */}
            <button
              onClick={() => {
                sound.playMove();
                onToggleMute();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-navy/70 hover:text-deep-navy transition cursor-pointer border border-deep-navy/5"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX size={16} className="text-red-500" /> : <Volume2 size={16} className="text-[#0052FF]" />}
            </button>

            {/* MUSIC TOGGLE */}
            <button
              onClick={() => {
                sound.playMove();
                onToggleMusic();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-navy/70 hover:text-deep-navy transition cursor-pointer border border-deep-navy/5"
              title={isMusicOn ? 'Turn Music Off' : 'Turn Music On'}
            >
              <Music size={16} className={`text-[#0052FF] ${isMusicOn ? 'animate-spin' : ''}`} style={isMusicOn ? { animationDuration: '4s' } : undefined} />
            </button>

            {/* HAMBURGER / ORGANIZED MENU BUTTON */}
            <button
              onClick={() => {
                sound.playMove();
                setIsMenuOpen(true);
              }}
              className="p-2 rounded-xl bg-[#0052FF]/10 text-[#0052FF] hover:bg-[#0052FF]/20 transition cursor-pointer border border-[#0052FF]/20 flex items-center gap-1"
            >
              <Menu size={18} />
              <span className="text-xs font-mono font-bold hidden md:inline">MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-deep-navy/10 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            { id: 'home' as PageView, labelEn: 'Home', labelId: 'Beranda', icon: <Home size={18} /> },
            { id: 'play_hub' as PageView, labelEn: 'Play', labelId: 'Main', icon: <Play size={18} /> },
            { id: 'quests' as PageView, labelEn: 'Quests', labelId: 'Misi', icon: <CheckSquare size={18} />, badge: pendingRewardsCount },
            { id: 'events' as PageView, labelEn: 'Events', labelId: 'Acara', icon: <Calendar size={18} /> },
            { id: 'profile' as PageView, labelEn: 'Profile', labelId: 'Profil', icon: <User size={18} /> },
          ].map((item) => {
            const isActive = activeView === item.id;
            const label = lang === 'id' ? item.labelId : item.labelEn;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'text-[#0052FF] font-bold bg-[#0052FF]/10'
                    : 'text-deep-navy/60 hover:text-deep-navy'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-sans mt-0.5 leading-none">{label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* ORGANIZED MENU DRAWER / MODAL */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-[#061d33]/30 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 font-sans border border-deep-navy/10 z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-deep-navy/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0052FF] text-white flex items-center justify-center font-serif font-extrabold text-sm shadow">
                    B20
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-deep-navy">B20 Maze Ecosystem Navigation</h3>
                    <p className="text-xs text-deep-navy/60">Structured Platform Menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-deep-navy/60 hover:text-deep-navy transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* MENU GROUPS */}
              <div className="space-y-5">
                
                {/* CATEGORY 1: MAIN */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-deep-navy/50 font-bold block mb-2 px-1">
                    01 · Platform Home & Play
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavClick('home')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'home' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <Home size={18} className="text-[#0052FF]" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Beranda' : 'Home'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Tinjauan Ekosistem' : 'Ecosystem Overview'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('play_hub')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'play_hub' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <Play size={18} className="text-[#0052FF]" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Pusat Main' : 'Play Hub'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Kampanye & Mode' : 'Campaign & Modes'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* CATEGORY 2: PROGRESSION */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-deep-navy/50 font-bold block mb-2 px-1">
                    02 · Progression & Identity
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavClick('profile')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'profile' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <User size={18} className="text-purple-500" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Profil Builder' : 'Profile'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Level, XP & Custom Skin' : 'Level, XP & Skins'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('passport')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'passport' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <Award size={18} className="text-amber-500" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Paspor Builder' : 'Builder Passport'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Pencapaian & Musim' : 'Achievements & Seasons'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* CATEGORY 3: COMMUNITY & REWARDS */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-deep-navy/50 font-bold block mb-2 px-1">
                    03 · Community & Rewards
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavClick('quests')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'quests' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <CheckSquare size={18} className="text-emerald-500" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Misi Harian' : 'Quests & Streak'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Klaim Hadiah & Streak' : 'Claim Rewards & Streak'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('events')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'events' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <Calendar size={18} className="text-orange-500" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Pusat Acara' : 'Events Center'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Bonus Multiplier' : 'Active Multipliers'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('leaderboard')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'leaderboard' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <Trophy size={18} className="text-yellow-500" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Klasemen' : 'Leaderboard'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Peringkat & Rival' : 'Ranks & Rivalry'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('faucet')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        currentView === 'faucet' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                      }`}
                    >
                      <Droplet size={18} className="text-cyan-500" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Faucet Testnet' : 'Faucet Center'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Token $B20 Harian' : 'Daily $B20 Tokens'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* CATEGORY 4: SYSTEM SETTINGS */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-deep-navy/50 font-bold block mb-2 px-1">
                    04 · System Settings
                  </span>
                  <button
                    onClick={() => handleNavClick('settings')}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      currentView === 'settings' ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF] font-bold' : 'bg-slate-50 border-deep-navy/5 text-deep-navy hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-slate-600" />
                      <div>
                        <div className="text-xs font-bold">{lang === 'id' ? 'Pengaturan & Bahasa' : 'Settings & Language'}</div>
                        <div className="text-[10px] text-deep-navy/50">{lang === 'id' ? 'Bahasa, Suara, Tema Rollup' : 'Language, Audio, L2 Theme'}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-deep-navy/40" />
                  </button>
                </div>

                {/* LANGUAGE QUICK SWITCHER */}
                <div className="pt-2 border-t border-deep-navy/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-deep-navy flex items-center gap-1.5">
                    <Globe size={14} className="text-[#0052FF]" />
                    Language
                  </span>
                  <div className="flex gap-1">
                    {(['en', 'id', 'zh', 'fr'] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          sound.playMove();
                          setLang(l);
                          localStorage.setItem('base_maze_lang', l);
                        }}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition cursor-pointer ${
                          lang === l
                            ? 'bg-[#0052FF] text-white border-[#0052FF]'
                            : 'bg-slate-100 text-deep-navy/70 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
