export type Difficulty = 'standard' | 'batch' | 'superchain';
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
