import { getBuilderRank } from '../utils/reputationUtils';
import { analyticsService } from './analyticsService';

export type AchievementCategory =
  | 'Speed'
  | 'Exploration'
  | 'Completion'
  | 'Quest'
  | 'Reputation'
  | 'Leaderboard'
  | 'Seasonal';

export type AchievementRarity =
  | 'Common'
  | 'Rare'
  | 'Epic'
  | 'Legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt: string | null;
  rewardXp: number;
  rewardReputation: number;
  emoji: string;
  color: string;
}

export interface AchievementSnapshot {
  achievementId: string;
  rarity: AchievementRarity;
  unlockedAt: string;
  reputationReward: number;
}

// Full schema metadata mapping for all achievements
export const ACHIEVEMENT_METADATA: Record<string, Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>> = {
  'speedster': {
    id: 'speedster',
    title: 'Speedster',
    description: 'Selesai dalam < 15 detik',
    category: 'Speed',
    rarity: 'Common',
    target: 1,
    rewardXp: 100,
    rewardReputation: 50,
    emoji: '⚡',
    color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  },
  'speed-demon': {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Selesai dalam < 6 detik',
    category: 'Speed',
    rarity: 'Rare',
    target: 1,
    rewardXp: 250,
    rewardReputation: 100,
    emoji: '🚀',
    color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
  },
  'explorer': {
    id: 'explorer',
    title: 'Chain Explorer',
    description: 'Selesaikan tingkat Standard',
    category: 'Exploration',
    rarity: 'Common',
    target: 1,
    rewardXp: 100,
    rewardReputation: 50,
    emoji: '🔍',
    color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
  },
  'batch-master': {
    id: 'batch-master',
    title: 'Batch Master',
    description: 'Selesaikan tingkat Batch',
    category: 'Completion',
    rarity: 'Rare',
    target: 1,
    rewardXp: 200,
    rewardReputation: 100,
    emoji: '📦',
    color: 'bg-[#0052FF]/10 text-blue-400 border border-[#0052FF]/20'
  },
  'superchain-overlord': {
    id: 'superchain-overlord',
    title: 'Superchain Overlord',
    description: 'Selesaikan tingkat Superchain',
    category: 'Completion',
    rarity: 'Epic',
    target: 1,
    rewardXp: 500,
    rewardReputation: 150,
    emoji: '👑',
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
  },
  'gas-optimizer': {
    id: 'gas-optimizer',
    title: 'Gas Optimizer',
    description: 'Gas super hemat (<= 10 Gwei)',
    category: 'Exploration',
    rarity: 'Common',
    target: 1,
    rewardXp: 150,
    rewardReputation: 50,
    emoji: '🍃',
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  },
  'wall-breaker': {
    id: 'wall-breaker',
    title: 'Wall Breaker',
    description: 'Hancurkan dinding firewall',
    category: 'Exploration',
    rarity: 'Common',
    target: 1,
    rewardXp: 100,
    rewardReputation: 50,
    emoji: '🔨',
    color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
  },
  'no-hints': {
    id: 'no-hints',
    title: 'No Hints',
    description: 'Selesai tanpa petunjuk rute',
    category: 'Exploration',
    rarity: 'Rare',
    target: 1,
    rewardXp: 150,
    rewardReputation: 75,
    emoji: '🧠',
    color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
  },
  // Additional rich achievements to cover other specified categories!
  'quest-apprentice': {
    id: 'quest-apprentice',
    title: 'Quest Apprentice',
    description: 'Selesaikan 3 quest ekosistem',
    category: 'Quest',
    rarity: 'Common',
    target: 3,
    rewardXp: 150,
    rewardReputation: 50,
    emoji: '📜',
    color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
  },
  'elite-validator': {
    id: 'elite-validator',
    title: 'Elite Validator',
    description: 'Capai reputasi validator 1000+',
    category: 'Reputation',
    rarity: 'Rare',
    target: 1000,
    rewardXp: 300,
    rewardReputation: 100,
    emoji: '🛡️',
    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  },
  'leaderboard-contender': {
    id: 'leaderboard-contender',
    title: 'Leaderboard Contender',
    description: 'Daftarkan nama Anda di Leaderboard',
    category: 'Leaderboard',
    rarity: 'Epic',
    target: 1,
    rewardXp: 250,
    rewardReputation: 75,
    emoji: '📊',
    color: 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
  },
  'seasonal-explorer': {
    id: 'seasonal-explorer',
    title: 'Seasonal Explorer',
    description: 'Berpartisipasi dalam ajang musim perdana',
    category: 'Seasonal',
    rarity: 'Legendary',
    target: 1,
    rewardXp: 500,
    rewardReputation: 200,
    emoji: '🌌',
    color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
  },
  'lightning-prover': {
    id: 'lightning-prover',
    title: 'Lightning Prover',
    description: 'Selesaikan labirin dalam < 3 detik',
    category: 'Speed',
    rarity: 'Epic',
    target: 1,
    rewardXp: 400,
    rewardReputation: 150,
    emoji: '⚡',
    color: 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
  },
  'chapter-architect': {
    id: 'chapter-architect',
    title: 'Chapter Architect',
    description: 'Buka 10 level mode campaign',
    category: 'Completion',
    rarity: 'Epic',
    target: 10,
    rewardXp: 350,
    rewardReputation: 125,
    emoji: '🏗️',
    color: 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
  },
  'superchain-pioneer': {
    id: 'superchain-pioneer',
    title: 'Superchain Pioneer',
    description: 'Mencapai level 50 mode campaign',
    category: 'Exploration',
    rarity: 'Legendary',
    target: 50,
    rewardXp: 750,
    rewardReputation: 300,
    emoji: '🌐',
    color: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
  },
  'quest-master': {
    id: 'quest-master',
    title: 'Quest Master',
    description: 'Selesaikan 5 quest ekosistem',
    category: 'Quest',
    rarity: 'Epic',
    target: 5,
    rewardXp: 450,
    rewardReputation: 175,
    emoji: '🎖️',
    color: 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
  },
  'reputation-titan': {
    id: 'reputation-titan',
    title: 'Reputation Titan',
    description: 'Capai reputasi 5,000+ (Master Builder)',
    category: 'Reputation',
    rarity: 'Legendary',
    target: 5000,
    rewardXp: 1000,
    rewardReputation: 500,
    emoji: '🏛️',
    color: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30'
  },
  'zen-master': {
    id: 'zen-master',
    title: 'Zen Master',
    description: 'Selesaikan labirin dalam Zen Mode',
    category: 'Exploration',
    rarity: 'Rare',
    target: 1,
    rewardXp: 200,
    rewardReputation: 80,
    emoji: '🧘',
    color: 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
  },
  'faucet-frequenter': {
    id: 'faucet-frequenter',
    title: 'Faucet Frequenter',
    description: 'Klaim token testnet Faucet 3 kali',
    category: 'Exploration',
    rarity: 'Rare',
    target: 3,
    rewardXp: 250,
    rewardReputation: 100,
    emoji: '💧',
    color: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
  },
  'streak-legend': {
    id: 'streak-legend',
    title: 'Streak Legend',
    description: 'Check-in harian berturut-turut selama 7 hari',
    category: 'Seasonal',
    rarity: 'Epic',
    target: 7,
    rewardXp: 600,
    rewardReputation: 250,
    emoji: '🔥',
    color: 'bg-orange-500/10 text-orange-300 border border-orange-500/30'
  }
};

