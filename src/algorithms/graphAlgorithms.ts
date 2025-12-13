import { Graph, AnimationFrame } from '../types';

// DFS Algorithm with animation frames
export function dfs(graph: Graph, startId: string): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const visited = new Set<string>();
  const stack: string[] = [startId];
  const result: number[] = [];

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  graph.nodes.forEach(node => adjacencyList.set(node.id, []));
  graph.edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push(edge.to);
    if (!graph.directed) {
      adjacencyList.get(edge.to)?.push(edge.from);
    }
  });

  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: [],
    message: `Starting DFS from node ${getNodeLabel(graph, startId)}. Stack: [${startId}]`,
    stack: stack.map(id => parseInt(getNodeLabel(graph, id))),
    result: [],
  });

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    
    if (visited.has(currentId)) {
      frames.push({
        highlightedNodes: [],
        highlightedEdges: [],
        visitedNodes: Array.from(visited),
        message: `Node ${getNodeLabel(graph, currentId)} already visited, skipping`,
        stack: stack.map(id => parseInt(getNodeLabel(graph, id))),
        result: [...result],
      });
      continue;
    }

    visited.add(currentId);
    result.push(parseInt(getNodeLabel(graph, currentId)));

    frames.push({
      highlightedNodes: [currentId],
      highlightedEdges: [],
      visitingNode: currentId,
      visitedNodes: Array.from(visited),
      message: `Popped and visiting node ${getNodeLabel(graph, currentId)}`,
      stack: stack.map(id => parseInt(getNodeLabel(graph, id))),
      result: [...result],
    });

    const neighbors = adjacencyList.get(currentId) || [];
    // Reverse to maintain order (since stack is LIFO)
    const unvisitedNeighbors = neighbors.filter(n => !visited.has(n)).reverse();
    
    for (const neighbor of unvisitedNeighbors) {
      if (!stack.includes(neighbor)) {
        stack.push(neighbor);
      }
    }

    if (unvisitedNeighbors.length > 0) {
      frames.push({
        highlightedNodes: unvisitedNeighbors,
        highlightedEdges: unvisitedNeighbors.map(n => `${currentId}-${n}`),
        visitedNodes: Array.from(visited),
        message: `Pushed neighbors [${unvisitedNeighbors.map(n => getNodeLabel(graph, n)).join(', ')}] to stack`,
        stack: stack.map(id => parseInt(getNodeLabel(graph, id))),
        result: [...result],
      });
    }
  }

  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: Array.from(visited),
    message: `DFS complete. Traversal order: [${result.join(', ')}]`,
    stack: [],
    result,
  });

  return frames;
}

// BFS Algorithm with animation frames
export function bfs(graph: Graph, startId: string): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startId];
  const result: number[] = [];

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  graph.nodes.forEach(node => adjacencyList.set(node.id, []));
  graph.edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push(edge.to);
    if (!graph.directed) {
      adjacencyList.get(edge.to)?.push(edge.from);
    }
  });

  visited.add(startId);

  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: [],
    message: `Starting BFS from node ${getNodeLabel(graph, startId)}. Queue: [${startId}]`,
    queue: queue.map(id => parseInt(getNodeLabel(graph, id))),
    result: [],
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    result.push(parseInt(getNodeLabel(graph, currentId)));

    frames.push({
      highlightedNodes: [currentId],
      highlightedEdges: [],
      visitingNode: currentId,
      visitedNodes: Array.from(visited),
      message: `Dequeued and visiting node ${getNodeLabel(graph, currentId)}`,
      queue: queue.map(id => parseInt(getNodeLabel(graph, id))),
      result: [...result],
    });

    const neighbors = adjacencyList.get(currentId) || [];
    const unvisitedNeighbors = neighbors.filter(n => !visited.has(n));

    for (const neighbor of unvisitedNeighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    if (unvisitedNeighbors.length > 0) {
      frames.push({
        highlightedNodes: unvisitedNeighbors,
        highlightedEdges: unvisitedNeighbors.map(n => `${currentId}-${n}`),
        visitedNodes: Array.from(visited),
        message: `Enqueued neighbors [${unvisitedNeighbors.map(n => getNodeLabel(graph, n)).join(', ')}]`,
        queue: queue.map(id => parseInt(getNodeLabel(graph, id))),
        result: [...result],
      });
    }
  }

  frames.push({
    highlightedNodes: [],
    highlightedEdges: [],
    visitedNodes: Array.from(visited),
    message: `BFS complete. Traversal order: [${result.join(', ')}]`,
    queue: [],
    result,
  });

  return frames;
}

// Helper to get node label
function getNodeLabel(graph: Graph, nodeId: string): string {
  const node = graph.nodes.find(n => n.id === nodeId);
  return node?.label || nodeId;
}

// Calculate circular layout positions for graph
export function calculateGraphPositions(graph: Graph, width: number, height: number): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 60;

  graph.nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / graph.nodes.length - Math.PI / 2;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
}

// Create a sample graph
export function createSampleGraph(nodeCount: number, directed: boolean = true): Graph {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node-${i}`,
    label: String(i),
  }));

  const edges: Graph['edges'] = [];
  
  // Create some sample edges
  if (nodeCount >= 2) edges.push({ from: 'node-0', to: 'node-1', weight: 1 });
  if (nodeCount >= 3) edges.push({ from: 'node-0', to: 'node-2', weight: 1 });
  if (nodeCount >= 4) edges.push({ from: 'node-1', to: 'node-3', weight: 1 });
  if (nodeCount >= 5) edges.push({ from: 'node-2', to: 'node-4', weight: 1 });
  if (nodeCount >= 5) edges.push({ from: 'node-3', to: 'node-4', weight: 1 });
  if (nodeCount >= 6) edges.push({ from: 'node-4', to: 'node-5', weight: 1 });

  return { nodes, edges, directed };
}

// Parse adjacency matrix to graph
export function matrixToGraph(matrix: number[][], directed: boolean = true): Graph {
  const n = matrix.length;
  const nodes = Array.from({ length: n }, (_, i) => ({
    id: `node-${i}`,
    label: String(i),
  }));

  const edges: Graph['edges'] = [];
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] !== 0 && matrix[i][j] !== Infinity) {
        if (directed || i < j) {
          edges.push({
            from: `node-${i}`,
            to: `node-${j}`,
            weight: matrix[i][j],
          });
        }
      }
    }
  }

  return { nodes, edges, directed };
}
