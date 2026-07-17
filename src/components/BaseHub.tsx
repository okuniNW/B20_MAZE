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

            {/* PROFILES (THEME CHANGER) */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="text-center mb-1">
                  <h4 className="font-serif text-base font-bold text-deep-navy">
                    {lang === 'id' ? 'Profil Jaringan Layer-2' : 'Layer-2 Network Styles'}
                  </h4>
                  <p className="text-[11px] text-deep-navy/60">
                    {lang === 'id' 
                      ? 'Personalisasikan estetika visual berdasarkan jaringan L2 favorit Anda.' 
                      : 'Personalize the visual theme to match your favorite Ethereum rollup platform.'}
                  </p>
                </div>

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
                        className={`p-4 rounded-2xl text-left border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cloud-white border-2 shadow-sm scale-[1.02]'
                            : 'bg-white/50 border-deep-navy/10 hover:border-deep-navy/20 hover:bg-white'
                        }`}
                        style={isSelected ? { borderColor: activeConf.accentColor } : undefined}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-[10px] font-bold text-deep-navy/50">
                            {activeConf.ticker}
                          </span>
                          {isSelected && (
                            <span 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: activeConf.accentColor }}
                            >
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <div className="mt-4">
                          <h5 className="font-serif font-bold text-sm text-deep-navy leading-none">
                            {activeConf.name}
                          </h5>
                          <span className="text-[9px] font-mono opacity-80 mt-1 block" style={{ color: activeConf.accentColor }}>
                            {activeConf.accentColor}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
