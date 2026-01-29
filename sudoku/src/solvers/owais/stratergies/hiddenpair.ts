import type { Board } from '../../../types';

export type CandidatesGrid = (number[][])[];

/**
 * Hidden Pair Strategy
 * 
 * If two numbers appear in only two cells within a unit (row/column/box),
 * even if those cells have other candidates, then those two cells must contain
 * those two numbers. Remove all other candidates from those cells.
 */
export function applyHiddenPairStrategy(_board: Board): boolean {
  return false;
}

/**
 * Apply hidden pair strategy to candidates grid
 * Returns a new candidates grid with hidden pairs isolated
 */
export function applyHiddenPairStrategyToGrid(candidates: CandidatesGrid): CandidatesGrid {
  // Deep copy to avoid mutating the original
  let result = candidates.map(row => row.map(cell => [...cell]));
  
  let totalPairsFound = 0;
  let iteration = 0;
  let pairsFoundThisIteration = 0;
  
  do {
    iteration++;
    pairsFoundThisIteration = 0;

    // Check rows
    for (let row = 0; row < 9; row++) {
      pairsFoundThisIteration += removeHiddenPairsFromUnit(result, getRowCells(row));
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      pairsFoundThisIteration += removeHiddenPairsFromUnit(result, getColCells(col));
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        pairsFoundThisIteration += removeHiddenPairsFromUnit(result, getBoxCells(boxRow, boxCol));
      }
    }
    
    totalPairsFound += pairsFoundThisIteration;
  } while (pairsFoundThisIteration > 0);

  if (totalPairsFound > 0) {
    console.log(`[HiddenPair] Found ${totalPairsFound} pair(s) in ${iteration} iteration(s)`);
  }

  return result;
}

/**
 * Find and apply hidden pairs in a unit
 */
function removeHiddenPairsFromUnit(
  candidates: CandidatesGrid,
  cells: Array<[number, number]>
): number {
  let pairsApplied = 0;

  // For each combination of two numbers (1-9)
  for (let num1 = 1; num1 <= 9; num1++) {
    for (let num2 = num1 + 1; num2 <= 9; num2++) {
      // Find cells that contain num1 OR num2
      const cellsWithNum1: Array<[number, number]> = [];
      const cellsWithNum2: Array<[number, number]> = [];
      
      for (const [row, col] of cells) {
        const cellCands = candidates[row][col];
        if (cellCands.length === 0) continue; // Skip filled cells
        
        if (cellCands.includes(num1)) {
          cellsWithNum1.push([row, col]);
        }
        if (cellCands.includes(num2)) {
          cellsWithNum2.push([row, col]);
        }
      }

      // Hidden pair: both numbers appear in exactly the same 2 cells
      if (cellsWithNum1.length === 2 && cellsWithNum2.length === 2) {
        const [cell1_1, cell1_2] = cellsWithNum1;
        const [cell2_1, cell2_2] = cellsWithNum2;
        
        // Check if they're the same two cells
        const sameCell1 = (cell1_1[0] === cell2_1[0] && cell1_1[1] === cell2_1[1]) ||
                          (cell1_1[0] === cell2_2[0] && cell1_1[1] === cell2_2[1]);
        const sameCell2 = (cell1_2[0] === cell2_1[0] && cell1_2[1] === cell2_1[1]) ||
                          (cell1_2[0] === cell2_2[0] && cell1_2[1] === cell2_2[1]);
        
        if (sameCell1 && sameCell2) {
          // Hidden pair found! Remove all candidates except num1 and num2 from these cells
          for (const [row, col] of [cell1_1, cell1_2]) {
            const before = candidates[row][col].length;
            if (before > 2) { // Only process if there are other candidates
              candidates[row][col] = candidates[row][col].filter(
                num => num === num1 || num === num2
              );
              if (candidates[row][col].length < before) {
                pairsApplied++;
                break; // Count pair once
              }
            }
          }
        }
      }
    }
  }

  return pairsApplied;
}

/**
 * Get all cell coordinates in a row
 */
function getRowCells(row: number): Array<[number, number]> {
  return Array.from({ length: 9 }, (_, col) => [row, col]);
}

/**
 * Get all cell coordinates in a column
 */
function getColCells(col: number): Array<[number, number]> {
  return Array.from({ length: 9 }, (_, row) => [row, col]);
}

/**
 * Get all cell coordinates in a 3x3 box
 */
function getBoxCells(boxRow: number, boxCol: number): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}
