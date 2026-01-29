// Common interface for Sudoku solvers
// Place this in src/solvers/solverInterface.ts

import type { Board } from '../types';

export interface Solver {
  name: string;
  solve: (board: Board) => Promise<Board | null> | Board | null;
  timeComplexity?: string;
  spaceComplexity?: string;
  description?: string;
}
