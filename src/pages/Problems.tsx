import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Problem definitions
export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  solution: string;
  hints: string[];
  testCases: { input: string; expected: string }[];
  tags: string[];
}

// All problems
export const PROBLEMS: Problem[] = [
  // Tree Problems
  {
    id: 'tree-traversal-inorder',
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'easy',
    category: 'Trees',
    description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
    examples: [
      { input: 'root = [1,null,2,3]', output: '[1,3,2]', explanation: 'Left -> Root -> Right' },
    ],
    starterCode: `public static <E> Lista<E> inorderTraversal(ArbolBinarioE<E> a) {
    // Your code here
    
}`,
    solution: `public static <E> Lista<E> inorderTraversal(ArbolBinarioE<E> a) {
    Lista<E> result = new ListaEnlazada<>();
    inorderRec(a, result);
    return result;
}

private static <E> void inorderRec(ArbolBinarioE<E> a, Lista<E> result) {
    if (a.EsVacio()) return;
    inorderRec(a.SubArbolIzqdo(), result);
    result.Add(a.Raiz());
    inorderRec(a.SubArbolDcho(), result);
}`,
    hints: [
      'Think about the order: left subtree first, then current node, then right subtree',
      'Use recursion to traverse the tree',
      'Don\'t forget the base case for empty trees (EsVacio)',
    ],
    testCases: [
      { input: 'AB(1, AV, AB(2, AB(3, AV, AV), AV))', expected: '[1,3,2]' },
      { input: 'AV', expected: '[]' },
      { input: 'AB(1, AV, AV)', expected: '[1]' },
    ],
    tags: ['Tree', 'DFS', 'Recursion'],
  },
  {
    id: 'tree-max-depth',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'easy',
    category: 'Trees',
    description: 'Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
    ],
    starterCode: `public static <E> int maxDepth(ArbolBinarioE<E> a) {
    // Your code here
    
}`,
    solution: `public static <E> int maxDepth(ArbolBinarioE<E> a) {
    if (a.EsVacio()) return 0;
    return 1 + Math.max(maxDepth(a.SubArbolIzqdo()), maxDepth(a.SubArbolDcho()));
}`,
    hints: [
      'An empty tree has depth 0',
      'The depth of a tree is 1 + max of its subtrees\' depths',
      'Use recursion!',
    ],
    testCases: [
      { input: 'AB(3, AB(9, AV, AV), AB(20, AB(15, AV, AV), AB(7, AV, AV)))', expected: '3' },
      { input: 'AB(1, AV, AB(2, AV, AV))', expected: '2' },
      { input: 'AV', expected: '0' },
    ],
    tags: ['Tree', 'DFS', 'Recursion'],
  },
  {
    id: 'bst-validate',
    title: 'Validate Binary Search Tree',
    difficulty: 'medium',
    category: 'Trees',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has all left nodes less than the root and all right nodes greater than the root.',
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'The root\'s right child is 4 but contains 3 which is less than 5' },
    ],
    starterCode: `public static <E extends Comparable<E>> boolean isValidBST(ArbolBusquedaE<E> a) {
    // Your code here
    
}`,
    solution: `public static <E extends Comparable<E>> boolean isValidBST(ArbolBusquedaE<E> a) {
    return isValidBSTRec(a, null, null);
}

private static <E extends Comparable<E>> boolean isValidBSTRec(
        ArbolBusquedaE<E> a, E min, E max) {
    if (a.EsVacio()) return true;
    E val = a.Raiz();
    if (min != null && val.compareTo(min) <= 0) return false;
    if (max != null && val.compareTo(max) >= 0) return false;
    return isValidBSTRec(a.SubArbolIzqdo(), min, val) && 
           isValidBSTRec(a.SubArbolDcho(), val, max);
}`,
    hints: [
      'Each node has an allowed range of values',
      'The left child must be less than current, right child must be greater',
      'Pass down the valid range as you traverse',
    ],
    testCases: [
      { input: 'AB(2, AB(1, AV, AV), AB(3, AV, AV))', expected: 'true' },
      { input: 'AB(5, AB(1, AV, AV), AB(4, AB(3, AV, AV), AB(6, AV, AV)))', expected: 'false' },
    ],
    tags: ['Tree', 'BST', 'DFS'],
  },
  {
    id: 'tree-lca',
    title: 'Lowest Common Ancestor',
    difficulty: 'medium',
    category: 'Trees',
    description: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes. The LCA is the lowest node that has both p and q as descendants.',
    examples: [
      { input: 'root = [3,5,1,6,2,0,8], p = 5, q = 1', output: '3' },
      { input: 'root = [3,5,1,6,2,0,8], p = 5, q = 4', output: '5' },
    ],
    starterCode: `public static <E> E lowestCommonAncestor(ArbolBinarioE<E> a, E p, E q) {
    // Your code here
    
}`,
    solution: `public static <E> E lowestCommonAncestor(ArbolBinarioE<E> a, E p, E q) {
    if (a.EsVacio()) return null;
    E raiz = a.Raiz();
    if (raiz.equals(p) || raiz.equals(q)) return raiz;
    
    E left = lowestCommonAncestor(a.SubArbolIzqdo(), p, q);
    E right = lowestCommonAncestor(a.SubArbolDcho(), p, q);
    
    if (left != null && right != null) return raiz;
    return (left != null) ? left : right;
}`,
    hints: [
      'If the current node is p or q, return it',
      'Search both subtrees recursively',
      'If both subtrees return a node, current is the LCA',
    ],
    testCases: [
      { input: 'AB(3, AB(5, AB(6,AV,AV), AB(2,AV,AV)), AB(1, AB(0,AV,AV), AB(8,AV,AV))), 5, 1', expected: '3' },
    ],
    tags: ['Tree', 'DFS', 'Recursion'],
  },

  // Graph Problems
  {
    id: 'graph-dfs',
    title: 'Number of Islands',
    difficulty: 'medium',
    category: 'Graphs',
    description: 'Given a 2D grid map of \'1\'s (land) and \'0\'s (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.',
    examples: [
      { 
        input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', 
        output: '2',
        explanation: 'Two separate islands' 
      },
    ],
    starterCode: `public static int numIslands(char[][] grid) {
    // Your code here
    
}`,
    solution: `public static int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) return 0;
    
    int count = 0;
    int rows = grid.length;
    int cols = grid[0].length;
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                dfs(grid, r, c);
            }
        }
    }
    return count;
}

private static void dfs(char[][] grid, int r, int c) {
    int rows = grid.length;
    int cols = grid[0].length;
    
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] == '0') {
        return;
    }
    grid[r][c] = '0'; // Mark as visited
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}`,
    hints: [
      'Use DFS or BFS to explore each island',
      'Mark visited cells to avoid counting twice',
      'Check all 4 directions (up, down, left, right)',
    ],
    testCases: [
      { input: '{{"1","1","0"},{"1","1","0"},{"0","0","1"}}', expected: '2' },
      { input: '{{"1","0","1"},{"0","1","0"},{"1","0","1"}}', expected: '5' },
    ],
    tags: ['Graph', 'DFS', 'BFS', 'Matrix'],
  },
  {
    id: 'graph-cycle',
    title: 'Detect Cycle in Graph',
    difficulty: 'medium',
    category: 'Graphs',
    description: 'Given a directed graph, determine if it contains a cycle.',
    examples: [
      { input: 'n = 4, edges = [[0,1],[1,2],[2,3],[3,1]]', output: 'true', explanation: '1 -> 2 -> 3 -> 1 forms a cycle' },
    ],
    starterCode: `public static boolean hasCycle(GrafoDirigido<Integer> g) {
    // Your code here
    
}`,
    solution: `public static boolean hasCycle(GrafoDirigido<Integer> g) {
    Set<Integer> visited = new HashSet<>();
    Set<Integer> recStack = new HashSet<>();
    
    for (int node = 0; node < g.numNodos(); node++) {
        if (!visited.contains(node)) {
            if (dfs(g, node, visited, recStack)) {
                return true;
            }
        }
    }
    return false;
}

private static boolean dfs(GrafoDirigido<Integer> g, int node, 
        Set<Integer> visited, Set<Integer> recStack) {
    visited.add(node);
    recStack.add(node);
    
    for (int neighbor : g.adyacentes(node)) {
        if (!visited.contains(neighbor)) {
            if (dfs(g, neighbor, visited, recStack)) return true;
        } else if (recStack.contains(neighbor)) {
            return true;
        }
    }
    
    recStack.remove(node);
    return false;
}`,
    hints: [
      'Use DFS with a recursion stack',
      'If you visit a node that\'s already in the current path, there\'s a cycle',
      'Track both visited nodes and nodes in current recursion stack',
    ],
    testCases: [
      { input: 'Graph: 0->1->2->3->1', expected: 'true' },
      { input: 'Graph: 0->1->2', expected: 'false' },
    ],
    tags: ['Graph', 'DFS', 'Cycle Detection'],
  },
  {
    id: 'graph-shortest-path',
    title: 'Shortest Path in Graph (Dijkstra)',
    difficulty: 'medium',
    category: 'Graphs',
    description: 'Given a weighted graph, find the shortest path from source to destination using Dijkstra\'s algorithm.',
    examples: [
      { input: 'n = 4, edges = [[0,1,1],[1,2,2],[0,2,4],[2,3,1]], start = 0, end = 3', output: '4' },
    ],
    starterCode: `public static int shortestPath(GrafoPonderado<Integer> g, int start, int end) {
    // Your code here
    
}`,
    solution: `public static int shortestPath(GrafoPonderado<Integer> g, int start, int end) {
    int n = g.numNodos();
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.offer(new int[]{0, start}); // {distance, node}
    
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], node = curr[1];
        
        if (d > dist[node]) continue;
        
        for (int[] edge : g.aristasDesde(node)) {
            int neighbor = edge[0], weight = edge[1];
            int newDist = dist[node] + weight;
            if (newDist < dist[neighbor]) {
                dist[neighbor] = newDist;
                pq.offer(new int[]{newDist, neighbor});
            }
        }
    }
    
    return dist[end] == Integer.MAX_VALUE ? -1 : dist[end];
}`,
    hints: [
      'Build an adjacency list from edges',
      'Use Dijkstra\'s algorithm with a priority queue',
      'Track distances to all nodes, update when shorter path found',
    ],
    testCases: [
      { input: 'Graph with edges (0,1,1), (1,2,2), (0,2,4), (2,3,1), start=0, end=3', expected: '4' },
    ],
    tags: ['Graph', 'Dijkstra', 'Shortest Path'],
  },

  // Sorting Problems
  {
    id: 'sort-merge',
    title: 'Implement Merge Sort',
    difficulty: 'medium',
    category: 'Sorting',
    description: 'Implement the merge sort algorithm to sort an array of integers in ascending order.',
    examples: [
      { input: '[5,2,8,1,9]', output: '[1,2,5,8,9]' },
    ],
    starterCode: `public static void mergeSort(int[] arr) {
    // Your code here
    
}`,
    solution: `public static void mergeSort(int[] arr) {
    if (arr.length <= 1) return;
    mergeSortRec(arr, 0, arr.length - 1);
}

private static void mergeSortRec(int[] arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSortRec(arr, left, mid);
        mergeSortRec(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

private static void merge(int[] arr, int left, int mid, int right) {
    int[] temp = new int[right - left + 1];
    int i = left, j = mid + 1, k = 0;
    
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }
    
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    
    for (int m = 0; m < temp.length; m++) {
        arr[left + m] = temp[m];
    }
}`,
    hints: [
      'Divide the array into two halves',
      'Recursively sort each half',
      'Merge the sorted halves back together',
    ],
    testCases: [
      { input: '{5,2,8,1,9}', expected: '{1,2,5,8,9}' },
      { input: '{3,1,4,1,5,9,2,6}', expected: '{1,1,2,3,4,5,6,9}' },
    ],
    tags: ['Sorting', 'Divide and Conquer', 'Recursion'],
  },
  {
    id: 'sort-quick',
    title: 'Implement Quick Sort',
    difficulty: 'medium',
    category: 'Sorting',
    description: 'Implement the quick sort algorithm to sort an array of integers in ascending order.',
    examples: [
      { input: '[5,2,8,1,9]', output: '[1,2,5,8,9]' },
    ],
    starterCode: `public static void quickSort(int[] arr) {
    // Your code here
    
}`,
    solution: `public static void quickSort(int[] arr) {
    quickSortRec(arr, 0, arr.length - 1);
}

private static void quickSortRec(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSortRec(arr, low, pi - 1);
        quickSortRec(arr, pi + 1, high);
    }
}

private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}`,
    hints: [
      'Choose a pivot element',
      'Partition array so elements less than pivot go left',
      'Recursively sort the partitions',
    ],
    testCases: [
      { input: '{5,2,8,1,9}', expected: '{1,2,5,8,9}' },
      { input: '{3,1,4,1,5,9,2,6}', expected: '{1,1,2,3,4,5,6,9}' },
    ],
    tags: ['Sorting', 'Divide and Conquer', 'Recursion'],
  },

  // Hard Problems
  {
    id: 'tree-serialize',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'hard',
    category: 'Trees',
    description: 'Design an algorithm to serialize a binary tree to a string and deserialize the string back to the original tree structure.',
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' },
    ],
    starterCode: `public static String serialize(ArbolBinarioE<Integer> a) {
    // Your code here
}

public static ArbolBinarioE<Integer> deserialize(String data) {
    // Your code here
}`,
    solution: `public static String serialize(ArbolBinarioE<Integer> a) {
    if (a.EsVacio()) return "null";
    return a.Raiz() + "," + serialize(a.SubArbolIzqdo()) + "," + serialize(a.SubArbolDcho());
}

public static ArbolBinarioE<Integer> deserialize(String data) {
    String[] nodes = data.split(",");
    int[] index = {0};
    return buildTree(nodes, index);
}

private static ArbolBinarioE<Integer> buildTree(String[] nodes, int[] index) {
    if (index[0] >= nodes.length || nodes[index[0]].equals("null")) {
        index[0]++;
        return new ABDE<>(); // Empty tree
    }
    
    int val = Integer.parseInt(nodes[index[0]++]);
    ArbolBinarioE<Integer> left = buildTree(nodes, index);
    ArbolBinarioE<Integer> right = buildTree(nodes, index);
    
    return new ABDE<>(val, (ABDE<Integer>)left, (ABDE<Integer>)right);
}`,
    hints: [
      'Use preorder traversal for serialization',
      'Include null markers for missing nodes',
      'Use the same order for deserialization',
    ],
    testCases: [
      { input: 'AB(1, AB(2, AV, AV), AB(3, AB(4, AV, AV), AB(5, AV, AV)))', expected: '1,2,null,null,3,4,null,null,5,null,null' },
    ],
    tags: ['Tree', 'DFS', 'Design'],
  },
  {
    id: 'graph-topological',
    title: 'Course Schedule (Topological Sort)',
    difficulty: 'hard',
    category: 'Graphs',
    description: 'Given numCourses and prerequisites, determine if you can finish all courses. Return the order to take courses, or empty array if impossible.',
    examples: [
      { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,1,2,3] or [0,2,1,3]' },
    ],
    starterCode: `public static int[] findOrder(int numCourses, int[][] prerequisites) {
    // Your code here
    
}`,
    solution: `public static int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    int[] inDegree = new int[numCourses];
    
    for (int i = 0; i < numCourses; i++) {
        graph.add(new ArrayList<>());
    }
    
    for (int[] prereq : prerequisites) {
        graph.get(prereq[1]).add(prereq[0]);
        inDegree[prereq[0]]++;
    }
    
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) queue.offer(i);
    }
    
    int[] order = new int[numCourses];
    int index = 0;
    
    while (!queue.isEmpty()) {
        int course = queue.poll();
        order[index++] = course;
        
        for (int next : graph.get(course)) {
            inDegree[next]--;
            if (inDegree[next] == 0) {
                queue.offer(next);
            }
        }
    }
    
    return index == numCourses ? order : new int[0];
}`,
    hints: [
      'This is a topological sort problem',
      'Use Kahn\'s algorithm with in-degree tracking',
      'If you can\'t process all courses, there\'s a cycle',
    ],
    testCases: [
      { input: '4, {{1,0},{2,0},{3,1},{3,2}}', expected: '{0,1,2,3}' },
      { input: '2, {{1,0},{0,1}}', expected: '{}' },
    ],
    tags: ['Graph', 'Topological Sort', 'BFS'],
  },
];

