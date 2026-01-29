import type { Board } from '../../../types';

/**
 * Naked Pair Strategy for the solver engine
 * This strategy doesn't place numbers - it only eliminates candidates.
 * It should be used as a preprocessing step before other strategies,
 * so we return false to avoid infinite loops in the solver.
 * The strategy is integrated in the candidate calculation for other strategies.
 */
export function applyNakedPairStrategy(_board: Board): boolean {
  // For now, return false since naked pairs don't directly solve cells
  // They eliminate candidates which helps other strategies (naked single, hidden single)
  // This prevents infinite loops while still allowing the strategy to be in the pipeline
  return false;
}

/**
 * Naked Pair Strategy
 * 
 * If in a box, row, or column, a pair of numbers only occur in exactly two cells
 * (these cells contain no other numbers), then that pair cannot appear in any other cell
 * within that same box, row, or column.
 */

export type CandidatesGrid = (number[][])[];

/**
 * Apply naked pair strategy to candidates grid
 * Returns a new candidates grid with naked pairs removed from other cells
 */
export function applyNakedPairStrategyToGrid(candidates: CandidatesGrid): CandidatesGrid {
  // Deep copy to avoid mutating the original
  let result = candidates.map(row => row.map(cell => [...cell]));
  
  // Keep applying until no more pairs found (eliminations can create new pairs)
  let totalPairsFound = 0;
  let iteration = 0;
  let pairsFoundThisIteration = 0;
  
  do {
    iteration++;
    pairsFoundThisIteration = 0;

    // Check rows
    for (let row = 0; row < 9; row++) {
      pairsFoundThisIteration += removeNakedPairsFromUnits(result, getRowCells(row));
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      pairsFoundThisIteration += removeNakedPairsFromUnits(result, getColCells(col));
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        pairsFoundThisIteration += removeNakedPairsFromUnits(result, getBoxCells(boxRow, boxCol));
      }
    }
    
    totalPairsFound += pairsFoundThisIteration;
  } while (pairsFoundThisIteration > 0);

  if (totalPairsFound > 0) {
    console.log(`[NakedPair] Found ${totalPairsFound} pair(s) in ${iteration} iteration(s)`);
  }

  return result;
}

/**
 * Find and remove naked pairs from a unit (row, column, or box)
 */
function removeNakedPairsFromUnits(
  candidates: CandidatesGrid,
  cells: Array<[number, number]>
): number {
  // Find all cells that have exactly 2 candidates
  const pairCells: Array<[number, number, number[]]> = [];
  
  for (const [row, col] of cells) {
    const cellCandidates = candidates[row][col];
    if (cellCandidates.length === 2) {
      pairCells.push([row, col, cellCandidates]);
    }
  }

  // Need at least 2 cells with 2 candidates to form a pair
  if (pairCells.length < 2) {
    return 0;
  }

  // Look for duplicate pairs
  const pairMap = new Map<string, Array<[number, number]>>();
  
  for (const [row, col, cands] of pairCells) {
    // Create a canonical key for the pair (sorted)
    const key = [...cands].sort((a, b) => a - b).join(',');
    
    if (!pairMap.has(key)) {
      pairMap.set(key, []);
    }
    pairMap.get(key)!.push([row, col]);
  }

  // For each pair that appears exactly twice, remove from other cells
  let pairsApplied = 0;
  for (const [key, positions] of pairMap) {
    if (positions.length === 2) {
      const pair = key.split(',').map(Number);
      const [pos1, pos2] = positions;
      
      // Remove these pair candidates from all other cells in the unit
      for (const [row, col] of cells) {
        // Skip the two cells that form the pair
        if (
          (row === pos1[0] && col === pos1[1]) ||
          (row === pos2[0] && col === pos2[1])
        ) {
          continue;
        }

        const before = candidates[row][col].length;
        // Remove pair numbers from this cell's candidates
        candidates[row][col] = candidates[row][col].filter(
          num => !pair.includes(num)
        );
        const after = candidates[row][col].length;
        if (before !== after) {
          pairsApplied++;
          break; // Count this pair once, not for each elimination
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
