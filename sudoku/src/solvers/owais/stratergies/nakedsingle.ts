import type { SolverState } from '../../../types';

export function applyNakedSingle(state: SolverState): boolean {
  const { board, candidates } = state;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        // Use pre-computed candidates from state
        const cellCandidates = candidates[row][col];
        if (cellCandidates.length === 1) {
          board[row][col] = cellCandidates[0];
          console.log(`[NakedSingle] Placed ${cellCandidates[0]} at [${row},${col}]`);
          return true; // one logical move applied
        }
      }
    }
  }
  return false;
}