const Problems: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const solvedIds = new Set(user.solvedProblems.map(p => p.id));

  // Get unique categories
  const categories = ['all', ...new Set(PROBLEMS.map(p => p.category))];

  // Filter problems
  const filteredProblems = PROBLEMS.filter(problem => {
    const matchesDifficulty = filter === 'all' || problem.difficulty === filter;
    const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'solved' && solvedIds.has(problem.id)) ||
      (statusFilter === 'unsolved' && !solvedIds.has(problem.id));
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesDifficulty && matchesCategory && matchesStatus && matchesSearch;
  });

  // Stats
  const totalSolved = user.solvedProblems.length;
  const easySolved = user.solvedProblems.filter(p => p.difficulty === 'easy').length;
  const mediumSolved = user.solvedProblems.filter(p => p.difficulty === 'medium').length;
  const hardSolved = user.solvedProblems.filter(p => p.difficulty === 'hard').length;

  return (
    <div className="problems-page">
      {/* Stats Header */}
      <div className="problems-header">
        <div className="problems-stats">
          <div className="stat-circle total">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle-fill"
                strokeDasharray={`${(totalSolved / PROBLEMS.length) * 100}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="stat-text">
              <span className="stat-value">{totalSolved}</span>
              <span className="stat-label">/{PROBLEMS.length} Solved</span>
            </div>
          </div>
          
          <div className="difficulty-stats">
            <div className="diff-stat easy">
              <span className="diff-label">Easy</span>
              <span className="diff-value">{easySolved}/{PROBLEMS.filter(p => p.difficulty === 'easy').length}</span>
            </div>
            <div className="diff-stat medium">
              <span className="diff-label">Medium</span>
              <span className="diff-value">{mediumSolved}/{PROBLEMS.filter(p => p.difficulty === 'medium').length}</span>
            </div>
            <div className="diff-stat hard">
              <span className="diff-label">Hard</span>
              <span className="diff-value">{hardSolved}/{PROBLEMS.filter(p => p.difficulty === 'hard').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="problems-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          🔍
        </div>

        <div className="filter-group">
          <label>Difficulty:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All' : cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">All</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>
        </div>
      </div>

      {/* Problem List */}
      <div className="problems-list">
        <div className="problems-table-header">
          <div className="col-status">Status</div>
          <div className="col-title">Title</div>
          <div className="col-category">Category</div>
          <div className="col-difficulty">Difficulty</div>
          <div className="col-tags">Tags</div>
        </div>

        {filteredProblems.map((problem, idx) => {
          const isSolved = solvedIds.has(problem.id);
          
          return (
            <div 
              key={problem.id} 
              className={`problem-row ${isSolved ? 'solved' : ''}`}
              onClick={() => navigate(`/problem/${problem.id}`)}
            >
              <div className="col-status">
                {isSolved ? '✅' : '⬜'}
              </div>
              <div className="col-title">
                <span className="problem-number">{idx + 1}.</span>
                {problem.title}
              </div>
              <div className="col-category">{problem.category}</div>
              <div className="col-difficulty">
                <span className={`difficulty-badge ${problem.difficulty}`}>
                  {problem.difficulty}
                </span>
              </div>
              <div className="col-tags">
                {problem.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          );
        })}

        {filteredProblems.length === 0 && (
          <div className="no-problems">
            No problems match your filters. Try adjusting your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
