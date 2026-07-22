import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserCog,
  Shield,
  Award,
  Sparkles,
  Palette,
  Check,
  Coins,
  Key,
  BarChart3,
  CheckCircle2,
  Lock,
  Edit2
} from 'lucide-react';
import { Language } from '../lib/i18n';
import { sound } from './SoundEngine';
import { usePlayer } from '../context/PlayerContext';
import { PlayerAvatar } from './PlayerAvatar';
import { passportService } from '../services/passportService';

interface ProfilePageProps {
  lang: Language;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ lang }) => {
  const {
    xp,
    builderLevel,
    specialTokens,
    setSpecialTokens,
    customUsername,
    setCustomUsername,
    customPfp,
    setCustomPfp,
    activeSkin,
    setActiveSkin,
    reputation,
    getBuilderRank,
    getNextRank,
    getReputationProgress
  } = usePlayer();

  const [usernameInput, setUsernameInput] = useState(customUsername);
  const [activeTab, setActiveTab] = useState<'passport' | 'shop'>('passport');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const passport = passportService.getPassport();
  const currentRank = getBuilderRank();
  const nextRank = getNextRank();
  const progressPct = getReputationProgress();

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    sound.playSuccess();
    setCustomUsername(usernameInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const skins = [
    { id: 'classic', name: 'Base Classic', color: '#0052FF', cost: 0, unlocked: true },
    { id: 'cyber', name: 'Cyber Neon', color: '#10B981', cost: 200, unlocked: specialTokens >= 200 || activeSkin === 'cyber' },
    { id: 'gold', name: 'Sovereign Gold', color: '#F59E0B', cost: 500, unlocked: specialTokens >= 500 || activeSkin === 'gold' },
    { id: 'purple', name: 'Superchain Void', color: '#8B5CF6', cost: 350, unlocked: specialTokens >= 350 || activeSkin === 'purple' }
  ];

  const handleSelectSkin = (skin: typeof skins[0]) => {
    if (activeSkin === skin.id) return;
    if (skin.unlocked) {
      sound.playSuccess();
      setActiveSkin(skin.id as any);
    } else {
      if (specialTokens >= skin.cost) {
        sound.playSuccess();
        setSpecialTokens(prev => prev - skin.cost);
        setActiveSkin(skin.id as any);
      } else {
        sound.playError();
      }
    }
  };

  return (
    <div className="w-full space-y-8 py-4 font-sans text-deep-navy">
      {/* Header */}
      <div className="border-b border-deep-navy/10 pb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
          {lang === 'id' ? 'PROFIL BUILDER & PASPOR' : 'BUILDER PROFILE & PASSPORT'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
          {lang === 'id' ? 'Identitas & Paspor Builder' : 'Builder Identity & Passport'}
        </h1>
        <p className="text-xs sm:text-sm text-deep-navy/70">
          {lang === 'id'
            ? 'Kelola reputasi, paspor on-chain, avatar, dan kustomisasi skin node Anda.'
            : 'Manage reputation, on-chain passport, avatar, and node skin customizations.'
          }
        </p>
      </div>

      {/* 1. BUILDER PASSPORT CARD */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <PlayerAvatar skin={activeSkin} customPfp={customPfp} size="lg" />
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">
              Lvl {builderLevel}
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-serif font-bold text-white">
                {customUsername || 'Base Builder'}
              </h2>
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/40 text-[#60A5FA] font-mono text-xs font-bold self-center sm:self-auto">
                {currentRank}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Passport Hash: {passport.walletAddress || '0x71a...b82d'}
            </p>

            {/* Next Rank Progress Bar */}
            <div className="space-y-1 pt-2 max-w-md">
              <div className="flex justify-between text-[11px] font-mono text-slate-300">
                <span>{(reputation ?? 0).toLocaleString()} REP</span>
                <span>Next Rank: {nextRank ? `${(nextRank.minRep ?? 0).toLocaleString()} REP` : 'MAX RANK'}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0052FF] to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Passport Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Total Validations</span>
            <span className="text-base font-bold font-mono text-white">{passport.totalMazesCompleted} Mazes</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Total XP Earned</span>
            <span className="text-base font-bold font-mono text-[#60A5FA]">{(xp ?? 0).toLocaleString()} XP</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Level Progress</span>
            <span className="text-base font-bold font-mono text-amber-400">Lvl #{builderLevel}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Balance $B20</span>
            <span className="text-base font-bold font-mono text-emerald-400">{specialTokens} $B20</span>
          </div>
        </div>
      </div>

      {/* 2. PROFILE EDIT & SHOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Username Edit Form */}
        <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-deep-navy/10 pb-3">
            <Edit2 size={18} className="text-[#0052FF]" />
            <h3 className="font-serif font-bold text-base text-deep-navy">
              {lang === 'id' ? 'Ubah Identitas Builder' : 'Edit Builder Identity'}
            </h3>
          </div>

          <form onSubmit={handleSaveUsername} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-deep-navy/70 block mb-1">
                {lang === 'id' ? 'Nama Pengguna' : 'Builder Display Name'}
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. Satoshi_Sovereign"
                className="w-full px-4 py-2.5 rounded-xl border border-deep-navy/20 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-sans font-bold text-xs transition cursor-pointer shadow-md"
            >
              {lang === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
            </button>

            {saveSuccess && (
              <span className="text-xs font-mono text-emerald-600 font-bold block">
                ✓ {lang === 'id' ? 'Identitas berhasil disimpan!' : 'Identity saved successfully!'}
              </span>
            )}
          </form>
        </div>

        {/* Identity Shop (Skin Selector) */}
        <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-deep-navy/10 pb-3">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-purple-600" />
              <h3 className="font-serif font-bold text-base text-deep-navy">
                {lang === 'id' ? 'Toko Skin Node' : 'Node Skin Shop'}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
              <Coins size={14} /> {specialTokens} $B20
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {skins.map(skin => {
              const isCurrent = activeSkin === skin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => handleSelectSkin(skin)}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer space-y-2 ${
                    isCurrent
                      ? 'border-[#0052FF] bg-blue-50 ring-2 ring-[#0052FF]/30'
                      : 'border-deep-navy/10 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-5 h-5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: skin.color }}
                    />
                    {isCurrent ? (
                      <span className="text-[10px] font-mono font-bold text-[#0052FF]">Active</span>
                    ) : skin.unlocked ? (
                      <span className="text-[10px] font-mono text-slate-500">Unlocked</span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600 font-bold">{skin.cost} $B20</span>
                    )}
                  </div>
                  <div className="font-serif font-bold text-xs text-deep-navy">{skin.name}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
