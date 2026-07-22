import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ScoreEntry, Difficulty, BADGES } from '../types';
import { achievementService } from '../services/achievementService';
import { socialService } from '../services/socialService';
import { Trophy, Trash2, Award, ArrowLeft, Shield, Share2, CheckCircle, Zap, Swords, Target, Clock, TrendingUp, Flame, Medal } from 'lucide-react';
import { sound } from './SoundEngine';
import { Language, translations } from '../lib/i18n';
import { usePlayer } from '../context/PlayerContext';

// Seed some famous Based/Ethereum profiles to make the scoreboard instantly feel competitive and premium!
const SEED_SCORES: ScoreEntry[] = [
  {
    id: 'seed-1',
    name: 'jesse_pollak 🔵',
    difficulty: 'superchain',
    time: 14.8,
    tps: 844.6,
    gasUsed: 12,
    blockHeight: 18442001,
    date: '2026-07-13',
    badges: ['superchain-overlord', 'speedster', 'no-hints'],
    totalMoves: 41,
    bestEfficiency: 92.4
  },
  {
    id: 'seed-2',
    name: 'brian_armstrong 🛡️',
    difficulty: 'superchain',
    time: 18.2,
    tps: 686.8,
    gasUsed: 14,
    blockHeight: 18441995,
    date: '2026-07-13',
    badges: ['superchain-overlord', 'wall-breaker'],
    totalMoves: 53,
    bestEfficiency: 81.1
  },
  {
    id: 'seed-3',
    name: 'vitalik.eth 🦄',
    difficulty: 'batch',
    time: 8.5,
    tps: 1176.5,
    gasUsed: 8,
    blockHeight: 18441989,
    date: '2026-07-13',
    badges: ['batch-master', 'speedster', 'gas-optimizer'],
    totalMoves: 26,
    bestEfficiency: 96.2
  },
  {
    id: 'seed-4',
    name: 'base_whale 🐳',
    difficulty: 'standard',
    time: 4.2,
    tps: 2380.9,
    gasUsed: 5,
    blockHeight: 18441952,
    date: '2026-07-13',
    badges: ['explorer', 'speed-demon', 'speedster', 'gas-optimizer'],
    totalMoves: 14,
    bestEfficiency: 100.0
  },
  {
    id: 'seed-5',
    name: 'optimist_builder',
    difficulty: 'standard',
    time: 5.8,
    tps: 1724.1,
    gasUsed: 6,
    blockHeight: 18441940,
    date: '2026-07-13',
    badges: ['explorer', 'no-hints'],
    totalMoves: 18,
    bestEfficiency: 88.9
  }
];

interface LeaderboardProps {
  onBackToMenu: () => void;
  currentDifficulty?: Difficulty;
  playerName?: string;
  lang: Language;
  theme?: 'light' | 'dark';
}

