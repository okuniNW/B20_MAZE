import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Target,
  CheckCircle2,
  Award,
  Sparkles,
  Trophy,
  RotateCcw,
  Clock,
  ArrowRight,
  Flame,
  Check,
  Star,
  Gift
} from 'lucide-react';
import { Language } from '../lib/i18n';
import { sound } from './SoundEngine';
import { achievementService, Achievement } from '../services/achievementService';
import { usePlayer } from '../context/PlayerContext';

interface QuestPageProps {
  lang: Language;
  quests: { id: string; nameEn: string; nameId: string; target: number; current: number; completed: boolean; rewardClaimed: boolean }[];
  onClaimQuestReward?: (questId: string) => void;
  onQuickPlay?: () => void;
}

export const QuestPage: React.FC<QuestPageProps> = ({
  lang,
  quests,
  onClaimQuestReward,
  onQuickPlay
}) => {
  const { xp, addReputation } = usePlayer();
  const [activeTab, setActiveTab] = useState<'daily' | 'achievements'>('daily');
  const achievements: Achievement[] = achievementService.getAll();

  // Find Near-Miss Quests (>= 80% progress but not claimed)
  const nearMissQuests = quests.filter(q => !q.rewardClaimed && (q.current / q.target) >= 0.8);

  return (
    <div className="w-full space-y-8 py-4 font-sans text-deep-navy">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-deep-navy/10 pb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
            {lang === 'id' ? 'PUSAT MISI & PENCAPAIAN' : 'QUESTS & ACHIEVEMENTS'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
            {lang === 'id' ? 'Misi Harian & Pencapaian' : 'Quests & Achievements'}
          </h1>
          <p className="text-xs sm:text-sm text-deep-navy/70">
            {lang === 'id'
              ? 'Selesaikan misi validasi sekuenser untuk mengklaim $B20 dan poin reputasi.'
              : 'Complete sequencer validation tasks to earn $B20 and reputation points.'
            }
          </p>
        </div>

        {/* Refresh Info Badge */}
        <div className="bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono text-deep-navy/70 self-start sm:self-auto">
          <RotateCcw size={14} className="text-[#0052FF]" />
          <span>UTC 00:00 Auto-Refresh</span>
        </div>
      </div>

      {/* Near-Miss Recovery Reminder Bar (If any quest >= 80%) */}
      {nearMissQuests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500 text-white">
              <Flame size={18} />
            </span>
            <div>
              <div className="font-bold text-xs text-amber-900">
                {lang === 'id' ? 'Hampir Selesai! (Near-Miss Detected)' : 'Almost Complete! (Near-Miss Detected)'}
              </div>
              <div className="text-[11px] text-amber-800 font-mono mt-0.5">
                {lang === 'id'
                  ? `Anda memiliki ${nearMissQuests.length} misi dengan progres > 80%! Selesaikan sekarang.`
                  : `You have ${nearMissQuests.length} quests with > 80% progress! Finish them now.`
                }
              </div>
            </div>
          </div>

          {onQuickPlay && (
            <button
              onClick={() => {
                sound.playMove();
                onQuickPlay();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold text-xs shadow-sm transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>{lang === 'id' ? 'Mainkan Sekarang' : 'Play Now'}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-deep-navy/10 pb-2">
        <button
          onClick={() => {
            sound.playMove();
            setActiveTab('daily');
          }}
          className={`px-5 py-2.5 rounded-xl font-sans font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'daily'
              ? 'bg-[#0052FF] text-white shadow-md'
              : 'bg-white text-deep-navy hover:bg-slate-100 border border-deep-navy/10'
          }`}
        >
          <Target size={16} />
          <span>{lang === 'id' ? 'Misi Harian' : 'Daily Quests'} ({quests.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playMove();
            setActiveTab('achievements');
          }}
          className={`px-5 py-2.5 rounded-xl font-sans font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-[#0052FF] text-white shadow-md'
              : 'bg-white text-deep-navy hover:bg-slate-100 border border-deep-navy/10'
          }`}
        >
          <Trophy size={16} />
          <span>{lang === 'id' ? 'Pencapaian Unik' : 'Achievements'} ({achievements.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY QUESTS */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map(quest => {
              const pct = Math.min(100, Math.round((quest.current / quest.target) * 100));
              const canClaim = quest.completed && !quest.rewardClaimed;

              return (
                <div
                  key={quest.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                    quest.rewardClaimed
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : canClaim
                      ? 'border-[#0052FF] shadow-md ring-2 ring-[#0052FF]/20'
                      : 'border-deep-navy/10 hover:border-deep-navy/20'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-bold text-sm text-deep-navy">
                        {lang === 'id' ? quest.nameId : quest.nameEn}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0052FF] whitespace-nowrap">
                        +50 $B20 / +25 REP
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-deep-navy/60">
                        <span>{quest.current} / {quest.target}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            quest.rewardClaimed
                              ? 'bg-emerald-500'
                              : canClaim
                              ? 'bg-[#0052FF]'
                              : 'bg-blue-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Claim or Action Button */}
                  <div>
                    {quest.rewardClaimed ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={16} />
                        <span>{lang === 'id' ? 'Hadiah Telah Diklaim' : 'Reward Claimed'}</span>
                      </div>
                    ) : canClaim ? (
                      <button
                        onClick={() => {
                          if (onClaimQuestReward) onClaimQuestReward(quest.id);
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-sans font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <Gift size={16} />
                        <span>{lang === 'id' ? 'Klaim Hadiah (+50 $B20)' : 'Claim Reward (+50 $B20)'}</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono text-center">
                        {lang === 'id' ? 'Dalam Proses' : 'In Progress'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`bg-white rounded-2xl p-5 border transition-all space-y-3 ${
                ach.unlocked
                  ? 'border-amber-400 bg-amber-50/20 shadow-sm'
                  : 'border-deep-navy/10 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-2.5 rounded-xl ${ach.unlocked ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Trophy size={18} />
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  +{ach.rewardReputation} REP
                </span>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-deep-navy">{ach.title}</h4>
                <p className="text-xs text-deep-navy/70 mt-0.5">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-deep-navy/5 flex items-center justify-between text-[10px] font-mono">
                <span className={ach.unlocked ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {ach.unlocked ? '✓ Unlocked' : 'Locked'}
                </span>
                <span className="text-deep-navy/50">{ach.progress} / {ach.target}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
