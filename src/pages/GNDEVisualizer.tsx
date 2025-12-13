import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================
interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface PositionedTreeNode {
  value: number;
  x: number;
  y: number;
  left: PositionedTreeNode | null;
  right: PositionedTreeNode | null;
}

interface GNDEStep {
  description: string;
  nodos: (number | null)[];
  adjacencyMatrix: boolean[][];
  highlightedNodes: number[];       // Indices in nodos array that are newly added
  highlightedCells: [number, number][]; // [row, col] pairs that are newly set to true
  currentLine: number;              // Line number in algorithm (0-indexed)
  treeHighlight?: number;           // Value being processed from tree
  visitedTreeNodes?: number[];      // Values that have been processed (grayed out)
  currentTreeNode?: number;         // Current node being accessed (highlighted)
  numNodos?: number;                // Current value of numNodos counter
}

type AlgorithmType = 'mixheaps' | 'searchPath' | 'spine' | 'heapArray';

// ============================================================================
// TREE VISUALIZATION COMPONENT
// ============================================================================
function calculateTreePositions(node: TreeNode | null, x: number, y: number, horizontalSpacing: number): PositionedTreeNode | null {
  if (!node) return null;
  return {
    value: node.value,
    x,
    y,
    left: calculateTreePositions(node.left, x - horizontalSpacing, y + 60, horizontalSpacing / 2),
    right: calculateTreePositions(node.right, x + horizontalSpacing, y + 60, horizontalSpacing / 2)
  };
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode?: number;
  visitedNodes: number[];
  title: string;
}

