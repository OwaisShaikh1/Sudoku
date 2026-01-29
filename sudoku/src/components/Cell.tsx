import React, { forwardRef } from 'react';

type Props = {
  row: number;
  col: number;
  value: number | null;
  given?: boolean;
  candidates?: number[];
  onChange?: (value: number | null) => void;
  onNavigate?: (row: number, col: number) => void;
};

export const Cell = forwardRef<HTMLInputElement, Props>(
  ({ row, col, value, candidates, onChange, onNavigate }, ref) => {
    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
      const val = e.target.value;
      if (val === '') {
        onChange?.(null);
      } else {
        const num = Number(val);
        if (num >= 1 && num <= 9) {
          onChange?.(num);
        }
      }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let newRow = row;
        let newCol = col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            break;
        }

        onNavigate?.(newRow, newCol);
      }
    }

    return (
      <div 
        className="sudoku-cell-container"
        data-row={row}
        data-col={col}
      >
        <input
          ref={ref}
          className="sudoku-cell"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value ?? ''}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          style={{ textAlign: 'center' }}
        />
        {!value && candidates && candidates.length > 0 && (
          <div className="sudoku-cell-candidates">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
              <span
                key={num}
                className={`candidate ${candidates.includes(num) ? 'possible' : 'impossible'}`}
              >
                {candidates.includes(num) ? num : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);
