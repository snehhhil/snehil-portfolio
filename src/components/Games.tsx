"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

type GameId = "snake" | "tetris" | "2048" | "minesweeper" | "sudoku" | "maze";

type LeaderboardEntry = {
  score: number;
  timestamp: number;
};

type SnakePoint = {
  x: number;
  y: number;
};

type Direction = {
  x: number;
  y: number;
};

type Tetromino = {
  shape: number[][];
  color: string;
};

type PieceState = {
  shape: number[][];
  x: number;
  y: number;
  color: string;
};

type GameProps = {
  onScoreChange: (score: number) => void;
};

type MineCell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

const GAME_CATALOG: Array<{ id: GameId; title: string; subtitle: string; accent: string }> = [
  {
    id: "snake",
    title: "Snake",
    subtitle: "Eat, grow, and don’t bite your own tail. How long can you last?",
    accent: "text-accent-cyan",
  },
  {
    id: "tetris",
    title: "Tetris",
    subtitle: "Stack the pieces, clear the lines, and see how high you can score.",
    accent: "text-accent-green",
  },
  {
    id: "2048",
    title: "2048",
    subtitle: "Merge matching tiles and build your highest-value run.",
    accent: "text-amber-300",
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    subtitle: "Map the field, flag the mines, and clear every safe cell.",
    accent: "text-rose-300",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    subtitle: "Fill in the numbers, trust your logic, and solve the puzzle.",
    accent: "text-amber-300",
  },
  {
    id: "maze",
    title: "Maze",
    subtitle: "Find your way out before time runs out.",
    accent: "text-rose-300",
  },
];

const STORAGE_PREFIX = "snehil-portfolio-game-leaderboard";
const BOARD_SIZE = 12;
const TETRIS_ROWS = 12;
const TETRIS_COLS = 10;
const PACMAN_ROWS = 10;
const PACMAN_COLS = 10;
const TILE_2048_SIZE = 4;
const MINESWEEPER_SIZE = 8;
const MINESWEEPER_MINES = 10;

function create2048Board() {
  const board = Array.from({ length: TILE_2048_SIZE }, () => Array(TILE_2048_SIZE).fill(0));
  return add2048Tile(add2048Tile(board));
}

function add2048Tile(board: number[][]) {
  const empty = board.flatMap((row, rowIndex) => row.map((value, colIndex) => (value ? null : [rowIndex, colIndex] as const)).filter(Boolean) as Array<readonly [number, number]>);
  if (empty.length === 0) return board;
  const [row, col] = empty[Math.floor(Math.random() * empty.length)];
  const next = board.map((boardRow) => [...boardRow]);
  next[row][col] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function merge2048Line(line: number[]) {
  const values = line.filter(Boolean);
  const merged: number[] = [];
  let score = 0;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const value = values[index] * 2;
      merged.push(value);
      score += value;
      index += 1;
    } else {
      merged.push(values[index]);
    }
  }
  return { line: [...merged, ...Array(TILE_2048_SIZE - merged.length).fill(0)], score };
}

function move2048Board(board: number[][], direction: "up" | "down" | "left" | "right") {
  const next = Array.from({ length: TILE_2048_SIZE }, () => Array(TILE_2048_SIZE).fill(0));
  let gained = 0;
  for (let index = 0; index < TILE_2048_SIZE; index += 1) {
    const line = direction === "left" || direction === "right"
      ? [...board[index]]
      : board.map((row) => row[index]);
    const reversed = direction === "right" || direction === "down";
    const result = merge2048Line(reversed ? line.reverse() : line);
    const output = reversed ? result.line.reverse() : result.line;
    gained += result.score;
    output.forEach((value, outputIndex) => {
      if (direction === "left" || direction === "right") next[index][outputIndex] = value;
      else next[outputIndex][index] = value;
    });
  }
  const changed = board.some((row, rowIndex) => row.some((value, colIndex) => value !== next[rowIndex][colIndex]));
  return { board: changed ? add2048Tile(next) : next, gained, changed };
}

function createMinefield() {
  const cells = Array.from({ length: MINESWEEPER_SIZE * MINESWEEPER_SIZE }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }));
  let placed = 0;
  while (placed < MINESWEEPER_MINES) {
    const index = Math.floor(Math.random() * cells.length);
    if (!cells[index].mine) {
      cells[index].mine = true;
      placed += 1;
    }
  }
  return cells.map((cell, index) => {
    const row = Math.floor(index / MINESWEEPER_SIZE);
    const col = index % MINESWEEPER_SIZE;
    const adjacent = [-1, 0, 1].flatMap((rowOffset) => [-1, 0, 1].map((colOffset) => [row + rowOffset, col + colOffset]))
      .filter(([nextRow, nextCol]) => (nextRow !== row || nextCol !== col) && nextRow >= 0 && nextRow < MINESWEEPER_SIZE && nextCol >= 0 && nextCol < MINESWEEPER_SIZE)
      .filter(([nextRow, nextCol]) => cells[nextRow * MINESWEEPER_SIZE + nextCol].mine).length;
    return { ...cell, adjacent };
  });
}

function isMazeReachable(layout: string[], start: [number, number], goal: [number, number]) {
  const queue: Array<[number, number]> = [start];
  const seen = new Set<string>([`${start[0]}-${start[1]}`]);

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const neighbors: Array<[number, number]> = [
      [row + 1, col],
      [row - 1, col],
      [row, col + 1],
      [row, col - 1],
    ];

    for (const [nextRow, nextCol] of neighbors) {
      if (nextRow < 0 || nextRow >= layout.length || nextCol < 0 || nextCol >= layout[0].length) {
        continue;
      }

      if (layout[nextRow][nextCol] === "#") {
        continue;
      }

      const key = `${nextRow}-${nextCol}`;
      if (seen.has(key)) {
        continue;
      }

      if (nextRow === goal[0] && nextCol === goal[1]) {
        return true;
      }

      seen.add(key);
      queue.push([nextRow, nextCol]);
    }
  }

  return false;
}

