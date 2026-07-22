export interface GameEvent {
  id: string;
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  eventType: 'double_rep' | 'speedrun_boost' | 'quest_rush' | 'xp_boost' | 'zero_gas';
  repMultiplier: number;
  xpMultiplier: number;
  questMultiplier: number;
  badgeEmoji: string;
  colorTheme: string; // Tailwind color classes for badges
  bannerGradient: string; // Tailwind gradient background
  startDate: string;
  endDate: string;
  isActive: boolean;
  featuredDifficulty?: string;
  activeBonusDescEn: string;
  activeBonusDescId: string;
}

export interface EventBonusCalculation {
  baseXp: number;
  finalXp: number;
  xpBonus: number;
  baseRep: number;
  finalRep: number;
  repBonus: number;
  appliedEvents: { id: string; title: string; emoji: string }[];
}

export const FEATURED_EVENTS: GameEvent[] = [
  {
    id: 'double-rep-weekend',
    title: 'Double REP Weekend',
    titleId: 'Akhir Pekan Double REP',
    description: 'Earn 2x Builder Reputation on all maze level completions and milestone achievements!',
    descriptionId: 'Dapatkan 2x Builder Reputasi di semua penyelesaian level labirin dan pencapaian milestone!',
    eventType: 'double_rep',
    repMultiplier: 2.0,
    xpMultiplier: 1.0,
    questMultiplier: 1.0,
    badgeEmoji: '⚡',
    colorTheme: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    bannerGradient: 'from-amber-600/20 via-orange-600/10 to-yellow-600/20 border-amber-500/30',
    startDate: '2026-07-20T00:00:00Z',
    endDate: '2026-07-27T23:59:59Z',
    isActive: true,
    activeBonusDescEn: '2x Builder Reputation Boost Active!',
    activeBonusDescId: 'Bonus 2x Builder Reputasi Aktif!'
  },
  {
    id: 'speedrun-week',
    title: 'Speedrun Week',
    titleId: 'Pekan Speedrun',
    description: '1.5x XP Boost for all ultra-fast maze validations completed in < 15 seconds.',
    descriptionId: 'Bonus 1.5x XP untuk semua validasi labirin kilat yang diselesaikan dalam < 15 detik.',
    eventType: 'speedrun_boost',
    repMultiplier: 1.0,
    xpMultiplier: 1.5,
    questMultiplier: 1.0,
    badgeEmoji: '🚀',
    colorTheme: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    bannerGradient: 'from-rose-600/20 via-pink-600/10 to-red-600/20 border-rose-500/30',
    startDate: '2026-07-21T00:00:00Z',
    endDate: '2026-07-28T23:59:59Z',
    isActive: true,
    activeBonusDescEn: '1.5x Speedrun XP Boost (<15s) Active!',
    activeBonusDescId: 'Bonus 1.5x XP Speedrun (<15s) Aktif!'
  },
  {
    id: 'quest-rush',
    title: 'Quest Rush',
    titleId: 'Serbuan Quest',
    description: 'Double XP and Reputation payouts when claiming completed ecosystem quests!',
    descriptionId: 'Dua kali lipat XP dan Reputasi saat mengklaim quest ekosistem yang telah selesai!',
    eventType: 'quest_rush',
    repMultiplier: 2.0,
    xpMultiplier: 2.0,
    questMultiplier: 2.0,
    badgeEmoji: '📜',
    colorTheme: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    bannerGradient: 'from-purple-600/20 via-indigo-600/10 to-blue-600/20 border-purple-500/30',
    startDate: '2026-07-21T00:00:00Z',
    endDate: '2026-07-29T23:59:59Z',
    isActive: true,
    activeBonusDescEn: '2x Quest Payouts Active!',
    activeBonusDescId: 'Bonus 2x Klaim Quest Aktif!'
  },
  {
    id: 'superchain-surge',
    title: 'Superchain Surge',
    titleId: 'Gelombang Superchain',
    description: '1.75x XP & REP bonus when completing Superchain and Campaign difficulty levels.',
    descriptionId: 'Bonus 1.75x XP & REP saat menyelesaikan level kesulitan Superchain dan Campaign.',
    eventType: 'xp_boost',
    repMultiplier: 1.75,
    xpMultiplier: 1.75,
    questMultiplier: 1.0,
    badgeEmoji: '🌐',
    colorTheme: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    bannerGradient: 'from-emerald-600/20 via-teal-600/10 to-cyan-600/20 border-emerald-500/30',
    startDate: '2026-07-25T00:00:00Z',
    endDate: '2026-08-01T23:59:59Z',
    isActive: false,
    featuredDifficulty: 'superchain',
    activeBonusDescEn: '1.75x Superchain & Campaign Bonus Active!',
    activeBonusDescId: 'Bonus 1.75x Superchain & Campaign Aktif!'
  },
  {
    id: 'gas-free-frenzy',
    title: 'Gas-Free Frenzy',
    titleId: 'Frenzy Bebas Gas',
    description: '100% Gas fee discount on all maze transactions plus 1.25x completion XP bonus.',
    descriptionId: 'Diskon 100% biaya Gas pada semua transaksi labirin plus bonus 1.25x XP penyelesaian.',
    eventType: 'zero_gas',
    repMultiplier: 1.0,
    xpMultiplier: 1.25,
    questMultiplier: 1.0,
    badgeEmoji: '⛽',
    colorTheme: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    bannerGradient: 'from-cyan-600/20 via-blue-600/10 to-teal-600/20 border-cyan-500/30',
    startDate: '2026-07-30T00:00:00Z',
    endDate: '2026-08-05T23:59:59Z',
    isActive: false,
    activeBonusDescEn: '100% Gas Waiver & 1.25x XP Active!',
    activeBonusDescId: 'Bebas Biaya Gas & 1.25x XP Aktif!'
  }
];

