// Tree Node for Binary Tree, BST, and AVL
export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  height: number;
  x?: number;
  y?: number;
}

// Graph structures
export interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

// Huffman Tree
export interface HuffmanNode {
  id: string;
  weight: number;
  symbol: string | null;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  x?: number;
  y?: number;
}

// Animation frame for visualizations
export interface AnimationFrame {
  highlightedNodes: string[];
  highlightedEdges: string[];
  visitingNode?: string;
  visitedNodes: string[];
  message: string;
  stack?: number[];
  queue?: number[];
  result?: number[];
  rotationType?: 'LL' | 'RR' | 'LR' | 'RL';
  matrix?: number[][];
  k?: number;
}

// Tree type selection
export type TreeType = 'binary' | 'bst' | 'avl';

// Traversal type
export type TraversalType = 'preorder' | 'inorder' | 'postorder' | 'levelorder';

// Algorithm type for graphs
export type GraphAlgorithm = 'dfs' | 'bfs';

// Huffman symbol input
export interface HuffmanSymbol {
  symbol: string;
  frequency: number;
}

// Floyd result
export interface FloydResult {
  distances: number[][];
  predecessors: (number | null)[][];
  steps: FloydStep[];
}

export interface FloydStep {
  k: number;
  i: number;
  j: number;
  oldValue: number;
  newValue: number;
  updated: boolean;
  matrix: number[][];
}

// ============================================
// CODE LAB TYPES
// ============================================

export type ExerciseMode = 'HIGH_LEVEL' | 'LOW_LEVEL' | 'HYBRID' | 'HASKELL';
export type ExerciseLanguage = 'java' | 'haskell';
export type ExerciseTopic = 'trees' | 'graphs' | 'floyd' | 'huffman' | 'lists' | 'stacks' | 'queues' | 'heaps';
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  mode: ExerciseMode;
  language: ExerciseLanguage;
  topic: ExerciseTopic;
  difficulty: ExerciseDifficulty;
  starterCode: string;
  solution?: string;
  solutionTemplate?: string;
  allowedPatterns: string[];
  forbiddenPatterns: string[];
  requiredSignature?: string;
  hints: string[];
  testCases: TestCase[];
}

export interface TestCase {
  name: string;
  input: string;
  expected: string;
  description?: string;
}

export interface CodeCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  patternsUsed: string[];
}

// GNDE Graph Representation (like the course)
export interface GNDEGraph {
  nodos: GNDENode[];
  adyacencias: boolean[][];
  pesos?: number[][];
}

export interface GNDENode {
  info: string | number;
}

// ============================================
// CODE EXPLANATION TYPES
// ============================================

export interface CodeLine {
  code: string;
  comment: string;
}

export interface CodeExplanation {
  id: string;
  title: string;
  topic: ExerciseTopic;
  language: ExerciseLanguage;
  mode: ExerciseMode;
  description: string;
  conceptOverview: string;
  codeWithComments: CodeLine[];
  keyPoints: string[];
  relatedExercises: string[];
}