function createMazeLayout(previousLayout?: string[]) {
  const size = 19;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => "#"));
    const stack: Array<[number, number]> = [[1, 1]];

    grid[1][1] = ".";

    while (stack.length > 0) {
      const [row, col] = stack[stack.length - 1];
      const neighbors = shuffle([
        [row + 2, col],
        [row - 2, col],
        [row, col + 2],
        [row, col - 2],
      ]).filter(([nextRow, nextCol]) => {
        return nextRow > 0 && nextRow < size - 1 && nextCol > 0 && nextCol < size - 1 && grid[nextRow][nextCol] === "#";
      });

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }

      const [nextRow, nextCol] = neighbors[0];
      grid[(row + nextRow) / 2][(col + nextCol) / 2] = ".";
      grid[nextRow][nextCol] = ".";
      stack.push([nextRow, nextCol]);
    }

    const extraOpenings: Array<[number, number]> = [];
    for (let row = 1; row < size - 1; row += 2) {
      for (let col = 1; col < size - 1; col += 2) {
        if (Math.random() > 0.92) {
          extraOpenings.push([row, col]);
        }
      }
    }

    for (const [row, col] of extraOpenings) {
      grid[row][col] = ".";
    }

    grid[1][1] = "S";
    grid[size - 2][size - 2] = "G";

    const layout = grid.map((row) => row.join(""));
    const nextSignature = layout.join("\n");
    const previousSignature = previousLayout?.join("\n");

    if (isMazeReachable(layout, [1, 1], [size - 2, size - 2]) && nextSignature !== previousSignature) {
      return layout;
    }
  }

  const fallbackGrid = Array.from({ length: size }, () => Array.from({ length: size }, () => "#"));
  const fallbackPath = [
    [1, 1], [1, 3], [1, 5], [1, 7], [1, 9], [1, 11], [1, 13], [1, 15], [3, 15], [5, 15], [7, 15], [9, 15], [11, 15], [13, 15], [15, 15], [15, 17], [17, 17]
  ];

  for (const [row, col] of fallbackPath) {
    fallbackGrid[row][col] = ".";
  }

  fallbackGrid[1][1] = "S";
  fallbackGrid[17][17] = "G";

  return fallbackGrid.map((row) => row.join(""));
}

const TETROMINOES: Tetromino[] = [
  { shape: [[1, 1, 1, 1]], color: "bg-accent-cyan" },
  { shape: [[1, 1], [1, 1]], color: "bg-accent-green" },
  { shape: [[1, 0, 0], [1, 1, 1]], color: "bg-accent-purple" },
  { shape: [[0, 0, 1], [1, 1, 1]], color: "bg-amber-400" },
  { shape: [[0, 1, 1], [1, 1, 0]], color: "bg-pink-400" },
  { shape: [[1, 1, 1], [0, 1, 0]], color: "bg-rose-400" },
];

const PACMAN_WALLS = new Set([
  "0-0", "1-0", "2-0", "3-0", "4-0", "5-0", "6-0", "7-0", "8-0", "9-0",
  "0-1", "9-1", "0-2", "9-2", "0-3", "9-3", "0-4", "9-4", "0-5", "9-5",
  "0-6", "9-6", "0-7", "9-7", "0-8", "9-8", "0-9", "1-9", "2-9", "3-9",
  "4-9", "5-9", "6-9", "7-9", "8-9", "9-9",
]);

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function findFirstEditableCell(board: number[][]): [number, number] {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }

  return [0, 0];
}

function findNextEditableCell(board: number[][], row: number, col: number, key: string): [number, number] {
  const directionMap: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };

  const [rowDelta, colDelta] = directionMap[key] ?? [0, 0];
  let nextRow = row + rowDelta;
  let nextCol = col + colDelta;

  while (nextRow >= 0 && nextRow < 9 && nextCol >= 0 && nextCol < 9) {
    if (board[nextRow][nextCol] === 0) {
      return [nextRow, nextCol];
    }

    nextRow += rowDelta;
    nextCol += colDelta;
  }

  return [row, col];
}

function createSudokuPuzzle() {
  const rowOrder = shuffle([0, 1, 2]).flatMap((group) => shuffle([0, 1, 2]).map((rowInGroup) => group * 3 + rowInGroup));
  const colOrder = shuffle([0, 1, 2]).flatMap((group) => shuffle([0, 1, 2]).map((colInGroup) => group * 3 + colInGroup));
  const digitMap = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const baseBoard = SUDOKU_SOLUTION.map((row) => row.map((cell) => digitMap[cell - 1]));
  const shuffledBoard = rowOrder.map((rowIndex) => colOrder.map((colIndex) => baseBoard[rowIndex][colIndex]));

  const puzzle = shuffledBoard.map((row) => [...row]);
  const blanks = shuffle(Array.from({ length: 81 }, (_, index) => index)).slice(0, 44);

  blanks.forEach((index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    puzzle[row][col] = 0;
  });

  return puzzle;
}

const SUDOKU_SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function getLeaderboardKey(gameId: GameId) {
  return `${STORAGE_PREFIX}:${gameId}`;
}

function readLeaderboard(gameId: GameId): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(getLeaderboardKey(gameId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(gameId: GameId, score: number) {
  if (typeof window === "undefined") return;

  const next = [...readLeaderboard(gameId), { score, timestamp: Date.now() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  window.localStorage.setItem(getLeaderboardKey(gameId), JSON.stringify(next));
  return next;
}

function randomSnakeFood(snake: SnakePoint[]) {
  const occupied = new Set(snake.map((segment) => `${segment.x}-${segment.y}`));
  const available: SnakePoint[] = [];

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!occupied.has(`${x}-${y}`)) {
        available.push({ x, y });
      }
    }
  }

  return available[Math.floor(Math.random() * available.length)] ?? { x: 0, y: 0 };
}

function cloneBoard(board: number[][]) {
  return board.map((row) => [...row]);
}

function randomTetromino(): Tetromino {
  return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
}

function rotateMatrix(shape: number[][]) {
  return shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
}

function GameCard({ game, onOpen }: { game: (typeof GAME_CATALOG)[number]; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-surface to-background p-5 text-left shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] transition-all duration-200 hover:-translate-y-1 hover:border-accent-cyan/50 hover:shadow-[0_25px_60px_-25px_rgba(34,211,238,0.55)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className={`font-mono text-xs uppercase tracking-[0.3em] ${game.accent}`}>{game.title}</p>
        <span className="h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
      </div>
      <div className="rounded-xl border border-border/70 bg-background/60 p-3">
        <p className="text-sm text-muted">{game.subtitle}</p>
      </div>
    </button>
  );
}

function SwipeSurface({ children, onTap }: { children: ReactNode; onTap?: () => void }) {
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const dispatchDirection = (key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  };

  return (
    <div
      className="touch-pan-y select-none"
      onPointerDown={(event) => {
        startPoint.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        if (!startPoint.current) return;
        const deltaX = event.clientX - startPoint.current.x;
        const deltaY = event.clientY - startPoint.current.y;
        startPoint.current = null;

        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) {
          onTap?.();
          return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          dispatchDirection(deltaX > 0 ? "ArrowRight" : "ArrowLeft");
        } else {
          dispatchDirection(deltaY > 0 ? "ArrowDown" : "ArrowUp");
        }
      }}
      onPointerCancel={() => {
        startPoint.current = null;
      }}
    >
      {children}
    </div>
  );
}

