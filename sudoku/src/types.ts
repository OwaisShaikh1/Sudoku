export type Cell = {
  row: number;
  col: number;
  value: number | null;
  given?: boolean;
};

export type Board = (number | null)[][]; // 9x9 board: null for empty