function TreeVisualization({ tree, currentNode, visitedNodes, title }: TreeVisualizationProps) {
  if (!tree) return null;

  const width = 320;
  const height = 220;
  const positionedTree = calculateTreePositions(tree, width / 2, 30, 70);

  const renderEdges = (node: PositionedTreeNode | null): JSX.Element[] => {
    if (!node) return [];
    const edges: JSX.Element[] = [];
    
    if (node.left) {
      edges.push(
        <line
          key={`edge-${node.value}-${node.left.value}`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke="var(--border)"
          strokeWidth="2"
        />
      );
      edges.push(...renderEdges(node.left));
    }
    if (node.right) {
      edges.push(
        <line
          key={`edge-${node.value}-${node.right.value}`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke="var(--border)"
          strokeWidth="2"
        />
      );
      edges.push(...renderEdges(node.right));
    }
    return edges;
  };

  const renderNodes = (node: PositionedTreeNode | null): JSX.Element[] => {
    if (!node) return [];
    const nodes: JSX.Element[] = [];
    
    const isCurrent = currentNode === node.value;
    const isVisited = visitedNodes.includes(node.value);
    
    let fillColor = 'var(--bg-card)';
    let strokeColor = 'var(--border)';
    let textColor = 'var(--text-primary)';
    
    if (isCurrent) {
      fillColor = 'var(--secondary)';
      strokeColor = 'var(--secondary)';
      textColor = 'white';
    } else if (isVisited) {
      fillColor = 'var(--bg-hover)';
      strokeColor = 'var(--text-secondary)';
      textColor = 'var(--text-secondary)';
    }

    nodes.push(
      <g key={`node-${node.value}`}>
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isCurrent ? "3" : "2"}
          className={isCurrent ? 'tree-node-current' : ''}
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fill={textColor}
          fontSize="12"
          fontWeight="bold"
        >
          {node.value}
        </text>
      </g>
    );
    
    nodes.push(...renderNodes(node.left));
    nodes.push(...renderNodes(node.right));
    return nodes;
  };

  return (
    <div className="gnde-tree-viz">
      <h4>{title}</h4>
      <svg width={width} height={height} className="tree-svg">
        {positionedTree && renderEdges(positionedTree)}
        {positionedTree && renderNodes(positionedTree)}
      </svg>
      <div className="tree-legend">
        <span className="legend-item"><span className="dot current"></span> Current</span>
        <span className="legend-item"><span className="dot visited"></span> Visited</span>
        <span className="legend-item"><span className="dot pending"></span> Pending</span>
      </div>
    </div>
  );
}

// ============================================================================
// TREE UTILITIES
// ============================================================================
function buildSampleTree(type: AlgorithmType): TreeNode {
  // Different sample trees for different algorithms
  if (type === 'mixheaps') {
    // Max-heap style tree
    return {
      value: 50,
      left: { value: 30, left: { value: 10, left: null, right: null }, right: { value: 20, left: null, right: null } },
      right: { value: 40, left: { value: 15, left: null, right: null }, right: null }
    };
  } else if (type === 'searchPath') {
    // BST for search
    return {
      value: 50,
      left: { value: 30, left: { value: 20, left: null, right: null }, right: { value: 40, left: null, right: null } },
      right: { value: 70, left: { value: 60, left: null, right: null }, right: { value: 80, left: null, right: null } }
    };
  } else if (type === 'spine') {
    // Tree with left and right spines
    return {
      value: 50,
      left: { value: 30, left: { value: 20, left: { value: 10, left: null, right: null }, right: null }, right: null },
      right: { value: 70, left: null, right: { value: 80, left: null, right: { value: 90, left: null, right: null } } }
    };
  }
  return { value: 50, left: null, right: null };
}

// Simulated mixheaps: merges two heaps by taking larger root
function mixheaps(t1: TreeNode | null, t2: TreeNode | null): TreeNode | null {
  if (!t1) return t2;
  if (!t2) return t1;
  if (t1.value > t2.value) {
    return { value: t1.value, left: mixheaps(t1.left, t1.right), right: t2 };
  } else {
    return { value: t2.value, left: t1, right: mixheaps(t2.left, t2.right) };
  }
}

// ============================================================================
// ALGORITHM STEP GENERATORS
// ============================================================================
const MAX_NODES = 10;

function generateMixheapsSteps(tree: TreeNode): GNDEStep[] {
  const steps: GNDEStep[] = [];
  const nodos: (number | null)[] = new Array(MAX_NODES).fill(null);
  const adj: boolean[][] = Array.from({ length: MAX_NODES }, () => new Array(MAX_NODES).fill(false));
  let numNodos = 0;
  let t: TreeNode | null = tree;
  const visited: number[] = [];

  // Initial state
  steps.push({
    description: 'Initialize empty graph',
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 0,
    treeHighlight: undefined,
    visitedTreeNodes: [],
    currentTreeNode: undefined,
    numNodos: 0
  });

  // First node (root)
  if (t) {
    nodos[0] = t.value;
    visited.push(t.value);
    numNodos = 1;
    
    steps.push({
      description: `Add root ${t.value} to Nodos[0], numNodos++`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [0],
      highlightedCells: [],
      currentLine: 3,
      treeHighlight: t.value,
      visitedTreeNodes: [...visited],
      currentTreeNode: t.value,
      numNodos: numNodos
    });

    t = mixheaps(t.left, t.right);

    steps.push({
      description: `mixheaps(left, right) → new tree root: ${t?.value ?? 'null'}`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [],
      highlightedCells: [],
      currentLine: 4,
      treeHighlight: t?.value,
      numNodos: numNodos
    });
  }

  // While loop - extract remaining nodes
  while (t && numNodos < MAX_NODES) {
    nodos[numNodos] = t.value;
    
    steps.push({
      description: `Add ${t.value} to Nodos[${numNodos}]`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [numNodos],
      highlightedCells: [],
      currentLine: 7,
      treeHighlight: t.value,
      numNodos: numNodos
    });

    const merged = mixheaps(t.left, t.right);
    
    // Set adjacency (connect to node 0)
    adj[0][numNodos] = true;
    adj[numNodos][0] = true;

    steps.push({
      description: `Set Adyacencias[0][${numNodos}] = Adyacencias[${numNodos}][0] = true`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [],
      highlightedCells: [[0, numNodos], [numNodos, 0]],
      currentLine: 9,
      treeHighlight: t.value,
      numNodos: numNodos
    });

    numNodos++;
    
    steps.push({
      description: `numNodos++ → ${numNodos}`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [],
      highlightedCells: [],
      currentLine: 10,
      treeHighlight: t.value,
      numNodos: numNodos
    });
    
    t = merged;
  }

  // Final state
  steps.push({
    description: `Done! Graph has ${numNodos} nodes in star topology`,
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 11,
    treeHighlight: undefined,
    numNodos: numNodos
  });

  return steps;
}

function generateSearchPathSteps(tree: TreeNode, searchValue: number): GNDEStep[] {
  const steps: GNDEStep[] = [];
  const nodos: (number | null)[] = new Array(MAX_NODES).fill(null);
  const adj: boolean[][] = Array.from({ length: MAX_NODES }, () => new Array(MAX_NODES).fill(false));
  let numNodos = 0;
  let t: TreeNode | null = tree;
  const visitedTreeNodes: number[] = [];

  steps.push({
    description: `Initialize graph, searching for ${searchValue}`,
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 0,
    treeHighlight: undefined,
    visitedTreeNodes: [],
    numNodos: 0
  });

  while (t && numNodos < MAX_NODES) {
    const y = t.value;
    nodos[numNodos] = y;
    visitedTreeNodes.push(y);

    steps.push({
      description: `Visit node ${y}, add to Nodos[${numNodos}]`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [numNodos],
      highlightedCells: [],
      currentLine: 5,
      treeHighlight: y,
      visitedTreeNodes: [...visitedTreeNodes],
      numNodos: numNodos
    });

    if (numNodos > 0) {
      adj[numNodos - 1][numNodos] = true;
      adj[numNodos][numNodos - 1] = true;

      steps.push({
        description: `Connect Nodos[${numNodos - 1}] ↔ Nodos[${numNodos}]`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [],
        highlightedCells: [[numNodos - 1, numNodos], [numNodos, numNodos - 1]],
        currentLine: 7,
        treeHighlight: y,
        visitedTreeNodes: [...visitedTreeNodes],
        numNodos: numNodos
      });
    }

    numNodos++;

    if (searchValue === y) {
      steps.push({
        description: `Found ${searchValue}! Search complete.`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [numNodos - 1],
        highlightedCells: [],
        currentLine: 8,
        treeHighlight: y,
        visitedTreeNodes: [...visitedTreeNodes],
        numNodos: numNodos
      });
      return steps;
    }

    if (y > searchValue) {
      steps.push({
        description: `${searchValue} < ${y}, go LEFT`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [],
        highlightedCells: [],
        currentLine: 9,
        treeHighlight: y,
        visitedTreeNodes: [...visitedTreeNodes],
        numNodos: numNodos
      });
      t = t.left;
    } else {
      steps.push({
        description: `${searchValue} > ${y}, go RIGHT`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [],
        highlightedCells: [],
        currentLine: 10,
        treeHighlight: y,
        visitedTreeNodes: [...visitedTreeNodes],
        numNodos: numNodos
      });
      t = t.right;
    }
  }

  // Not found - reset
  steps.push({
    description: `${searchValue} not found, numnodos = 0`,
    nodos: new Array(MAX_NODES).fill(null),
    adjacencyMatrix: Array.from({ length: MAX_NODES }, () => new Array(MAX_NODES).fill(false)),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 12,
    treeHighlight: undefined,
    numNodos: 0,
    visitedTreeNodes: [...visitedTreeNodes]
  });

  return steps;
}

function generateSpineSteps(tree: TreeNode): GNDEStep[] {
  const steps: GNDEStep[] = [];
  const nodos: (number | null)[] = new Array(MAX_NODES).fill(null);
  const adj: boolean[][] = Array.from({ length: MAX_NODES }, () => new Array(MAX_NODES).fill(false));
  let numNodos = 0;
  const visitedTreeNodes: number[] = [];

  steps.push({
    description: 'Initialize empty graph',
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 0,
    treeHighlight: undefined,
    visitedTreeNodes: [],
    numNodos: 0
  });

  // Root
  nodos[0] = tree.value;
  numNodos = 1;
  visitedTreeNodes.push(tree.value);

  steps.push({
    description: `Add root ${tree.value} to Nodos[0], numNodos = 1`,
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [0],
    highlightedCells: [],
    currentLine: 4,
    treeHighlight: tree.value,
    visitedTreeNodes: [...visitedTreeNodes],
    numNodos: numNodos
  });

  // Left spine
  let aux: TreeNode | null = tree.left;
  while (aux && numNodos < MAX_NODES) {
    nodos[numNodos] = aux.value;
    visitedTreeNodes.push(aux.value);

    steps.push({
      description: `LEFT SPINE: Add ${aux.value} to Nodos[${numNodos}]`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [numNodos],
      highlightedCells: [],
      currentLine: 8,
      treeHighlight: aux.value,
      visitedTreeNodes: [...visitedTreeNodes],
      numNodos: numNodos
    });

    adj[numNodos][numNodos - 1] = true;
    adj[numNodos - 1][numNodos] = true;

    steps.push({
      description: `Connect Nodos[${numNodos - 1}] ↔ Nodos[${numNodos}]`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [],
      highlightedCells: [[numNodos, numNodos - 1], [numNodos - 1, numNodos]],
      currentLine: 9,
      treeHighlight: aux.value,
      visitedTreeNodes: [...visitedTreeNodes],
      numNodos: numNodos
    });

    numNodos++;
    
    steps.push({
      description: `numNodos++ → ${numNodos}`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [],
      highlightedCells: [],
      currentLine: 10,
      treeHighlight: aux.value,
      visitedTreeNodes: [...visitedTreeNodes],
      numNodos: numNodos
    });
    
    aux = aux.left;
  }

  // Right spine (starts from root's right child)
  if (tree.right && numNodos < MAX_NODES) {
    const rightRoot = tree.right;
    nodos[numNodos] = rightRoot.value;
    visitedTreeNodes.push(rightRoot.value);

    steps.push({
      description: `RIGHT SPINE START: Add ${rightRoot.value} to Nodos[${numNodos}]`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [numNodos],
      highlightedCells: [],
      currentLine: 14,
      treeHighlight: rightRoot.value,
      visitedTreeNodes: [...visitedTreeNodes],
      numNodos: numNodos
    });

    // Connect to root (node 0)
    adj[numNodos][0] = true;
    adj[0][numNodos] = true;

    steps.push({
      description: `Connect to ROOT: Nodos[0] ↔ Nodos[${numNodos}]`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [],
      highlightedCells: [[numNodos, 0], [0, numNodos]],
      currentLine: 15,
      treeHighlight: rightRoot.value,
      visitedTreeNodes: [...visitedTreeNodes],
      numNodos: numNodos
    });

    numNodos++;
    
    steps.push({
      description: `numNodos++ → ${numNodos}`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [],
      highlightedCells: [],
      currentLine: 16,
      treeHighlight: rightRoot.value,
      visitedTreeNodes: [...visitedTreeNodes],
      numNodos: numNodos
    });

    // Continue down right spine
    aux = rightRoot.right;
    while (aux && numNodos < MAX_NODES) {
      nodos[numNodos] = aux.value;
      visitedTreeNodes.push(aux.value);

      steps.push({
        description: `RIGHT SPINE: Add ${aux.value} to Nodos[${numNodos}]`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [numNodos],
        highlightedCells: [],
        currentLine: 19,
        treeHighlight: aux.value,
        visitedTreeNodes: [...visitedTreeNodes],
        numNodos: numNodos
      });

      adj[numNodos][numNodos - 1] = true;
      adj[numNodos - 1][numNodos] = true;

      steps.push({
        description: `Connect Nodos[${numNodos - 1}] ↔ Nodos[${numNodos}]`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [],
        highlightedCells: [[numNodos, numNodos - 1], [numNodos - 1, numNodos]],
        currentLine: 20,
        treeHighlight: aux.value,
        visitedTreeNodes: [...visitedTreeNodes],
        numNodos: numNodos
      });

      numNodos++;
      
      steps.push({
        description: `numNodos++ → ${numNodos}`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [],
        highlightedCells: [],
        currentLine: 21,
        treeHighlight: aux.value,
        visitedTreeNodes: [...visitedTreeNodes],
        numNodos: numNodos
      });
      
      aux = aux.right;
    }
  }

  steps.push({
    description: `Done! Graph has ${numNodos} nodes (left spine + right spine)`,
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 24,
    treeHighlight: undefined,
    visitedTreeNodes: [...visitedTreeNodes],
    numNodos: numNodos
  });

  return steps;
}

function generateHeapArraySteps(n: number): GNDEStep[] {
  const steps: GNDEStep[] = [];
  const nodos: (number | null)[] = new Array(MAX_NODES).fill(null);
  const adj: boolean[][] = Array.from({ length: MAX_NODES }, () => new Array(MAX_NODES).fill(false));
  const visitedTreeNodes: number[] = [];

  steps.push({
    description: `Initialize graph for n=${n} nodes (heap array indices)`,
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 0,
    treeHighlight: undefined,
    visitedTreeNodes: []
  });

  // Create all nodes
  for (let i = 0; i < n && i < MAX_NODES; i++) {
    nodos[i] = i;
    visitedTreeNodes.push(i);
    steps.push({
      description: `Create Nodos[${i}] with value ${i}`,
      nodos: [...nodos],
      adjacencyMatrix: adj.map(row => [...row]),
      highlightedNodes: [i],
      highlightedCells: [],
      currentLine: 4,
      treeHighlight: i,
      visitedTreeNodes: [...visitedTreeNodes]
    });
  }

  // Create edges based on heap parent-child relationships
  for (let i = 0; i < n && i < MAX_NODES; i++) {
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;

    if (leftChild < n && leftChild < MAX_NODES) {
      adj[i][leftChild] = true;
      adj[leftChild][i] = true;

      steps.push({
        description: `Connect parent ${i} ↔ left child ${leftChild} (2*${i}+1)`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [],
        highlightedCells: [[i, leftChild], [leftChild, i]],
        currentLine: 7,
        treeHighlight: i,
        visitedTreeNodes: [...visitedTreeNodes]
      });
    }

    if (rightChild < n && rightChild < MAX_NODES) {
      adj[i][rightChild] = true;
      adj[rightChild][i] = true;

      steps.push({
        description: `Connect parent ${i} ↔ right child ${rightChild} (2*${i}+2)`,
        nodos: [...nodos],
        adjacencyMatrix: adj.map(row => [...row]),
        highlightedNodes: [],
        highlightedCells: [[i, rightChild], [rightChild, i]],
        currentLine: 9,
        treeHighlight: i,
        visitedTreeNodes: [...visitedTreeNodes]
      });
    }
  }

  steps.push({
    description: `Done! Complete binary tree structure with ${n} nodes`,
    nodos: [...nodos],
    adjacencyMatrix: adj.map(row => [...row]),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: 11,
    treeHighlight: undefined,
    visitedTreeNodes: [...visitedTreeNodes]
  });

  return steps;
}

// ============================================================================
// ALGORITHM CODE SNIPPETS (for display)
// ============================================================================
const algorithmCode: Record<AlgorithmType, string[]> = {
  mixheaps: [
    'numnodos=0; Adyacencias = new boolean[MAX][MAX];',
    'Nodos = new NodoGrafo[MAX];',
    'if (!t.EsVacio()) {',
    '  Nodos[0] = new NodoGrafo(t.Raiz(), false);',
    '  t = mixheaps(t.SubArbolIzqdo(), t.SubArbolDcho());',
    '  numnodos++;',
    '}',
    'while (!t.EsVacio()) {',
    '  Nodos[numnodos] = new NodoGrafo(t.Raiz(), false);',
    '  t = mixheaps(t.SubArbolIzqdo(), t.SubArbolDcho());',
    '  Adyacencias[0][numnodos] = Adyacencias[numnodos][0] = true;',
    '  numnodos++;',
    '}'
  ],
  searchPath: [
    'Adyacencias = new boolean[MAX][MAX];',
    'Nodos = new NodoGrafo[MAX]; numnodos = 0;',
    'while (!t.EsVacio()) {',
    '  y = t.Raiz();',
    '  Nodos[numnodos] = new NodoGrafo(y, false);',
    '  numnodos++;',
    '  Adyacencias[numnodos-1][numnodos] = true; // bidirectional',
    '  Adyacencias[numnodos][numnodos-1] = true;',
    '  if (x == y) return; // FOUND!',
    '  if (y > x) t = t.SubArbolIzqdo();',
    '  else t = t.SubArbolDcho();',
    '}',
    'if (t.EsVacio()) numnodos = 0; // NOT FOUND'
  ],
  spine: [
    'Adyacencias = new boolean[MAX][MAX];',
    'Nodos = new NodoGrafo[MAX]; numnodos = 0;',
    'if (!t.EsVacio()) {',
    '  // Add root',
    '  Nodos[0] = new NodoGrafo(t.Raiz(), false); numnodos++;',
    '  // LEFT SPINE',
    '  aux = t.SubArbolIzqdo();',
    '  while (!aux.EsVacio()) {',
    '    Nodos[numnodos] = new NodoGrafo(aux.Raiz(), false);',
    '    Adyacencias[numnodos][numnodos-1] = true; // connect',
    '    numnodos++; aux = aux.SubArbolIzqdo();',
    '  }',
    '  // RIGHT SPINE',
    '  if (!t.SubArbolDcho().EsVacio()) {',
    '    Nodos[numnodos] = new NodoGrafo(t.SubArbolDcho().Raiz());',
    '    Adyacencias[numnodos][0] = true; // connect to root',
    '    numnodos++;',
    '    aux = t.SubArbolDcho().SubArbolDcho();',
    '    while (!aux.EsVacio()) {',
    '      Nodos[numnodos] = new NodoGrafo(aux.Raiz());',
    '      Adyacencias[numnodos][numnodos-1] = true;',
    '      numnodos++; aux = aux.SubArbolDcho();',
    '    }',
    '  }',
    '}'
  ],
  heapArray: [
    'Adyacencias = new boolean[MAX][MAX];',
    'Nodos = new NodoGrafo[MAX]; numnodos = n;',
    '// Create all nodes',
    'for (i = 0; i < n; i++) {',
    '  Nodos[i] = new NodoGrafo(i, false);',
    '}',
    '// Connect using heap array indices',
    'for (i = 0; ; i++) {',
    '  if (i*2+1 < n) Adyacencias[i][i*2+1] = true; // left child',
    '  else break;',
    '  if (i*2+2 < n) Adyacencias[i][i*2+2] = true; // right child',
    '  else break;',
    '}'
  ]
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function GNDEVisualizer() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('mixheaps');
  const [steps, setSteps] = useState<GNDEStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per step
  const [searchValue, setSearchValue] = useState(60);
  const [heapSize, setHeapSize] = useState(7);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Generate steps when algorithm changes
  const generateSteps = useCallback(() => {
    let newSteps: GNDEStep[] = [];
    
    if (algorithm === 'heapArray') {
      // Build a tree representation for heapArray visualization
      const buildHeapTree = (index: number, n: number): TreeNode | null => {
        if (index >= n) return null;
        return {
          value: index,
          left: buildHeapTree(2 * index + 1, n),
          right: buildHeapTree(2 * index + 2, n)
        };
      };
      setTree(buildHeapTree(0, heapSize));
      newSteps = generateHeapArraySteps(heapSize);
    } else {
      const newTree = buildSampleTree(algorithm);
      setTree(newTree);
      
      switch (algorithm) {
        case 'mixheaps':
          newSteps = generateMixheapsSteps(newTree);
          break;
        case 'searchPath':
          newSteps = generateSearchPathSteps(newTree, searchValue);
          break;
        case 'spine':
          newSteps = generateSpineSteps(newTree);
          break;
      }
    }

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm, searchValue, heapSize]);

  useEffect(() => {
    generateSteps();
  }, [generateSteps]);

  // Playback control
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, steps.length, currentStep]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const step = steps[currentStep] || {
    nodos: new Array(MAX_NODES).fill(null),
    adjacencyMatrix: Array.from({ length: MAX_NODES }, () => new Array(MAX_NODES).fill(false)),
    highlightedNodes: [],
    highlightedCells: [],
    currentLine: -1,
    description: ''
  };

  // Determine matrix size to display (only show used portion)
  const usedNodes = step.nodos.filter(n => n !== null).length || 1;
  const displaySize = Math.max(usedNodes + 1, 4);

  return (
    <div className="gnde-visualizer">
      <div className="page-header">
        <h1>🏗️ Graph Construction Visualizer</h1>
        <p>Watch GNDE constructors build graphs step-by-step from binary trees</p>
      </div>

      {/* Algorithm Selection */}
      <div className="gnde-algorithm-selector">
        <button
          className={`algo-btn ${algorithm === 'mixheaps' ? 'active' : ''}`}
          onClick={() => setAlgorithm('mixheaps')}
        >
          <span className="algo-icon">🔀</span>
          <span className="algo-name">Mixheaps</span>
          <span className="algo-desc">Star graph from heap</span>
        </button>
        <button
          className={`algo-btn ${algorithm === 'searchPath' ? 'active' : ''}`}
          onClick={() => setAlgorithm('searchPath')}
        >
          <span className="algo-icon">🔍</span>
          <span className="algo-name">Search Path</span>
          <span className="algo-desc">BST search trail</span>
        </button>
        <button
          className={`algo-btn ${algorithm === 'spine' ? 'active' : ''}`}
          onClick={() => setAlgorithm('spine')}
        >
          <span className="algo-icon">🦴</span>
          <span className="algo-name">Spine Traversal</span>
          <span className="algo-desc">Left + Right chains</span>
        </button>
        <button
          className={`algo-btn ${algorithm === 'heapArray' ? 'active' : ''}`}
          onClick={() => setAlgorithm('heapArray')}
        >
          <span className="algo-icon">📊</span>
          <span className="algo-name">Heap Array</span>
          <span className="algo-desc">Index relationships</span>
        </button>
      </div>

      {/* Algorithm-specific controls */}
      {algorithm === 'searchPath' && (
        <div className="gnde-params">
          <label>
            Search for value:
            <input
              type="number"
              value={searchValue}
              onChange={(e) => setSearchValue(parseInt(e.target.value) || 0)}
              min={0}
              max={100}
            />
          </label>
          <button className="btn btn-primary" onClick={generateSteps}>
            🔄 Regenerate
          </button>
        </div>
      )}
      {algorithm === 'heapArray' && (
        <div className="gnde-params">
          <label>
            Number of nodes (n):
            <input
              type="number"
              value={heapSize}
              onChange={(e) => setHeapSize(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              min={1}
              max={10}
            />
          </label>
          <button className="btn btn-primary" onClick={generateSteps}>
            🔄 Regenerate
          </button>
        </div>
      )}

      {/* Main Visualization Area */}
      <div className="gnde-main">
        {/* Left: Code with current line highlighted */}
        <div className="gnde-code-panel">
          <h3>📝 Algorithm</h3>
          <div className="gnde-code">
            {algorithmCode[algorithm].map((line, idx) => (
              <div
                key={idx}
                className={`code-line ${step.currentLine === idx ? 'active' : ''}`}
              >
                <span className="line-num">{idx + 1}</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visualizations */}
        <div className="gnde-viz-panel">
          {/* Source Tree/Heap Visualization */}
          {tree && (
            <TreeVisualization
              tree={tree}
              currentNode={step.treeHighlight}
              visitedNodes={step.visitedTreeNodes || []}
              title={algorithm === 'mixheaps' ? '🏔️ MinHeap (Source)' : 
                     algorithm === 'heapArray' ? '🏔️ Heap Array (Source)' :
                     algorithm === 'spine' ? '🌲 Binary Tree (Source)' : '🌳 BST (Source)'}
            />
          )}

          {/* Nodos Array */}
          <div className="gnde-nodos">
            <h3>📦 Nodos[] Array</h3>
            <div className="nodos-array">
              {step.nodos.slice(0, displaySize).map((val, idx) => (
                <div
                  key={idx}
                  className={`nodos-cell ${val !== null ? 'filled' : ''} ${step.highlightedNodes.includes(idx) ? 'highlight' : ''}`}
                >
                  <span className="nodos-index">[{idx}]</span>
                  <span className="nodos-value">{val !== null ? val : '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Adjacency Matrix */}
          <div className="gnde-matrix">
            <h3>📊 Adjacency Matrix</h3>
            <div className="matrix-container">
              <table className="adjacency-table">
                <thead>
                  <tr>
                    <th></th>
                    {Array.from({ length: displaySize }, (_, i) => (
                      <th key={i}>{i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {step.adjacencyMatrix.slice(0, displaySize).map((row, i) => (
                    <tr key={i}>
                      <th>{i}</th>
                      {row.slice(0, displaySize).map((cell, j) => {
                        const isHighlighted = step.highlightedCells.some(
                          ([r, c]) => r === i && c === j
                        );
                        return (
                          <td
                            key={j}
                            className={`matrix-cell ${cell ? 'true' : ''} ${isHighlighted ? 'highlight' : ''}`}
                          >
                            {cell ? '1' : '0'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step Description */}
          <div className="gnde-description">
            <div className="step-info">
              <span className="step-counter">Step {currentStep + 1} / {steps.length}</span>
              {step.numNodos !== undefined && (
                <span className="numnodos-counter">numNodos = {step.numNodos}</span>
              )}
              {step.treeHighlight !== undefined && (
                <span className="tree-highlight">Processing: {step.treeHighlight}</span>
              )}
            </div>
            <p className="step-desc">{step.description}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="gnde-controls">
        <div className="control-buttons">
          <button className="ctrl-btn" onClick={handleReset} title="Reset">
            ⏮️
          </button>
          <button className="ctrl-btn" onClick={handlePrev} disabled={currentStep === 0} title="Previous">
            ◀️
          </button>
          {isPlaying ? (
            <button className="ctrl-btn play" onClick={handlePause} title="Pause">
              ⏸️
            </button>
          ) : (
            <button className="ctrl-btn play" onClick={handlePlay} disabled={currentStep >= steps.length - 1} title="Play">
              ▶️
            </button>
          )}
          <button className="ctrl-btn" onClick={handleNext} disabled={currentStep >= steps.length - 1} title="Next">
            ▶️
          </button>
        </div>
        <div className="speed-control">
          <label>Speed:</label>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={2200 - speed}
            onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
          />
          <span>{(speed / 1000).toFixed(1)}s</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
