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
  ArrowRight,
  Calendar,
  Trophy,
  Award,
  Shield,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Flame,
  Compass,
  UserCog,
  BarChart3,
  Gift
} from 'lucide-react';
import { L2Theme } from '../types';
import { L2_THEMES } from '../lib/themes';
import { sound } from './SoundEngine';
import { Language, translations } from '../lib/i18n';
import { usePlayer } from '../context/PlayerContext';
import { PlayerAvatar } from './PlayerAvatar';
import { seasonService, SEASONS, SEASON_REWARDS_POOL } from '../services/seasonService';
import { achievementService } from '../services/achievementService';
import { passportService } from '../services/passportService';
import { getNextRank, getReputationProgress } from '../utils/reputationUtils';
import { eventService, GameEvent } from '../services/eventService';

interface BaseHubProps {
  lang: Language;
  l2Theme: L2Theme;
  setL2Theme: (theme: L2Theme) => void;
  quests: { id: string; nameEn: string; nameId: string; target: number; current: number; completed: boolean; rewardClaimed: boolean }[];
  lastClaimTime: number;
  setLastClaimTime: (time: number) => void;
  faucetClaimStatus: 'idle' | 'initiating' | 'broadcasting' | 'confirmed';
  setFaucetClaimStatus: (status: 'idle' | 'initiating' | 'broadcasting' | 'confirmed') => void;
  faucetTxHash: string;
  setFaucetTxHash: (hash: string) => void;
  onClaimQuestReward?: (questId: string) => void;
  onQuickPlay?: () => void;
}

