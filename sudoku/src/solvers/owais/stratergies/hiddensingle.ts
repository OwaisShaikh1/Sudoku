import type { SolverState } from '../../../types';

export function applyHiddenSingle(state: SolverState): boolean {
  const { board, candidates } = state;

  // For each number
  for (let num = 1; num <= 9; num++) {

    // ROWS
    for (let row = 0; row < 9; row++) {
      const possibleCols: number[] = [];

      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null && candidates[row][col].includes(num)) {
          possibleCols.push(col);
        }
      }

      if (possibleCols.length === 1) {
        board[row][possibleCols[0]] = num;
        console.log(`[HiddenSingle] Placed ${num} at [${row},${possibleCols[0]}] (row)`);
        return true;
      }
    }

    // COLUMNS
    for (let col = 0; col < 9; col++) {
      const possibleRows: number[] = [];

      for (let row = 0; row < 9; row++) {
        if (board[row][col] === null && candidates[row][col].includes(num)) {
          possibleRows.push(row);
        }
      }

      if (possibleRows.length === 1) {
        board[possibleRows[0]][col] = num;
        console.log(`[HiddenSingle] Placed ${num} at [${possibleRows[0]},${col}] (column)`);
        return true;
      }
    }

    // BOXES
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        const positions: [number, number][] = [];

        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            if (board[r][c] === null && candidates[r][c].includes(num)) {
              positions.push([r, c]);
            }
          }
        }

        if (positions.length === 1) {
          const [r, c] = positions[0];
          board[r][c] = num;
          console.log(`[HiddenSingle] Placed ${num} at [${r},${c}] (box)`);
          return true;
        }
      }
    }
  }

  return false;
}
