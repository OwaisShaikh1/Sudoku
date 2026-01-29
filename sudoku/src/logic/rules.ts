import type { Board } from '../types';

/**
 * Check whether placing `value` at (row,col) is valid according to Sudoku rules.
 * TODO: implement.
 */
export function isMoveValid(board: Board, row: number, col: number, value: number): boolean {
  throw new Error('Not implemented');
}

/**
 * Return candidate values for the given cell.
 * TODO: implement.
 */
export function possibleValues(board: Board, row: number, col: number): number[] {
  throw new Error('Not implemented');
}
