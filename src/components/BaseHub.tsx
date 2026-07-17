import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplet,
  Coins,
  Key,
  Sparkles,
  Clock,
  Activity,
  CheckCircle2,
  Target,
  Palette,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { L2Theme } from '../types';
import { L2_THEMES } from '../lib/themes';
import { sound } from './SoundEngine';
import { Language, translations } from '../lib/i18n';

interface BaseHubProps {
  lang: Language;
  specialTokens: number;
  setSpecialTokens: React.Dispatch<React.SetStateAction<number>>;
  l2Theme: L2Theme;
  setL2Theme: (theme: L2Theme) => void;
  quests: { id: string; nameEn: string; nameId: string; target: number; current: number; completed: boolean; rewardClaimed: boolean }[];
  lastClaimTime: number;
  setLastClaimTime: (time: number) => void;
  faucetClaimStatus: 'idle' | 'initiating' | 'broadcasting' | 'confirmed';
  setFaucetClaimStatus: (status: 'idle' | 'initiating' | 'broadcasting' | 'confirmed') => void;
  faucetTxHash: string;
  setFaucetTxHash: (hash: string) => void;
}

export default function BaseHub({
  lang,
  specialTokens,
  setSpecialTokens,
  l2Theme,
  setL2Theme,
  quests,
  lastClaimTime,
  setLastClaimTime,
  faucetClaimStatus,
  setFaucetClaimStatus,
  faucetTxHash,
  setFaucetTxHash,
}: BaseHubProps) {
  const [activeTab, setActiveTab] = useState<'faucet' | 'quests' | 'profile'>('quests');
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const cooldownIntervalRef = useRef<any>(null);

  const themeConfig = L2_THEMES[l2Theme];

  // Cooldown timer calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = lastClaimTime + 24 * 60 * 60 * 1000 - now;

      if (difference <= 0) {
        setTimeLeftStr('');
        if (cooldownIntervalRef.current) {
          clearInterval(cooldownIntervalRef.current);
        }
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        const pad = (num: number) => String(num).padStart(2, '0');
        setTimeLeftStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    calculateTimeLeft();
    cooldownIntervalRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [lastClaimTime]);

  const handleClaimFaucet = () => {
    if (timeLeftStr) {
      sound.playError();
      return;
    }

    sound.playMove();
    setFaucetClaimStatus('initiating');

    // Generating a realistic mock TX hash
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const txHash = `0x${randomHex}`;
    setFaucetTxHash(txHash);

    setTimeout(() => {
      setFaucetClaimStatus('broadcasting');
      sound.playPowerup();
    }, 1500);

    setTimeout(() => {
      setFaucetClaimStatus('confirmed');
      sound.playWin();
      setSpecialTokens((prev) => prev + 1);
      setLastClaimTime(Date.now());
    }, 3200);
  };

  const isFaucetLocked = !!timeLeftStr;

  return (
    <div className="w-full max-w-2xl px-4 mt-6">
      <div 
        className="rounded-3xl border border-deep-navy/10 overflow-hidden transition-all duration-300 shadow-[0_12px_40px_rgba(6,29,51,0.06)] bg-white/90 backdrop-blur-[20px]"
        style={{ borderTop: `4px solid ${themeConfig.accentColor}` }}
      >
        {/* HEADER BAR */}
        <div className="px-6 py-4 border-b border-deep-navy/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: themeConfig.accentColor }}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: themeConfig.accentColor }}></span>
            </span>
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-deep-navy/80">
              {lang === 'id' ? 'PUSAT KAMPANYE BUILDER' : 'BASE BUILDER HUB'}
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-deep-navy/5 text-deep-navy/70 border border-deep-navy/10">
            {themeConfig.ticker}
          </span>
        </div>

        {/* TABS SELECTOR */}
        <div className="grid grid-cols-3 gap-1 px-4 pt-4 pb-2 border-b border-deep-navy/5">
          <button
            onClick={() => { sound.playMove(); setActiveTab('quests'); }}
            className={`py-2 px-3 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-deep-navy text-white shadow-sm'
                : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
            }`}
          >
            <Target size={13} />
            <span>Quests</span>
            {quests.filter(q => q.completed).length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                {quests.filter(q => q.completed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => { sound.playMove(); setActiveTab('faucet'); }}
            className={`py-2 px-3 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'faucet'
                ? 'bg-deep-navy text-white shadow-sm'
                : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
            }`}
          >
            <Droplet size={13} />
            <span>Faucet</span>
          </button>

          <button
            onClick={() => { sound.playMove(); setActiveTab('profile'); }}
            className={`py-2 px-3 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-deep-navy text-white shadow-sm'
                : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
            }`}
          >
            <Palette size={13} />
            <span>Profiles</span>
          </button>
        </div>

        {/* TAB PANEL CONTENT */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* QUESTS PANEL */}
            {activeTab === 'quests' && (
              <motion.div
                key="quests-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="text-center mb-1">
                  <h4 className="font-serif text-base font-bold text-deep-navy">
                    {lang === 'id' ? 'Misi Harian Builder' : 'Daily Builder Missions'}
                  </h4>
                  <p className="text-[11px] text-deep-navy/60">
                    {lang === 'id' 
                      ? 'Selesaikan tugas untuk mengklaim Bypass Key gratis.' 
                      : 'Fulfill cryptographic objectives to receive automatic Bypass Keys.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {quests.map((quest) => (
                    <div 
                      key={quest.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        quest.completed 
                          ? 'bg-emerald-500/5 border-emerald-500/25' 
                          : 'bg-cloud-white border-deep-navy/10 hover:border-deep-navy/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-start gap-2">
                          <span className={`text-base flex-shrink-0 ${quest.completed ? 'animate-bounce' : ''}`}>
                            {quest.completed ? '🎉' : '🎯'}
                          </span>
                          <div>
                            <h5 className={`text-xs font-sans font-bold leading-tight ${quest.completed ? 'text-emerald-700' : 'text-deep-navy'}`}>
                              {lang === 'id' ? quest.nameId : quest.nameEn}
                            </h5>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-deep-navy/40 font-bold block mt-0.5">
                              {lang === 'id' ? 'HADIAH: +1 BYPASS KEY' : 'REWARD: +1 BYPASS KEY'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 font-mono text-[11px] font-bold text-deep-navy/60">
                          {quest.current} / {quest.target}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-deep-navy/5 rounded-full overflow-hidden border border-deep-navy/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            quest.completed ? 'bg-emerald-500' : 'bg-cerulean-sky'
                          }`}
                          style={{ width: `${(quest.current / quest.target) * 100}%` }}
                        />
                      </div>

                      {quest.completed && (
                        <div className="flex items-center gap-1 mt-2 font-mono text-[9px] text-emerald-600 font-bold justify-end animate-pulse">
                          <CheckCircle2 size={10} />
                          <span>{lang === 'id' ? 'MISI SELESAI & KUNCI DIKREDITKAN' : 'MISSION COMPLETE & KEY DISPATCHED'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* FAUCET PANEL */}
            {activeTab === 'faucet' && (
              <motion.div
                key="faucet-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="text-center mb-2">
                  <div className="inline-flex p-3 rounded-full bg-cerulean-sky/10 text-cerulean-sky mb-2">
                    <Droplet size={24} className="animate-pulse" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-deep-navy">
                    {lang === 'id' ? 'Kran Penguji Jaringan Base' : 'Base Gas Faucet'}
                  </h4>
                  <p className="text-[11px] text-deep-navy/60 leading-relaxed max-w-sm mx-auto">
                    {lang === 'id' 
                      ? 'Dapatkan 1 Bypass Key gratis setiap 24 jam untuk memotong firewall labirin yang sulit.'
                      : 'Claim 1 free Bypass Key token every 24 hours to blast through complex network wall firewalls.'}
                  </p>
                </div>

                {faucetClaimStatus === 'idle' ? (
                  <div className="flex flex-col items-center">
                    {isFaucetLocked ? (
                      <div className="w-full p-4 rounded-2xl bg-cloud-white border border-deep-navy/10 flex flex-col items-center gap-2 animate-fade-in">
                        <div className="flex items-center gap-2 text-deep-navy/50 font-mono text-xs font-bold">
                          <Clock size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
                          <span>{lang === 'id' ? 'COOLDOWN KRAN AKTIF' : 'FAUCET COOLDOWN ACTIVE'}</span>
                        </div>
                        <div className="font-mono text-3xl font-bold text-deep-navy tracking-tight">
                          {timeLeftStr}
                        </div>
                        <p className="text-[10px] text-deep-navy/40 text-center leading-relaxed">
                          {lang === 'id' 
                            ? 'Kembalilah setelah hitung mundur selesai untuk klaim Bypass Key berikutnya.'
                            : 'Return once the block timers resolve to claim your next verification credit.'}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleClaimFaucet}
                        className="w-full cora-btn-primary py-3.5 rounded-2xl font-sans font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                      >
                        <Droplet size={14} />
                        <span>{lang === 'id' ? 'KLAIM BYPASS KEY GRATIS' : 'REQUEST FAUCET DROP'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full p-5 rounded-2xl border bg-deep-navy/5 border-deep-navy/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-deep-navy/15 flex items-center justify-center bg-white">
                        <Activity size={14} className="text-cerulean-sky animate-spin" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-deep-navy/40 font-bold block">
                          {lang === 'id' ? 'STATUS TRANSAKSI' : 'TRANSACTION STATE'}
                        </span>
                        <h5 className="text-xs font-bold text-deep-navy truncate">
                          {faucetClaimStatus === 'initiating' && (lang === 'id' ? 'Menginisiasi pemanggilan kontrak...' : 'Initiating smart contract call...')}
                          {faucetClaimStatus === 'broadcasting' && (lang === 'id' ? 'Menyiarkan bukti ke Sequencer...' : 'Broadcasting zero-knowledge proof...')}
                          {faucetClaimStatus === 'confirmed' && (lang === 'id' ? 'TRANSAKSI BERHASIL DIKONFIRMASI!' : 'TRANSACTION SUCCESSFULLY CONFIRMED!')}
                        </h5>
                      </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-deep-navy/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cerulean-sky rounded-full transition-all duration-500"
                          style={{
                            width: 
                              faucetClaimStatus === 'initiating' ? '33%' :
                              faucetClaimStatus === 'broadcasting' ? '66%' : '100%'
                          }}
                        />
                      </div>
                      
                      {/* Live pseudocode output log for cyberpunk tech flavor */}
                      <div className="p-3 bg-black/95 rounded-xl text-emerald-400 font-mono text-[9px] space-y-0.5 leading-normal overflow-hidden max-h-24">
                        <div className="text-white/40">[{new Date().toLocaleTimeString()}] L2 Faucet Sequencer Connection Active</div>
                        <div>&gt; CALLing faucetContract.requestDrop(builderAddress)...</div>
                        {(faucetClaimStatus === 'broadcasting' || faucetClaimStatus === 'confirmed') && (
                          <div className="text-cyan-400">&gt; Generating proof. BroadCast TX hash: {faucetTxHash.slice(0, 18)}...</div>
                        )}
                        {faucetClaimStatus === 'confirmed' && (
                          <div className="text-emerald-400 font-bold">&gt; SUCCESS: +1 Bypass Key minted to local memory block!</div>
                        )}
                      </div>
                    </div>

                    {faucetClaimStatus === 'confirmed' && (
                      <motion.button
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => { sound.playMove(); setFaucetClaimStatus('idle'); }}
                        className="w-full bg-[#00B805] text-white hover:bg-[#00B805]/90 py-2 rounded-xl font-mono text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={12} />
                        <span>DISMISS & BACK</span>
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILES & PROGRESSION */}
            {activeTab === 'profile' && (() => {
              // Load statistics from localStorage or fallback to aggregations
              let scores = [];
              try {
                const scoresStr = localStorage.getItem('base_maze_scores');
                if (scoresStr) {
                  scores = JSON.parse(scoresStr);
                }
              } catch(e){}

              const unlockedLevel = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
              const highestLevel = Math.max(1, unlockedLevel - 1);
              const activePlayerName = localStorage.getItem('base_maze_player_name') || 'Anonymous Builder';
              
              let aggMoves = 0;
              let aggTime = 0;
              let aggGas = 0;
              let aggFirewalls = 0;
              let aggScore = 0;
              
              scores.forEach((s: any) => {
                aggMoves += s.totalMoves || Math.round(s.time * 2);
                aggTime += s.time;
                aggGas += s.gasUsed;
                if (s.badges && s.badges.includes('wall-breaker')) {
                  aggFirewalls += 1;
                }
                aggScore += Math.max(50, Math.round(s.tps * 10 - s.gasUsed));
              });

              const totalMoves = Number(localStorage.getItem('base_maze_profile_total_moves') || String(aggMoves));
              const totalTime = Number(localStorage.getItem('base_maze_profile_total_time') || String(aggTime));
              const totalGas = Number(localStorage.getItem('base_maze_profile_total_gas') || String(aggGas));
              const firewallsDestroyed = Number(localStorage.getItem('base_maze_profile_firewalls_destroyed') || String(aggFirewalls));
              const builderScore = Number(localStorage.getItem('base_maze_profile_score') || String(aggScore));
              const winStreak = Number(localStorage.getItem('base_maze_profile_win_streak') || String(scores.length));
              
              let computedXp = 0;
              scores.forEach((s: any) => {
                if (s.difficulty === 'campaign') {
                  computedXp += 150;
                } else {
                  computedXp += 100;
                }
              });
              const xp = Number(localStorage.getItem('base_maze_profile_xp') || String(computedXp));
              const keysCollected = Number(localStorage.getItem('base_maze_profile_keys_collected') || String(Math.floor(xp / 80)));

              const builderLevel = Math.floor(xp / 1000) + 1;
              const xpIntoLevel = xp % 1000;
              const percentToNextLevel = Math.min(100, Math.round((xpIntoLevel / 1000) * 100));

              const getRankName = (lvl: number) => {
                if (lvl <= 2) return lang === 'id' ? 'Genesis Builder' : 'Genesis Builder';
                if (lvl <= 4) return lang === 'id' ? 'Kadet Akademi Gas' : 'Gas Academy Cadet';
                if (lvl <= 6) return lang === 'id' ? 'Aspiran Validator' : 'Validator Aspirant';
                if (lvl <= 8) return lang === 'id' ? 'Netrunner Tembok Api' : 'Firewall Netrunner';
                if (lvl <= 10) return lang === 'id' ? 'Arsitek Superchain' : 'Superchain Architect';
                return lang === 'id' ? 'Sentinel Nexus' : 'Nexus Sentinel';
              };

              const rankName = getRankName(builderLevel);

              return (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  {/* Builder Identity Card */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 text-white p-5 shadow-lg overflow-hidden font-sans">
                    {/* Background glows */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#0052FF]/20 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0052FF]/10 border border-[#0052FF]/30 flex items-center justify-center text-xs font-bold font-mono">
                          B20
                        </div>
                        <div>
                          <h5 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">Builder Passport</h5>
                          <span className="text-[8px] font-mono text-slate-500 leading-none">ID: BASE-L2-PROMO</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        ACTIVE NODE
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold font-mono text-white tracking-wide">
                          {activePlayerName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span className="text-[#0052FF] font-bold">Lvl {builderLevel}</span>
                          <span>•</span>
                          <span className="text-purple-300 font-semibold">{rankName}</span>
                        </div>
                      </div>

                      <div className="flex-1 max-w-xs">
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                          <span>XP: {xpIntoLevel}/1000</span>
                          <span>{percentToNextLevel}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div 
                            className="bg-gradient-to-r from-[#0052FF] to-purple-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentToNextLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Player Progression Statistics Grid */}
                  <div>
                    <h5 className="font-mono text-[10px] text-deep-navy/40 uppercase tracking-widest font-bold mb-2.5 px-1">
                      {lang === 'id' ? 'Statistik Pencapaian' : 'Performance Achievements'}
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Highest Level</span>
                        <span className="text-sm font-bold font-mono text-deep-navy tracking-tight mt-1">
                          #{highestLevel}
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Total XP</span>
                        <span className="text-sm font-bold font-mono text-cerulean-sky tracking-tight mt-1">
                          {xp.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Builder Score</span>
                        <span className="text-sm font-bold font-mono text-indigo-600 tracking-tight mt-1">
                          {builderScore.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Win Streak</span>
                        <span className="text-sm font-bold font-mono text-amber-500 tracking-tight mt-1 flex items-center gap-1">
                          {winStreak} <span className="text-xs">🔥</span>
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Total Moves</span>
                        <span className="text-sm font-bold font-mono text-deep-navy/80 tracking-tight mt-1">
                          {totalMoves.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Total Time</span>
                        <span className="text-xs font-bold font-mono text-deep-navy/80 tracking-tight mt-1">
                          {Math.floor(totalTime / 60)}m {totalTime % 60}s
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Gas Used</span>
                        <span className="text-sm font-bold font-mono text-warm-red tracking-tight mt-1">
                          {totalGas.toLocaleString()} Gwei
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Firewalls bypassed</span>
                        <span className="text-sm font-bold font-mono text-purple-600 tracking-tight mt-1">
                          {firewallsDestroyed}
                        </span>
                      </div>
                      <div className="bg-white/45 hover:bg-white/70 border border-deep-navy/5 p-2.5 rounded-xl flex flex-col justify-between transition">
                        <span className="text-[8px] font-mono text-deep-navy/50 uppercase leading-tight">Keys Collected</span>
                        <span className="text-sm font-bold font-mono text-emerald-600 tracking-tight mt-1 flex items-center gap-1">
                          {keysCollected} <span className="text-xs">🔑</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Milestone Achievements */}
                  <div>
                    <h5 className="font-mono text-[10px] text-deep-navy/40 uppercase tracking-widest font-bold mb-2.5 px-1">
                      {lang === 'id' ? 'Pencapaian Milestone' : 'Milestone Achievements'}
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { lvl: 100, name: 'Centennial Node', desc: lang === 'id' ? 'Mencapai Level 100' : 'Reach Level 100' },
                        { lvl: 250, name: 'Quarter-K Pioneer', desc: lang === 'id' ? 'Mencapai Level 250' : 'Reach Level 250' },
                        { lvl: 500, name: 'Half-K Warden', desc: lang === 'id' ? 'Mencapai Level 500' : 'Reach Level 500' },
                        { lvl: 750, name: 'Three-Quarter Legend', desc: lang === 'id' ? 'Mencapai Level 750' : 'Reach Level 750' },
                        { lvl: 1000, name: 'Millennial Master', desc: lang === 'id' ? 'Mencapai Level 1000' : 'Reach Level 1000' }
                      ].map((m) => {
                        const isUnlocked = highestLevel >= m.lvl;
                        const progress = Math.min(100, Math.round((highestLevel / m.lvl) * 100));
                        return (
                          <div 
                            key={m.lvl} 
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isUnlocked 
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-deep-navy'
                                : 'bg-white/30 border-deep-navy/5 text-deep-navy/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition ${
                                isUnlocked 
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                  : 'bg-slate-200/50 text-slate-400 border border-slate-300/30'
                              }`}>
                                {m.lvl}
                              </div>
                              <div>
                                <h6 className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-deep-navy' : 'text-deep-navy/60'}`}>
                                  {m.name}
                                </h6>
                                <p className="text-[10px] opacity-75 leading-tight">
                                  {m.desc} • {progress}%
                                </p>
                              </div>
                            </div>

                            {isUnlocked ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={12} strokeWidth={3} />
                              </span>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200/40 border border-slate-300/20 flex items-center justify-center text-slate-400">
                                <span className="text-[10px] font-mono">🔒</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* L2 Themes selection */}
                  <div>
                    <h5 className="font-mono text-[10px] text-deep-navy/40 uppercase tracking-widest font-bold mb-2.5 px-1">
                      {lang === 'id' ? 'Gaya Tampilan Jaringan' : 'Rollup Themes'}
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(L2_THEMES) as L2Theme[]).map((themeKey) => {
                        const activeConf = L2_THEMES[themeKey];
                        const isSelected = l2Theme === themeKey;
                        return (
                          <button
                            key={themeKey}
                            onClick={() => {
                              sound.playMove();
                              setL2Theme(themeKey);
                            }}
                            className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-cloud-white border-2 shadow-sm scale-[1.02]'
                                : 'bg-white/50 border-deep-navy/10 hover:border-deep-navy/20 hover:bg-white'
                            }`}
                            style={isSelected ? { borderColor: activeConf.accentColor } : undefined}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-mono text-[9px] font-bold text-deep-navy/50">
                                {activeConf.ticker}
                              </span>
                              {isSelected && (
                                <span 
                                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                                  style={{ backgroundColor: activeConf.accentColor }}
                                >
                                  <Check size={8} strokeWidth={4} />
                                </span>
                              )}
                            </div>
                            <div className="mt-2.5">
                              <h5 className="font-serif font-bold text-xs text-deep-navy leading-none">
                                {activeConf.name}
                              </h5>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