export const achievementService = {
  /**
   * Retrieves all achievements with their current user progress.
   * Auto-syncs and backfills achievements from existing Game States to guarantee backward compatibility.
   */
  getAchievements(): Achievement[] {
    const saved = localStorage.getItem('base_maze_achievements_v1');
    let userProgress: Record<string, { progress: number; unlocked: boolean; unlockedAt: string | null }> = {};

    if (saved) {
      try {
        userProgress = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse achievement progress", e);
      }
    }

    // Auto-sync / backfill from existing structures to guarantee 100% backward compatibility
    let isModified = false;

    // 1. Core Badges from local scores
    const scoresStr = localStorage.getItem('base_maze_scores');
    const userUnlockedBadges = new Set<string>();
    let username = localStorage.getItem('base_maze_custom_username') || localStorage.getItem('base_maze_player_name') || '';

    if (scoresStr) {
      try {
        const scores = JSON.parse(scoresStr);
        if (Array.isArray(scores)) {
          scores.forEach((s: any) => {
            const isSeed = s.id && typeof s.id === 'string' && s.id.startsWith('seed-');
            if (!isSeed && s.badges && Array.isArray(s.badges)) {
              s.badges.forEach((b: string) => userUnlockedBadges.add(b));
            }
          });
        }
      } catch (e) {
        console.error("Error backfilling scores for achievements", e);
      }
    }

    // Backfill standard 8 badges
    userUnlockedBadges.forEach((badgeId) => {
      if (ACHIEVEMENT_METADATA[badgeId]) {
        if (!userProgress[badgeId] || !userProgress[badgeId].unlocked) {
          userProgress[badgeId] = {
            progress: 1,
            unlocked: true,
            unlockedAt: new Date().toISOString()
          };
          isModified = true;
        }
      }
    });

    // 2. Quest Achievements Progress
    const questsStr = localStorage.getItem('base_maze_quests_v1');
    if (questsStr) {
      try {
        const quests = JSON.parse(questsStr);
        if (Array.isArray(quests)) {
          const completedCount = quests.filter((q: any) => q.completed).length;
          const questAchievementId = 'quest-apprentice';
          const target = ACHIEVEMENT_METADATA[questAchievementId].target;
          
          if (!userProgress[questAchievementId]) {
            userProgress[questAchievementId] = {
              progress: completedCount,
              unlocked: completedCount >= target,
              unlockedAt: completedCount >= target ? new Date().toISOString() : null
            };
            isModified = true;
          } else if (userProgress[questAchievementId].progress !== completedCount) {
            userProgress[questAchievementId].progress = completedCount;
            if (completedCount >= target && !userProgress[questAchievementId].unlocked) {
              userProgress[questAchievementId].unlocked = true;
              userProgress[questAchievementId].unlockedAt = new Date().toISOString();
            }
            isModified = true;
          }
        }
      } catch (e) {
        console.error("Error backfilling quests for achievements", e);
      }
    }

    // 3. Reputation Achievement Progress
    const reputation = Number(localStorage.getItem('base_maze_reputation') || '0');
    const repAchievementId = 'elite-validator';
    const repTarget = ACHIEVEMENT_METADATA[repAchievementId].target;
    if (!userProgress[repAchievementId]) {
      userProgress[repAchievementId] = {
        progress: reputation,
        unlocked: reputation >= repTarget,
        unlockedAt: reputation >= repTarget ? new Date().toISOString() : null
      };
      isModified = true;
    } else if (userProgress[repAchievementId].progress !== reputation) {
      userProgress[repAchievementId].progress = reputation;
      if (reputation >= repTarget && !userProgress[repAchievementId].unlocked) {
        userProgress[repAchievementId].unlocked = true;
        userProgress[repAchievementId].unlockedAt = new Date().toISOString();
      }
      isModified = true;
    }

    // 4. Leaderboard Achievement Progress
    const participatedInLeaderboard = localStorage.getItem('base_maze_reputation_leaderboard_participated') === 'true';
    const lbAchievementId = 'leaderboard-contender';
    if (participatedInLeaderboard) {
      if (!userProgress[lbAchievementId] || !userProgress[lbAchievementId].unlocked) {
        userProgress[lbAchievementId] = {
          progress: 1,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        isModified = true;
      }
    }

    // Construct full achievement list combining metadata and user progress
    const achievements: Achievement[] = Object.keys(ACHIEVEMENT_METADATA).map((id) => {
      const meta = ACHIEVEMENT_METADATA[id];
      const prog = userProgress[id] || { progress: 0, unlocked: false, unlockedAt: null };
      return {
        ...meta,
        progress: Math.min(meta.target, prog.progress),
        unlocked: prog.unlocked,
        unlockedAt: prog.unlockedAt
      };
    });

    if (isModified) {
      localStorage.setItem('base_maze_achievements_v1', JSON.stringify(userProgress));
    }

    return achievements;
  },

  /**
   * Retrieves all achievements that have been unlocked by the player.
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAchievements().filter(a => a.unlocked);
  },

  /**
   * Retrieves a single achievement with user progress by its ID.
   */
  getAchievementById(id: string): Achievement | null {
    const list = this.getAchievements();
    return list.find(a => a.id === id) || null;
  },

  /**
   * Unlocks an achievement directly, triggering callbacks and logging reward distributions.
   */
  unlockAchievement(id: string, onUnlockCallback?: (achievement: Achievement) => void): Achievement | null {
    const achievements = this.getAchievements();
    const achievement = achievements.find(a => a.id === id);
    if (!achievement) return null;
    if (achievement.unlocked) return achievement;

    // Load progress store
    const saved = localStorage.getItem('base_maze_achievements_v1');
    let userProgress: Record<string, { progress: number; unlocked: boolean; unlockedAt: string | null }> = {};
    if (saved) {
      try {
        userProgress = JSON.parse(saved);
      } catch (e) {}
    }

    // Set as fully unlocked
    const unlockedTime = new Date().toISOString();
    userProgress[id] = {
      progress: achievement.target,
      unlocked: true,
      unlockedAt: unlockedTime
    };

    localStorage.setItem('base_maze_achievements_v1', JSON.stringify(userProgress));
    analyticsService.trackAchievementUnlock(1);

    const updatedAchievement: Achievement = {
      ...achievement,
      progress: achievement.target,
      unlocked: true,
      unlockedAt: unlockedTime
    };

    if (onUnlockCallback) {
      onUnlockCallback(updatedAchievement);
    }

    return updatedAchievement;
  },

  /**
   * Increments or sets the progress score of an achievement.
   */
  updateAchievementProgress(id: string, progress: number, onUnlockCallback?: (achievement: Achievement) => void): Achievement | null {
    const achievement = this.getAchievementById(id);
    if (!achievement) return null;
    if (achievement.unlocked) return achievement;

    const saved = localStorage.getItem('base_maze_achievements_v1');
    let userProgress: Record<string, { progress: number; unlocked: boolean; unlockedAt: string | null }> = {};
    if (saved) {
      try {
        userProgress = JSON.parse(saved);
      } catch (e) {}
    }

    const nextProgress = Math.min(achievement.target, progress);
    const isNowUnlocked = nextProgress >= achievement.target;

    userProgress[id] = {
      progress: nextProgress,
      unlocked: isNowUnlocked,
      unlockedAt: isNowUnlocked ? new Date().toISOString() : null
    };

    localStorage.setItem('base_maze_achievements_v1', JSON.stringify(userProgress));

    const updatedAchievement: Achievement = {
      ...achievement,
      progress: nextProgress,
      unlocked: isNowUnlocked,
      unlockedAt: isNowUnlocked ? new Date().toISOString() : null
    };

    if (isNowUnlocked && onUnlockCallback) {
      onUnlockCallback(updatedAchievement);
    }

    return updatedAchievement;
  },

  /**
   * Alias for getAchievements
   */
  getAll(): Achievement[] {
    return this.getAchievements();
  },

  /**
   * Generates analytical statistics of the achievement system.
   */
  getAchievementStats() {
    const list = this.getAchievements();
    const total = list.length;
    const unlocked = list.filter(a => a.unlocked).length;
    const locked = total - unlocked;
    const percentCompleted = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    // Breakdowns
    const byRarity: Record<AchievementRarity, { total: number; unlocked: number }> = {
      Common: { total: 0, unlocked: 0 },
      Rare: { total: 0, unlocked: 0 },
      Epic: { total: 0, unlocked: 0 },
      Legendary: { total: 0, unlocked: 0 }
    };

    const byCategory: Record<AchievementCategory, { total: number; unlocked: number }> = {
      Speed: { total: 0, unlocked: 0 },
      Exploration: { total: 0, unlocked: 0 },
      Completion: { total: 0, unlocked: 0 },
      Quest: { total: 0, unlocked: 0 },
      Reputation: { total: 0, unlocked: 0 },
      Leaderboard: { total: 0, unlocked: 0 },
      Seasonal: { total: 0, unlocked: 0 }
    };

    list.forEach((a) => {
      byRarity[a.rarity].total++;
      if (a.unlocked) byRarity[a.rarity].unlocked++;

      byCategory[a.category].total++;
      if (a.unlocked) byCategory[a.category].unlocked++;
    });

    return {
      total,
      unlocked,
      locked,
      percentCompleted,
      byRarity,
      byCategory
    };
  },

  /**
   * Decoupled snapshot of unlocked achievements prepared for decentralized validation
   */
  exportAchievementSnapshots(): AchievementSnapshot[] {
    const list = this.getAchievements();
    return list
      .filter(a => a.unlocked)
      .map(a => ({
        achievementId: a.id,
        rarity: a.rarity,
        unlockedAt: a.unlockedAt || new Date().toISOString(),
        reputationReward: a.rewardReputation
      }));
  }
};