export default function Leaderboard({ onBackToMenu, currentDifficulty, playerName, lang }: LeaderboardProps) {
  const { addReputation } = usePlayer();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');
  const [lastRunStats, setLastRunStats] = useState<ScoreEntry | null>(null);
  const [leaderboardShareCopied, setLeaderboardShareCopied] = useState(false);

  const userUnlockedBadges = new Set<string>();
  const activePlayerName = playerName || localStorage.getItem('base_maze_player_name') || '';

  if (activePlayerName) {
    scores.forEach(s => {
      if (s.name && s.name.trim() === activePlayerName.trim() && s.badges) {
        s.badges.forEach(bId => userUnlockedBadges.add(bId));
      }
    });
  }

  useEffect(() => {
    const localScores = localStorage.getItem('base_maze_scores');
    let loadedScores = SEED_SCORES;
    if (localScores) {
      try {
        loadedScores = JSON.parse(localScores);
        setScores(loadedScores);
      } catch (e) {
        setScores(SEED_SCORES);
      }
    } else {
      localStorage.setItem('base_maze_scores', JSON.stringify(SEED_SCORES));
      setScores(SEED_SCORES);
    }

    // Check for Leaderboard Participation Reward (+15)
    if (activePlayerName) {
      const hasScoreEntry = loadedScores.some(s => s.name && s.name.trim() === activePlayerName.trim() && !(s.id && typeof s.id === 'string' && s.id.startsWith('seed-')));
      const alreadyClaimed = localStorage.getItem('base_maze_reputation_leaderboard_participated') === 'true';
      if (hasScoreEntry && !alreadyClaimed) {
        addReputation(15);
        localStorage.setItem('base_maze_reputation_leaderboard_participated', 'true');
      }
    }

    const lastRun = localStorage.getItem('base_maze_last_run_stats');
    if (lastRun) {
      try {
        setLastRunStats(JSON.parse(lastRun));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleShareRecentRun = () => {
    if (!lastRunStats) return;

    const emojiMap: Record<string, string> = {
      'speedster': '⚡',
      'speed-demon': '🚀',
      'explorer': '🔍',
      'batch-master': '📦',
      'superchain-overlord': '👑',
      'gas-optimizer': '🍃',
      'wall-breaker': '🔨',
      'no-hints': '🧠'
    };
    const badgeIcons = (lastRunStats.badges || []).map(bId => emojiMap[bId] || '').filter(Boolean).join('');

    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-d5wew2rrpvpsatud27lhly-555355811670.asia-southeast1.run.app';

    let textToCopy = '';
    const isCampaign = lastRunStats.difficulty === 'campaign';
    if (lang === 'id') {
      textToCopy = [
        `⚡ BLOK LABIRIN BASE B20! ⚡`,
        `👤 Pembuat: ${lastRunStats.name || 'Soul'}`,
        `🎮 Mode: ${isCampaign ? `Lvl ${lastRunStats.level}` : lastRunStats.difficulty.toUpperCase()}`,
        `⏱️ ${lastRunStats.time.toFixed(2)}s | ⚡ ${lastRunStats.tps.toFixed(1)} TPS | ⛽ ${lastRunStats.gasUsed} Gwei`,
        lastRunStats.bestEfficiency ? `🎯 Efisiensi: ${lastRunStats.bestEfficiency}%` : null,
        badgeIcons ? `🏆 Lencana: ${badgeIcons}` : null,
        `🔗 Main: ${appUrl}`,
      ].filter(Boolean).join('\n');
    } else if (lang === 'fr') {
      textToCopy = [
        `⚡ BLOC DE LABYRINTHE BASE! ⚡`,
        `👤 Bâtisseur: ${lastRunStats.name || 'Soul'}`,
        `🎮 Mode: ${isCampaign ? `Niv ${lastRunStats.level}` : lastRunStats.difficulty.toUpperCase()}`,
        `⏱️ ${lastRunStats.time.toFixed(2)}s | ⚡ ${lastRunStats.tps.toFixed(1)} TPS | ⛽ ${lastRunStats.gasUsed} Gwei`,
        lastRunStats.bestEfficiency ? `🎯 Efficacité: ${lastRunStats.bestEfficiency}%` : null,
        badgeIcons ? `🏆 Badges: ${badgeIcons}` : null,
        `🔗 Jouer: ${appUrl}`,
      ].filter(Boolean).join('\n');
    } else if (lang === 'zh') {
      textToCopy = [
        `⚡ BASE B20 迷宫区块！⚡`,
        `👤 建设者: ${lastRunStats.name || 'Soul'}`,
        `🎮 模式: ${isCampaign ? `关卡 ${lastRunStats.level}` : lastRunStats.difficulty.toUpperCase()}`,
        `⏱️ ${lastRunStats.time.toFixed(2)}秒 | ⚡ ${lastRunStats.tps.toFixed(1)} TPS | ⛽ ${lastRunStats.gasUsed} Gwei`,
        lastRunStats.bestEfficiency ? `🎯 效率: ${lastRunStats.bestEfficiency}%` : null,
        badgeIcons ? `🏆 徽章: ${badgeIcons}` : null,
        `🔗 开始建造: ${appUrl}`,
      ].filter(Boolean).join('\n');
    } else {
      textToCopy = [
        `⚡ BASE B20 MAZE BLOCK! ⚡`,
        `👤 Builder: ${lastRunStats.name || 'Soul'}`,
        `🎮 Mode: ${isCampaign ? `Lvl ${lastRunStats.level}` : lastRunStats.difficulty.toUpperCase()}`,
        `⏱️ ${lastRunStats.time.toFixed(2)}s | ⚡ ${lastRunStats.tps.toFixed(1)} TPS | ⛽ ${lastRunStats.gasUsed} Gwei`,
        lastRunStats.bestEfficiency ? `🎯 Efficiency: ${lastRunStats.bestEfficiency}%` : null,
        badgeIcons ? `🏆 Badges: ${badgeIcons}` : null,
        `🔗 Play: ${appUrl}`,
      ].filter(Boolean).join('\n');
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setLeaderboardShareCopied(true);
        sound.playPowerup();
        setTimeout(() => setLeaderboardShareCopied(false), 2500);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleClear = () => {
    if (window.confirm(translations[lang].leaderboard_screen.reset_confirm)) {
      localStorage.removeItem('base_maze_scores');
      setScores([]);
      sound.playReset();
    }
  };

  const filteredScores = scores
    .filter(score => filter === 'all' || score.difficulty === filter)
    .sort((a, b) => {
      // Shorter time = better rank (higher TPS)
      return a.time - b.time;
    });

  const getDifficultyBadge = (diff: Difficulty, scoreLevel?: number) => {
    switch (diff) {
      case 'standard':
        return (
          <span className="border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
            {translations[lang].difficulty.easy_title} (10x10)
          </span>
        );
      case 'batch':
        return (
          <span className="border border-cerulean-sky/20 bg-cerulean-sky/5 text-cerulean-sky text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
            {translations[lang].difficulty.medium_title} (15x15)
          </span>
        );
      case 'superchain':
        return (
          <span className="border border-warm-red/25 bg-warm-red/5 text-warm-red text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
            {translations[lang].difficulty.hard_title} (21x21)
          </span>
        );
      case 'campaign':
        return (
          <span className="border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
            {translations[lang].difficulty.campaign_tab} {scoreLevel ? `#${scoreLevel}` : ''}
          </span>
        );
    }
  };

  const getBadgeStyles = (badgeId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return 'bg-cloud-white/40 border-deep-navy/10 text-deep-navy/40 opacity-50';
    }
    switch (badgeId) {
      case 'speedster':
        return 'bg-amber-500/5 border-amber-500/20 text-amber-700 font-bold';
      case 'speed-demon':
        return 'bg-warm-red/5 border-warm-red/20 text-warm-red font-bold';
      case 'explorer':
        return 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 font-bold';
      case 'batch-master':
        return 'bg-cerulean-sky/5 border-cerulean-sky/20 text-cerulean-sky font-bold';
      case 'superchain-overlord':
        return 'bg-deep-navy/5 border-deep-navy/25 text-deep-navy font-bold';
      case 'gas-optimizer':
        return 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 font-bold';
      case 'wall-breaker':
        return 'bg-warm-red/5 border-warm-red/25 text-warm-red font-bold';
      case 'no-hints':
        return 'bg-cerulean-sky/5 border-cerulean-sky/20 text-cerulean-sky font-bold';
      default:
        return 'bg-deep-navy/5 border-deep-navy/15 text-deep-navy font-bold';
    }
  };

  const t = translations[lang].leaderboard_screen;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="rounded-2xl p-5 mb-6 border border-white/20 bg-white/75 backdrop-blur-xl shadow-[0_8px_30px_rgba(6,29,51,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-warm-red/20 bg-warm-red/5 text-warm-red flex items-center justify-center shadow-sm flex-shrink-0">
            <Trophy size={20} className="animate-bounce" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-serif font-extrabold text-deep-navy tracking-wide">
              {t.title}
            </h1>
            <p className="text-xs font-mono text-deep-navy/60">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playMove();
              onBackToMenu();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold transition cursor-pointer border bg-white border-deep-navy/15 text-deep-navy/80 hover:text-deep-navy hover:border-deep-navy/30 hover:bg-cloud-white shadow-sm"
          >
            <ArrowLeft size={14} />
            {t.back_to_game}
          </button>

          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl transition cursor-pointer border bg-rose-50 border-rose-200 hover:bg-rose-100/50 text-rose-600 shadow-sm flex items-center justify-center"
            title="Reset Leaderboard"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl border mb-6 overflow-x-auto bg-cloud-white border-deep-navy/10">
        <button
          onClick={() => { sound.playMove(); setFilter('all'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer flex-shrink-0 ${
            filter === 'all' 
              ? 'cora-btn-primary shadow-sm' 
              : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
          }`}
        >
          {t.all_blocks}
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('standard'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer flex-shrink-0 ${
            filter === 'standard' 
              ? 'cora-btn-primary shadow-sm' 
              : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
          }`}
        >
          {translations[lang].difficulty.easy_title} (10x10)
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('batch'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer flex-shrink-0 ${
            filter === 'batch' 
              ? 'cora-btn-primary shadow-sm' 
              : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
          }`}
        >
          {translations[lang].difficulty.medium_title} (15x15)
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('superchain'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer flex-shrink-0 ${
            filter === 'superchain' 
              ? 'cora-btn-primary shadow-sm' 
              : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
          }`}
        >
          {translations[lang].difficulty.hard_title} (21x21)
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('campaign'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer flex-shrink-0 ${
            filter === 'campaign' 
              ? 'cora-btn-primary shadow-sm' 
              : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
          }`}
        >
          {translations[lang].difficulty.campaign_tab}
        </button>
      </div>

      {/* LIGHTWEIGHT SOCIAL LAYER (Rival System • Personal Best • Weekly Competition • Champions Podium) */}
      {(() => {
        const activeName = playerName || localStorage.getItem('base_maze_player_name') || '';
        const rival = socialService.getRival(scores, activeName);
        const pb = socialService.getPersonalBest(scores, activeName);
        const weekly = socialService.getWeeklyCompetitionStatus();
        const alerts = socialService.getRivalAlerts(scores, activeName);
        const topPerformers = socialService.getWeeklyTopPerformers(scores, activeName);
        const pbOpps = socialService.getPersonalBestOpportunities(scores, activeName);

        return (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B132B] border border-[#0052FF]/30 text-white shadow-xl font-sans space-y-3"
          >
            {/* Widget Top Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#0052FF]/20 text-[#0052FF] border border-[#0052FF]/30">
                  <Swords size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-white tracking-wider leading-none">
                    {lang === 'id' ? 'Klub Persaingan & Rival' : 'Social Rivalry & Competition Hub'}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">
                    {lang === 'id' ? 'Sistem Rival, Rekor Pribadi & Sesi Mingguan' : 'Rival System • Personal Best • Weekly Competition'}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame size={10} className="text-amber-400 animate-pulse" />
                <span>WEEK {weekly.weekNumber}</span>
              </span>
            </div>

            {/* Active Rival Alerts Banner (if present) */}
            {alerts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      a.severity === 'high'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                        : a.severity === 'medium'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                        : 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.severity === 'high' ? '🚨' : a.severity === 'medium' ? '⚡' : '🎯'}</span>
                      <div>
                        <span className="font-bold block leading-tight">{lang === 'id' ? a.titleId : a.titleEn}</span>
                        <span className="text-[10px] opacity-80 leading-snug block mt-0.5">
                          {lang === 'id' ? a.messageId : a.messageEn}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-black/30 border border-white/10 uppercase shrink-0">
                      #{a.rivalRank} {a.rivalName}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Pillar 1: Rival System */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 font-bold text-blue-400 uppercase">
                    <Target size={12} />
                    {lang === 'id' ? 'Target Rival' : 'Rival Target'}
                  </span>
                  <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30 font-bold">
                    #{rival?.rank || 1}
                  </span>
                </div>

                <div className="my-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{rival?.avatarEmoji || '🎯'}</span>
                    <span className="font-bold text-sm text-white truncate max-w-[130px]" title={rival?.name}>
                      {rival?.name || 'vitalik.eth'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                    <span className="text-slate-400">{lang === 'id' ? 'Selisih:' : 'Gap:'}</span>
                    <span className="font-bold text-amber-300">
                      -{rival?.gapTime ? rival.gapTime.toFixed(2) : '0.50'}s
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-bold">
                      {rival?.tps ? rival.tps.toFixed(0) : '1000'} TPS
                    </span>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-400 bg-black/20 p-1.5 rounded border border-white/5 flex items-center justify-between">
                  <span>{lang === 'id' ? 'Tantang Waktu' : 'Challenge Time'}</span>
                  <span className="text-blue-300 font-bold">{rival?.time ? rival.time.toFixed(2) : '10.00'}s</span>
                </div>
              </div>

              {/* Pillar 2: Personal Best */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 font-bold text-purple-400 uppercase">
                    <TrendingUp size={12} />
                    {lang === 'id' ? 'Rekor Terbaik (PB)' : 'Personal Best'}
                  </span>
                  <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30 font-bold">
                    {pb.totalRuns} RUNS
                  </span>
                </div>

                <div className="my-2 space-y-1 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{lang === 'id' ? 'Waktu Terbaik:' : 'Best Time:'}</span>
                    <span className="font-extrabold text-white">
                      {pb.bestTime ? `${pb.bestTime.toFixed(2)}s` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{lang === 'id' ? 'Throughput Puncak:' : 'Peak TPS:'}</span>
                    <span className="font-extrabold text-purple-300">
                      {pb.bestTps ? `${pb.bestTps.toFixed(1)} TPS` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-400 bg-black/20 p-1.5 rounded border border-white/5 flex items-center justify-between">
                  <span>{lang === 'id' ? 'Mode Favorit' : 'Fav Mode'}</span>
                  <span className="text-purple-300 font-bold uppercase">{pb.favDifficulty}</span>
                </div>
              </div>

              {/* Pillar 3: Weekly Competition */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 font-bold text-amber-400 uppercase">
                    <Clock size={12} />
                    {lang === 'id' ? 'Kompetisi Mingguan' : 'Weekly Competition'}
                  </span>
                  <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                    {weekly.daysRemaining}d {weekly.hoursRemaining}h LEFT
                  </span>
                </div>

                <div className="my-2 space-y-1 font-mono text-[10px]">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Medal size={11} className="text-amber-400 flex-shrink-0" />
                    <span>Top 1: <strong className="text-amber-300">{weekly.rewards.top1}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Award size={11} className="text-slate-300 flex-shrink-0" />
                    <span>Top 3: <strong className="text-slate-200">{weekly.rewards.top3}</strong></span>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-400 bg-black/20 p-1.5 rounded border border-white/5 flex items-center justify-between">
                  <span>{lang === 'id' ? 'Berakhir Pada' : 'Sprint Resets'}</span>
                  <span className="text-amber-300 font-bold">{weekly.endDateString}</span>
                </div>
              </div>
            </div>

            {/* Weekly Champions Podium */}
            {topPerformers.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
                    <Trophy size={13} className="text-amber-400" />
                    {lang === 'id' ? 'Podium Juara Mingguan' : 'Weekly Champions Podium'}
                  </span>
                  <span className="text-[8px] text-slate-400">
                    {lang === 'id' ? '3 Teratas Waktu Terbaik' : 'Top 3 Best Times'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {topPerformers.map(p => (
                    <div
                      key={p.rank}
                      className={`p-2 rounded-xl border flex flex-col items-center text-center font-mono ${
                        p.rank === 1
                          ? 'bg-gradient-to-b from-amber-500/20 to-amber-900/20 border-amber-500/40 text-amber-200'
                          : p.rank === 2
                          ? 'bg-gradient-to-b from-slate-400/20 to-slate-800/20 border-slate-400/40 text-slate-200'
                          : 'bg-gradient-to-b from-amber-700/20 to-amber-950/20 border-amber-700/40 text-amber-300'
                      }`}
                    >
                      <span className="text-xl my-0.5">{p.avatarEmoji}</span>
                      <span className="font-bold text-[11px] truncate max-w-full px-1" title={p.name}>
                        {p.name}
                      </span>
                      <span className="text-[9px] opacity-80 mt-0.5">{p.time.toFixed(2)}s ({p.tps.toFixed(0)} TPS)</span>
                      <span className="text-[8px] mt-1 font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                        {p.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Best Opportunities */}
            {pbOpps.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-purple-300 uppercase">
                    <Zap size={13} className="text-purple-400" />
                    {lang === 'id' ? 'Target Rekor Pribadi (PB)' : 'Personal Best Target Opportunities'}
                  </span>
                  <span className="text-[8px] text-purple-300/80">
                    {lang === 'id' ? 'Klaim Bonus XP saat Tembus' : 'Claim XP Bonus on Breakthrough'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                  {pbOpps.map(opp => (
                    <div
                      key={opp.difficulty}
                      className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-purple-300 font-bold uppercase text-[9px] mb-1">
                          <span>{opp.difficulty}</span>
                          <span className="bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-500/30 text-purple-200">
                            +{opp.rewardXp} XP
                          </span>
                        </div>
                        <p className="text-slate-300 text-[9.5px] leading-tight">
                          {lang === 'id' ? opp.descriptionId : opp.descriptionEn}
                        </p>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                        <span>{lang === 'id' ? 'Target Waktu:' : 'Target Time:'}</span>
                        <span className="font-extrabold text-amber-300">{opp.targetTime.toFixed(2)}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* Recent Run Sharing Card */}
      {lastRunStats && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-6 bg-gradient-to-br from-cerulean-sky/5 via-white to-cloud-white border border-cerulean-sky/15 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Zap size={80} className="text-cerulean-sky" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold tracking-widest text-cerulean-sky uppercase bg-cerulean-sky/10 px-2 py-0.5 rounded-md">
                {lang === 'id' ? 'Hasil Run Terbaru Anda' : 'Your Recent Performance'}
              </span>
              <h3 className="text-lg font-serif font-bold text-deep-navy">
                {lastRunStats.difficulty === 'campaign'
                  ? (lang === 'id' ? `Kampanye (Level ${lastRunStats.level})` : `Campaign (Level ${lastRunStats.level})`)
                  : (lang === 'id' ? `Speedrun Klasik (${lastRunStats.difficulty.toUpperCase()})` : `Classic Speedrun (${lastRunStats.difficulty.toUpperCase()})`)}
              </h3>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 text-xs text-deep-navy/70 font-mono">
                <div>
                  <span className="text-deep-navy/40 mr-1">{lang === 'id' ? 'Waktu:' : 'Time:'}</span>
                  <span className="font-bold text-deep-navy">{lastRunStats.time.toFixed(2)}s</span>
                </div>
                <div className="text-deep-navy/20">|</div>
                <div>
                  <span className="text-deep-navy/40 mr-1">Throughput:</span>
                  <span className="font-bold text-cerulean-sky">{lastRunStats.tps.toFixed(1)} TPS</span>
                </div>
                <div className="text-deep-navy/20">|</div>
                <div>
                  <span className="text-deep-navy/40 mr-1">Gas:</span>
                  <span className="font-bold text-warm-red">{lastRunStats.gasUsed} Gwei</span>
                </div>
                {lastRunStats.bestEfficiency && (
                  <>
                    <div className="text-deep-navy/20">|</div>
                    <div>
                      <span className="text-deep-navy/40 mr-1">{lang === 'id' ? 'Efisiensi:' : 'Efficiency:'}</span>
                      <span className="font-bold text-deep-navy">{lastRunStats.bestEfficiency}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleShareRecentRun}
              className={`w-full sm:w-auto py-2.5 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 border transition shadow-sm cursor-pointer whitespace-nowrap ${
                leaderboardShareCopied
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/10'
                  : 'bg-deep-navy border-deep-navy text-white hover:bg-deep-navy/90 shadow-md shadow-deep-navy/10'
              }`}
            >
              {leaderboardShareCopied ? (
                <>
                  <CheckCircle size={14} className="animate-pulse" />
                  <span>{lang === 'id' ? 'Berhasil Disalin!' : 'Copied to Clipboard!'}</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>{lang === 'id' ? 'Bagikan Hasil Run' : 'Share Run Stats'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Achievement Badges Showcase */}
      <div className="rounded-2xl p-6 mb-6 cora-desk-card font-sans relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-deep-navy/10">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-cerulean-sky" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-deep-navy/70">
              {t.badge_system}
            </h2>
          </div>
          {activePlayerName && (() => {
            const achievements = achievementService.getAchievements();
            const unlockedCount = achievements.filter(a => a.unlocked).length;
            return (
              <span className="text-[10px] font-mono border px-2.5 py-0.5 rounded-md bg-warm-red/5 text-warm-red border-warm-red/20 font-bold">
                {t.progress_text.replace('{name}', activePlayerName).replace('{unlocked}', String(unlockedCount)).replace('{total}', String(achievements.length))}
              </span>
            );
          })()}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievementService.getAchievements().map(badge => {
            const isUnlocked = badge.unlocked;
            const localizedBadge = translations[lang].badges[badge.id] || { name: badge.title, description: badge.description };
            
            // Highlight newly unlocked achievements (from last run stats or unlocked very recently within 10 minutes)
            const isNew = isUnlocked && (
              (lastRunStats?.badges || []).includes(badge.id) ||
              (badge.unlockedAt ? (Date.now() - new Date(badge.unlockedAt).getTime() < 10 * 60 * 1000) : false)
            );

            // Detailed styling depending on status and rarity
            let rarityBg = '';
            let rarityBadgeStyle = '';
            let ringStyle = '';

            if (isUnlocked) {
              if (badge.rarity === 'Legendary') {
                rarityBg = 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-[0_4px_16px_rgba(245,158,11,0.06)]';
                rarityBadgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
                ringStyle = isNew ? 'ring-2 ring-amber-400 ring-offset-2 animate-pulse-ring' : 'hover:border-amber-400';
              } else if (badge.rarity === 'Epic') {
                rarityBg = 'bg-purple-50/80 border-purple-300 text-purple-950 shadow-[0_4px_16px_rgba(139,92,246,0.06)]';
                rarityBadgeStyle = 'bg-purple-100 text-purple-800 border-purple-200';
                ringStyle = isNew ? 'ring-2 ring-purple-400 ring-offset-2 animate-pulse-ring' : 'hover:border-purple-400';
              } else if (badge.rarity === 'Rare') {
                rarityBg = 'bg-blue-50/80 border-blue-300 text-blue-950 shadow-[0_4px_16px_rgba(59,130,246,0.06)]';
                rarityBadgeStyle = 'bg-blue-100 text-blue-800 border-blue-200';
                ringStyle = isNew ? 'ring-2 ring-blue-400 ring-offset-2 animate-pulse-ring' : 'hover:border-blue-400';
              } else {
                rarityBg = 'bg-slate-50/90 border-slate-200 text-slate-900 shadow-sm';
                rarityBadgeStyle = 'bg-slate-100 border-slate-200 text-slate-700';
                ringStyle = isNew ? 'ring-2 ring-slate-400 ring-offset-2 animate-pulse-ring' : 'hover:border-slate-300';
              }
            } else {
              rarityBg = 'bg-white/40 border-slate-200/60 text-slate-400 opacity-70 grayscale-[20%]';
              rarityBadgeStyle = 'bg-slate-100 border-slate-200 text-slate-400';
              ringStyle = '';
            }

            const percent = Math.min(100, Math.round((badge.progress / badge.target) * 100));

            return (
              <div
                key={badge.id}
                className={`flex flex-col relative p-4 rounded-xl border transition-all duration-300 ${rarityBg} ${ringStyle} ${
                  isUnlocked ? 'hover:scale-[1.02]' : ''
                }`}
              >
                {/* NEW Overlay Badge */}
                {isNew && (
                  <span className="absolute -top-2.5 right-3 text-[8px] font-mono font-bold uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded shadow-md animate-bounce flex items-center gap-0.5 z-10">
                    ★ {lang === 'id' ? 'BARU' : 'NEW'}
                  </span>
                )}

                {/* Top Row: Rarity & Category */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded border leading-none ${rarityBadgeStyle}`}>
                    {badge.rarity}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800/20 px-1.5 py-0.5 rounded border border-slate-200/20 leading-none">
                    {badge.category}
                  </span>
                </div>

                {/* Title & Description with Emoji */}
                <div className="flex gap-2.5 items-start">
                  <span className={`text-2xl mt-0.5 flex-shrink-0 filter ${isUnlocked ? '' : 'grayscale opacity-60'}`} role="img" aria-label={localizedBadge.name}>
                    {badge.emoji}
                  </span>
                  <div className="text-left flex-grow">
                    <h3 className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                      {localizedBadge.name}
                    </h3>
                    <p className={`text-[10px] leading-snug mt-1 ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                      {localizedBadge.description}
                    </p>
                  </div>
                </div>

                {/* Rewards Indicators */}
                <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-200/40">
                  <span className="text-[8.5px] font-mono font-semibold text-amber-600 flex items-center gap-0.5">
                    ✨ +{badge.rewardXp} XP
                  </span>
                  <span className="text-slate-300 text-[8.5px] font-mono">|</span>
                  <span className="text-[8.5px] font-mono font-semibold text-blue-600 flex items-center gap-0.5">
                    🛡️ +{badge.rewardReputation} REP
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full mt-3 space-y-1">
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                    <span>
                      {isUnlocked ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          ✓ {t.unlocked_status}
                        </span>
                      ) : (
                        <span>{t.locked_status}</span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {(badge?.progress ?? 0).toLocaleString()} / {(badge?.target ?? 0).toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden border border-slate-300/15">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${percent}%`,
                        background: isUnlocked 
                          ? 'linear-gradient(to right, #10B981, #059669)' 
                          : 'linear-gradient(to right, #3B82F6, #2563EB)'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl overflow-hidden cora-desk-card">
        {filteredScores.length === 0 ? (
          <div className="text-center py-12 px-6 text-deep-navy font-sans bg-white/40 backdrop-blur-sm border-b border-deep-navy/5 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full border border-dashed border-deep-navy/20 flex items-center justify-center text-deep-navy/60 bg-deep-navy/5 animate-pulse">
              <Award size={24} />
            </div>
            
            <div className="space-y-1 max-w-md">
              <p className="text-sm font-sans font-bold text-deep-navy/90">{t.no_scores}</p>
              <p className="text-xs font-mono text-deep-navy/60 leading-relaxed">{t.no_scores_desc}</p>
              <p className="text-xs text-deep-navy/70 italic leading-relaxed pt-1">
                {lang === 'id' 
                  ? '“Papan peringkat adalah tempat legenda menulis bukti kerja mereka.”' 
                  : '“The leaderboard is where legends commit their proof of optimization.”'}
              </p>
            </div>

            <div className="bg-white/60 border border-deep-navy/5 rounded-xl p-3.5 w-full max-w-sm text-left space-y-2 shadow-sm">
              <span className="text-[9px] font-mono font-bold text-deep-navy/60 uppercase tracking-wider block">
                {lang === 'id' ? 'Rekomendasi Tindakan:' : 'Recommended Action:'}
              </span>
              <p className="text-[11px] text-deep-navy/80 leading-relaxed">
                {lang === 'id'
                  ? 'Mainkan labirin dengan tingkat kesulitan baru, kurangi biaya gas seoptimal mungkin, lalu unggah rekor transaksi Anda untuk menantang ekosistem!'
                  : 'Execute a fresh run under another difficulty, compress your gas consumption, and upload your block to challenge vitalik.eth!'
                }
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { sound.playMove(); onBackToMenu(); }}
                  className="flex-1 py-1.5 text-[10px] font-mono bg-deep-navy hover:bg-deep-navy/90 text-white font-bold rounded-lg transition duration-150 cursor-pointer text-center shadow-sm"
                >
                  {lang === 'id' ? 'Kembali Bermain' : 'Go Start Playing'}
                </button>
                <button
                  onClick={() => { sound.playMove(); setFilter('all'); }}
                  className="px-3 py-1.5 text-[10px] font-mono bg-white/80 border border-deep-navy/10 hover:border-deep-navy/25 text-deep-navy/80 rounded-lg transition duration-150 cursor-pointer text-center"
                >
                  {lang === 'id' ? 'Reset Filter' : 'Reset Filters'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] font-mono tracking-wider uppercase border-deep-navy/10 bg-cloud-white/80 text-deep-navy/70">
                  <th className="py-3.5 px-4 text-center w-12 font-bold">{t.th_rank}</th>
                  <th className="py-3.5 px-4 font-bold">{t.th_name}</th>
                  <th className="py-3.5 px-4 font-bold">{t.th_type}</th>
                  <th className="py-3.5 px-4 text-right font-bold">{t.th_duration}</th>
                  <th className="py-3.5 px-4 text-right font-bold">{t.th_throughput}</th>
                  <th className="py-3.5 px-4 text-right font-bold">{t.th_gas}</th>
                  <th className="py-3.5 px-4 text-right font-bold">{t.th_moves}</th>
                  <th className="py-3.5 px-4 text-right font-bold">{t.th_efficiency}</th>
                  <th className="py-3.5 px-4 text-right hidden sm:table-cell font-bold">{t.th_block_number}</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((score, idx) => {
                  const isTop3 = idx < 3;
                  let bgRowClass = '';
                  if (isTop3) {
                    bgRowClass = 'bg-cerulean-sky/5 border-l-4 border-l-cerulean-sky';
                  } else {
                    bgRowClass = 'hover:bg-cloud-white/60';
                  }

                  return (
                    <motion.tr
                      key={score.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`border-b border-deep-navy/5 transition-all ${bgRowClass}`}
                    >
                      <td className="py-4 px-4 text-center font-mono">
                        {idx === 0 ? (
                          <span className="text-yellow-500 font-bold drop-shadow-sm text-base">🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-400 font-bold text-base">🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600 font-bold text-base">🥉</span>
                        ) : (
                          <span className="text-deep-navy/50">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 font-sans">
                          <span className="font-semibold font-mono text-deep-navy hover:text-cerulean-sky transition duration-150">
                            {score.name}
                          </span>
                          {score.badges && score.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {score.badges.map(badgeId => {
                                const b = BADGES.find(x => x.id === badgeId);
                                if (!b) return null;
                                const bLocal = translations[lang].badges[badgeId] || b;
                                const badgeStyles = getBadgeStyles(badgeId, true);
                                return (
                                  <span
                                    key={badgeId}
                                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 border ${badgeStyles}`}
                                    title={bLocal.description}
                                  >
                                    <span>{b.emoji}</span>
                                    <span>{bLocal.name}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getDifficultyBadge(score.difficulty, score.level)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-semibold text-deep-navy">
                        {(score?.time ?? 0).toFixed(2)}s
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-cerulean-sky font-extrabold">
                        {(score?.tps ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-warm-red">
                        {score?.gasUsed ?? 0}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-deep-navy/80">
                        {score?.totalMoves !== undefined ? score.totalMoves : Math.round((score?.time ?? 0) * 2.5) || 12}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-600 font-bold">
                        {(score?.bestEfficiency !== undefined ? score.bestEfficiency : Math.max(65, Math.min(100, Math.round(98 - (score?.time ?? 0) / 2)))).toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-deep-navy/40 text-xs hidden sm:table-cell">
                        #{score?.blockHeight ?? 0}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-mono px-2 text-deep-navy/50">
        <span>{t.tps_footer}</span>
        <span>{t.gas_footer}</span>
      </div>
    </div>
  );
}
