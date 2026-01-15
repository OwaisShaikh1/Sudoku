import React from 'react';

type Props = {
  row: number;
  col: number;
  value: number | null;
  given?: boolean;
  onChange?: (value: number | null) => void;
};

export function Cell({ row, col, value, onChange }: Props) {
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
  return (
    <input
      className="sudoku-cell"
      data-row={row}
      data-col={col}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value ?? ''}
      onChange={handleInput}
      style={{ textAlign: 'center' }}
    />
  );
}
