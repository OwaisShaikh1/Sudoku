import type { Board } from '../types';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function findEmpty(board: Board): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0 || board[row][col] == null) {
        return [row, col];
      }
    }
  }
  return null;
}

export function isValid(board: Board, row: number, col: number, value: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === value) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === value) return false;
    }
  }
  return true;
}

// Async solver with 1s delay after each cell update
export async function solveBoard(board: Board): Promise<boolean> {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [row, col] = empty;
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      await sleep(1000);
      if (await solveBoard(board)) return true;
      board[row][col] = null;
      await sleep(1000);
    }
  }
  return false;
}
