import { BuilderRank, getBuilderRank } from '../utils/reputationUtils';
import { achievementService } from './achievementService';

/**
 * Data model for the Builder Passport.
 * Permanent identity record that aggregates in-game progress, reputation,
 * and high-fidelity statistics, prepared for future onchain NFT minting and wallet binding.
 */
export interface BuilderPassport {
  username: string;
  profilePicture: string;
  activeSkin: string;
  xp: number;
  builderLevel: number;
  reputation: number;
  builderRank: BuilderRank;
  totalAchievements: number;
  totalQuestsCompleted: number;
  totalMazesCompleted: number;
  highestScore: number;
  fastestCompletionTime: number; // in seconds, 0 means no completed run yet
  leaderboardAppearances: number;
  accountCreationDate: string; // ISO String
  lastActiveDate: string; // ISO String

  // --- Daily Streak system integration ---
  dailyStreak?: number;
  lastStreakCheckIn?: string;
  streakBadges?: string[];

  // --- Architecture prepared for future NFT Passport migration & Wallet binding ---
  walletAddress?: string; // Future wallet address bound to this identity record
  isNftCertified?: boolean; // True if verified/minted onchain on Base network
  nftTokenId?: string; // Token identifier if verified as an NFT on L2
  onchainAttestationUid?: string; // EAS Attestation UID proving builder score authenticity
}

/**
 * Lightweight snapshot of the Builder Passport, perfect for cryptographic signing,
 * verification APIs, or onchain smart contract interactions.
 */
export interface PassportSnapshot {
  passportVersion: number;
  generatedAt: number; // unix timestamp
  username: string;
  level: number;
  reputation: number;
  rank: BuilderRank;
  achievements: number;
  totalQuestsCompleted: number;
  totalMazesCompleted: number;
  highestScore: number;
  fastestCompletionTime: number;
  
  // Daily Streak extension
  dailyStreak?: number;
  streakBadges?: string[];
  
  // Verifiable Attestation payload placeholder for future onchain migration
  cryptographicProof?: {
    signature?: string;
    verifiableCredentialPayload?: any;
    merkleRoot?: string;
  };
}

/**
 * Passport Service Layer - Handles the automated aggregation, calculation,
 * serialization, and export of player credentials.
 */
