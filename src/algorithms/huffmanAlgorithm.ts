import { HuffmanNode, HuffmanSymbol } from '../types';

let huffmanNodeId = 0;

// Create a Huffman leaf node
function createHuffmanLeaf(symbol: string, weight: number): HuffmanNode {
  return {
    id: `huffman-${huffmanNodeId++}`,
    weight,
    symbol,
    left: null,
    right: null,
  };
}

// Create an internal Huffman node
function createHuffmanInternal(left: HuffmanNode, right: HuffmanNode): HuffmanNode {
  return {
    id: `huffman-${huffmanNodeId++}`,
    weight: left.weight + right.weight,
    symbol: null,
    left,
    right,
  };
}

// Reset Huffman node counter
export function resetHuffmanCounter(): void {
  huffmanNodeId = 0;
}

// Animation step for Huffman building
export interface HuffmanStep {
  forest: HuffmanNode[];
  merged?: { left: HuffmanNode; right: HuffmanNode; result: HuffmanNode };
  message: string;
}

// Build Huffman tree with steps
export function buildHuffmanTree(symbols: HuffmanSymbol[]): {
  tree: HuffmanNode | null;
  steps: HuffmanStep[];
} {
  resetHuffmanCounter();
  
  if (symbols.length === 0) {
    return { tree: null, steps: [] };
  }
  
  const steps: HuffmanStep[] = [];
  
  // Create initial forest (sorted by weight)
  let forest: HuffmanNode[] = symbols
    .map(s => createHuffmanLeaf(s.symbol, s.frequency))
    .sort((a, b) => a.weight - b.weight);
  
  steps.push({
    forest: [...forest],
    message: `Initial forest: ${forest.map(n => `${n.symbol}(${n.weight})`).join(', ')}`,
  });
  
  // Build tree by repeatedly merging two smallest
  while (forest.length > 1) {
    // Sort forest by weight
    forest.sort((a, b) => a.weight - b.weight);
    
    // Take two smallest
    const left = forest.shift()!;
    const right = forest.shift()!;
    
    // Merge
    const merged = createHuffmanInternal(left, right);
    forest.push(merged);
    
    const leftLabel = left.symbol || `[${left.weight}]`;
    const rightLabel = right.symbol || `[${right.weight}]`;
    
    steps.push({
      forest: [...forest],
      merged: { left, right, result: merged },
      message: `Merged ${leftLabel}(${left.weight}) + ${rightLabel}(${right.weight}) = [${merged.weight}]`,
    });
  }
  
  return { tree: forest[0], steps };
}

// Generate Huffman codes
export function generateHuffmanCodes(
  tree: HuffmanNode | null
): Map<string, string> {
  const codes = new Map<string, string>();
  
  function traverse(node: HuffmanNode | null, code: string): void {
    if (!node) return;
    
    if (node.symbol !== null) {
      codes.set(node.symbol, code || '0'); // Handle single-node tree
      return;
    }
    
    traverse(node.left, code + '0');
    traverse(node.right, code + '1');
  }
  
  traverse(tree, '');
  return codes;
}

// Calculate average code length
export function calculateAverageLength(
  symbols: HuffmanSymbol[],
  codes: Map<string, string>
): number {
  const totalFreq = symbols.reduce((sum, s) => sum + s.frequency, 0);
  let weightedSum = 0;
  
  symbols.forEach(s => {
    const code = codes.get(s.symbol);
    if (code) {
      weightedSum += (s.frequency / totalFreq) * code.length;
    }
  });
  
  return weightedSum;
}

// Calculate positions for Huffman tree visualization
export function calculateHuffmanPositions(
  tree: HuffmanNode | null,
  width: number,
  height: number
): void {
  if (!tree) return;
  
  // Get tree depth
  function getDepth(node: HuffmanNode | null): number {
    if (!node) return 0;
    return 1 + Math.max(getDepth(node.left), getDepth(node.right));
  }
  
  const depth = getDepth(tree);
  const verticalSpacing = Math.min(70, (height - 100) / depth);
  
  function positionNode(
    node: HuffmanNode | null,
    level: number,
    left: number,
    right: number
  ): void {
    if (!node) return;
    
    const x = (left + right) / 2;
    const y = 50 + level * verticalSpacing;
    
    node.x = x;
    node.y = y;
    
    const mid = (left + right) / 2;
    positionNode(node.left, level + 1, left, mid);
    positionNode(node.right, level + 1, mid, right);
  }
  
  positionNode(tree, 0, 50, width - 50);
}

// Get all Huffman nodes as flat array
export function getAllHuffmanNodes(tree: HuffmanNode | null): HuffmanNode[] {
  if (!tree) return [];
  return [tree, ...getAllHuffmanNodes(tree.left), ...getAllHuffmanNodes(tree.right)];
}

// Get all Huffman edges
export function getAllHuffmanEdges(
  tree: HuffmanNode | null
): Array<{ from: HuffmanNode; to: HuffmanNode; label: string }> {
  if (!tree) return [];
  
  const edges: Array<{ from: HuffmanNode; to: HuffmanNode; label: string }> = [];
  
  if (tree.left) {
    edges.push({ from: tree, to: tree.left, label: '0' });
    edges.push(...getAllHuffmanEdges(tree.left));
  }
  if (tree.right) {
    edges.push({ from: tree, to: tree.right, label: '1' });
    edges.push(...getAllHuffmanEdges(tree.right));
  }
  
  return edges;
}

// Sample symbols for demonstration
export function getSampleSymbols(): HuffmanSymbol[] {
  return [
    { symbol: 'a', frequency: 45 },
    { symbol: 'b', frequency: 13 },
    { symbol: 'c', frequency: 12 },
    { symbol: 'd', frequency: 16 },
    { symbol: 'e', frequency: 9 },
    { symbol: 'f', frequency: 5 },
  ];
}