function Leaderboard({ gameId, score }: { gameId: GameId; score?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(readLeaderboard(gameId));
  }, [gameId]);

  useEffect(() => {
    if (typeof score !== "number") return;
    const next = saveLeaderboard(gameId, score);
    if (next) {
      setEntries(next);
    }
  }, [gameId, score]);

  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent-cyan">Leaderboard</p>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">No runs logged yet.</p>
      ) : (
        <ol className="space-y-2 text-sm text-muted">
          {entries.map((entry, index) => (
            <li key={`${entry.timestamp}-${index}`} className="flex items-center justify-between gap-3">
              <span>#{index + 1}</span>
              <span>{entry.score} pts</span>
              <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const CONTROL_GUIDES: Record<GameId, { desktop: string; touch: string }> = {
  snake: {
    desktop: "Use the Arrow keys to steer the snake.",
    touch: "Swipe up, down, left, or right to steer.",
  },
  tetris: {
    desktop: "Use ← → to move, ↓ to drop, and ↑ to rotate.",
    touch: "Swipe left/right to move, swipe down to drop, or tap to rotate.",
  },
  "2048": {
    desktop: "Use the Arrow keys to move and merge tiles.",
    touch: "Swipe in any direction to move and merge tiles.",
  },
  minesweeper: {
    desktop: "Click to reveal cells and right-click to flag mines.",
    touch: "Tap to reveal cells and long-press to flag mines.",
  },
  sudoku: {
    desktop: "Click a cell, then use number keys or the input pad.",
    touch: "Tap a cell, then tap a number from the input pad.",
  },
  maze: {
    desktop: "Use the Arrow keys to navigate the maze.",
    touch: "Swipe in the direction you want to move.",
  },
};

function GameShell({ gameId, onClose }: { gameId: GameId; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [latestScore, setLatestScore] = useState<number | undefined>(undefined);
  const [showControlGuide, setShowControlGuide] = useState(true);
  const globalSwipeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleWheelCapture = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleKeyCapture = (event: KeyboardEvent) => {
      const blockedKeys = new Set([" ", "Spacebar", "PageUp", "PageDown", "Home", "End"]);

      if (blockedKeys.has(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("wheel", handleWheelCapture, { capture: true, passive: false });
    window.addEventListener("keydown", handleKeyCapture, { capture: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("wheel", handleWheelCapture, true);
      window.removeEventListener("keydown", handleKeyCapture, true);
    };
  }, []);

  useEffect(() => {
    const directionalGames: GameId[] = ["snake", "tetris", "2048", "maze"];
    if (!directionalGames.includes(gameId)) return;

    const dispatchDirection = (key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      globalSwipeStart.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || !globalSwipeStart.current) return;

      const deltaX = event.clientX - globalSwipeStart.current.x;
      const deltaY = event.clientY - globalSwipeStart.current.y;
      globalSwipeStart.current = null;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        dispatchDirection(deltaX > 0 ? "ArrowRight" : "ArrowLeft");
      } else {
        dispatchDirection(deltaY > 0 ? "ArrowDown" : "ArrowUp");
      }
    };

    const handlePointerCancel = () => {
      globalSwipeStart.current = null;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [gameId]);

  async function toggleFullscreen() {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        return;
      }

      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const gameContent = useMemo(() => {
    switch (gameId) {
      case "snake":
        return <SnakeGame onScoreChange={setLatestScore} />;
      case "tetris":
        return <TetrisGame onScoreChange={setLatestScore} />;
      case "2048":
        return <Game2048 onScoreChange={setLatestScore} />;
      case "minesweeper":
        return <MinesweeperGame onScoreChange={setLatestScore} />;
      case "sudoku":
        return <SudokuGame onScoreChange={setLatestScore} />;
      case "maze":
        return <MazeGame onScoreChange={setLatestScore} />;
      default:
        return null;
    }
  }, [gameId]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-background/90 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-2xl sm:max-h-[92dvh] sm:gap-4 sm:p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">{GAME_CATALOG.find((item) => item.id === gameId)?.title}</h3>
          </div>
          <div className="flex max-w-full flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden rounded-md border border-border bg-background px-3 py-2 text-sm text-muted transition hover:text-foreground lg:inline-flex"
            >
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
            <button
              type="button"
              aria-label="Close game"
              onClick={onClose}
              className="h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80"
            />
          </div>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background/70 to-surface/80 p-2 shadow-inner shadow-black/10 sm:p-3">{gameContent}</div>
          <div className="hidden lg:block">
            <Leaderboard gameId={gameId} score={latestScore} />
          </div>
        </div>

        {showControlGuide && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-accent-cyan/30 bg-surface p-5 shadow-[0_0_35px_rgba(88,166,255,0.18)] sm:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent-cyan">Control guide</p>
              <h4 className="mt-2 text-xl font-semibold">{GAME_CATALOG.find((item) => item.id === gameId)?.title}</h4>
              <div className="mt-5 space-y-3 font-mono text-sm text-muted">
                <p><span className="text-accent-green">Desktop / laptop:</span> {CONTROL_GUIDES[gameId].desktop}</p>
                <p><span className="text-accent-green">Phone / tablet:</span> {CONTROL_GUIDES[gameId].touch}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowControlGuide(false)}
                className="mt-6 w-full rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2.5 font-mono text-sm text-accent-cyan transition hover:bg-accent-cyan/20"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SnakeGame({ onScoreChange }: GameProps) {
  const [snake, setSnake] = useState<SnakePoint[]>([
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 3, y: 6 },
  ]);
  const [food, setFood] = useState<SnakePoint>({ x: 8, y: 6 });
  const [direction, setDirection] = useState<Direction>({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    onScoreChange(score);
  }, [onScoreChange, score]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (event.key === "ArrowUp" && direction.y !== 1) setDirection({ x: 0, y: -1 });
      if (event.key === "ArrowDown" && direction.y !== -1) setDirection({ x: 0, y: 1 });
      if (event.key === "ArrowLeft" && direction.x !== 1) setDirection({ x: -1, y: 0 });
      if (event.key === "ArrowRight" && direction.x !== -1) setDirection({ x: 1, y: 0 });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;

    const speed = Math.max(90, 190 - Math.floor(score / 20) * 10);

    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

        const hitsWall = nextHead.x < 0 || nextHead.x >= BOARD_SIZE || nextHead.y < 0 || nextHead.y >= BOARD_SIZE;
        const hitsSelf = currentSnake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

        if (hitsWall || hitsSelf) {
          setGameOver(true);
          return currentSnake;
        }

        const ateFood = nextHead.x === food.x && nextHead.y === food.y;
        const nextSnake = [nextHead, ...currentSnake];
        const keptSnake = ateFood ? nextSnake : nextSnake.slice(0, -1);

        if (ateFood) {
          setScore((previous) => previous + 10);
          setFood(randomSnakeFood(keptSnake));
        }

        return keptSnake;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [direction, food, gameOver, score]);

  const cells = useMemo(() => {
    const grid = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => ""));

    snake.forEach((segment, index) => {
      grid[segment.y][segment.x] = index === 0 ? "head" : "body";
    });
    grid[food.y][food.x] = "food";
    return grid;
  }, [food, snake]);

  const reset = () => {
    setSnake([
      { x: 5, y: 6 },
      { x: 4, y: 6 },
      { x: 3, y: 6 },
    ]);
    setFood({ x: 8, y: 6 });
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="space-y-2 text-xs sm:space-y-3 sm:text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-cyan sm:text-xs">Score: {score}</p>
        </div>
        <button type="button" onClick={reset} className="rounded-md border border-border px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm">Restart</button>
      </div>
      <SwipeSurface>
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[18px] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_45%),linear-gradient(180deg,rgba(17,24,39,0.95),rgba(2,6,23,0.95))] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] sm:rounded-[22px] sm:p-3">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
        <div className="relative grid grid-cols-12 gap-0.5 sm:gap-1">
          {cells.flat().map((cell, index) => (
            <div
              key={`${cell}-${index}`}
              className={`aspect-square rounded-full transition-all duration-150 ${
                cell === "head"
                  ? "bg-accent-cyan shadow-[0_0_18px_rgba(34,211,238,0.75)]"
                  : cell === "body"
                    ? "bg-accent-green shadow-[0_0_14px_rgba(74,222,128,0.55)]"
                    : cell === "food"
                      ? "bg-accent-purple shadow-[0_0_18px_rgba(168,85,247,0.75)]"
                      : "bg-slate-900/80"
              }`}
            />
          ))}
        </div>
      </div>
      </SwipeSurface>
      {gameOver && <p className="font-mono text-sm text-accent-purple">Game over — restart to try again.</p>}
    </div>
  );
}

function TetrisGame({ onScoreChange }: GameProps) {
  const [board, setBoard] = useState<number[][]>(() =>
    Array.from({ length: TETRIS_ROWS }, () => Array.from({ length: TETRIS_COLS }, () => 0))
  );
  const [piece, setPiece] = useState<PieceState | null>(() => {
    const tetromino = randomTetromino();
    return {
      shape: tetromino.shape,
      x: Math.floor(TETRIS_COLS / 2) - 1,
      y: 0,
      color: tetromino.color,
    };
  });
  const [nextPiece, setNextPiece] = useState<Tetromino>(() => randomTetromino());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    onScoreChange(score);
  }, [onScoreChange, score]);

  const canPlace = (testPiece: PieceState, testBoard = board) =>
    testPiece.shape.every((row, y) =>
      row.every((cell, x) => {
        if (!cell) return true;
        const boardX = testPiece.x + x;
        const boardY = testPiece.y + y;
        return boardX >= 0 && boardX < TETRIS_COLS && boardY >= 0 && boardY < TETRIS_ROWS && testBoard[boardY][boardX] === 0;
      })
    );

  const lockCurrentPiece = (current: PieceState) => {
    const merged = cloneBoard(board);
    current.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (!cell) return;
        const boardX = current.x + x;
        const boardY = current.y + y;
        if (boardY >= 0 && boardY < TETRIS_ROWS && boardX >= 0 && boardX < TETRIS_COLS) {
          merged[boardY][boardX] = 1;
        }
      });
    });

    const rowsToClear = merged.filter((row) => row.every(Boolean));
    const remaining = merged.filter((row) => !row.every(Boolean));
    while (remaining.length < TETRIS_ROWS) {
      remaining.unshift(Array.from({ length: TETRIS_COLS }, () => 0));
    }

    const nextSpawn = nextPiece;
    const nextState: PieceState = {
      shape: nextSpawn.shape,
      x: Math.floor(TETRIS_COLS / 2) - 1,
      y: 0,
      color: nextSpawn.color,
    };

    if (rowsToClear.length > 0) {
      setScore((previous) => previous + rowsToClear.length * 100);
    }

    setBoard(remaining);
    setNextPiece(randomTetromino());

    if (!canPlace(nextState, remaining)) {
      setGameOver(true);
      return;
    }

    setPiece(nextState);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!piece || gameOver) return;

      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (event.key === "ArrowLeft") {
        const nextPieceState = { ...piece, x: piece.x - 1 };
        if (canPlace(nextPieceState)) setPiece(nextPieceState);
      }
      if (event.key === "ArrowRight") {
        const nextPieceState = { ...piece, x: piece.x + 1 };
        if (canPlace(nextPieceState)) setPiece(nextPieceState);
      }
      if (event.key === "ArrowDown") {
        const nextPieceState = { ...piece, y: piece.y + 1 };
        if (canPlace(nextPieceState)) {
          setPiece(nextPieceState);
          return;
        }

        lockCurrentPiece(piece);
      }
      if (event.key === "ArrowUp") {
        const rotated = { ...piece, shape: rotateMatrix(piece.shape) };
        if (canPlace(rotated)) setPiece(rotated);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, canPlace, gameOver, nextPiece, piece]);

  useEffect(() => {
    if (gameOver) return;

    const speed = Math.max(150, 470 - Math.floor(score / 100) * 24);

    const timer = window.setInterval(() => {
      setPiece((current) => {
        if (!current) return null;
        const nextY = current.y + 1;
        const softDropped = { ...current, y: nextY };
        if (canPlace(softDropped)) {
          return softDropped;
        }

        lockCurrentPiece(current);
        return null;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [board, canPlace, gameOver, nextPiece, piece, score]);

  const renderBoard = useMemo(() => {
    const boardWithPiece = cloneBoard(board);
    if (piece) {
      piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (!cell) return;
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (boardY >= 0 && boardY < TETRIS_ROWS && boardX >= 0 && boardX < TETRIS_COLS) {
            boardWithPiece[boardY][boardX] = 1;
          }
        });
      });
    }
    return boardWithPiece;
  }, [board, piece]);

  const reset = () => {
    setBoard(Array.from({ length: TETRIS_ROWS }, () => Array.from({ length: TETRIS_COLS }, () => 0)));
    setPiece({
      shape: randomTetromino().shape,
      x: Math.floor(TETRIS_COLS / 2) - 1,
      y: 0,
      color: randomTetromino().color,
    });
    setNextPiece(randomTetromino());
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-green">Score: {score}</p>
        </div>
        <button type="button" onClick={reset} className="rounded-md border border-border px-3 py-2 text-sm">Restart</button>
      </div>

      <SwipeSurface onTap={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }))}>
      <div className="grid grid-cols-[minmax(0,1fr)_76px] gap-2 sm:grid-cols-[minmax(0,1fr)_96px] lg:grid-cols-[1fr_140px]">
