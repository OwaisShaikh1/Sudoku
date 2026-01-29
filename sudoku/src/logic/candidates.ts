import type { Board } from '../types';
import { applyNakedPairStrategyToGrid } from '../solvers/owais/stratergies/nakedpair';
import { applyHiddenPairStrategyToGrid } from '../solvers/owais/stratergies/hiddenpair';
import { applyPointingPairsStrategyToGrid } from '../solvers/owais/stratergies/pointingpairs';

/**
 * Get all possible candidates for a specific cell.
 * Recursively checks if each number 1-9 can be placed in the cell
 * based on Sudoku rules (no duplicates in row, column, or 3x3 box).
 */
export function getCandidates(board: Board, row: number, col: number): number[] {
  // If cell is already filled, no candidates
  if (board[row][col] !== null) {
    return [];
  }

  const candidates: number[] = [];

  // Check each number 1-9
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      candidates.push(num);
    }
  }

  return candidates;
}

/**
 * Check if placing a number at a specific position is valid.
 * Checks row, column, and 3x3 box constraints.
 */
function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  if (board[row].includes(num)) {
    return false;
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get all candidates for the entire board.
 * Returns a 9x9 array where each cell contains an array of possible numbers.
 */
export function getAllCandidates(board: Board): (number[][])[] {
  return board.map((row, rowIdx) =>
    row.map((_, colIdx) => getCandidates(board, rowIdx, colIdx))
  );
}

/**
 * Get all candidates with optional strategy enhancement
 * Applies enabled strategies to candidates for better solving
 */
export function getAllCandidatesWithStrategy(board: Board, usePointingPairs: boolean = false, useNakedPairs: boolean = false, useHiddenPairs: boolean = false): (number[][])[] {
  let candidates = getAllCandidates(board);
  
  // Apply in order: clean up candidates first, then look for pointing pairs
  if (useNakedPairs) {
    candidates = applyNakedPairStrategyToGrid(candidates);
  }
  if (useHiddenPairs) {
    candidates = applyHiddenPairStrategyToGrid(candidates);
  }
  if (usePointingPairs) {
    candidates = applyPointingPairsStrategyToGrid(candidates);
  }
  
  return candidates;
}