class EventService {
  private events: GameEvent[];

  constructor() {
    // Load event overrides from localStorage if present
    const saved = localStorage.getItem('b20_event_overrides');
    if (saved) {
      try {
        const overrides: Record<string, boolean> = JSON.parse(saved);
        this.events = FEATURED_EVENTS.map(ev => ({
          ...ev,
          isActive: overrides[ev.id] !== undefined ? overrides[ev.id] : ev.isActive
        }));
      } catch (e) {
        this.events = [...FEATURED_EVENTS];
      }
    } else {
      this.events = [...FEATURED_EVENTS];
    }
  }

  public getAllEvents(): GameEvent[] {
    return this.events;
  }

  public getActiveEvents(): GameEvent[] {
    return this.events.filter(e => e.isActive);
  }

  public getReputationMultiplier(): number {
    const active = this.getActiveEvents();
    let multiplier = 1.0;
    active.forEach(e => {
      if (e.repMultiplier > 1.0) {
        multiplier *= e.repMultiplier;
      }
    });
    return Math.round(multiplier * 100) / 100;
  }

  public getXpMultiplier(completionTime?: number, difficulty?: string): number {
    const active = this.getActiveEvents();
    let multiplier = 1.0;
    active.forEach(e => {
      if (e.eventType === 'speedrun_boost') {
        if (completionTime !== undefined && completionTime <= 15) {
          multiplier *= e.xpMultiplier;
        }
      } else if (e.eventType === 'xp_boost') {
        if (!e.featuredDifficulty || difficulty === e.featuredDifficulty || difficulty === 'campaign') {
          multiplier *= e.xpMultiplier;
        }
      } else if (e.xpMultiplier > 1.0) {
        multiplier *= e.xpMultiplier;
      }
    });
    return Math.round(multiplier * 100) / 100;
  }

  public getQuestRewardMultiplier(): number {
    const active = this.getActiveEvents();
    let multiplier = 1.0;
    active.forEach(e => {
      if (e.eventType === 'quest_rush' || e.questMultiplier > 1.0) {
        multiplier *= e.questMultiplier;
      }
    });
    return Math.round(multiplier * 100) / 100;
  }

  public calculateEventBonuses(
    baseXp: number,
    baseRep: number,
    completionTime?: number,
    difficulty?: string
  ): EventBonusCalculation {
    const active = this.getActiveEvents();
    const appliedEvents: { id: string; title: string; emoji: string }[] = [];

    let xpMult = 1.0;
    let repMult = 1.0;

    active.forEach(e => {
      let applied = false;
      if (e.repMultiplier > 1.0) {
        repMult *= e.repMultiplier;
        applied = true;
      }
      if (e.eventType === 'speedrun_boost' && completionTime !== undefined && completionTime <= 15) {
        xpMult *= e.xpMultiplier;
        applied = true;
      } else if (e.eventType === 'xp_boost' && (!e.featuredDifficulty || difficulty === e.featuredDifficulty || difficulty === 'campaign')) {
        xpMult *= e.xpMultiplier;
        applied = true;
      } else if (e.xpMultiplier > 1.0) {
        xpMult *= e.xpMultiplier;
        applied = true;
      }

      if (applied) {
        appliedEvents.push({ id: e.id, title: e.title, emoji: e.badgeEmoji });
      }
    });

    const finalXp = Math.round(baseXp * xpMult);
    const finalRep = Math.round(baseRep * repMult);

    return {
      baseXp,
      finalXp,
      xpBonus: finalXp - baseXp,
      baseRep,
      finalRep,
      repBonus: finalRep - baseRep,
      appliedEvents
    };
  }

  public toggleEvent(eventId: string): boolean {
    const target = this.events.find(e => e.id === eventId);
    if (!target) return false;
    target.isActive = !target.isActive;

    const overrides: Record<string, boolean> = {};
    this.events.forEach(e => {
      overrides[e.id] = e.isActive;
    });
    localStorage.setItem('b20_event_overrides', JSON.stringify(overrides));
    return target.isActive;
  }

  public toggleEventActive(eventId: string, active?: boolean): boolean {
    const target = this.events.find(e => e.id === eventId);
    if (!target) return false;
    target.isActive = active !== undefined ? active : !target.isActive;

    const overrides: Record<string, boolean> = {};
    this.events.forEach(e => {
      overrides[e.id] = e.isActive;
    });
    localStorage.setItem('b20_event_overrides', JSON.stringify(overrides));
    return target.isActive;
  }

  public getCombinedMultipliers(): { repMultiplier: number; xpMultiplier: number; questMultiplier: number } {
    return {
      repMultiplier: this.getReputationMultiplier(),
      xpMultiplier: this.getXpMultiplier(),
      questMultiplier: this.getQuestRewardMultiplier()
    };
  }

  public getFormattedTimeRemaining(event: GameEvent): string {
    if (!event.isActive) return 'Inactive';
    const now = new Date().getTime();
    const end = new Date(event.endDate).getTime();
    const diffMs = end - now;

    if (diffMs <= 0) return 'Ending soon';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  }
}

export const eventService = new EventService();