export default function BaseHub({
  lang,
  l2Theme,
  setL2Theme,
  quests,
  lastClaimTime,
  setLastClaimTime,
  faucetClaimStatus,
  setFaucetClaimStatus,
  faucetTxHash,
  setFaucetTxHash,
  onClaimQuestReward,
  onQuickPlay,
}: BaseHubProps) {
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
    getReputationProgress,
    dailyStreak,
    hasCheckedInToday,
    isStreakProtected,
    claimDailyStreak,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'faucet' | 'quests' | 'profile' | 'events'>('quests');
  const [eventsTick, setEventsTick] = useState(0);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const cooldownIntervalRef = useRef<any>(null);

  // Profile customization & shop local states
  const [usernameInput, setUsernameInput] = useState(customUsername);
  const [pfpInput, setPfpInput] = useState(customPfp);

  useEffect(() => {
    setUsernameInput(customUsername);
  }, [customUsername]);

  useEffect(() => {
    setPfpInput(customPfp);
  }, [customPfp]);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    try {
      const list = localStorage.getItem('base_maze_unlocked_skins');
      return list ? JSON.parse(list) : ['default'];
    } catch (e) {
      return ['default'];
    }
  });
  const [shopFeedback, setShopFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [simulateSeasonalEmpty, setSimulateSeasonalEmpty] = useState(false);
  const [simulatePassportEmpty, setSimulatePassportEmpty] = useState(false);

  // UX Simplification Collapsible States
  const [showDailyStreak, setShowDailyStreak] = useState(!hasCheckedInToday);
  const [showNextAction, setShowNextAction] = useState(true);
  const [showSeasonalProgression, setShowSeasonalProgression] = useState(false);
  const [showActiveProgression, setShowActiveProgression] = useState(false);
  const [showIdentityCustomizer, setShowIdentityCustomizer] = useState(false);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [showRollupThemes, setShowRollupThemes] = useState(false);

  // Daily Streak Integration states
  const [streakClaimedReward, setStreakClaimedReward] = useState<string | null>(null);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [timeUntilNextDay, setTimeUntilNextDay] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Set to start of tomorrow in UTC
      const nextUtcDay = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));
      const diffMs = nextUtcDay.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeUntilNextDay('00:00:00');
        return;
      }
      const hrs = Math.floor(diffMs / (3600 * 1000));
      const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((diffMs % (60 * 1000)) / 1000);
      setTimeUntilNextDay(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const getRetentionItems = () => {
    const items: Array<{
      id: string;
      category: 'near_achievement' | 'near_rank' | 'near_season' | 'pending_streak' | 'pending_quest';
      titleEn: string;
      titleId: string;
      subtitleEn: string;
      subtitleId: string;
      progressPercent: number;
      badgeEn: string;
      badgeId: string;
      rewardEn: string;
      rewardId: string;
      actionEn: string;
      actionId: string;
      onAction: () => void;
      icon: React.ReactNode;
      highlight: boolean;
    }> = [];

    // 1. Pending Quest Reward
    const pendingQuests = quests.filter(q => q.completed && !q.rewardClaimed);
    if (pendingQuests.length > 0) {
      items.push({
        id: 'pending-quests',
        category: 'pending_quest',
        titleEn: `Pending Quest Reward (${pendingQuests.length})`,
        titleId: `Hadiah Misi Menunggu (${pendingQuests.length})`,
        subtitleEn: `Claim your Special Keys and REP rewards!`,
        subtitleId: `Klaim Kunci Spesial & hadiah REP Anda!`,
        progressPercent: 100,
        badgeEn: 'READY TO CLAIM',
        badgeId: 'SIAP DIKLAIM',
        rewardEn: `+${pendingQuests.length} Special Keys 🔑, +${pendingQuests.length * 25} REP`,
        rewardId: `+${pendingQuests.length} Kunci Spesial 🔑, +${pendingQuests.length * 25} REP`,
        actionEn: 'Claim Quests',
        actionId: 'Klaim Misi',
        onAction: () => {
          sound.playPowerup();
          pendingQuests.forEach(q => {
            if (onClaimQuestReward) onClaimQuestReward(q.id);
          });
          setActiveTab('quests');
        },
        icon: <Zap className="text-emerald-500 animate-bounce" size={16} />,
        highlight: true
      });
    }

    // 1b. Near-Miss Quest (>= 80% progress and uncompleted)
    const nearQuests = quests.filter(q => !q.completed && q.target > 1 && (q.current / q.target) >= 0.8);
    nearQuests.forEach(q => {
      const pct = Math.min(99, Math.round((q.current / q.target) * 100));
      items.push({
        id: `near-quest-${q.id}`,
        category: 'pending_quest',
        titleEn: `Near Quest Unlock: "${q.nameEn}"`,
        titleId: `Hampir Selesai Misi: "${q.nameId}"`,
        subtitleEn: `Progress: ${q.current}/${q.target} (${pct}%)`,
        subtitleId: `Progres: ${q.current}/${q.target} (${pct}%)`,
        progressPercent: pct,
        badgeEn: `${pct}% NEAR QUEST`,
        badgeId: `${pct}% HAMPIR SELESAI`,
        rewardEn: `+1 Special Key 🔑, +25 REP`,
        rewardId: `+1 Kunci Spesial 🔑, +25 REP`,
        actionEn: 'Finish Quest',
        actionId: 'Selesaikan Misi',
        onAction: () => {
          setActiveTab('quests');
        },
        icon: <Zap className="text-amber-400 animate-pulse" size={16} />,
        highlight: true
      });
    });

    // 2. Pending Daily Streak Reward
    if (!hasCheckedInToday) {
      items.push({
        id: 'pending-streak',
        category: 'pending_streak',
        titleEn: isStreakProtected ? `🛡️ Streak Protected (24h Grace Active)` : `Pending Daily Streak Reward`,
        titleId: isStreakProtected ? `🛡️ Streak Dilindungi (Masa Tenggang 24j)` : `Hadiah Streak Harian Menunggu`,
        subtitleEn: isStreakProtected 
          ? `Your ${dailyStreak.count}-day streak is grace protected! Check in today.`
          : `Maintain your day ${dailyStreak.count + 1} builder streak bonus!`,
        subtitleId: isStreakProtected
          ? `Streak ${dailyStreak.count} hari Anda dilindungi! Absen hari ini.`
          : `Pertahankan bonus streak builder hari ke-${dailyStreak.count + 1}!`,
        progressPercent: 100,
        badgeEn: isStreakProtected ? '24H GRACE ACTIVE' : 'CLAIMABLE TODAY',
        badgeId: isStreakProtected ? 'GRACE 24J AKTIF' : 'BISA DIKLAIM HARI INI',
        rewardEn: `+${50 * (dailyStreak.count + 1)} XP, +${10 * (dailyStreak.count + 1)} REP`,
        rewardId: `+${50 * (dailyStreak.count + 1)} XP, +${10 * (dailyStreak.count + 1)} REP`,
        actionEn: isStreakProtected ? 'Protect Streak' : 'Claim Streak',
        actionId: isStreakProtected ? 'Lindungi Streak' : 'Klaim Streak',
        onAction: () => {
          sound.playWin();
          claimDailyStreak();
          setShowStreakCelebration(true);
        },
        icon: isStreakProtected 
          ? <Shield className="text-emerald-500 animate-bounce" size={16} />
          : <Flame className="text-amber-500 animate-pulse" size={16} />,
        highlight: true
      });
    }

    // 3. Near Unlock Achievement (>= 80%)
    const allAchievements = achievementService.getAchievements();
    const nearAchievements = allAchievements
      .filter(a => !a.unlocked && a.target > 0 && (a.progress / a.target) >= 0.8)
      .sort((a, b) => (b.progress / b.target) - (a.progress / a.target));

    nearAchievements.forEach(ach => {
      const pct = Math.min(99, Math.round((ach.progress / ach.target) * 100));
      items.push({
        id: `near-ach-${ach.id}`,
        category: 'near_achievement',
        titleEn: `Near Unlock: "${ach.title}"`,
        titleId: `Hampir Terbuka: "${ach.title}"`,
        subtitleEn: ach.description,
        subtitleId: ach.description,
        progressPercent: pct,
        badgeEn: `${pct}% NEAR UNLOCK`,
        badgeId: `${pct}% HAMPIR TERBUKA`,
        rewardEn: `+${ach.rewardXp} XP, +${ach.rewardReputation} REP`,
        rewardId: `+${ach.rewardXp} XP, +${ach.rewardReputation} REP`,
        actionEn: 'View Goal',
        actionId: 'Lihat Target',
        onAction: () => {
          setActiveTab('profile');
          setShowActiveProgression(true);
        },
        icon: <Trophy className="text-amber-400 animate-pulse" size={16} />,
        highlight: true
      });
    });

    // 4. Near Unlock Rank (>= 80%)
    const nextRank = getNextRank();
    if (nextRank) {
      const rankProg = getReputationProgress();
      if (rankProg && rankProg.percent >= 80 && rankProg.percent < 100) {
        const targetRep = nextRank === 'Validator' ? 1000 : nextRank === 'Architect' ? 5000 : 10000;
        const needed = targetRep - reputation;

        items.push({
          id: `near-rank-${nextRank}`,
          category: 'near_rank',
          titleEn: `Near Rank Unlock: ${nextRank}`,
          titleId: `Hampir Naik Peringkat: ${nextRank}`,
          subtitleEn: `Only ${needed.toLocaleString()} REP needed to reach ${nextRank}!`,
          subtitleId: `Hanya butuh ${needed.toLocaleString()} REP lagi untuk mencapai ${nextRank}!`,
          progressPercent: rankProg.percent,
          badgeEn: `${rankProg.percent}% RANK PROGRESS`,
          badgeId: `${rankProg.percent}% PROGRES PERINGKAT`,
          rewardEn: `${nextRank} Honor Badge & Title`,
          rewardId: `Lencana Kehormatan & Gelar ${nextRank}`,
          actionEn: 'Boost REP',
          actionId: 'Kejar REP',
          onAction: () => {
            setActiveTab('quests');
          },
          icon: <Award className="text-purple-400 animate-pulse" size={16} />,
          highlight: true
        });
      }
    }

    // 5. Near Unlock Season Reward (>= 80%)
    const currentSeason = seasonService.getCurrentSeason();
    const seasonPlayerStats = seasonService.getSeasonPlayerStats(currentSeason.seasonId);
    const seasonTiers = [
      {
        nameEn: 'Rare Tier (Amplifier)',
        nameId: 'Tingkat Langka (Amplifier)',
        target: 3,
        current: seasonPlayerStats.seasonMazeCompletions,
        rewardEn: '+300 XP, +75 REP, Ecosystem Amplifier',
        rewardId: '+300 XP, +75 REP, Ecosystem Amplifier'
      },
      {
        nameEn: 'Epic Tier (Neon Cyberpunk Skin)',
        nameId: 'Tingkat Epik (Neon Cyberpunk Skin)',
        target: 5,
        current: seasonPlayerStats.seasonAchievements.length,
        rewardEn: '+600 XP, +150 REP, Neon Cyberpunk Skin',
        rewardId: '+600 XP, +150 REP, Neon Cyberpunk Skin'
      },
      {
        nameEn: 'Legendary Tier (Sovereign Seal)',
        nameId: 'Tingkat Legendaris (Sovereign Seal)',
        target: 1000,
        current: seasonPlayerStats.seasonReputation,
        rewardEn: '+1200 XP, +300 REP, Sovereign Seal',
        rewardId: '+1200 XP, +300 REP, Sovereign Seal'
      }
    ];

    seasonTiers.forEach(tier => {
      const pct = Math.min(99, Math.round((tier.current / tier.target) * 100));
      if (pct >= 80 && pct < 100) {
        items.push({
          id: `near-season-${tier.nameEn}`,
          category: 'near_season',
          titleEn: `Near Season Unlock: ${tier.nameEn}`,
          titleId: `Hampir Buka Musim: ${tier.nameId}`,
          subtitleEn: `Progress: ${tier.current}/${tier.target} (${pct}%)`,
          subtitleId: `Progres: ${tier.current}/${tier.target} (${pct}%)`,
          progressPercent: pct,
          badgeEn: `${pct}% SEASON PROGRESS`,
          badgeId: `${pct}% PROGRES MUSIM`,
          rewardEn: tier.rewardEn,
          rewardId: tier.rewardId,
          actionEn: 'Push Season',
          actionId: 'Kejar Musim',
          onAction: () => {
            setActiveTab('quests');
          },
          icon: <Target className="text-blue-400 animate-pulse" size={16} />,
          highlight: true
        });
      }
    });

    return items;
  };

  const getNextAction = () => {
    // Priority 1: Pending Daily Streak
    if (!hasCheckedInToday) {
      return {
        type: 'streak' as const,
        id: 'pending-streak',
        titleEn: `Claim Daily Streak Reward (Day ${dailyStreak.count + 1})`,
        titleId: `Klaim Hadiah Streak Harian (Hari ke-${dailyStreak.count + 1})`,
        detailEn: `Your daily check-in is ready to maintain your builder streak.`,
        detailId: `Absensi harian Anda siap untuk mempertahankan streak builder.`,
        progressText: '100% - Ready to Claim',
        progressPercent: 100,
        rewardEn: `+${50 * (dailyStreak.count + 1)} XP, +${10 * (dailyStreak.count + 1)} REP`,
        rewardId: `+${50 * (dailyStreak.count + 1)} XP, +${10 * (dailyStreak.count + 1)} REP`,
        hintEn: 'Click to claim your daily streak reward and keep your multiplier active!',
        hintId: 'Klik untuk mengambil hadiah streak harian dan menjaga pengali tetap aktif!',
        icon: <Flame className="text-amber-500 animate-bounce" size={20} />
      };
    }

    // Priority 2: Unclaimed quest rewards
    const unclaimedQuest = quests.find(q => q.completed && !q.rewardClaimed);
    if (unclaimedQuest) {
      return {
        type: 'quest' as const,
        id: unclaimedQuest.id,
        titleEn: `Claim Quest Reward`,
        titleId: `Klaim Hadiah Misi`,
        detailEn: unclaimedQuest.nameEn,
        detailId: unclaimedQuest.nameId,
        progressText: '100% - Ready to Claim',
        progressPercent: 100,
        rewardEn: '+1 Special Key 🔑, +25 REP',
        rewardId: '+1 Kunci Spesial 🔑, +25 REP',
        hintEn: 'Click the button below to claim your rewards and add them to your passport!',
        hintId: 'Klik tombol di bawah untuk mengambil hadiah Anda dan menambahkannya ke passport!',
        icon: <Zap className="text-emerald-400 animate-bounce" size={20} />
      };
    }

    // Priority 3: Near Unlock Achievement (>= 80%)
    const allAchievements = achievementService.getAchievements();
    const nearAchievements = allAchievements
      .filter(a => !a.unlocked && a.target > 0 && (a.progress / a.target) >= 0.8)
      .sort((a, b) => (b.progress / b.target) - (a.progress / a.target));

    if (nearAchievements.length > 0) {
      const ach = nearAchievements[0];
      const pct = Math.round((ach.progress / ach.target) * 100);
      return {
        type: 'achievement' as const,
        id: ach.id,
        titleEn: `⚡ Almost Unlocked: "${ach.title}"`,
        titleId: `⚡ Hampir Terbuka: "${ach.title}"`,
        detailEn: ach.description,
        detailId: ach.description,
        progressText: `${ach.progress.toLocaleString()} / ${ach.target.toLocaleString()} (${pct}% completed)`,
        progressPercent: pct,
        rewardEn: `+${ach.rewardXp} XP, +${ach.rewardReputation} REP`,
        rewardId: `+${ach.rewardXp} XP, +${ach.rewardReputation} REP`,
        hintEn: 'You are at 80%+ progress! Complete one more run to unlock this achievement.',
        hintId: 'Progres Anda sudah 80%+! Selesaikan satu run lagi untuk membuka pencapaian ini.',
        icon: <Trophy className="text-amber-400 animate-pulse" size={20} />
      };
    }

    // Priority 4: Near Unlock Rank (>= 80%)
    const nextRank = getNextRank();
    if (nextRank) {
      const rankProg = getReputationProgress();
      if (rankProg && rankProg.percent >= 80 && rankProg.percent < 100) {
        const targetRep = nextRank === 'Validator' ? 1000 : nextRank === 'Architect' ? 5000 : 10000;
        const needed = targetRep - reputation;
        return {
          type: 'rank' as const,
          id: nextRank,
          titleEn: `⚡ Almost Unlocked Rank: ${nextRank}`,
          titleId: `⚡ Hampir Naik Peringkat: ${nextRank}`,
          detailEn: `Accumulate Reputation points to evolve your Builder Profile.`,
          detailId: `Kumpulkan poin Reputasi untuk mengevolusikan Profil Builder Anda.`,
          progressText: `${reputation.toLocaleString()} / ${targetRep.toLocaleString()} REP (${rankProg.percent}%)`,
          progressPercent: rankProg.percent,
          rewardEn: 'Ecosystem Honor Badge & Title on Passport',
          rewardId: 'Lencana Kehormatan Ekosistem & Gelar di Passport',
          hintEn: `Earn ${needed.toLocaleString()} more REP to reach ${nextRank}!`,
          hintId: `Dapatkan ${needed.toLocaleString()} REP lagi untuk mencapai ${nextRank}!`,
          icon: <Shield className="text-[#0052FF] animate-pulse" size={20} />
        };
      }
    }

    // Priority 5: Near Unlock Season Reward (>= 80%)
    const currentSeason = seasonService.getCurrentSeason();
    const seasonPlayerStats = seasonService.getSeasonPlayerStats(currentSeason.seasonId);
    const seasonTiers = [
      {
        nameEn: 'Rare Tier (Ecosystem Amplifier)',
        nameId: 'Tingkat Langka (Ecosystem Amplifier)',
        target: 3,
        current: seasonPlayerStats.seasonMazeCompletions,
        criteriaEn: 'Complete 3 mazes',
        criteriaId: 'Selesaikan 3 labirin',
        rewardEn: '+300 XP, +75 REP, Ecosystem Amplifier',
        rewardId: '+300 XP, +75 REP, Ecosystem Amplifier',
      },
      {
        nameEn: 'Epic Tier (Neon Cyberpunk Skin)',
        nameId: 'Tingkat Epik (Neon Cyberpunk Skin)',
        target: 5,
        current: seasonPlayerStats.seasonAchievements.length,
        criteriaEn: 'Unlock 5 achievements',
        criteriaId: 'Buka 5 pencapaian',
        rewardEn: '+600 XP, +150 REP, Neon Cyberpunk Skin',
        rewardId: '+600 XP, +150 REP, Neon Cyberpunk Skin',
      },
      {
        nameEn: 'Legendary Tier (Ecosystem Sovereign Seal)',
        nameId: 'Tingkat Legendaris (Sovereign Seal)',
        target: 1000,
        current: seasonPlayerStats.seasonReputation,
        criteriaEn: 'Reach 1,000 seasonal reputation',
        criteriaId: 'Capai 1.000 reputasi musiman',
        rewardEn: '+1200 XP, +300 REP, Sovereign Seal',
        rewardId: '+1200 XP, +300 REP, Sovereign Seal',
      }
    ];

    const nearSeasonTier = seasonTiers.find(t => {
      const pct = (t.current / t.target) * 100;
      return pct >= 80 && pct < 100;
    });

    if (nearSeasonTier) {
      const pct = Math.round((nearSeasonTier.current / nearSeasonTier.target) * 100);
      return {
        type: 'season' as const,
        id: nearSeasonTier.nameEn,
        titleEn: `⚡ Almost Unlocked Season: ${nearSeasonTier.nameEn}`,
        titleId: `⚡ Hampir Buka Hadiah Musim: ${nearSeasonTier.nameId}`,
        detailEn: `Requirement: ${nearSeasonTier.criteriaEn}`,
        detailId: `Syarat: ${nearSeasonTier.criteriaId}`,
        progressText: `${nearSeasonTier.current} / ${nearSeasonTier.target} (${pct}%)`,
        progressPercent: pct,
        rewardEn: nearSeasonTier.rewardEn,
        rewardId: nearSeasonTier.rewardId,
        hintEn: 'You are 80%+ towards unlocking this seasonal tier!',
        hintId: 'Progres Anda sudah 80%+ menuju membuka tingkat musiman ini!',
        icon: <Target className="text-purple-400 animate-pulse" size={20} />
      };
    }

    // Default closest achievement fallback
    const lockedAchievements = allAchievements.filter(a => !a.unlocked);
    if (lockedAchievements.length > 0) {
      const sorted = [...lockedAchievements].sort((a, b) => (b.progress / b.target) - (a.progress / a.target));
      const closest = sorted[0];
      const pct = Math.round((closest.progress / closest.target) * 100);

      return {
        type: 'achievement' as const,
        id: closest.id,
        titleEn: `Unlock Achievement: "${closest.title}"`,
        titleId: `Buka Pencapaian: "${closest.title}"`,
        detailEn: closest.description,
        detailId: closest.description,
        progressText: `${closest.progress.toLocaleString()} / ${closest.target.toLocaleString()} (${pct}% completed)`,
        progressPercent: pct,
        rewardEn: `+${closest.rewardXp} XP, +${closest.rewardReputation} REP`,
        rewardId: `+${closest.rewardXp} XP, +${closest.rewardReputation} REP`,
        hintEn: closest.category === 'Speed' ? 'Complete any level at absolute speed.' : 'Focus on this objective to unlock progression boosts.',
        hintId: closest.category === 'Speed' ? 'Selesaikan level dengan kecepatan tinggi.' : 'Fokus pada target ini untuk membuka peningkatan perkembangan.',
        icon: <Trophy className="text-amber-400" size={20} />
      };
    }

    // Default closest rank fallback
    if (nextRank) {
      const progress = getReputationProgress();
      const targetRep = nextRank === 'Validator' ? 1000 : nextRank === 'Architect' ? 5000 : 10000;
      const needed = targetRep - reputation;

      return {
        type: 'rank' as const,
        id: nextRank,
        titleEn: `Advance to Rank: ${nextRank}`,
        titleId: `Naik ke Peringkat: ${nextRank}`,
        detailEn: `Accumulate Reputation points to evolve your Builder Profile.`,
        detailId: `Kumpulkan poin Reputasi untuk mengevolusikan Profil Builder Anda.`,
        progressText: `${reputation.toLocaleString()} / ${targetRep.toLocaleString()} REP (${progress.percent}%)`,
        progressPercent: progress.percent,
        rewardEn: 'Ecosystem Honor Badge & Title on Passport',
        rewardId: 'Lencana Kehormatan Ekosistem & Gelar di Passport',
        hintEn: `Earn ${needed.toLocaleString()} more REP to reach ${nextRank}!`,
        hintId: `Dapatkan ${needed.toLocaleString()} REP lagi untuk mencapai ${nextRank}!`,
        icon: <Shield className="text-[#0052FF]" size={20} />
      };
    }

    return {
      type: 'completed' as const,
      id: 'completed-all',
      titleEn: 'All Objectives Fulfilled!',
      titleId: 'Semua Target Tercapai!',
      detailEn: 'You are an absolute Nexus Overlord on the network.',
      detailId: 'Anda adalah Nexus Overlord sejati di dalam jaringan.',
      progressText: '100% Complete',
      progressPercent: 100,
      rewardEn: 'Supreme Builder Prestige 🎉',
      rewardId: 'Prestise Builder Tertinggi 🎉',
      hintEn: 'Keep mastering paths and optimizing blocks for maximum network efficiency!',
      hintId: 'Terus kuasai rute dan optimalkan blok untuk efisiensi jaringan maksimum!',
      icon: <Sparkles className="text-yellow-400" size={20} />
    };
  };

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

        {/* LIVE EVENT BANNER NOTIFICATION */}
        {(() => {
          const activeEvents = eventService.getActiveEvents();
          if (activeEvents.length === 0) return null;
          const multipliers = eventService.getCombinedMultipliers();

          return (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400 truncate">
                  ⚡ {lang === 'id' ? 'EVENT AKTIF:' : 'LIVE EVENT:'} {activeEvents.map(e => lang === 'id' ? e.titleId : e.title).join(' • ')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {multipliers.repMultiplier > 1 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                    {multipliers.repMultiplier}x REP
                  </span>
                )}
                {multipliers.xpMultiplier > 1 && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">
                    {multipliers.xpMultiplier}x XP
                  </span>
                )}
                {multipliers.questMultiplier > 1 && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-300 font-extrabold text-[10px]">
                    {multipliers.questMultiplier}x Quest
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* RETENTION & REWARD RADAR BANNER */}
        {(() => {
          const items = getRetentionItems();
          if (items.length === 0) return null;

          return (
            <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-purple-500/10 border-b border-amber-500/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Target size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
                  </span>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-deep-navy">
                    🎯 {lang === 'id' ? 'RADAR RETENSI & HADIAH' : 'RETENTION & UNLOCK RADAR'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[9px] font-black border border-amber-500/30">
                    {items.length} {lang === 'id' ? 'HAMPIR BUKA / HADIAH' : 'ACTIVE HIGHLIGHTS'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-deep-navy/50 font-bold hidden sm:inline">
                  {lang === 'id' ? 'Syarat 80%+ Progres & Hadiah Menunggu' : '80%+ Progress & Pending Rewards'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white/90 border border-amber-500/30 shadow-sm hover:border-amber-500/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {item.icon}
                          <span className="font-serif text-xs font-bold text-deep-navy truncate">
                            {lang === 'id' ? item.titleId : item.titleEn}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-mono text-[8px] font-extrabold uppercase shrink-0">
                          {lang === 'id' ? item.badgeId : item.badgeEn}
                        </span>
                      </div>

                      <p className="text-[10px] text-deep-navy/70 line-clamp-1 mb-1.5">
                        {lang === 'id' ? item.subtitleId : item.subtitleEn}
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-deep-navy/10 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-deep-navy/5 mt-1">
                      <span className="font-mono text-[9px] text-amber-800 dark:text-amber-400 font-bold truncate">
                        🎁 {lang === 'id' ? item.rewardId : item.rewardEn}
                      </span>
                      <button
                        onClick={() => {
                          sound.playMove();
                          item.onAction();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-deep-navy text-white hover:bg-deep-navy/90 font-mono text-[9px] font-bold shrink-0 transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
                      >
                        <span>{lang === 'id' ? item.actionId : item.actionEn}</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* TABS SELECTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 px-4 pt-4 pb-2 border-b border-deep-navy/5">
          <button
            onClick={() => { sound.playMove(); setActiveTab('quests'); }}
            className={`py-3 sm:py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
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
            onClick={() => { sound.playMove(); setActiveTab('events'); }}
            className={`py-3 sm:py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeTab === 'events'
                ? 'bg-deep-navy text-white shadow-sm'
                : 'text-deep-navy/60 hover:text-deep-navy hover:bg-deep-navy/5'
            }`}
          >
            <Flame size={13} className={eventService.getActiveEvents().length > 0 ? 'text-amber-400 animate-pulse' : ''} />
            <span>Events</span>
            {eventService.getActiveEvents().length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-mono text-[9px] flex items-center justify-center font-bold animate-bounce">
                {eventService.getActiveEvents().length}
              </span>
            )}
          </button>

          <button
            onClick={() => { sound.playMove(); setActiveTab('faucet'); }}
            className={`py-3 sm:py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
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
            className={`py-3 sm:py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
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
                      ? 'Selesaikan tugas harian untuk mengklaim Kunci Spesial gratis.' 
                      : 'Fulfill daily developer objectives to claim free Special Keys.'}
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
                              {lang === 'id' ? 'HADIAH: +1 KUNCI SPESIAL 🔑' : 'REWARD: +1 SPECIAL KEY 🔑'}
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

                      {quest.completed && !quest.rewardClaimed && (
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-deep-navy/5">
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 font-mono">
                            <Zap size={12} className="animate-pulse" />
                            {lang === 'id' ? 'SIAP DIKLAIM!' : 'READY TO CLAIM!'}
                          </span>
                          <button
                            onClick={() => {
                              if (onClaimQuestReward) {
                                onClaimQuestReward(quest.id);
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5 min-h-[38px]"
                          >
                            <Zap size={11} className="animate-pulse" />
                            {lang === 'id' ? 'KLAIM HADIAH' : 'CLAIM REWARD'}
                          </button>
                        </div>
                      )}
                      {quest.completed && quest.rewardClaimed && (
                        <div className="flex items-center gap-1 mt-2 font-mono text-[9px] text-emerald-600 font-bold justify-end">
                          <CheckCircle2 size={10} />
                          <span>{lang === 'id' ? 'HADIAH DIKLAIM & DIKREDITKAN' : 'REWARD CLAIMED & CREDITED'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* EVENTS PANEL */}
            {activeTab === 'events' && (() => {
              const allEvents = eventService.getAllEvents();
              const activeEvents = eventService.getActiveEvents();
              const multipliers = eventService.getCombinedMultipliers();

              return (
                <motion.div
                  key="events-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 mb-2">
                      <Flame size={24} className="animate-pulse" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-deep-navy">
                      {lang === 'id' ? 'Acara & Pengali Ekosistem' : 'Ecosystem Events & Multipliers'}
                    </h4>
                    <p className="text-[11px] text-deep-navy/60 leading-relaxed max-w-sm mx-auto">
                      {lang === 'id'
                        ? 'Acara aktif memberikan bonus pengganda untuk XP, Reputasi, dan Hadiah Misi secara real-time.'
                        : 'Active network events grant real-time multiplier boosts for XP, Reputation, and Quest rewards.'}
                    </p>
                  </div>

                  {/* ACTIVE MULTIPLIERS OVERVIEW */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block mb-1">
                        {lang === 'id' ? 'PENGALI REP' : 'REP MULTIPLIER'}
                      </span>
                      <div className="font-mono text-xl font-black text-amber-600 flex items-center justify-center gap-1">
                        <Shield size={16} />
                        <span>{multipliers.repMultiplier.toFixed(1)}x</span>
                      </div>
                      <span className="text-[8px] font-mono text-amber-700/60 block mt-0.5">
                        {multipliers.repMultiplier > 1 ? (lang === 'id' ? 'Aktif dari Event' : 'Boost Active') : (lang === 'id' ? 'Standar' : 'Standard')}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-blue-800 dark:text-blue-400 font-bold block mb-1">
                        {lang === 'id' ? 'PENGALI XP' : 'XP MULTIPLIER'}
                      </span>
                      <div className="font-mono text-xl font-black text-blue-600 flex items-center justify-center gap-1">
                        <Zap size={16} />
                        <span>{multipliers.xpMultiplier.toFixed(1)}x</span>
                      </div>
                      <span className="text-[8px] font-mono text-blue-700/60 block mt-0.5">
                        {multipliers.xpMultiplier > 1 ? (lang === 'id' ? 'Aktif dari Event' : 'Boost Active') : (lang === 'id' ? 'Standar' : 'Standard')}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-purple-800 dark:text-purple-400 font-bold block mb-1">
                        {lang === 'id' ? 'MISI BOOST' : 'QUEST BOOST'}
                      </span>
                      <div className="font-mono text-xl font-black text-purple-600 flex items-center justify-center gap-1">
                        <Gift size={16} />
                        <span>{multipliers.questMultiplier.toFixed(1)}x</span>
                      </div>
                      <span className="text-[8px] font-mono text-purple-700/60 block mt-0.5">
                        {multipliers.questMultiplier > 1 ? (lang === 'id' ? 'Aktif dari Event' : 'Boost Active') : (lang === 'id' ? 'Standar' : 'Standard')}
                      </span>
                    </div>
                  </div>

                  {/* FEATURED EVENTS LIST */}
                  <div className="space-y-3">
                    <h5 className="font-mono text-[10px] text-deep-navy/50 uppercase tracking-widest font-bold px-1">
                      {lang === 'id' ? 'DAFTAR ACARA SPESIAL' : 'FEATURED NETWORK EVENTS'}
                    </h5>

                    {allEvents.map((event) => {
                      const isActive = event.isActive;
                      const timeRemaining = eventService.getFormattedTimeRemaining(event);

                      return (
                        <div
                          key={event.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-500/5 via-white to-orange-500/5 border-amber-500/30 shadow-md shadow-amber-500/5'
                              : 'bg-white/60 border-deep-navy/10 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2.5 rounded-xl text-xl font-bold ${
                                  isActive ? 'bg-amber-500/15 text-amber-600' : 'bg-deep-navy/5 text-deep-navy/40'
                                }`}
                              >
                                {event.badgeEmoji}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-serif font-bold text-sm text-deep-navy">
                                    {lang === 'id' ? event.titleId : event.title}
                                  </h5>
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                                      isActive
                                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                        : 'bg-deep-navy/10 text-deep-navy/50'
                                    }`}
                                  >
                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                                    {isActive ? (lang === 'id' ? 'BERLANGSUNG' : 'LIVE NOW') : (lang === 'id' ? 'NONAKTIF' : 'INACTIVE')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-deep-navy/70 leading-relaxed mt-1">
                                  {lang === 'id' ? event.descriptionId : event.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* EVENT REWARD MULTIPLIERS BREAKDOWN */}
                          <div className="mt-3.5 pt-3 border-t border-deep-navy/5 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              {event.repMultiplier > 1 && (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 font-bold border border-amber-500/20">
                                  🛡️ {event.repMultiplier}x REP
                                </span>
                              )}
                              {event.xpMultiplier > 1 && (
                                <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-700 font-bold border border-blue-500/20">
                                  ⚡ {event.xpMultiplier}x XP
                                </span>
                              )}
                              {event.questMultiplier > 1 && (
                                <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-700 font-bold border border-purple-500/20">
                                  🎁 {event.questMultiplier}x QUEST
                                </span>
                              )}
                              <span className="text-deep-navy/50 flex items-center gap-1 ml-1">
                                <Clock size={11} />
                                {timeRemaining}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                sound.playMove();
                                eventService.toggleEventActive(event.id, !isActive);
                                setEventsTick(t => t + 1);
                              }}
                              className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                                isActive
                                  ? 'bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 border border-amber-500/30'
                                  : 'bg-deep-navy/10 text-deep-navy/70 hover:bg-deep-navy/20'
                              }`}
                            >
                              <span>{isActive ? (lang === 'id' ? 'NONAKTIFKAN' : 'DEACTIVATE') : (lang === 'id' ? 'AKTIFKAN' : 'ACTIVATE EVENT')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* EVENT BONUS PREVIEW SIMULATION */}
                  <div className="p-4 rounded-2xl bg-deep-navy/5 border border-deep-navy/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-cerulean-sky" />
                      <h6 className="font-mono text-xs font-bold text-deep-navy uppercase">
                        {lang === 'id' ? 'Simulasi Bonus Acara Real-Time' : 'Real-Time Event Bonus Simulation'}
                      </h6>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 rounded-xl bg-white border border-deep-navy/10">
                        <span className="text-deep-navy/50 block">{lang === 'id' ? 'Base Maze Finish:' : 'Base Maze Finish:'}</span>
                        <div className="text-deep-navy font-bold mt-0.5">100 XP • +10 REP</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-amber-800 dark:text-amber-400 font-bold block">
                          {lang === 'id' ? 'Hasil Dengan Event Multiplier:' : 'Boosted Event Yield:'}
                        </span>
                        <div className="text-amber-700 dark:text-amber-300 font-black mt-0.5">
                          {Math.round(100 * multipliers.xpMultiplier)} XP • +{Math.round(10 * multipliers.repMultiplier)} REP
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

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
                  {/* TIER 1: CORE HUD (Always Visible) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0052FF]/10 border border-[#0052FF]/30">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold text-[#0052FF] bg-[#0052FF]/20 px-2 py-0.5 rounded border border-[#0052FF]/30 uppercase tracking-wider">
                        TIER 1 • ALWAYS VISIBLE
                      </span>
                      <span className="text-xs font-sans text-slate-300 font-medium">
                        {lang === 'id' ? 'Status Utama & Kontrol Game' : 'Core Identity & Instant Play'}
                      </span>
                    </div>

                    <button
                      id="tier1-play-now-main-btn"
                      onClick={() => {
                        sound.playPowerup();
                        if (onQuickPlay) {
                          onQuickPlay();
                        } else {
                          const boardEl = document.getElementById('maze-board-container');
                          if (boardEl) {
                            boardEl.scrollIntoView({ behavior: 'smooth' });
                          }
                          const nameInput = document.getElementById('builder-name-input');
                          if (nameInput) {
                            nameInput.focus();
                          }
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#0052FF] hover:from-amber-600 hover:to-blue-700 text-white font-sans font-extrabold text-xs tracking-wide shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-white/20 select-none"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                      <span>{lang === 'id' ? '⚡ MAIN CEPAT (QUICK PLAY)' : '⚡ QUICK PLAY NOW'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  {/* UPCOMING REWARDS SPOTLIGHT (Goal: Player understands rewards within 2 seconds) */}
                  {(() => {
                    // 1. Next Reward
                    const nextLevel = builderLevel + 1;
                    const nextRewardTitle = builderLevel >= 10 
                      ? (lang === 'id' ? 'Hadiah Lvl Max' : 'Max Level Reward') 
                      : `Level ${nextLevel} ${lang === 'id' ? 'Membuka' : 'Unlock'}`;
                    const nextRewardValue = builderLevel >= 10 
                      ? '+500 REP & Special Badge' 
                      : `+100 EXP & +1 Token`;
                    const nextRewardProgress = percentToNextLevel;
                    const nextRewardProgressText = `${xpIntoLevel}/1000 XP`;

                    // 2. Next Achievement
                    const allAchList = achievementService.getAchievements();
                    const lockedAchs = allAchList.filter(a => !a.unlocked);
                    const nextAch = lockedAchs.sort((a, b) => {
                      const pA = a.target ? (a.progress / a.target) : 0;
                      const pB = b.target ? (b.progress / b.target) : 0;
                      return pB - pA;
                    })[0] || allAchList[0];

                    const nextAchTitle = nextAch 
                      ? nextAch.title 
                      : 'Master Builder';
                    const nextAchValue = nextAch 
                      ? `+${nextAch.rewardReputation || 50} REP & +${nextAch.rewardXp || 100} XP` 
                      : 'All Unlocked!';
                    const nextAchProgress = nextAch && nextAch.target ? Math.min(100, Math.round((nextAch.progress / nextAch.target) * 100)) : 100;
                    const nextAchProgressText = nextAch && nextAch.target ? `${nextAch.progress}/${nextAch.target}` : '100%';

                    // 3. Next Rank
                    const currentRank = getBuilderRank(reputation);
                    const nextRank = getNextRank(reputation);
                    const rankProgress = getReputationProgress(reputation);
                    const nextRankTitle = nextRank ? `${lang === 'id' ? 'Peringkat' : 'Rank'}: ${nextRank}` : 'Master Builder (MAX)';
                    const nextRankValue = nextRank 
                      ? `${rankProgress.nextRankRequiredRep - rankProgress.currentRankRep} REP ${lang === 'id' ? 'Lagi' : 'Remaining'}` 
                      : 'Top Rank Achieved!';
                    const nextRankProgress = rankProgress.percent;

                    // 4. Next Season Reward
                    const currentSeason = seasonService.getCurrentSeason();
                    const seasonStats = seasonService.getSeasonPlayerStats(currentSeason.seasonId);
                    const seasonPool = SEASON_REWARDS_POOL[currentSeason.seasonId] || [];
                    const earnedSeasonRewards = seasonService.calculateSeasonRewards(currentSeason.seasonId, seasonStats);
                    const earnedSet = new Set(earnedSeasonRewards.map(r => r.rewardId));
                    const nextSeasonReward = seasonPool.find(r => !earnedSet.has(r.rewardId)) || seasonPool[seasonPool.length - 1];

                    let nextSeasonProgress = 0;
                    let nextSeasonProgressText = '';
                    if (nextSeasonReward) {
                      if (nextSeasonReward.tier === 'Rare') {
                        nextSeasonProgress = Math.min(100, Math.round((seasonStats.seasonMazeCompletions / 3) * 100));
                        nextSeasonProgressText = `${seasonStats.seasonMazeCompletions}/3 ${lang === 'id' ? 'Labirin' : 'Mazes'}`;
                      } else if (nextSeasonReward.tier === 'Epic') {
                        nextSeasonProgress = Math.min(100, Math.round((seasonStats.seasonAchievements.length / 5) * 100));
                        nextSeasonProgressText = `${seasonStats.seasonAchievements.length}/5 ${lang === 'id' ? 'Pencapaian' : 'Achievements'}`;
                      } else if (nextSeasonReward.tier === 'Legendary') {
                        nextSeasonProgress = Math.min(100, Math.round((seasonStats.seasonReputation / 1000) * 100));
                        nextSeasonProgressText = `${seasonStats.seasonReputation}/1000 REP`;
                      } else {
                        nextSeasonProgress = 100;
                        nextSeasonProgressText = lang === 'id' ? 'Terbuka' : 'Unlocked';
                      }
                    }

                    const nextSeasonTitle = nextSeasonReward ? `${nextSeasonReward.tier}: ${nextSeasonReward.name}` : 'Season 1 Badge';
                    const nextSeasonValue = nextSeasonReward ? `+${nextSeasonReward.reputationBonus} REP ${nextSeasonReward.customSkinId ? '& Skin' : ''}` : 'All Claimed';

                    return (
                      <div id="upcoming-rewards-spotlight" className="relative rounded-2xl bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#172554] border-2 border-amber-400/40 text-white p-3.5 shadow-2xl font-sans space-y-3">
                        {/* Header Banner */}
                        <div className="flex items-center justify-between pb-2 border-b border-amber-400/20">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30 animate-pulse">
                              <Gift className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-xs font-black font-mono tracking-tight text-amber-300 uppercase leading-none">
                                  {lang === 'id' ? 'TARGET HADIAH BERIKUTNYA' : 'UPCOMING REWARDS SPOTLIGHT'}
                                </h3>
                                <span className="text-[8px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded">
                                  2-SEC VIEW
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-300 font-mono leading-none mt-1">
                                {lang === 'id' ? 'Buka Hadiah Terdekat Anda Dengan Bermain' : 'Your Nearest Reward Unlocks at a Glance'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
                            {lang === 'id' ? 'HADIAH AKTIF' : 'REWARDS LIVE'}
                          </span>
                        </div>

                        {/* 4 Pillars Grid (Scannable in < 2 seconds) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {/* 1. NEXT REWARD */}
                          <div className="p-2.5 rounded-xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-400/30 flex flex-col justify-between hover:border-amber-400/60 transition-all">
                            <div>
                              <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-amber-300">
                                <span className="flex items-center gap-1">
                                  <Gift size={12} className="text-amber-400" />
                                  1. {lang === 'id' ? 'HADIAH NEXT' : 'NEXT REWARD'}
                                </span>
                                <span className="text-amber-200 bg-amber-400/20 px-1 py-0.2 rounded text-[8px] font-extrabold">{nextRewardProgress}%</span>
                              </div>
                              <div className="mt-1.5">
                                <div className="text-xs font-bold font-sans text-white truncate">{nextRewardTitle}</div>
                                <div className="text-[10px] font-mono text-amber-200 font-semibold mt-0.5 truncate">{nextRewardValue}</div>
                              </div>
                            </div>
                            <div className="mt-2 pt-1 border-t border-amber-400/10">
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-amber-400/20">
                                <div className="bg-gradient-to-r from-amber-500 to-yellow-300 h-1.5 rounded-full transition-all duration-500" style={{ width: `${nextRewardProgress}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-1">
                                <span>{lang === 'id' ? 'Progres XP' : 'XP Progress'}</span>
                                <span className="text-amber-300 font-bold">{nextRewardProgressText}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. NEXT ACHIEVEMENT */}
                          <div className="p-2.5 rounded-xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border border-emerald-400/30 flex flex-col justify-between hover:border-emerald-400/60 transition-all">
                            <div>
                              <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-emerald-300">
                                <span className="flex items-center gap-1">
                                  <Trophy size={12} className="text-emerald-400" />
                                  2. {lang === 'id' ? 'PENCAPAIAN' : 'NEXT ACHIEVEMENT'}
                                </span>
                                <span className="text-emerald-200 bg-emerald-400/20 px-1 py-0.2 rounded text-[8px] font-extrabold">{nextAchProgress}%</span>
                              </div>
                              <div className="mt-1.5">
                                <div className="text-xs font-bold font-sans text-white truncate">{nextAchTitle}</div>
                                <div className="text-[10px] font-mono text-emerald-200 font-semibold mt-0.5 truncate">{nextAchValue}</div>
                              </div>
                            </div>
                            <div className="mt-2 pt-1 border-t border-emerald-400/10">
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-emerald-400/20">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-300 h-1.5 rounded-full transition-all duration-500" style={{ width: `${nextAchProgress}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-1">
                                <span>{lang === 'id' ? 'Target' : 'Target Goal'}</span>
                                <span className="text-emerald-300 font-bold">{nextAchProgressText}</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. NEXT RANK */}
                          <div className="p-2.5 rounded-xl bg-gradient-to-b from-purple-500/10 to-purple-500/5 border border-purple-400/30 flex flex-col justify-between hover:border-purple-400/60 transition-all">
                            <div>
                              <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-purple-300">
                                <span className="flex items-center gap-1">
                                  <Award size={12} className="text-purple-400" />
                                  3. {lang === 'id' ? 'PERINGKAT NEXT' : 'NEXT RANK'}
                                </span>
                                <span className="text-purple-200 bg-purple-400/20 px-1 py-0.2 rounded text-[8px] font-extrabold">{nextRankProgress}%</span>
                              </div>
                              <div className="mt-1.5">
                                <div className="text-xs font-bold font-sans text-white truncate">{nextRankTitle}</div>
                                <div className="text-[10px] font-mono text-purple-200 font-semibold mt-0.5 truncate">{nextRankValue}</div>
                              </div>
                            </div>
                            <div className="mt-2 pt-1 border-t border-purple-400/10">
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-purple-400/20">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-300 h-1.5 rounded-full transition-all duration-500" style={{ width: `${nextRankProgress}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-1">
                                <span>{lang === 'id' ? 'Poin Reputasi' : 'Reputation Level'}</span>
                                <span className="text-purple-300 font-bold">{reputation} REP</span>
                              </div>
                            </div>
                          </div>

                          {/* 4. NEXT SEASON REWARD */}
                          <div className="p-2.5 rounded-xl bg-gradient-to-b from-blue-500/10 to-blue-500/5 border border-blue-400/30 flex flex-col justify-between hover:border-blue-400/60 transition-all">
                            <div>
                              <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-blue-300">
                                <span className="flex items-center gap-1">
                                  <Sparkles size={12} className="text-blue-400" />
                                  4. {lang === 'id' ? 'HADIAH MUSIM' : 'NEXT SEASON REWARD'}
                                </span>
                                <span className="text-blue-200 bg-blue-400/20 px-1 py-0.2 rounded text-[8px] font-extrabold">{nextSeasonProgress}%</span>
                              </div>
                              <div className="mt-1.5">
                                <div className="text-xs font-bold font-sans text-white truncate">{nextSeasonTitle}</div>
                                <div className="text-[10px] font-mono text-blue-200 font-semibold mt-0.5 truncate">{nextSeasonValue}</div>
                              </div>
                            </div>
                            <div className="mt-2 pt-1 border-t border-blue-400/10">
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-blue-400/20">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-300 h-1.5 rounded-full transition-all duration-500" style={{ width: `${nextSeasonProgress}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-1">
                                <span>{lang === 'id' ? 'Musim 1' : 'Season 1'}</span>
                                <span className="text-blue-300 font-bold">{nextSeasonProgressText}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PROGRESS SUMMARY CARD (Single Compact Card - Max 220px Mobile) */}
                  {(() => {
                    // Metric 1: Level (builderLevel)
                    // Metric 2: XP % (percentToNextLevel)
                    // Metric 3: Reputation (reputation)
                    // Metric 4: Current Rank (getBuilderRank())
                    // Metric 5: Current Quest Progress
                    const activeQuest = quests.find(q => !q.completed) || quests[quests.length - 1];
                    const questProgressPercent = activeQuest ? Math.min(100, Math.round((activeQuest.current / activeQuest.target) * 100)) : 100;
                    const questProgressText = activeQuest ? `${activeQuest.current}/${activeQuest.target}` : '100%';

                    // Metric 6: Daily Streak (dailyStreak)

                    // Metric 7: Season Progress %
                    const currentSeason = seasonService.getCurrentSeason();
                    const seasonStats = seasonService.getSeasonPlayerStats(currentSeason.seasonId);
                    const seasonTierCompletions = [
                      100,
                      Math.min(100, Math.round((seasonStats.seasonMazeCompletions / 3) * 100)),
                      Math.min(100, Math.round((seasonStats.seasonAchievements.length / 5) * 100)),
                      Math.min(100, Math.round((seasonStats.seasonReputation / 1000) * 100)),
                    ];
                    const seasonProgressPercent = Math.round(seasonTierCompletions.reduce((a, b) => a + b, 0) / seasonTierCompletions.length);

                    // Metric 8: Achievement Completion %
                    const allAchievements = achievementService.getAchievements();
                    const unlockedAchievements = allAchievements.filter(a => a.unlocked);
                    const achievementCompletionPercent = allAchievements.length > 0 
                      ? Math.round((unlockedAchievements.length / allAchievements.length) * 100) 
                      : 0;

                    return (
                      <div id="progress-summary-card" className="relative max-h-[220px] sm:max-h-none overflow-y-auto sm:overflow-visible rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] border border-[#0052FF]/30 text-white p-3.5 shadow-xl font-sans space-y-2.5">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-[#0052FF]/20 border border-[#0052FF]/40 text-[#0052FF]">
                              <BarChart3 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold font-mono tracking-tight text-white uppercase leading-none">
                                {lang === 'id' ? 'Ringkasan Progres' : 'Progress Summary'}
                              </h3>
                              <p className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">
                                {lang === 'id' ? 'Metrik Utama Dalam 1 Tampilan' : 'All Core Metrics at a Glance'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                            {getBuilderRank()}
                          </span>
                        </div>

                        {/* 8 Metrics Compact Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {/* 1. Level */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Level</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-extrabold font-mono text-white text-sm">Lvl {builderLevel}</span>
                              <span className="text-[9px] font-mono text-[#0052FF] bg-[#0052FF]/20 px-1.5 py-0.5 rounded font-bold">
                                {builderLevel >= 10 ? 'MAX' : `LVL ${builderLevel}`}
                              </span>
                            </div>
                          </div>

                          {/* 2. XP % */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                              <span>XP %</span>
                              <span className="text-blue-300 font-bold">{percentToNextLevel}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1 border border-white/5">
                              <div className="bg-gradient-to-r from-[#0052FF] to-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentToNextLevel}%` }} />
                            </div>
                            <span className="text-[8px] font-mono text-slate-400 mt-1">{xpIntoLevel}/1000 XP</span>
                          </div>

                          {/* 3. Reputation */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === 'id' ? 'Reputasi' : 'Reputation'}</span>
                            <div className="flex items-center gap-1 mt-1 text-emerald-400 font-bold font-mono text-sm">
                              <Shield size={13} />
                              <span>{reputation.toLocaleString()} REP</span>
                            </div>
                          </div>

                          {/* 4. Current Rank */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === 'id' ? 'Peringkat' : 'Current Rank'}</span>
                            <div className="flex items-center gap-1 mt-1 text-purple-300 font-bold font-mono text-xs">
                              <Award size={13} className="text-purple-400" />
                              <span className="truncate">{getBuilderRank()}</span>
                            </div>
                          </div>

                          {/* 5. Quest Progress */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                              <span className="truncate">{lang === 'id' ? 'Quest' : 'Quest Progress'}</span>
                              <span className="text-amber-300 font-bold">{questProgressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1 border border-white/5">
                              <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-1.5 rounded-full transition-all duration-500" style={{ width: `${questProgressPercent}%` }} />
                            </div>
                            <span className="text-[8px] font-mono text-slate-400 mt-1">{questProgressText}</span>
                          </div>

                          {/* 6. Daily Streak */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === 'id' ? 'Streak' : 'Daily Streak'}</span>
                            <div className="flex items-center gap-1 mt-1 text-amber-400 font-bold font-mono text-sm">
                              <Flame size={14} className={hasCheckedInToday ? "text-amber-500" : "text-amber-500 animate-pulse"} />
                              <span>{dailyStreak} {lang === 'id' ? 'Hari' : 'Days'}</span>
                            </div>
                          </div>

                          {/* 7. Season Progress % */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                              <span>{lang === 'id' ? 'Musim 1 %' : 'Season 1 %'}</span>
                              <span className="text-purple-300 font-bold">{seasonProgressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1 border border-white/5">
                              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${seasonProgressPercent}%` }} />
                            </div>
                            <span className="text-[8px] font-mono text-slate-400 mt-1">Season 1</span>
                          </div>

                          {/* 8. Achievement Completion % */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                              <span>{lang === 'id' ? 'Pencapaian %' : 'Achievements %'}</span>
                              <span className="text-emerald-300 font-bold">{achievementCompletionPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1 border border-white/5">
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${achievementCompletionPercent}%` }} />
                            </div>
                            <span className="text-[8px] font-mono text-slate-400 mt-1">{unlockedAchievements.length}/{allAchievements.length}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Builder Identity Card */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 text-white p-5 shadow-lg overflow-hidden font-sans">
                    {/* Background glows */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#0052FF]/20 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <PlayerAvatar
                          activeSkin={activeSkin}
                          customPfp={customPfp}
                          variant="passport"
                        />
                        <div>
                          <h5 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">Builder Passport</h5>
                          <span className="text-[8px] font-mono text-slate-500 leading-none">
                            ID: {customUsername ? `NODE-${customUsername.toUpperCase().replace('@', '')}` : 'BASE-L2-PROMO'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        ACTIVE NODE
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold font-mono text-white tracking-wide flex flex-col">
                          {customUsername ? (
                            <>
                              <span className="text-[#0052FF] font-sans font-extrabold text-base tracking-tight leading-tight">
                                {customUsername.startsWith('@') ? customUsername : `@${customUsername}`}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-medium leading-none mt-0.5">
                                ({activePlayerName})
                              </span>
                            </>
                          ) : (
                            <span>{activePlayerName}</span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1.5 flex items-center gap-1.5">
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

                    {/* Builder Reputation & Rank Divider */}
                    <div className="my-4 h-px bg-white/10 w-full" />

                    {/* Builder Reputation & Rank Section */}
                    {(() => {
                      const currentRank = getBuilderRank();
                      const nextRank = getNextRank();
                      const progress = getReputationProgress();
                      
                      const rankDescriptions: Record<string, { en: string; id: string }> = {
                        'Explorer': {
                          en: 'Beginning your Builder Journey.',
                          id: 'Memulai Perjalanan Builder Anda.'
                        },
                        'Validator': {
                          en: 'Recognized contributor to the ecosystem.',
                          id: 'Kontributor ekosistem yang diakui.'
                        },
                        'Architect': {
                          en: 'Advanced ecosystem participant.',
                          id: 'Peserta ekosistem tingkat lanjut.'
                        },
                        'Master Builder': {
                          en: 'Top-tier network contributor.',
                          id: 'Kontributor jaringan tingkat teratas.'
                        }
                      };

                      const rankEmojis: Record<string, string> = {
                        'Explorer': '🧭',
                        'Validator': '🛡️',
                        'Architect': '📐',
                        'Master Builder': '👑'
                      };

                      const rankColor = currentRank === 'Explorer' ? '#94A3B8' : currentRank === 'Validator' ? '#3B82F6' : currentRank === 'Architect' ? '#8B5CF6' : '#10B981';

                      return (
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl" role="img" aria-label={currentRank}>
                                {rankEmojis[currentRank] || '🧭'}
                              </span>
                              <div>
                                <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">
                                  {lang === 'id' ? 'REPUTASI BUILDER' : 'BUILDER REPUTATION'}
                                </div>
                                <h4 className="text-sm font-bold font-sans text-white mt-1 flex items-center gap-1.5">
                                  <span style={{ color: rankColor }}>
                                    {currentRank}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono font-normal">
                                    ({reputation.toLocaleString()} REP)
                                  </span>
                                </h4>
                              </div>
                            </div>

                            {/* Rank Description */}
                            <div className="text-left sm:text-right sm:max-w-[240px]">
                              <p className="text-[10px] text-slate-300 italic leading-tight">
                                {lang === 'id' ? rankDescriptions[currentRank]?.id : rankDescriptions[currentRank]?.en}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                              <span>
                                {lang === 'id' ? 'Progres ke Peringkat Berikutnya' : 'Progress to Next Rank'}
                              </span>
                              <span className="font-bold text-white">
                                {nextRank ? (
                                  <>
                                    {progress.percent}% {lang === 'id' ? 'ke' : 'to'} {nextRank}
                                  </>
                                ) : (
                                  lang === 'id' ? 'Peringkat Maksimum 🎉' : 'Maximum Rank 🎉'
                                )}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
                              <div 
                                className="h-1.5 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${progress.percent}%`,
                                  background: currentRank === 'Explorer' 
                                    ? 'linear-gradient(to right, #94A3B8, #3B82F6)' 
                                    : currentRank === 'Validator' 
                                    ? 'linear-gradient(to right, #3B82F6, #8B5CF6)' 
                                    : currentRank === 'Architect' 
                                    ? 'linear-gradient(to right, #8B5CF6, #10B981)' 
                                    : '#10B981'
                                }}
                              />
                            </div>
                            {nextRank && (
                              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                                <span>
                                  {currentRank === 'Explorer' ? '0 REP' : currentRank === 'Validator' ? '1,000 REP' : '5,000 REP'}
                                </span>
                                <span>
                                  {nextRank === 'Validator' ? '1,000' : nextRank === 'Architect' ? '5,000' : '10,000'} REP
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* DAILY STREAK AND ALIGNMENT CHECK-IN SYSTEM */}
                  {(() => {
                    const streakTranslations: Record<string, any> = {
                      en: {
                        title: "Daily Alignment & Check-In",
                        desc: "Maintain consecutive check-ins to secure Base Network reputation and unlock exclusive builder assets.",
                        count: "Day Streak",
                        claimBtn: "Secure Today's Alignment Stamp",
                        claimedBtn: "Alignment Secured Today",
                        nextIn: "Next check-in unlocks in",
                        nextReward: "Next reward",
                        milestoneReached: "Milestone reached!",
                        specialKey: "Special Key",
                        reputation: "Reputation",
                        badge: "Cosmetic Badge",
                        trophy: "Seasonal Trophy",
                        congrats: "Congratulations!",
                        streakClaimed: "Daily check-in stamp secured! You earned:",
                        closeBtn: "Dismiss",
                      },
                      id: {
                        title: "Penyelarasan & Check-In Harian",
                        desc: "Pertahankan check-in berturut-turut untuk mengamankan reputasi Base Network dan membuka aset builder eksklusif.",
                        count: "Hari Beruntun",
                        claimBtn: "Amankan Stem Penyelarasan Hari Ini",
                        claimedBtn: "Penyelarasan Diamankan Hari Ini",
                        nextIn: "Check-in berikutnya terbuka dalam",
                        nextReward: "Hadiah berikutnya",
                        milestoneReached: "Pencapaian diraih!",
                        specialKey: "Kunci Spesial",
                        reputation: "Reputasi",
                        badge: "Lencana Kosmetik",
                        trophy: "Piala Musiman",
                        congrats: "Selamat!",
                        streakClaimed: "Stem check-in harian berhasil diamankan! Anda mendapatkan:",
                        closeBtn: "Tutup",
                      },
                      zh: {
                        title: "每日签到与网络对齐",
                        desc: "保持连续签到以巩固 Base 网络信誉度，并解锁专属建设者资产。",
                        count: "天连续签到",
                        claimBtn: "获取今日对齐印章",
                        claimedBtn: "今日对齐已完成",
                        nextIn: "下一次签到解锁于",
                        nextReward: "下一阶段奖励",
                        milestoneReached: "达成里程碑！",
                        specialKey: "专属钥匙",
                        reputation: "信誉积分",
                        badge: "专属徽章",
                        trophy: "赛季奖杯",
                        congrats: "恭喜您！",
                        streakClaimed: "今日签到印章已成功确认！您获得了：",
                        closeBtn: "关闭",
                      },
                      fr: {
                        title: "Alignement & Check-In Quotidien",
                        desc: "Maintenez des check-ins consécutifs pour sécuriser votre réputation Base Network et débloquer des récompenses.",
                        count: "Jours de Suite",
                        claimBtn: "Sécuriser le tampon d'alignement",
                        claimedBtn: "Alignement Sécurisé Aujourd'hui",
                        nextIn: "Prochain check-in débloqué dans",
                        nextReward: "Prochaine récompense",
                        milestoneReached: "Palier atteint !",
                        specialKey: "Clé Spéciale",
                        reputation: "Réputation",
                        badge: "Badge Cosmétique",
                        trophy: "Trophée Saisonnier",
                        congrats: "Félicitations !",
                        streakClaimed: "Tampon de check-in sécurisé ! Vous avez obtenu :",
                        closeBtn: "Fermer",
                      },
                    };

                    const trans = streakTranslations[lang] || streakTranslations.en;
                    const streakVal = dailyStreak || 0;
                    
                    // Rolling 7-day visualization track calculation
                    const currentWeekStart = Math.max(1, Math.floor((Math.max(1, streakVal) - 1) / 7) * 7 + 1);
                    const weekDays = Array.from({ length: 7 }, (_, i) => currentWeekStart + i);

                    // Check milestone days
                    const getDayRewardInfo = (dayNum: number) => {
                      if (dayNum === 3) return { label: `+1 ${trans.specialKey} 🔑`, type: 'key', icon: <Key className="w-4 h-4 text-amber-400" /> };
                      if (dayNum === 7) return { label: `+25 ${trans.reputation} 🛡️`, type: 'reputation', icon: <Shield className="w-4 h-4 text-indigo-400" /> };
                      if (dayNum === 14) return { label: `${trans.badge} 🌟`, type: 'badge', icon: <Award className="w-4 h-4 text-emerald-400" /> };
                      if (dayNum === 30) return { label: `${trans.trophy} 🏆`, type: 'trophy', icon: <Trophy className="w-4 h-4 text-purple-400" /> };
                      return { label: `+100 XP, +10 Rep`, type: 'standard', icon: <Zap className="w-3.5 h-3.5 text-slate-400" /> };
                    };

                    const nextMilestone = (() => {
                      if (streakVal < 3) return { day: 3, text: `+1 ${trans.specialKey} (Day 3)`, remaining: 3 - streakVal };
                      if (streakVal < 7) return { day: 7, text: `+25 ${trans.reputation} (Day 7)`, remaining: 7 - streakVal };
                      if (streakVal < 14) return { day: 14, text: `Lencana 'Streak Sentinel' (Day 14)`, remaining: 14 - streakVal };
                      if (streakVal < 30) return { day: 30, text: `Piala 'Ecosystem Titan' (Day 30)`, remaining: 30 - streakVal };
                      return null;
                    })();

                    const handleClaimStamp = () => {
                      sound.playMove();
                      const result = claimDailyStreak();
                      if (result.success) {
                        setStreakClaimedReward(result.reward);
                        setShowStreakCelebration(true);
                        sound.playWin();
                      } else {
                        sound.playError();
                      }
                    };

                    return (
                      <div className="space-y-3">
                        <button
                          id="toggle-daily-streak-btn"
                          onClick={() => {
                            sound.playMove();
                            setShowDailyStreak(!showDailyStreak);
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#080d1a] bg-gradient-to-r from-[#0e162d] to-[#090d1a] border border-white/10 hover:bg-[#131f3f] transition-all text-white font-sans text-sm font-semibold shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Flame size={16} className={`${hasCheckedInToday ? "text-amber-500" : "text-amber-500 animate-pulse"}`} />
                            <span>
                              {lang === 'id' ? 'Penyelarasan & Check-In Harian' : 'Daily Alignment & Check-In'}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ml-1 ${
                              hasCheckedInToday 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}>
                              {hasCheckedInToday 
                                ? (lang === 'id' ? 'Selesai' : 'Claimed') 
                                : (lang === 'id' ? 'Tersedia' : 'Pending')
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
                            <span>
                              {showDailyStreak 
                                ? (lang === 'id' ? 'Sembunyikan' : 'Hide Details') 
                                : (lang === 'id' ? 'Tampilkan' : 'Show Details')
                              }
                            </span>
                            {showDailyStreak ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {showDailyStreak && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="relative rounded-2xl bg-[#080d1a] bg-gradient-to-br from-[#0e162d] via-[#090d1a] to-[#04060d] border border-white/10 text-white p-5 shadow-lg overflow-hidden font-sans transition-all duration-300 hover:border-slate-700">
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052FF]/10 rounded-full blur-3xl pointer-events-none" />
                        
                        {/* Header section */}
                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-[#0052FF]" />
                              <h4 className="text-sm font-extrabold tracking-tight text-white font-sans">
                                {trans.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
                              {trans.desc}
                            </p>
                          </div>

                          {/* Counter Badge */}
                          <div className="flex items-center gap-2 bg-[#0052FF]/20 border border-[#0052FF]/40 px-3 py-1.5 rounded-xl self-start sm:self-center shadow-[0_0_12px_rgba(0,82,255,0.2)]">
                            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span className="text-xs font-mono font-black text-white">
                              {streakVal} {trans.count}
                            </span>
                          </div>
                        </div>

                        {/* 7-Day Stamp Visualization Track */}
                        <div className="relative py-5">
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                            {weekDays.map((dayNum) => {
                              const isCompleted = dayNum <= streakVal;
                              const isTodayPending = dayNum === streakVal + 1 && !hasCheckedInToday;
                              const rewardInfo = getDayRewardInfo(dayNum);
                              
                              return (
                                <div 
                                  key={dayNum}
                                  className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                                      : isTodayPending
                                      ? 'bg-[#0052FF]/10 border-[#0052FF]/50 shadow-[0_0_15px_rgba(0,82,255,0.25)] animate-pulse'
                                      : 'bg-[#121c35]/40 border-white/5'
                                  }`}
                                >
                                  {/* Stamp Status Indicator */}
                                  <span className="text-[9px] font-mono font-black text-slate-400 leading-none mb-1">
                                    Day {dayNum}
                                  </span>

                                  {/* Stamp Icon */}
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted
                                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                                      : isTodayPending
                                      ? 'bg-gradient-to-br from-[#0052FF] to-blue-600 text-white shadow-[0_2px_8px_rgba(0,82,255,0.3)] scale-110'
                                      : 'bg-slate-800/60 text-slate-500 border border-white/5'
                                  }`}>
                                    {isCompleted ? (
                                      <Check className="w-5 h-5 stroke-[3]" />
                                    ) : (
                                      rewardInfo.icon
                                    )}
                                  </div>

                                  {/* Label or Tooltip representation */}
                                  <div className="text-[8px] font-semibold text-center leading-tight mt-2 text-slate-300 truncate max-w-full">
                                    {rewardInfo.type !== 'standard' ? (
                                      <span className="text-[#0052FF] font-black">{rewardInfo.label}</span>
                                    ) : (
                                      <span className="text-slate-500">{lang === 'id' ? 'Standar' : 'Standard'}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action CTA Row */}
                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                          {hasCheckedInToday ? (
                            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-xl flex-1 justify-center sm:justify-start">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-emerald-300">
                                  {trans.claimedBtn}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {trans.nextIn}: <span className="text-slate-200 font-bold">{timeUntilNextDay}</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={handleClaimStamp}
                              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-[#0052FF] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 flex-1 border border-[#0052FF]/30 cursor-pointer"
                            >
                              <Zap className="w-4 h-4 text-amber-300 group-hover:animate-bounce" />
                              {trans.claimBtn}
                            </button>
                          )}

                          {/* Milestone Indicator Banner */}
                          {nextMilestone && (
                            <div className="flex items-center gap-2 bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2">
                              <div className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse" />
                              <div className="flex flex-col text-[10px]">
                                <span className="text-slate-400 font-mono">
                                  {trans.nextReward}
                                </span>
                                <span className="text-white font-bold font-sans">
                                  {nextMilestone.text} {lang === 'id' ? 'dalam' : 'in'} {nextMilestone.remaining} {lang === 'id' ? 'hari' : 'days'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Success Celebration Overlay */}
                        <AnimatePresence>
                          {showStreakCelebration && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                            >
                              <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="relative w-full max-w-sm bg-gradient-to-b from-[#0F172A] to-[#090D1A] border border-[#0052FF]/40 rounded-2xl p-6 text-center text-white shadow-2xl overflow-hidden font-sans"
                              >
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0052FF]" />
                                
                                {/* Confetti or Starburst back-light */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0052FF]/20 rounded-full blur-3xl pointer-events-none" />

                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                                  <Trophy className="w-8 h-8 animate-bounce" />
                                </div>

                                <h3 className="text-lg font-black tracking-tight text-white mb-1">
                                  {trans.congrats}
                                </h3>
                                <p className="text-xs text-slate-400 mb-4 font-medium">
                                  {trans.streakClaimed}
                                </p>

                                <div className="bg-[#1E293B]/60 border border-white/5 rounded-xl py-3 px-4 mb-5 flex items-center justify-center gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                  <span className="text-sm font-black text-amber-300 font-mono tracking-wide">
                                    {streakClaimedReward}
                                  </span>
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                </div>

                                <button
                                  onClick={() => setShowStreakCelebration(false)}
                                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs tracking-wide transition-all duration-300 cursor-pointer border border-white/5"
                                >
                                  {trans.closeBtn}
                                </button>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* NEXT ACTION SYSTEM */}
                  {(() => {
                    const action = getNextAction();
                    return (
                      <div className="space-y-3">
                        <button
                          id="toggle-next-action-btn"
                          onClick={() => {
                            sound.playMove();
                            setShowNextAction(!showNextAction);
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#070c18] bg-gradient-to-r from-[#0c1428] to-[#070a14] border border-[#0052FF]/20 hover:bg-[#111c38] transition-all text-white font-sans text-sm font-semibold shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Compass size={16} className="text-[#0052FF]" />
                            <span>
                              {lang === 'id' ? 'Langkah Rekomendasi Berikutnya' : 'Recommended Next Step'}
                            </span>
                            <span className="text-[10px] font-mono text-[#0052FF] font-bold bg-[#0052FF]/10 px-2 py-0.5 rounded border border-[#0052FF]/20">
                              {lang === 'id' ? 'Aktif' : 'Active'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
                            <span>
                              {showNextAction 
                                ? (lang === 'id' ? 'Sembunyikan' : 'Hide Details') 
                                : (lang === 'id' ? 'Tampilkan' : 'Show Details')
                              }
                            </span>
                            {showNextAction ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {showNextAction && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="relative rounded-2xl bg-[#070c18] bg-gradient-to-br from-[#0c1428] via-[#070a14] to-[#04060c] border border-[#0052FF]/30 text-white p-5 sm:p-6 shadow-[0_0_24px_rgba(0,82,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden font-sans transition-all duration-300 hover:border-[#0052FF]/50">
                        {/* Subtle decorative mesh background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,82,255,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.06),transparent_40%)] pointer-events-none" />
                        
                        <div className="relative flex flex-col lg:flex-row lg:items-stretch justify-between gap-5">
                          <div className="space-y-3.5 flex-1">
                            {/* Eyebrow badge */}
                            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-[#3b82f6] font-semibold uppercase">
                              {action.icon}
                              <span>{lang === 'id' ? 'LANGKAH BERIKUTNYA' : 'RECOMMENDED NEXT STEP'}</span>
                            </div>

                            {/* Objective Title */}
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                {lang === 'id' ? action.titleId : action.titleEn}
                              </h3>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {lang === 'id' ? action.detailId : action.detailEn}
                              </p>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1.5 pt-1 max-w-md">
                              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>{lang === 'id' ? 'Progres Sasaran' : 'Objective Progress'}</span>
                                <span className="text-white font-bold">{action.progressText}</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5 shadow-inner">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-[#0052FF] to-blue-400 transition-all duration-500"
                                  style={{ width: `${action.progressPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Action Hint */}
                            <div className="flex items-start gap-2 text-xs text-slate-400 bg-[#0052FF]/5 border-l-2 border-[#0052FF]/40 p-3 rounded-r-lg font-sans mt-2">
                              <span>💡</span>
                              <span>{lang === 'id' ? action.hintId : action.hintEn}</span>
                            </div>
                          </div>

                          {/* Reward area & claims button */}
                          <div className={`flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 min-w-[200px] ${action.type === 'quest' ? 'lg:justify-between' : 'lg:justify-center'}`}>
                            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 w-full text-left lg:text-right hover:border-[#0052FF]/20 transition-all">
                              <span className="block text-[8px] font-mono uppercase text-slate-400 tracking-wider">
                                {lang === 'id' ? 'HADIAH SASARAN' : 'TARGET REWARD'}
                              </span>
                              <span className="text-[11px] font-semibold text-emerald-400 font-mono mt-0.5 block">
                                {lang === 'id' ? action.rewardId : action.rewardEn}
                              </span>
                            </div>

                            {action.type === 'quest' && (
                              <button
                                onClick={() => {
                                  if (onClaimQuestReward) {
                                    onClaimQuestReward(action.id);
                                  }
                                }}
                                className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-[#0052FF]/20 hover:shadow-[#0052FF]/30 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Zap size={14} className="animate-pulse" />
                                {lang === 'id' ? 'KLAIM HADIAH SEKARANG' : 'CLAIM REWARD NOW'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* Layer 2: Active Progression */}
                  {/* Seasonal Progression Card */}
                  {(() => {
                    const currentSeason = seasonService.getCurrentSeason();
                    const stats = seasonService.getSeasonPlayerStats(currentSeason.seasonId);
                    const rewards = seasonService.calculateSeasonRewards(currentSeason.seasonId, stats);
                    const currentRank = getBuilderRank();

                    const endD = new Date(currentSeason.endDate);
                    const diff = Math.max(0, endD.getTime() - Date.now());
                    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

                    const tSeasonal = lang === 'id' ? {
                      title: "Progres Musiman",
                      subtitle: "Lacak performa dan tingkat hadiah Anda sepanjang Musim.",
                      active: "Aktif",
                      upcoming: "Mendatang",
                      completed: "Selesai",
                      days_left: "Hari Tersisa",
                      season_rank: "Peringkat Musiman",
                      metrics_title: "Metrik Musim Ini",
                      rewards_title: "Tingkat Hadiah Musiman",
                      xp: "XP Musim",
                      rep: "Reputasi Musim",
                      achievements: "Pencapaian Musim",
                      completions: "Selesai Labirin",
                      unlocked: "Terbuka",
                      locked: "Terkunci",
                      progress: "Progres",
                      criteria: "Kriteria",
                      season_timeline: "Lini Masa Musim",
                      s1_desc: "Musim Perdana: Bangun & Optimalkan",
                      s2_desc: "Tantangan Validasi & Perang Gas",
                      s3_desc: "Sirkuit Superchain Baru & Peta Global",
                    } : {
                      title: "Seasonal Progression",
                      subtitle: "Track your performance and reward tiers throughout the Season.",
                      active: "Active",
                      upcoming: "Upcoming",
                      completed: "Completed",
                      days_left: "Days Remaining",
                      season_rank: "Seasonal Rank",
                      metrics_title: "Ecosystem Season Metrics",
                      rewards_title: "Seasonal Reward Tiers",
                      xp: "Season XP",
                      rep: "Season Reputation",
                      achievements: "Season Achievements",
                      completions: "Maze Completions",
                      unlocked: "Unlocked",
                      locked: "Locked",
                      progress: "Progress",
                      criteria: "Criteria",
                      season_timeline: "Ecosystem Season Timeline",
                      s1_desc: "Inaugural Season: Build & Optimize",
                      s2_desc: "Validation challenges & Gas wars",
                      s3_desc: "New Superchain circuits & global maps",
                    };

                    const rewardTranslations: Record<string, { nameId: string; descId: string }> = {
                      's1-common-badge': {
                        nameId: 'Lencana Base Builder',
                        descId: 'Bukti partisipasi dalam acara Builder Musim 1 perdana.'
                      },
                      's1-rare-amplifier': {
                        nameId: 'Amplifier Ekosistem',
                        descId: 'Diberikan kepada Builder yang menyelesaikan setidaknya 3 level.'
                      },
                      's1-epic-cyber': {
                        nameId: 'Inti L2 Neon Cyberpunk',
                        descId: 'Skin eksklusif yang terbuka melalui optimasi ketat (5+ Pencapaian).'
                      },
                      's1-legendary-master': {
                        nameId: 'Segel Berdaulat Ekosistem',
                        descId: 'Dikhususkan untuk Builder elit dengan reputasi 1.000+ REP.'
                      }
                    };

                    const tierMetrics = [
                      {
                        tier: 'Common' as const,
                        name: lang === 'id' ? 'Tingkat Umum' : 'Common Tier',
                        criteria: lang === 'id' ? 'Partisipasi Universal' : 'Universal Participation',
                        isCompleted: true,
                        percent: 100,
                        current: 1,
                        target: 1,
                        reward: { xp: 100, rep: 25, item: 'Base Builder Badge' }
                      },
                      {
                        tier: 'Rare' as const,
                        name: lang === 'id' ? 'Tingkat Langka' : 'Rare Tier',
                        criteria: lang === 'id' ? 'Selesaikan 3+ Labirin' : 'Complete 3+ Mazes',
                        isCompleted: stats.seasonMazeCompletions >= 3,
                        percent: Math.min(100, Math.round((stats.seasonMazeCompletions / 3) * 100)),
                        current: stats.seasonMazeCompletions,
                        target: 3,
                        reward: { xp: 300, rep: 75, item: 'Ecosystem Amplifier' }
                      },
                      {
                        tier: 'Epic' as const,
                        name: lang === 'id' ? 'Tingkat Epik' : 'Epic Tier',
                        criteria: lang === 'id' ? 'Buka 5+ Pencapaian' : 'Unlock 5+ Achievements',
                        isCompleted: stats.seasonAchievements.length >= 5,
                        percent: Math.min(100, Math.round((stats.seasonAchievements.length / 5) * 100)),
                        current: stats.seasonAchievements.length,
                        target: 5,
                        reward: { xp: 600, rep: 150, item: 'Neon Cyberpunk L2 Core' }
                      },
                      {
                        tier: 'Legendary' as const,
                        name: lang === 'id' ? 'Tingkat Legendaris' : 'Legendary Tier',
                        criteria: lang === 'id' ? 'Miliki 1.000+ Reputasi' : 'Have 1,000+ Reputation',
                        isCompleted: stats.seasonReputation >= 1000,
                        percent: Math.min(100, Math.round((stats.seasonReputation / 1000) * 100)),
                        current: stats.seasonReputation,
                        target: 1000,
                        reward: { xp: 1200, rep: 300, item: 'Ecosystem Sovereign Seal' }
                      }
                    ];

                    return (
                      <div className="space-y-3">
                        <button
                          id="toggle-seasonal-progression-btn"
                          onClick={() => {
                            sound.playMove();
                            setShowSeasonalProgression(!showSeasonalProgression);
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] border border-white/10 hover:bg-[#202d4a] transition-all text-white font-sans text-sm font-semibold shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Trophy size={16} className="text-purple-400" />
                            <span>
                              {lang === 'id' ? 'Progres Musiman (Musim 1)' : 'Seasonal Progression (Season 1)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
                            <span>
                              {showSeasonalProgression 
                                ? (lang === 'id' ? 'Sembunyikan' : 'Hide Details') 
                                : (lang === 'id' ? 'Tampilkan' : 'Show Details')
                              }
                            </span>
                            {showSeasonalProgression ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {showSeasonalProgression && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 text-white p-5 shadow-lg overflow-hidden font-sans space-y-5">
                        {/* Background glows */}
                        <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#0052FF]/15 rounded-full blur-2xl pointer-events-none"></div>

                        {/* Top Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#0052FF]/20 border border-[#0052FF]/30 p-2 rounded-xl text-[#0052FF]">
                              <Trophy size={20} className="animate-pulse" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">
                                  {tSeasonal.title}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                                  {tSeasonal.active}
                                </span>
                              </div>
                              <h3 className="text-base font-bold font-sans text-white mt-1 flex items-center gap-2">
                                <span>Season {currentSeason.seasonNumber}</span>
                                <span className="text-xs text-slate-400 font-mono font-normal">({currentSeason.seasonName})</span>
                              </h3>
                            </div>
                          </div>

                          {/* Countdown Indicator & Demo Toggle */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => { sound.playMove(); setSimulateSeasonalEmpty(!simulateSeasonalEmpty); }}
                              className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                                simulateSeasonalEmpty
                                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                              title="Toggle demo empty state for review"
                            >
                              {simulateSeasonalEmpty ? 'Live Stats' : 'Demo Empty'}
                            </button>

                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 self-start sm:self-auto">
                              <Clock size={14} className="text-amber-400" />
                              <div className="text-left">
                                <div className="text-[8px] font-mono text-slate-400 uppercase leading-none">{tSeasonal.days_left}</div>
                                <div className="text-xs font-mono font-bold text-white mt-0.5">{daysRemaining} {lang === 'id' ? 'Hari' : 'Days'}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {simulateSeasonalEmpty || stats.seasonXp === 0 ? (
                          <div className="bg-white/5 border border-white/5 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full border border-dashed border-purple-400/50 flex items-center justify-center text-purple-400 bg-purple-500/10 animate-pulse">
                              <Sparkles size={22} />
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                {lang === 'id' ? 'Belum Ada Jejak Musiman' : 'No Seasonal Progress Yet'}
                              </h4>
                              <p className="text-[11px] text-slate-300 max-w-sm leading-relaxed font-sans">
                                {lang === 'id'
                                  ? 'Musim 1 adalah lembaran baru penuh pengoptimalan! Selesaikan tantangan harian untuk mengklaim tempat Anda di papan peringkat.'
                                  : 'Season 1 is a fresh landscape of optimizations waiting for your genius! Complete daily quests and optimize your gas usage to begin.'
                                }
                              </p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-lg p-3 w-full max-w-xs text-left space-y-2">
                              <span className="text-[9px] font-mono text-purple-300 uppercase tracking-wider block font-bold">
                                {lang === 'id' ? 'Rekomendasi Tindakan:' : 'Recommended Action:'}
                              </span>
                              <p className="text-[10px] text-slate-400 font-sans leading-tight">
                                {lang === 'id'
                                  ? 'Kunjungi tab Quest untuk mengklaim faset gratis Anda dan jalankan kontrak transaksi harian.'
                                  : 'Visit the Quests tab to claim free faucet gas and complete your daily transaction runs.'
                                }
                              </p>
                              <button
                                onClick={() => { sound.playMove(); setActiveTab('quests'); }}
                                className="w-full mt-1.5 py-2 text-[10px] font-mono bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg border border-purple-500/20 shadow-md transition duration-150 cursor-pointer text-center"
                              >
                                {lang === 'id' ? 'Buka Tab Quest' : 'Explore Quests Tab'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Seasonal Rank Info */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/5 p-3.5 rounded-xl">
                              <div className="flex items-center gap-2">
                                <Shield size={16} className="text-purple-400" />
                                <span className="text-xs font-semibold text-slate-300">{tSeasonal.season_rank}:</span>
                              </div>
                              <span className="text-xs font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                                {currentRank}
                              </span>
                            </div>

                        {/* Ecosystem Stats Grid */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">{tSeasonal.metrics_title}</h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {/* Metric 1 */}
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                              <span className="text-[10px] font-semibold text-slate-400 font-sans">{tSeasonal.xp}</span>
                              <div className="text-base font-bold font-mono text-[#0052FF] mt-1.5 flex items-center gap-1">
                                <Sparkles size={14} />
                                {stats.seasonXp.toLocaleString()}
                              </div>
                            </div>

                            {/* Metric 2 */}
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                              <span className="text-[10px] font-semibold text-slate-400 font-sans">{tSeasonal.rep}</span>
                              <div className="text-base font-bold font-mono text-blue-400 mt-1.5 flex items-center gap-1">
                                <Shield size={14} />
                                {stats.seasonReputation.toLocaleString()}
                              </div>
                            </div>

                            {/* Metric 3 */}
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                              <span className="text-[10px] font-semibold text-slate-400 font-sans">{tSeasonal.achievements}</span>
                              <div className="text-base font-bold font-mono text-purple-400 mt-1.5 flex items-center gap-1">
                                <Award size={14} />
                                {stats.seasonAchievements.length} / {achievementService.getAchievements().length}
                              </div>
                            </div>

                            {/* Metric 4 */}
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                              <span className="text-[10px] font-semibold text-slate-400 font-sans">{tSeasonal.completions}</span>
                              <div className="text-base font-bold font-mono text-amber-400 mt-1.5 flex items-center gap-1">
                                <Trophy size={14} />
                                {stats.seasonMazeCompletions}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reward Tier Progress */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">{tSeasonal.rewards_title}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {tierMetrics.map((tm) => {
                              let tierStyle = '';
                              let textStyle = '';
                              let progressStyle = '';

                              if (tm.tier === 'Legendary') {
                                tierStyle = tm.isCompleted ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5 opacity-70';
                                textStyle = 'text-amber-300';
                                progressStyle = 'bg-gradient-to-r from-amber-400 to-amber-600';
                              } else if (tm.tier === 'Epic') {
                                tierStyle = tm.isCompleted ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5 opacity-70';
                                textStyle = 'text-purple-300';
                                progressStyle = 'bg-gradient-to-r from-purple-400 to-purple-600';
                              } else if (tm.tier === 'Rare') {
                                tierStyle = tm.isCompleted ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5 opacity-70';
                                textStyle = 'text-blue-300';
                                progressStyle = 'bg-gradient-to-r from-blue-400 to-blue-600';
                              } else {
                                tierStyle = tm.isCompleted ? 'bg-slate-500/10 border-slate-500/30' : 'bg-white/5 border-white/5 opacity-70';
                                textStyle = 'text-slate-300';
                                progressStyle = 'bg-slate-400';
                              }

                              return (
                                <div key={tm.tier} className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all duration-300 ${tierStyle}`}>
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className={`text-xs font-extrabold ${textStyle}`}>{tm.name}</span>
                                      {tm.isCompleted ? (
                                        <span className="text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 leading-none">
                                          ✓ {tSeasonal.unlocked}
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-semibold font-mono bg-slate-500/20 text-slate-400 border border-white/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 leading-none">
                                          {tSeasonal.locked}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-mono mt-1 leading-none">{tSeasonal.criteria}: {tm.criteria}</p>
                                    
                                    {/* Rewards specification block */}
                                    <div className="mt-2 flex flex-col gap-1 bg-white/5 p-1.5 rounded border border-white/5 text-[9px] font-mono text-slate-300">
                                      <div className="flex justify-between">
                                        <span>🎁 {lang === 'id' && rewardTranslations[tm.tier === 'Common' ? 's1-common-badge' : tm.tier === 'Rare' ? 's1-rare-amplifier' : tm.tier === 'Epic' ? 's1-epic-cyber' : 's1-legendary-master'] ? rewardTranslations[tm.tier === 'Common' ? 's1-common-badge' : tm.tier === 'Rare' ? 's1-rare-amplifier' : tm.tier === 'Epic' ? 's1-epic-cyber' : 's1-legendary-master'].nameId : tm.reward.item}</span>
                                      </div>
                                      <div className="flex justify-between text-[8px] text-slate-400">
                                        <span>✨ +{tm.reward.xp} XP</span>
                                        <span>🛡️ +{tm.reward.rep} REP</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-mono text-slate-400">
                                      <span>{tSeasonal.progress}</span>
                                      <span>
                                        {tm.current.toLocaleString()} / {tm.target.toLocaleString()} ({tm.percent}%)
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden border border-white/5">
                                      <div className={`h-1 rounded-full transition-all duration-500 ${progressStyle}`} style={{ width: `${tm.percent}%` }} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Seasonal Timeline Timeline Indicator */}
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <h4 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">{tSeasonal.season_timeline}</h4>
                          <div className="flex flex-col gap-2">
                            {SEASONS.map((s) => {
                              const isActive = s.status === 'active';
                              const badgeStyle = isActive 
                                ? 'bg-[#0052FF]/20 text-[#0052FF] border border-[#0052FF]/30' 
                                : 'bg-white/5 text-slate-400 border border-white/5 opacity-60';

                              return (
                                <div key={s.seasonId} className={`flex items-center justify-between p-2 rounded-lg text-[10px] font-mono ${badgeStyle}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold">S{s.seasonNumber}</span>
                                    <span className="text-white font-medium">{s.seasonName}</span>
                                  </div>
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5">
                                    {s.status === 'active' ? tSeasonal.active : tSeasonal.upcoming}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        </>
                        )}
                      </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* Active Progression Focus & Achievements Summary Card */}
                  {(() => {
                    const achievements = achievementService.getAchievements();
                    const totalAchievements = achievements.length;
                    const unlockedAchievements = achievements.filter(a => a.unlocked);
                    const unlockedCount = unlockedAchievements.length;
                    const percentAchievements = totalAchievements > 0 ? Math.min(100, Math.round((unlockedCount / totalAchievements) * 100)) : 0;

                    // Find next closest locked achievement based on progress percentage
                    const lockedAchievements = achievements.filter(a => !a.unlocked);
                    const closestLocked = lockedAchievements
                      .map(a => {
                        const pct = a.target > 0 ? Math.min(100, Math.round((a.progress / a.target) * 100)) : 0;
                        return { ...a, percent: pct };
                      })
                      .sort((a, b) => b.percent - a.percent)[0];

                    // Count by Rarity
                    const rarities: ('Common' | 'Rare' | 'Epic' | 'Legendary')[] = ['Common', 'Rare', 'Epic', 'Legendary'];
                    const rarityCounts = rarities.map(r => {
                      const total = achievements.filter(a => a.rarity === r).length;
                      const unlocked = achievements.filter(a => a.rarity === r && a.unlocked).length;
                      return { rarity: r, total, unlocked };
                    });

                    const tProgression = lang === 'id' ? {
                      section_title: "Fokus Progres Aktif",
                      section_subtitle: "Target jangka pendek dan status pencapaian Anda saat ini.",
                      current_goal_title: "Target Utama Saat Ini",
                      achievement_summary_title: "Ringkasan Pencapaian",
                      all_unlocked: "Semua Terbuka! 🎉",
                      all_unlocked_desc: "Anda telah membuka seluruh pencapaian. Anda adalah Master Builder sejati!",
                      closest_achievement: "Pencapaian Terdekat",
                      reward: "Hadiah",
                      unlocked_label: "Terbuka",
                      rarity_distribution: "Distribusi Rarity"
                    } : {
                      section_title: "Active Progression Focus",
                      section_subtitle: "Your current short-term target and overall achievement progress.",
                      current_goal_title: "Current Primary Goal",
                      achievement_summary_title: "Achievement Summary",
                      all_unlocked: "All Unlocked! 🎉",
                      all_unlocked_desc: "You have unlocked all achievements. You are a true Master Builder!",
                      closest_achievement: "Closest Achievement",
                      reward: "Reward",
                      unlocked_label: "Unlocked",
                      rarity_distribution: "Rarity Distribution"
                    };

                    return (
                      <div className="space-y-3">
                        <button
                          id="toggle-active-progression-btn"
                          onClick={() => {
                            sound.playMove();
                            setShowActiveProgression(!showActiveProgression);
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] border border-white/10 hover:bg-[#202d4a] transition-all text-white font-sans text-sm font-semibold shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Target size={16} className="text-[#0052FF]" />
                            <span>
                              {lang === 'id' ? 'Fokus Progres Aktif' : 'Active Progression Focus'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
                            <span>
                              {showActiveProgression 
                                ? (lang === 'id' ? 'Sembunyikan' : 'Hide Details') 
                                : (lang === 'id' ? 'Tampilkan' : 'Show Details')
                              }
                            </span>
                            {showActiveProgression ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {showActiveProgression && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 text-white p-5 shadow-lg overflow-hidden font-sans space-y-4">
                        {/* Background glows */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-[#0052FF]/10 rounded-full blur-2xl pointer-events-none"></div>

                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-1">
                          <div className="bg-[#0052FF]/25 border border-[#0052FF]/30 p-2 rounded-xl text-[#0052FF]">
                            <Target size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold font-sans text-white">{tProgression.section_title}</h3>
                            <p className="text-xs text-slate-400 font-sans mt-0.5">{tProgression.section_subtitle}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Column 1: Current Goal */}
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-between space-y-3">
                            <div>
                              <h4 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none mb-2">
                                {tProgression.current_goal_title}
                              </h4>
                              {closestLocked ? (
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2.5">
                                    <span className="text-2xl mt-0.5" role="img" aria-label="emoji">
                                      {closestLocked.emoji}
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-bold text-white leading-tight">
                                          {closestLocked.title}
                                        </span>
                                        <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                          closestLocked.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                          closestLocked.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                          closestLocked.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                          'bg-slate-500/20 text-slate-300 border border-white/10'
                                        }`}>
                                          {closestLocked.rarity}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                                        {lang === 'id' ? closestLocked.description : closestLocked.description}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Goal Rewards */}
                                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg text-[9px] font-mono text-slate-300 border border-white/5">
                                    <span className="text-slate-400">{tProgression.reward}:</span>
                                    <span className="text-[#0052FF] font-bold">+{closestLocked.rewardXp} XP</span>
                                    <span className="text-purple-400 font-bold">+{closestLocked.rewardReputation} REP</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 py-2 text-center sm:text-left">
                                  <div className="text-sm font-bold text-emerald-400">{tProgression.all_unlocked}</div>
                                  <p className="text-[10px] text-slate-400 leading-normal">
                                    {tProgression.all_unlocked_desc}
                                  </p>
                                </div>
                              )}
                            </div>

                            {closestLocked && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                  <span>{lang === 'id' ? 'Kemajuan' : 'Progress'}</span>
                                  <span>
                                    {closestLocked.progress} / {closestLocked.target} ({closestLocked.percent}%)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
                                  <div 
                                    className="bg-gradient-to-r from-[#0052FF] to-purple-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${closestLocked.percent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Column 2: Achievement Summary */}
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-between space-y-3">
                            <div>
                              <h4 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none mb-2">
                                {tProgression.achievement_summary_title}
                              </h4>
                              
                              {/* Summary bar */}
                              <div className="space-y-1 pb-2">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-slate-300 font-semibold">{tProgression.unlocked_label}</span>
                                  <span className="text-purple-300 font-bold">
                                    {unlockedCount} / {totalAchievements} ({percentAchievements}%)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-[#0052FF] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${percentAchievements}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Rarity Grid stats */}
                            <div className="space-y-2">
                              <div className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">
                                {tProgression.rarity_distribution}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {rarityCounts.map(rc => {
                                  let rcColor = 'text-slate-400';
                                  if (rc.rarity === 'Legendary') rcColor = 'text-yellow-400';
                                  else if (rc.rarity === 'Epic') rcColor = 'text-purple-400';
                                  else if (rc.rarity === 'Rare') rcColor = 'text-blue-400';

                                  return (
                                    <div key={rc.rarity} className="bg-white/5 rounded-lg p-1.5 px-2.5 border border-white/5 flex items-center justify-between">
                                      <span className={`text-[9px] font-bold font-sans ${rcColor}`}>{rc.rarity}</span>
                                      <span className="text-[10px] font-mono font-bold text-white">
                                        {rc.unlocked}/{rc.total}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* TIER 3: ADVANCED SYSTEM DATA (Collapsible Sections) */}
                  <div className="pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                          TIER 3 • ADVANCED SYSTEM DATA
                        </span>
                        <span className="text-xs font-sans text-slate-400 font-medium">
                          {lang === 'id' ? 'Statistik, Rekor, Ekonomi & Verifikasi' : 'Passport Stats, Records, Metadata & Verification'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">OPTIONAL</span>
                    </div>

                    <div className="space-y-4">
                    <button
                      id="toggle-advanced-stats-btn"
                      onClick={() => {
                        sound.playMove();
                        setShowAdvancedStats(!showAdvancedStats);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-sans text-sm font-semibold shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#0052FF]" />
                        <span>
                          {lang === 'id' ? 'Detail Statistik Paspor Builder' : 'Advanced Passport Statistics'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
                        <span>
                          {showAdvancedStats 
                            ? (lang === 'id' ? 'Sembunyikan' : 'Sembunyikan Detail') 
                            : (lang === 'id' ? 'Tampilkan' : 'Tampilkan Detail')
                          }
                        </span>
                        {showAdvancedStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {showAdvancedStats && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden space-y-4"
                        >
                          {/* Builder Passport Statistics Card */}
                          {(() => {
                            const passportData = passportService.getPassport();

                            const tStats = lang === 'id' ? {
                              title: "Statistik Paspor Builder",
                              subtitle: "Catatan performa permanen Anda yang teragregasi.",
                              total_mazes: "Total Labirin Selesai",
                              highest_score: "Skor Tertinggi",
                              fastest_time: "Waktu Tercepat",
                              achievements: "Pencapaian Terbuka",
                              quests: "Quest Selesai",
                              leaderboard: "Kehadiran Klasemen",
                              created_at: "Tanggal Dibuat",
                              last_active: "Terakhir Aktif",
                              personal_record: "Rekor Pribadi",
                              sec_suffix: "detik",
                              not_applicable: "Belum Ada"
                            } : {
                              title: "Builder Passport Statistics",
                              subtitle: "Your aggregated permanent performance record.",
                              total_mazes: "Total Mazes Completed",
                              highest_score: "Highest Score",
                              fastest_time: "Fastest Completion Time",
                              achievements: "Achievements Unlocked",
                              quests: "Quests Completed",
                              leaderboard: "Leaderboard Appearances",
                              created_at: "Account Created",
                              last_active: "Last Active",
                              personal_record: "Personal Record",
                              sec_suffix: "s",
                              not_applicable: "N/A"
                            };

                            const formatDate = (isoString: string) => {
                              if (!isoString) return tStats.not_applicable;
                              try {
                                const d = new Date(isoString);
                                return d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                });
                              } catch {
                                return tStats.not_applicable;
                              }
                            };

                            const formatTime = (seconds: number) => {
                              if (!seconds || seconds === Infinity) return tStats.not_applicable;
                              return `${seconds.toFixed(1)}${tStats.sec_suffix}`;
                            };

                            return (
                              <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 text-white p-5 shadow-lg overflow-hidden font-sans space-y-4">
                                {/* Background glows */}
                                <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#0052FF]/10 rounded-full blur-2xl pointer-events-none"></div>
                                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                {/* Card Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-1">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-[#0052FF]/20 border border-[#0052FF]/30 p-2 rounded-xl text-[#0052FF]">
                                      <Award size={20} />
                                    </div>
                                    <div>
                                      <h3 className="text-base font-bold font-sans text-white">{tStats.title}</h3>
                                      <p className="text-xs text-slate-400 font-sans mt-0.5">{tStats.subtitle}</p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => { sound.playMove(); setSimulatePassportEmpty(!simulatePassportEmpty); }}
                                    className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer self-start sm:self-auto ${
                                      simulatePassportEmpty
                                        ? 'bg-[#0052FF] border-[#0052FF] text-white shadow-md shadow-[#0052FF]/20'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                    }`}
                                    title="Toggle demo empty state for review"
                                  >
                                    {simulatePassportEmpty ? 'Live Stats' : 'Demo Empty'}
                                  </button>
                                </div>

                                {simulatePassportEmpty || passportData.totalMazesCompleted === 0 ? (
                                  <div className="bg-white/5 border border-white/5 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full border border-dashed border-blue-400/50 flex items-center justify-center text-blue-400 bg-blue-500/10 animate-pulse">
                                      <Award size={22} />
                                    </div>
                                    <div className="space-y-1.5">
                                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                        {lang === 'id' ? 'Paspor Bersih Baru' : 'Pristine Passport Node'}
                                      </h4>
                                      <p className="text-[11px] text-slate-300 max-w-sm leading-relaxed font-sans">
                                        {lang === 'id'
                                          ? 'Paspor digital Anda bersih dan murni. Saatnya mencapnya dengan catatan performa permanen pertamamu!'
                                          : 'Your digital passport is clean and pristine. Time to stamp it with your first permanent ecosystem transaction records!'
                                        }
                                      </p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 rounded-lg p-3 w-full max-w-xs text-left space-y-2">
                                      <span className="text-[9px] font-mono text-blue-300 uppercase tracking-wider block font-bold">
                                        {lang === 'id' ? 'Rekomendasi Tindakan:' : 'Recommended Action:'}
                                      </span>
                                      <p className="text-[10px] text-slate-400 font-sans leading-tight">
                                        {lang === 'id'
                                          ? 'Pilih salah satu tingkat kesulitan labirin di atas dan selesaikan tantangan untuk memicu stempel performa pertama Anda.'
                                          : 'Choose any maze difficulty level above and complete it to write permanent metrics to your node.'
                                        }
                                      </p>
                                      <button
                                        onClick={() => { sound.playMove(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="w-full mt-1.5 py-2 text-[10px] font-mono bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg border border-blue-500/20 shadow-md transition duration-150 cursor-pointer text-center"
                                      >
                                        {lang === 'id' ? 'Scroll ke Atas & Mainkan' : 'Scroll Up & Choose Difficulty'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* Metric Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {/* Total Mazes Completed */}
                                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <span className="text-[10px] font-semibold text-slate-400 font-sans">{tStats.total_mazes}</span>
                                    <div className="text-2xl font-bold font-mono text-[#0052FF] mt-2">
                                      {passportData.totalMazesCompleted}
                                    </div>
                                  </div>

                                  {/* Highest Score - HIGHLIGHTED AS PERSONAL RECORD */}
                                  <div className="relative bg-amber-500/5 border border-amber-500/30 p-3.5 rounded-xl flex flex-col justify-between hover:bg-amber-500/10 transition-colors group overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-300 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-bl">
                                      ★ {tStats.personal_record}
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 font-sans">{tStats.highest_score}</span>
                                    <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                                      {passportData.highestScore.toLocaleString()}
                                    </div>
                                  </div>

                                  {/* Fastest Completion Time - HIGHLIGHTED AS PERSONAL RECORD */}
                                  <div className="relative bg-cyan-500/5 border border-cyan-500/30 p-3.5 rounded-xl flex flex-col justify-between hover:bg-cyan-500/10 transition-colors group overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-300 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-bl">
                                      ⚡ {tStats.personal_record}
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 font-sans">{tStats.fastest_time}</span>
                                    <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
                                      {formatTime(passportData.fastestCompletionTime)}
                                    </div>
                                  </div>

                                  {/* Total Achievements */}
                                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <span className="text-[10px] font-semibold text-slate-400 font-sans">{tStats.achievements}</span>
                                    <div className="text-2xl font-bold font-mono text-purple-400 mt-2">
                                      {passportData.totalAchievements}
                                    </div>
                                  </div>

                                  {/* Total Quests Completed */}
                                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <span className="text-[10px] font-semibold text-slate-400 font-sans">{tStats.quests}</span>
                                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                                      {passportData.totalQuestsCompleted}
                                    </div>
                                  </div>

                                  {/* Leaderboard Appearances */}
                                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <span className="text-[10px] font-semibold text-slate-400 font-sans">{tStats.leaderboard}</span>
                                    <div className="text-2xl font-bold font-mono text-pink-400 mt-2">
                                      {passportData.leaderboardAppearances}
                                    </div>
                                  </div>
                                </div>

                                {/* Account Date Metadata */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-500" />
                                    <span>{tStats.created_at}:</span>
                                    <span className="text-slate-200 font-semibold">{formatDate(passportData.accountCreationDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-slate-500" />
                                    <span>{tStats.last_active}:</span>
                                    <span className="text-slate-200 font-semibold">{formatDate(passportData.lastActiveDate)}</span>
                                  </div>
                                </div>
                                </>
                                )}
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Layer 4: Help Guide & Glossary (Collapsible Section) */}
                  <div className="space-y-4">
                    <button
                      id="toggle-glossary-btn"
                      onClick={() => {
                        sound.playMove();
                        setShowGlossary(!showGlossary);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-sans text-sm font-semibold shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle size={16} className="text-[#0052FF]" />
                        <span>
                          {lang === 'id' ? 'Panduan Sistem & Glosarium' : 'System Guide & Glossary'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
                        <span>
                          {showGlossary 
                            ? (lang === 'id' ? 'Sembunyikan' : 'Sembunyikan Panduan') 
                            : (lang === 'id' ? 'Tampilkan' : 'Tampilkan Panduan')
                          }
                        </span>
                        {showGlossary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {showGlossary && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 text-white p-5 shadow-lg overflow-hidden font-sans space-y-4">
                            {/* Background glows */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#0052FF]/10 rounded-full blur-2xl pointer-events-none"></div>

                            {/* Card Header */}
                            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                              <div className="bg-[#0052FF]/20 border border-[#0052FF]/30 p-2 rounded-xl text-[#0052FF]">
                                <HelpCircle size={20} />
                              </div>
                              <div>
                                <h3 className="text-base font-bold font-sans text-white">
                                  {lang === 'id' ? 'Panduan Pengguna Baru & Glosarium' : 'First-Time User Guide & Glossary'}
                                </h3>
                                <p className="text-xs text-slate-400 font-sans mt-0.5">
                                  {lang === 'id' ? 'Pelajari cara kerja sistem reputasi, peringkat, sirkuit musim, dan mata uang permainan.' : 'Learn how reputation, ranks, seasonal tracks, and currencies function.'}
                                </p>
                              </div>
                            </div>

                            {/* Glossary Terms Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {/* Passport */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-blue-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <Award size={14} />
                                  <span>{translations[lang].glossary.passport_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.passport_desc}
                                </p>
                              </div>

                              {/* Reputation */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-amber-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <Sparkles size={14} />
                                  <span>{translations[lang].glossary.reputation_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.reputation_desc}
                                </p>
                              </div>

                              {/* Rank */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-purple-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <TrendingUp size={14} />
                                  <span>{translations[lang].glossary.rank_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.rank_desc}
                                </p>
                              </div>

                              {/* Season */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-emerald-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <Zap size={14} />
                                  <span>{translations[lang].glossary.season_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.season_desc}
                                </p>
                              </div>

                              {/* Bypass Keys */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-rose-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <ShieldCheck size={14} />
                                  <span>{translations[lang].glossary.bypass_key_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.bypass_key_desc}
                                </p>
                              </div>

                              {/* Special Keys */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-pink-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <Key size={14} />
                                  <span>{translations[lang].glossary.special_key_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.special_key_desc}
                                </p>
                              </div>

                              {/* Node ID */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <Cpu size={14} />
                                  <span>{translations[lang].glossary.node_id_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.node_id_desc}
                                </p>
                              </div>

                              {/* Achievements */}
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2 text-indigo-400 font-sans text-xs font-bold uppercase tracking-wider">
                                  <Activity size={14} />
                                  <span>{translations[lang].glossary.achievement_title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-normal">
                                  {translations[lang].glossary.achievement_desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Identity Protocol & Customizer Shop */}
                  <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-deep-navy/10 p-5 shadow-sm space-y-4 font-sans">
                    <div className="flex items-center gap-2 border-b border-deep-navy/10 pb-3">
                      <Sparkles className="text-[#0052FF]" size={16} />
                      <div>
                        <h4 className="font-serif font-bold text-sm text-deep-navy">
                          {lang === 'id' ? 'Protokol Identitas & Toko Kustomisasi' : 'Identity Protocol & Customizer Shop'}
                        </h4>
                        <p className="text-[10px] font-mono text-deep-navy/60 leading-none mt-1">
                          {lang === 'id' ? 'Sintesis nama dan avatar node Anda dengan Kunci Spesial! 🔑' : 'Synthesize your node name and avatar with Special Keys! 🔑'}
                        </p>
                      </div>
                    </div>

                    {/* Shop feedback logger */}
                    {shopFeedback && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-2.5 rounded-lg text-[10px] font-mono border ${
                          shopFeedback.isError 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        }`}
                      >
                        {shopFeedback.text}
                      </motion.div>
                    )}

                    <div className="space-y-4 text-xs">
                      {/* Section 1: Username changing */}
                      <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-slate-50 border border-deep-navy/5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-deep-navy">
                            {lang === 'id' ? 'Ubah Handle @Username' : 'Change @Username Handle'}
                          </span>
                          <span className="text-[10px] font-mono text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            {lang === 'id' ? 'Biaya' : 'Cost'}: 2 <Key size={10} className="inline" />
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value.trim().substring(0, 20))}
                            placeholder="@cyber_netrunner"
                            className="flex-1 bg-white border border-deep-navy/10 rounded-lg px-3 py-1.5 font-mono text-xs text-deep-navy focus:outline-none focus:border-[#0052FF]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              sound.playMove();
                              if (usernameInput === customUsername) {
                                setShopFeedback({ text: lang === 'id' ? 'Handle tidak berubah.' : 'Handle is unchanged.', isError: true });
                                return;
                              }
                              if (specialTokens < 2) {
                                setShopFeedback({ text: lang === 'id' ? 'Kunci Spesial tidak cukup! Selesaikan Quest untuk mendapatkan lebih banyak.' : 'Insufficient Special Keys! Complete Quests to earn more.', isError: true });
                                return;
                              }
                              setSpecialTokens(prev => prev - 2);
                              setCustomUsername(usernameInput);
                              setShopFeedback({ text: lang === 'id' ? 'Protocol Success: Handle identitas berhasil diperbarui!' : 'Protocol Success: Identity handle updated successfully!', isError: false });
                              setTimeout(() => setShopFeedback(null), 4000);
                            }}
                            className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            {lang === 'id' ? 'MINT' : 'MINT'}
                          </button>
                        </div>
                      </div>

                      {/* Section 2: PFP Bind */}
                      <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-slate-50 border border-deep-navy/5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-deep-navy">
                            {lang === 'id' ? 'Ikat PFP Gambar Kustom' : 'Bind Custom Image PFP'}
                          </span>
                          <span className="text-[10px] font-mono text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            {lang === 'id' ? 'Biaya' : 'Cost'}: 3 <Key size={10} className="inline" />
                          </span>
                        </div>
                        <p className="text-[10px] text-deep-navy/60 leading-tight">
                          {lang === 'id' ? 'Tempel tautan URL gambar kustom (HTTPS) untuk dijadikan avatar passport dan karakter sirkuit Anda.' : 'Paste any custom web image URL (HTTPS) to customize your passport avatar and in-game token.'}
                        </p>
                        <div className="flex gap-2 items-center">
                          <input 
                            type="text"
                            value={pfpInput}
                            onChange={(e) => setPfpInput(e.target.value.trim())}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="flex-1 bg-white border border-deep-navy/10 rounded-lg px-3 py-1.5 font-mono text-xs text-deep-navy focus:outline-none focus:border-[#0052FF]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              sound.playMove();
                              if (!pfpInput) {
                                setShopFeedback({ text: lang === 'id' ? 'Masukkan URL gambar yang valid.' : 'Please enter a valid image URL.', isError: true });
                                return;
                              }
                              if (pfpInput === customPfp) {
                                setShopFeedback({ text: lang === 'id' ? 'Tautan PFP identik.' : 'PFP URL is identical.', isError: true });
                                return;
                              }
                              if (specialTokens < 3) {
                                setShopFeedback({ text: lang === 'id' ? 'Kunci Spesial tidak cukup!' : 'Insufficient Special Keys!', isError: true });
                                return;
                              }
                              setSpecialTokens(prev => prev - 3);
                              setCustomPfp(pfpInput);
                              setShopFeedback({ text: lang === 'id' ? 'Protocol Success: PFP terikat ke sirkuit permainan!' : 'Protocol Success: PFP bound to game token!', isError: false });
                              setTimeout(() => setShopFeedback(null), 4000);
                            }}
                            className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            {lang === 'id' ? 'IKAT' : 'BIND'}
                          </button>
                        </div>
                        {customPfp && (
                          <div className="flex items-center justify-between border-t border-deep-navy/5 pt-2 mt-1">
                            <span className="text-[9px] font-mono text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Active Custom PFP
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playMove();
                                setCustomPfp('');
                                setPfpInput('');
                                setShopFeedback({ text: lang === 'id' ? 'Custom PFP dihapus.' : 'Custom PFP reset to default.', isError: false });
                                setTimeout(() => setShopFeedback(null), 3000);
                              }}
                              className="text-rose-500 hover:text-rose-700 font-mono text-[10px] underline cursor-pointer"
                            >
                              {lang === 'id' ? 'Reset Default (Gratis)' : 'Reset Default (Free)'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Section 3: Skins Shop */}
                      <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-slate-50 border border-deep-navy/5">
                        <span className="font-bold text-deep-navy">
                          {lang === 'id' ? 'Toko Karakter Premium' : 'Premium Character Skins'}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'default', name: lang === 'id' ? 'Classic Core 🔵' : 'Classic Core 🔵', emoji: '🔵', cost: 0 },
                            { id: 'cyberpunk', name: lang === 'id' ? 'Cyberpunk 👾' : 'Cyberpunk 👾', emoji: '👾', cost: 5 },
                            { id: 'netrunner', name: lang === 'id' ? 'Netrunner 🤖' : 'Netrunner 🤖', emoji: '🤖', cost: 10 },
                            { id: 'spaceman', name: lang === 'id' ? 'Spaceman 👨‍🚀' : 'Spaceman 👨‍🚀', emoji: '👨‍🚀', cost: 15 },
                            { id: 'shuttle', name: lang === 'id' ? 'L2 Shuttle 🚀' : 'L2 Shuttle 🚀', emoji: '🚀', cost: 20 },
                            { id: 'diamond', name: lang === 'id' ? 'Validator 💎' : 'Validator 💎', emoji: '💎', cost: 30 }
                          ].map((skin) => {
                            const isUnlocked = unlockedSkins.includes(skin.id);
                            const isActive = activeSkin === skin.id;

                            return (
                              <div 
                                key={skin.id}
                                className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                                  isActive
                                    ? 'bg-cloud-white border-[#0052FF] shadow-sm'
                                    : 'bg-white border-deep-navy/5 hover:border-deep-navy/15'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-inner">
                                    {skin.emoji}
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-deep-navy leading-tight">
                                      {skin.name}
                                    </div>
                                    <div className="text-[8px] font-mono text-[#0052FF] font-bold leading-none mt-0.5">
                                      {skin.cost === 0 ? 'Free' : `${skin.cost} 🔑`}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-2.5">
                                  {isActive ? (
                                    <div className="w-full text-center text-[#0052FF] bg-[#0052FF]/10 text-[9px] font-mono font-bold py-1 rounded">
                                      {lang === 'id' ? 'AKTIF' : 'ACTIVE'}
                                    </div>
                                  ) : isUnlocked ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        sound.playMove();
                                        setActiveSkin(skin.id);
                                        setShopFeedback({ text: lang === 'id' ? `Skin diubah ke ${skin.name}!` : `Character skin changed to ${skin.name}!`, isError: false });
                                        setTimeout(() => setShopFeedback(null), 3000);
                                      }}
                                      className="w-full text-center text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 text-[9px] font-mono font-bold py-1 rounded cursor-pointer transition"
                                    >
                                      {lang === 'id' ? 'PILIH' : 'SELECT'}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        sound.playMove();
                                        if (specialTokens < skin.cost) {
                                          setShopFeedback({ text: lang === 'id' ? `Kunci Spesial tidak cukup untuk membuka ${skin.name}!` : `Insufficient Special Keys to unlock ${skin.name}!`, isError: true });
                                          return;
                                        }
                                        setSpecialTokens(prev => prev - skin.cost);
                                        const nextUnlocked = [...unlockedSkins, skin.id];
                                        setUnlockedSkins(nextUnlocked);
                                        localStorage.setItem('base_maze_unlocked_skins', JSON.stringify(nextUnlocked));
                                        setActiveSkin(skin.id);
                                        setShopFeedback({ text: lang === 'id' ? `Protocol Success: Berhasil membuka ${skin.name}!` : `Protocol Success: Unlocked ${skin.name}!`, isError: false });
                                        setTimeout(() => setShopFeedback(null), 4000);
                                      }}
                                      className="w-full text-center text-white bg-[#0052FF] hover:bg-[#0052FF]/90 text-[9px] font-mono font-bold py-1 rounded cursor-pointer transition flex items-center justify-center gap-0.5"
                                    >
                                      <span>UNLOCK</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