<div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[22px] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.18),transparent_50%),linear-gradient(180deg,rgba(17,24,39,0.95),rgba(3,7,18,0.95))] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] sm:p-3">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:12px_12px] opacity-50" />
        <div className="relative grid grid-cols-10 gap-1">
          {renderBoard.flat().map((cell, index) => (
            <div
              key={`${cell}-${index}`}
              className={`aspect-square rounded-[5px] transition-all duration-150 ${
                cell ? "bg-gradient-to-br from-emerald-300 to-emerald-500 shadow-[0_0_12px_rgba(74,222,128,0.6)]" : "bg-slate-900/80"
              }`}
            />
          ))}
        </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-background/60 p-2 sm:p-3">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">Next piece</p>
          <div className="mx-auto grid w-16 max-w-full grid-cols-4 gap-1 sm:w-20">
            {nextPiece.shape.flat().map((cell, index) => (
              <div
                key={`preview-${index}`}
                className={`aspect-square rounded-[3px] ${cell ? "bg-accent-purple" : "bg-surface"}`}
              />
            ))}
          </div>
        </div>
      </div>
      </SwipeSurface>
      {gameOver && <p className="font-mono text-sm text-accent-purple">Game over — stack another run.</p>}
    </div>
  );
}

function Game2048({ onScoreChange }: GameProps) {
  const [board, setBoard] = useState(create2048Board);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    onScoreChange(score);
  }, [onScoreChange, score]);

  const move = useCallback((direction: "up" | "down" | "left" | "right") => {
    setBoard((current) => {
      const result = move2048Board(current, direction);
      if (result.changed) setScore((previous) => previous + result.gained);
      if (result.board.flat().some((value) => value >= 2048)) setWon(true);
      return result.board;
    });
  }, []);

  useEffect(() => {
    const directions: Record<string, "up" | "down" | "left" | "right"> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      event.stopPropagation();
      move(direction);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  const reset = () => {
    setBoard(create2048Board());
    setScore(0);
    setWon(false);
  };

  const tileColors: Record<number, string> = {
    2: "border-slate-600 bg-slate-800 text-slate-100",
    4: "border-accent-cyan/40 bg-accent-cyan/15 text-accent-cyan",
    8: "border-accent-green/40 bg-accent-green/15 text-accent-green",
    16: "border-amber-300/50 bg-amber-300/15 text-amber-200",
    32: "border-orange-400/50 bg-orange-400/15 text-orange-200",
    64: "border-rose-400/50 bg-rose-400/15 text-rose-200",
    128: "border-accent-purple/50 bg-accent-purple/20 text-accent-purple",
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent-cyan/20 bg-background/60 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">Merge protocol</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm text-accent-green">score {String(score).padStart(5, "0")}</p>
          <button type="button" onClick={reset} className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:border-accent-cyan/50 hover:text-accent-cyan">New run</button>
        </div>
      </div>
      <SwipeSurface>
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-accent-cyan/25 bg-[radial-gradient(circle_at_top,rgba(88,166,255,0.17),transparent_42%),linear-gradient(145deg,rgba(22,27,34,0.98),rgba(7,12,20,0.98))] p-2 shadow-[0_0_30px_rgba(88,166,255,0.12)] sm:max-w-md sm:p-5">
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-border/70 bg-[#060b12]/90 p-1 sm:gap-3 sm:p-3">
          {board.flat().map((tile, index) => (
            <div key={`${tile}-${index}`} className={`flex aspect-square items-center justify-center rounded-lg border font-mono text-base font-bold shadow-[inset_0_0_14px_rgba(255,255,255,0.03)] transition sm:text-xl ${tile ? tileColors[tile] ?? "border-accent-purple bg-accent-purple/35 text-white shadow-[0_0_18px_rgba(188,140,255,0.4)]" : "border-border/40 bg-slate-950/80 text-transparent"}`}>
              {tile || "0"}
            </div>
          ))}
        </div>
      </div>
      </SwipeSurface>
      {won && <p className="font-mono text-sm text-accent-green">2048 reached — merge protocol complete.</p>}
    </div>
  );
}

function MinesweeperGame({ onScoreChange }: GameProps) {
  const [cells, setCells] = useState<MineCell[]>(createMinefield);
  const [status, setStatus] = useState("Scan the grid. Right-click a cell to flag it.");
  const [gameOver, setGameOver] = useState(false);
  const revealed = cells.filter((cell) => cell.revealed && !cell.mine).length;
  const flags = cells.filter((cell) => cell.flagged).length;

  useEffect(() => {
    onScoreChange(revealed * 10);
  }, [onScoreChange, revealed]);

  const reset = () => {
    setCells(createMinefield());
    setGameOver(false);
    setStatus("New field deployed. Find every safe cell.");
  };

  const reveal = (startIndex: number) => {
    if (gameOver || cells[startIndex].flagged || cells[startIndex].revealed) return;
    if (cells[startIndex].mine) {
      setCells((current) => current.map((cell) => cell.mine ? { ...cell, revealed: true } : cell));
      setGameOver(true);
      setStatus("Mine triggered — mission aborted.");
      return;
    }
    setCells((current) => {
      const next = current.map((cell) => ({ ...cell }));
      const queue = [startIndex];
      while (queue.length) {
        const index = queue.shift()!;
        if (next[index].revealed || next[index].flagged) continue;
        next[index].revealed = true;
        if (next[index].adjacent !== 0) continue;
        const row = Math.floor(index / MINESWEEPER_SIZE);
        const col = index % MINESWEEPER_SIZE;
        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
          const nextRow = row + rowOffset;
          const nextCol = col + colOffset;
          if (nextRow >= 0 && nextRow < MINESWEEPER_SIZE && nextCol >= 0 && nextCol < MINESWEEPER_SIZE) queue.push(nextRow * MINESWEEPER_SIZE + nextCol);
        }
      }
      return next;
    });
  };

  const flag = (index: number) => {
    if (gameOver || cells[index].revealed) return;
    setCells((current) => current.map((cell, cellIndex) => cellIndex === index ? { ...cell, flagged: !cell.flagged } : cell));
  };

  const cleared = revealed === MINESWEEPER_SIZE * MINESWEEPER_SIZE - MINESWEEPER_MINES;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/25 bg-background/60 px-4 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-rose-300">Threat scanner</p>
          <p className="text-sm text-muted">{status}</p>
        </div>
        <button type="button" onClick={reset} className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:border-rose-400/50 hover:text-rose-200">New field</button>
      </div>
      <div className="grid grid-cols-3 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-border bg-background/60 p-3 text-muted">Safe <span className="float-right text-accent-green">{revealed}</span></div>
        <div className="rounded-lg border border-border bg-background/60 p-3 text-muted">Flags <span className="float-right text-amber-200">{flags}/{MINESWEEPER_MINES}</span></div>
        <div className="rounded-lg border border-border bg-background/60 p-3 text-muted">Status <span className={`float-right ${gameOver ? "text-rose-300" : cleared ? "text-accent-green" : "text-accent-cyan"}`}>{gameOver ? "LOST" : cleared ? "CLEAR" : "LIVE"}</span></div>
      </div>
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-rose-400/25 bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.15),transparent_42%),linear-gradient(145deg,rgba(22,27,34,0.98),rgba(7,12,20,0.98))] p-2 shadow-[0_0_30px_rgba(251,113,133,0.1)] sm:p-3 lg:max-w-lg lg:p-5">
        <div className="grid grid-cols-8 gap-1 rounded-xl border border-border/70 bg-[#060b12]/90 p-2 sm:gap-1.5 sm:p-3">
          {cells.map((cell, index) => (
            <button key={index} type="button" onClick={() => reveal(index)} onContextMenu={(event) => { event.preventDefault(); flag(index); }} className={`aspect-square rounded-[4px] border font-mono text-xs font-bold transition ${cell.revealed ? cell.mine ? "border-rose-400/70 bg-rose-500/25 text-rose-200" : "border-slate-700 bg-slate-900 text-accent-cyan" : cell.flagged ? "border-amber-300/50 bg-amber-300/15 text-amber-200" : "border-border bg-slate-800 text-transparent hover:border-accent-cyan/60 hover:bg-slate-700"}`}>
              {cell.revealed ? cell.mine ? "✕" : cell.adjacent || "·" : cell.flagged ? "⚑" : "·"}
            </button>
          ))}
        </div>
      </div>
      {cleared && <p className="font-mono text-sm text-accent-green">Field cleared — no threats remain.</p>}
    </div>
  );
}

