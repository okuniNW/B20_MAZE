import { ScoreEntry, Difficulty } from '../types';

export interface RivalTarget {
  name: string;
  rank: number;
  time: number;
  tps: number;
  difficulty: string;
  gapTime: number; // positive = rival is faster by X seconds
  gapTps: number;
  isBotOrSeed: boolean;
  avatarEmoji: string;
}

export interface RivalAlert {
  id: string;
  type: 'surpassed' | 'nearing' | 'challenger';
  titleEn: string;
  titleId: string;
  messageEn: string;
  messageId: string;
  rivalName: string;
  rivalRank: number;
  gapTime: number;
  gapTps: number;
  severity: 'high' | 'medium' | 'info';
}

export interface PersonalBestSummary {
  bestTime: number | null;
  bestTps: number | null;
  bestEfficiency: number | null;
  totalRuns: number;
  favDifficulty: string;
}

export interface PersonalBestOpportunity {
  difficulty: Difficulty;
  currentBestTime: number | null;
  targetTime: number;
  opportunityType: 'unbeaten' | 'near_pb' | 'pb_milestone';
  titleEn: string;
  titleId: string;
  descriptionEn: string;
  descriptionId: string;
  rewardXp: number;
  rewardRep: number;
}

export interface WeeklyChampionEntry {
  rank: number;
  name: string;
  time: number;
  tps: number;
  difficulty: string;
  badge: string;
  titleEn: string;
  titleId: string;
  avatarEmoji: string;
  isCurrentPlayer: boolean;
}

export interface WeeklyCompetitionInfo {
  weekNumber: number;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  endDateString: string;
  rewards: {
    top1: string;
    top3: string;
    top10: string;
  };
}

