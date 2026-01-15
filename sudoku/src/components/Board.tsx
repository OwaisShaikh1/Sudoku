import type { Board as BoardType } from '../types';
import { Cell } from './Cell';

type Props = {
  board: BoardType;
  onCellChange?: (row: number, col: number, value: number | null) => void;
};

export function Board({ board, onCellChange }: Props) {
  return (
    <div className="sudoku-board">
      {board.map((row, rIdx) => (
        <div key={rIdx} className="sudoku-row">
          {row.map((cell, cIdx) => (
            <Cell
              key={`${rIdx}-${cIdx}`}
              row={rIdx}
              col={cIdx}
              value={cell}
              onChange={onCellChange ? (value) => onCellChange(rIdx, cIdx, value) : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
