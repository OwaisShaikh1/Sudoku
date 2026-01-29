import type { Solver } from './solverInterface';
import { BacktrackingSolver } from './backtracking';
import { OwaisSolver } from './owais/owaislogic';

export const solvers: Solver[] = [
  OwaisSolver,
  BacktrackingSolver,
];

export { BacktrackingSolver, OwaisSolver };
