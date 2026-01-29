import { useRef, useCallback, useMemo } from 'react';
import type { Board as BoardType } from '../types';
import { Cell } from './Cell';
import { getAllCandidatesWithStrategy } from '../logic/candidates';

type Props = {
  board: BoardType;
  onCellChange?: (row: number, col: number, value: number | null) => void;
  showCandidates?: boolean;
  usePointingPairs?: boolean;
  useNakedPairs?: boolean;
  useHiddenPairs?: boolean;
};

export function Board({ board, onCellChange, showCandidates = true, usePointingPairs = false, useNakedPairs = false, useHiddenPairs = false }: Props) {
  const cellRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );
  
  const allCandidates = useMemo(() => {
    if (!showCandidates) return null;
    return getAllCandidatesWithStrategy(board, usePointingPairs, useNakedPairs, useHiddenPairs);
  }, [board, showCandidates, usePointingPairs, useNakedPairs, useHiddenPairs]);

  const handleNavigate = useCallback((row: number, col: number) => {
    const cellInput = cellRefs.current[row]?.[col];
    if (cellInput) {
      cellInput.focus();
    }
  }, []);

  return (
    <div className="sudoku-board">
      {board.map((row, rIdx) => (
        <div key={rIdx} className="sudoku-row">
          {row.map((cell, cIdx) => (
            <Cell
              key={`${rIdx}-${cIdx}`}
              ref={(el) => {
                if (!cellRefs.current[rIdx]) cellRefs.current[rIdx] = [];
                cellRefs.current[rIdx][cIdx] = el;
              }}
              row={rIdx}
              col={cIdx}
              value={cell}
              candidates={allCandidates ? allCandidates[rIdx][cIdx] : undefined}
              onChange={onCellChange ? (value) => onCellChange(rIdx, cIdx, value) : undefined}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
