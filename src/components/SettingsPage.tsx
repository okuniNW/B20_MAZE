import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Music,
  Globe,
  Palette,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Check,
  Sliders
} from 'lucide-react';
import { Language } from '../lib/i18n';
import { L2Theme } from '../types';
import { L2_THEMES } from '../lib/themes';
import { sound } from './SoundEngine';

interface SettingsPageProps {
  lang: Language;
  setLang: (l: Language) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isMusicOn: boolean;
  setIsMusicOn: (music: boolean) => void;
  l2Theme: L2Theme;
  setL2Theme: (theme: L2Theme) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  lang,
  setLang,
  isMuted,
  setIsMuted,
  isMusicOn,
  setIsMusicOn,
  l2Theme,
  setL2Theme
}) => {
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playMove();
  };

  const handleToggleMusic = () => {
    const next = !isMusicOn;
    setIsMusicOn(next);
    localStorage.setItem('base_maze_music_on', String(next));
    if (next) sound.playMove();
  };

  const handleChangeLang = (newLang: Language) => {
    sound.playMove();
    setLang(newLang);
    localStorage.setItem('base_maze_lang', newLang);
  };

  const handleChangeTheme = (themeKey: L2Theme) => {
    sound.playMove();
    setL2Theme(themeKey);
    localStorage.setItem('base_maze_l2_theme', themeKey);
  };

  const handleClearData = () => {
    if (!resetConfirmed) {
      setResetConfirmed(true);
      return;
    }
    sound.playSuccess();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="w-full space-y-8 py-4 font-sans text-deep-navy max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-deep-navy/10 pb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
          {lang === 'id' ? 'PENGATURAN SISTEM' : 'SYSTEM PREFERENCES'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
          {lang === 'id' ? 'Pengaturan & Preferensi' : 'Settings & Preferences'}
        </h1>
        <p className="text-xs sm:text-sm text-deep-navy/70">
          {lang === 'id'
            ? 'Atur bahasa, efek suara, musik latar belakang, dan tema visual L2 Anda.'
            : 'Configure language, audio effects, background ambience, and L2 visual themes.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. LANGUAGE SETTINGS */}
        <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-deep-navy/10 pb-3">
            <Globe size={18} className="text-[#0052FF]" />
            <h2 className="font-serif font-bold text-base text-deep-navy">
              {lang === 'id' ? 'Pilihan Bahasa' : 'Language Selection'}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChangeLang('en')}
              className={`p-3.5 rounded-2xl border font-sans font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm'
                  : 'bg-slate-50 text-deep-navy border-deep-navy/10 hover:bg-slate-100'
              }`}
            >
              <span>English (US)</span>
              {lang === 'en' && <Check size={16} />}
            </button>

            <button
              onClick={() => handleChangeLang('id')}
              className={`p-3.5 rounded-2xl border font-sans font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                lang === 'id'
                  ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm'
                  : 'bg-slate-50 text-deep-navy border-deep-navy/10 hover:bg-slate-100'
              }`}
            >
              <span>Bahasa Indonesia</span>
              {lang === 'id' && <Check size={16} />}
            </button>
          </div>
        </div>

        {/* 2. AUDIO & AMBIENCE SETTINGS */}
        <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-deep-navy/10 pb-3">
            <Volume2 size={18} className="text-[#0052FF]" />
            <h2 className="font-serif font-bold text-base text-deep-navy">
              {lang === 'id' ? 'Audio & Suara' : 'Audio & Sound Effects'}
            </h2>
          </div>

          <div className="space-y-3">
            {/* SFX Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-deep-navy/10">
              <div className="flex items-center gap-2.5">
                {isMuted ? <VolumeX size={18} className="text-slate-400" /> : <Volume2 size={18} className="text-[#0052FF]" />}
                <div>
                  <div className="font-serif font-bold text-xs text-deep-navy">
                    {lang === 'id' ? 'Efek Suara (SFX)' : 'Sound Effects (SFX)'}
                  </div>
                  <div className="text-[10px] text-deep-navy/60 font-mono">
                    {isMuted ? 'Muted' : 'Enabled'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleSound}
                className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  !isMuted ? 'bg-[#0052FF] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {!isMuted ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-deep-navy/10">
              <div className="flex items-center gap-2.5">
                <Music size={18} className={isMusicOn ? 'text-purple-600' : 'text-slate-400'} />
                <div>
                  <div className="font-serif font-bold text-xs text-deep-navy">
                    {lang === 'id' ? 'Musik Latar Belakang' : 'Background Ambience'}
                  </div>
                  <div className="text-[10px] text-deep-navy/60 font-mono">
                    {isMusicOn ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleMusic}
                className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  isMusicOn ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isMusicOn ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. L2 THEMES SELECTION */}
        <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-deep-navy/10 pb-3">
            <Palette size={18} className="text-[#0052FF]" />
            <h2 className="font-serif font-bold text-base text-deep-navy">
              {lang === 'id' ? 'Tema Warna Ekosistem L2' : 'L2 Ecosystem Color Theme'}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(L2_THEMES) as L2Theme[]).map(themeKey => {
              const theme = L2_THEMES[themeKey];
              const isSelected = l2Theme === themeKey;
              return (
                <button
                  key={themeKey}
                  onClick={() => handleChangeTheme(themeKey)}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-[#0052FF] bg-blue-50 ring-2 ring-[#0052FF]/30'
                      : 'border-deep-navy/10 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-5 h-5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    {isSelected && <Check size={14} className="text-[#0052FF]" />}
                  </div>
                  <div className="font-serif font-bold text-xs text-deep-navy">{theme.name}</div>
                  <div className="text-[10px] font-mono text-deep-navy/60 truncate">{theme.ticker}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. DANGER ZONE: RESET LOCAL PROGRESS */}
        <div className="bg-red-50 rounded-3xl p-6 border border-red-200 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-600" />
            <h2 className="font-serif font-bold text-base text-red-900">
              {lang === 'id' ? 'Zona Bahaya: Reset Data' : 'Danger Zone: Reset Local Data'}
            </h2>
          </div>

          <p className="text-xs text-red-800">
            {lang === 'id'
              ? 'Mengeklik tombol ini akan menghapus semua progres lokal (level, REP, $B20, quest, dan statistik). Tindakan ini tidak dapat dibatalkan!'
              : 'Clicking this button will permanently clear all local progress (unlocked levels, REP, $B20, quests, and stats). This action cannot be undone!'
            }
          </p>

          <button
            onClick={handleClearData}
            className={`px-6 py-2.5 rounded-xl font-sans font-bold text-xs transition cursor-pointer shadow-sm ${
              resetConfirmed
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-white hover:bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {resetConfirmed
              ? (lang === 'id' ? 'KLIK LAGI UNTUK MENGONFIRMASI RESET' : 'CLICK AGAIN TO CONFIRM RESET')
              : (lang === 'id' ? 'Reset Semua Data Lokal' : 'Reset All Local Data')
            }
          </button>
        </div>

      </div>
    </div>
  );
};
