import { TreeNode, AnimationFrame } from '../types';

let nodeIdCounter = 0;

// Create a new tree node
export function createNode(value: number): TreeNode {
  return {
    id: `node-${nodeIdCounter++}`,
    value,
    left: null,
    right: null,
    height: 1,
  };
}

// Reset the node ID counter
export function resetNodeCounter(): void {
  nodeIdCounter = 0;
}

// Get height of a node
export function getHeight(node: TreeNode | null): number {
  return node ? node.height : 0;
}

// Get balance factor
export function getBalanceFactor(node: TreeNode | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

// Update height of a node
export function updateHeight(node: TreeNode): void {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

// Right rotation (LL case)
export function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateHeight(y);
  updateHeight(x);

  return x;
}

// Left rotation (RR case)
export function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateHeight(x);
  updateHeight(y);

  return y;
}

// BST Insert
export function bstInsert(root: TreeNode | null, value: number): TreeNode {
  if (root === null) {
    return createNode(value);
  }

  if (value < root.value) {
    root.left = bstInsert(root.left, value);
  } else if (value > root.value) {
    root.right = bstInsert(root.right, value);
  } else {
    // Duplicate values not allowed
    return root;
  }

  updateHeight(root);
  return root;
}

// AVL Insert with rotation tracking
export interface AVLInsertResult {
  root: TreeNode;
  rotations: Array<{ type: 'LL' | 'RR' | 'LR' | 'RL'; nodeValue: number }>;
}

export function avlInsert(
  root: TreeNode | null,
  value: number,
  rotations: Array<{ type: 'LL' | 'RR' | 'LR' | 'RL'; nodeValue: number }> = []
): AVLInsertResult {
  if (root === null) {
    return { root: createNode(value), rotations };
  }

  if (value < root.value) {
    const result = avlInsert(root.left, value, rotations);
    root.left = result.root;
    rotations = result.rotations;
  } else if (value > root.value) {
    const result = avlInsert(root.right, value, rotations);
    root.right = result.root;
    rotations = result.rotations;
  } else {
    return { root, rotations };
  }

  updateHeight(root);

  const balance = getBalanceFactor(root);

  // Left Left Case (LL)
  if (balance > 1 && value < root.left!.value) {
    rotations.push({ type: 'LL', nodeValue: root.value });
    return { root: rotateRight(root), rotations };
  }

  // Right Right Case (RR)
  if (balance < -1 && value > root.right!.value) {
    rotations.push({ type: 'RR', nodeValue: root.value });
    return { root: rotateLeft(root), rotations };
  }

  // Left Right Case (LR)
  if (balance > 1 && value > root.left!.value) {
    rotations.push({ type: 'LR', nodeValue: root.value });
    root.left = rotateLeft(root.left!);
    return { root: rotateRight(root), rotations };
  }

  // Right Left Case (RL)
  if (balance < -1 && value < root.right!.value) {
    rotations.push({ type: 'RL', nodeValue: root.value });
    root.right = rotateRight(root.right!);
    return { root: rotateLeft(root), rotations };
  }

  return { root, rotations };
}

// BST Search
export function bstSearch(root: TreeNode | null, value: number): TreeNode | null {
  if (root === null || root.value === value) {
    return root;
  }

  if (value < root.value) {
    return bstSearch(root.left, value);
  }

  return bstSearch(root.right, value);
}

// BST Delete
export function bstDelete(root: TreeNode | null, value: number): TreeNode | null {
  if (root === null) {
    return null;
  }

  if (value < root.value) {
    root.left = bstDelete(root.left, value);
  } else if (value > root.value) {
    root.right = bstDelete(root.right, value);
  } else {
    // Node to delete found
    if (root.left === null) {
      return root.right;
    } else if (root.right === null) {
      return root.left;
    }

    // Node with two children: get inorder successor
    let minNode = root.right;
    while (minNode.left !== null) {
      minNode = minNode.left;
    }
    root.value = minNode.value;
    root.right = bstDelete(root.right, minNode.value);
  }

  updateHeight(root);
  return root;
}

// Check if valid BST
export function isValidBST(
  root: TreeNode | null,
  min: number = -Infinity,
  max: number = Infinity
): { valid: boolean; message: string } {
  if (root === null) {
    return { valid: true, message: 'Empty tree is a valid BST' };
  }

  if (root.value <= min || root.value >= max) {
    return {
      valid: false,
      message: `Node ${root.value} violates BST property (should be between ${min} and ${max})`,
    };
  }

  const leftCheck = isValidBST(root.left, min, root.value);
  if (!leftCheck.valid) return leftCheck;

  return isValidBST(root.right, root.value, max);
}

// Check if valid AVL
export function isValidAVL(root: TreeNode | null): {
  valid: boolean;
  message: string;
  violatingNode?: number;
} {
  if (root === null) {
    return { valid: true, message: 'Empty tree is a valid AVL tree' };
  }

  const balance = getBalanceFactor(root);
  if (balance < -1 || balance > 1) {
    return {
      valid: false,
      message: `Node ${root.value} has balance factor ${balance} (must be -1, 0, or 1)`,
      violatingNode: root.value,
    };
  }

  const leftCheck = isValidAVL(root.left);
  if (!leftCheck.valid) return leftCheck;

  return isValidAVL(root.right);
}

