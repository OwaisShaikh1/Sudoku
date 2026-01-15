import { useState } from 'react';
import { Board as BoardComponent } from './components/Board';
import type { Board } from './types';
import { solveBoard } from './logic/solver';
import { findEmpty, isValid } from './logic/solver';

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

export default function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [solving, setSolving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inputText, setInputText] = useState('');
  const [moveCount, setMoveCount] = useState(0);

  function handleCellChange(row: number, col: number, value: number | null) {
    setBoard(prev => {
      const copy = prev.map(r => r.slice());
      copy[row][col] = value;
      return copy;
    });
    setMoveCount(c => c + 1);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputText(e.target.value);
  }

  function handleLoadInput() {
    try {
      // Extract all numbers from input
      const nums = inputText.match(/\d+/g)?.map(Number);
      if (!nums || nums.length !== 81) {
        alert('Invalid board format. Must contain exactly 81 numbers.');
        return;
      }
      // Build 9x9 board
      const boardData: Board = [];
      for (let i = 0; i < 9; i++) {
        boardData.push(nums.slice(i * 9, (i + 1) * 9).map(cell => cell === 0 ? null : cell));
      }
      setBoard(boardData);
      setMoveCount(0);
    } catch {
      alert('Invalid input. Please check your formatting.');
    }
  }

  async function handleSolve() {
    setSolving(true);
    setPaused(false);
    const boardCopy: Board = board.map(row => row.slice());
    await solveBoardWithUpdates(boardCopy, setBoard, () => paused, setMoveCount);
    setSolving(false);
    setPaused(false);
  }

  function handlePause() {
    setPaused(p => !p);
  }

  function handleReset() {
    setBoard(createEmptyBoard());
    setMoveCount(0);
  }

  return (
    <div className="app">
      <h1>Sudoku</h1>
      <div style={{marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem'}}>Moves: {moveCount}</div>
      <div style={{marginBottom: '1.5rem'}}>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          rows={10}
          cols={40}
          placeholder={
            '[0, 0, 0, 0, 6, 0, 0, 0, 0]\n[4, 0, 0, 1, 5, 7, 0, 0, 0]\n...'
          }
          disabled={solving}
          style={{fontFamily: 'monospace', fontSize: '1rem', marginBottom: '0.5rem'}}
        />
        <br />
        <button style={{padding: '0.5rem 1.5rem', fontSize: '1rem', marginBottom: '0.5rem'}} onClick={handleLoadInput} disabled={solving}>
          Load
        </button>
      </div>
      <BoardComponent board={board} onCellChange={solving ? undefined : handleCellChange} />
      <div style={{marginTop: '2rem'}}>
        <button style={{padding: '0.5rem 1.5rem', fontSize: '1rem', marginRight: '1rem'}} onClick={handleSolve} disabled={solving}>
          {solving ? 'Solving...' : 'Solve'}
        </button>
        <button style={{padding: '0.5rem 1.5rem', fontSize: '1rem', marginRight: '1rem'}} onClick={handlePause} disabled={!solving}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button style={{padding: '0.5rem 1.5rem', fontSize: '1rem'}} onClick={handleReset} disabled={solving}>
          Reset
        </button>
      </div>
    </div>
  );
}

// Helper to update board state after each cell update
async function solveBoardWithUpdates(
  board: Board,
  setBoard: (b: Board) => void,
  isPaused: () => boolean,
  setMoveCount: React.Dispatch<React.SetStateAction<number>>
): Promise<boolean> {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [row, col] = empty;
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      setBoard(board.map(r => r.slice()));
      setMoveCount(c => c + 1);
      await waitOrPause(isPaused);
      if (await solveBoardWithUpdates(board, setBoard, isPaused, setMoveCount)) return true;
      board[row][col] = null;
      setBoard(board.map(r => r.slice()));
      setMoveCount(c => c + 1);
      await waitOrPause(isPaused);
    }
  }
  return false;
}

async function waitOrPause(isPaused: () => boolean) {
  let waited = 0;
  while (isPaused()) {
    await new Promise(resolve => setTimeout(resolve, 100));
    waited += 100;
    if (waited > 60000) break; // safety: max 1 min pause per step
  }
  await new Promise(resolve => setTimeout(resolve, 5));
}
// ...existing code...
