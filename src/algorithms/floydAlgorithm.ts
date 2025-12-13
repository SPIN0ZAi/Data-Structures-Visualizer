import { FloydResult, FloydStep } from '../types';

const INF = Infinity;

// Floyd-Warshall Algorithm
export function floydWarshall(matrix: number[][]): FloydResult {
  const n = matrix.length;
  
  // Create distance matrix (copy of input)
  const dist: number[][] = matrix.map(row => [...row]);
  
  // Create predecessor matrix
  const pred: (number | null)[][] = Array.from({ length: n }, () => 
    Array(n).fill(null)
  );
  
  // Initialize predecessors
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && dist[i][j] !== INF) {
        pred[i][j] = i;
      }
    }
  }
  
  const steps: FloydStep[] = [];
  
  // Initial state
  steps.push({
    k: -1,
    i: -1,
    j: -1,
    oldValue: 0,
    newValue: 0,
    updated: false,
    matrix: dist.map(row => [...row]),
  });
  
  // Floyd-Warshall main loop
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== INF && dist[k][j] !== INF) {
          const newDist = dist[i][k] + dist[k][j];
          
          if (newDist < dist[i][j]) {
            const oldValue = dist[i][j];
            dist[i][j] = newDist;
            pred[i][j] = pred[k][j];
            
            steps.push({
              k,
              i,
              j,
              oldValue,
              newValue: newDist,
              updated: true,
              matrix: dist.map(row => [...row]),
            });
          }
        }
      }
    }
    
    // Add step for end of k iteration
    steps.push({
      k,
      i: -1,
      j: -1,
      oldValue: 0,
      newValue: 0,
      updated: false,
      matrix: dist.map(row => [...row]),
    });
  }
  
  return {
    distances: dist,
    predecessors: pred,
    steps,
  };
}

// Reconstruct path from i to j
export function reconstructPath(
  pred: (number | null)[][],
  i: number,
  j: number
): number[] {
  if (pred[i][j] === null) {
    return [];
  }
  
  const path: number[] = [];
  let current: number | null = j;
  
  while (current !== null && current !== i) {
    path.unshift(current);
    current = pred[i][current];
  }
  
  if (current === i) {
    path.unshift(i);
    return path;
  }
  
  return [];
}

// Find minimum cycle through node k
export function findMinCycle(dist: number[][]): {
  cycle: number[];
  weight: number;
} | null {
  const n = dist.length;
  let minWeight = INF;
  let minI = -1;
  let minJ = -1;
  
  // Find minimum i->j + j->i cycle
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (dist[i][j] !== INF && dist[j][i] !== INF) {
        const cycleWeight = dist[i][j] + dist[j][i];
        if (cycleWeight < minWeight) {
          minWeight = cycleWeight;
          minI = i;
          minJ = j;
        }
      }
    }
  }
  
  // Check for self-loops (negative cycles)
  for (let i = 0; i < n; i++) {
    if (dist[i][i] < 0 && dist[i][i] < minWeight) {
      return { cycle: [i], weight: dist[i][i] };
    }
  }
  
  if (minI === -1) {
    return null;
  }
  
  return {
    cycle: [minI, minJ, minI],
    weight: minWeight,
  };
}

// Create a sample adjacency matrix
export function createSampleMatrix(size: number): number[][] {
  const matrix: number[][] = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 0 : INF))
  );
  
  // Add some sample edges
  if (size >= 4) {
    matrix[0][1] = 3;
    matrix[0][2] = 8;
    matrix[1][2] = 2;
    matrix[1][3] = 5;
    matrix[2][3] = 1;
    matrix[3][0] = 2;
  }
  
  return matrix;
}

// Format matrix value for display
export function formatMatrixValue(value: number): string {
  if (value === INF) return '∞';
  if (value === -Infinity) return '-∞';
  return String(value);
}

// Parse matrix value from string
export function parseMatrixValue(str: string): number {
  const trimmed = str.trim();
  // Handle infinity symbol and variations
  if (trimmed === '∞' || trimmed === 'inf' || trimmed === 'INF' || 
      trimmed === 'Inf' || trimmed === '∞' || trimmed === '' ||
      trimmed.toLowerCase() === 'infinity') {
    return INF;
  }
  const num = parseFloat(trimmed);
  return isNaN(num) ? INF : num;
}
