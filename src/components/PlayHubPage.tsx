import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Layers,
  Zap,
  Compass,
  Cpu,
  Trophy,
  ChevronRight,
  Shield,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
  Sliders,
  Award
} from 'lucide-react';
import { Difficulty, CHAPTERS, getChapterForLevel } from '../types';
import { Language } from '../lib/i18n';
import { sound } from './SoundEngine';

interface PlayHubPageProps {
  lang: Language;
  unlockedLevel: number;
  campaignLevel: number;
  setCampaignLevel: (lvl: number) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  gameMode: 'classic' | 'campaign';
  setGameMode: (mode: 'classic' | 'campaign') => void;
  onLaunchGame: (mode: 'classic' | 'campaign', level: number, diff: Difficulty) => void;
}

export const PlayHubPage: React.FC<PlayHubPageProps> = ({
  lang,
  unlockedLevel,
  campaignLevel,
  setCampaignLevel,
  difficulty,
  setDifficulty,
  gameMode,
  setGameMode,
  onLaunchGame
}) => {
  const [selectedTab, setSelectedTab] = useState<'campaign' | 'speedrun' | 'zen' | 'hardcore'>('campaign');
  const [jumpInput, setJumpInput] = useState('');
  const [jumpError, setJumpError] = useState('');

  const currentChapter = getChapterForLevel(campaignLevel);

  const handleJumpLevel = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(jumpInput);
    if (!val || isNaN(val) || val < 1 || val > 1000) {
      setJumpError(lang === 'id' ? 'Masukkan level 1 - 1000' : 'Enter level 1 - 1000');
      return;
    }
    if (val > unlockedLevel) {
      setJumpError(lang === 'id' ? `Level ${val} belum terbuka! (Maks: ${unlockedLevel})` : `Level ${val} is locked! (Max: ${unlockedLevel})`);
      return;
    }
    setJumpError('');
    setCampaignLevel(val);
    localStorage.setItem('base_maze_last_campaign_level', String(val));
    sound.playSuccess();
  };

  const handleSelectLevel = (lvl: number) => {
    if (lvl <= unlockedLevel) {
      sound.playMove();
      setCampaignLevel(lvl);
      localStorage.setItem('base_maze_last_campaign_level', String(lvl));
    }
  };

  const handleStartCurrentSelection = () => {
    sound.playMove();
    if (selectedTab === 'campaign') {
      setGameMode('campaign');
      onLaunchGame('campaign', campaignLevel, difficulty);
    } else if (selectedTab === 'speedrun') {
      setGameMode('classic');
      setDifficulty('fast');
      onLaunchGame('classic', 1, 'fast');
    } else if (selectedTab === 'zen') {
      setGameMode('classic');
      setDifficulty('standard');
      onLaunchGame('classic', 1, 'standard');
    } else if (selectedTab === 'hardcore') {
      setGameMode('classic');
      setDifficulty('hard');
      onLaunchGame('classic', 1, 'hard');
    }
  };

  return (
    <div className="w-full space-y-8 py-4 font-sans text-deep-navy">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-deep-navy/10 pb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
            {lang === 'id' ? 'PUSAT ARENA GAME' : 'PLAY HUB ARENA'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
            {lang === 'id' ? 'Pilih Mode Permainan' : 'Select Game Mode'}
          </h1>
          <p className="text-xs sm:text-sm text-deep-navy/70">
            {lang === 'id'
              ? 'Tentukan tantangan Anda: Petualangan Kampanye 1000 Level, Uji Kecepatan, atau Mode Santai.'
              : 'Choose your challenge: 1000 Level Campaign Journey, Speedrun TPS, or Relaxed Zen.'
            }
          </p>
        </div>

        {/* Global Level Indicator Badge */}
        <div className="bg-[#0052FF]/10 border border-[#0052FF]/30 p-3 rounded-2xl flex items-center gap-3 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-[#0052FF] text-white flex items-center justify-center font-bold text-sm shadow-md">
            #{unlockedLevel}
          </div>
          <div>
            <div className="text-[10px] font-mono text-deep-navy/60 uppercase font-bold">
              {lang === 'id' ? 'Level Terbuka' : 'Max Level Unlocked'}
            </div>
            <div className="text-xs font-bold text-deep-navy">
              {lang === 'id' ? `Kampanye #${unlockedLevel}` : `Campaign #${unlockedLevel}`}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'campaign', label: 'Campaign Journey', icon: Layers, badge: '1000 Lvl', color: 'border-[#0052FF] text-[#0052FF]' },
          { id: 'speedrun', label: 'Speedrun TPS', icon: Zap, badge: 'Fast TPS', color: 'border-amber-500 text-amber-600' },
          { id: 'zen', label: 'Zen Mode', icon: Compass, badge: 'Infinite', color: 'border-emerald-500 text-emerald-600' },
          { id: 'hardcore', label: 'Superchain 50x50', icon: Cpu, badge: 'Hardcore', color: 'border-purple-500 text-purple-600' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playMove();
                setSelectedTab(tab.id as any);
              }}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 text-left cursor-pointer ${
                isActive
                  ? `${tab.color} bg-white shadow-md ring-2 ring-current/20 scale-[1.02]`
                  : 'border-deep-navy/10 bg-white/60 hover:bg-white text-deep-navy/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon size={20} />
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-deep-navy/5">
                  {tab.badge}
                </span>
              </div>
              <span className="font-serif font-bold text-sm text-deep-navy">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CAMPAIGN MODE DETAIL */}
      {selectedTab === 'campaign' && (
        <div className="space-y-6">
          {/* Active Chapter Card */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#60A5FA] uppercase tracking-wider block">
                  Chapter {currentChapter.id}: {currentChapter.name}
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  {currentChapter.name}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {currentChapter.desc}
                </p>
              </div>

              {/* Start Playing Selected Campaign Level CTA */}
              <button
                onClick={handleStartCurrentSelection}
                className="px-8 py-4 rounded-2xl bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-sans font-bold text-base shadow-lg shadow-[#0052FF]/30 transition flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-95 self-start sm:self-auto"
              >
                <Play size={20} className="fill-current text-amber-300" />
                <span>{lang === 'id' ? `Mainkan Level #${campaignLevel}` : `Play Level #${campaignLevel}`}</span>
              </button>
            </div>

            {/* Jump To Level Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-mono text-slate-300 font-bold whitespace-nowrap">
                {lang === 'id' ? 'Lompat ke Level:' : 'Jump to Level:'}
              </span>
              <form onSubmit={handleJumpLevel} className="flex items-center gap-2 flex-1 max-w-xs">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder={`1 - ${unlockedLevel}`}
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-mono text-xs font-bold transition cursor-pointer"
                >
                  Go
                </button>
              </form>
              {jumpError && <span className="text-xs text-red-400 font-mono font-bold">{jumpError}</span>}
            </div>
          </div>

          {/* Level Selector Grid (Showing levels around active level) */}
          <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-deep-navy">
                {lang === 'id' ? 'Pilih Level Kampanye' : 'Campaign Level Browser'}
              </h3>
              <span className="text-xs font-mono text-deep-navy/60">
                {lang === 'id' ? `Menampilkan Level Terbuka` : `Showing Unlocked Levels`}
              </span>
            </div>

            {/* Grid of level buttons (1 to unlockedLevel) */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-1">
              {Array.from({ length: Math.min(unlockedLevel + 5, 1000) }, (_, i) => i + 1).map(lvl => {
                const isUnlocked = lvl <= unlockedLevel;
                const isSelected = lvl === campaignLevel;
                return (
                  <button
                    key={lvl}
                    disabled={!isUnlocked}
                    onClick={() => handleSelectLevel(lvl)}
                    className={`aspect-square rounded-xl font-mono text-xs font-bold transition flex items-center justify-center relative ${
                      isSelected
                        ? 'bg-[#0052FF] text-white shadow-md ring-2 ring-[#0052FF]/50 scale-105'
                        : isUnlocked
                        ? 'bg-blue-50 text-[#0052FF] hover:bg-blue-100 border border-blue-200 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <span>{lvl}</span>
                    ) : (
                      <Lock size={12} className="text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2, 3, 4: OTHER MODES */}
      {selectedTab !== 'campaign' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-deep-navy/10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-[#0052FF]">
              {selectedTab === 'speedrun' ? 'SPEEDRUN MODE' : selectedTab === 'zen' ? 'ZEN EXPLORER' : 'SUPERCHAIN HARDCORE'}
            </span>
            <h2 className="text-2xl font-serif font-bold text-deep-navy">
              {selectedTab === 'speedrun' && (lang === 'id' ? 'Tantangan Kecepatan Validasi TPS' : 'Speedrun TPS Mode')}
              {selectedTab === 'zen' && (lang === 'id' ? 'Mode Jelajah Santai Tanpa Batas' : 'Relaxed Zen Mode')}
              {selectedTab === 'hardcore' && (lang === 'id' ? 'Tantangan Superchain 50x50' : 'Hardcore 50x50 Grid')}
            </h2>
            <p className="text-xs text-deep-navy/70 max-w-xl">
              {selectedTab === 'speedrun' && (lang === 'id' ? 'Selesaikan labirin secepat mungkin untuk membuktikan kecepatan TPS validator Anda.' : 'Clear procedurally generated mazes as fast as possible to claim TPS supremacy.')}
              {selectedTab === 'zen' && (lang === 'id' ? 'Nikmati pencarian rute labirin tanpa timer, tanpa penalti, hanya relaksasi murni.' : 'Enjoy route solving with no timer pressure, no penalties, and endless procedurally created mazes.')}
              {selectedTab === 'hardcore' && (lang === 'id' ? 'Labirin berukuran 50x50 super rumit dengan dinding firewall acak bagi para ahli.' : 'A massive 50x50 complex grid with dense firewall obstacles designed for master solvers.')}
            </p>
          </div>

          {/* Start Challenge CTA Button */}
          <button
            onClick={handleStartCurrentSelection}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-sans font-bold text-base shadow-lg shadow-[#0052FF]/30 transition flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-95"
          >
            <Play size={20} className="fill-current text-amber-300" />
            <span>{lang === 'id' ? 'Mulai Mode Ini Sekarang' : 'Launch Mode Now'}</span>
          </button>
        </div>
      )}

      {/* Difficulty Selector Section */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-deep-navy/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-deep-navy">
              {lang === 'id' ? 'Tingkat Kesulitan Labirin' : 'Maze Difficulty Tuning'}
            </h3>
            <p className="text-xs text-deep-navy/60">
              {lang === 'id' ? 'Sesuaikan ukuran grid dan kecepatan timer labirin.' : 'Adjust grid size and timer speed limits.'}
            </p>
          </div>
          <span className="p-2 rounded-xl bg-white border border-deep-navy/10 text-deep-navy/70">
            <Sliders size={18} />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'standard', label: 'Standard', desc: '10x10 Grid · Normal Timer' },
            { id: 'fast', label: 'Fast Block', desc: '12x12 Grid · Fast Timer' },
            { id: 'batch', label: 'Batch Sequencer', desc: '15x15 Grid · High Complexity' },
            { id: 'hard', label: 'Superchain Hard', desc: '20x20 Grid · Extreme Speed' },
          ].map(diff => (
            <button
              key={diff.id}
              onClick={() => {
                sound.playMove();
                setDifficulty(diff.id as Difficulty);
                localStorage.setItem('base_maze_last_difficulty', diff.id);
              }}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                difficulty === diff.id
                  ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-md font-bold'
                  : 'bg-white text-deep-navy border-deep-navy/10 hover:border-deep-navy/30'
              }`}
            >
              <div className="font-serif font-bold text-sm">{diff.label}</div>
              <div className={`text-[10px] font-mono mt-0.5 ${difficulty === diff.id ? 'text-blue-100' : 'text-deep-navy/60'}`}>
                {diff.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
