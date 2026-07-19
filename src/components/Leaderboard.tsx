import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ScoreEntry, Difficulty, BADGES } from '../types';
import { Trophy, Trash2, Award, ArrowLeft, Shield, Share2, CheckCircle, Zap } from 'lucide-react';
import { sound } from './SoundEngine';
import { Language, translations } from '../lib/i18n';

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
    if (localScores) {
      try {
        setScores(JSON.parse(localScores));
      } catch (e) {
        setScores(SEED_SCORES);
      }
    } else {
      localStorage.setItem('base_maze_scores', JSON.stringify(SEED_SCORES));
      setScores(SEED_SCORES);
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
          {activePlayerName && (
            <span className="text-[10px] font-mono border px-2.5 py-0.5 rounded-md bg-warm-red/5 text-warm-red border-warm-red/20 font-bold">
              {t.progress_text.replace('{name}', activePlayerName).replace('{unlocked}', String(userUnlockedBadges.size)).replace('{total}', String(BADGES.length))}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BADGES.map(badge => {
            const isUnlocked = userUnlockedBadges.has(badge.id);
            const localizedBadge = translations[lang].badges[badge.id] || badge;
            const cardStyles = getBadgeStyles(badge.id, isUnlocked);

            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 ${cardStyles} ${
                  isUnlocked ? 'hover:scale-[1.03] shadow-sm' : ''
                }`}
              >
                <span className={`text-2xl mb-1.5 filter ${isUnlocked ? '' : 'grayscale'}`}>
                  {badge.emoji}
                </span>
                <span className="text-[11px] font-bold leading-none">
                  {localizedBadge.name}
                </span>
                <span className="text-[9px] leading-tight mt-1.5 max-w-[120px] opacity-80">
                  {localizedBadge.description}
                </span>
                <span className="text-[8px] font-mono mt-2.5 uppercase tracking-wider">
                  {isUnlocked ? (
                    <span className="text-emerald-600 font-bold">✓ {t.unlocked_status}</span>
                  ) : (
                    <span className="text-deep-navy/40">{t.locked_status}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl overflow-hidden cora-desk-card">
        {filteredScores.length === 0 ? (
          <div className="text-center py-12 text-deep-navy/50 font-sans">
            <Award size={48} className="mx-auto mb-3 opacity-40 text-warm-red" />
            <p className="text-sm font-sans font-bold">{t.no_scores}</p>
            <p className="text-xs font-mono mt-1 text-deep-navy/40">{t.no_scores_desc}</p>
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
                        {score.time.toFixed(2)}s
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-cerulean-sky font-extrabold">
                        {score.tps.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-warm-red">
                        {score.gasUsed}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-deep-navy/80">
                        {score.totalMoves !== undefined ? score.totalMoves : Math.round(score.time * 2.5) || 12}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-600 font-bold">
                        {(score.bestEfficiency !== undefined ? score.bestEfficiency : Math.max(65, Math.min(100, Math.round(98 - score.time / 2)))).toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-deep-navy/40 text-xs hidden sm:table-cell">
                        #{score.blockHeight}
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
