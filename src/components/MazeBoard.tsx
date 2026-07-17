import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Difficulty,
  Cell,
  PlayerPosition,
  GameStats,
  ScoreEntry,
  BADGES,
  L2Theme
} from '../types';
import { L2_THEMES } from '../lib/themes';
import {
  sound
} from './SoundEngine';
import {
  Zap,
  RotateCcw,
  ShieldCheck,
  Coins,
  Cpu,
  Tv,
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  Eye,
  CheckCircle,
  Share2,
  TrendingUp,
  Sparkles,
  Info,
  Key,
  Lock
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  delay: number;
}

interface MazeBoardProps {
  playerName: string;
  difficulty: Difficulty;
  isCampaign?: boolean;
  campaignLevel?: number;
  onLevelCompleted?: (nextLvl: number) => void;
  onGameCompleted: (score: ScoreEntry) => void;
  onBackToMenu: () => void;
  lang: Language;
  theme?: 'light' | 'dark';
  specialTokens: number;
  setSpecialTokens: React.Dispatch<React.SetStateAction<number>>;
  l2Theme?: L2Theme;
  onQuestProgress?: (questId: string, amount?: number) => void;
}

export default function MazeBoard({
  playerName,
  difficulty,
  isCampaign = false,
  campaignLevel = 1,
  onLevelCompleted,
  onGameCompleted,
  onBackToMenu,
  lang,
  theme = 'dark',
  specialTokens,
  setSpecialTokens,
  l2Theme = 'base-blue',
  onQuestProgress
}: MazeBoardProps) {
  // Determine grid size based on difficulty
  const getGridConfig = (diff: Difficulty, isCamp?: boolean, campLvl?: number) => {
    if (isCamp && campLvl) {
      // Linear scaling from level 1 (5x5) to level 1000 (21x21)
      const levelCols = Math.min(21, 5 + Math.floor(((campLvl - 1) / 999) * 16));
      const levelRows = levelCols;
      const totalCells = levelCols * levelRows;
      const gasCount = Math.max(1, Math.min(15, Math.floor(totalCells * 0.04)));
      const valCount = Math.max(1, Math.min(6, Math.floor(totalCells * 0.02)));
      const hasPortal = campLvl >= 10; // Portals unlocked starting from level 10
      return { cols: levelCols, rows: levelRows, gasCount, valCount, hasPortal };
    }

    switch (diff) {
      case 'standard':
        return { cols: 10, rows: 10, gasCount: 4, valCount: 2, hasPortal: false };
      case 'batch':
        return { cols: 15, rows: 15, gasCount: 7, valCount: 3, hasPortal: true };
      case 'superchain':
        return { cols: 21, rows: 21, gasCount: 12, valCount: 4, hasPortal: true };
      default:
        return { cols: 10, rows: 10, gasCount: 4, valCount: 2, hasPortal: false };
    }
  };

  const config = getGridConfig(difficulty, isCampaign, campaignLevel);
  const cols = config.cols;
  const rows = config.rows;

  // Game States
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [player, setPlayer] = useState<PlayerPosition>({ x: 0, y: 0 });
  const [stats, setStats] = useState<GameStats>({
    timeElapsed: 0,
    gasCost: 0.0095, // Gwei
    transactionsMade: 0,
    validatorTokens: 0,
    isNoclipped: false
  });
  const [isReady, setIsReady] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [floatingFeedbacks, setFloatingFeedbacks] = useState<{ id: number; text: string; type: string }[]>([]);
  
  const triggerFeedback = (text: string, type: string) => {
    const id = Date.now() + Math.random();
    setFloatingFeedbacks(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setFloatingFeedbacks(prev => prev.filter(item => item.id !== id));
    }, 1500);
  };

  const [blockHeight, setBlockHeight] = useState(18442000);
  const [autoSolving, setAutoSolving] = useState(false);

  const [hintUnlocked, setHintUnlocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tokensCollectedThisRun, setTokensCollectedThisRun] = useState(false);
  const [hadPenaltyThisRun, setHadPenaltyThisRun] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Achievements States
  const [hasUsedBypass, setHasUsedBypass] = useState(false);
  const [hasEnabledHints, setHasEnabledHints] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShareStats = () => {
    const optimalMoves = shortestPath.length > 0 ? shortestPath.length : 1;
    const actualMoves = Math.max(1, stats.transactionsMade);
    const computedEfficiency = Math.max(1, Math.min(100, Number(((optimalMoves / actualMoves) * 100).toFixed(1))));
    const computedTPS = (cols * rows * 120) / Math.max(0.5, stats.timeElapsed);
    const finalGasGwei = Math.max(1, Math.round(stats.gasCost * 1000));

    const emojiMap: Record<string, string> = {
      'speedster': '⚡',
      'speed-demon': '🚀',
      'explorer': '🔍',
      'batch-master': '📦',
      'superchain-overlord': '👑',
      'gas-optimizer': '🍃',
      'wall-breaker': '🔨',
      'no-hints': '🧠'
    };
    const badgeIcons = earnedBadges.map(bId => emojiMap[bId] || '').filter(Boolean).join('');

    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-d5wew2rrpvpsatud27lhly-555355811670.asia-southeast1.run.app';

    let textToCopy = '';
    if (lang === 'id') {
      textToCopy = [
        `⚡ BLOK LABIRIN BASE B20! ⚡`,
        `👤 Pembuat: ${playerName || 'Soul'}`,
        `🎮 Mode: ${isCampaign ? `Lvl ${campaignLevel}` : difficulty.toUpperCase()}`,
        `⏱️ ${stats.timeElapsed.toFixed(2)}s | ⚡ ${computedTPS.toFixed(1)} TPS | ⛽ ${finalGasGwei} Gwei`,
        `🎯 Efisiensi: ${computedEfficiency}%`,
        badgeIcons ? `🏆 Lencana: ${badgeIcons}` : null,
        `🔗 Main: ${appUrl}`,
      ].filter(Boolean).join('\n');
    } else if (lang === 'fr') {
      textToCopy = [
        `⚡ BLOC DE LABYRINTHE BASE! ⚡`,
        `👤 Bâtisseur: ${playerName || 'Soul'}`,
        `🎮 Mode: ${isCampaign ? `Niv ${campaignLevel}` : difficulty.toUpperCase()}`,
        `⏱️ ${stats.timeElapsed.toFixed(2)}s | ⚡ ${computedTPS.toFixed(1)} TPS | ⛽ ${finalGasGwei} Gwei`,
        `🎯 Efficacité: ${computedEfficiency}%`,
        badgeIcons ? `🏆 Badges: ${badgeIcons}` : null,
        `🔗 Jouer: ${appUrl}`,
      ].filter(Boolean).join('\n');
    } else if (lang === 'zh') {
      textToCopy = [
        `⚡ BASE B20 迷宫区块！⚡`,
        `👤 建设者: ${playerName || 'Soul'}`,
        `🎮 模式: ${isCampaign ? `关卡 ${campaignLevel}` : difficulty.toUpperCase()}`,
        `⏱️ ${stats.timeElapsed.toFixed(2)}秒 | ⚡ ${computedTPS.toFixed(1)} TPS | ⛽ ${finalGasGwei} Gwei`,
        `🎯 效率: ${computedEfficiency}%`,
        badgeIcons ? `🏆 徽章: ${badgeIcons}` : null,
        `🔗 开始建造: ${appUrl}`,
      ].filter(Boolean).join('\n');
    } else {
      textToCopy = [
        `⚡ BASE B20 MAZE BLOCK! ⚡`,
        `👤 Builder: ${playerName || 'Soul'}`,
        `🎮 Mode: ${isCampaign ? `Lvl ${campaignLevel}` : difficulty.toUpperCase()}`,
        `⏱️ ${stats.timeElapsed.toFixed(2)}s | ⚡ ${computedTPS.toFixed(1)} TPS | ⛽ ${finalGasGwei} Gwei`,
        `🎯 Efficiency: ${computedEfficiency}%`,
        badgeIcons ? `🏆 Badges: ${badgeIcons}` : null,
        `🔗 Play: ${appUrl}`,
      ].filter(Boolean).join('\n');
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShareCopied(true);
        sound.playPowerup();
        setTimeout(() => setShareCopied(false), 2500);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Solved Path State
  const [shortestPath, setShortestPath] = useState<[number, number][]>([]);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize block heights like a real blockchain
  useEffect(() => {
    blockTimerRef.current = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 2000); // Base block time is 2 seconds!
    return () => {
      if (blockTimerRef.current) clearInterval(blockTimerRef.current);
    };
  }, []);

  // Generate the maze
  const generateMaze = (forceFresh = false) => {
    sound.playReset();
    setAutoSolving(false);
    setShowHint(false);
    setHintUnlocked(false);
    setHasWon(false);
    setHasUsedBypass(false);
    setHasEnabledHints(false);
    setEarnedBadges([]);
    setParticles([]);
    setTokensCollectedThisRun(false);
    setHadPenaltyThisRun(false);
    setScreenShake(false);

    // Check if there's a saved state to resume from
    if (isCampaign && !forceFresh) {
      const savedStateStr = localStorage.getItem('base_maze_campaign_resume_state');
      if (savedStateStr) {
        try {
          const savedState = JSON.parse(savedStateStr);
          if (savedState && savedState.campaignLevel === campaignLevel && savedState.grid && savedState.player && savedState.stats) {
            setGrid(savedState.grid);
            setPlayer(savedState.player);
            setStats(savedState.stats);
            if (savedState.specialTokens !== undefined) {
              setSpecialTokens(savedState.specialTokens);
            }
            if (savedState.hasUsedBypass !== undefined) setHasUsedBypass(savedState.hasUsedBypass);
            if (savedState.hasEnabledHints !== undefined) setHasEnabledHints(savedState.hasEnabledHints);
            if (savedState.showHint !== undefined) setShowHint(savedState.showHint);
            if (savedState.hintUnlocked !== undefined) setHintUnlocked(savedState.hintUnlocked);
            
            setIsReady(true);
            calculateShortestPath(savedState.grid, savedState.player.x, savedState.player.y);
            
            setToastMessage(lang === 'id' 
              ? `📦 Melanjutkan Level ${campaignLevel} dari progres sebelumnya!` 
              : `📦 Resumed Level ${campaignLevel} from your previous progress!`
            );
            return; // Successfully loaded the save state
          }
        } catch (e) {
          console.error("Error parsing saved campaign state:", e);
        }
      }
    } else if (!isCampaign && !forceFresh) {
      const savedStateStr = localStorage.getItem('base_maze_classic_resume_state');
      if (savedStateStr) {
        try {
          const savedState = JSON.parse(savedStateStr);
          if (savedState && savedState.difficulty === difficulty && savedState.grid && savedState.player && savedState.stats) {
            setGrid(savedState.grid);
            setPlayer(savedState.player);
            setStats(savedState.stats);
            if (savedState.specialTokens !== undefined) {
              setSpecialTokens(savedState.specialTokens);
            }
            if (savedState.hasUsedBypass !== undefined) setHasUsedBypass(savedState.hasUsedBypass);
            if (savedState.hasEnabledHints !== undefined) setHasEnabledHints(savedState.hasEnabledHints);
            if (savedState.showHint !== undefined) setShowHint(savedState.showHint);
            if (savedState.hintUnlocked !== undefined) setHintUnlocked(savedState.hintUnlocked);
            
            setIsReady(true);
            calculateShortestPath(savedState.grid, savedState.player.x, savedState.player.y);
            
            setToastMessage(lang === 'id' 
              ? `📦 Melanjutkan sesi ${difficulty} dari progres sebelumnya!` 
              : `📦 Resumed ${difficulty} session from your previous progress!`
            );
            return; // Successfully loaded the save state
          }
        } catch (e) {
          console.error("Error parsing saved classic state:", e);
        }
      }
    }

    setPlayer({ x: 0, y: 0 });
    const initialValidatorTokens = isCampaign
      ? Number(localStorage.getItem('base_maze_campaign_bypass_keys') || '0')
      : 0;
    setStats({
      timeElapsed: 0,
      gasCost: 0.0095,
      transactionsMade: 0,
      validatorTokens: initialValidatorTokens,
      isNoclipped: false
    });

    // 1. Create grid outline
    const initialGrid: Cell[][] = [];
    for (let y = 0; y < rows; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < cols; x++) {
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        });
      }
      initialGrid.push(row);
    }

    // 2. DFS Maze Generation Algorithm with backtracking
    // Seeded random for deterministic procedural levels
    let randomSeed = isCampaign ? campaignLevel * 15485863 : 12345;
    const seedRandom = () => {
      if (!isCampaign) return Math.random();
      randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296;
      return randomSeed / 4294967296;
    };

    const stack: Cell[] = [];
    let current = initialGrid[0][0];
    current.visited = true;

    const getUnvisitedNeighbors = (cell: Cell, g: Cell[][]) => {
      const { x, y } = cell;
      const neighbors: Cell[] = [];

      if (y > 0 && !g[y - 1][x].visited) neighbors.push(g[y - 1][x]);
      if (x < cols - 1 && !g[y][x + 1].visited) neighbors.push(g[y][x + 1]);
      if (y < rows - 1 && !g[y + 1][x].visited) neighbors.push(g[y + 1][x]);
      if (x > 0 && !g[y][x - 1].visited) neighbors.push(g[y][x - 1]);

      return neighbors;
    };

    const removeWalls = (a: Cell, b: Cell) => {
      const xDiff = a.x - b.x;
      const yDiff = a.y - b.y;

      if (xDiff === 1) {
        a.walls.left = false;
        b.walls.right = false;
      } else if (xDiff === -1) {
        a.walls.right = false;
        b.walls.left = false;
      }

      if (yDiff === 1) {
        a.walls.top = false;
        b.walls.bottom = false;
      } else if (yDiff === -1) {
        a.walls.bottom = false;
        b.walls.top = false;
      }
    };

    let unvisitedCount = cols * rows - 1;
    while (unvisitedCount > 0) {
      const neighbors = getUnvisitedNeighbors(current, initialGrid);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(seedRandom() * neighbors.length)];
        stack.push(current);
        removeWalls(current, next);
        next.visited = true;
        current = next;
        unvisitedCount--;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        break;
      }
    }

    // 3. Inject Collectibles
    // Gas Nodes (Gwei savers)
    let gasPlaced = 0;
    while (gasPlaced < config.gasCount) {
      const rx = Math.floor(seedRandom() * cols);
      const ry = Math.floor(seedRandom() * rows);
      // Don't place on start, exit, or existing items
      if (
        (rx === 0 && ry === 0) ||
        (rx === cols - 1 && ry === rows - 1) ||
        initialGrid[ry][rx].isGasNode ||
        initialGrid[ry][rx].isValidatorNode
      ) {
        continue;
      }
      initialGrid[ry][rx].isGasNode = true;
      gasPlaced++;
    }

    // Validator Nodes (power-ups / bypass keys)
    let valPlaced = 0;
    if (isCampaign) {
      // Scale spawn rate from 12% (0.12) at Level 1 down to 2% (0.02) at Level 1000
      const validatorSpawnRate = Math.max(0.02, 0.12 - ((campaignLevel - 1) / 999) * 0.10);
      const maxVal = Math.max(1, Math.min(6, Math.floor((cols * rows) * validatorSpawnRate))); // Max capped proportionally
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (valPlaced >= maxVal) break;
          const cell = initialGrid[y][x];
          // Don't place on start, exit, or existing items
          if (
            (x === 0 && y === 0) ||
            (x === cols - 1 && y === rows - 1) ||
            cell.isGasNode ||
            cell.isValidatorNode
          ) {
            continue;
          }
          if (seedRandom() < validatorSpawnRate) {
            cell.isValidatorNode = true;
            valPlaced++;
          }
        }
      }

      // 100% Guarantee: If none was placed, force-place at least one at a random valid spot
      if (valPlaced === 0) {
        let placedForce = false;
        let attempts = 0;
        while (!placedForce && attempts < 100) {
          attempts++;
          const rx = Math.floor(seedRandom() * cols);
          const ry = Math.floor(seedRandom() * rows);
          const cell = initialGrid[ry][rx];
          if (
            (rx === 0 && ry === 0) ||
            (rx === cols - 1 && ry === rows - 1) ||
            cell.isGasNode ||
            cell.isValidatorNode
          ) {
            continue;
          }
          cell.isValidatorNode = true;
          valPlaced++;
          placedForce = true;
        }
      }
    } else {
      // Classic mode uses standard valCount setup
      while (valPlaced < config.valCount) {
        const rx = Math.floor(seedRandom() * cols);
        const ry = Math.floor(seedRandom() * rows);
        const cell = initialGrid[ry][rx];
        if (
          (rx === 0 && ry === 0) ||
          (rx === cols - 1 && ry === rows - 1) ||
          cell.isGasNode ||
          cell.isValidatorNode
        ) {
          continue;
        }
        cell.isValidatorNode = true;
        valPlaced++;
      }
    }

    // Portals (Bridges L1 <-> L2)
    if (config.hasPortal) {
      // Create a pair of portals
      let portalA: { x: number; y: number } | null = null;
      let portalB: { x: number; y: number } | null = null;

      while (!portalA) {
        const rx = Math.floor(seedRandom() * (cols / 2));
        const ry = Math.floor(seedRandom() * (rows / 2));
        if ((rx !== 0 || ry !== 0) && !initialGrid[ry][rx].isGasNode && !initialGrid[ry][rx].isValidatorNode) {
          portalA = { x: rx, y: ry };
        }
      }

      while (!portalB) {
        const rx = Math.floor(cols / 2 + seedRandom() * (cols / 2));
        const ry = Math.floor(rows / 2 + seedRandom() * (rows / 2));
        if ((rx !== cols - 1 || ry !== rows - 1) && !initialGrid[ry][rx].isGasNode && !initialGrid[ry][rx].isValidatorNode) {
          portalB = { x: rx, y: ry };
        }
      }

      initialGrid[portalA.y][portalA.x].isPortal = true;
      initialGrid[portalA.y][portalA.x].portalTarget = portalB;

      initialGrid[portalB.y][portalB.x].isPortal = true;
      initialGrid[portalB.y][portalB.x].portalTarget = portalA;
    }

    // 4. Inject Special Tokens
    // Scale level presence chance from 60% at Level 1 down to 10% at Level 1000
    const specialTokenLevelProb = isCampaign ? Math.max(0.10, 0.60 - ((campaignLevel - 1) / 999) * 0.50) : 0.45;
    // Scale cell density chance from 10% at Level 1 down to 1% at Level 1000
    const specialTokenCellRate = isCampaign ? Math.max(0.01, 0.10 - ((campaignLevel - 1) / 999) * 0.09) : 0.02;

    let keysPlaced = 0;
    const maxKeys = cols <= 10 ? 1 : 2;
    const hasKeysThisLevel = seedRandom() < specialTokenLevelProb;

    if (hasKeysThisLevel) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (keysPlaced >= maxKeys) break;
          const cell = initialGrid[y][x];
          // Don't place on start, exit, portals, gas nodes, or validator nodes
          if (
            (x === 0 && y === 0) ||
            (x === cols - 1 && y === rows - 1) ||
            cell.isGasNode ||
            cell.isValidatorNode ||
            cell.isPortal
          ) {
            continue;
          }
          if (seedRandom() < specialTokenCellRate) {
            cell.isSpecialToken = true;
            keysPlaced++;
          }
        }
      }
    }

    setGrid(initialGrid);
    setIsReady(true);

    // Solve the maze path for hints
    calculateShortestPath(initialGrid);
  };

  // Find shortest path from current player position to exit using BFS
  const calculateShortestPath = (g: Cell[][], startX = 0, startY = 0) => {
    if (g.length === 0) return;
    const queue: { x: number; y: number; path: [number, number][] }[] = [
      { x: startX, y: startY, path: [[startX, startY]] }
    ];
    const visitedSet = new Set<string>();
    visitedSet.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const { x, y, path } = queue.shift()!;

      if (x === cols - 1 && y === rows - 1) {
        setShortestPath(path);
        return;
      }

      const cell = g[y][x];

      // Standard transitions
      const directions = [
        { dx: 0, dy: -1, wall: cell.walls.top },    // up
        { dx: 1, dy: 0, wall: cell.walls.right },   // right
        { dx: 0, dy: 1, wall: cell.walls.bottom },  // down
        { dx: -1, dy: 0, wall: cell.walls.left }    // left
      ];

      for (const { dx, dy, wall } of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !wall) {
          const key = `${nx},${ny}`;
          if (!visitedSet.has(key)) {
            visitedSet.add(key);
            queue.push({ x: nx, y: ny, path: [...path, [nx, ny]] });
          }
        }
      }

      // Portal transition
      if (cell.isPortal && cell.portalTarget) {
        const { x: px, y: py } = cell.portalTarget;
        const key = `${px},${py}`;
        if (!visitedSet.has(key)) {
          visitedSet.add(key);
          queue.push({ x: px, y: py, path: [...path, [px, py]] });
        }
      }
    }
  };

  // Run the Maze Gen on startup and on difficulty shift or level shift
  useEffect(() => {
    generateMaze();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, isCampaign, campaignLevel]);

  // Save state on any gameplay update
  useEffect(() => {
    if (isReady && !hasWon && !autoSolving && grid.length > 0) {
      if (isCampaign) {
        const stateToSave = {
          campaignLevel,
          player,
          grid,
          stats,
          specialTokens,
          hasUsedBypass,
          hasEnabledHints,
          showHint,
          hintUnlocked
        };
        localStorage.setItem('base_maze_campaign_resume_state', JSON.stringify(stateToSave));
      } else {
        const stateToSave = {
          difficulty,
          player,
          grid,
          stats,
          specialTokens,
          hasUsedBypass,
          hasEnabledHints,
          showHint,
          hintUnlocked
        };
        localStorage.setItem('base_maze_classic_resume_state', JSON.stringify(stateToSave));
      }
    }
  }, [
    isCampaign,
    isReady,
    hasWon,
    autoSolving,
    campaignLevel,
    difficulty,
    player,
    grid,
    stats,
    specialTokens,
    hasUsedBypass,
    hasEnabledHints,
    showHint,
    hintUnlocked
  ]);

  // Track if hints are enabled during this maze run
  useEffect(() => {
    if (showHint) {
      setHasEnabledHints(true);
    }
  }, [showHint]);

  // Start continuous game timer once player starts moving
  useEffect(() => {
    if (stats.transactionsMade > 0 && !hasWon && !autoSolving) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 0.05
        }));
      }, 50);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats.transactionsMade, hasWon, autoSolving]);

  // Handle Movement Core Logic
  const movePlayer = (dx: number, dy: number) => {
    if (hasWon || autoSolving || grid.length === 0) return;

    const currentCell = grid[player.y][player.x];
    let canMove = false;
    let autoUsedNoclip = false;

    // 1. Try standard movement (no wall block)
    if (dy === -1 && !currentCell.walls.top) canMove = true;
    else if (dx === 1 && !currentCell.walls.right) canMove = true;
    else if (dy === 1 && !currentCell.walls.bottom) canMove = true;
    else if (dx === -1 && !currentCell.walls.left) canMove = true;

    // 2. Passive Validator Booster: automatically break firewall on contact ONLY if noclipped is pre-activated by the user pressing the bypass button
    if (!canMove && stats.isNoclipped) {
      const targetX = player.x + dx;
      const targetY = player.y + dy;
      if (targetX >= 0 && targetX < cols && targetY >= 0 && targetY < rows) {
        canMove = true;
        autoUsedNoclip = true;

        // Break the walls physically on the grid so it stays open!
        const targetCell = grid[targetY][targetX];
        const newGrid = [...grid];
        if (dx === 1) {
          currentCell.walls.right = false;
          targetCell.walls.left = false;
        } else if (dx === -1) {
          currentCell.walls.left = false;
          targetCell.walls.right = false;
        } else if (dy === 1) {
          currentCell.walls.bottom = false;
          targetCell.walls.top = false;
        } else if (dy === -1) {
          currentCell.walls.top = false;
          targetCell.walls.bottom = false;
        }
        setGrid(newGrid);
        sound.playPowerup();
        triggerFeedback('Firewall Broken!', 'firewall');
        setHasUsedBypass(true);
        if (onQuestProgress) {
          onQuestProgress('wall_breaker', 1);
        }
      }
    }

    if (canMove) {
      const nextX = player.x + dx;
      const nextY = player.y + dy;

      sound.playMove();

      // Check Collectibles
      let collectedGas = 0;
      let collectedVal = 0;
      const updatedGrid = [...grid];
      const nextCell = updatedGrid[nextY][nextX];

      if (nextCell.isGasNode) {
        nextCell.isGasNode = false;
        collectedGas = 1;
        sound.playCoin();
        triggerFeedback('+5 Gas', 'gas');
        setTokensCollectedThisRun(true);
      }

      if (nextCell.isValidatorNode) {
        nextCell.isValidatorNode = false;
        collectedVal = 1;
        sound.playPowerup();
        triggerFeedback('+1 Validator', 'validator');
        setTokensCollectedThisRun(true);
      }

      if (nextCell.isSpecialToken) {
        nextCell.isSpecialToken = false;
        sound.playPowerup();
        setSpecialTokens(prev => prev + 1);
        triggerFeedback('+1 Key', 'key');
        const curKeys = Number(localStorage.getItem('base_maze_profile_keys_collected') || '0');
        localStorage.setItem('base_maze_profile_keys_collected', String(curKeys + 1));
        setTokensCollectedThisRun(true);
      }

      // Check Portal Teleportation
      let finalX = nextX;
      let finalY = nextY;
      if (nextCell.isPortal && nextCell.portalTarget) {
        finalX = nextCell.portalTarget.x;
        finalY = nextCell.portalTarget.y;
        sound.playWin(); // Teleport sound
        triggerFeedback('Portal Activated!', 'portal');
      }

      setPlayer({ x: finalX, y: finalY });
      setStats(prev => {
        const nextGasCost = Math.max(0.0005, prev.gasCost - (collectedGas * 0.0015));
        let nextValidatorTokens = prev.validatorTokens + collectedVal;
        let nextIsNoclipped = prev.isNoclipped;

        if (autoUsedNoclip) {
          if (nextIsNoclipped) {
            nextIsNoclipped = false;
          }
        }

        return {
          ...prev,
          transactionsMade: prev.transactionsMade + 1,
          validatorTokens: nextValidatorTokens,
          isNoclipped: nextIsNoclipped,
          gasCost: nextGasCost
        };
      });

      // Check Win Condition
      if (finalX === cols - 1 && finalY === rows - 1) {
        triggerWin();
      } else {
        // Recalculate hint route from new position
        calculateShortestPath(updatedGrid, finalX, finalY);
      }
    } else {
      sound.playError();
    }
  };

  const triggerWin = () => {
    sound.playWin();
    setHasWon(true);
    if (timerRef.current) clearInterval(timerRef.current);

    if (onQuestProgress) {
      onQuestProgress('speedrun', 1);
    }

    let finalValidatorTokens = stats.validatorTokens;
    if (!tokensCollectedThisRun) {
      finalValidatorTokens = Math.max(0, stats.validatorTokens - 1);
      setHadPenaltyThisRun(true);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
      setStats(prev => ({ ...prev, validatorTokens: Math.max(0, prev.validatorTokens - 1) }));
      setSpecialTokens(prev => Math.max(0, prev - 1));
      sound.playError();
      setTimeout(() => {
        sound.playError();
      }, 180);
      triggerFeedback('-1 Bypass, -1 Key!', 'penalty');
    }

    if (isCampaign) {
      localStorage.removeItem('base_maze_campaign_resume_state');
      localStorage.setItem('base_maze_campaign_bypass_keys', String(finalValidatorTokens));
    } else {
      localStorage.removeItem('base_maze_classic_resume_state');
    }

    // Generate celebratory particles using motion/react
    const colors = ['#0052FF', '#38BDF8', '#34D399', '#FBBF24', '#F43F5E', '#A855F7'];
    const newParticles: Particle[] = Array.from({ length: 70 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 300;
      return {
        id: i,
        x: 0,
        y: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        angle: angle,
        speed: speed,
        delay: Math.random() * 0.2,
      };
    });
    setParticles(newParticles);

    // Calculate Game Score
    const timeToComplete = Math.max(0.5, stats.timeElapsed);
    // Base formula for L2 TPS: Grid area size multiplied by scaling index, divided by completion speed
    const baseComplexity = cols * rows;
    const computedTPS = (baseComplexity * 120) / timeToComplete;

    // Convert Gas cost to realistic dynamic Gwei mapping
    const finalGasGwei = Math.max(1, Math.round(stats.gasCost * 1000));

    // Calculate earned badges
    const currentEarnedBadges: string[] = [];
    if (timeToComplete < 15) currentEarnedBadges.push('speedster');
    if (timeToComplete < 6) currentEarnedBadges.push('speed-demon');
    if (difficulty === 'standard') currentEarnedBadges.push('explorer');
    if (difficulty === 'batch') currentEarnedBadges.push('batch-master');
    if (difficulty === 'superchain') currentEarnedBadges.push('superchain-overlord');
    if (finalGasGwei <= 10) currentEarnedBadges.push('gas-optimizer');
    if (hasUsedBypass) currentEarnedBadges.push('wall-breaker');
    if (!hasEnabledHints) currentEarnedBadges.push('no-hints');

    setEarnedBadges(currentEarnedBadges);

    // Wait slightly to show successful animation, then complete
    setTimeout(() => {
      // Calculate efficiency based on shortest path vs moves made
      const optimalMoves = shortestPath.length > 0 ? shortestPath.length : 1;
      const actualMoves = Math.max(1, stats.transactionsMade);
      const computedEfficiency = Math.max(1, Math.min(100, Number(((optimalMoves / actualMoves) * 100).toFixed(1))));

      const result: ScoreEntry = {
        id: 'user-' + Date.now(),
        name: playerName,
        difficulty,
        time: Number(timeToComplete.toFixed(2)),
        tps: Number(computedTPS.toFixed(1)),
        gasUsed: finalGasGwei,
        blockHeight: blockHeight,
        date: new Date().toISOString().split('T')[0],
        badges: currentEarnedBadges,
        totalMoves: stats.transactionsMade,
        bestEfficiency: computedEfficiency,
        level: isCampaign ? campaignLevel : undefined
      };

      // Update Player Progression Stats in localStorage
      try {
        const prevTotalMoves = Number(localStorage.getItem('base_maze_profile_total_moves') || '0');
        const prevTotalTime = Number(localStorage.getItem('base_maze_profile_total_time') || '0');
        const prevTotalGas = Number(localStorage.getItem('base_maze_profile_total_gas') || '0');
        const prevFirewalls = Number(localStorage.getItem('base_maze_profile_firewalls_destroyed') || '0');
        const prevScore = Number(localStorage.getItem('base_maze_profile_score') || '0');
        const prevWinStreak = Number(localStorage.getItem('base_maze_profile_win_streak') || '0');
        const prevXp = Number(localStorage.getItem('base_maze_profile_xp') || '0');

        // Calculate score for this level
        const thisLevelScore = Math.max(50, Math.round(computedTPS * 10 - finalGasGwei));
        // XP: 150 for campaign level, 100 for classic
        const thisLevelXp = isCampaign ? 150 : 100;

        localStorage.setItem('base_maze_profile_total_moves', String(prevTotalMoves + stats.transactionsMade));
        localStorage.setItem('base_maze_profile_total_time', String(prevTotalTime + Math.round(timeToComplete)));
        localStorage.setItem('base_maze_profile_total_gas', String(prevTotalGas + finalGasGwei));
        localStorage.setItem('base_maze_profile_firewalls_destroyed', String(prevFirewalls + (hasUsedBypass ? 1 : 0)));
        localStorage.setItem('base_maze_profile_score', String(prevScore + thisLevelScore));
        localStorage.setItem('base_maze_profile_win_streak', String(prevWinStreak + 1));
        localStorage.setItem('base_maze_profile_xp', String(prevXp + thisLevelXp));
      } catch (e) {
        console.error("Error updating player profile stats", e);
      }

      // Retrieve and update leaderboard scores
      const savedScores = localStorage.getItem('base_maze_scores');
      let currentScores: ScoreEntry[] = [];
      if (savedScores) {
        try {
          currentScores = JSON.parse(savedScores);
        } catch (e) {
          currentScores = [];
        }
      }
      
      const updatedScores = [...currentScores, result].sort((a, b) => a.time - b.time);
      localStorage.setItem('base_maze_scores', JSON.stringify(updatedScores));
      localStorage.setItem('base_maze_last_run_stats', JSON.stringify(result));

      if (isCampaign) {
        // Update level unlocks
        const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
        const nextLevel = campaignLevel + 1;
        if (nextLevel > currentUnlocked && nextLevel <= 1000) {
          localStorage.setItem('base_maze_unlocked_level', String(nextLevel));
        }
      } else {
        onGameCompleted(result);
      }
    }, 1500);
  };

  // Keyboard Event Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasWon || autoSolving) return;

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'];
      if (keys.includes(e.code) || keys.includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'KeyD':
          movePlayer(1, 0);
          break;
        case 'Space':
          activateValidatorPower();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [player, grid, stats, hasWon, autoSolving]);

  // Activate Validator firewall powerup
  const activateValidatorPower = () => {
    if (stats.validatorTokens > 0 && !stats.isNoclipped && !hasWon && !autoSolving) {
      sound.playPowerup();
      setStats(prev => ({
        ...prev,
        validatorTokens: prev.validatorTokens - 1,
        isNoclipped: true
      }));
    } else {
      sound.playError();
    }
  };

  // Auto solve animation (shows visual transaction routing in real-time)
  const runAutoSolve = async () => {
    if (autoSolving || hasWon || shortestPath.length === 0) return;
    setAutoSolving(true);
    sound.playPowerup();

    let pathIndex = 0;
    const interval = setInterval(() => {
      if (pathIndex < shortestPath.length) {
        const [x, y] = shortestPath[pathIndex];
        setPlayer({ x, y });
        sound.playMove();

        // Simulate collecting
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          if (newGrid[y][x].isGasNode) {
            newGrid[y][x].isGasNode = false;
            sound.playCoin();
            setTokensCollectedThisRun(true);
          }
          if (newGrid[y][x].isValidatorNode) {
            newGrid[y][x].isValidatorNode = false;
            sound.playPowerup();
            setTokensCollectedThisRun(true);
          }
          if (newGrid[y][x].isSpecialToken) {
            newGrid[y][x].isSpecialToken = false;
            sound.playPowerup();
            setSpecialTokens(prev => prev + 1);
            const curKeys = Number(localStorage.getItem('base_maze_profile_keys_collected') || '0');
            localStorage.setItem('base_maze_profile_keys_collected', String(curKeys + 1));
            setTokensCollectedThisRun(true);
          }
          return newGrid;
        });

        pathIndex++;
      } else {
        clearInterval(interval);
        triggerWin();
      }
    }, 120);
  };

  const handleHintClick = () => {
    if (hintUnlocked) {
      sound.playMove();
      setShowHint(!showHint);
    } else {
      if (specialTokens >= 1) {
        setSpecialTokens(prev => prev - 1);
        setHintUnlocked(true);
        setShowHint(true);
        sound.playPowerup();
        setHasEnabledHints(true);
        if (onQuestProgress) {
          onQuestProgress('optimistic', 1);
        }
      } else {
        sound.playError();
        setToastMessage(translations[lang].mazeboard.insufficient_tokens);
      }
    }
  };

  const handleAutoSolveClick = () => {
    if (autoSolving || hasWon) return;
    if (specialTokens >= 1) {
      setSpecialTokens(prev => prev - 1);
      runAutoSolve();
    } else {
      sound.playError();
      setToastMessage(translations[lang].mazeboard.insufficient_tokens);
    }
  };

  const handleRegenClick = () => {
    if (isCampaign) {
      // In campaign, let them reset/restart the level for free!
      localStorage.removeItem('base_maze_campaign_resume_state');
      setHintUnlocked(false);
      generateMaze(true); // Force fresh generation
    } else {
      if (specialTokens >= 1) {
        localStorage.removeItem('base_maze_classic_resume_state');
        setSpecialTokens(prev => prev - 1);
        setHintUnlocked(false);
        generateMaze(true); // Force fresh generation
      } else {
        sound.playError();
        setToastMessage(translations[lang].mazeboard.insufficient_tokens);
      }
    }
  };

  // Helper styles for cell walls
  const getCellClassName = (cell: Cell) => {
    let classes = "relative aspect-square transition-all duration-150 border-cloud-white/20 ";
    const activeTheme = L2_THEMES[l2Theme] || L2_THEMES['base-blue'];

    // Crisp solid L2-themed walls for maximum structural clarity
    if (cell.walls.top) classes += `border-t-[3px] ${activeTheme.wallBorderTop} `;
    else classes += "border-t border-t-cerulean-sky/10 ";

    if (cell.walls.right) classes += `border-r-[3px] ${activeTheme.wallBorderRight} `;
    else classes += "border-r border-r-cerulean-sky/10 ";

    if (cell.walls.bottom) classes += `border-b-[3px] ${activeTheme.wallBorderBottom} `;
    else classes += "border-b border-b-cerulean-sky/10 ";

    if (cell.walls.left) classes += `border-l-[3px] ${activeTheme.wallBorderLeft} `;
    else classes += "border-l border-l-cerulean-sky/10 ";

    return classes;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto px-4 py-4">
      {/* LEFT COLUMN: Main Game Maze */}
      <div className="lg:col-span-8 flex flex-col items-center">
        {/* Top bar */}
        <div className="w-full p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-md transition-all duration-300 cora-desk-card">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-deep-navy/70">{translations[lang].mazeboard.node_connected}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-cerulean-sky/10 text-cerulean-sky border-cerulean-sky/20 font-bold">
              {difficulty.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Hint Button */}
            <button
              type="button"
              onClick={handleHintClick}
              className={`p-2 rounded-xl border text-xs font-sans font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showHint
                  ? 'bg-cerulean-sky/15 border-cerulean-sky text-cerulean-sky'
                  : 'bg-white border-deep-navy/10 text-deep-navy/70 hover:text-deep-navy hover:border-deep-navy/30 hover:bg-cloud-white shadow-sm'
              }`}
              title={translations[lang].mazeboard.hint_tooltip}
            >
              {hintUnlocked ? (
                <Eye size={14} className="text-emerald-500" />
              ) : (
                <Lock size={12} className="text-warm-red" />
              )}
              <span className="hidden sm:inline">{translations[lang].mazeboard.hint_btn}</span>
              {!hintUnlocked && (
                <span className="text-[9px] font-mono font-bold bg-warm-red/10 text-warm-red px-1 py-0.5 rounded border border-warm-red/20">
                  1 🔑
                </span>
              )}
            </button>

            {/* Auto-Solve Button */}
            <button
              type="button"
              onClick={handleAutoSolveClick}
              disabled={autoSolving || hasWon}
              className="p-2 border rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer bg-white border-deep-navy/10 text-deep-navy/70 hover:border-warm-red hover:text-warm-red hover:bg-cloud-white shadow-sm"
              title={translations[lang].mazeboard.autosolve_tooltip}
            >
              <Sparkles size={14} className="text-warm-red" />
              <span className="hidden sm:inline">{translations[lang].mazeboard.autosolve_btn}</span>
              <span className="text-[9px] font-mono font-bold bg-warm-red/10 text-warm-red px-1 py-0.5 rounded border border-warm-red/20">
                1 🔑
              </span>
            </button>

            {/* Regenerate Button */}
            <button
              type="button"
              onClick={handleRegenClick}
              disabled={autoSolving}
              className="p-2 border rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer bg-white border-deep-navy/10 text-deep-navy/70 hover:text-deep-navy hover:border-deep-navy/30 hover:bg-cloud-white shadow-sm"
              title={translations[lang].mazeboard.regen_tooltip}
            >
              <RotateCcw size={14} />
              <span className="text-[9px] font-mono font-bold bg-warm-red/10 text-warm-red px-1 py-0.5 rounded border border-warm-red/20">
                1 🔑
              </span>
            </button>
          </div>
        </div>

        {/* Floating warning toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-warm-red/10 border border-warm-red/30 text-warm-red px-4 py-2 rounded-xl text-xs font-sans font-semibold mb-4 flex items-center gap-2 justify-center shadow-sm z-20"
            >
              <Lock size={12} className="animate-bounce text-warm-red" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Actual Maze Grid */}
        <motion.div
          animate={screenShake ? {
            x: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0],
            y: [0, 6, -6, 6, -6, 4, -4, 2, -2, 0]
          } : {}}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative w-full max-w-xl aspect-square rounded-2xl p-2 md:p-3 overflow-hidden transition-all duration-300 border border-deep-navy/15 bg-white/90 shadow-xl shadow-cerulean-sky/5"
        >
          {grid.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center font-mono text-deep-navy/40">
              {translations[lang].mazeboard.generating_grid}
            </div>
          ) : (
            <div
              className="grid w-full h-full gap-0 select-none relative"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
              }}
            >
              {grid.map((row, y) =>
                row.map((cell, x) => {
                  const isStart = x === 0 && y === 0;
                  const isExit = x === cols - 1 && y === rows - 1;
                  const isPlayer = player.x === x && player.y === y;
                  const activeTheme = L2_THEMES[l2Theme] || L2_THEMES['base-blue'];

                  // Is this cell on the optimized hint path?
                  const isOnHint = showHint && shortestPath.some(([px, py]) => px === x && py === y);

                  return (
                    <div
                      key={`${x}-${y}`}
                      id={`cell-${x}-${y}`}
                      className={getCellClassName(cell)}
                    >
                      {/* Background fill if starting / exit / hint path */}
                      {isStart && (
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold z-0 bg-cerulean-sky/10 text-cerulean-sky">
                          {translations[lang].mazeboard.wallet_label}
                        </div>
                      )}
                      {isExit && (
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold z-0 bg-warm-red/10 text-warm-red">
                          {translations[lang].mazeboard.block_label}
                        </div>
                      )}

                      {/* Gas-Optimized Route Hint Line - beautifully stylized! */}
                      {isOnHint && !isPlayer && !isStart && !isExit && (
                        <div className="absolute inset-2 rounded-full animate-pulse z-0 border bg-warm-red/10 border-warm-red/35 shadow-sm shadow-warm-red/10"></div>
                      )}

                      {/* Render Portal Bridge */}
                      {cell.isPortal && (
                        <div className="absolute inset-1.5 rounded-full bg-cerulean-sky/20 border border-cerulean-sky/40 flex items-center justify-center animate-spin z-0">
                          <Zap size={10} className="text-cerulean-sky" />
                        </div>
                      )}

                      {/* Render Gas Collectible */}
                      {cell.isGasNode && (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2.5 }}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <Coins className="w-4 h-4 text-emerald-600 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                        </motion.div>
                      )}

                      {/* Render Validator Power-up Collectible */}
                      {cell.isValidatorNode && (
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 1.8 }}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <ShieldCheck className="w-4 h-4 text-cerulean-sky drop-shadow-[0_0_8px_rgba(17,123,200,0.4)]" />
                        </motion.div>
                      )}

                      {/* Render Special Key Collectible */}
                      {cell.isSpecialToken && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <Key className="w-4 h-4 text-warm-red drop-shadow-[0_0_8px_rgba(200,60,42,0.4)]" />
                        </motion.div>
                      )}

                      {/* Render Player Token with Glowing Base Circle Logo */}
                      {isPlayer && (
                        <motion.div
                          layoutId="player-token"
                          className="absolute inset-1 rounded-full border border-white flex items-center justify-center shadow-lg z-20 transition-colors duration-300"
                          style={{
                            backgroundColor: activeTheme.accentColor,
                            boxShadow: `0 10px 15px -3px ${activeTheme.accentColor}44, 0 4px 6px -4px ${activeTheme.accentColor}44`
                          }}
                        >
                          {/* Inner white circle */}
                          <div className="w-[60%] h-[60%] bg-white rounded-full flex items-center justify-center">
                            {/* Inner deep navy dot */}
                            <div
                              className="w-[45%] h-[45%] rounded-full animate-pulse transition-colors duration-300"
                              style={{ backgroundColor: activeTheme.accentColor }}
                            ></div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Scanner Overlay during Auto-solve */}
          {autoSolving && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-deep-navy to-transparent animate-scanner opacity-80 pointer-events-none"></div>
          )}

          {/* Success Overlay message */}
          <AnimatePresence>
            {hasWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto z-30 transition-colors duration-300 bg-cloud-white/95 border-2 border-warm-red/20 rounded-2xl shadow-2xl py-6 px-4 select-none"
              >
                {/* Celebration Particle Explosion */}
                {particles.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 flex items-center justify-center">
                    {particles.map((p) => {
                      const targetX = Math.cos(p.angle) * p.speed;
                      const targetY = Math.sin(p.angle) * p.speed;
                      return (
                        <motion.div
                          key={p.id}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
                          animate={{
                            x: targetX,
                            y: [0, targetY - 60, targetY + 200], // parabolic gravity path
                            opacity: [1, 1, 0],
                            scale: [0.8, 1.4, 0.2],
                            rotate: [0, Math.random() * 360 + 180],
                          }}
                          transition={{
                            duration: 1.8 + Math.random() * 1.2,
                            ease: "easeOut",
                            delay: p.delay,
                          }}
                          style={{
                            position: 'absolute',
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            borderRadius: Math.random() > 0.4 ? '50%' : '15%',
                            boxShadow: `0 0 10px ${p.color}`,
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center mb-2 md:mb-4 shadow-lg bg-emerald-50 border-emerald-500 text-emerald-600 shrink-0">
                  <CheckCircle size={30} className="animate-bounce" />
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-deep-navy text-center px-4">
                  {translations[lang].mazeboard.confirmed_title}
                </h2>
                <p className="text-[10px] md:text-xs font-mono mt-1 uppercase text-deep-navy/60 text-center px-4">
                  {translations[lang].mazeboard.confirmed_subtitle}
                </p>

                <div className="mt-3 md:mt-4 flex gap-3 md:gap-6 p-3 md:p-4 rounded-xl text-center font-mono border shadow-inner bg-cloud-white border-deep-navy/10 w-full max-w-sm justify-around shrink-0">
                  <div>
                    <span className="block text-[9px] md:text-[10px] text-deep-navy/50 uppercase">{translations[lang].mazeboard.time_short}</span>
                    <span className="text-xs md:text-sm font-bold text-deep-navy">{stats.timeElapsed.toFixed(2)}s</span>
                  </div>
                  <div className="border-r border-deep-navy/10"></div>
                  <div>
                    <span className="block text-[9px] md:text-[10px] text-deep-navy/50 uppercase">{translations[lang].mazeboard.throughput_short}</span>
                    <span className="text-xs md:text-sm font-bold text-cerulean-sky">
                      {((cols * rows * 120) / Math.max(0.5, stats.timeElapsed)).toLocaleString(undefined, { maximumFractionDigits: 1 })} TPS
                    </span>
                  </div>
                  <div className="border-r border-deep-navy/10"></div>
                  <div>
                    <span className="block text-[9px] md:text-[10px] text-deep-navy/50 uppercase">Gas Gwei</span>
                    <span className="text-xs md:text-sm font-bold text-warm-red">
                      {Math.max(1, Math.round(stats.gasCost * 1000))}
                    </span>
                  </div>
                </div>

                {hadPenaltyThisRun && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 md:mt-4 px-4 py-2 border rounded-xl flex items-center gap-2.5 bg-warm-red/10 border-warm-red/30 text-warm-red font-mono text-[10px] md:text-[11px] text-left w-full max-w-sm shrink-0"
                  >
                    <span className="text-sm md:text-base">⚠️</span>
                    <div>
                      <p className="font-bold uppercase tracking-wide">
                        {lang === 'id' ? 'PENALTI RESOURCE!' : 'RESOURCE PENALTY!'}
                      </p>
                      <p className="text-[9px] md:text-[10px] opacity-80 mt-0.5 leading-normal">
                        {lang === 'id' 
                          ? 'Selesaikan babak tanpa mengambil token mint: -1 Bypass & -1 Kunci Khusus!'
                          : 'Completed without collecting mint tokens: -1 Bypass & -1 Special Key!'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Earned Badges Showcase */}
                {earnedBadges.length > 0 && (
                  <div className="mt-4 md:mt-5 text-center px-4 w-full max-w-sm shrink-0">
                    <span className="text-[9px] md:text-[10px] font-mono text-deep-navy/50 uppercase tracking-widest block mb-2">{translations[lang].mazeboard.earned_badges}</span>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {earnedBadges.map(badgeId => {
                        const b = BADGES.find(x => x.id === badgeId);
                        if (!b) return null;
                        const bLocal = translations[lang].badges[badgeId] || b;
                        const styleClasses = b.color.replace('bg-rose-500/10', 'bg-rose-50 border-rose-200').replace('text-rose-400', 'text-rose-600 font-bold').replace('bg-teal-500/10', 'bg-teal-50 border-teal-200').replace('text-teal-400', 'text-teal-600 font-bold').replace('bg-[#0052FF]/10', 'bg-blue-50 border-blue-200').replace('text-blue-400', 'text-cerulean-sky font-bold').replace('bg-purple-500/10', 'bg-purple-50 border-purple-200').replace('text-purple-400', 'text-purple-600 font-bold').replace('bg-emerald-500/10', 'bg-emerald-50 border-emerald-200').replace('text-emerald-400', 'text-emerald-600 font-bold').replace('bg-orange-500/10', 'bg-orange-50 border-orange-200').replace('text-orange-400', 'text-orange-600 font-bold').replace('bg-cyan-500/10', 'bg-cyan-50 border-cyan-200').replace('text-cyan-400', 'text-cyan-600 font-bold');
                        
                        return (
                          <motion.div
                            key={badgeId}
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`text-[9px] md:text-xs font-mono px-2 py-0.5 md:py-1 rounded-lg flex items-center gap-1.5 border ${styleClasses} shadow-sm`}
                            title={bLocal.description}
                          >
                            <span className="text-xs md:text-sm">{b.emoji}</span>
                            <span className="font-semibold text-[9px] md:text-[10px]">{bLocal.name}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Share Run Stats Action */}
                <div className="mt-4 md:mt-5 w-full max-w-xs px-4 shrink-0">
                  <button
                    onClick={handleShareStats}
                    className={`w-full py-2 md:py-2.5 px-4 rounded-xl font-sans font-bold text-[11px] md:text-xs flex items-center justify-center gap-2 border transition shadow-sm cursor-pointer ${
                      shareCopied
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/10'
                        : 'bg-gradient-to-r from-cerulean-sky/5 to-cerulean-sky/10 border-cerulean-sky/20 text-cerulean-sky hover:from-cerulean-sky/10 hover:to-cerulean-sky/20'
                    }`}
                  >
                    {shareCopied ? (
                      <>
                        <CheckCircle size={14} className="animate-pulse" />
                        <span>{lang === 'id' ? 'Berhasil Disalin!' : 'Copied to Clipboard!'}</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} />
                        <span>{lang === 'id' ? 'Bagikan Hasil Run' : 'Share Run Stats'}</span>
                      </>
                    )}
                  </button>
                </div>

                {isCampaign ? (
                  <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs px-4 pb-4 shrink-0">
                    {campaignLevel < 1000 ? (
                      <button
                        onClick={() => {
                          sound.playPowerup();
                          if (onLevelCompleted) {
                            onLevelCompleted(campaignLevel + 1);
                          }
                        }}
                        className="flex-1 py-2 md:py-2.5 bg-deep-navy text-white font-sans font-bold rounded-xl text-[11px] md:text-xs shadow-md shadow-deep-navy/20 cursor-pointer hover:bg-deep-navy/90 transition text-center"
                      >
                        {lang === 'id' ? `Level Berikutnya (${campaignLevel + 1})` : `Next Level (${campaignLevel + 1})`}
                      </button>
                    ) : (
                      <div className="w-full text-center py-2 text-warm-red font-extrabold font-mono text-xs animate-pulse">
                        🎉 {lang === 'id' ? 'TAMAT! SELESAI LEVEL 1000!' : 'CAMPAIGN COMPLETED! LEVEL 1000!'}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        sound.playMove();
                        onBackToMenu();
                      }}
                      className="flex-1 py-2 md:py-2.5 font-sans font-semibold rounded-xl text-[11px] md:text-xs transition cursor-pointer border bg-white border-deep-navy/15 text-deep-navy hover:bg-cloud-white shadow-sm"
                    >
                      {lang === 'id' ? 'Kembali ke Menu' : 'Back to Menu'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs px-4 pb-4 shrink-0">
                    <button
                      onClick={() => {
                        sound.playPowerup();
                        generateMaze(true);
                      }}
                      className="flex-1 py-2 md:py-2.5 bg-deep-navy text-white font-sans font-bold rounded-xl text-[11px] md:text-xs shadow-md shadow-deep-navy/20 cursor-pointer hover:bg-deep-navy/90 transition text-center"
                    >
                      {lang === 'id' ? 'Main Lagi' : 'Play Again'}
                    </button>
                    <button
                      onClick={() => {
                        sound.playMove();
                        onBackToMenu();
                      }}
                      className="flex-1 py-2 md:py-2.5 font-sans font-semibold rounded-xl text-[11px] md:text-xs transition cursor-pointer border bg-white border-deep-navy/15 text-deep-navy hover:bg-cloud-white shadow-sm"
                    >
                      {lang === 'id' ? 'Kembali ke Menu' : 'Back to Menu'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Keyboards Hints for PC Users */}
        <p className="hidden md:block text-[10px] font-mono mt-4 text-center text-deep-navy/50">
          {translations[lang].mazeboard.keyboard_hints}
        </p>

        {/* Mobile touch D-pad */}
        <div className="block lg:hidden mt-6 w-full max-w-[180px]">
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <button
              onClick={() => movePlayer(0, -1)}
              className="aspect-square border hover:bg-cerulean-sky/10 active:bg-cerulean-sky active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-sm transition-colors bg-white border-deep-navy/15 text-deep-navy"
            >
              <ArrowBigUp size={24} />
            </button>
            <div></div>

            <button
              onClick={() => movePlayer(-1, 0)}
              className="aspect-square border hover:bg-cerulean-sky/10 active:bg-cerulean-sky active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-sm transition-colors bg-white border-deep-navy/15 text-deep-navy"
            >
              <ArrowBigLeft size={24} />
            </button>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-deep-navy rounded-full"></div>
            </div>
            <button
              onClick={() => movePlayer(1, 0)}
              className="aspect-square border hover:bg-cerulean-sky/10 active:bg-cerulean-sky active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-sm transition-colors bg-white border-deep-navy/15 text-deep-navy"
            >
              <ArrowBigRight size={24} />
            </button>

            <div></div>
            <button
              onClick={() => movePlayer(0, 1)}
              className="aspect-square border hover:bg-cerulean-sky/10 active:bg-cerulean-sky active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-sm transition-colors bg-white border-deep-navy/15 text-deep-navy"
            >
              <ArrowBigDown size={24} />
            </button>
            <div></div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Statistics Dashboard & Info */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl shadow-md transition-all duration-300 cora-desk-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center font-serif font-bold bg-cerulean-sky/10 border-cerulean-sky/20 text-cerulean-sky">
              {playerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-sans font-bold text-deep-navy">{playerName}</h2>
              <p className="text-[10px] font-mono text-deep-navy/50 uppercase tracking-wider">{translations[lang].mazeboard.profile_title}</p>
            </div>
          </div>

          <div className="mt-4 border-t pt-4 flex flex-col gap-2 border-deep-navy/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-deep-navy/50">{translations[lang].mazeboard.block_num_label}</span>
              <span className="font-semibold text-deep-navy/80">#{blockHeight}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-deep-navy/50">{translations[lang].mazeboard.stability_label}</span>
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {translations[lang].mazeboard.stability_val}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Telemetry Stats */}
        <div className="p-5 rounded-2xl shadow-md transition-all duration-300 cora-desk-card">
          <h3 className="text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-1.5 text-deep-navy/70 font-bold">
            <Cpu size={12} className="text-cerulean-sky" />
            {translations[lang].mazeboard.telemetry_title}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Live Timer */}
            <div className="p-3 rounded-xl border bg-cloud-white border-deep-navy/10 shadow-sm">
              <span className="block text-[10px] font-mono text-deep-navy/50 uppercase">{translations[lang].mazeboard.time_elapsed_label}</span>
              <span className="text-lg font-mono font-bold tracking-tight text-deep-navy">{stats.timeElapsed.toFixed(2)}s</span>
            </div>

            {/* Simulated Live Gas */}
            <div className="p-3 rounded-xl border bg-cloud-white border-deep-navy/10 shadow-sm">
              <span className="block text-[10px] font-mono text-deep-navy/50 uppercase font-bold">{translations[lang].mazeboard.gas_fee_label}</span>
              <span className="text-lg font-mono font-bold tracking-tight text-emerald-600">
                {Math.max(1, Math.round(stats.gasCost * 1000))} Gwei
              </span>
            </div>

            {/* Total Moves */}
            <div className="p-3 rounded-xl border bg-cloud-white border-deep-navy/10 shadow-sm">
              <span className="block text-[10px] font-mono text-deep-navy/50 uppercase">{translations[lang].mazeboard.data_processed_label}</span>
              <span className="text-sm font-mono font-bold text-deep-navy/70">{stats.transactionsMade} hops</span>
            </div>

            {/* TPS estimation */}
            <div className="p-3 rounded-xl border bg-cloud-white border-deep-navy/10 shadow-sm">
              <span className="block text-[10px] font-mono text-deep-navy/50 uppercase">{translations[lang].mazeboard.tps_est_label}</span>
              <span className="text-sm font-mono font-extrabold text-cerulean-sky">
                {stats.transactionsMade === 0
                  ? '0.0'
                  : ((cols * rows * 120) / Math.max(0.5, stats.timeElapsed)).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
            </div>
          </div>
        </div>

        {/* Powerups & Validator Token */}
        <div className="p-5 rounded-2xl shadow-md transition-all duration-300 cora-desk-card">
          <h3 className="text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-1.5 text-deep-navy/70 font-bold">
            <ShieldCheck size={12} className="text-cerulean-sky" />
            {translations[lang].mazeboard.bypass_title}
          </h3>

          <p className="text-xs leading-relaxed mb-4 text-deep-navy/60">
            {translations[lang].mazeboard.bypass_desc}
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl border bg-cloud-white border-deep-navy/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-warm-red/10 text-warm-red border-warm-red/20 shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="block text-[10px] font-mono text-deep-navy/50 uppercase">{translations[lang].mazeboard.bypass_available}</span>
                <span className="text-sm font-mono font-bold text-deep-navy">{stats.validatorTokens} Tokens</span>
              </div>
            </div>

            <button
              onClick={activateValidatorPower}
              disabled={stats.validatorTokens === 0 || stats.isNoclipped || hasWon || autoSolving}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer flex items-center gap-1 ${
                stats.isNoclipped
                  ? 'bg-warm-red text-white animate-pulse shadow-md'
                  : 'bg-deep-navy hover:bg-deep-navy/90 disabled:opacity-40 text-white shadow-sm'
              }`}
            >
              {stats.isNoclipped ? translations[lang].mazeboard.bypass_active : translations[lang].mazeboard.bypass_use}
            </button>
          </div>
        </div>

        {/* Special Keys Card */}
        <div className="p-5 rounded-2xl shadow-md transition-all duration-300 cora-desk-card">
          <h3 className="text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-1.5 text-deep-navy/70 font-bold">
            <Key size={12} className="text-warm-red" />
            {translations[lang].mazeboard.special_tokens_label}
          </h3>

          <p className="text-xs leading-relaxed mb-4 text-deep-navy/60">
            {lang === 'id' 
              ? 'Token Kunci Spesial muncul acak di labirin (peluang 10-20% per sel). Kumpulkan dan belanjakan kunci untuk membuka fitur pembantu!' 
              : 'Special Key Tokens spawn randomly in the maze (10-20% chance per cell). Collect and spend keys to unlock helper features!'}
          </p>

          <div className="flex items-center gap-3 p-3 rounded-xl border bg-cloud-white border-deep-navy/10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-warm-red/10 text-warm-red border-warm-red/25 shadow-sm">
              <Key size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-deep-navy/50 uppercase">{translations[lang].mazeboard.special_tokens_label}</span>
              <span className="text-base font-mono font-bold text-deep-navy">
                {specialTokens} 🔑
              </span>
            </div>
          </div>
        </div>

        {/* Tech Corner Info */}
        <div className="p-4 rounded-xl text-xs flex gap-2.5 items-start leading-relaxed border transition-all duration-300 bg-cerulean-sky/5 border-cerulean-sky/10 text-deep-navy/85 shadow-sm">
          <Info size={16} className="text-cerulean-sky flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-sans font-bold text-deep-navy">{translations[lang].mazeboard.why_base_title}</strong> {translations[lang].mazeboard.why_base_desc}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => { sound.playMove(); onBackToMenu(); }}
          className="w-full font-sans font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer border bg-white hover:bg-cloud-white border-deep-navy/15 text-deep-navy/80 hover:text-deep-navy shadow-sm"
        >
          {translations[lang].mazeboard.back_to_menu}
        </button>
      </div>
    </div>
  );
}
