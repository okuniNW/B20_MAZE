import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BuilderRank, 
  getBuilderRank, 
  getNextRank, 
  getReputationProgress 
} from '../utils/reputationUtils';
import { passportService } from '../services/passportService';
import { analyticsService } from '../services/analyticsService';

export interface PlayerContextType {
  xp: number;
  builderLevel: number;
  specialTokens: number;
  customUsername: string;
  customPfp: string;
  activeSkin: string;
  reputation: number; // New reputation field separate from XP
  dailyStreak: number; // Daily streak count
  lastCheckInDate: string; // ISO or YYYY-MM-DD string
  hasCheckedInToday: boolean; // Computed or state boolean
  isStreakProtected: boolean; // Computed 24h Grace Window boolean
  claimDailyStreak: () => { success: boolean; milestoneReached: number | null; rewardDescription: string | null };
  addXp: (amount: number) => void;
  setSpecialTokens: React.Dispatch<React.SetStateAction<number>>;
  setCustomUsername: (username: string) => void;
  setCustomPfp: (pfp: string) => void;
  setActiveSkin: (skin: string) => void;
  addReputation: (amount: number) => void; // Mutator for reputation
  getBuilderRank: () => BuilderRank; // Utility to fetch rank name
  getNextRank: () => BuilderRank | null; // Utility to fetch next rank name
  getReputationProgress: () => { currentRankRep: number; nextRankRequiredRep: number; percent: number }; // Utility to fetch progress metrics
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Helper function to get local YYYY-MM-DD date string
const getLocalDateString = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useState<number>(() => {
    const savedXp = localStorage.getItem('base_maze_profile_xp');
    if (savedXp) return Number(savedXp);

    // Fallback calculation from saved scores if XP is missing
    let computedXp = 0;
    try {
      const scoresStr = localStorage.getItem('base_maze_scores');
      if (scoresStr) {
        const scores = JSON.parse(scoresStr);
        if (Array.isArray(scores)) {
          scores.forEach((s: any) => {
            if (s.difficulty === 'campaign') {
              computedXp += 150;
            } else {
              computedXp += 100;
            }
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse scores for fallback XP calculation:", e);
    }
    return computedXp;
  });

  const [reputation, setReputationState] = useState<number>(() => {
    const savedRep = localStorage.getItem('base_maze_reputation');
    if (savedRep !== null) return Number(savedRep);

    // Dynamic, fair-play fallback computation for returning players
    let computedRep = 0;
    try {
      // 1. Maze completion: +10 per completed level
      const scoresStr = localStorage.getItem('base_maze_scores');
      const uniqueBadges = new Set<string>();
      if (scoresStr) {
        const scores = JSON.parse(scoresStr);
        if (Array.isArray(scores)) {
          scores.forEach((s: any) => {
            // Exclude seeded default scores from the computed user scores
            if (s.id && !(typeof s.id === 'string' && s.id.startsWith('seed-'))) {
              computedRep += 10;
              if (s.badges && Array.isArray(s.badges)) {
                s.badges.forEach((b: string) => uniqueBadges.add(b));
              }
            }
          });
        }
      }

      // 2. Achievement unlocks: +50 for each unique user-earned badge
      computedRep += uniqueBadges.size * 50;

      // 3. Quest completion: +25 for each completed quest
      const questsStr = localStorage.getItem('base_maze_quests_v1');
      if (questsStr) {
        const quests = JSON.parse(questsStr);
        if (Array.isArray(quests)) {
          quests.forEach((q: any) => {
            if (q.completed) {
              computedRep += 25;
            }
          });
        }
      }

      // 4. Leaderboard participation: +15 if they have already registered
      const leaderboardParticipated = localStorage.getItem('base_maze_reputation_leaderboard_participated');
      if (leaderboardParticipated === 'true') {
        computedRep += 15;
      }
    } catch (e) {
      console.error("Failed to calculate fallback reputation:", e);
    }

    // Save initial computed reputation
    localStorage.setItem('base_maze_reputation', String(computedRep));
    return computedRep;
  });

  const [specialTokens, setSpecialTokensState] = useState<number>(() => {
    return Number(localStorage.getItem('base_maze_special_tokens') || '1');
  });

  const [customUsername, setCustomUsernameState] = useState<string>(() => {
    return localStorage.getItem('base_maze_custom_username') || '';
  });

  const [customPfp, setCustomPfpState] = useState<string>(() => {
    return localStorage.getItem('base_maze_custom_pfp') || '';
  });

  const [activeSkin, setActiveSkinState] = useState<string>(() => {
    return localStorage.getItem('base_maze_active_skin') || 'default';
  });

  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    const lastCheckIn = localStorage.getItem('base_maze_streak_last_date');
    const savedStreak = Number(localStorage.getItem('base_maze_streak_count') || '0');
    const todayStr = getLocalDateString(0);
    const yesterdayStr = getLocalDateString(-1);
    const twoDaysAgoStr = getLocalDateString(-2);

    if (lastCheckIn) {
      if (lastCheckIn !== todayStr && lastCheckIn !== yesterdayStr && lastCheckIn !== twoDaysAgoStr) {
        // Exceeded 24h grace window (3+ days missed)! Streak breaks.
        localStorage.setItem('base_maze_streak_count', '0');
        return 0;
      }
    }
    return savedStreak;
  });

  const [lastCheckInDate, setLastCheckInDate] = useState<string>(() => {
    return localStorage.getItem('base_maze_streak_last_date') || '';
  });

  const hasCheckedInToday = lastCheckInDate === getLocalDateString(0);
  // 24h Grace window protection active if last checkin was 2 days ago and streak count > 0
  const isStreakProtected = lastCheckInDate === getLocalDateString(-2) && dailyStreak > 0;

  const claimDailyStreak = () => {
    const todayStr = getLocalDateString(0);
    const yesterdayStr = getLocalDateString(-1);
    const twoDaysAgoStr = getLocalDateString(-2);

    if (lastCheckInDate === todayStr) {
      return { success: false, milestoneReached: null, rewardDescription: null };
    }

    let newStreak = 1;
    if (lastCheckInDate === yesterdayStr || lastCheckInDate === twoDaysAgoStr) {
      // Within 24h Grace Window: preserve and increment streak!
      newStreak = (dailyStreak > 0 ? dailyStreak : 0) + 1;
    }

    setDailyStreak(newStreak);
    setLastCheckInDate(todayStr);
    localStorage.setItem('base_maze_streak_count', String(newStreak));
    localStorage.setItem('base_maze_streak_last_date', todayStr);

    let milestoneReached: number | null = null;
    let rewardDescription: string | null = null;

    if (newStreak === 3) {
      milestoneReached = 3;
      rewardDescription = "+1 Special Key";
      setSpecialTokens(prev => prev + 1);
    } else if (newStreak === 7) {
      milestoneReached = 7;
      rewardDescription = "+25 Reputation";
      addReputation(25);
    } else if (newStreak === 14) {
      milestoneReached = 14;
      rewardDescription = "Cosmetic Badge: Streak Master 🌟 & Skin: Cyberpunk";
      localStorage.setItem('base_maze_streak_badge_14', 'true');
      try {
        const skinsStr = localStorage.getItem('base_maze_unlocked_skins') || '["default"]';
        const skins = JSON.parse(skinsStr);
        if (!skins.includes('cyberpunk')) {
          skins.push('cyberpunk');
          localStorage.setItem('base_maze_unlocked_skins', JSON.stringify(skins));
        }
      } catch (e) {}
    } else if (newStreak === 30) {
      milestoneReached = 30;
      rewardDescription = "Seasonal Trophy: Nexus Pioneer 🏆 & Skin: Neon Grid";
      localStorage.setItem('base_maze_streak_badge_30', 'true');
      addReputation(50);
      addXp(500);
      try {
        const skinsStr = localStorage.getItem('base_maze_unlocked_skins') || '["default"]';
        const skins = JSON.parse(skinsStr);
        if (!skins.includes('neon')) {
          skins.push('neon');
          localStorage.setItem('base_maze_unlocked_skins', JSON.stringify(skins));
        }
      } catch (e) {}
    }

    try {
      passportService.updatePassport({
        dailyStreak: newStreak,
        lastStreakCheckIn: todayStr
      });
      analyticsService.trackDailyStreakCheckin();
    } catch (e) {}

    return { success: true, milestoneReached, rewardDescription };
  };

  // Calculate builder level based on XP (standard formula: Math.floor(xp / 1000) + 1)
  const builderLevel = Math.floor(xp / 1000) + 1;

  const addXp = (amount: number) => {
    setXp((prev) => {
      const nextXp = prev + amount;
      localStorage.setItem('base_maze_profile_xp', String(nextXp));
      return nextXp;
    });
  };

  const addReputation = (amount: number) => {
    setReputationState((prev) => {
      const nextRep = prev + amount;
      localStorage.setItem('base_maze_reputation', String(nextRep));
      return nextRep;
    });
  };

  const contextGetBuilderRank = () => getBuilderRank(reputation);
  const contextGetNextRank = () => getNextRank(reputation);
  const contextGetReputationProgress = () => getReputationProgress(reputation);

  const setSpecialTokens = (valOrFn: number | ((prev: number) => number)) => {
    setSpecialTokensState((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      localStorage.setItem('base_maze_special_tokens', String(next));
      return next;
    });
  };

  const setCustomUsername = (username: string) => {
    setCustomUsernameState(username);
    localStorage.setItem('base_maze_custom_username', username);
  };

  const setCustomPfp = (pfp: string) => {
    setCustomPfpState(pfp);
    localStorage.setItem('base_maze_custom_pfp', pfp);
  };

  const setActiveSkin = (skin: string) => {
    setActiveSkinState(skin);
    localStorage.setItem('base_maze_active_skin', skin);
  };

  return (
    <PlayerContext.Provider
      value={{
        xp,
        builderLevel,
        specialTokens,
        customUsername,
        customPfp,
        activeSkin,
        reputation,
        dailyStreak,
        lastCheckInDate,
        hasCheckedInToday,
        isStreakProtected,
        claimDailyStreak,
        addXp,
        setSpecialTokens,
        setCustomUsername,
        setCustomPfp,
        setActiveSkin,
        addReputation,
        getBuilderRank: contextGetBuilderRank,
        getNextRank: contextGetNextRank,
        getReputationProgress: contextGetReputationProgress,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
