// Analytics Service for B20 Maze Game
// Tracks DAU, Sessions, Session Length, Maze Completions, Quests, Achievements, and Daily Streaks.

export interface GameAnalyticsData {
  dauDates: string[];              // List of unique YYYY-MM-DD active days
  totalSessions: number;           // Total session count
  totalPlayTimeSeconds: number;    // Cumulative duration in seconds
  mazeCompletions: number;         // Total maze completions count
  mazeCompletionsByDiff: Record<string, number>;
  questsAssigned: number;          // Total quests encountered
  questsCompleted: number;         // Total quests finished
  achievementsUnlockedCount: number; // Total achievements unlocked
  dailyStreakCheckins: number;     // Total daily check-ins completed
  lastActiveTimestamp: number;     // Last recorded active timestamp
  sessionStartTime: number;        // Current session start timestamp
}

const STORAGE_KEY = 'b20_game_analytics_data_v1';

const getInitialAnalyticsData = (): GameAnalyticsData => {
  return {
    dauDates: [new Date().toISOString().slice(0, 10)],
    totalSessions: 1,
    totalPlayTimeSeconds: 0,
    mazeCompletions: 0,
    mazeCompletionsByDiff: { beginner: 0, standard: 0, expert: 0, master: 0 },
    questsAssigned: 3,
    questsCompleted: 0,
    achievementsUnlockedCount: 0,
    dailyStreakCheckins: 0,
    lastActiveTimestamp: Date.now(),
    sessionStartTime: Date.now(),
  };
};

class AnalyticsService {
  private data: GameAnalyticsData;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
    this.initSession();
    this.startPlaytimeTracker();
  }

  private loadData(): GameAnalyticsData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...getInitialAnalyticsData(),
          ...parsed,
          sessionStartTime: Date.now(), // fresh session start
        };
      }
    } catch (e) {
      console.warn('Failed to load analytics data from storage', e);
    }
    return getInitialAnalyticsData();
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save analytics data to storage', e);
    }
  }

  private initSession(): void {
    const today = new Date().toISOString().slice(0, 10);
    
    // Check if DAU date already logged
    if (!this.data.dauDates.includes(today)) {
      this.data.dauDates.push(today);
    }

    this.data.totalSessions += 1;
    this.data.lastActiveTimestamp = Date.now();
    this.data.sessionStartTime = Date.now();
    this.saveData();
  }

  private startPlaytimeTracker(): void {
    if (this.timer) clearInterval(this.timer);
    
    // Update active playtime every 10 seconds
    this.timer = setInterval(() => {
      this.data.totalPlayTimeSeconds += 10;
      this.data.lastActiveTimestamp = Date.now();
      this.saveData();
    }, 10000);
  }

  /**
   * Generic event tracker for custom UI events.
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (eventName === 'faucet_claim') {
      this.trackDailyStreakCheckin();
    }
  }

  // --- Trackers ---

  /**
   * Track completion of a maze.
   */
  trackMazeCompletion(difficulty: string = 'standard'): void {
    this.data.mazeCompletions += 1;
    const normDiff = difficulty.toLowerCase();
    this.data.mazeCompletionsByDiff[normDiff] = (this.data.mazeCompletionsByDiff[normDiff] || 0) + 1;
    this.saveData();
  }

  /**
   * Track quest updates and completions.
   */
  trackQuestCompletion(assignedCountDelta: number = 0, completedCountDelta: number = 1): void {
    this.data.questsAssigned += assignedCountDelta;
    this.data.questsCompleted += completedCountDelta;
    this.saveData();
  }

  /**
   * Track achievement unlock events.
   */
  trackAchievementUnlock(count: number = 1): void {
    this.data.achievementsUnlockedCount += count;
    this.saveData();
  }

  /**
   * Track daily streak check-in action.
   */
  trackDailyStreakCheckin(): void {
    this.data.dailyStreakCheckins += 1;
    this.saveData();
  }

  // --- Getters ---

  getAnalyticsSummary() {
    const currentSessionDuration = Math.round((Date.now() - this.data.sessionStartTime) / 1000);
    const totalPlayTimeSeconds = this.data.totalPlayTimeSeconds + currentSessionDuration;
    
    const dauCount = this.data.dauDates.length;
    const avgSessionLengthSeconds = this.data.totalSessions > 0
      ? Math.round(totalPlayTimeSeconds / this.data.totalSessions)
      : 0;

    const questCompletionRate = this.data.questsAssigned > 0
      ? Math.min(100, Math.round((this.data.questsCompleted / this.data.questsAssigned) * 100))
      : 0;

    return {
      dauCount,
      dauDates: this.data.dauDates,
      totalSessions: this.data.totalSessions,
      totalPlayTimeSeconds,
      formattedTotalPlaytime: this.formatTime(totalPlayTimeSeconds),
      currentSessionDurationSeconds: currentSessionDuration,
      formattedCurrentSession: this.formatTime(currentSessionDuration),
      avgSessionLengthSeconds,
      formattedAvgSession: this.formatTime(avgSessionLengthSeconds),
      mazeCompletions: this.data.mazeCompletions,
      mazeCompletionsByDiff: this.data.mazeCompletionsByDiff,
      questsAssigned: this.data.questsAssigned,
      questsCompleted: this.data.questsCompleted,
      questCompletionRate,
      achievementsUnlockedCount: this.data.achievementsUnlockedCount,
      dailyStreakCheckins: this.data.dailyStreakCheckins,
    };
  }

  private formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
}

export const analyticsService = new AnalyticsService();
