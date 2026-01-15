import { useState } from 'react';
import { Board } from '../types';

/**
 * Create an empty 9x9 board.
 */
export function createEmptyBoard(): Board {
  const size = 9;
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

/**
 * Hook that will manage game state. Functions are stubs to be implemented.
 */
export function useGameStore(initial?: Board) {
  const [board, setBoard] = useState<Board>(initial ?? createEmptyBoard());

  function setCell(row: number, col: number, value: number | null) {
    throw new Error('Not implemented');
  }

  function resetBoard() {
    throw new Error('Not implemented');
  }

  return { board, setCell, resetBoard } as const;
}
