import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Zap,
  Trophy,
  Gift,
  Clock,
  Sparkles,
  Award,
  ShieldCheck
} from 'lucide-react';
import { Language } from '../lib/i18n';
import { sound } from './SoundEngine';
import { eventService, GameEvent } from '../services/eventService';
import { seasonService, SEASONS, SEASON_REWARDS_POOL, SeasonalReward } from '../services/seasonService';
import { usePlayer } from '../context/PlayerContext';

interface EventPageProps {
  lang: Language;
}

export const EventPage: React.FC<EventPageProps> = ({ lang }) => {
  const { reputation, builderLevel } = usePlayer();
  const allEvents = eventService.getAllEvents();
  const activeEvents = eventService.getActiveEvents();
  const currentSeason = seasonService.getCurrentSeason();
  const seasonRewards: SeasonalReward[] = SEASON_REWARDS_POOL[currentSeason.seasonId] || SEASON_REWARDS_POOL['season-1-base-builder'] || [];

  return (
    <div className="w-full space-y-8 py-4 font-sans text-deep-navy">
      {/* Header */}
      <div className="border-b border-deep-navy/10 pb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
          {lang === 'id' ? 'PUSAT ACARA & MUSIM' : 'EVENTS & SEASON PASS'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
          {lang === 'id' ? 'Acara Komunitas & Musim' : 'Ecosystem Events & Seasons'}
        </h1>
        <p className="text-xs sm:text-sm text-deep-navy/70">
          {lang === 'id'
            ? 'Ikuti acara multiplier terbatas dan raih hadiah eksklusif Season Pass.'
            : 'Participate in limited-time multiplier events and unlock Season Pass rewards.'
          }
        </p>
      </div>

      {/* 1. FEATURED MULTIPLIER EVENTS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500 text-white">
            <Zap size={18} />
          </span>
          <h2 className="text-lg font-serif font-bold text-deep-navy">
            {lang === 'id' ? 'Acara Ekosistem Base' : 'Base Ecosystem Events'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allEvents.map(evt => {
            const isLive = evt.isActive;
            const title = lang === 'id' ? evt.titleId : evt.title;
            const desc = lang === 'id' ? evt.descriptionId : evt.description;

            return (
              <div
                key={evt.id}
                className={`rounded-2xl p-5 border space-y-3 transition-all ${
                  isLive
                    ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-500/30'
                    : 'bg-slate-50 border-deep-navy/10 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{evt.badgeEmoji}</span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      isLive ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isLive ? 'LIVE NOW' : (lang === 'id' ? 'Mendatang' : 'Upcoming')}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-700">
                    {evt.xpMultiplier > 1 ? `${evt.xpMultiplier}x XP` : `${evt.repMultiplier}x REP`}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-deep-navy">
                    {title}
                  </h3>
                  <p className="text-xs text-deep-navy/70 mt-1">
                    {desc}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-deep-navy/60 pt-2 border-t border-deep-navy/5">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{eventService.getFormattedTimeRemaining(evt)}</span>
                  </div>
                  <span className="font-semibold text-amber-600">
                    {lang === 'id' ? evt.activeBonusDescId : evt.activeBonusDescEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SEASON PASS REWARDS POOL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-deep-navy/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deep-navy/10 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-purple-600">
              SEASON #{currentSeason.seasonNumber} PASS
            </span>
            <h2 className="text-xl font-serif font-bold text-deep-navy">
              {currentSeason.seasonName}
            </h2>
            <p className="text-xs text-deep-navy/70 mt-0.5">
              {lang === 'id'
                ? 'Selesaikan tantangan musim untuk membuka skin, lencana, dan dorongan reputasi.'
                : 'Complete seasonal challenges to unlock skins, badges, and reputation boosts.'
              }
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
            <Trophy size={18} className="text-purple-600" />
            <div>
              <div className="text-[9px] font-mono text-purple-800 uppercase font-bold">Builder Rank</div>
              <div className="text-xs font-bold text-purple-900">Level #{builderLevel}</div>
            </div>
          </div>
        </div>

        {/* Rewards Pool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasonRewards.map((item, idx) => {
            const isUnlocked = reputation >= (item.tier === 'Legendary' ? 1000 : item.tier === 'Epic' ? 500 : 100);

            return (
              <div
                key={item.rewardId || idx}
                className={`p-4 rounded-2xl border transition space-y-2 ${
                  isUnlocked
                    ? 'border-purple-300 bg-purple-50/30'
                    : 'border-deep-navy/10 bg-slate-50 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    item.tier === 'Legendary' ? 'bg-amber-500 text-white' :
                    item.tier === 'Epic' ? 'bg-purple-600 text-white' :
                    item.tier === 'Rare' ? 'bg-[#0052FF] text-white' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {item.tier} Tier
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${isUnlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isUnlocked ? '✓ Unlocked' : 'Locked'}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm text-deep-navy">
                    {item.name}
                  </h4>
                  <p className="text-xs text-deep-navy/70 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-purple-100 text-purple-700 font-bold">
                  <span>+{item.xpBonus} XP</span>
                  <span>+{item.reputationBonus} REP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
