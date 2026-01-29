import type { Board } from '../../../types';
import { isValid } from '../../../logic/solver';

export function getCandidates(
  board: Board,
  row: number,
  col: number
): number[] {
  if (board[row][col] !== null) return [];

  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}
