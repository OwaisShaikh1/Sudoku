import type { Solver } from '../solverInterface';
import type { Board } from '../../types';
import { solveLogically } from './engine';
import { getOwaisConfig } from './config';

// Your custom Sudoku solver implementation
// Implement your solving algorithm here following the Solver interface

export const OwaisSolver: Solver = {
  name: 'Owais Logic',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(n²)',
  description: 'n = board size (81 cells). Uses logical strategies: naked singles, hidden singles, naked pairs, hidden pairs, and pointing pairs.',

  solve: (board: Board): Board | null => {
    // Use logical strategies to solve as much as possible
    // Get the current config to check which strategies are enabled
    const config = getOwaisConfig();
    return solveLogically(
      board, 
      config.usePointingPairs || false,
      config.useNakedPairs || false,
      config.useHiddenPairs || false
    );
  }
};

// Helper functions you might need (uncomment and modify as needed):

/*
// Find the next empty cell (returns [row, col] or null)
function findEmpty(board: Board): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0 || board[row][col] == null) {
        return [row, col];
      }
    }
  }
  return null;
}

// Check if a number is valid in a specific position
function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}
*/









/*Once this works, you can add more human strategies, in order:

Naked Singles (cell has only one possible number)

Hidden Singles (what we did)

Naked Pairs

Pointing Pairs / Box-Line Reduction

X-Wing (advanced, optional)

Each is just stronger elimination, never guessing.*/