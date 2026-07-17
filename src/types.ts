export type Difficulty = 'standard' | 'batch' | 'superchain' | 'campaign';
export type L2Theme = 'base-blue' | 'optimism-amber' | 'degen-green' | 'blob-pink';


export interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  isGasNode?: boolean;       // Collectible: reduces transaction fee
  isValidatorNode?: boolean; // Collectible: reveals exit path or breaks wall
  isSpecialToken?: boolean;  // Collectible: key token to unlock feature buttons
  isPortal?: boolean;        // Ethereum L1 -> Base L2 Bridge: teleportation node
  portalTarget?: { x: number; y: number };
}

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface ScoreEntry {
  id: string;
  name: string;
  difficulty: Difficulty;
  time: number;       // In seconds
  tps: number;        // Transactions Per Second (calculated from speed)
  gasUsed: number;    // Simulated Gas Used (Gwei)
  blockHeight: number; // Block number when confirmed
  date: string;
  badges?: string[];  // Earned badge IDs
  totalMoves?: number;
  bestEfficiency?: number;
  level?: number;
}

export interface GameStats {
  timeElapsed: number;
  gasCost: number;       // base gas cost, decreases with collectibles
  transactionsMade: number;
  validatorTokens: number;
  isNoclipped: boolean;  // validator power-up active (can cross 1 wall)
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string; // Tailwind class
}

export const BADGES: Badge[] = [
  {
    id: 'speedster',
    name: 'Speedster',
    description: 'Selesai dalam < 15 detik',
    emoji: '⚡',
    color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Selesai dalam < 6 detik',
    emoji: '🚀',
    color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
  },
  {
    id: 'explorer',
    name: 'Chain Explorer',
    description: 'Selesaikan tingkat Standard',
    emoji: '🔍',
    color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
  },
  {
    id: 'batch-master',
    name: 'Batch Master',
    description: 'Selesaikan tingkat Batch',
    emoji: '📦',
    color: 'bg-[#0052FF]/10 text-blue-400 border border-[#0052FF]/20'
  },
  {
    id: 'superchain-overlord',
    name: 'Superchain Overlord',
    description: 'Selesaikan tingkat Superchain',
    emoji: '👑',
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
  },
  {
    id: 'gas-optimizer',
    name: 'Gas Optimizer',
    description: 'Gas super hemat (<= 10 Gwei)',
    emoji: '🍃',
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  },
  {
    id: 'wall-breaker',
    name: 'Wall Breaker',
    description: 'Hancurkan dinding firewall',
    emoji: '🔨',
    color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
  },
  {
    id: 'no-hints',
    name: 'No Hints',
    description: 'Selesai tanpa petunjuk rute',
    emoji: '🧠',
    color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
  }
];

export interface ChapterInfo {
  id: number;
  name: string;
  startLevel: number;
  endLevel: number;
  desc: string;
}

export const CHAPTERS: ChapterInfo[] = [
  { id: 1, name: "Genesis Builder", startLevel: 1, endLevel: 50, desc: "Welcome to the Superchain. Learn the basics of validation and transaction routing." },
  { id: 2, name: "Gas Academy", startLevel: 51, endLevel: 100, desc: "Navigate volatile gas fees. Collect gas nodes to optimize block throughput." },
  { id: 3, name: "Validator Trials", startLevel: 101, endLevel: 200, desc: "Demonstrate network stability. Secure nodes and bypass firewall restrictions." },
  { id: 4, name: "Firewall Network", startLevel: 201, endLevel: 300, desc: "Dodge dense firewall grids and optimize routing blocks dynamically." },
  { id: 5, name: "Superchain Gateway", startLevel: 301, endLevel: 500, desc: "Bridge L1 and L2 through complex portal networks." },
  { id: 6, name: "Optimism Nexus", startLevel: 501, endLevel: 700, desc: "Unite the Superchain. Optimize gas efficiency at scale." },
  { id: 7, name: "Builder District", startLevel: 701, endLevel: 900, desc: "Elite levels with narrow corridors, multiple portals, and low gas reserves." },
  { id: 8, name: "Launch Protocol", startLevel: 901, endLevel: 1000, desc: "Initiate B20 mainnet launch. Reach the ultimate validation block." }
];

export function getChapterForLevel(level: number): ChapterInfo {
  const chapter = CHAPTERS.find(ch => level >= ch.startLevel && level <= ch.endLevel);
  return chapter || CHAPTERS[CHAPTERS.length - 1];
}

export interface PlayerProfile {
  playerName: string;
  currentLevel: number;
  highestLevel: number;
  xp: number;
  winStreak: number;
  totalTime: number;
  totalKeys: number;
  firewallsDestroyed: number;
  gasSaved: number;
  totalMoves: number;
  builderScore: number;
}

export interface DailyMission {
  id: string;
  descriptionEn: string;
  descriptionId: string;
  target: number;
  current: number;
  rewardXp: number;
  rewardKeys: number;
  completed: boolean;
}

export function getRankName(xp: number, lang: 'en' | 'id'): string {
  if (xp < 100) return lang === 'id' ? 'Validator Pemula' : 'Novice Validator';
  if (xp < 300) return lang === 'id' ? 'Inisiator Blok' : 'Block Initiator';
  if (xp < 700) return lang === 'id' ? 'Penghemat Gwei' : 'Gwei Saver';
  if (xp < 1500) return lang === 'id' ? 'Pionir L2' : 'L2 Pioneer';
  if (xp < 3000) return lang === 'id' ? 'Arsitek Superchain' : 'Superchain Architect';
  if (xp < 6000) return lang === 'id' ? 'Master Konsensus' : 'Consensus Master';
  return lang === 'id' ? 'Legenda Base' : 'Base Legend';
}

