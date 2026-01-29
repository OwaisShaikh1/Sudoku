export type Cell = {
  row: number;
  col: number;
  value: number | null;
  given?: boolean;
  candidates?: number[]; // possible values for this cell
};

export type Board = (number | null)[][]; // 9x9 board: null for empty

export type CandidatesGrid = (number[][])[];

export interface SolverState {
  board: Board;
  candidates: CandidatesGrid;
}
