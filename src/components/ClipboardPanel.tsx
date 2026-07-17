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
  Globe 
} from 'lucide-react';
import { Language } from '../lib/i18n';
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

const copySuccessToastMessage: Record<Language, string> = {
  en: 'COPIED TO CLIPBOARD',
  id: 'BERHASIL DISALIN',
  zh: '已复制到剪贴板',
  fr: 'COPIÉ DANS LE PRESSE-PAPIERS'
};

const uiTranslations: Record<Language, {
  title: string;
  activeProfile: string;
  builder: string;
  network: string;
  progress: string;
  bypassTokens: string;
  mode: string;
  actions: string;
  langSelection: string;
  audioSettings: string;
  unmuteSfx: string;
  muteSfx: string;
  muteTheme: string;
  playTheme: string;
  returnCooldock: string;
}> = {
  en: {
    title: 'Clipboard & Controller',
    activeProfile: 'Active Stats Profile',
    builder: 'Builder:',
    network: 'Network:',
    progress: 'Progress:',
    bypassTokens: 'Bypass Tokens:',
    mode: 'Mode:',
    actions: 'Actions',
    langSelection: 'Language Selection',
    audioSettings: 'Audio Settings',
    unmuteSfx: 'Unmute SFX',
    muteSfx: 'Mute SFX',
    muteTheme: 'Mute Theme',
    playTheme: 'Play Theme',
    returnCooldock: 'Return to Cooldock'
  },
  id: {
    title: 'Papan Klip & Kontrol',
    activeProfile: 'Profil Statistik Aktif',
    builder: 'Pembangun:',
    network: 'Jaringan:',
    progress: 'Progres:',
    bypassTokens: 'Token Bypass:',
    mode: 'Mode:',
    actions: 'Tindakan',
    langSelection: 'Pilihan Bahasa',
    audioSettings: 'Pengaturan Audio',
    unmuteSfx: 'Nyalakan SFX',
    muteSfx: 'Matikan SFX',
    muteTheme: 'Matikan Tema',
    playTheme: 'Putar Tema',
    returnCooldock: 'Kembali ke Cooldock'
  },
  zh: {
    title: '剪贴板与控制器',
    activeProfile: '当前统计属性',
    builder: '构建者:',
    network: '网络:',
    progress: '进度:',
    bypassTokens: '绕过代币:',
    mode: '模式:',
    actions: '操作',
    langSelection: '语言选择',
    audioSettings: '音频设置',
    unmuteSfx: '启用音效',
    muteSfx: '静音音效',
    muteTheme: '静音主题曲',
    playTheme: '播放主题曲',
    returnCooldock: '返回控制台'
  },
  fr: {
    title: 'Presse-papiers & Contrôleur',
    activeProfile: 'Profil des Stats Actives',
    builder: 'Bâtisseur :',
    network: 'Réseau :',
    progress: 'Progression :',
    bypassTokens: 'Jetons de Contournement :',
    mode: 'Mode :',
    actions: 'Actions',
    langSelection: 'Sélection de la Langue',
    audioSettings: 'Paramètres Audio',
    unmuteSfx: 'Activer SFX',
    muteSfx: 'Couper SFX',
    muteTheme: 'Couper Thème',
    playTheme: 'Jouer Thème',
    returnCooldock: 'Retour au Cooldock'
  }
};

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
  const t = uiTranslations[lang] || uiTranslations.en;

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
      className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-deep-navy/10 z-10 text-deep-navy font-sans overflow-hidden"
    >
      {/* Temporary Floating 'Copied!' Toast Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -15, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            transition={{ type: 'spring', damping: 15, stiffness: 350 }}
            className="absolute top-4 left-1/2 bg-ink-dark text-white text-[10px] font-mono tracking-widest px-4 py-2 rounded-xl shadow-lg border border-white/10 z-50 flex items-center gap-2 whitespace-nowrap select-none"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.05, type: 'spring', damping: 10 }}
              className="text-emerald-500"
            >
              <Check size={11} className="stroke-[3px]" />
            </motion.div>
            <span>{copySuccessToastMessage[lang] || copySuccessToastMessage.en}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar with close button */}
      <div className="flex items-center justify-between mb-5 pb-2 border-b border-deep-navy/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cerulean-sky animate-ping" />
          <h3 className="text-base font-bold text-black tracking-tight flex items-center gap-1.5">
            <Cpu size={16} className="text-cerulean-sky" />
            {t.title}
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
          {t.activeProfile}
        </div>
        <div className="space-y-1.5 text-[11px] text-deep-navy/80">
          <div className="flex justify-between">
            <span>{t.builder}</span>
            <span className="font-sans font-bold text-black">{playerName || 'Anonymous Soul'}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.network}</span>
            <span className="text-emerald-600 font-bold">Base Mainnet</span>
          </div>
          <div className="flex justify-between">
            <span>{t.progress}</span>
            <span className="text-cerulean-sky font-bold">Level {unlockedLevel} / 50</span>
          </div>
          <div className="flex justify-between">
            <span>{t.bypassTokens}</span>
            <span className="text-warm-red font-bold">{specialTokens} Token(s)</span>
          </div>
          <div className="flex justify-between">
            <span>{t.mode}</span>
            <span className="font-bold text-black uppercase">{gameMode}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Copy Button */}
        <div>
          <span className="block text-[10px] font-mono text-deep-navy/40 uppercase tracking-widest mb-1.5 font-bold">
            {t.actions}
          </span>
          <button
            onClick={handleCopyStats}
            className={`w-full py-3 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer overflow-hidden relative h-[46px] ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                : 'bg-white border-deep-navy/15 hover:border-deep-navy/30 text-deep-navy hover:bg-[#fcfdfe] active:scale-[0.99]'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="copied"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                  className="flex items-center justify-center gap-2 w-full h-full"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', damping: 10 }}
                  >
                    <Check size={14} className="text-emerald-600 stroke-[3px]" />
                  </motion.div>
                  <span>
                    {lang === 'id' ? 'Sertifikat Disalin!' :
                     lang === 'zh' ? '证书已复制！' :
                     lang === 'fr' ? 'Certificat Copié !' :
                     'Certificate Copied!'}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                  className="flex items-center justify-center gap-2 w-full h-full"
                >
                  <Copy size={14} className="text-deep-navy/70" />
                  <span>
                    {lang === 'id' ? 'Salin Sertifikat Statistik' :
                     lang === 'zh' ? '复制统计证书' :
                     lang === 'fr' ? 'Copier le Certificat de Stats' :
                     'Copy Stats Certificate'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Language Selector */}
        <div>
          <span className="block text-[10px] font-mono text-deep-navy/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
            <Globe size={11} className="text-deep-navy/40" />
            {t.langSelection}
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
            {t.audioSettings}
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
              <span>{isMuted ? t.unmuteSfx : t.muteSfx}</span>
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
              <span>{isMusicOn ? t.muteTheme : t.playTheme}</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => { sound.playMove(); onClose(); }}
        className="w-full mt-6 bg-black hover:bg-black/90 active:scale-[0.98] text-white rounded-2xl py-3 px-4 font-sans font-medium text-xs shadow-sm transition-all duration-200 cursor-pointer"
      >
        {t.returnCooldock}
      </button>
    </motion.div>
  );
}
