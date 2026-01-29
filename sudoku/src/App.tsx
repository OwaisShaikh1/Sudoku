import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Tree from 'react-d3-tree';
import './App.css';
import './TreeVisualization.css';
import { Board as BoardComponent } from './components/Board';
import type { Board } from './types';
import { findEmpty, isValid } from './logic/solver';
import { solvers } from './solvers';
import { setOwaisConfig } from './solvers/owais/config';

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

// Count total nodes in tree
function countNodes(node: any): number {
  if (!node) return 0;
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

function TreeVisualization({ tree, currentNodeId }: { tree: any; currentNodeId: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.7);
  const [nodeCount, setNodeCount] = useState(0);
  const [translate, setTranslate] = useState({ x: 400, y: 60 });

  // Get container dimensions on mount
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 60 });
    }
  }, []);

  // Count nodes
  useEffect(() => {
    setNodeCount(countNodes(tree));
  }, [tree]);

  // Memoized tree data transformation
  const treeData = useMemo(() => {
    if (!tree.children || tree.children.length === 0) {
      return null;
    }

    function transformNode(node: any, nodeId: string): any {
      const isBacktracked = node.backtracked === true;
      const isCurrent = currentNodeId === nodeId;
      
      return {
        name: `${node.value}`,
        attributes: {
          row: node.row,
          col: node.col,
          backtracked: isBacktracked,
          current: isCurrent,
          nodeId: nodeId
        },
        children: node.children?.map((child: any, index: number) => 
          transformNode(child, `${nodeId}-${index}`)
        ).filter(Boolean) || []
      };
    }

    return {
      name: 'Root',
      attributes: { type: 'root' },
      children: tree.children.map((child: any, index: number) => 
        transformNode(child, `root-${index}`)
      ).filter(Boolean)
    };
  }, [tree, currentNodeId]);

  // Custom node rendering - memoized callback
  const renderCustomNode = useCallback(({ nodeDatum, toggleNode }: any) => {
    const isRoot = nodeDatum.attributes?.type === 'root';
    const isCurrent = nodeDatum.attributes?.current;
    const isBacktracked = nodeDatum.attributes?.backtracked;
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

    return (
      <g>
        <circle
          r={isRoot ? 24 : 20}
          fill={isCurrent ? '#ffeb3b' : (isBacktracked ? '#fdd' : (isRoot ? '#e0e0e0' : '#fff'))}
          stroke={isCurrent ? '#f57c00' : (isBacktracked ? '#e55' : '#333')}
          strokeWidth={isCurrent ? 4 : 2}
          opacity={isBacktracked ? 0.7 : 1}
          onClick={toggleNode}
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
        />
        <text
          fill="#000"
          strokeWidth="0"
          x="0"
          y="6"
          textAnchor="middle"
          style={{ fontSize: isRoot ? '16px' : '14px', fontWeight: isRoot ? 'bold' : '600' }}
        >
          {nodeDatum.name}
        </text>
        {!isRoot && (
          <text
            fill="#666"
            strokeWidth="0"
            x="0"
            y="32"
            textAnchor="middle"
            style={{ fontSize: '11px' }}
          >
            ({nodeDatum.attributes?.row},{nodeDatum.attributes?.col})
          </text>
        )}
        {isBacktracked && (
          <text
            fill="#c00"
            strokeWidth="0"
            x="24"
            y="6"
            textAnchor="middle"
            style={{ fontSize: '16px', fontWeight: 'bold' }}
          >
            ✗
          </text>
        )}
      </g>
    );
  }, []);

  if (!treeData) {
    return (
      <div className="tree-container">
        <div className="tree-header">
          <span>Decision Tree</span>
          <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
            (0 nodes)
          </span>
        </div>
        <div className="tree-empty">Tree will appear here when solving...</div>
      </div>
    );
  }

  return (
    <div className="tree-container">
      <div className="tree-header">
        <span>Decision Tree</span>
        <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
          ({nodeCount} nodes)
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#666' }}>Zoom:</span>
          <input
            type="range"
            min="30"
            max="120"
            value={zoom * 100}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            style={{ width: '80px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', color: '#666', minWidth: '35px' }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>
      <div className="tree-d3-container" ref={containerRef}>
        <Tree
          data={treeData}
          translate={translate}
          orientation="vertical"
          pathFunc="step"
          separation={{ siblings: 0.5, nonSiblings: 0.5 }}
          nodeSize={{ x: 120, y: 100 }}
          renderCustomNodeElement={renderCustomNode}
          zoom={zoom}
          scaleExtent={{ min: 0.1, max: 2 }}
          enableLegacyTransitions={false}
          transitionDuration={0}
          depthFactor={100}
          centeringTransitionDuration={0}
          draggable={true}
          zoomable={true}
        />
      </div>
    </div>
  );
}

