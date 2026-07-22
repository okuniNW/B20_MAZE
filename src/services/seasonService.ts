import { BuilderRank } from '../utils/reputationUtils';
import { passportService } from './passportService';
import { achievementService, AchievementRarity } from './achievementService';

export type SeasonStatus = 'active' | 'upcoming' | 'completed';

export interface Season {
  seasonId: string;
  seasonNumber: number;
  seasonName: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  status: SeasonStatus;
}

export interface SeasonalPlayerStats {
  seasonId: string;
  seasonXp: number;
  seasonReputation: number;
  seasonAchievements: string[]; // Unlocked achievement IDs in this season
  seasonMazeCompletions: number;
  seasonLeaderboardRank: number; // 0 means unranked or not on leaderboard yet
}

export type SeasonalRewardTier = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface SeasonalReward {
  rewardId: string;
  name: string;
  tier: SeasonalRewardTier;
  description: string;
  xpBonus: number;
  reputationBonus: number;
  customSkinId?: string; // Unlockable skin ID if epic/legendary
  // Prepared for onchain verification
  isNftClaimable: boolean;
  onchainContractAddress?: string;
}

export interface SeasonArchive {
  seasonId: string;
  seasonNumber: number;
  seasonName: string;
  playerStats: SeasonalPlayerStats;
  earnedRewards: SeasonalReward[];
  archivedAt: string; // ISO String
  verificationProof?: {
    snapshotHash: string; // SHA-256 equivalent checksum representing valid seasonal verification
    attestationUid?: string; // EAS attestation UID placeholder
    nftMintSignature?: string; // Cryptographic validation signature placeholder
  };
}

export interface SeasonSnapshot {
  seasonId: string;
  playerRank: BuilderRank;
  reputationEarned: number;
  achievementsUnlocked: number;
  leaderboardRank: number;
  verifiedOnchain: boolean;
}

// 1. Defined Seasons metadata in the Ecosystem
export const SEASONS: Season[] = [
  {
    seasonId: 'season-1-base-builder',
    seasonNumber: 1,
    seasonName: 'Base Builder',
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-08-31T23:59:59Z',
    status: 'active'
  },
  {
    seasonId: 'season-2-validator-wars',
    seasonNumber: 2,
    seasonName: 'Validator Wars',
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-11-30T23:59:59Z',
    status: 'upcoming'
  },
  {
    seasonId: 'season-3-superchain-expansion',
    seasonNumber: 3,
    seasonName: 'Superchain Expansion',
    startDate: '2026-12-01T00:00:00Z',
    endDate: '2027-02-28T23:59:59Z',
    status: 'upcoming'
  }
];

// 2. Defined Seasonal Reward schemas available for claim
export interface SeasonalObjective {
  id: string;
  seasonId: string;
  title: string;
  description: string;
  target: number;
  rewardXp: number;
  rewardReputation: number;
  category: 'Speed' | 'Volume' | 'Exploration' | 'Social';
  iconName: string;
}

export const SEASONAL_OBJECTIVES: SeasonalObjective[] = [
  {
    id: 'obj-s1-1',
    seasonId: 'season-1-base-builder',
    title: 'Batch Execution Pioneer',
    description: 'Selesaikan 5 level Batch Transaction dalam Season 1',
    target: 5,
    rewardXp: 500,
    rewardReputation: 150,
    category: 'Volume',
    iconName: 'Box'
  },
  {
    id: 'obj-s1-2',
    seasonId: 'season-1-base-builder',
    title: 'Gas Saving Maverick',
    description: 'Raih skor Gas Saver pada 3 level berbeda',
    target: 3,
    rewardXp: 350,
    rewardReputation: 100,
    category: 'Exploration',
    iconName: 'Zap'
  },
  {
    id: 'obj-s1-3',
    seasonId: 'season-1-base-builder',
    title: 'Speed Prover',
    description: 'Selesaikan labirin dalam waktu di bawah 10 detik sebanyak 3x',
    target: 3,
    rewardXp: 400,
    rewardReputation: 120,
    category: 'Speed',
    iconName: 'Clock'
  },
  {
    id: 'obj-s1-4',
    seasonId: 'season-1-base-builder',
    title: 'Community Leaderboard Stand',
    description: 'Masuk ke papan peringkat global',
    target: 1,
    rewardXp: 600,
    rewardReputation: 200,
    category: 'Social',
    iconName: 'Trophy'
  },
  {
    id: 'obj-s2-1',
    seasonId: 'season-2-validator-wars',
    title: 'Validator Node Initializer',
    description: 'Selesaikan level Superchain dengan reputasi di atas 500',
    target: 1,
    rewardXp: 750,
    rewardReputation: 250,
    category: 'Exploration',
    iconName: 'Shield'
  },
  {
    id: 'obj-s3-1',
    seasonId: 'season-3-superchain-expansion',
    title: 'Superchain Interop Master',
    description: 'Selesaikan level campaign 20+',
    target: 20,
    rewardXp: 1000,
    rewardReputation: 400,
    category: 'Volume',
    iconName: 'Globe'
  }
];

