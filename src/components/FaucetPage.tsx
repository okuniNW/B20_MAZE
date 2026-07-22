import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Droplet,
  Coins,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldCheck,
  Gift,
  Key,
  Award
} from 'lucide-react';
import { Language } from '../lib/i18n';
import { sound } from './SoundEngine';
import { usePlayer } from '../context/PlayerContext';
import { analyticsService } from '../services/analyticsService';

interface FaucetPageProps {
  lang: Language;
  lastClaimTime: number;
  setLastClaimTime: (time: number) => void;
  faucetClaimStatus: 'idle' | 'initiating' | 'broadcasting' | 'confirmed';
  setFaucetClaimStatus: (status: 'idle' | 'initiating' | 'broadcasting' | 'confirmed') => void;
  faucetTxHash: string;
  setFaucetTxHash: (hash: string) => void;
}

export const FaucetPage: React.FC<FaucetPageProps> = ({
  lang,
  lastClaimTime,
  setLastClaimTime,
  faucetClaimStatus,
  setFaucetClaimStatus,
  faucetTxHash,
  setFaucetTxHash
}) => {
  const {
    specialTokens,
    setSpecialTokens,
    dailyStreak,
    hasCheckedInToday,
    isStreakProtected,
    claimDailyStreak,
    addReputation
  } = usePlayer();

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [streakClaimedFeedback, setStreakClaimedFeedback] = useState(false);

  // 24 Hour Faucet Cooldown timer check
  useEffect(() => {
    const updateCooldown = () => {
      const now = Date.now();
      const elapsed = now - lastClaimTime;
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      if (elapsed < twentyFourHoursMs) {
        setCooldownRemaining(twentyFourHoursMs - elapsed);
      } else {
        setCooldownRemaining(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastClaimTime]);

  const formatCooldown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClaimFaucet = () => {
    if (cooldownRemaining > 0 || faucetClaimStatus !== 'idle') return;

    sound.playMove();
    setFaucetClaimStatus('initiating');

    setTimeout(() => {
      setFaucetClaimStatus('broadcasting');
      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setFaucetTxHash(mockHash);

      setTimeout(() => {
        setFaucetClaimStatus('confirmed');
        sound.playSuccess();
        const now = Date.now();
        setLastClaimTime(now);
        localStorage.setItem('base_maze_last_claim_time', String(now));

        // Award rewards
        setSpecialTokens(prev => prev + 100);
        addReputation(50);
        analyticsService.track('faucet_claimed', { amount: 100, rep: 50 });

        setTimeout(() => {
          setFaucetClaimStatus('idle');
        }, 4000);
      }, 1500);
    }, 1200);
  };

  const handleClaimStreak = () => {
    if (hasCheckedInToday) return;
    const success = claimDailyStreak();
    if (success) {
      sound.playSuccess();
      setStreakClaimedFeedback(true);
      setTimeout(() => setStreakClaimedFeedback(false), 3000);
    }
  };

  return (
    <div className="w-full space-y-8 py-4 font-sans text-deep-navy">
      {/* Header */}
      <div className="border-b border-deep-navy/10 pb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
          {lang === 'id' ? 'PUSAT HADIAH BASE' : 'BASE REWARDS CENTER'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
          {lang === 'id' ? 'Faucet & Streak Check-In' : 'Faucet & Daily Check-In'}
        </h1>
        <p className="text-xs sm:text-sm text-deep-navy/70">
          {lang === 'id'
            ? 'Klaim token testnet $B20 gratis setiap 24 jam dan tingkatkan streak harian Anda.'
            : 'Claim free testnet $B20 tokens every 24 hours and maintain your daily check-in streak.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FAUCET CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-deep-navy/10 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-[#0052FF]/10 text-[#0052FF]">
                <Droplet size={28} />
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0052FF] border border-blue-200">
                Testnet Sepolia
              </span>
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-deep-navy">
                {lang === 'id' ? 'Faucet Token $B20' : '$B20 Testnet Faucet'}
              </h2>
              <p className="text-xs text-deep-navy/70 mt-1">
                {lang === 'id'
                  ? 'Dapatkan 100 $B20 dan +50 REP untuk berpartisipasi dalam transaksi jaringan.'
                  : 'Receive 100 $B20 and +50 REP to execute network maze transactions.'
                }
              </p>
            </div>

            {/* Faucet Rewards Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-deep-navy/10 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-mono text-deep-navy/60 uppercase font-bold block">
                  {lang === 'id' ? 'Hadiah Token' : 'Token Reward'}
                </span>
                <span className="text-base font-serif font-bold text-[#0052FF] flex items-center gap-1.5">
                  <Coins size={16} /> +100 $B20
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-deep-navy/60 uppercase font-bold block">
                  {lang === 'id' ? 'Bonus Reputasi' : 'Reputation Bonus'}
                </span>
                <span className="text-base font-serif font-bold text-purple-600 flex items-center gap-1.5">
                  <Award size={16} /> +50 REP
                </span>
              </div>
            </div>

            {/* Status Feedback / Hash */}
            {faucetTxHash && (
              <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-[11px] truncate space-y-1">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Transaction Hash</span>
                <span className="text-emerald-400 font-mono">{faucetTxHash}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="space-y-2">
            {cooldownRemaining > 0 ? (
              <div className="w-full py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 font-mono text-center font-bold text-sm flex items-center justify-center gap-2">
                <Clock size={18} />
                <span>Cooldown: {formatCooldown(cooldownRemaining)}</span>
              </div>
            ) : (
              <button
                disabled={faucetClaimStatus !== 'idle'}
                onClick={handleClaimFaucet}
                className={`w-full py-4 rounded-2xl font-sans font-bold text-base transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  faucetClaimStatus === 'idle'
                    ? 'bg-[#0052FF] hover:bg-[#0052FF]/90 text-white shadow-[#0052FF]/30 active:scale-98'
                    : 'bg-blue-400 text-white cursor-wait'
                }`}
              >
                {faucetClaimStatus === 'idle' && (
                  <>
                    <Droplet size={20} />
                    <span>{lang === 'id' ? 'Klaim Faucet 100 $B20' : 'Claim 100 $B20 Faucet'}</span>
                  </>
                )}
                {faucetClaimStatus === 'initiating' && <span>Initiating Request...</span>}
                {faucetClaimStatus === 'broadcasting' && <span>Broadcasting Tx to Base...</span>}
                {faucetClaimStatus === 'confirmed' && (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 size={18} /> Tx Confirmed!
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* DAILY STREAK CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-deep-navy/10 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <Flame size={28} />
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                Daily Check-In
              </span>
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-deep-navy">
                {lang === 'id' ? 'Streak Login Harian' : 'Daily Streak Multiplier'}
              </h2>
              <p className="text-xs text-deep-navy/70 mt-1">
                {lang === 'id'
                  ? 'Klaim setiap hari untuk melipatgandakan poin reputasi dan mengamankan streak Anda.'
                  : 'Check in daily to build your streak multiplier and accumulate bonus REP.'
                }
              </p>
            </div>

            {/* Streak Counter Box */}
            <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 text-center space-y-2">
              <div className="text-3xl font-serif font-black text-amber-600 flex items-center justify-center gap-2">
                <Flame size={32} className="fill-amber-500 text-amber-500" />
                <span>{dailyStreak} {lang === 'id' ? 'Hari Consecutive' : 'Days Streak'}</span>
              </div>
              {isStreakProtected && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  <ShieldCheck size={12} /> Streak Protected (Grace Period Active)
                </div>
              )}
            </div>

            {streakClaimedFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-mono text-xs font-bold text-center border border-emerald-200">
                {lang === 'id' ? '✓ Check-in harian berhasil! +25 REP ditambahkan.' : '✓ Daily check-in claimed! +25 REP awarded.'}
              </div>
            )}
          </div>

          {/* Streak Action */}
          <div>
            {hasCheckedInToday ? (
              <div className="w-full py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-center font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                <span>{lang === 'id' ? 'Sudah Check-In Hari Ini' : 'Checked In Today'}</span>
              </div>
            ) : (
              <button
                onClick={handleClaimStreak}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold text-base shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Flame size={20} className="fill-current text-white" />
                <span>{lang === 'id' ? 'Klaim Check-In Hari Ini (+25 REP)' : 'Claim Daily Check-In (+25 REP)'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
