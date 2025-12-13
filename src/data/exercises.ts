import { Exercise } from '../types';

export const exercises: Exercise[] = [
  // ============================================
  // TREE EXERCISES
  // ============================================
  {
    id: 'tree-nNodes-high',
    title: 'Count Nodes (High Level)',
    description: 'Implement a method that counts the total number of nodes in a binary tree using only high-level interface methods (EsVacio, Raiz, SubArbolIzqdo, SubArbolDcho).',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'trees',
    difficulty: 'easy',
    starterCode: `public static <E> int nNodes(ArbolBinarioE<E> a) {
    // Your code here
    // Use only: EsVacio(), Raiz(), SubArbolIzqdo(), SubArbolDcho()
    
}`,
    solution: `public static <E> int nNodes(ArbolBinarioE<E> a) {
    if (a.EsVacio()) {
        return 0;
    }
    return 1 + nNodes(a.SubArbolIzqdo()) + nNodes(a.SubArbolDcho());
}`,
    allowedPatterns: ['EsVacio', 'Raiz', 'SubArbolIzqdo', 'SubArbolDcho'],
    forbiddenPatterns: ['NodoArbol', '.iz', '.de', '.info', 'NodoRaiz'],
    requiredSignature: 'public static <E> int nNodes(ArbolBinarioE<E> a)',
    hints: [
      'Base case: an empty tree has 0 nodes',
      'Recursive case: count = 1 (root) + nodes in left subtree + nodes in right subtree',
      'Use EsVacio() to check if tree is empty'
    ],
    testCases: [
      { name: 'Empty tree', input: 'AV', expected: '0', description: 'Empty tree should return 0' },
      { name: 'Single node', input: 'AB(5, AV, AV)', expected: '1', description: 'Single node tree' },
      { name: 'Complete tree', input: 'AB(1, AB(2, AB(4,AV,AV), AB(5,AV,AV)), AB(3, AV, AV))', expected: '5', description: 'Tree with 5 nodes' }
    ]
  },
  {
    id: 'tree-nNodes-low',
    title: 'Count Nodes (Low Level)',
    description: 'Implement the same node counting method but using only low-level node access (NodoRaiz, .iz, .de, .info). No interface methods allowed.',
    mode: 'LOW_LEVEL',
    language: 'java',
    topic: 'trees',
    difficulty: 'medium',
    starterCode: `public static <E> int nNodes(ABDE<E> a) {
    // Your code here
    // Use only: NodoRaiz, .iz, .de, .info
    // No interface methods!
    
}`,
    solution: `public static <E> int nNodes(ABDE<E> a) {
    return nNodesRec(a.NodoRaiz);
}

private static <E> int nNodesRec(NodoArbol<E> n) {
    if (n == null) {
        return 0;
    }
    return 1 + nNodesRec(n.iz) + nNodesRec(n.de);
}`,
    allowedPatterns: ['NodoRaiz', '.iz', '.de', '.info', 'NodoArbol'],
    forbiddenPatterns: ['EsVacio', 'Raiz', 'SubArbolIzqdo', 'SubArbolDcho'],
    requiredSignature: 'public static <E> int nNodes(ABDE<E> a)',
    hints: [
      'Access the root directly with a.NodoRaiz',
      'Check if NodoRaiz == null for empty tree',
      'Navigate with node.iz and node.de'
    ],
    testCases: [
      { name: 'Empty tree', input: 'null', expected: '0', description: 'Empty tree should return 0' },
      { name: 'Single node', input: 'NodoArbol(5, null, null)', expected: '1', description: 'Single node tree' }
    ]
  },
  {
    id: 'tree-height-avl',
    title: 'Height with AVL Check',
    description: 'Implement a method that returns the height of a BST, but returns -1 if the tree is NOT AVL balanced (balance factor > 1 at any node).',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'trees',
    difficulty: 'hard',
    starterCode: `public static <E extends Comparable<E>> int heightAVL(ArbolBusquedaE<E> a) {
    // Return height if AVL, -1 if not AVL
    // Use only interface methods
    
}`,
    solution: `public static <E extends Comparable<E>> int heightAVL(ArbolBusquedaE<E> a) {
    if (a.EsVacio()) {
        return 0;
    }
    int hIz = heightAVL(a.SubArbolIzqdo());
    int hDe = heightAVL(a.SubArbolDcho());
    
    // If any subtree is not AVL, propagate -1
    if (hIz == -1 || hDe == -1) {
        return -1;
    }
    
    // Check AVL balance condition
    if (Math.abs(hIz - hDe) > 1) {
        return -1;
    }
    
    return 1 + Math.max(hIz, hDe);
}`,
    allowedPatterns: ['EsVacio', 'Raiz', 'SubArbolIzqdo', 'SubArbolDcho'],
    forbiddenPatterns: ['NodoArbol', '.iz', '.de', 'NodoRaiz'],
    requiredSignature: 'public static <E extends Comparable<E>> int heightAVL(ArbolBusquedaE<E> a)',
    hints: [
      'You need to compute height and check AVL in one traversal',
      'If either subtree returns -1, propagate -1',
      'Check |height(left) - height(right)| <= 1'
    ],
    testCases: [
      { name: 'Balanced AVL', input: 'BST(5,3,7,2,4,6,8)', expected: '3', description: 'Balanced tree returns height' },
      { name: 'Unbalanced', input: 'BST(1,2,3,4,5)', expected: '-1', description: 'Degenerate tree returns -1' }
    ]
  },
  {
    id: 'tree-fcnodes',
    title: 'Count Nodes with Completeness Sign',
    description: 'Implement fcnodes: returns the number of nodes if the tree is fully complete, or the negative count if not fully complete.',
    mode: 'HYBRID',
    language: 'java',
    topic: 'trees',
    difficulty: 'hard',
    starterCode: `public static <E> Integer fcnodes(ArbolBinarioE<E> a) {
    // Return n if fully complete (all levels full)
    // Return -n if not fully complete
    // Hint: A tree is fully complete if nNodes = 2^height - 1
    
}`,
    allowedPatterns: ['EsVacio', 'Raiz', 'SubArbolIzqdo', 'SubArbolDcho', 'NodoArbol'],
    forbiddenPatterns: [],
    requiredSignature: 'public static <E> Integer fcnodes(ArbolBinarioE<E> a)',
    hints: [
      'Compute both height and node count',
      'For a fully complete tree: nodes = 2^height - 1',
      'Use Math.pow(2, height) - 1 to check'
    ],
    testCases: [
      { name: 'Fully complete', input: 'AB(1,AB(2,AB(4,AV,AV),AB(5,AV,AV)),AB(3,AB(6,AV,AV),AB(7,AV,AV)))', expected: '7', description: 'Perfect tree of height 3' },
      { name: 'Not complete', input: 'AB(1,AB(2,AV,AV),AV)', expected: '-2', description: 'Incomplete tree' }
    ]
  },

  // ============================================
  // HASKELL TREE EXERCISES
  // ============================================
  {
    id: 'tree-nodos-haskell',
    title: 'nNodos (Haskell)',
    description: 'Define the function nNodos that counts nodes in a binary tree.',
    mode: 'HASKELL',
    language: 'haskell',
    topic: 'trees',
    difficulty: 'easy',
    starterCode: `-- data Arbol a = AV | AB a (Arbol a) (Arbol a)

nNodos :: Arbol a -> Int
nNodos AV = -- base case
nNodos (AB r i d) = -- recursive case`,
    solution: `nNodos :: Arbol a -> Int
nNodos AV = 0
nNodos (AB r i d) = 1 + nNodos i + nNodos d`,
    allowedPatterns: ['AV', 'AB', 'nNodos'],
    forbiddenPatterns: [],
    requiredSignature: 'nNodos :: Arbol a -> Int',
    hints: [
      'Empty tree (AV) has 0 nodes',
      'For AB r i d: count root (1) + left subtree + right subtree'
    ],
    testCases: [
      { name: 'Empty', input: 'AV', expected: '0' },
      { name: 'Single', input: 'AB 5 AV AV', expected: '1' },
      { name: 'Full tree', input: 'AB 1 (AB 2 AV AV) (AB 3 AV AV)', expected: '3' }
    ]
  },
  {
    id: 'tree-altura-haskell',
    title: 'altura (Haskell)',
    description: 'Define the altura function that computes the height of a binary tree.',
    mode: 'HASKELL',
    language: 'haskell',
    topic: 'trees',
    difficulty: 'easy',
    starterCode: `-- data Arbol a = AV | AB a (Arbol a) (Arbol a)

altura :: Arbol a -> Int
altura AV = -- base case
altura (AB _ i d) = -- recursive case`,
    solution: `altura :: Arbol a -> Int
altura AV = 0
altura (AB _ i d) = 1 + max (altura i) (altura d)`,
    allowedPatterns: ['AV', 'AB', 'altura', 'max'],
    forbiddenPatterns: [],
    requiredSignature: 'altura :: Arbol a -> Int',
    hints: [
      'Height of empty tree is 0',
      'Height = 1 + max(height of left, height of right)',
      'Use the max function'
    ],
    testCases: [
      { name: 'Empty', input: 'AV', expected: '0' },
      { name: 'Single', input: 'AB 5 AV AV', expected: '1' },
      { name: 'Chain', input: 'AB 1 (AB 2 (AB 3 AV AV) AV) AV', expected: '3' }
    ]
  },

  // ============================================
  // GRAPH EXERCISES
  // ============================================
  {
    id: 'graph-accessible',
    title: 'Accessible Nodes (BFS)',
    description: 'Implement a method that returns all nodes accessible from a starting node using BFS.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'graphs',
    difficulty: 'medium',
    starterCode: `public static List<Integer> accesibles(GNDE g, int inicio) {
    // Return list of all nodes reachable from 'inicio'
    // Use BFS with a queue
    // Allowed: EnCola, Resto, Cabeza, EsVacia, g.nNodos, g.existeArista
    
}`,
    solution: `public static List<Integer> accesibles(GNDE g, int inicio) {
    List<Integer> result = new ArrayList<>();
    boolean[] visited = new boolean[g.nNodos()];
    Cola<Integer> cola = new CDE<>();
    
    cola.EnCola(inicio);
    visited[inicio] = true;
    
    while (!cola.EsVacia()) {
        int actual = cola.Cabeza();
        cola.Resto();
        result.add(actual);
        
        for (int i = 0; i < g.nNodos(); i++) {
            if (!visited[i] && g.existeArista(actual, i)) {
                visited[i] = true;
                cola.EnCola(i);
            }
        }
    }
    return result;
}`,
    allowedPatterns: ['EnCola', 'Resto', 'Cabeza', 'EsVacia', 'nNodos', 'existeArista'],
    forbiddenPatterns: ['Adyacencias', 'NodoCabeza', 'NodoFinal'],
    requiredSignature: 'public static List<Integer> accesibles(GNDE g, int inicio)',
    hints: [
      'Use a boolean[] visited array',
      'Start by enqueueing the initial node',
      'For each dequeued node, enqueue all unvisited neighbors'
    ],
    testCases: [
      { name: 'Connected', input: 'G([0,1,2], [(0,1),(1,2)]), start=0', expected: '[0,1,2]' },
      { name: 'Disconnected', input: 'G([0,1,2,3], [(0,1)]), start=0', expected: '[0,1]' }
    ]
  },
  {
    id: 'graph-mimax',
    title: 'Build Graph from BST Paths',
    description: 'Build a GNDE graph containing only the paths from root to minimum and root to maximum of a BST.',
    mode: 'HYBRID',
    language: 'java',
    topic: 'graphs',
    difficulty: 'hard',
    starterCode: `public GNDE(ArbolBusquedaE<Integer> t) {
    // Constructor: build graph from paths root→min and root→max
    // Nodes: all nodes on both paths
    // Edges: parent→child on those paths
    
}`,
    allowedPatterns: ['Raiz', 'SubArbolIzqdo', 'SubArbolDcho', 'EsVacio', 'Nodos', 'Adyacencias'],
    forbiddenPatterns: [],
    requiredSignature: 'public GNDE(ArbolBusquedaE<Integer> t)',
    hints: [
      'First traverse left to find min, collecting nodes',
      'Then traverse right to find max, collecting nodes',
      'Create edges for parent-child relationships on paths'
    ],
    testCases: [
      { name: 'Balanced BST', input: 'BST(5,3,7,1,4,6,8)', expected: 'Graph with nodes [5,3,1,7,8]' }
    ]
  },

  // ============================================
  // FLOYD EXERCISES
  // ============================================
  {
    id: 'floyd-cycle',
    title: 'Find Minimum Cycle',
    description: 'Using a Floyd distance matrix, find the minimum weight cycle and return the nodes in order.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'floyd',
    difficulty: 'medium',
    starterCode: `public static List<Integer> cycle(int[][] floyd) {
    // floyd[i][j] = shortest path from i to j
    // Find minimum cycle: min(floyd[i][j] + floyd[j][i]) for i != j
    // Return nodes in the cycle
    
}`,
    solution: `public static List<Integer> cycle(int[][] floyd) {
    int n = floyd.length;
    int minCycle = Integer.MAX_VALUE;
    int minI = -1, minJ = -1;
    
    // Find the minimum cycle
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (floyd[i][j] != Integer.MAX_VALUE && floyd[j][i] != Integer.MAX_VALUE) {
                int cycleWeight = floyd[i][j] + floyd[j][i];
                if (cycleWeight < minCycle) {
                    minCycle = cycleWeight;
                    minI = i;
                    minJ = j;
                }
            }
        }
    }
    
    // Reconstruct the cycle path (simplified)
    List<Integer> path = new ArrayList<>();
    if (minI != -1) {
        path.add(minI);
        path.add(minJ);
        path.add(minI); // Return to start
    }
    return path;
}`,
    allowedPatterns: ['floyd', 'length'],
    forbiddenPatterns: [],
    requiredSignature: 'public static List<Integer> cycle(int[][] floyd)',
    hints: [
      'A cycle through i and j has weight: floyd[i][j] + floyd[j][i]',
      'Check all pairs (i,j) where i < j',
      'Remember to handle infinity values'
    ],
    testCases: [
      { name: 'Simple cycle', input: '[[0,1,∞],[∞,0,2],[3,∞,0]]', expected: '[0,1,2,0]', description: 'Cycle 0→1→2→0' }
    ]
  },
  {
    id: 'floyd-transform',
    title: 'Transform Floyd to Adjacency',
    description: 'Given a Floyd best-path matrix, reconstruct an adjacency matrix removing edges where best path uses exactly one intermediate node.',
    mode: 'HYBRID',
    language: 'java',
    topic: 'floyd',
    difficulty: 'hard',
    starterCode: `public static int[][] transform(int[][] floyd, int[][] path) {
    // floyd[i][j] = best path weight
    // path[i][j] = first intermediate node (or -1 if direct)
    // Remove arc (i,j) if path uses exactly 1 intermediate
    // Return new adjacency matrix
    
}`,
    allowedPatterns: ['floyd', 'path', 'length'],
    forbiddenPatterns: [],
    requiredSignature: 'public static int[][] transform(int[][] floyd, int[][] path)',
    hints: [
      'If path[i][j] = k and path[i][k] = -1 and path[k][j] = -1, theres 1 intermediate',
      'In that case, remove the direct edge i→j',
      'Assign unique weights to remaining edges'
    ],
    testCases: []
  },

  // ============================================
  // HUFFMAN EXERCISES
  // ============================================
  {
    id: 'huffman-insert',
    title: 'Insert into Sorted Huffman List',
    description: 'Implement insert that adds a Huffman tree to a sorted list (by weight), maintaining order.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'huffman',
    difficulty: 'easy',
    starterCode: `public static void insert(ArbolHuffman t, Lista<ArbolHuffman> lista) {
    // Insert tree t into lista maintaining sorted order by weight
    // Use: EsVacia, Cabeza, Cola, Add
    
}`,
    solution: `public static void insert(ArbolHuffman t, Lista<ArbolHuffman> lista) {
    if (lista.EsVacia() || t.peso() <= lista.Cabeza().peso()) {
        lista.Add(t);  // Insert at front
    } else {
        // Find correct position
        ArbolHuffman head = lista.Cabeza();
        lista.Resto();
        insert(t, lista);  // Recurse on rest
        lista.Add(head);   // Put head back
    }
}`,
    allowedPatterns: ['EsVacia', 'Cabeza', 'Cola', 'Add', 'peso'],
    forbiddenPatterns: ['NodoCabeza', '.Siguiente'],
    requiredSignature: 'public static void insert(ArbolHuffman t, Lista<ArbolHuffman> lista)',
    hints: [
      'Compare weight of t with Cabeza of list',
      'If t.peso() <= cabeza.peso(), insert at front',
      'Otherwise, recursively insert into Cola'
    ],
    testCases: [
      { name: 'Insert middle', input: 'Tree(15), [Tree(10), Tree(20)]', expected: '[Tree(10), Tree(15), Tree(20)]' }
    ]
  },
  {
    id: 'huffman-code',
    title: 'Get Huffman Code (Haskell)',
    description: 'Define a function that returns the binary code (as a String) for a symbol in a Huffman tree.',
    mode: 'HASKELL',
    language: 'haskell',
    topic: 'huffman',
    difficulty: 'medium',
    starterCode: `-- data Huffman = Hoja Char Float | Nodo Float Huffman Huffman

codigo :: Char -> Huffman -> String
codigo c (Hoja s _) = -- base case
codigo c (Nodo _ i d) = -- recursive case`,
    solution: `codigo :: Char -> Huffman -> String
codigo c (Hoja s _) 
    | c == s    = ""
    | otherwise = error "Symbol not found"
codigo c (Nodo _ i d) = 
    case (buscar c i, buscar c d) of
        (True, _) -> '0' : codigo c i
        (_, True) -> '1' : codigo c d
        _         -> error "Symbol not found"

-- Helper: check if symbol exists in tree
buscar :: Char -> Huffman -> Bool
buscar c (Hoja s _) = c == s
buscar c (Nodo _ i d) = buscar c i || buscar c d`,
    allowedPatterns: ['Hoja', 'Nodo', 'codigo'],
    forbiddenPatterns: [],
    requiredSignature: 'codigo :: Char -> Huffman -> String',
    hints: [
      'At a Hoja (leaf), return "" if symbol matches, otherwise indicate not found',
      'At a Nodo, try left subtree with "0" prefix, then right with "1"',
      'Concatenate the path as you descend'
    ],
    testCases: [
      { name: 'Left leaf', input: 'Nodo 1.0 (Hoja \'a\' 0.5) (Hoja \'b\' 0.5), \'a\'', expected: '"0"' },
      { name: 'Right leaf', input: 'Nodo 1.0 (Hoja \'a\' 0.5) (Hoja \'b\' 0.5), \'b\'', expected: '"1"' }
    ]
  },

  // ============================================
  // LIST/QUEUE/STACK EXERCISES  
  // ============================================
  {
    id: 'queue-reverse-low',
    title: 'Reverse Queue (Low Level)',
    description: 'Implement queue reversal by directly manipulating node links (NodoCabeza, NodoFinal, Siguiente).',
    mode: 'LOW_LEVEL',
    language: 'java',
    topic: 'queues',
    difficulty: 'medium',
    starterCode: `public void reverse() {
    // Reverse this queue in-place
    // Use only: NodoCabeza, NodoFinal, .Info, .Siguiente
    // No interface methods!
    
}`,
    solution: `public void reverse() {
    if (NodoCabeza == null || NodoCabeza.Siguiente == null) {
        return;  // Empty or single element
    }
    
    Nodo<E> prev = null;
    Nodo<E> current = NodoCabeza;
    NodoFinal = NodoCabeza;  // Head becomes tail
    
    while (current != null) {
        Nodo<E> next = current.Siguiente;
        current.Siguiente = prev;
        prev = current;
        current = next;
    }
    
    NodoCabeza = prev;  // Last node becomes head
}`,
    allowedPatterns: ['NodoCabeza', 'NodoFinal', '.Info', '.Siguiente', 'Nodo'],
    forbiddenPatterns: ['EnCola', 'Resto', 'Cabeza', 'EsVacia'],
    requiredSignature: 'public void reverse()',
    hints: [
      'Use three pointers: prev, current, next',
      'Iterate through, reversing each Siguiente pointer',
      'Swap NodoCabeza and NodoFinal at the end'
    ],
    testCases: [
      { name: 'Reverse 1,2,3', input: 'CDE(1,2,3)', expected: 'CDE(3,2,1)' }
    ]
  },
  {
    id: 'list-mix21',
    title: 'Mix Two Lists (op21/mix21)',
    description: 'Create a new list by alternating elements: first from l1, first from l2, second from l1, etc.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'lists',
    difficulty: 'medium',
    starterCode: `public static <E> Lista<E> mix21(Lista<E> l1, Lista<E> l2) {
    // Alternate elements: l1[0], l2[0], l1[1], l2[1], ...
    // When one list ends, append rest of the other
    // Use: EsVacia, Cabeza, Cola, Add
    
}`,
    solution: `public static <E> Lista<E> mix21(Lista<E> l1, Lista<E> l2) {
    Lista<E> result = new LDE<>();
    
    if (l1.EsVacia() && l2.EsVacia()) {
        return result;
    }
    
    if (l1.EsVacia()) {
        result.Add(l2.Cabeza());
        l2.Cola();
        Lista<E> rest = mix21(l1, l2);
        // Prepend result with rest
        return concat(result, rest);
    }
    
    if (l2.EsVacia()) {
        result.Add(l1.Cabeza());
        l1.Cola();
        Lista<E> rest = mix21(l1, l2);
        return concat(result, rest);
    }
    
    // Both have elements: take from l1, then l2
    E e1 = l1.Cabeza(); l1.Cola();
    E e2 = l2.Cabeza(); l2.Cola();
    result.Add(e1);
    result.Add(e2);
    return concat(result, mix21(l1, l2));
}`,
    allowedPatterns: ['EsVacia', 'Cabeza', 'Cola', 'Add'],
    forbiddenPatterns: ['NodoCabeza', '.Siguiente'],
    requiredSignature: 'public static <E> Lista<E> mix21(Lista<E> l1, Lista<E> l2)',
    hints: [
      'Base case: if one is empty, return the other',
      'Take Cabeza from l1, then recurse with l2 first (to alternate)',
      'Add elements in reverse order or use recursion carefully'
    ],
    testCases: [
      { name: 'Same length', input: '[1,2,3], [a,b,c]', expected: '[1,a,2,b,3,c]' },
      { name: 'Different length', input: '[1,2], [a,b,c,d]', expected: '[1,a,2,b,c,d]' }
    ]
  },
  {
    id: 'stack-eval-rpn',
    title: 'RPN Calculator',
    description: 'Evaluate a Reverse Polish Notation expression using a stack.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'stacks',
    difficulty: 'medium',
    starterCode: `public static Double RPNvalue(Pila<Object> exp) {
    // exp contains Double values and String operators (+, -, *, /)
    // Use an auxiliary stack to evaluate
    // Use: APila, DesaPila, Tope, EsVacia
    
}`,
    solution: `public static Double RPNvalue(Pila<Object> exp) {
    Pila<Double> aux = new PDE<>();
    
    while (!exp.EsVacia()) {
        Object elem = exp.Tope();
        exp.DesaPila();
        
        if (elem instanceof Double) {
            aux.APila((Double) elem);
        } else {
            String op = (String) elem;
            Double b = aux.Tope(); aux.DesaPila();
            Double a = aux.Tope(); aux.DesaPila();
            
            Double result = switch (op) {
                case "+" -> a + b;
                case "-" -> a - b;
                case "*" -> a * b;
                case "/" -> a / b;
                default -> 0.0;
            };
            aux.APila(result);
        }
    }
    return aux.Tope();
}`,
    allowedPatterns: ['APila', 'DesaPila', 'Tope', 'EsVacia'],
    forbiddenPatterns: ['NodoCabeza', '.Siguiente'],
    requiredSignature: 'public static Double RPNvalue(Pila<Object> exp)',
    hints: [
      'If element is Double, push to aux stack',
      'If element is operator, pop two values, compute, push result',
      'Final result is the only element left on aux stack'
    ],
    testCases: [
      { name: '3 + 4', input: '[3.0, 4.0, "+"]', expected: '7.0' },
      { name: '(3 + 4) * 2', input: '[3.0, 4.0, "+", 2.0, "*"]', expected: '14.0' }
    ]
  },

  // ============================================
  // ADDITIONAL TREE EXERCISES
  // ============================================
  {
    id: 'tree-leaves-high',
    title: 'Count Leaves (High Level)',
    description: 'Count the number of leaf nodes (nodes with no children) in a binary tree.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'trees',
    difficulty: 'easy',
    starterCode: `public static <E> int nHojas(ArbolBinarioE<E> a) {
    // Count nodes that have NO children (both subtrees are empty)
    // Use: EsVacio(), SubArbolIzqdo(), SubArbolDcho()
    
}`,
    solution: `public static <E> int nHojas(ArbolBinarioE<E> a) {
    if (a.EsVacio()) {
        return 0;
    }
    // A leaf has both subtrees empty
    if (a.SubArbolIzqdo().EsVacio() && a.SubArbolDcho().EsVacio()) {
        return 1;
    }
    return nHojas(a.SubArbolIzqdo()) + nHojas(a.SubArbolDcho());
}`,
    allowedPatterns: ['EsVacio', 'SubArbolIzqdo', 'SubArbolDcho'],
    forbiddenPatterns: ['NodoArbol', '.iz', '.de', 'NodoRaiz'],
    requiredSignature: 'public static <E> int nHojas(ArbolBinarioE<E> a)',
    hints: [
      'A leaf is a node where BOTH subtrees are empty',
      'Base case: empty tree has 0 leaves',
      'Check if both SubArbolIzqdo() and SubArbolDcho() are empty'
    ],
    testCases: [
      { name: 'Single node', input: 'AB(5, AV, AV)', expected: '1' },
      { name: 'Full tree', input: 'AB(1, AB(2, AV, AV), AB(3, AV, AV))', expected: '2' }
    ]
  },
  {
    id: 'tree-preorder-haskell',
    title: 'Preorder Traversal (Haskell)',
    description: 'Implement preorder traversal returning a list of elements.',
    mode: 'HASKELL',
    language: 'haskell',
    topic: 'trees',
    difficulty: 'easy',
    starterCode: `-- data Arbol a = AV | AB a (Arbol a) (Arbol a)

preorden :: Arbol a -> [a]
preorden AV = -- base case
preorden (AB r i d) = -- root, then left, then right`,
    allowedPatterns: ['AV', 'AB', 'preorden', '++', ':'],
    forbiddenPatterns: [],
    requiredSignature: 'preorden :: Arbol a -> [a]',
    hints: [
      'Empty tree gives empty list []',
      'Preorder: root first, then left, then right',
      'Use ++ to concatenate lists or : to cons'
    ],
    testCases: [
      { name: 'Single', input: 'AB 1 AV AV', expected: '[1]' },
      { name: 'Tree', input: 'AB 1 (AB 2 AV AV) (AB 3 AV AV)', expected: '[1,2,3]' }
    ]
  },
  {
    id: 'tree-inorder-haskell',
    title: 'Inorder Traversal (Haskell)',
    description: 'Implement inorder traversal returning a list of elements.',
    mode: 'HASKELL',
    language: 'haskell',
    topic: 'trees',
    difficulty: 'easy',
    starterCode: `-- data Arbol a = AV | AB a (Arbol a) (Arbol a)

inorden :: Arbol a -> [a]
inorden AV = -- base case
inorden (AB r i d) = -- left, then root, then right`,
    allowedPatterns: ['AV', 'AB', 'inorden', '++', ':'],
    forbiddenPatterns: [],
    requiredSignature: 'inorden :: Arbol a -> [a]',
    hints: [
      'Empty tree gives empty list []',
      'Inorder: left first, then root, then right',
      'For BST, inorder gives sorted elements'
    ],
    testCases: [
      { name: 'Single', input: 'AB 1 AV AV', expected: '[1]' },
      { name: 'BST', input: 'AB 5 (AB 3 AV AV) (AB 7 AV AV)', expected: '[3,5,7]' }
    ]
  },
  {
    id: 'tree-mirror-high',
    title: 'Mirror Tree (High Level)',
    description: 'Create a mirror image of a binary tree (swap left and right subtrees at every node).',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'trees',
    difficulty: 'medium',
    starterCode: `public static <E> ArbolBinarioE<E> espejo(ArbolBinarioE<E> a) {
    // Return a new tree that is the mirror of a
    // Left becomes right, right becomes left at every node
    
}`,
    allowedPatterns: ['EsVacio', 'Raiz', 'SubArbolIzqdo', 'SubArbolDcho', 'ArbolBinarioE'],
    forbiddenPatterns: ['NodoArbol', '.iz', '.de', 'NodoRaiz'],
    requiredSignature: 'public static <E> ArbolBinarioE<E> espejo(ArbolBinarioE<E> a)',
    hints: [
      'Base case: mirror of empty tree is empty tree',
      'Create new tree with root, but swap children',
      'Recursively mirror both subtrees'
    ],
    testCases: [
      { name: 'Single', input: 'AB(5, AV, AV)', expected: 'AB(5, AV, AV)' },
      { name: 'Asymmetric', input: 'AB(1, AB(2, AV, AV), AV)', expected: 'AB(1, AV, AB(2, AV, AV))' }
    ]
  },
  {
    id: 'tree-bst-search-high',
    title: 'BST Search (High Level)',
    description: 'Search for an element in a Binary Search Tree. Return true if found.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'trees',
    difficulty: 'easy',
    starterCode: `public static <E extends Comparable<E>> 
boolean pertenece(E elem, ArbolBusquedaE<E> a) {
    // Return true if elem is in the BST
    // Use BST property: left < root < right
    
}`,
    allowedPatterns: ['EsVacio', 'Raiz', 'SubArbolIzqdo', 'SubArbolDcho', 'compareTo'],
    forbiddenPatterns: ['NodoArbol', '.iz', '.de', 'NodoRaiz'],
    requiredSignature: 'public static <E extends Comparable<E>> boolean pertenece',
    hints: [
      'Use compareTo: negative = less, zero = equal, positive = greater',
      'If elem < root, search left only',
      'If elem > root, search right only'
    ],
    testCases: [
      { name: 'Found', input: 'BST(5,3,7), elem=3', expected: 'true' },
      { name: 'Not found', input: 'BST(5,3,7), elem=4', expected: 'false' }
    ]
  },

  // ============================================
  // ADDITIONAL GRAPH EXERCISES
  // ============================================
  {
    id: 'graph-connected-components',
    title: 'Connected Components',
    description: 'Count the number of connected components in an undirected graph.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'graphs',
    difficulty: 'medium',
    starterCode: `public static int numComponentes(GNDE g) {
    // Count separate connected components
    // Use DFS/BFS from each unvisited node
    
}`,
    allowedPatterns: ['nNodos', 'existeArista', 'EnCola', 'APila'],
    forbiddenPatterns: ['Adyacencias'],
    requiredSignature: 'public static int numComponentes(GNDE g)',
    hints: [
      'For each unvisited node, do DFS/BFS and mark all reachable nodes',
      'Each DFS/BFS call discovers one component',
      'Count how many times you start a new traversal'
    ],
    testCases: [
      { name: 'One component', input: 'G([0,1,2], [(0,1),(1,2)])', expected: '1' },
      { name: 'Two components', input: 'G([0,1,2,3], [(0,1),(2,3)])', expected: '2' }
    ]
  },
  {
    id: 'graph-has-cycle',
    title: 'Detect Cycle (Directed)',
    description: 'Determine if a directed graph contains a cycle.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'graphs',
    difficulty: 'hard',
    starterCode: `public static boolean tieneCiclo(GNDE g) {
    // Return true if the directed graph has a cycle
    // Use DFS with "in progress" marking
    
}`,
    allowedPatterns: ['nNodos', 'existeArista'],
    forbiddenPatterns: [],
    requiredSignature: 'public static boolean tieneCiclo(GNDE g)',
    hints: [
      'Use three states: unvisited, in-progress, completed',
      'A cycle exists if DFS visits an in-progress node',
      'In-progress means node is on current DFS path'
    ],
    testCases: [
      { name: 'Has cycle', input: 'G([0,1,2], [(0,1),(1,2),(2,0)])', expected: 'true' },
      { name: 'No cycle', input: 'G([0,1,2], [(0,1),(1,2)])', expected: 'false' }
    ]
  },
  {
    id: 'graph-topological',
    title: 'Topological Sort',
    description: 'Return a topological ordering of a DAG (Directed Acyclic Graph).',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'graphs',
    difficulty: 'hard',
    starterCode: `public static List<Integer> ordenTopologico(GNDE g) {
    // Return nodes in topological order
    // Edge (u,v) means u must come before v
    
}`,
    allowedPatterns: ['nNodos', 'existeArista', 'APila', 'DesaPila'],
    forbiddenPatterns: [],
    requiredSignature: 'public static List<Integer> ordenTopologico(GNDE g)',
    hints: [
      'Use DFS and add node to result after visiting all neighbors',
      'Or count in-degrees and process nodes with 0 in-degree',
      'Result should be reversed if using post-order DFS'
    ],
    testCases: [
      { name: 'Simple DAG', input: 'G([0,1,2], [(0,1),(0,2),(1,2)])', expected: '[0,1,2] or [0,2,1]' }
    ]
  },

  // ============================================
  // ADDITIONAL FLOYD EXERCISES
  // ============================================
  {
    id: 'floyd-detect-negative-cycle',
    title: 'Detect Negative Cycle',
    description: 'Use Floyd-Warshall result to detect if the graph has a negative cycle.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'floyd',
    difficulty: 'easy',
    starterCode: `public static boolean tieneCircuitoNegativo(int[][] floyd) {
    // floyd[i][j] = shortest path from i to j
    // A negative cycle exists if any diagonal < 0
    
}`,
    allowedPatterns: ['floyd', 'length'],
    forbiddenPatterns: [],
    requiredSignature: 'public static boolean tieneCircuitoNegativo(int[][] floyd)',
    hints: [
      'After Floyd-Warshall, floyd[i][i] should be 0',
      'If floyd[i][i] < 0, there is a negative cycle through i',
      'Just check the diagonal'
    ],
    testCases: [
      { name: 'No negative cycle', input: 'floyd with diag = [0,0,0]', expected: 'false' },
      { name: 'Has negative cycle', input: 'floyd with diag = [0,-2,0]', expected: 'true' }
    ]
  },
  {
    id: 'floyd-eccentricity',
    title: 'Eccentricity of a Node',
    description: 'Calculate the eccentricity of a node (max distance to any other node).',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'floyd',
    difficulty: 'easy',
    starterCode: `public static int excentricidad(int[][] floyd, int v) {
    // Return max(floyd[v][j]) for all j != v
    // Ignore infinity values
    
}`,
    allowedPatterns: ['floyd', 'length', 'Math.max'],
    forbiddenPatterns: [],
    requiredSignature: 'public static int excentricidad(int[][] floyd, int v)',
    hints: [
      'Find the maximum distance from v to any other node',
      'Skip j == v and skip infinity values',
      'This is used to find graph center'
    ],
    testCases: [
      { name: 'Central node', input: 'floyd, v=1', expected: 'max distance from 1' }
    ]
  },

  // ============================================
  // ADDITIONAL HUFFMAN EXERCISES
  // ============================================
  {
    id: 'huffman-decode',
    title: 'Huffman Decode',
    description: 'Decode a binary string using a Huffman tree.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'huffman',
    difficulty: 'medium',
    starterCode: `public static String decodificar(String bits, ArbolHuffman t) {
    // bits = "0110..." binary string
    // Traverse tree: 0=left, 1=right
    // When reaching leaf, output symbol and restart from root
    
}`,
    allowedPatterns: ['charAt', 'length', 'esHoja', 'simbolo', 'izq', 'der'],
    forbiddenPatterns: [],
    requiredSignature: 'public static String decodificar(String bits, ArbolHuffman t)',
    hints: [
      'Start at root, read bit by bit',
      '0 means go left, 1 means go right',
      'When you reach a leaf, append symbol and go back to root'
    ],
    testCases: [
      { name: 'Simple decode', input: '"01", tree with a=0,b=1', expected: '"ab"' }
    ]
  },
  {
    id: 'huffman-merge-haskell',
    title: 'Huffman Merge (Haskell)',
    description: 'Implement the merge step of Huffman algorithm in Haskell.',
    mode: 'HASKELL',
    language: 'haskell',
    topic: 'huffman',
    difficulty: 'medium',
    starterCode: `-- data Huffman = Hoja Char Float | Nodo Float Huffman Huffman
-- peso :: Huffman -> Float

fusionar :: Huffman -> Huffman -> Huffman
fusionar h1 h2 = -- create new internal node`,
    allowedPatterns: ['Hoja', 'Nodo', 'peso'],
    forbiddenPatterns: [],
    requiredSignature: 'fusionar :: Huffman -> Huffman -> Huffman',
    hints: [
      'Create a Nodo with combined weight',
      'Children are h1 and h2',
      'New weight = peso h1 + peso h2'
    ],
    testCases: [
      { name: 'Merge leaves', input: 'Hoja \'a\' 0.3, Hoja \'b\' 0.2', expected: 'Nodo 0.5 (Hoja \'a\' 0.3) (Hoja \'b\' 0.2)' }
    ]
  },

  // ============================================
  // ADDITIONAL LIST EXERCISES
  // ============================================
  {
    id: 'list-reverse-high',
    title: 'Reverse List (High Level)',
    description: 'Reverse a list using only interface methods.',
    mode: 'HIGH_LEVEL',
    language: 'java',
    topic: 'lists',
    difficulty: 'easy',
    starterCode: `public static <E> Lista<E> invertir(Lista<E> l) {
    // Return a new list with elements in reverse order
    // Use: EsVacia, Cabeza, Cola, Add
    
}`,
    allowedPatterns: ['EsVacia', 'Cabeza', 'Cola', 'Add'],
    forbiddenPatterns: ['NodoCabeza', '.Siguiente'],
    requiredSignature: 'public static <E> Lista<E> invertir(Lista<E> l)',
    hints: [
      'Use an accumulator list',
      'Add each element to the front of accumulator',
      'Result builds up in reverse'
    ],
    testCases: [
      { name: 'Reverse', input: '[1,2,3]', expected: '[3,2,1]' }
    ]
  },
  {
    id: 'list-filter-haskell',
    title: 'Filter List (Haskell)',
    description: 'Filter elements from a list based on a predicate.',
    mode: 'HASKELL',
    language: 'haskell',
    topic: 'lists',
    difficulty: 'easy',
    starterCode: `filtrar :: (a -> Bool) -> [a] -> [a]
filtrar _ [] = -- base case
filtrar p (x:xs) = -- if p x then include x`,
    allowedPatterns: [':', '[]', 'filtrar'],
    forbiddenPatterns: [],
    requiredSignature: 'filtrar :: (a -> Bool) -> [a] -> [a]',
    hints: [
      'Base case: empty list returns empty',
      'If predicate is true, include x in result',
      'Use guards or if-then-else'
    ],
    testCases: [
      { name: 'Filter evens', input: '(even) [1,2,3,4]', expected: '[2,4]' }
    ]
  }
];

// Get exercises by topic
export function getExercisesByTopic(topic: string): Exercise[] {
  return exercises.filter(e => e.topic === topic);
}

// Get exercises by mode
export function getExercisesByMode(mode: string): Exercise[] {
  return exercises.filter(e => e.mode === mode);
}

// Get exercises by language
export function getExercisesByLanguage(lang: 'java' | 'haskell'): Exercise[] {
  return exercises.filter(e => e.language === lang);
}

// Get exercise by ID
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find(e => e.id === id);
}