export const socialService = {
  /**
   * Retrieves the rival player immediately ahead of the current user on the leaderboard.
   */
  getRival(scores: ScoreEntry[], playerName: string): RivalTarget | null {
    if (!scores || scores.length === 0) return null;

    // Filter and sort scores ascending by time (lower time = better rank)
    const sorted = [...scores].sort((a, b) => a.time - b.time);
    
    const activeName = (playerName || localStorage.getItem('base_maze_player_name') || '').trim();
    const userIndex = sorted.findIndex(s => s.name && s.name.trim() === activeName);

    if (userIndex > 0) {
      // Rival is the entry directly above the user
      const rivalEntry = sorted[userIndex - 1];
      const userEntry = sorted[userIndex];
      return {
        name: rivalEntry.name,
        rank: userIndex, // 1-indexed rank of rival
        time: rivalEntry.time,
        tps: rivalEntry.tps,
        difficulty: rivalEntry.difficulty,
        gapTime: Math.max(0.01, userEntry.time - rivalEntry.time),
        gapTps: Math.max(0, rivalEntry.tps - userEntry.tps),
        isBotOrSeed: rivalEntry.id.startsWith('seed-'),
        avatarEmoji: rivalEntry.name.includes('🦄') ? '🦄' : rivalEntry.name.includes('🛡️') ? '🛡️' : rivalEntry.name.includes('🔵') ? '🔵' : '🎯',
      };
    } else if (userIndex === 0) {
      // User is #1! Show them maintaining their throne vs #2
      const runnerUp = sorted[1];
      if (!runnerUp) return null;
      return {
        name: runnerUp.name,
        rank: 2,
        time: runnerUp.time,
        tps: runnerUp.tps,
        difficulty: runnerUp.difficulty,
        gapTime: runnerUp.time - sorted[0].time,
        gapTps: sorted[0].tps - runnerUp.tps,
        isBotOrSeed: runnerUp.id.startsWith('seed-'),
        avatarEmoji: '👑',
      };
    } else {
      // User has no score yet - set rival to benchmark #3 or #1
      const defaultRival = sorted[Math.min(2, sorted.length - 1)];
      return {
        name: defaultRival.name,
        rank: Math.min(3, sorted.length),
        time: defaultRival.time,
        tps: defaultRival.tps,
        difficulty: defaultRival.difficulty,
        gapTime: defaultRival.time,
        gapTps: defaultRival.tps,
        isBotOrSeed: defaultRival.id.startsWith('seed-'),
        avatarEmoji: '⚡',
      };
    }
  },

  /**
   * Generates active Rival Alerts (Rival Surpassed, Nearing Rival, Challenger Ahead).
   */
  getRivalAlerts(scores: ScoreEntry[], playerName: string): RivalAlert[] {
    const rival = this.getRival(scores, playerName);
    if (!rival) return [];

    const alerts: RivalAlert[] = [];
    const activeName = (playerName || localStorage.getItem('base_maze_player_name') || '').trim();
    
    // Check if player's rank dropped in recent history
    const sorted = [...scores].sort((a, b) => a.time - b.time);
    const currentRank = sorted.findIndex(s => s.name && s.name.trim() === activeName) + 1;
    const prevRank = Number(localStorage.getItem('base_maze_prev_user_rank') || '0');

    if (currentRank > 0) {
      localStorage.setItem('base_maze_prev_user_rank', String(currentRank));
    }

    if (prevRank > 0 && currentRank > prevRank) {
      alerts.push({
        id: `alert-surpassed-${rival.name}`,
        type: 'surpassed',
        titleEn: `⚔️ Rival Surpassed You!`,
        titleId: `⚔️ Rival Melampaui Anda!`,
        messageEn: `${rival.name} overtaken your position and claimed Rank #${rival.rank} (${rival.time.toFixed(2)}s). Shave off ${rival.gapTime.toFixed(2)}s to retake it!`,
        messageId: `${rival.name} mengambil alih posisi Anda di Peringkat #${rival.rank} (${rival.time.toFixed(2)}d). Potong ${rival.gapTime.toFixed(2)}d untuk merebutnya!`,
        rivalName: rival.name,
        rivalRank: rival.rank,
        gapTime: rival.gapTime,
        gapTps: rival.gapTps,
        severity: 'high',
      });
    }

    // Nearing Rival alert if gap is close (under 3.0s or within reach)
    if (rival.gapTime > 0 && rival.gapTime <= 3.5) {
      alerts.push({
        id: `alert-nearing-${rival.name}`,
        type: 'nearing',
        titleEn: `⚡ Nearing Rival Target!`,
        titleId: `⚡ Mendekati Target Rival!`,
        messageEn: `You are only ${rival.gapTime.toFixed(2)}s behind ${rival.name} (#${rival.rank}). One clean run will surpass them!`,
        messageId: `Anda hanya selisih ${rival.gapTime.toFixed(2)}d dari ${rival.name} (#${rival.rank}). Satu run bersih akan melampaui mereka!`,
        rivalName: rival.name,
        rivalRank: rival.rank,
        gapTime: rival.gapTime,
        gapTps: rival.gapTps,
        severity: 'medium',
      });
    }

    // General Challenger Rival Ahead
    if (alerts.length === 0) {
      alerts.push({
        id: `alert-challenger-${rival.name}`,
        type: 'challenger',
        titleEn: `🎯 Next Target: ${rival.name}`,
        titleId: `🎯 Target Berikutnya: ${rival.name}`,
        messageEn: `Rival ${rival.name} holds Rank #${rival.rank} at ${rival.time.toFixed(2)}s (${rival.tps.toFixed(0)} TPS). Challenge their mark!`,
        messageId: `Rival ${rival.name} memegang Peringkat #${rival.rank} pada ${rival.time.toFixed(2)}d (${rival.tps.toFixed(0)} TPS). Tantang catatan mereka!`,
        rivalName: rival.name,
        rivalRank: rival.rank,
        gapTime: rival.gapTime,
        gapTps: rival.gapTps,
        severity: 'info',
      });
    }

    return alerts;
  },

  /**
   * Calculates Personal Best metrics for the current player.
   */
  getPersonalBest(scores: ScoreEntry[], playerName: string): PersonalBestSummary {
    const activeName = (playerName || localStorage.getItem('base_maze_player_name') || '').trim();
    const userScores = scores.filter(s => s.name && s.name.trim() === activeName);

    if (userScores.length === 0) {
      return {
        bestTime: null,
        bestTps: null,
        bestEfficiency: null,
        totalRuns: 0,
        favDifficulty: 'standard',
      };
    }

    const minTime = Math.min(...userScores.map(s => s.time));
    const maxTps = Math.max(...userScores.map(s => s.tps));
    const maxEff = Math.max(...userScores.map(s => s.bestEfficiency || 0));

    // Calculate most played difficulty
    const diffCounts: Record<string, number> = {};
    userScores.forEach(s => {
      diffCounts[s.difficulty] = (diffCounts[s.difficulty] || 0) + 1;
    });
    const favDifficulty = Object.keys(diffCounts).reduce((a, b) => diffCounts[a] > diffCounts[b] ? a : b, 'standard');

    return {
      bestTime: minTime,
      bestTps: maxTps,
      bestEfficiency: maxEff > 0 ? maxEff : null,
      totalRuns: userScores.length,
      favDifficulty,
    };
  },

  /**
   * Identifies Personal Best opportunities across difficulties.
   */
  getPersonalBestOpportunities(scores: ScoreEntry[], playerName: string): PersonalBestOpportunity[] {
    const activeName = (playerName || localStorage.getItem('base_maze_player_name') || '').trim();
    const userScores = scores.filter(s => s.name && s.name.trim() === activeName);
    const opportunities: PersonalBestOpportunity[] = [];

    const difficulties: Difficulty[] = ['standard', 'batch', 'superchain'];

    difficulties.forEach(diff => {
      const diffScores = userScores.filter(s => s.difficulty === diff);
      if (diffScores.length === 0) {
        opportunities.push({
          difficulty: diff,
          currentBestTime: null,
          targetTime: diff === 'standard' ? 6.0 : diff === 'batch' ? 12.0 : 25.0,
          opportunityType: 'unbeaten',
          titleEn: `Uncharted Baseline: ${diff.toUpperCase()}`,
          titleId: `Basis Uncharted: ${diff.toUpperCase()}`,
          descriptionEn: `Complete your first ${diff.toUpperCase()} maze run to establish a Personal Best & claim +50 XP +15 REP!`,
          descriptionId: `Selesaikan run labirin ${diff.toUpperCase()} pertama Anda untuk rekor PB & +50 XP +15 REP!`,
          rewardXp: 50,
          rewardRep: 15,
        });
      } else {
        const bestTime = Math.min(...diffScores.map(s => s.time));
        const targetTime = Math.max(0.5, Number((bestTime * 0.92).toFixed(2))); // 8% time reduction target
        opportunities.push({
          difficulty: diff,
          currentBestTime: bestTime,
          targetTime,
          opportunityType: 'near_pb',
          titleEn: `PB Upgrade: ${diff.toUpperCase()} (${bestTime.toFixed(2)}s)`,
          titleId: `Peningkatan PB: ${diff.toUpperCase()} (${bestTime.toFixed(2)}d)`,
          descriptionEn: `Beat ${targetTime.toFixed(2)}s on ${diff.toUpperCase()} to set a new Personal Best and gain +75 XP!`,
          descriptionId: `Kalahkan ${targetTime.toFixed(2)}d di ${diff.toUpperCase()} untuk rekor PB baru & +75 XP!`,
          rewardXp: 75,
          rewardRep: 20,
        });
      }
    });

    return opportunities;
  },

  /**
   * Retrieves Weekly Top Performers (Weekly Champions podium).
   */
  getWeeklyTopPerformers(scores: ScoreEntry[], playerName?: string): WeeklyChampionEntry[] {
    if (!scores || scores.length === 0) return [];

    const activeName = (playerName || localStorage.getItem('base_maze_player_name') || '').trim();
    const sorted = [...scores].sort((a, b) => a.time - b.time);

    // Pick top 3 unique entries
    const topPerformers: WeeklyChampionEntry[] = [];
    const seenNames = new Set<string>();

    for (const score of sorted) {
      const cleanName = score.name ? score.name.trim() : 'Anonymous Builder';
      if (!seenNames.has(cleanName)) {
        seenNames.add(cleanName);
        const rank = topPerformers.length + 1;
        
        let badge = '🥉 Weekly Pioneer';
        let titleEn = '3rd Place Contender';
        let titleId = 'Juara 3 Kompetisi';
        let avatarEmoji = '🥉';

        if (rank === 1) {
          badge = '👑 Weekly Champion';
          titleEn = 'Week 29 Reigning Champion';
          titleId = 'Juara Bertahan Minggu 29';
          avatarEmoji = '👑';
        } else if (rank === 2) {
          badge = '🥈 Weekly Contender';
          titleEn = 'Runner-Up Challenger';
          titleId = 'Runner-Up Kompetisi';
          avatarEmoji = '🥈';
        }

        topPerformers.push({
          rank,
          name: cleanName,
          time: score.time,
          tps: score.tps,
          difficulty: score.difficulty,
          badge,
          titleEn,
          titleId,
          avatarEmoji,
          isCurrentPlayer: activeName !== '' && cleanName === activeName,
        });

        if (topPerformers.length >= 3) break;
      }
    }

    return topPerformers;
  },

  /**
   * Computes Weekly Competition countdown and status.
   */
  getWeeklyCompetitionStatus(): WeeklyCompetitionInfo {
    const now = new Date();
    // Calculate next Sunday 23:59:59 UTC
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday...
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    
    const nextReset = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday),
      23, 59, 59
    ));

    const diffMs = nextReset.getTime() - now.getTime();
    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Determine week number of the year
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getUTCDay() + 1) / 7);

    return {
      weekNumber,
      daysRemaining,
      hoursRemaining,
      minutesRemaining,
      endDateString: nextReset.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rewards: {
        top1: '+100 REP • Crown Badge',
        top3: '+50 REP • Silver Medal',
        top10: '+25 REP • Sprint Star',
      },
    };
  },

  /**
   * Checks if a completed score sets a new Personal Best or surpasses rival.
   */
  checkAndRecordPersonalBest(score: ScoreEntry, scores: ScoreEntry[], playerName: string) {
    const activeName = (playerName || localStorage.getItem('base_maze_player_name') || '').trim();
    if (!activeName) return { isNewPbTime: false, isNewPbTps: false, gapTimeImprovement: 0, rivalSurpassed: false, oldRank: null, newRank: null };

    const previousUserScores = scores.filter(s => s.name && s.name.trim() === activeName && s.difficulty === score.difficulty && s.id !== score.id);
    
    let isNewPbTime = false;
    let isNewPbTps = false;
    let gapTimeImprovement = 0;

    if (previousUserScores.length === 0) {
      isNewPbTime = true;
      isNewPbTps = true;
    } else {
      const prevBestTime = Math.min(...previousUserScores.map(s => s.time));
      const prevBestTps = Math.max(...previousUserScores.map(s => s.tps));

      if (score.time < prevBestTime) {
        isNewPbTime = true;
        gapTimeImprovement = prevBestTime - score.time;
      }
      if (score.tps > prevBestTps) {
        isNewPbTps = true;
      }
    }

    // Check rival rank movement
    const sortedBefore = [...scores].sort((a, b) => a.time - b.time);
    const oldRank = sortedBefore.findIndex(s => s.name && s.name.trim() === activeName) + 1;

    const scoresWithNewRun = [...scores.filter(s => s.id !== score.id), score];
    const sortedAfter = scoresWithNewRun.sort((a, b) => a.time - b.time);
    const newRank = sortedAfter.findIndex(s => s.id === score.id) + 1;

    const rivalSurpassed = oldRank > 0 && newRank > 0 && newRank < oldRank;

    return {
      isNewPbTime,
      isNewPbTps,
      gapTimeImprovement,
      rivalSurpassed,
      oldRank: oldRank || newRank,
      newRank
    };
  }
};

