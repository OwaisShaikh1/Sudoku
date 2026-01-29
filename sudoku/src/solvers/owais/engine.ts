import type { Board, SolverState, CandidatesGrid } from '../../types';
import { applyNakedSingle } from './stratergies/nakedsingle';
import { applyHiddenSingle } from './stratergies/hiddensingle';
import { getAllCandidates } from '../../logic/candidates';
import { applyPointingPairsStrategyToGrid } from './stratergies/pointingpairs';
import { applyNakedPairStrategyToGrid } from './stratergies/nakedpair';
import { applyHiddenPairStrategyToGrid } from './stratergies/hiddenpair';

export function solveStep(state: SolverState): boolean {
  return (
    applyNakedSingle(state) ||
    applyHiddenSingle(state)
  );
}

export function solveLogically(board: Board, usePointingPairs: boolean = false, useNakedPairs: boolean = false, useHiddenPairs: boolean = false): Board {
  const working = board.map(r => [...r]);

  // Compute candidates once at start (order: clean up candidates first, then look for pointing pairs)
  let candidates: CandidatesGrid = getAllCandidates(working);
  if (useNakedPairs) {
    candidates = applyNakedPairStrategyToGrid(candidates);
  }
  if (useHiddenPairs) {
    candidates = applyHiddenPairStrategyToGrid(candidates);
  }
  if (usePointingPairs) {
    candidates = applyPointingPairsStrategyToGrid(candidates);
  }

  let progress = true;
  while (progress) {
    // Create state object
    const state: SolverState = { board: working, candidates };
    
    progress = solveStep(state);
    
    // Only recalculate candidates if board changed (order: clean up candidates first, then look for pointing pairs)
    if (progress) {
      candidates = getAllCandidates(working);
      if (useNakedPairs) {
        candidates = applyNakedPairStrategyToGrid(candidates);
      }
      if (useHiddenPairs) {
        candidates = applyHiddenPairStrategyToGrid(candidates);
      }
      if (usePointingPairs) {
        candidates = applyPointingPairsStrategyToGrid(candidates);
      }
    }
  }

  return working;
}