function PacmanGame({ onScoreChange }: GameProps) {
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [ghost, setGhost] = useState({ x: 8, y: 8 });
  const [pellets, setPellets] = useState(() =>
    Array.from({ length: PACMAN_ROWS }, () => Array.from({ length: PACMAN_COLS }, () => 1))
  );
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    onScoreChange(score);
  }, [onScoreChange, score]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      setPlayer((current) => {
        const directionMap: Record<string, { x: number; y: number }> = {
          ArrowUp: { x: 0, y: -1 },
          ArrowDown: { x: 0, y: 1 },
          ArrowLeft: { x: -1, y: 0 },
          ArrowRight: { x: 1, y: 0 },
        };

        const delta = directionMap[event.key];
        if (!delta) return current;

        const next = { x: current.x + delta.x, y: current.y + delta.y };
        const blocked = PACMAN_WALLS.has(`${next.x}-${next.y}`);

        if (blocked) {
          return current;
        }

        if (next.x < 0) next.x = PACMAN_COLS - 1;
        if (next.y < 0) next.y = PACMAN_ROWS - 1;
        if (next.x >= PACMAN_COLS) next.x = 0;
        if (next.y >= PACMAN_ROWS) next.y = 0;

        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const speed = Math.max(250, 650 - Math.floor(score / 10) * 28);

    const timer = window.setInterval(() => {
      setGhost((current) => {
        const moves = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ];
        const chosen = moves[Math.floor(Math.random() * moves.length)];
        const next = { x: current.x + chosen.x, y: current.y + chosen.y };

        if (PACMAN_WALLS.has(`${next.x}-${next.y}`)) {
          return current;
        }

        if (next.x < 0) next.x = PACMAN_COLS - 1;
        if (next.y < 0) next.y = PACMAN_ROWS - 1;
        if (next.x >= PACMAN_COLS) next.x = 0;
        if (next.y >= PACMAN_ROWS) next.y = 0;

        return next;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [gameOver, score]);

  useEffect(() => {
    if (player.x === ghost.x && player.y === ghost.y) {
      setGameOver(true);
    }
  }, [ghost, player]);

  useEffect(() => {
    const hasPellet = pellets[player.y][player.x] !== 0;
    if (!hasPellet) return;

    setPellets((current) => {
      const clone = current.map((row) => [...row]);
      clone[player.y][player.x] = 0;
      return clone;
    });
    setScore((previous) => previous + 5);
  }, [player, pellets]);

  const reset = () => {
    setPlayer({ x: 1, y: 1 });
    setGhost({ x: 8, y: 8 });
    setPellets(Array.from({ length: PACMAN_ROWS }, () => Array.from({ length: PACMAN_COLS }, () => 1)));
    setScore(0);
    setGameOver(false);
  };

  const renderGrid = useMemo(() => {
    const grid = Array.from({ length: PACMAN_ROWS }, () => Array.from({ length: PACMAN_COLS }, () => ""));

    pellets.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) grid[y][x] = "pellet";
      });
    });

    PACMAN_WALLS.forEach((key) => {
      const [x, y] = key.split("-").map(Number);
      grid[y][x] = "wall";
    });

    grid[player.y][player.x] = "player";
    grid[ghost.y][ghost.x] = "ghost";
    return grid;
  }, [ghost, pellets, player]);

  const pelletsRemaining = pellets.flat().filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-purple/20 bg-background/60 px-4 py-3 shadow-[inset_0_0_24px_rgba(188,140,255,0.04)]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-green/30 bg-accent-green/10 font-mono text-sm text-accent-green shadow-[0_0_18px_rgba(63,185,80,0.13)]">
            &gt;_
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-purple">Pacman.exe</p>
            <p className="text-sm text-muted">Clear the grid. Stay ahead of the sentinel.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:border-accent-cyan/50 hover:text-accent-cyan"
        >
          Reset run
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Score</p>
          <p className="font-mono text-lg font-semibold text-accent-cyan">{String(score).padStart(4, "0")}</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Pellets left</p>
          <p className="font-mono text-lg font-semibold text-accent-green">{String(pelletsRemaining).padStart(2, "0")}</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">System</p>
          <p className={`font-mono text-sm font-semibold ${gameOver ? "text-rose-300" : "text-accent-purple"}`}>
            {gameOver ? "CAUGHT" : "RUNNING"}
          </p>
        </div>
      </div>

      <SwipeSurface>
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-accent-purple/30 bg-[radial-gradient(circle_at_top,rgba(188,140,255,0.18),transparent_42%),linear-gradient(145deg,rgba(22,27,34,0.98),rgba(7,12,20,0.98))] p-2 shadow-[0_0_30px_rgba(188,140,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.03)] sm:p-3 lg:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(88,166,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(88,166,255,0.035)_1px,transparent_1px)] bg-[size:18px_18px]" />
        <div className="pointer-events-none absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/70 to-transparent" />
        <div className="relative rounded-xl border border-accent-cyan/15 bg-[#060b12]/85 p-2 shadow-[inset_0_0_30px_rgba(88,166,255,0.06)] sm:p-3">
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {renderGrid.flat().map((cell, index) => (
            <div
              key={`${cell}-${index}`}
              className={`relative aspect-square overflow-hidden ${
                cell === "wall"
                  ? "rounded-[3px] border border-accent-purple/35 bg-gradient-to-br from-slate-700 to-slate-900 shadow-[inset_0_0_10px_rgba(188,140,255,0.16)]"
                  : cell === "pellet"
                    ? "flex items-center justify-center"
                    : cell === "player"
                      ? "rounded-full bg-amber-300 [clip-path:polygon(0_0,100%_50%,0_100%,28%_50%)] shadow-[0_0_16px_rgba(251,191,36,0.9)]"
                      : cell === "ghost"
                        ? "rounded-t-full rounded-b-[35%] bg-gradient-to-b from-rose-300 to-rose-600 shadow-[0_0_18px_rgba(251,113,133,0.9)]"
                        : "rounded-[2px] bg-slate-950/70"
              }`}
            >
              {cell === "pellet" && <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(88,166,255,1)] sm:h-2 sm:w-2" />}
              {cell === "ghost" && (
                <span className="absolute inset-x-[22%] top-[28%] flex justify-between">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-950 sm:h-2 sm:w-2" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-950 sm:h-2 sm:w-2" />
                </span>
              )}
            </div>
          ))}
          </div>
        </div>
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/65 p-6 backdrop-blur-[2px]">
            <div className="rounded-xl border border-rose-400/40 bg-surface/95 px-6 py-5 text-center shadow-[0_0_30px_rgba(251,113,133,0.2)]">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-rose-300">Run terminated</p>
              <p className="mt-2 text-sm text-muted">The sentinel caught you.</p>
              <button type="button" onClick={reset} className="mt-4 rounded-md bg-rose-400/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-rose-200 transition hover:bg-rose-400/25">
                Restart
              </button>
            </div>
          </div>
        )}
      </div>
      </SwipeSurface>
      <p className="font-mono text-xs text-muted">Use your arrow keys to navigate the maze.</p>
    </div>
  );
}

