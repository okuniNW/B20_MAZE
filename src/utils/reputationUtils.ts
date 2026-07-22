export type BuilderRank = 'Explorer' | 'Validator' | 'Architect' | 'Master Builder';

export interface ReputationTier {
  rank: BuilderRank;
  minRep: number;
  maxRep: number;
  color: string;
  badgeEmoji: string;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { rank: 'Explorer', minRep: 0, maxRep: 999, color: '#94A3B8', badgeEmoji: '🧭' },
  { rank: 'Validator', minRep: 1000, maxRep: 4999, color: '#3B82F6', badgeEmoji: '🛡️' },
  { rank: 'Architect', minRep: 5000, maxRep: 9999, color: '#8B5CF6', badgeEmoji: '📐' },
  { rank: 'Master Builder', minRep: 10000, maxRep: Infinity, color: '#10B981', badgeEmoji: '👑' }
];

export const REPUTATION_REWARDS = {
  MAZE_COMPLETION: 10,
  QUEST_COMPLETION: 25,
  ACHIEVEMENT_UNLOCK: 50,
  LEADERBOARD_PARTICIPATION: 15
};

/**
 * Gets the current BuilderRank for a given reputation score.
 */
export function getBuilderRank(reputation: number): BuilderRank {
  const tier = REPUTATION_TIERS.find(t => reputation >= t.minRep && reputation <= t.maxRep);
  return tier ? tier.rank : 'Explorer';
}

/**
 * Gets the next BuilderRank. Returns null if already at the highest rank (Master Builder).
 */
export function getNextRank(reputation: number): BuilderRank | null {
  const currentRank = getBuilderRank(reputation);
  const currentIndex = REPUTATION_TIERS.findIndex(t => t.rank === currentRank);
  if (currentIndex !== -1 && currentIndex < REPUTATION_TIERS.length - 1) {
    return REPUTATION_TIERS[currentIndex + 1].rank;
  }
  return null;
}

/**
 * Calculates current progress toward the next reputation rank.
 */
export function getReputationProgress(reputation: number) {
  const currentRank = getBuilderRank(reputation);
  const currentTier = REPUTATION_TIERS.find(t => t.rank === currentRank);
  
  if (!currentTier) {
    return {
      currentRankRep: 0,
      nextRankRequiredRep: 1000,
      percent: 0
    };
  }

  if (currentRank === 'Master Builder') {
    return {
      currentRankRep: reputation - currentTier.minRep,
      nextRankRequiredRep: 0,
      percent: 100
    };
  }

  const nextTierMin = currentTier.maxRep + 1;
  const range = nextTierMin - currentTier.minRep;
  const progressInTier = reputation - currentTier.minRep;
  const percent = Math.min(100, Math.max(0, Math.round((progressInTier / range) * 100)));

  return {
    currentRankRep: progressInTier,
    nextRankRequiredRep: range,
    percent
  };
}

/**
 * Interface prepared for Future Onchain Reputation Certification and attestations (e.g., via EAS / Smart Contract).
 */
export interface OnchainReputationProof {
  playerAddress?: string; // Prepared for future wallet integration
  reputationScore: number;
  rank: BuilderRank;
  lastUpdatedTimestamp: number;
  signature?: string; // Future cryptographic proof / attestation UID
}
