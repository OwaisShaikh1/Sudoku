import type { Board } from '../../../types';

export type CandidatesGrid = (number[][])[];

/**
 * Pointing Pairs/Triples Strategy (Box/Line Reduction)
 * 
 * If a candidate number appears in only one row (or column) within a box,
 * then that number can be eliminated from that row (or column) outside the box.
 * 
 * Example: If 5 only appears in row 1 within box 1, remove 5 from row 1 in boxes 2 and 3.
 */
export function applyPointingPairsStrategy(_board: Board): boolean {
  return false;
}

/**
 * Apply pointing pairs strategy to candidates grid
 * Returns a new candidates grid with pointing pairs eliminations applied
 */
export function applyPointingPairsStrategyToGrid(candidates: CandidatesGrid): CandidatesGrid {
  // Deep copy to avoid mutating the original
  let result = candidates.map(row => row.map(cell => [...cell]));
  
  let totalReductionsFound = 0;
  let iteration = 0;
  let reductionsFoundThisIteration = 0;
  
  do {
    iteration++;
    reductionsFoundThisIteration = 0;

    // Check each 3x3 box
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        reductionsFoundThisIteration += checkBoxForPointingPairs(result, boxRow, boxCol);
      }
    }
    
    totalReductionsFound += reductionsFoundThisIteration;
  } while (reductionsFoundThisIteration > 0);

  if (totalReductionsFound > 0) {
    console.log(`[PointingPairs] Found ${totalReductionsFound} reduction(s) in ${iteration} iteration(s)`);
  }

  return result;
}

/**
 * Check a box for pointing pairs/triples
 */
function checkBoxForPointingPairs(
  candidates: CandidatesGrid,
  boxRow: number,
  boxCol: number
): number {
  let reductionsApplied = 0;
  const boxName = `Box(${boxRow/3},${boxCol/3})`;

  // For each number 1-9
  for (let num = 1; num <= 9; num++) {
    // Find all cells in this box that contain this number
    const cellsWithNum: Array<[number, number]> = [];
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (candidates[r][c].includes(num)) {
          cellsWithNum.push([r, c]);
        }
      }
    }

    if (cellsWithNum.length === 0 || cellsWithNum.length === 1) {
      continue; // No pointing pair possible
    }

    // Check if all cells are in the same row
    const rows = new Set(cellsWithNum.map(([r, _]) => r));
    if (rows.size === 1) {
      const row = cellsWithNum[0][0];
      
      // Remove this number from the same row outside this box
      let eliminated = false;
      let eliminatedCells: string[] = [];
      for (let col = 0; col < 9; col++) {
        // Skip cells inside the current box
        if (col >= boxCol && col < boxCol + 3) continue;
        
        const before = candidates[row][col].length;
        candidates[row][col] = candidates[row][col].filter(n => n !== num);
        if (candidates[row][col].length < before) {
          eliminated = true;
          eliminatedCells.push(`[${row},${col}]`);
        }
      }
      
      if (eliminated) {
        console.log(`[PointingPairs] ${boxName}: ${num} in row ${row} -> eliminated from ${eliminatedCells.join(', ')}`);
        reductionsApplied++;
      }
      continue; // Don't check columns for this number
    }

    // Check if all cells are in the same column
    const cols = new Set(cellsWithNum.map(([_, c]) => c));
    if (cols.size === 1) {
      const col = cellsWithNum[0][1];
      
      // Remove this number from the same column outside this box
      let eliminated = false;
      let eliminatedCells: string[] = [];
      for (let row = 0; row < 9; row++) {
        // Skip cells inside the current box
        if (row >= boxRow && row < boxRow + 3) continue;
        
        const before = candidates[row][col].length;
        candidates[row][col] = candidates[row][col].filter(n => n !== num);
        if (candidates[row][col].length < before) {
          eliminated = true;
          eliminatedCells.push(`[${row},${col}]`);
        }
      }
      
      if (eliminated) {
        console.log(`[PointingPairs] ${boxName}: ${num} in col ${col} -> eliminated from ${eliminatedCells.join(', ')}`);
        reductionsApplied++;
      }
    }
  }

  return reductionsApplied;
}