function MazeGame({ onScoreChange }: GameProps) {
  const [mazeLayout, setMazeLayout] = useState<string[]>(() => createMazeLayout());
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Reach the goal tile to score points.");

  useEffect(() => {
    onScoreChange(score);
  }, [onScoreChange, score]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const directionMap: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };

      const delta = directionMap[event.key];
      if (!delta) return;

      event.preventDefault();
      event.stopPropagation();

      setPlayer((current) => {
        const next = { x: current.x + delta.x, y: current.y + delta.y };
        const cell = mazeLayout[next.y]?.[next.x];

        if (!cell || cell === "#") {
          return current;
        }

        if (cell === "G") {
          setScore((previous) => previous + 25);
          setMazeLayout((currentLayout) => createMazeLayout(currentLayout));
          setStatus("Goal reached — fresh maze generated.");
          return { x: 1, y: 1 };
        }

        setStatus("Maze run in progress.");
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mazeLayout]);

  const reset = () => {
    setMazeLayout(createMazeLayout());
    setPlayer({ x: 1, y: 1 });
    setScore(0);
    setStatus("Maze reset. Reach the goal tile.");
  };

  const renderGrid = useMemo(() => {
    return mazeLayout.flatMap((row, y) =>
      row.split("").map((cell, x) => {
        const isPlayer = player.x === x && player.y === y;
        const isGoal = cell === "G";
        const isWall = cell === "#";
        const isPath = cell === "." || cell === "S";

        return {
          key: `${x}-${y}`,
          type: isWall ? "wall" : isGoal ? "goal" : isPlayer ? "player" : isPath ? "path" : "empty",
        };
      })
    );
  }, [mazeLayout, player]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-rose-300">Score: {score}</p>
        </div>
        <button type="button" onClick={reset} className="rounded-md border border-border px-3 py-2 text-sm">Restart</button>
      </div>

      <SwipeSurface>
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[22px] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.16),transparent_45%),linear-gradient(180deg,rgba(17,24,39,0.95),rgba(2,6,23,0.95))] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] sm:p-3">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px] opacity-50" />
        <div className="relative grid gap-1" style={{ gridTemplateColumns: `repeat(${mazeLayout[0].length}, minmax(0, 1fr))` }}>
          {renderGrid.map((cell) => (
            <div
              key={cell.key}
              className={`aspect-square rounded-[4px] ${
                cell.type === "wall"
                  ? "bg-slate-800"
                  : cell.type === "goal"
                    ? "bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]"
                    : cell.type === "player"
                      ? "bg-rose-300 shadow-[0_0_16px_rgba(253,164,175,0.9)]"
                      : "bg-slate-950/90"
              }`}
            />
          ))}
        </div>
      </div>

      </SwipeSurface>
      <p className="font-mono text-sm text-accent-purple">{status}</p>
    </div>
  );
}

