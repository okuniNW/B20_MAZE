import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Difficulty,
  Cell,
  PlayerPosition,
  GameStats,
  ScoreEntry,
  BADGES
} from '../types';
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
  setSpecialTokens
}: MazeBoardProps) {
  // Determine grid size based on difficulty
  const getGridConfig = (diff: Difficulty, isCamp?: boolean, campLvl?: number) => {
    if (isCamp && campLvl) {
      const levelCols = Math.min(21, 4 + Math.floor((campLvl - 1) * 0.35));
      const levelRows = levelCols;
      const totalCells = levelCols * levelRows;
      const gasCount = Math.max(1, Math.min(12, Math.floor(totalCells * 0.03)));
      const valCount = Math.max(1, Math.min(5, Math.floor(totalCells * 0.015)));
      const hasPortal = campLvl >= 5;
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
  const [blockHeight, setBlockHeight] = useState(18442000);
  const [autoSolving, setAutoSolving] = useState(false);

   const [hintUnlocked, setHintUnlocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    }

    setPlayer({ x: 0, y: 0 });
    setStats({
      timeElapsed: 0,
      gasCost: 0.0095,
      transactionsMade: 0,
      validatorTokens: 0,
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
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
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

    // 3. Inject Collectibles (with safety attempts limits to prevent infinite freeze loops)
    // Gas Nodes (Gwei savers)
    let gasPlaced = 0;
    let gasAttempts = 0;
    while (gasPlaced < config.gasCount && gasAttempts < 300) {
      gasAttempts++;
      const rx = Math.floor(Math.random() * cols);
      const ry = Math.floor(Math.random() * rows);
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

    // Validator Nodes (power-ups)
    let valPlaced = 0;
    let valAttempts = 0;
    while (valPlaced < config.valCount && valAttempts < 300) {
      valAttempts++;
      const rx = Math.floor(Math.random() * cols);
      const ry = Math.floor(Math.random() * rows);
      if (
        (rx === 0 && ry === 0) ||
        (rx === cols - 1 && ry === rows - 1) ||
        initialGrid[ry][rx].isGasNode ||
        initialGrid[ry][rx].isValidatorNode
      ) {
        continue;
      }
      initialGrid[ry][rx].isValidatorNode = true;
      valPlaced++;
    }

    // Portals (Bridges L1 <-> L2)
    if (config.hasPortal) {
      // Create a pair of portals
      let portalA: { x: number; y: number } | null = null;
      let portalB: { x: number; y: number } | null = null;
      let portalAttempts = 0;

      while (!portalA && portalAttempts < 200) {
        portalAttempts++;
        const rx = Math.floor(Math.random() * (cols / 2));
        const ry = Math.floor(Math.random() * (rows / 2));
        if ((rx !== 0 || ry !== 0) && !initialGrid[ry][rx].isGasNode && !initialGrid[ry][rx].isValidatorNode) {
          portalA = { x: rx, y: ry };
        }
      }

      portalAttempts = 0;
      while (!portalB && portalAttempts < 200) {
        portalAttempts++;
        const rx = Math.floor(cols / 2 + Math.random() * (cols / 2));
        const ry = Math.floor(rows / 2 + Math.random() * (rows / 2));
        if ((rx !== cols - 1 || ry !== rows - 1) && !initialGrid[ry][rx].isGasNode && !initialGrid[ry][rx].isValidatorNode) {
          portalB = { x: rx, y: ry };
        }
      }

      if (portalA && portalB) {
        initialGrid[portalA.y][portalA.x].isPortal = true;
        initialGrid[portalA.y][portalA.x].portalTarget = portalB;

        initialGrid[portalB.y][portalB.x].isPortal = true;
        initialGrid[portalB.y][portalB.x].portalTarget = portalA;
      }
    }

    // 4. Inject Special Tokens (Rarer spawn rate: 70% chance of level containing keys, max 1 on small, max 2 on large)
    // Uses a guaranteed while loop placement for robust and reliable key item dropping.
    let keysPlaced = 0;
    const maxKeys = cols <= 10 ? 1 : 2;
    const hasKeysThisLevel = Math.random() < 0.70;

    if (hasKeysThisLevel) {
      let keyAttempts = 0;
      while (keysPlaced < maxKeys && keyAttempts < 300) {
        keyAttempts++;
        const rx = Math.floor(Math.random() * cols);
        const ry = Math.floor(Math.random() * rows);
        const cell = initialGrid[ry][rx];
        // Don't place on start, exit, portals, gas nodes, or validator nodes
        if (
          (rx === 0 && ry === 0) ||
          (rx === cols - 1 && ry === rows - 1) ||
          cell.isGasNode ||
          cell.isValidatorNode ||
          cell.isPortal ||
          cell.isSpecialToken
        ) {
          continue;
        }
        cell.isSpecialToken = true;
        keysPlaced++;
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

  // Save campaign state on any gameplay update
  useEffect(() => {
    if (isCampaign && isReady && !hasWon && !autoSolving && grid.length > 0) {
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
    }
  }, [
    isCampaign,
    isReady,
    hasWon,
    autoSolving,
    campaignLevel,
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

    // 2. Validator Booster: break firewall on contact ONLY if pre-activated by pressing "Gunakan Bypass" (isNoclipped is true)
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
        setHasUsedBypass(true);
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
      }

      if (nextCell.isValidatorNode) {
        nextCell.isValidatorNode = false;
        collectedVal = 1;
        sound.playPowerup();
      }

      if (nextCell.isSpecialToken) {
        nextCell.isSpecialToken = false;
        sound.playPowerup();
        setSpecialTokens(prev => prev + 1);
      }

      // Check Portal Teleportation
      let finalX = nextX;
      let finalY = nextY;
      if (nextCell.isPortal && nextCell.portalTarget) {
        finalX = nextCell.portalTarget.x;
        finalY = nextCell.portalTarget.y;
        sound.playWin(); // Teleport sound
      }

      setPlayer({ x: finalX, y: finalY });
      setStats(prev => {
        const nextGasCost = Math.max(0.0005, prev.gasCost - (collectedGas * 0.0015));
        let nextValidatorTokens = prev.validatorTokens + collectedVal;
        let nextIsNoclipped = prev.isNoclipped;

        if (autoUsedNoclip) {
          if (nextIsNoclipped) {
            nextIsNoclipped = false;
          } else if (nextValidatorTokens > 0) {
            nextValidatorTokens -= 1;
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

    if (isCampaign) {
      localStorage.removeItem('base_maze_campaign_resume_state');
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
      const result: ScoreEntry = {
        id: 'user-' + Date.now(),
        name: playerName,
        difficulty,
        time: Number(timeToComplete.toFixed(2)),
        tps: Number(computedTPS.toFixed(1)),
        gasUsed: finalGasGwei,
        blockHeight: blockHeight,
        date: new Date().toISOString().split('T')[0],
        badges: currentEarnedBadges
      };

      if (isCampaign) {
        // Update level unlocks
        const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
        const nextLevel = campaignLevel + 1;
        if (nextLevel > currentUnlocked && nextLevel <= 50) {
          localStorage.setItem('base_maze_unlocked_level', String(nextLevel));
        }
      } else {
        // Retrieve current leaderboard scores
        const savedScores = localStorage.getItem('base_maze_scores');
        let currentScores: ScoreEntry[] = [];
        if (savedScores) {
          try {
            currentScores = JSON.parse(savedScores);
          } catch (e) {
            currentScores = [];
          }
        }
        // Add current score and save
        const updatedScores = [...currentScores, result].sort((a, b) => a.time - b.time);
        localStorage.setItem('base_maze_scores', JSON.stringify(updatedScores));

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
          }
          if (newGrid[y][x].isValidatorNode) {
            newGrid[y][x].isValidatorNode = false;
            sound.playPowerup();
          }
          if (newGrid[y][x].isSpecialToken) {
            newGrid[y][x].isSpecialToken = false;
            sound.playPowerup();
            setSpecialTokens(prev => prev + 1);
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
        setSpecialTokens(prev => prev - 1);
        setHintUnlocked(false);
        generateMaze();
      } else {
        sound.playError();
        setToastMessage(translations[lang].mazeboard.insufficient_tokens);
      }
    }
  };

  // Helper styles for cell walls
  const getCellClassName = (cell: Cell) => {
    let classes = "relative aspect-square transition-all duration-150 border-cloud-white/20 ";

    // Crisp solid Deep Navy walls for maximum structural clarity, and golden hints for paths
    if (cell.walls.top) classes += "border-t-[3px] border-t-deep-navy ";
    else classes += "border-t border-t-cerulean-sky/10 ";

    if (cell.walls.right) classes += "border-r-[3px] border-r-deep-navy ";
    else classes += "border-r border-r-cerulean-sky/10 ";

    if (cell.walls.bottom) classes += "border-b-[3px] border-b-deep-navy ";
    else classes += "border-b border-b-cerulean-sky/10 ";

    if (cell.walls.left) classes += "border-l-[3px] border-l-deep-navy ";
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
        <div className="relative w-full max-w-xl aspect-square rounded-2xl p-2 md:p-3 overflow-hidden transition-all duration-300 border border-deep-navy/15 bg-white/90 shadow-xl shadow-cerulean-sky/5">
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
                          className="absolute inset-1 bg-deep-navy rounded-full border border-white flex items-center justify-center shadow-lg shadow-deep-navy/40 z-20"
                        >
                          {/* Inner white circle */}
                          <div className="w-[60%] h-[60%] bg-white rounded-full flex items-center justify-center">
                            {/* Inner deep navy dot */}
                            <div className="w-[45%] h-[45%] bg-deep-navy rounded-full animate-pulse"></div>
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
                className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-30 transition-colors duration-300 bg-cloud-white/95 border-2 border-warm-red/20 rounded-2xl shadow-2xl"
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

                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4 shadow-lg bg-emerald-50 border-emerald-500 text-emerald-600">
                  <CheckCircle size={36} className="animate-bounce" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-deep-navy">
                  {translations[lang].mazeboard.confirmed_title}
                </h2>
                <p className="text-xs font-mono mt-1 uppercase text-deep-navy/60">
                  {translations[lang].mazeboard.confirmed_subtitle}
                </p>

                <div className="mt-4 flex gap-6 p-4 rounded-xl text-center font-mono border shadow-inner bg-cloud-white border-deep-navy/10">
                  <div>
                    <span className="block text-[10px] text-deep-navy/50 uppercase">{translations[lang].mazeboard.time_short}</span>
                    <span className="text-sm font-bold text-deep-navy">{stats.timeElapsed.toFixed(2)}s</span>
                  </div>
                  <div className="border-r border-deep-navy/10"></div>
                  <div>
                    <span className="block text-[10px] text-deep-navy/50 uppercase">{translations[lang].mazeboard.throughput_short}</span>
                    <span className="text-sm font-bold text-cerulean-sky">
                      {((cols * rows * 120) / Math.max(0.5, stats.timeElapsed)).toLocaleString(undefined, { maximumFractionDigits: 1 })} TPS
                    </span>
                  </div>
                  <div className="border-r border-deep-navy/10"></div>
                  <div>
                    <span className="block text-[10px] text-deep-navy/50 uppercase">Gas Gwei</span>
                    <span className="text-sm font-bold text-warm-red">
                      {Math.max(1, Math.round(stats.gasCost * 1000))}
                    </span>
                  </div>
                </div>

                {/* Earned Badges Showcase */}
                {earnedBadges.length > 0 && (
                  <div className="mt-5 text-center px-4 max-w-sm">
                    <span className="text-[10px] font-mono text-deep-navy/50 uppercase tracking-widest block mb-2">{translations[lang].mazeboard.earned_badges}</span>
                    <div className="flex flex-wrap justify-center gap-2">
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
                            className={`text-xs font-mono px-2 py-1 rounded-lg flex items-center gap-1.5 border ${styleClasses} shadow-sm`}
                            title={bLocal.description}
                          >
                            <span className="text-sm">{b.emoji}</span>
                            <span className="font-semibold text-[10px]">{bLocal.name}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isCampaign && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs px-4">
                    {campaignLevel < 50 ? (
                      <button
                        onClick={() => {
                          sound.playPowerup();
                          if (onLevelCompleted) {
                            onLevelCompleted(campaignLevel + 1);
                          }
                        }}
                        className="flex-1 py-2.5 bg-deep-navy text-white font-sans font-bold rounded-xl text-xs shadow-md shadow-deep-navy/20 cursor-pointer hover:bg-deep-navy/90 transition text-center"
                      >
                        {lang === 'id' ? `Level Berikutnya (${campaignLevel + 1})` : `Next Level (${campaignLevel + 1})`}
                      </button>
                    ) : (
                      <div className="w-full text-center py-2 text-warm-red font-extrabold font-mono text-xs animate-pulse">
                        🎉 {lang === 'id' ? 'TAMAT! SELESAI LEVEL 50!' : 'CAMPAIGN COMPLETED! LEVEL 50!'}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        sound.playMove();
                        onBackToMenu();
                      }}
                      className="flex-1 py-2.5 font-sans font-semibold rounded-xl text-xs transition cursor-pointer border bg-white border-deep-navy/15 text-deep-navy hover:bg-cloud-white shadow-sm"
                    >
                      {lang === 'id' ? 'Kembali ke Menu' : 'Back to Menu'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