export const passportService = {
  /**
   * Generates or fetches the current Builder Passport, performing safe fallback computations.
   */
  getPassport(): BuilderPassport {
    // 1. Core Profile Details
    const username = localStorage.getItem('base_maze_custom_username') || localStorage.getItem('base_maze_player_name') || 'Anonymous Builder';
    const profilePicture = localStorage.getItem('base_maze_custom_pfp') || '';
    const activeSkin = localStorage.getItem('base_maze_active_skin') || 'default';
    
    // 2. XP & Level calculations
    const xp = Number(localStorage.getItem('base_maze_profile_xp') || '0');
    const builderLevel = Math.floor(xp / 1000) + 1;

    // 3. Reputation & Rank calculations
    const reputation = Number(localStorage.getItem('base_maze_reputation') || '0');
    const builderRank = getBuilderRank(reputation);

    // 4. Aggregated stats from local storage systems
    const scoresStr = localStorage.getItem('base_maze_scores');
    let totalAchievements = 0;
    let totalMazesCompleted = 0;
    let highestScore = Number(localStorage.getItem('base_maze_profile_score') || '0');
    let fastestCompletionTime = Infinity;
    let leaderboardAppearances = 0;

    if (scoresStr) {
      try {
        const scores = JSON.parse(scoresStr);
        if (Array.isArray(scores)) {
          const uniqueBadges = new Set<string>();
          scores.forEach((s: any) => {
            // Ignore seed data for computing actual player achievements/leaderboard stats
            const isSeed = s.id && typeof s.id === 'string' && s.id.startsWith('seed-');
            const isUser = s.name && s.name.trim() === username.trim();

            if (!isSeed) {
              totalMazesCompleted++;
              
              if (s.badges && Array.isArray(s.badges)) {
                s.badges.forEach((b: string) => uniqueBadges.add(b));
              }

              if (s.time < fastestCompletionTime) {
                fastestCompletionTime = s.time;
              }
            }

            if (!isSeed && isUser) {
              leaderboardAppearances++;
            }
          });
          // Let achievementService compute all unlocked achievements (which handles backfilling & rich achievements)
          totalAchievements = achievementService.getAchievements().filter(a => a.unlocked).length;
        }
      } catch (e) {
        console.error("Error reading scores during Passport aggregation:", e);
      }
    }

    if (fastestCompletionTime === Infinity) {
      fastestCompletionTime = 0;
    }

    // 5. Quest Aggregation
    const questsStr = localStorage.getItem('base_maze_quests_v1');
    let totalQuestsCompleted = 0;
    if (questsStr) {
      try {
        const quests = JSON.parse(questsStr);
        if (Array.isArray(quests)) {
          totalQuestsCompleted = quests.filter((q: any) => q.completed).length;
        }
      } catch (e) {
        console.error("Error reading quests during Passport aggregation:", e);
      }
    }

    // 6. Metadata Dates
    let accountCreationDate = localStorage.getItem('base_maze_passport_creation_date');
    if (!accountCreationDate) {
      accountCreationDate = new Date().toISOString();
      localStorage.setItem('base_maze_passport_creation_date', accountCreationDate);
    }

    const lastActiveDate = new Date().toISOString();
    localStorage.setItem('base_maze_passport_last_active_date', lastActiveDate);

    // 7. Wallet & Onchain Integration state (if stored)
    const walletAddress = localStorage.getItem('base_maze_passport_wallet') || undefined;
    const isNftCertified = localStorage.getItem('base_maze_passport_nft_certified') === 'true';
    const nftTokenId = localStorage.getItem('base_maze_passport_nft_id') || undefined;
    const onchainAttestationUid = localStorage.getItem('base_maze_passport_attestation_uid') || undefined;

    // 8. Daily Streak & Badges
    const dailyStreak = Number(localStorage.getItem('base_maze_streak_count') || '0');
    const lastStreakCheckIn = localStorage.getItem('base_maze_streak_last_date') || undefined;
    const streakBadges: string[] = [];
    if (localStorage.getItem('base_maze_streak_badge_14') === 'true') {
      streakBadges.push('Streak Sentinel 🌟');
    }
    if (localStorage.getItem('base_maze_streak_badge_30') === 'true') {
      streakBadges.push('Ecosystem Titan 🏆');
    }

    const passport: BuilderPassport = {
      username,
      profilePicture,
      activeSkin,
      xp,
      builderLevel,
      reputation,
      builderRank,
      totalAchievements,
      totalQuestsCompleted,
      totalMazesCompleted,
      highestScore,
      fastestCompletionTime,
      leaderboardAppearances,
      accountCreationDate,
      lastActiveDate,
      walletAddress,
      isNftCertified,
      nftTokenId,
      onchainAttestationUid,
      dailyStreak,
      lastStreakCheckIn,
      streakBadges,
    };

    // Keep stored copy in sync with dynamic aggregates
    localStorage.setItem('base_maze_passport_cache', JSON.stringify(passport));

    return passport;
  },

  /**
   * Manually updates specific passport fields (e.g., wallet address binding, username override)
   */
  updatePassport(data: Partial<BuilderPassport>): BuilderPassport {
    if (data.username) {
      localStorage.setItem('base_maze_custom_username', data.username);
    }
    if (data.profilePicture) {
      localStorage.setItem('base_maze_custom_pfp', data.profilePicture);
    }
    if (data.activeSkin) {
      localStorage.setItem('base_maze_active_skin', data.activeSkin);
    }
    if (data.walletAddress) {
      localStorage.setItem('base_maze_passport_wallet', data.walletAddress);
    }
    if (data.isNftCertified !== undefined) {
      localStorage.setItem('base_maze_passport_nft_certified', String(data.isNftCertified));
    }
    if (data.nftTokenId) {
      localStorage.setItem('base_maze_passport_nft_id', data.nftTokenId);
    }
    if (data.onchainAttestationUid) {
      localStorage.setItem('base_maze_passport_attestation_uid', data.onchainAttestationUid);
    }
    if (data.dailyStreak !== undefined) {
      localStorage.setItem('base_maze_streak_count', String(data.dailyStreak));
    }
    if (data.lastStreakCheckIn) {
      localStorage.setItem('base_maze_streak_last_date', data.lastStreakCheckIn);
    }

    // Always refresh stats after an update to keep data models completely in sync
    return this.refreshPassportStats();
  },

  /**
   * Triggers an explicit calculation pass of all player stats and cached values.
   */
  refreshPassportStats(): BuilderPassport {
    return this.getPassport();
  },

  /**
   * Exports a cryptographically signable, decoupled snapshot representing the builder's passport data.
   */
  exportPassportSnapshot(): PassportSnapshot {
    const passport = this.getPassport();
    return {
      passportVersion: 1,
      generatedAt: Math.floor(Date.now() / 1000),
      username: passport.username,
      level: passport.builderLevel,
      reputation: passport.reputation,
      rank: passport.builderRank,
      achievements: passport.totalAchievements,
      totalQuestsCompleted: passport.totalQuestsCompleted,
      totalMazesCompleted: passport.totalMazesCompleted,
      highestScore: passport.highestScore,
      fastestCompletionTime: passport.fastestCompletionTime,
      dailyStreak: passport.dailyStreak,
      streakBadges: passport.streakBadges,
    };
  }
};