function SudokuGame({ onScoreChange }: GameProps) {
  const initialPuzzleRef = useRef(createSudokuPuzzle());
  const [sudokuState, setSudokuState] = useState(() => ({
    puzzleBoard: initialPuzzleRef.current,
    board: initialPuzzleRef.current.map((row) => [...row]),
  }));
  const [selected, setSelected] = useState<[number, number] | null>(() => findFirstEditableCell(initialPuzzleRef.current));
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState(() => {
    const [row, col] = findFirstEditableCell(initialPuzzleRef.current);
    return `Selected row ${row + 1}, col ${col + 1}. Use arrow keys to move.`;
  });

  const { puzzleBoard, board } = sudokuState;

  useEffect(() => {
    onScoreChange(score);
  }, [onScoreChange, score]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
        const [row, col] = selected ?? findFirstEditableCell(puzzleBoard);
        const nextSelection = findNextEditableCell(puzzleBoard, row, col, key);

        setSelected(nextSelection);
        setStatus(`Selected row ${nextSelection[0] + 1}, col ${nextSelection[1] + 1}.`);
        return;
      }

      if (!selected) {
        if (/^[1-9]$/.test(key)) {
          setStatus("Choose a puzzle square first.");
        }
        return;
      }

      if (key === "Backspace" || key === "Delete" || key === "0") {
        handleValue(0);
        return;
      }

      if (/^[1-9]$/.test(key)) {
        handleValue(Number(key));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, selected]);

  const reset = () => {
    const nextPuzzle = createSudokuPuzzle();
    setSudokuState({
      puzzleBoard: nextPuzzle,
      board: nextPuzzle.map((row) => [...row]),
    });
    const firstEditable = findFirstEditableCell(nextPuzzle);
    setSelected(firstEditable);
    setScore(0);
    setStatus(`New puzzle loaded. Selected row ${firstEditable[0] + 1}, col ${firstEditable[1] + 1}.`);
  };

  const handleCellClick = (row: number, col: number) => {
    if (puzzleBoard[row][col] !== 0) {
      setStatus("That square is locked in the clue set.");
      return;
    }

    setSelected([row, col]);
    setStatus(`Selected row ${row + 1}, col ${col + 1}. Use arrow keys to move.`);
  };

  const handleValue = (value: number) => {
    if (!selected) {
      setStatus("Choose a puzzle square first.");
      return;
    }

    const [row, col] = selected;
    if (puzzleBoard[row][col] !== 0) {
      setStatus("That square is part of the puzzle clues.");
      return;
    }

    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = value;
    setSudokuState((current) => ({
      ...current,
      board: nextBoard,
    }));

    if (value === 0) {
      setStatus("Cell cleared.");
      return;
    }

    if (value === SUDOKU_SOLUTION[row][col]) {
      setScore((previous) => previous + 10);
      setStatus("Correct move.");
    } else {
      setScore((previous) => Math.max(0, previous - 2));
      setStatus("That number does not fit the solution.");
    }

    if (nextBoard.every((boardRow, r) => boardRow.every((cell, c) => cell === SUDOKU_SOLUTION[r][c]))) {
      setStatus("Puzzle solved — excellent run.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300">Score: {score}</p>
          <p className="text-sm text-muted">Click a tile or use your keyboard to fill the grid.</p>
        </div>
        <button type="button" onClick={reset} className="rounded-md border border-border px-3 py-2 text-sm">Restart</button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2 sm:grid-cols-[minmax(0,1fr)_112px] lg:grid-cols-[1fr_130px] lg:gap-4">
        <div className="relative min-w-0 overflow-hidden rounded-[18px] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_45%),linear-gradient(180deg,rgba(17,24,39,0.95),rgba(2,6,23,0.95))] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] sm:rounded-[22px] sm:p-3">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px] opacity-50" />
          <div className="relative mx-auto grid w-full max-w-[22rem] grid-cols-9 gap-0.5 sm:gap-1">
            {board.flat().map((cell, index) => {
              const row = Math.floor(index / 9);
              const col = index % 9;
              const isSelected = selected?.[0] === row && selected?.[1] === col;
              const isLocked = puzzleBoard[row][col] !== 0;
              const isCorrect = cell !== 0 && cell === SUDOKU_SOLUTION[row][col];

              return (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  onClick={() => handleCellClick(row, col)}
                  className={`aspect-square rounded-[5px] border text-xs font-semibold outline-none focus:outline-none focus-visible:outline-none transition-all sm:text-sm ${
                    isLocked
                      ? "border-amber-400/40 bg-amber-300/10 text-amber-100"
                      : isSelected
                        ? "border-transparent bg-accent-cyan/20 text-foreground shadow-[inset_0_0_0_2px_rgba(34,211,238,0.45)]"
                        : isCorrect
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                          : "border-border/70 bg-slate-950/90 text-muted"
                  }`}
                >
                  {cell || ""}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-background/60 p-2 sm:p-3">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent-cyan sm:mb-2 sm:text-xs">Input</p>
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleValue(value)}
                className="rounded-lg border border-border bg-background px-1 py-1.5 text-xs text-muted transition hover:border-accent-cyan/40 hover:text-foreground sm:px-2 sm:py-3 sm:text-sm"
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleValue(0)}
              className="col-span-3 rounded-lg border border-border bg-background px-1 py-1.5 text-xs text-muted transition hover:border-accent-cyan/40 hover:text-foreground sm:px-2 sm:py-3 sm:text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <p className="font-mono text-sm text-accent-purple">{status}</p>
    </div>
  );
}

export function Games() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  useEffect(() => {
    const handleOpenGame = (event: Event) => {
      const customEvent = event as CustomEvent<{ gameId?: string }>;
      const gameId = customEvent.detail?.gameId;
      if (gameId && (gameId === "snake" || gameId === "tetris" || gameId === "2048" || gameId === "minesweeper" || gameId === "sudoku" || gameId === "maze")) {
        setActiveGame(gameId);
      }
    };

    window.addEventListener("snhl-open-game", handleOpenGame);
    return () => window.removeEventListener("snhl-open-game", handleOpenGame);
  }, []);

  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="games"
          number="04. games"
          title="Mini-game lab"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {GAME_CATALOG.map((game) => (
            <GameCard key={game.id} game={game} onOpen={() => setActiveGame(game.id)} />
          ))}
        </div>
      </div>

      {activeGame && <GameShell gameId={activeGame} onClose={() => setActiveGame(null)} />}
    </section>
  );
}
