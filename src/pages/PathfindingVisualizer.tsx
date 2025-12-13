import { useState, useCallback, useRef, useEffect } from 'react';

type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'path' | 'current';
type Algorithm = 'dijkstra' | 'astar' | 'bfs' | 'dfs';

interface Cell {
  row: number;
  col: number;
  type: CellType;
  distance: number;
  heuristic: number;
  totalCost: number;
  previous: Cell | null;
  isVisited: boolean;
}

const ROWS = 20;
const COLS = 40;

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [startPos, setStartPos] = useState({ row: 10, col: 5 });
  const [endPos, setEndPos] = useState({ row: 10, col: 35 });
  const [algorithm, setAlgorithm] = useState<Algorithm>('dijkstra');
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'wall' | null>(null);
  const [speed, setSpeed] = useState(50);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0 });
  
  const runningRef = useRef(false);

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow: Cell[] = [];
      for (let col = 0; col < COLS; col++) {
        let type: CellType = 'empty';
        if (row === startPos.row && col === startPos.col) type = 'start';
        if (row === endPos.row && col === endPos.col) type = 'end';
        
        currentRow.push({
          row,
          col,
          type,
          distance: Infinity,
          heuristic: 0,
          totalCost: Infinity,
          previous: null,
          isVisited: false
        });
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
    setStats({ visited: 0, pathLength: 0 });
  }, [startPos, endPos]);

  useEffect(() => {
    initializeGrid();
  }, []);

  // Clear path but keep walls
  const clearPath = () => {
    setGrid(prev => prev.map(row => row.map(cell => ({
      ...cell,
      type: cell.type === 'wall' ? 'wall' : 
            cell.row === startPos.row && cell.col === startPos.col ? 'start' :
            cell.row === endPos.row && cell.col === endPos.col ? 'end' : 'empty',
      distance: Infinity,
      heuristic: 0,
      totalCost: Infinity,
      previous: null,
      isVisited: false
    }))));
    setStats({ visited: 0, pathLength: 0 });
  };

  // Clear everything
  const clearAll = () => {
    initializeGrid();
  };

  // Generate maze using recursive backtracking
  const generateMaze = async () => {
    if (isRunning) return;
    
    // First, fill with walls
    const newGrid: Cell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow: Cell[] = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push({
          row,
          col,
          type: 'wall',
          distance: Infinity,
          heuristic: 0,
          totalCost: Infinity,
          previous: null,
          isVisited: false
        });
      }
      newGrid.push(currentRow);
    }
    
    // Recursive backtracking to carve paths
    const stack: [number, number][] = [];
    const startR = 1;
    const startC = 1;
    newGrid[startR][startC].type = 'empty';
    stack.push([startR, startC]);
    
    const directions = [
      [-2, 0], [2, 0], [0, -2], [0, 2]
    ];
    
    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];
      
      // Shuffle directions
      const shuffled = [...directions].sort(() => Math.random() - 0.5);
      let found = false;
      
      for (const [dr, dc] of shuffled) {
        const newR = r + dr;
        const newC = c + dc;
        
        if (newR > 0 && newR < ROWS - 1 && newC > 0 && newC < COLS - 1 &&
            newGrid[newR][newC].type === 'wall') {
          newGrid[newR][newC].type = 'empty';
          newGrid[r + dr/2][c + dc/2].type = 'empty';
          stack.push([newR, newC]);
          found = true;
          break;
        }
      }
      
      if (!found) stack.pop();
    }
    
    // Set start and end
    newGrid[startPos.row][startPos.col].type = 'start';
    newGrid[endPos.row][endPos.col].type = 'end';
    
    // Clear path around start and end
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const sr = startPos.row + dr;
        const sc = startPos.col + dc;
        const er = endPos.row + dr;
        const ec = endPos.col + dc;
        
        if (sr >= 0 && sr < ROWS && sc >= 0 && sc < COLS && 
            newGrid[sr][sc].type === 'wall') {
          newGrid[sr][sc].type = 'empty';
        }
        if (er >= 0 && er < ROWS && ec >= 0 && ec < COLS && 
            newGrid[er][ec].type === 'wall') {
          newGrid[er][ec].type = 'empty';
        }
      }
    }
    
    setGrid(newGrid);
  };

  // Handle cell interaction
  const handleCellMouseDown = (row: number, col: number) => {
    if (isRunning) return;
    
    const cell = grid[row][col];
    if (cell.type === 'start') {
      setIsDragging('start');
    } else if (cell.type === 'end') {
      setIsDragging('end');
    } else {
      setIsDragging('wall');
      toggleWall(row, col);
    }
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging || isRunning) return;
    
    if (isDragging === 'wall') {
      toggleWall(row, col);
    } else if (isDragging === 'start') {
      if (grid[row][col].type !== 'end' && grid[row][col].type !== 'wall') {
        setStartPos({ row, col });
        setGrid(prev => prev.map(r => r.map(c => ({
          ...c,
          type: c.row === row && c.col === col ? 'start' : 
                c.type === 'start' ? 'empty' : c.type
        }))));
      }
    } else if (isDragging === 'end') {
      if (grid[row][col].type !== 'start' && grid[row][col].type !== 'wall') {
        setEndPos({ row, col });
        setGrid(prev => prev.map(r => r.map(c => ({
          ...c,
          type: c.row === row && c.col === col ? 'end' : 
                c.type === 'end' ? 'empty' : c.type
        }))));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const toggleWall = (row: number, col: number) => {
    if (grid[row][col].type === 'start' || grid[row][col].type === 'end') return;
    
    setGrid(prev => prev.map(r => r.map(c => 
      c.row === row && c.col === col 
        ? { ...c, type: c.type === 'wall' ? 'empty' : 'wall' as CellType }
        : c
    )));
  };

  // Sleep function
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Get neighbors
  const getNeighbors = (cell: Cell, gridCopy: Cell[][]) => {
    const neighbors: Cell[] = [];
    const { row, col } = cell;
    
    if (row > 0) neighbors.push(gridCopy[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(gridCopy[row + 1][col]);
    if (col > 0) neighbors.push(gridCopy[row][col - 1]);
    if (col < COLS - 1) neighbors.push(gridCopy[row][col + 1]);
    
    return neighbors.filter(n => n.type !== 'wall' && !n.isVisited);
  };

  // Manhattan distance heuristic
  const heuristic = (a: Cell, b: Cell) => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  };

  // Dijkstra's Algorithm
  const dijkstra = async () => {
    const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));
    const startCell = gridCopy[startPos.row][startPos.col];
    const endCell = gridCopy[endPos.row][endPos.col];
    
    startCell.distance = 0;
    const unvisited: Cell[] = gridCopy.flat();
    let visitedCount = 0;
    
    while (unvisited.length > 0) {
      if (!runningRef.current) return;
      
      unvisited.sort((a, b) => a.distance - b.distance);
      const current = unvisited.shift()!;
      
      if (current.distance === Infinity) break;
      if (current.type === 'wall') continue;
      
      current.isVisited = true;
      visitedCount++;
      
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visited';
        setGrid([...gridCopy]);
        setStats(s => ({ ...s, visited: visitedCount }));
        await sleep(101 - speed);
      }
      
      if (current === endCell) {
        await tracePath(gridCopy, endCell);
        return;
      }
      
      for (const neighbor of getNeighbors(current, gridCopy)) {
        const newDist = current.distance + 1;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.previous = current;
        }
      }
    }
  };

  // A* Algorithm
  const astar = async () => {
    const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));
    const startCell = gridCopy[startPos.row][startPos.col];
    const endCell = gridCopy[endPos.row][endPos.col];
    
    startCell.distance = 0;
    startCell.heuristic = heuristic(startCell, endCell);
    startCell.totalCost = startCell.heuristic;
    
    const openSet: Cell[] = [startCell];
    let visitedCount = 0;
    
    while (openSet.length > 0) {
      if (!runningRef.current) return;
      
      openSet.sort((a, b) => a.totalCost - b.totalCost);
      const current = openSet.shift()!;
      
      if (current.isVisited) continue;
      current.isVisited = true;
      visitedCount++;
      
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visited';
        setGrid([...gridCopy]);
        setStats(s => ({ ...s, visited: visitedCount }));
        await sleep(101 - speed);
      }
      
      if (current === endCell) {
        await tracePath(gridCopy, endCell);
        return;
      }
      
      for (const neighbor of getNeighbors(current, gridCopy)) {
        const newDist = current.distance + 1;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.heuristic = heuristic(neighbor, endCell);
          neighbor.totalCost = neighbor.distance + neighbor.heuristic;
          neighbor.previous = current;
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  };

  // BFS
  const bfs = async () => {
    const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));
    const startCell = gridCopy[startPos.row][startPos.col];
    const endCell = gridCopy[endPos.row][endPos.col];
    
    const queue: Cell[] = [startCell];
    startCell.isVisited = true;
    let visitedCount = 0;
    
    while (queue.length > 0) {
      if (!runningRef.current) return;
      
      const current = queue.shift()!;
      visitedCount++;
      
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visited';
        setGrid([...gridCopy]);
        setStats(s => ({ ...s, visited: visitedCount }));
        await sleep(101 - speed);
      }
      
      if (current === endCell) {
        await tracePath(gridCopy, endCell);
        return;
      }
      
      for (const neighbor of getNeighbors(current, gridCopy)) {
        neighbor.isVisited = true;
        neighbor.previous = current;
        queue.push(neighbor);
      }
    }
  };

  // DFS
  const dfs = async () => {
    const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));
    const startCell = gridCopy[startPos.row][startPos.col];
    const endCell = gridCopy[endPos.row][endPos.col];
    
    const stack: Cell[] = [startCell];
    let visitedCount = 0;
    
    while (stack.length > 0) {
      if (!runningRef.current) return;
      
      const current = stack.pop()!;
      
      if (current.isVisited) continue;
      current.isVisited = true;
      visitedCount++;
      
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visited';
        setGrid([...gridCopy]);
        setStats(s => ({ ...s, visited: visitedCount }));
        await sleep(101 - speed);
      }
      
      if (current === endCell) {
        await tracePath(gridCopy, endCell);
        return;
      }
      
      for (const neighbor of getNeighbors(current, gridCopy)) {
        neighbor.previous = current;
        stack.push(neighbor);
      }
    }
  };

  // Trace path back
  const tracePath = async (gridCopy: Cell[][], endCell: Cell) => {
    let current: Cell | null = endCell;
    const path: Cell[] = [];
    
    while (current !== null) {
      path.unshift(current);
      current = current.previous;
    }
    
    setStats(s => ({ ...s, pathLength: path.length }));
    
    for (const cell of path) {
      if (!runningRef.current) return;
      if (cell.type !== 'start' && cell.type !== 'end') {
        cell.type = 'path';
        setGrid([...gridCopy]);
        await sleep(30);
      }
    }
  };

  // Run algorithm
  const runAlgorithm = async () => {
    if (isRunning) return;
    
    clearPath();
    await sleep(50);
    
    runningRef.current = true;
    setIsRunning(true);
    
    switch (algorithm) {
      case 'dijkstra':
        await dijkstra();
        break;
      case 'astar':
        await astar();
        break;
      case 'bfs':
        await bfs();
        break;
      case 'dfs':
        await dfs();
        break;
    }
    
    runningRef.current = false;
    setIsRunning(false);
  };

  const stopAlgorithm = () => {
    runningRef.current = false;
    setIsRunning(false);
  };

  const getCellClass = (type: CellType) => {
    switch (type) {
      case 'wall': return 'cell-wall';
      case 'start': return 'cell-start';
      case 'end': return 'cell-end';
      case 'visited': return 'cell-visited';
      case 'path': return 'cell-path';
      default: return '';
    }
  };

  const algorithmInfo: Record<Algorithm, { name: string; description: string; optimal: boolean }> = {
    dijkstra: {
      name: "Dijkstra's Algorithm",
      description: "Guarantees shortest path. Explores in order of distance from start.",
      optimal: true
    },
    astar: {
      name: "A* Search",
      description: "Uses heuristics to find path faster. Guarantees shortest path with admissible heuristic.",
      optimal: true
    },
    bfs: {
      name: "Breadth-First Search",
      description: "Explores all neighbors before going deeper. Guarantees shortest path in unweighted graphs.",
      optimal: true
    },
    dfs: {
      name: "Depth-First Search",
      description: "Explores as far as possible before backtracking. Does NOT guarantee shortest path.",
      optimal: false
    }
  };

  return (
    <div className="pathfinding-visualizer" onMouseUp={handleMouseUp}>
      <div className="page-header">
        <h1>🗺️ Pathfinding Algorithms</h1>
        <p>Visualize how different algorithms find paths through a maze</p>
      </div>

      {/* Controls */}
      <div className="pathfinding-controls">
        <div className="control-group">
          <label>Algorithm</label>
          <select 
            value={algorithm} 
            onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            disabled={isRunning}
          >
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* Search</option>
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
          </select>
        </div>

        <div className="control-group">
          <label>Speed: {speed}%</label>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        <div className="control-buttons">
          <button 
            className="btn btn-secondary"
            onClick={generateMaze}
            disabled={isRunning}
          >
            🏗️ Generate Maze
          </button>
          <button 
            className="btn btn-secondary"
            onClick={clearPath}
            disabled={isRunning}
          >
            🧹 Clear Path
          </button>
          <button 
            className="btn btn-secondary"
            onClick={clearAll}
            disabled={isRunning}
          >
            🗑️ Clear All
          </button>
          
          {!isRunning ? (
            <button className="btn btn-primary" onClick={runAlgorithm}>
              ▶️ Find Path
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopAlgorithm}>
              ⏹️ Stop
            </button>
          )}
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="algorithm-info">
        <h3>{algorithmInfo[algorithm].name}</h3>
        <p>{algorithmInfo[algorithm].description}</p>
        <span className={`optimal-badge ${algorithmInfo[algorithm].optimal ? 'yes' : 'no'}`}>
          {algorithmInfo[algorithm].optimal ? '✓ Guarantees Shortest Path' : '✗ May Not Find Shortest Path'}
        </span>
      </div>

      {/* Stats */}
      <div className="pathfinding-stats">
        <div className="stat">
          <span className="stat-label">Cells Visited</span>
          <span className="stat-value">{stats.visited}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Path Length</span>
          <span className="stat-value">{stats.pathLength || '-'}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="pathfinding-grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid-row">
            {row.map((cell, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`grid-cell ${getCellClass(cell.type)}`}
                onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
              >
                {cell.type === 'start' && '🚀'}
                {cell.type === 'end' && '🎯'}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="pathfinding-legend">
        <div className="legend-item">
          <span className="legend-cell">🚀</span>
          <span>Start (drag to move)</span>
        </div>
        <div className="legend-item">
          <span className="legend-cell">🎯</span>
          <span>End (drag to move)</span>
        </div>
        <div className="legend-item">
          <span className="legend-cell cell-wall"></span>
          <span>Wall (click to draw)</span>
        </div>
        <div className="legend-item">
          <span className="legend-cell cell-visited"></span>
          <span>Visited</span>
        </div>
        <div className="legend-item">
          <span className="legend-cell cell-path"></span>
          <span>Path</span>
        </div>
      </div>
    </div>
  );
}