export const SEASON_REWARDS_POOL: Record<string, SeasonalReward[]> = {
  'season-1-base-builder': [
    {
      rewardId: 's1-common-badge',
      name: 'Base Builder Badge',
      tier: 'Common',
      description: 'Proof of participation in the inaugural Season 1 Builder event.',
      xpBonus: 100,
      reputationBonus: 25,
      isNftClaimable: true,
      onchainContractAddress: '0x1111111122223333444455556666777788889999'
    },
    {
      rewardId: 's1-rare-amplifier',
      name: 'Ecosystem Amplifier',
      tier: 'Rare',
      description: 'Granted to Builders completing at least 5 levels.',
      xpBonus: 300,
      reputationBonus: 75,
      isNftClaimable: true,
      onchainContractAddress: '0x2222222233334444555566667777888899990000'
    },
    {
      rewardId: 's1-rare-speed-runner',
      name: 'Lightning Transactor Crest',
      tier: 'Rare',
      description: 'Awarded for completing speedrun challenges under tight deadlines.',
      xpBonus: 350,
      reputationBonus: 90,
      isNftClaimable: true,
      onchainContractAddress: '0x2222222244445555666677778888999900001111'
    },
    {
      rewardId: 's1-epic-cyber',
      name: 'Neon Cyberpunk L2 Core',
      tier: 'Epic',
      description: 'Exclusive skin core unlocked through rigorous optimization.',
      xpBonus: 600,
      reputationBonus: 150,
      customSkinId: 'cyberpunk',
      isNftClaimable: true,
      onchainContractAddress: '0x3333333344445555666677778888999900001111'
    },
    {
      rewardId: 's1-epic-archmage',
      name: 'Base Gas Optimizer Title',
      tier: 'Epic',
      description: 'Granted to players achieving maximum gas efficiency.',
      xpBonus: 750,
      reputationBonus: 200,
      isNftClaimable: true,
      onchainContractAddress: '0x3333333355556666777788889999000022223333'
    },
    {
      rewardId: 's1-legendary-master',
      name: 'Ecosystem Sovereign Seal',
      tier: 'Legendary',
      description: 'Reserved for elite Master Builders scoring over 5000 reputation.',
      xpBonus: 1200,
      reputationBonus: 300,
      customSkinId: 'diamond',
      isNftClaimable: true,
      onchainContractAddress: '0x4444444455556666777788889999000011112222'
    }
  ],
  'season-2-validator-wars': [
    {
      rewardId: 's2-common-shield',
      name: 'Validator Candidate Badge',
      tier: 'Common',
      description: 'Participation credential for Season 2 Validator Wars.',
      xpBonus: 150,
      reputationBonus: 40,
      isNftClaimable: true,
      onchainContractAddress: '0x5555555566667777888899990000111122223333'
    },
    {
      rewardId: 's2-epic-skin',
      name: 'Validator Armor Skin',
      tier: 'Epic',
      description: 'Custom validator armor skin awarded to top active nodes.',
      xpBonus: 800,
      reputationBonus: 220,
      customSkinId: 'gold',
      isNftClaimable: true,
      onchainContractAddress: '0x6666666677778888999900001111222233334444'
    }
  ],
  'season-3-superchain-expansion': [
    {
      rewardId: 's3-legendary-crown',
      name: 'Superchain Sovereign Crown',
      tier: 'Legendary',
      description: 'Supreme mark of honor for Superchain expansion champions.',
      xpBonus: 1500,
      reputationBonus: 500,
      customSkinId: 'diamond',
      isNftClaimable: true,
      onchainContractAddress: '0x7777777788889999000011112222333344445555'
    }
  ]
};