// Throttled update interval (ms) - increase for better performance, decrease for smoother visualization
const TREE_UPDATE_INTERVAL = 1;

export default function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [solving, setSolving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inputText, setInputText] = useState('');
  const [moveCount, setMoveCount] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [tree, setTree] = useState<any>({ children: [] });
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(50); // 0 = fastest, 100 = slowest
  const [selectedSolverIndex, setSelectedSolverIndex] = useState(0);
  const [visualize, setVisualize] = useState(false);
  const [showCandidates, setShowCandidates] = useState(true);
  const [usePointingPairs, setUsePointingPairs] = useState(false);
  const [useNakedPairs, setUseNakedPairs] = useState(false);
  const [useHiddenPairs, setUseHiddenPairs] = useState(false);
  const treeRef = useRef<any>({ children: [] });
  const lastTreeUpdateRef = useRef<number>(0);
  const speedRef = useRef(50); // Ref to access current speed in async function
  
  // Keep speedRef in sync with speed state
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Reset visualize when solver changes to non-backtracking
  useEffect(() => {
    if (solvers[selectedSolverIndex].name !== 'Backtracking') {
      setVisualize(false);
    }
  }, [selectedSolverIndex]);

  // Update Owais solver config when strategy toggles change
  useEffect(() => {
    setOwaisConfig({ usePointingPairs, useNakedPairs, useHiddenPairs });
  }, [usePointingPairs, useNakedPairs, useHiddenPairs]);

  const pendingUpdateRef = useRef<boolean>(false);

  // Throttled helper to sync tree ref to state for rendering
  const updateTreeState = useCallback((forceUpdate: boolean = false) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastTreeUpdateRef.current;
    
    if (forceUpdate || timeSinceLastUpdate >= TREE_UPDATE_INTERVAL) {
      lastTreeUpdateRef.current = now;
      pendingUpdateRef.current = false;
      setTree(JSON.parse(JSON.stringify(treeRef.current)));
    } else if (!pendingUpdateRef.current) {
      // Schedule a deferred update
      pendingUpdateRef.current = true;
      setTimeout(() => {
        if (pendingUpdateRef.current) {
          pendingUpdateRef.current = false;
          lastTreeUpdateRef.current = Date.now();
          setTree(JSON.parse(JSON.stringify(treeRef.current)));
        }
      }, TREE_UPDATE_INTERVAL - timeSinceLastUpdate);
    }
  }, []);

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
      setStatus(null);
    } catch {
      alert('Invalid input. Please check your formatting.');
    }
  }

  async function solveBoardWithUpdates(
    board: Board,
    setBoard: (b: Board) => void,
    isPaused: () => boolean,
    getDelay: () => number,
    setMoveCount: React.Dispatch<React.SetStateAction<number>>,
    parentNode: any,
    updateTree: () => void,
    parentPath: string
  ): Promise<boolean> {
    const empty = findEmpty(board);
    if (!empty) return true;
    const [row, col] = empty;

    if (!parentNode.children) parentNode.children = [];

    for (let num = 1; num <= 9; num++) {
      if (isValid(board, row, col, num)) {
        const childIndex = parentNode.children.length;
        const nodeId = `${parentPath}-${childIndex}`;
        const currentNode = { row, col, value: num, children: [], backtracked: false };
        parentNode.children.push(currentNode);
        setCurrentNodeId(nodeId);
        updateTree();
        
        board[row][col] = num;
        setBoard(board.map(r => r.slice()));
        setMoveCount(c => c + 1);
        await waitOrPause(isPaused, getDelay);

        if (await solveBoardWithUpdates(board, setBoard, isPaused, getDelay, setMoveCount, currentNode, updateTree, nodeId)) {
          return true;
        }

        // Mark as backtracked instead of removing
        currentNode.backtracked = true;
        setCurrentNodeId(nodeId);
        updateTree();
        
        board[row][col] = null;
        setBoard(board.map(r => r.slice()));
        setMoveCount(c => c + 1);
        await waitOrPause(isPaused, getDelay);
      }
    }

    return false;
  }

  async function handleSolve() {
    setSolving(true);
    setPaused(false);
    setStatus(null);
    setCurrentNodeId(null);
    const boardCopy: Board = board.map(row => row.slice());
    const selectedSolver = solvers[selectedSolverIndex];

    if (selectedSolver.name === 'Backtracking' && visualize) {
      // Use visualization for backtracking solver
      treeRef.current = { children: [] };
      updateTreeState(true); // Force initial update
      const getDelay = () => speedRef.current; // Get current speed from ref
      const solved = await solveBoardWithUpdates(boardCopy, setBoard, () => paused, getDelay, setMoveCount, treeRef.current, updateTreeState, 'root');
      setBoard(boardCopy.map(r => r.slice())); // Ensure UI reflects final state
      updateTreeState(true); // Force final update to ensure tree is synced
      setCurrentNodeId(null);
      if (!solved) setStatus('No solution found');
    } else {
      // Use selected solver without visualization
      setMoveCount(0);
      const result = await selectedSolver.solve(boardCopy);
      if (result) {
        setBoard(result);
        setStatus('Solved!');
      } else {
        setStatus('No solution found');
      }
    }
    setSolving(false);
    setPaused(false);
  }

  function handlePause() {
    setPaused(p => !p);
  }

  function handleReset() {
    setBoard(createEmptyBoard());
    setMoveCount(0);
    setStatus(null);
    setCurrentNodeId(null);
    treeRef.current = { children: [] };
    setTree({ children: [] });
  }

  return (
    <div className="app-container">
      <div className="board-panel">
        <h1>Sudoku Solver</h1>
        <div style={{ 
          marginBottom: '1.2rem', 
          fontWeight: 'bold', 
          fontSize: '1.1rem',
          padding: '0.5rem 1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ddd',
          width: '100%',
          textAlign: 'center'
        }}>
          Moves: {moveCount}
        </div>
        <div style={{ 
          marginBottom: '1.2rem', 
          padding: '0.75rem 1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ddd',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Speed</span>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>
              {speed === 0 ? 'Max' : speed < 20 ? 'Fast' : speed < 50 ? 'Medium' : speed < 80 ? 'Slow' : 'Very Slow'}
              {' '}({speed}ms)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ 
              width: '100%',
              cursor: 'pointer',
              accentColor: '#2196F3'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem',
            color: '#999',
            marginTop: '0.25rem'
          }}>
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>
        <div style={{ 
          marginBottom: '1.2rem', 
          padding: '0.75rem 1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ddd',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Solver</span>
          </div>
          <select
            value={selectedSolverIndex}
            onChange={(e) => setSelectedSolverIndex(Number(e.target.value))}
            style={{ 
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white'
            }}
          >
            {solvers.map((solver, index) => (
              <option key={index} value={index}>
                {solver.name}
              </option>
            ))}
          </select>
          {solvers[selectedSolverIndex].timeComplexity && (
            <div style={{ 
              marginTop: '0.75rem',
              padding: '0.6rem',
              background: '#fff',
              borderRadius: '4px',
              fontSize: '0.82rem',
              color: '#555'
            }}>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>Time:</strong> {solvers[selectedSolverIndex].timeComplexity}
              </div>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>Space:</strong> {solvers[selectedSolverIndex].spaceComplexity}
              </div>
              {solvers[selectedSolverIndex].description && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#777', lineHeight: '1.4' }}>
                  {solvers[selectedSolverIndex].description}
                </div>
              )}
            </div>
          )}
        </div>
        {solvers[selectedSolverIndex].name === 'Backtracking' && (
          <div style={{ 
            marginBottom: '1.2rem', 
            padding: '0.75rem 1rem',
            background: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={visualize}
                onChange={(e) => setVisualize(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Show Visualization
            </label>
          </div>
        )}
        <div style={{ 
          marginBottom: '1.2rem', 
          padding: '0.75rem 1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ddd',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showCandidates}
              onChange={(e) => setShowCandidates(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Show Candidate Notes
          </label>
        </div>
        {solvers[selectedSolverIndex].name === 'Owais Logic' && (
          <div style={{ 
            marginBottom: '1.2rem', 
            padding: '0.75rem 1rem',
            background: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.6rem' }}>
              Advanced Strategies
            </div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}>
              <input
                type="checkbox"
                checked={usePointingPairs}
                onChange={(e) => setUsePointingPairs(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Pointing Pairs Strategy
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}>
              <input
                type="checkbox"
                checked={useNakedPairs}
                onChange={(e) => setUseNakedPairs(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Naked Pairs Strategy
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={useHiddenPairs}
                onChange={(e) => setUseHiddenPairs(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Hidden Pairs Strategy
            </label>
          </div>
        )}
        {status && <div style={{ 
          color: '#c00', 
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#ffe6e6',
          borderRadius: '4px',
          border: '1px solid #ffb3b3',
          width: '100%',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {status}
        </div>}
        <div style={{ 
          marginBottom: '1.5rem', 
          width: '100%',
          padding: '1rem',
          background: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '6px'
        }}>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            rows={6}
            cols={35}
            placeholder={'[0, 0, 0, 0, 6, 0, 0, 0, 0]\n[4, 0, 0, 1, 5, 7, 0, 0, 0]\n...'}
            disabled={solving}
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '0.9rem', 
              marginBottom: '0.75rem',
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
          <button
            style={{ 
              padding: '0.5rem 1.5rem', 
              fontSize: '0.9rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: solving ? 'not-allowed' : 'pointer',
              opacity: solving ? 0.6 : 1,
              fontWeight: '500',
              width: '100%'
            }}
            onClick={handleLoadInput}
            disabled={solving}
          >
            Load Puzzle
          </button>
        </div>
        <BoardComponent board={board} onCellChange={solving ? undefined : handleCellChange} showCandidates={showCandidates} usePointingPairs={usePointingPairs} useNakedPairs={useNakedPairs} useHiddenPairs={useHiddenPairs} />
        <div style={{ 
          marginTop: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          width: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.95rem',
              background: solving ? '#999' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: solving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              minWidth: '120px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={handleSolve}
            disabled={solving}
          >
            {solving ? 'Solving...' : 'Solve'}
          </button>
          <button
            style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.95rem',
              background: !solving ? '#ccc' : (paused ? '#4CAF50' : '#FF9800'),
              color: !solving ? '#888' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !solving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              minWidth: '120px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={handlePause}
            disabled={!solving}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.95rem',
              background: solving ? '#ccc' : '#f44336',
              color: solving ? '#888' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: solving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              minWidth: '120px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={handleReset}
            disabled={solving}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="tree-panel">
        <TreeVisualization tree={tree} currentNodeId={currentNodeId} />
      </div>
    </div>
  );
}

// Helper to update board state after each cell update
async function waitOrPause(isPaused: () => boolean, getDelay: () => number) {
  while (isPaused()) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const delay = getDelay();
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