// Traversals with animation frames
export function preorderTraversal(root: TreeNode | null): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const visited: string[] = [];
  const result: number[] = [];

  function traverse(node: TreeNode | null) {
    if (node === null) return;

    // Visit current node
    frames.push({
      highlightedNodes: [node.id],
      highlightedEdges: [],
      visitingNode: node.id,
      visitedNodes: [...visited],
      message: `Visiting node ${node.value} (Preorder: Root → Left → Right)`,
      result: [...result],
    });

    visited.push(node.id);
    result.push(node.value);

    frames.push({
      highlightedNodes: [],
      highlightedEdges: [],
      visitedNodes: [...visited],
      message: `Added ${node.value} to result`,
      result: [...result],
    });

    traverse(node.left);
    traverse(node.right);
  }

  traverse(root);
  
  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: visited,
    message: `Preorder traversal complete: [${result.join(', ')}]`,
    result,
  });

  return frames;
}

export function inorderTraversal(root: TreeNode | null): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const visited: string[] = [];
  const result: number[] = [];

  function traverse(node: TreeNode | null) {
    if (node === null) return;

    traverse(node.left);

    // Visit current node
    frames.push({
      highlightedNodes: [node.id],
      highlightedEdges: [],
      visitingNode: node.id,
      visitedNodes: [...visited],
      message: `Visiting node ${node.value} (Inorder: Left → Root → Right)`,
      result: [...result],
    });

    visited.push(node.id);
    result.push(node.value);

    frames.push({
      highlightedNodes: [],
      highlightedEdges: [],
      visitedNodes: [...visited],
      message: `Added ${node.value} to result`,
      result: [...result],
    });

    traverse(node.right);
  }

  traverse(root);
  
  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: visited,
    message: `Inorder traversal complete: [${result.join(', ')}]`,
    result,
  });

  return frames;
}

export function postorderTraversal(root: TreeNode | null): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const visited: string[] = [];
  const result: number[] = [];

  function traverse(node: TreeNode | null) {
    if (node === null) return;

    traverse(node.left);
    traverse(node.right);

    // Visit current node
    frames.push({
      highlightedNodes: [node.id],
      highlightedEdges: [],
      visitingNode: node.id,
      visitedNodes: [...visited],
      message: `Visiting node ${node.value} (Postorder: Left → Right → Root)`,
      result: [...result],
    });

    visited.push(node.id);
    result.push(node.value);

    frames.push({
      highlightedNodes: [],
      highlightedEdges: [],
      visitedNodes: [...visited],
      message: `Added ${node.value} to result`,
      result: [...result],
    });
  }

  traverse(root);
  
  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: visited,
    message: `Postorder traversal complete: [${result.join(', ')}]`,
    result,
  });

  return frames;
}

export function levelOrderTraversal(root: TreeNode | null): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const visited: string[] = [];
  const result: number[] = [];

  if (root === null) {
    frames.push({
      highlightedNodes: [],
      highlightedEdges: [],
      visitedNodes: [],
      message: 'Empty tree',
      result: [],
      queue: [],
    });
    return frames;
  }

  const queue: TreeNode[] = [root];
  const queueValues: number[] = [root.value];

  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: [],
    message: `Starting level-order traversal. Queue: [${root.value}]`,
    result: [],
    queue: [...queueValues],
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    queueValues.shift();

    frames.push({
      highlightedNodes: [node.id],
      highlightedEdges: [],
      visitingNode: node.id,
      visitedNodes: [...visited],
      message: `Dequeued and visiting node ${node.value}`,
      result: [...result],
      queue: [...queueValues],
    });

    visited.push(node.id);
    result.push(node.value);

    if (node.left) {
      queue.push(node.left);
      queueValues.push(node.left.value);
    }
    if (node.right) {
      queue.push(node.right);
      queueValues.push(node.right.value);
    }

    frames.push({
      highlightedNodes: [],
      highlightedEdges: [],
      visitedNodes: [...visited],
      message: `Added ${node.value} to result. Queue: [${queueValues.join(', ')}]`,
      result: [...result],
      queue: [...queueValues],
    });
  }

  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: visited,
    message: `Level-order traversal complete: [${result.join(', ')}]`,
    result,
    queue: [],
  });

  return frames;
}

// Calculate positions for tree visualization
export function calculateTreePositions(
  root: TreeNode | null,
  width: number,
  height: number
): void {
  if (!root) return;

  const levels: TreeNode[][] = [];
  const queue: Array<{ node: TreeNode; level: number }> = [{ node: root, level: 0 }];

  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    
    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push(node);

    if (node.left) {
      queue.push({ node: node.left, level: level + 1 });
    }
    if (node.right) {
      queue.push({ node: node.right, level: level + 1 });
    }
  }

  const verticalSpacing = Math.min(80, (height - 100) / levels.length);
  
  // Position nodes using a recursive approach for better spacing
  function positionNode(
    node: TreeNode | null,
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

  positionNode(root, 0, 50, width - 50);
}

// Get all nodes as flat array
export function getAllNodes(root: TreeNode | null): TreeNode[] {
  if (!root) return [];
  return [root, ...getAllNodes(root.left), ...getAllNodes(root.right)];
}

// Get all edges
export function getAllEdges(root: TreeNode | null): Array<{ from: TreeNode; to: TreeNode }> {
  if (!root) return [];
  
  const edges: Array<{ from: TreeNode; to: TreeNode }> = [];
  
  if (root.left) {
    edges.push({ from: root, to: root.left });
    edges.push(...getAllEdges(root.left));
  }
  if (root.right) {
    edges.push({ from: root, to: root.right });
    edges.push(...getAllEdges(root.right));
  }
  
  return edges;
}