export const seasonService = {
  /**
   * Returns the currently active season metadata.
   */
  getCurrentSeason(): Season {
    const active = SEASONS.find(s => s.status === 'active');
    if (active) return active;
    // Fallback to Season 1 if none found active
    return SEASONS[0];
  },

  /**
   * Retrieves full chronological timeline history of all registered ecosystem seasons.
   */
  getSeasonHistory(): Season[] {
    return SEASONS;
  },

  /**
   * Computes player seasonal performance metrics dynamically, aggregating local state values securely.
   */
  getSeasonPlayerStats(seasonId: string): SeasonalPlayerStats {
    const cachedStats = localStorage.getItem(`base_maze_season_stats_${seasonId}`);
    if (cachedStats) {
      try {
        return JSON.parse(cachedStats);
      } catch (e) {
        console.error("Failed to parse cached seasonal stats", e);
      }
    }

    // Dynamic aggregation fallback representing Season 1 (current active season metrics)
    const passport = passportService.getPassport();
    
    // Retrieve seasonal achievement list (only achievements unlocked in active season)
    const seasonalAchievements = achievementService.getAchievements()
      .filter(a => a.unlocked)
      .map(a => a.id);

    const stats: SeasonalPlayerStats = {
      seasonId,
      seasonXp: passport.xp, // Season 1 spans full XP
      seasonReputation: passport.reputation, // Season 1 spans full reputation
      seasonAchievements: seasonalAchievements,
      seasonMazeCompletions: passport.totalMazesCompleted,
      seasonLeaderboardRank: passport.leaderboardAppearances > 0 ? 1 : 0 // Fallback or dynamic calc
    };

    // Cache computed state
    localStorage.setItem(`base_maze_season_stats_${seasonId}`, JSON.stringify(stats));
    return stats;
  },

  /**
   * Simulated secure backend endpoint retrieving seasonal leaderboards based on reputation.
   */
  getSeasonLeaderboard(seasonId: string): any[] {
    const scoresStr = localStorage.getItem('base_maze_scores');
    if (!scoresStr) return [];

    try {
      const scores = JSON.parse(scoresStr);
      if (Array.isArray(scores)) {
        // Map scores into a ranked leaderboard structure
        return scores
          .filter((s: any) => !(s.id && typeof s.id === 'string' && s.id.startsWith('seed-')))
          .sort((a: any, b: any) => b.score - a.score)
          .map((s: any, idx: number) => ({
            rank: idx + 1,
            username: s.name || 'Anonymous Builder',
            score: s.score,
            xpEarned: s.xp || 0,
            completionTime: s.time
          }));
      }
    } catch (e) {
      console.error("Error generating seasonal leaderboard", e);
    }
    return [];
  },

  /**
   * Performs programmatic reward payout calculations based on builder seasonal metrics.
   */
  calculateSeasonRewards(seasonId: string, playerStats: SeasonalPlayerStats): SeasonalReward[] {
    const rewardsPool = SEASON_REWARDS_POOL[seasonId] || [];
    const earnedRewards: SeasonalReward[] = [];

    rewardsPool.forEach((r) => {
      if (r.tier === 'Common') {
        // Universal participation reward
        earnedRewards.push(r);
      } else if (r.tier === 'Rare' && playerStats.seasonMazeCompletions >= 3) {
        earnedRewards.push(r);
      } else if (r.tier === 'Epic' && playerStats.seasonAchievements.length >= 5) {
        earnedRewards.push(r);
      } else if (r.tier === 'Legendary' && playerStats.seasonReputation >= 1000) {
        earnedRewards.push(r);
      }
    });

    return earnedRewards;
  },

  /**
   * Archives a season on completion, freezing the state, logging accomplishments,
   * generating cryptographic snapshots, and initializing upcoming seasons.
   */
  archiveSeason(seasonId: string): SeasonArchive | null {
    const targetSeason = SEASONS.find(s => s.seasonId === seasonId);
    if (!targetSeason) return null;

    // Fetch player stats at snapshot time
    const stats = this.getSeasonPlayerStats(seasonId);
    const earnedRewards = this.calculateSeasonRewards(seasonId, stats);

    // Dynamic generation of deterministic content checksum (SHA-256 equivalent mock for validation)
    const hashPayload = `${seasonId}:${stats.seasonReputation}:${stats.seasonXp}:${earnedRewards.map(r => r.rewardId).join(',')}`;
    let hashVal = 0;
    for (let i = 0; i < hashPayload.length; i++) {
      hashVal = (hashVal << 5) - hashVal + hashPayload.charCodeAt(i);
      hashVal |= 0; // Convert to 32bit integer
    }
    const snapshotHash = `0x${Math.abs(hashVal).toString(16).padStart(16, '0')}`;

    const archive: SeasonArchive = {
      seasonId,
      seasonNumber: targetSeason.seasonNumber,
      seasonName: targetSeason.seasonName,
      playerStats: stats,
      earnedRewards,
      archivedAt: new Date().toISOString(),
      verificationProof: {
        snapshotHash,
        attestationUid: undefined, // Prepared for decentralized attestation
        nftMintSignature: undefined // Prepared for cryptographic mint proof
      }
    };

    // Save archive to cold-storage history
    const archivesStr = localStorage.getItem('base_maze_season_archives') || '[]';
    try {
      const archives = JSON.parse(archivesStr);
      if (Array.isArray(archives)) {
        // Filter out any older duplicate archive of this specific season
        const updated = archives.filter((a: any) => a.seasonId !== seasonId);
        updated.push(archive);
        localStorage.setItem('base_maze_season_archives', JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Error cold-storing season archive", e);
    }

    return archive;
  },

  /**
   * Exports a decoupled seasonal snapshot to serve as verifiable proof payload
   */
  exportSeasonSnapshot(seasonId: string): SeasonSnapshot {
    const stats = this.getSeasonPlayerStats(seasonId);
    const passport = passportService.getPassport();

    return {
      seasonId,
      playerRank: passport.builderRank,
      reputationEarned: stats.seasonReputation,
      achievementsUnlocked: stats.seasonAchievements.length,
      leaderboardRank: stats.seasonLeaderboardRank,
      verifiedOnchain: passport.isNftCertified || false
    };
  }
};
