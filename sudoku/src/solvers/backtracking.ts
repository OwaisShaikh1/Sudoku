// Example backtracking solver implementation
// Place your custom solvers in this folder, following the Solver interface
import type { Solver } from './solverInterface';
import type { Board } from '../types';

export const BacktrackingSolver: Solver = {
  name: 'Backtracking',
  timeComplexity: 'O(9^m)',
  spaceComplexity: 'O(m)',
  description: 'm = number of empty cells. Uses depth-first search with backtracking.',
  solve: (board: Board): Board | null => {
    const newBoard = board.map(row => [...row]);
    const isSafe = (row: number, col: number, num: number): boolean => {
      for (let x = 0; x < 9; x++) {
        if (newBoard[row][x] === num || newBoard[x][col] === num) return false;
      }
      const startRow = row - row % 3, startCol = col - col % 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (newBoard[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };
    const solveSudoku = (): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (newBoard[row][col] === 0 || newBoard[row][col] == null) {
            for (let num = 1; num <= 9; num++) {
              if (isSafe(row, col, num)) {
                newBoard[row][col] = num;
                if (solveSudoku()) return true;
                newBoard[row][col] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    return solveSudoku() ? newBoard : null;
  }
};
