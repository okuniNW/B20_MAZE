import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Music, 
  Award, 
  Cpu, 
  Layers, 
  Globe 
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { sound } from './SoundEngine';

interface ClipboardPanelProps {
  playerName: string;
  gameMode: 'classic' | 'campaign';
  unlockedLevel: number;
  specialTokens: number;
  lang: Language;
  setLang: (lang: Language) => void;
  isMuted: boolean;
  handleToggleMute: () => void;
  isMusicOn: boolean;
  handleToggleMusic: () => void;
  onClose: () => void;
}

export default function ClipboardPanel({
  playerName,
  gameMode,
  unlockedLevel,
  specialTokens,
  lang,
  setLang,
  isMuted,
  handleToggleMute,
  isMusicOn,
  handleToggleMusic,
  onClose
}: ClipboardPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyStats = () => {
    const certificateText = `
┌──────────────────────────────────────────────┐
│        THEORY OF THE SOUL CERTIFICATE        │
├──────────────────────────────────────────────┤
│  Player Name   : ${playerName || 'Anonymous Miner'}
│  Network ID    : BASE MAINNET
│  Current Level : ${unlockedLevel} / 50
│  Special Nodes : ${specialTokens} Token(s)
│  Active Mode   : ${gameMode === 'campaign' ? 'CAMPAIGN' : 'CLASSIC SPEEDRUN'}
│  SFX Audio     : ${isMuted ? 'MUTED' : 'ENABLED'}
│  Theme Sound   : ${isMusicOn ? 'ACTIVE' : 'MUTED'}
│  Time Stamp    : ${new Date().toLocaleString()}
├──────────────────────────────────────────────┤
│  Procedural grid network rendered locally.   │
│  Explore, teleport, and validate block nodes.│
└──────────────────────────────────────────────┘
    `;
    navigator.clipboard.writeText(certificateText.trim());
    sound.playPowerup();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-deep-navy/10 z-10 text-deep-navy font-sans"
    >
      {/* Top bar with close button */}
      <div className="flex items-center justify-between mb-5 pb-2 border-b border-deep-navy/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cerulean-sky animate-ping" />
          <h3 className="text-base font-bold text-black tracking-tight flex items-center gap-1.5">
            <Cpu size={16} className="text-cerulean-sky" />
            Clipboard & Controller
          </h3>
        </div>
        <button
          onClick={() => { sound.playMove(); onClose(); }}
          className="p-1.5 rounded-full hover:bg-deep-navy/5 text-deep-navy/40 hover:text-deep-navy transition cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Stats Display */}
      <div className="bg-[#f4f7fa] rounded-2xl p-4 border border-deep-navy/5 mb-5 font-mono select-none">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-deep-navy/45 mb-2 font-bold">
          <Award size={10} className="text-cerulean-sky" />
          Active Stats Profile
        </div>
        <div className="space-y-1.5 text-[11px] text-deep-navy/80">
          <div className="flex justify-between">
            <span>Builder:</span>
            <span className="font-sans font-bold text-black">{playerName || 'Anonymous Soul'}</span>
          </div>
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="text-emerald-600 font-bold">Base Mainnet</span>
          </div>
          <div className="flex justify-between">
            <span>Progress:</span>
            <span className="text-cerulean-sky font-bold">Level {unlockedLevel} / 50</span>
          </div>
          <div className="flex justify-between">
            <span>Bypass Tokens:</span>
            <span className="text-warm-red font-bold">{specialTokens} Token(s)</span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="font-bold text-black uppercase">{gameMode}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Copy Button */}
        <div>
          <span className="block text-[10px] font-mono text-deep-navy/40 uppercase tracking-widest mb-1.5 font-bold">
            Actions
          </span>
          <button
            onClick={handleCopyStats}
            className={`w-full py-3 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                : 'bg-white border-deep-navy/15 hover:border-deep-navy/30 text-deep-navy hover:bg-[#fcfdfe] active:scale-[0.99]'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span>Certificate Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-deep-navy/70" />
                <span>Copy Stats Certificate</span>
              </>
            )}
          </button>
        </div>

        {/* Language Selector */}
        <div>
          <span className="block text-[10px] font-mono text-deep-navy/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
            <Globe size={11} className="text-deep-navy/40" />
            Language Selection
          </span>
          <div className="flex items-center w-full border border-deep-navy/10 rounded-xl p-0.5 gap-0.5 bg-[#f5f6f8]">
            {(['en', 'id', 'zh', 'fr'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  sound.playMove();
                  setLang(l);
                  localStorage.setItem('base_maze_lang', l);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                  lang === l
                    ? 'bg-white text-black shadow-sm border border-deep-navy/5'
                    : 'text-deep-navy/60 hover:text-black hover:bg-white/50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Controls row */}
        <div>
          <span className="block text-[10px] font-mono text-deep-navy/40 uppercase tracking-widest mb-1.5 font-bold">
            Audio Settings
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleToggleMute}
              className={`py-2 px-3 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                isMuted
                  ? 'border-warm-red/30 text-warm-red bg-warm-red/5'
                  : 'bg-white border-deep-navy/15 text-deep-navy/80 hover:text-deep-navy hover:border-deep-navy/30'
              }`}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? 'Unmute SFX' : 'Mute SFX'}</span>
            </button>

            <button
              onClick={handleToggleMusic}
              className={`py-2 px-3 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                isMusicOn
                  ? 'border-cerulean-sky/30 text-cerulean-sky bg-cerulean-sky/5'
                  : 'bg-white border-deep-navy/15 text-deep-navy/80 hover:text-deep-navy hover:border-deep-navy/30'
              }`}
            >
              <Music size={14} className={isMusicOn ? 'animate-pulse' : ''} />
              <span>{isMusicOn ? 'Mute Theme' : 'Play Theme'}</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => { sound.playMove(); onClose(); }}
        className="w-full mt-6 bg-black hover:bg-black/90 active:scale-[0.98] text-white rounded-2xl py-3 px-4 font-sans font-medium text-xs shadow-sm transition-all duration-200 cursor-pointer"
      >
        Return to Cooldock
      </button>
    </motion.div>
  );
}
