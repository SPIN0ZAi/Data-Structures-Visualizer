import { CodeExplanation } from '../types';

export const explanations: CodeExplanation[] = [
  // ============================================
  // TREE EXPLANATIONS
  // ============================================
  {
    id: 'tree-nnodes-high-explained',
    title: 'Counting Nodes (High Level)',
    topic: 'trees',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'How to count the total number of nodes in a binary tree using interface methods only.',
    conceptOverview: `In HIGH_LEVEL mode, we work with the abstract interface of a binary tree without accessing internal node structures. We use:
- EsVacio() → checks if the tree is empty
- Raiz() → returns the root element
- SubArbolIzqdo() → returns the left subtree (as a tree)
- SubArbolDcho() → returns the right subtree (as a tree)

This abstraction hides the node pointers (.iz, .de) and gives us a cleaner, recursive structure.`,
    codeWithComments: [
      { code: 'public static <E> int nNodes(ArbolBinarioE<E> a) {', comment: 'Generic method that works with any element type E' },
      { code: '    if (a.EsVacio()) {', comment: 'BASE CASE: Check if tree is empty using interface method' },
      { code: '        return 0;', comment: 'Empty tree has 0 nodes' },
      { code: '    } else {', comment: 'RECURSIVE CASE: Tree is not empty' },
      { code: '        return 1 +', comment: 'Count the root node (1)' },
      { code: '               nNodes(a.SubArbolIzqdo()) +', comment: 'Plus all nodes in the left subtree (recursive call)' },
      { code: '               nNodes(a.SubArbolDcho());', comment: 'Plus all nodes in the right subtree (recursive call)' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Always check for empty tree first (base case)',
      'Recursive pattern: 1 + left + right',
      'SubArbolIzqdo() returns a TREE, not a node',
      'We never access .iz or .de directly'
    ],
    relatedExercises: ['tree-nNodes-high', 'tree-nNodes-low']
  },
  {
    id: 'tree-nnodes-low-explained',
    title: 'Counting Nodes (Low Level)',
    topic: 'trees',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'How to count nodes using direct node access (NodoRaiz, .iz, .de, .info).',
    conceptOverview: `In LOW_LEVEL mode, we work directly with the internal node structure:
- NodoRaiz → the root node pointer (null if empty)
- .iz → left child pointer
- .de → right child pointer  
- .info → the data stored in the node

This requires a helper function because we traverse nodes, not trees.`,
    codeWithComments: [
      { code: 'public static <E> int nNodes(ABDE<E> a) {', comment: 'Main method receives the tree structure ABDE' },
      { code: '    return nNodesAux(a.NodoRaiz);', comment: 'Call helper with the root NODE (not tree)' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: 'private static <E> int nNodesAux(NodoArbol<E> n) {', comment: 'Helper that works on NodoArbol (node type)' },
      { code: '    if (n == null) {', comment: 'BASE CASE: null pointer = no node here' },
      { code: '        return 0;', comment: 'Return 0 for null' },
      { code: '    } else {', comment: 'RECURSIVE CASE: node exists' },
      { code: '        return 1 +', comment: 'Count this node (1)' },
      { code: '               nNodesAux(n.iz) +', comment: 'Plus nodes in left subtree via .iz pointer' },
      { code: '               nNodesAux(n.de);', comment: 'Plus nodes in right subtree via .de pointer' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Need helper function to traverse nodes',
      'Check for NULL instead of EsVacio()',
      'Access children via .iz and .de pointers',
      'Pattern is same: 1 + left + right'
    ],
    relatedExercises: ['tree-nNodes-low']
  },
  {
    id: 'tree-height-explained',
    title: 'Height of a Tree',
    topic: 'trees',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Calculate the height (maximum depth) of a binary tree.',
    conceptOverview: `Height = longest path from root to any leaf.
- Empty tree: height = 0 (or -1 depending on convention)
- Single node: height = 1
- Otherwise: 1 + max(height of left, height of right)`,
    codeWithComments: [
      { code: 'public static <E> int altura(ArbolBinarioE<E> a) {', comment: 'altura = height in Spanish' },
      { code: '    if (a.EsVacio()) {', comment: 'BASE CASE: empty tree' },
      { code: '        return 0;', comment: 'Height of empty tree is 0' },
      { code: '    } else {', comment: 'RECURSIVE CASE' },
      { code: '        int altIz = altura(a.SubArbolIzqdo());', comment: 'Get height of left subtree' },
      { code: '        int altDe = altura(a.SubArbolDcho());', comment: 'Get height of right subtree' },
      { code: '        return 1 + Math.max(altIz, altDe);', comment: 'Height = 1 (root level) + max of children heights' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Height uses MAX, not sum (unlike nNodes)',
      'Empty tree height is 0 (root-only tree = 1)',
      'This is essentially the longest path length',
      'Used in AVL to calculate balance factor'
    ],
    relatedExercises: ['tree-height-avl']
  },
  {
    id: 'tree-avl-balance-explained',
    title: 'AVL Balance Factor Check',
    topic: 'trees',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Check if a BST is AVL balanced (|balance factor| ≤ 1 at every node).',
    conceptOverview: `An AVL tree is a BST where for EVERY node:
Balance Factor = height(left) - height(right)
Must satisfy: -1 ≤ BF ≤ 1

If any node violates this, the tree is NOT AVL.`,
    codeWithComments: [
      { code: 'public static <E extends Comparable<E>>', comment: 'Elements must be Comparable for BST' },
      { code: 'int esAVL(ArbolBusquedaE<E> a) {', comment: 'Returns height if AVL, -1 if not AVL' },
      { code: '    if (a.EsVacio()) {', comment: 'BASE CASE: empty tree is AVL' },
      { code: '        return 0;', comment: 'Height 0, and balanced' },
      { code: '    }', comment: '' },
      { code: '    int hIz = esAVL(a.SubArbolIzqdo());', comment: 'Recursively check left (returns height or -1)' },
      { code: '    if (hIz == -1) return -1;', comment: 'If left subtree is not AVL, propagate -1' },
      { code: '    int hDe = esAVL(a.SubArbolDcho());', comment: 'Recursively check right' },
      { code: '    if (hDe == -1) return -1;', comment: 'If right subtree is not AVL, propagate -1' },
      { code: '    if (Math.abs(hIz - hDe) > 1) {', comment: 'Check balance factor at THIS node' },
      { code: '        return -1;', comment: 'Balance factor > 1 means NOT AVL' },
      { code: '    }', comment: '' },
      { code: '    return 1 + Math.max(hIz, hDe);', comment: 'Return height of this subtree' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '-1 is used as a "flag" meaning not AVL',
      'Check AVL condition at EVERY node during traversal',
      'Combine height calculation with AVL check in one pass',
      'Math.abs(hIz - hDe) > 1 is the key condition'
    ],
    relatedExercises: ['tree-height-avl']
  },
  {
    id: 'tree-maxleaf-java-high',
    title: 'maxleaf (Maximum Leaf) - HIGH LEVEL',
    topic: 'trees',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Find the maximum value among all leaves using HIGH LEVEL tree interface.',
    conceptOverview: `🎯 GOAL: Find the maximum value among all LEAVES (nodes with no children).

HIGH LEVEL approach uses interface methods:
• EsVacio() → check if tree is empty
• Raiz() → get root value
• SubArbolIzqdo() → get left subtree
• SubArbolDcho() → get right subtree

💡 A node is a LEAF if both its subtrees are empty.

⚠️ Efficiency: Use auxiliary method to avoid redundant recursive calls!`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// maxleaf - HIGH LEVEL (Interface methods only)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: 'E must be Comparable to use compareTo' },
      { code: 'E maxleaf(ArbolBinarioE<E> a) throws TADVacioException {', comment: '' },
      { code: '', comment: '' },
      { code: '    ArbolBinarioE<E> izq = a.SubArbolIzqdo();', comment: '📥 Get left subtree' },
      { code: '    ArbolBinarioE<E> der = a.SubArbolDcho();', comment: '📥 Get right subtree' },
      { code: '', comment: '' },
      { code: '    // 🍃 CASE 1: LEAF - both children empty', comment: '' },
      { code: '    if (izq.EsVacio() && der.EsVacio()) {', comment: '' },
      { code: '        return a.Raiz();', comment: '→ This IS a leaf, return its value' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ◀️ CASE 2: Only LEFT child exists', comment: '' },
      { code: '    if (der.EsVacio()) {', comment: '' },
      { code: '        return maxleaf(izq);', comment: '→ Leaves must be in left subtree' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ▶️ CASE 3: Only RIGHT child exists', comment: '' },
      { code: '    if (izq.EsVacio()) {', comment: '' },
      { code: '        return maxleaf(der);', comment: '→ Leaves must be in right subtree' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ◀️▶️ CASE 4: BOTH children exist - use auxiliary!', comment: '' },
      { code: '    E maxIzq = maxleaf(izq);', comment: '📊 Get max leaf from left (compute ONCE!)' },
      { code: '    E maxDer = maxleaf(der);', comment: '📊 Get max leaf from right (compute ONCE!)' },
      { code: '    return aux(maxIzq, maxDer);', comment: '🔧 Compare using auxiliary' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Auxiliary: max of two values', comment: '' },
      { code: 'private static <E extends Comparable<E>> E aux(E a, E b) {', comment: '' },
      { code: '    return (a.compareTo(b) >= 0) ? a : b;', comment: 'compareTo: positive if a>b, 0 if equal, negative if a<b' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '🌿 Leaf = both SubArbolIzqdo() and SubArbolDcho() are empty',
      '📊 Compute recursive results ONCE, store in variables',
      '✅ Use compareTo() for generic comparison (not < or >)',
      '⚠️ Cannot call a.Raiz() on empty tree - check EsVacio() first',
      '🔄 Same logic as Haskell, adapted for Java interface'
    ],
    relatedExercises: ['tree-maxleaf-java-low', 'tree-maxleaf-haskell']
  },
  {
    id: 'tree-maxleaf-java-low',
    title: 'maxleaf (Maximum Leaf) - LOW LEVEL',
    topic: 'trees',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Find the maximum value among all leaves using LOW LEVEL node access.',
    conceptOverview: `🎯 GOAL: Find the maximum value among all LEAVES.

LOW LEVEL approach accesses node structure directly:
• NodoRaiz → root node (or null if empty)
• .info → value stored in node
• .iz → left child node
• .de → right child node

💡 Requires helper method that works on NodoArbol instead of ABDE.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// maxleaf - LOW LEVEL (Direct node access)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '// Main method - receives tree, calls helper with root NODE', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: '' },
      { code: 'E maxleaf(ABDE<E> a) {', comment: '' },
      { code: '    return maxleafAux(a.NodoRaiz);', comment: '📥 Pass root NODE to helper' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Helper - works on NodoArbol (node level)', comment: '' },
      { code: 'private static <E extends Comparable<E>>', comment: '' },
      { code: 'E maxleafAux(NodoArbol<E> n) {', comment: '' },
      { code: '', comment: '' },
      { code: '    // 🍃 CASE 1: LEAF - both children null', comment: '' },
      { code: '    if (n.iz == null && n.de == null) {', comment: '' },
      { code: '        return n.info;', comment: '→ Return leaf value' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ◀️ CASE 2: Only LEFT child exists', comment: '' },
      { code: '    if (n.de == null) {', comment: '' },
      { code: '        return maxleafAux(n.iz);', comment: '→ Recurse left' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ▶️ CASE 3: Only RIGHT child exists', comment: '' },
      { code: '    if (n.iz == null) {', comment: '' },
      { code: '        return maxleafAux(n.de);', comment: '→ Recurse right' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ◀️▶️ CASE 4: BOTH children exist', comment: '' },
      { code: '    E maxIzq = maxleafAux(n.iz);', comment: '📊 Max leaf from left' },
      { code: '    E maxDer = maxleafAux(n.de);', comment: '📊 Max leaf from right' },
      { code: '    return (maxIzq.compareTo(maxDer) >= 0) ? maxIzq : maxDer;', comment: '🔧 Return larger' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '🔧 Need helper method for node-level recursion',
      '📍 Check null instead of EsVacio()',
      '📊 Access .info for value, .iz/.de for children',
      '✅ Same algorithm, different syntax than HIGH LEVEL',
      '⚡ Slightly more efficient (no method call overhead)'
    ],
    relatedExercises: ['tree-maxleaf-java-high', 'tree-maxleaf-java-hybrid']
  },
  {
    id: 'tree-maxleaf-java-hybrid',
    title: 'maxleaf (Maximum Leaf) - HYBRID',
    topic: 'trees',
    language: 'java',
    mode: 'HYBRID',
    description: 'Find the maximum value among all leaves mixing interface and node access.',
    conceptOverview: `🎯 GOAL: Find the maximum value among all LEAVES.

HYBRID approach: Start with tree interface, but access nodes internally.
• Use ABDE (tree class) as parameter
• Access NodoRaiz to get root node
• Use .iz and .de for navigation
• But can also use interface methods when convenient

This is common in exam questions where you receive ABDE<E> but need to 
manipulate nodes directly.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// maxleaf - HYBRID (Mix of interface and node access)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '// Works with ABDE but accesses nodes directly', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: '' },
      { code: 'E maxleaf(ABDE<E> a) {', comment: '📥 Receives ABDE (tree class)' },
      { code: '', comment: '' },
      { code: '    NodoArbol<E> n = a.NodoRaiz;', comment: '📍 Get root NODE (low-level access)' },
      { code: '', comment: '' },
      { code: '    // 🍃 LEAF: no children', comment: '' },
      { code: '    if (n.iz == null && n.de == null) {', comment: '' },
      { code: '        return n.info;', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ◀️ LEFT ONLY', comment: '' },
      { code: '    if (n.de == null) {', comment: '' },
      { code: '        // Create subtree from left node and recurse', comment: '' },
      { code: '        ABDE<E> leftTree = new ABDE<E>();', comment: '🔧 Create new tree wrapper' },
      { code: '        leftTree.NodoRaiz = n.iz;', comment: '📍 Point to left node' },
      { code: '        return maxleaf(leftTree);', comment: '🔄 Recurse with tree parameter' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ▶️ RIGHT ONLY', comment: '' },
      { code: '    if (n.iz == null) {', comment: '' },
      { code: '        ABDE<E> rightTree = new ABDE<E>();', comment: '' },
      { code: '        rightTree.NodoRaiz = n.de;', comment: '' },
      { code: '        return maxleaf(rightTree);', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ◀️▶️ BOTH: create subtrees and compare', comment: '' },
      { code: '    ABDE<E> leftTree = new ABDE<E>();', comment: '' },
      { code: '    leftTree.NodoRaiz = n.iz;', comment: '' },
      { code: '    ABDE<E> rightTree = new ABDE<E>();', comment: '' },
      { code: '    rightTree.NodoRaiz = n.de;', comment: '' },
      { code: '', comment: '' },
      { code: '    E maxIzq = maxleaf(leftTree);', comment: '' },
      { code: '    E maxDer = maxleaf(rightTree);', comment: '' },
      { code: '    return (maxIzq.compareTo(maxDer) >= 0) ? maxIzq : maxDer;', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ───────────────────────────────────────────────────', comment: '' },
      { code: '// Alternative HYBRID: Use helper (cleaner)', comment: '' },
      { code: '// ───────────────────────────────────────────────────', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: '' },
      { code: 'E maxleafV2(ABDE<E> a) {', comment: '' },
      { code: '    return maxleafHelper(a.NodoRaiz);', comment: '🔧 Delegate to node-level helper' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Helper works directly on nodes (no wrapper creation)', comment: '' },
      { code: 'private static <E extends Comparable<E>>', comment: '' },
      { code: 'E maxleafHelper(NodoArbol<E> n) {', comment: '' },
      { code: '    if (n.iz == null && n.de == null) return n.info;', comment: '' },
      { code: '    if (n.de == null) return maxleafHelper(n.iz);', comment: '' },
      { code: '    if (n.iz == null) return maxleafHelper(n.de);', comment: '' },
      { code: '    E l = maxleafHelper(n.iz);', comment: '' },
      { code: '    E r = maxleafHelper(n.de);', comment: '' },
      { code: '    return l.compareTo(r) >= 0 ? l : r;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '🔀 Receives ABDE (high-level) but accesses NodoRaiz (low-level)',
      '⚠️ First version creates wrapper trees (less efficient)',
      '✅ Second version (V2) with helper is cleaner and faster',
      '📚 Common exam pattern: "Given ABDE<E> a..."',
      '💡 When in doubt, use helper method for clean recursion'
    ],
    relatedExercises: ['tree-maxleaf-java-high', 'tree-maxleaf-java-low']
  },
  {
    id: 'tree-haskell-nnodos',
    title: 'nNodos in Haskell',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Count nodes using Haskell pattern matching.',
    conceptOverview: `In Haskell, we define trees with algebraic data types:
data Arbol a = AV | AB a (Arbol a) (Arbol a)

AV = empty tree (Arbol Vacío)
AB r i d = tree with root r, left subtree i, right subtree d

Pattern matching replaces if-else checks.`,
    codeWithComments: [
      { code: 'data Arbol a = AV | AB a (Arbol a) (Arbol a)', comment: 'Recursive type: AV=empty, AB=node with root and 2 subtrees' },
      { code: '', comment: '' },
      { code: 'nNodos :: Arbol a -> Int', comment: 'Type signature: takes tree, returns Int' },
      { code: 'nNodos AV = 0', comment: 'Pattern 1: empty tree → 0 nodes' },
      { code: 'nNodos (AB _ i d) = 1 + nNodos i + nNodos d', comment: 'Pattern 2: node → 1 + left + right (_ ignores root value)' }
    ],
    keyPoints: [
      'Pattern matching handles base case elegantly',
      '_ underscore ignores values we don\'t need',
      'No explicit if-else needed',
      'Type signature declares input and output types'
    ],
    relatedExercises: ['tree-nodos-haskell', 'tree-altura-haskell']
  },
  {
    id: 'tree-haskell-altura',
    title: 'altura in Haskell',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Calculate tree height using Haskell pattern matching.',
    conceptOverview: `Height calculation in functional style. Remember:
- max function gives the larger of two values
- 1 + max hi hd gives height including root level`,
    codeWithComments: [
      { code: 'altura :: Arbol a -> Int', comment: 'Type signature' },
      { code: 'altura AV = 0', comment: 'Empty tree has height 0' },
      { code: 'altura (AB _ i d) = 1 + max (altura i) (altura d)', comment: 'Height = 1 + max of children heights' }
    ],
    keyPoints: [
      'max is a built-in Haskell function',
      'Parentheses needed around function applications',
      'Same logic as Java version, cleaner syntax'
    ],
    relatedExercises: ['tree-altura-haskell']
  },
  {
    id: 'tree-haskell-height',
    title: 'height (General Tree Height)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Calculate the height of any binary tree (not just AVL).',
    conceptOverview: `The height function calculates the height of any binary tree.
This is the basic version that works on all trees, not just AVL-balanced ones.

Height = number of edges on the longest path from root to a leaf
(or equivalently: 1 + max of children heights)`,
    codeWithComments: [
      { code: '-- Tree type definition', comment: '' },
      { code: 'data Arbol a = AV', comment: 'AV = empty tree (Árbol Vacío)' },
      { code: '             | AB a (Arbol a) (Arbol a)', comment: 'AB = node with root, left subtree, right subtree' },
      { code: '             deriving (Show, Eq)', comment: 'For printing and comparing' },
      { code: '', comment: '' },
      { code: '-- Height of a (possibly non-AVL) tree', comment: '' },
      { code: 'height :: Arbol a -> Int', comment: 'Type: tree → integer' },
      { code: 'height AV = 0', comment: '📍 BASE: empty tree has height 0' },
      { code: 'height (AB _ i d) = 1 + max (height i) (height d)', comment: '🔄 RECURSIVE: 1 + max of subtree heights' }
    ],
    keyPoints: [
      'Uses built-in max function',
      'Empty tree (AV) has height 0',
      'Ignores root value with _ (only structure matters)',
      'Same as altura - this is the English version'
    ],
    relatedExercises: ['tree-altura-haskell', 'tree-heightAVL-haskell']
  },
  {
    id: 'tree-haskell-heightAVL',
    title: 'heightAVL (Height with AVL Check)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Calculate tree height, returning -1 if the tree is NOT AVL-balanced.',
    conceptOverview: `This function combines TWO tasks in one:
1. Calculate the height of the tree
2. Check if it's AVL-balanced (|left height - right height| ≤ 1 at every node)

If the tree is NOT AVL: returns -1
If the tree IS AVL: returns the actual height

💡 The trick: -1 propagates up! If any subtree returns -1, the whole tree returns -1.`,
    codeWithComments: [
      { code: 'data Arbol a = AV', comment: '' },
      { code: '             | AB a (Arbol a) (Arbol a)', comment: '' },
      { code: '             deriving (Show, Eq)', comment: '' },
      { code: '', comment: '' },
      { code: '-- Height of an AVL tree, or -1 if it is not AVL', comment: '' },
      { code: 'heightAVL :: Arbol a -> Int', comment: '' },
      { code: 'heightAVL AV = 0', comment: '📍 BASE: empty tree has height 0 (and is AVL)' },
      { code: 'heightAVL (AB _ i d) = aux (heightAVL i) (heightAVL d)', comment: '🔄 RECURSIVE: use aux to combine' },
      { code: '', comment: '' },
      { code: '-- Aux receives the heights of the left and right subtrees', comment: '' },
      { code: 'aux :: Int -> Int -> Int', comment: 'Takes two heights, returns combined result' },
      { code: 'aux x1 x2 =', comment: 'x1 = left height, x2 = right height' },
      { code: '  if (x1 == -1) || (x2 == -1) || (abs (x1 - x2) > 1)', comment: '❌ If either is -1 OR unbalanced at this node' },
      { code: '     then -1', comment: '→ Return -1 (not AVL)' },
      { code: '     else 1 + max x1 x2', comment: '✅ Otherwise return actual height' }
    ],
    keyPoints: [
      '-1 acts as a "not AVL" flag that propagates upward',
      'Three conditions trigger -1: left=-1, right=-1, or |diff|>1',
      'abs (x1 - x2) > 1 checks the AVL balance condition',
      'If valid: returns 1 + max (same as regular height)',
      'Clever: combines height calculation and AVL check in one pass!'
    ],
    relatedExercises: ['tree-height-avl', 'tree-esAVL-haskell']
  },
  {
    id: 'tree-haskell-fcNodes',
    title: 'fcNodes (Full-Complete Node Count)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Count nodes in a tree, returning negative if tree is NOT full and complete.',
    conceptOverview: `A Full-Complete tree has these properties:
• FULL: Every node has either 0 or 2 children (no single-child nodes)
• COMPLETE: All levels are fully filled, except possibly the last

This function returns:
• POSITIVE number = count of nodes (tree IS full-complete)
• NEGATIVE number = -(count of nodes) (tree is NOT full-complete)

💡 Similar pattern to heightAVL: use sign as a flag!`,
    codeWithComments: [
      { code: 'data Arbol a = AV', comment: '' },
      { code: '             | AB a (Arbol a) (Arbol a)', comment: '' },
      { code: '             deriving (Show, Eq)', comment: '' },
      { code: '', comment: '' },
      { code: '-- fcNodes: full-complete nodes count, negative if not full-complete', comment: '' },
      { code: 'fcNodes :: Arbol a -> Int', comment: '' },
      { code: 'fcNodes AV = 0', comment: '📍 BASE: empty tree has 0 nodes (and is valid)' },
      { code: 'fcNodes (AB _ i d) = aux (fcNodes i) (fcNodes d)', comment: '🔄 RECURSIVE: combine with aux' },
      { code: '', comment: '' },
      { code: 'aux :: Int -> Int -> Int', comment: '' },
      { code: 'aux x1 x2 =', comment: 'x1 = left count, x2 = right count' },
      { code: '  if (x1 < 0) || (x2 < 0) || (abs (x1 - x2) > 1)', comment: '❌ If either negative OR sizes too different' },
      { code: '     then -(abs x1 + abs x2 + 1)', comment: '→ Return NEGATIVE total (not full-complete)' },
      { code: '     else  x1 + x2 + 1', comment: '✅ Return POSITIVE total (is full-complete)' }
    ],
    keyPoints: [
      'Positive result = tree IS full-complete, value = node count',
      'Negative result = tree is NOT full-complete, |value| = node count',
      'abs (x1 - x2) > 1 checks if subtree sizes are too different',
      '+1 counts the current node',
      'Use abs when computing total to handle negative inputs'
    ],
    relatedExercises: ['tree-fcNodes-haskell', 'tree-isComplete-haskell']
  },
  {
    id: 'tree-haskell-maxAB-nomax',
    title: 'maxAB (Maximum WITHOUT using max)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the maximum element in a binary tree without using the built-in max function.',
    conceptOverview: `Find the maximum value in a GENERAL binary tree (not a BST!).
In a general tree, the maximum could be anywhere - root, leaves, or internal nodes.

⚠️ CONSTRAINT: Cannot use the built-in max function!
Instead, we implement our own aux function to compare values.

💡 KEY INSIGHT: Use pattern matching to handle all 4 cases:
1. Leaf (both children empty)
2. Only left child exists
3. Only right child exists
4. Both children exist`,
    codeWithComments: [
      { code: '-- Maximum in a binary tree WITHOUT using max', comment: '' },
      { code: 'maxAB :: (Ord a) => Arbol a -> a', comment: '(Ord a) means a must be comparable' },
      { code: 'maxAB (AB r AV AV) = r', comment: '🍃 LEAF: only the root, return it' },
      { code: 'maxAB (AB r i AV)  = aux r (maxAB i) r', comment: '◀️ LEFT ONLY: compare root with left max (r used as dummy for right)' },
      { code: 'maxAB (AB r AV d)  = aux r r (maxAB d)', comment: '▶️ RIGHT ONLY: compare root with right max (r used as dummy for left)' },
      { code: 'maxAB (AB r i d)   = aux r (maxAB i) (maxAB d)', comment: '◀️▶️ BOTH: compare root with both maxes' },
      { code: '', comment: '' },
      { code: '-- Auxiliary: max of THREE values (without using max)', comment: '' },
      { code: 'aux :: (Ord a) => a -> a -> a -> a', comment: '' },
      { code: 'aux x1 x2 x3 =', comment: 'x1 = root, x2 = left max, x3 = right max' },
      { code: '  if (x1 < x2) then', comment: 'Is root smaller than left max?' },
      { code: '      if (x2 < x3) then x3', comment: '  Yes: is left max smaller than right max? → right wins' },
      { code: '      else x2', comment: '  No: left max is biggest → left wins' },
      { code: '  else', comment: 'No: root ≥ left max' },
      { code: '      if (x1 < x3) then x3', comment: '  Is root smaller than right max? → right wins' },
      { code: '      else x1', comment: '  No: root is biggest → root wins' }
    ],
    keyPoints: [
      'Pattern matching handles all 4 cases elegantly',
      'aux compares THREE values without using max',
      'For single-child cases, use root as dummy for missing child',
      '(Ord a) constraint required for comparisons (<, >)',
      'This is for GENERAL trees, not BSTs!'
    ],
    relatedExercises: ['tree-maxAB-haskell', 'tree-maxAB-java']
  },
  {
    id: 'tree-haskell-maxAB-withmax',
    title: 'maxAB (Maximum WITH using max)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the maximum element in a binary tree using the built-in max function.',
    conceptOverview: `Same problem as before, but now we CAN use the built-in max function.
This makes the code cleaner and more readable.

Two versions provided:
1. Using built-in max
2. Using custom aux (for comparison)`,
    codeWithComments: [
      { code: '-- Tree type', comment: '' },
      { code: 'data Arbol a = AV', comment: '' },
      { code: '             | AB a (Arbol a) (Arbol a)', comment: '' },
      { code: '             deriving (Show, Eq)', comment: '' },
      { code: '', comment: '' },
      { code: '-- ═══════════════════════════════════════════════', comment: '' },
      { code: '-- VERSION 1: Using built-in max (allowed)', comment: '' },
      { code: '-- ═══════════════════════════════════════════════', comment: '' },
      { code: 'maxAB :: (Ord a) => Arbol a -> a', comment: '' },
      { code: 'maxAB (AB r AV AV) = r', comment: '🍃 LEAF: just return root' },
      { code: 'maxAB (AB r i AV)  = max r (maxAB i)', comment: '◀️ LEFT ONLY: max of root and left' },
      { code: 'maxAB (AB r AV d)  = max r (maxAB d)', comment: '▶️ RIGHT ONLY: max of root and right' },
      { code: 'maxAB (AB r i d)   = max r (max (maxAB i) (maxAB d))', comment: '◀️▶️ BOTH: max of root and both subtrees' },
      { code: '', comment: '' },
      { code: '-- ═══════════════════════════════════════════════', comment: '' },
      { code: '-- VERSION 2: Using custom aux (without max)', comment: '' },
      { code: '-- ═══════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '-- Auxiliary function: max of two', comment: '' },
      { code: 'aux :: (Ord a) => a -> a -> a', comment: '' },
      { code: 'aux x1 x2 = if x1 > x2 then x1 else x2', comment: 'Simple comparison' },
      { code: '', comment: '' },
      { code: '-- maxAB\' uses aux instead of max', comment: '' },
      { code: 'maxAB\' :: (Ord a) => Arbol a -> a', comment: '' },
      { code: 'maxAB\' (AB r AV AV) = r', comment: '' },
      { code: 'maxAB\' (AB r i AV)  = aux r (maxAB\' i)', comment: '' },
      { code: 'maxAB\' (AB r AV d)  = aux r (maxAB\' d)', comment: '' },
      { code: 'maxAB\' (AB r i d)   = aux r (aux (maxAB\' i) (maxAB\' d))', comment: 'Nested aux calls' }
    ],
    keyPoints: [
      'max r (maxAB i) is cleaner than manual comparisons',
      'Both versions produce the same result',
      'Version with max is preferred when allowed',
      'Version with aux shows understanding of the logic',
      'Both require (Ord a) constraint'
    ],
    relatedExercises: ['tree-maxAB-haskell']
  },
  {
    id: 'tree-haskell-maxST',
    title: 'maxST (Maximum in BST)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the maximum element in a Binary Search Tree efficiently.',
    conceptOverview: `In a BST (Binary Search Tree), values are ordered:
• Left subtree contains smaller values
• Right subtree contains larger values

This means the MAXIMUM is always in the rightmost node!
We just keep going right until we can't anymore.

⚡ EFFICIENT: O(h) where h = height, instead of O(n) for general trees.`,
    codeWithComments: [
      { code: 'maxST :: (Ord a) => Arbol a -> a', comment: 'Works on BST (Binary Search Tree)' },
      { code: 'maxST (AB r _ AV) = r', comment: '📍 BASE: no right child → THIS is the max!' },
      { code: 'maxST (AB _ _ d)  = maxST d', comment: '🔄 RECURSIVE: keep going right' }
    ],
    keyPoints: [
      'BST property: right subtree has larger values',
      'Maximum = rightmost node',
      'We ignore left subtree entirely (_)',
      'O(h) time complexity (h = height)',
      'Pattern (AB r _ AV) means "node with no right child"'
    ],
    relatedExercises: ['tree-maxST-haskell', 'tree-minST-haskell']
  },
  {
    id: 'tree-haskell-minST',
    title: 'minST (Minimum in BST)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the minimum element in a Binary Search Tree efficiently.',
    conceptOverview: `Mirror of maxST - in a BST, the MINIMUM is always in the leftmost node!
We just keep going left until we can't anymore.

⚡ EFFICIENT: O(h) where h = height.`,
    codeWithComments: [
      { code: 'minST :: (Ord a) => Arbol a -> a', comment: 'Works on BST (Binary Search Tree)' },
      { code: 'minST (AB r AV _) = r', comment: '📍 BASE: no left child → THIS is the min!' },
      { code: 'minST (AB _ i _)  = minST i', comment: '🔄 RECURSIVE: keep going left' }
    ],
    keyPoints: [
      'BST property: left subtree has smaller values',
      'Minimum = leftmost node',
      'We ignore right subtree entirely (_)',
      'Mirror of maxST',
      'O(h) time complexity'
    ],
    relatedExercises: ['tree-minST-haskell', 'tree-maxST-haskell']
  },
  {
    id: 'tree-haskell-maxleaf-bad',
    title: '⚠️ maxleaf (BAD Approach - Inefficient!)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the maximum leaf value - WARNING: This approach is INEFFICIENT!',
    conceptOverview: `🎯 GOAL: Find the maximum value among all LEAVES (nodes with no children).

⚠️ WARNING: This implementation is INEFFICIENT!
Look at the last pattern - it calls maxleaf FOUR times for the same subtrees!

maxleaf (AB r i d) = if (maxleaf i) > (maxleaf d)  -- 2 calls
                     then maxleaf i                  -- 1 more call!
                     else maxleaf d                  -- 1 more call!

This causes EXPONENTIAL time complexity! 😱
Each call spawns more calls, leading to massive redundant computation.`,
    codeWithComments: [
      { code: '-- ⚠️ BAD APPROACH - DO NOT USE IN PRODUCTION!', comment: '' },
      { code: 'maxleaf :: (Ord a) => Arbol a -> a', comment: '' },
      { code: 'maxleaf (AB r AV AV) = r', comment: '🍃 LEAF: return root value' },
      { code: 'maxleaf (AB r i AV)  = maxleaf i', comment: '◀️ LEFT ONLY: leaf must be in left subtree' },
      { code: 'maxleaf (AB r AV d)  = maxleaf d', comment: '▶️ RIGHT ONLY: leaf must be in right subtree' },
      { code: 'maxleaf (AB r i d)   = if (maxleaf i) > (maxleaf d)', comment: '❌ INEFFICIENT: calls maxleaf 2 times here...' },
      { code: '                       then maxleaf i', comment: '❌ ...and AGAIN here (3rd call)!' },
      { code: '                       else maxleaf d', comment: '❌ ...or AGAIN here (3rd call)!' }
    ],
    keyPoints: [
      '⚠️ EXPONENTIAL TIME COMPLEXITY - very slow!',
      'Problem: maxleaf i and maxleaf d are computed multiple times',
      'Each level of recursion doubles the work',
      'On a tree of height h, this does O(2^h) work instead of O(n)',
      '✅ SOLUTION: Use an auxiliary function (see maxleaf-good)'
    ],
    relatedExercises: ['tree-maxleaf-good-haskell']
  },
  {
    id: 'tree-haskell-maxleaf-good',
    title: '✅ maxleaf (GOOD Approach - With Auxiliary)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the maximum leaf value EFFICIENTLY using an auxiliary function.',
    conceptOverview: `🎯 GOAL: Find the maximum value among all LEAVES.

✅ EFFICIENT APPROACH: Use an auxiliary function!
Compute maxleaf i and maxleaf d ONCE, store results, then compare.

This gives us O(n) time complexity - each node visited once!`,
    codeWithComments: [
      { code: '-- ✅ GOOD APPROACH - Efficient with auxiliary function', comment: '' },
      { code: 'maxleaf :: (Ord a) => Arbol a -> a', comment: '' },
      { code: 'maxleaf (AB r AV AV) = r', comment: '🍃 LEAF: return root value' },
      { code: 'maxleaf (AB r i AV)  = maxleaf i', comment: '◀️ LEFT ONLY: recurse left' },
      { code: 'maxleaf (AB r AV d)  = maxleaf d', comment: '▶️ RIGHT ONLY: recurse right' },
      { code: 'maxleaf (AB r i d)   = aux (maxleaf i) (maxleaf d)', comment: '✅ EFFICIENT: call each subtree ONCE!' },
      { code: '', comment: '' },
      { code: '-- Helper that returns the maximum of two values', comment: '' },
      { code: 'aux :: (Ord a) => a -> a -> a', comment: '' },
      { code: 'aux x2 x3 =', comment: 'x2 = left max, x3 = right max' },
      { code: '  if (x2 >= x3)', comment: '' },
      { code: '    then x2', comment: '' },
      { code: '    else x3', comment: '' }
    ],
    keyPoints: [
      '✅ O(n) time complexity - each node visited once',
      'Key insight: compute recursive calls ONCE, store in aux parameters',
      'aux compares TWO values (left max vs right max)',
      'Same result as bad version, but MUCH faster',
      'This pattern applies to many tree problems!'
    ],
    relatedExercises: ['tree-maxleaf-java-high', 'tree-maxleaf-java-low']
  },

  // ============================================
  // GRAPH EXPLANATIONS
  // ============================================
  {
    id: 'graph-representations-explained',
    title: 'Different Ways for Representing Graphs',
    topic: 'graphs',
    language: 'java',
    mode: 'HYBRID',
    description: 'Compare BASIC, HYBRID, LOW, and HIGH level approaches for graph algorithms.',
    conceptOverview: `Graphs can be manipulated at different abstraction levels:

• BASIC LEVEL: The graph is simply its adjacency matrix (int[][])
  - Direct access to matrix values
  - No graph object, just the raw data structure
  - Methods receive the matrix as a parameter

• HYBRID LEVEL: The graph is a GNDE<E> object, methods are called
  - Work with graph object but use interface methods
  - Adyacentes(x) returns neighbors
  - Cleaner than basic, still uses graph-specific types

• LOW LEVEL: The graph is a GNDE<E> object, attributes are accessed directly
  - Access internal arrays: Nodos[], Adyacencias[][]
  - Manipulate internal state (Visitado flags)
  - Allows performance optimizations
  - Requires understanding of internal structure

• HIGH LEVEL: The graph implements a Grafo<E> interface
  - Most abstract and reusable
  - g.Nodos(), g.Adyacentes(x) - interface methods only
  - Works with ANY graph implementation
  - Best for generic algorithms`,
    codeWithComments: [
      { code: '// ========== BASIC LEVEL ==========', comment: 'Graph is just int[][] adjacency matrix' },
      { code: 'public static Lista<Integer> DEPTH_FIRST_traversal(int[][] g, int x){', comment: 'DFS receives matrix directly' },
      { code: '    Lista<Integer> traversal = new LD<>();', comment: 'Result list of visited nodes' },
      { code: '    Pila<Integer> pending = new PD<>();', comment: 'STACK for DFS (LIFO)' },
      { code: '    pending.APila(x);', comment: 'Push starting node' },
      { code: '    while (!pending.EsVacia()){', comment: 'While stack has nodes' },
      { code: '        int y = pending.Tope();', comment: 'Get top of stack' },
      { code: '        pending = pending.DesaPila();', comment: 'Pop from stack' },
      { code: '        if(!traversal.EstaContenido(y)){', comment: 'If not already visited' },
      { code: '            traversal.Add(y);', comment: 'Add to result' },
      { code: '            Lista<Integer> adj = Adjacents(y,g);', comment: 'Get neighbors from matrix' },
      { code: '            while (!adj.EsVacia()){', comment: 'Push all neighbors' },
      { code: '                pending.APila(adj.Cabeza());', comment: '' },
      { code: '                adj = adj.Cola();', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return Reverse(traversal);', comment: 'Return in correct order' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Auxiliary: Get neighbors from matrix', comment: '' },
      { code: 'public static Lista<Integer> Adjacents(int x, int[][] g) {', comment: '' },
      { code: '    Lista<Integer> adj = new LD<>();', comment: '' },
      { code: '    for (int i=0; i<g.length; i++)', comment: '' },
      { code: '        if (x!=i && g[x][i]==1) adj.Add(i);', comment: 'g[x][i]==1 means edge exists' },
      { code: '    return adj;', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ========== HYBRID LEVEL ==========', comment: 'Graph is GNDE<E> object, use methods' },
      { code: 'public Lista<E> BREADTH_FIRST_traversal(E x){', comment: 'BFS using graph methods' },
      { code: '    Lista<E> traversal = new LD<>();', comment: 'Result list' },
      { code: '    Cola<E> pending = new CD<>();', comment: 'QUEUE for BFS (FIFO)' },
      { code: '    pending.EnCola(x);', comment: 'Enqueue starting node' },
      { code: '    while (!pending.EsVacia()){', comment: 'While queue has nodes' },
      { code: '        E y = pending.Cabeza();', comment: 'Get front of queue' },
      { code: '        pending = pending.Resto();', comment: 'Dequeue' },
      { code: '        if(!traversal.EstaContenido(y)){', comment: 'If not visited' },
      { code: '            traversal.Add(y);', comment: 'Add to result' },
      { code: '            Lista<E> adj = Adyacentes(y);', comment: 'Use graph METHOD to get neighbors' },
      { code: '            while (!adj.EsVacia()){', comment: 'Enqueue all neighbors' },
      { code: '                pending.EnCola(adj.Cabeza());', comment: '' },
      { code: '                adj = adj.Cola();', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return Reverse(traversal);', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ========== LOW LEVEL ==========', comment: 'Access internal attributes directly' },
      { code: 'public void rebuild() {', comment: 'Rebuild graph structure (internal manipulation)' },
      { code: '    int i, j, free;', comment: '' },
      { code: '    if (numnodos == 0) return;', comment: 'Direct access to numnodos attribute' },
      { code: '    for (i=0; i<MAX_NODOS; i++)', comment: 'Reset adjacency matrix' },
      { code: '        for (j=0; j<MAX_NODOS; j++)', comment: '' },
      { code: '            if (i==j) Adyacencias[i][j]=true;', comment: 'Direct matrix access' },
      { code: '            else Adyacencias[i][j]=Adyacencias[j][i]=false;', comment: '' },
      { code: '    for(numnodos/=2, i=0, free=0; i<MAX_NODOS && free<numnodos; i++)', comment: 'Compact nodes array' },
      { code: '        if (Nodos[i]!=null) {Nodos[free]=Nodos[i]; free++;}', comment: 'Direct Nodos[] access' },
      { code: '    for(; free<MAX_NODOS; free++) Nodos[free]=null;', comment: 'Clear remaining slots' },
      { code: '    if (numnodos<2) return;', comment: '' },
      { code: '    for(i=0; i<(numnodos-1); i++)', comment: 'Create circular adjacencies' },
      { code: '        Adyacencias[i][i+1]=Adyacencias[i+1][i]=true;', comment: '' },
      { code: '    Adyacencias[i][0]=Adyacencias[0][i]=true;', comment: 'Close the circle' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ========== HIGH LEVEL ==========', comment: 'Generic: works with ANY Grafo<E>' },
      { code: 'public static <E> boolean IsConnected(Grafo<E> g) {', comment: 'Static method, interface parameter' },
      { code: '    Lista<E> nodes=g.Nodos();', comment: 'Use interface method' },
      { code: '    Lista<E> visited=new LD<E>(), pending=new LD<E>();', comment: '' },
      { code: '    int tovisit=nodes.Longitud();', comment: '' },
      { code: '    if (tovisit==0) return true;', comment: 'Empty graph is connected' },
      { code: '    try {', comment: '' },
      { code: '        pending.Add(nodes.Cabeza());', comment: 'Start from first node' },
      { code: '        while (!pending.EsVacia() && tovisit>0) {', comment: '' },
      { code: '            E x = pending.Cabeza();', comment: '' },
      { code: '            pending = pending.Cola();', comment: '' },
      { code: '            if (!visited.EstaContenido(x)) {', comment: '' },
      { code: '                visited.Add(x); tovisit--;', comment: '' },
      { code: '                pending.Concatena(g.Adyacentes(x));', comment: 'Interface method for neighbors' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { System.out.println(e); }', comment: '' },
      { code: '    return tovisit==0;', comment: 'Connected if all nodes visited' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'BASIC: Graph = int[][] matrix, pass as parameter, g[x][i]==1 checks edges',
      'HYBRID: Graph = GNDE<E> object, use methods like Adyacentes(x)',
      'LOW: Access internal attributes (Nodos[], Adyacencias[][], Visitado flags)',
      'HIGH: Work with Grafo<E> interface - most abstract and reusable',
      'DFS uses STACK (Pila), BFS uses QUEUE (Cola)',
      'Low level allows performance optimizations (Visitado flags vs list search)'
    ],
    relatedExercises: ['graph-accessible', 'graph-dfs', 'graph-bfs']
  },
  {
    id: 'graph-isconnected-levels-explained',
    title: 'IsConnected: High vs Low Level Comparison',
    topic: 'graphs',
    language: 'java',
    mode: 'HYBRID',
    description: 'Compare IsConnected implementations at HIGH and LOW levels showing how low-level access enables optimizations.',
    conceptOverview: `The IsConnected algorithm checks if all nodes in a graph can be reached from any starting node.

HIGH LEVEL approach:
- Uses Grafo<E> interface
- visited list uses EstaContenido() - O(n) lookup each time
- Clean, generic code that works with any graph implementation

LOW LEVEL approach (inside GNDE<E> class):
- Direct access to Nodos[] array and Adyacencias[][] matrix
- Uses Visitado flag in each node - O(1) lookup
- More efficient but tied to specific implementation
- Can skip null entries in Nodos[] array efficiently`,
    codeWithComments: [
      { code: '// ========== HIGH LEVEL VERSION ==========', comment: '' },
      { code: 'public static <E> boolean IsConnected(Grafo<E> g) {', comment: 'Works with ANY Grafo<E> implementation' },
      { code: '    Lista<E> nodes = g.Nodos();', comment: 'Get all nodes via interface' },
      { code: '    Lista<E> visited = new LD<E>();', comment: 'Track visited with a list' },
      { code: '    Lista<E> pending = new LD<E>();', comment: 'Pending nodes to process' },
      { code: '    int tovisit = nodes.Longitud();', comment: 'Count of nodes to visit' },
      { code: '    if (tovisit == 0) return true;', comment: 'Empty graph is connected' },
      { code: '    try {', comment: '' },
      { code: '        pending.Add(nodes.Cabeza());', comment: 'Start from any node' },
      { code: '        while (!pending.EsVacia() && tovisit > 0) {', comment: '' },
      { code: '            E x = pending.Cabeza();', comment: 'Get next pending node' },
      { code: '            pending = pending.Cola();', comment: 'Remove from pending' },
      { code: '            if (!visited.EstaContenido(x)) {', comment: 'O(n) check in list!' },
      { code: '                visited.Add(x);', comment: 'Add to visited list' },
      { code: '                tovisit--;', comment: 'Decrement counter' },
      { code: '                pending.Concatena(g.Adyacentes(x));', comment: 'Add all neighbors' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { System.out.println(e); }', comment: '' },
      { code: '    return tovisit == 0;', comment: 'All visited = connected' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ========== LOW LEVEL VERSION ==========', comment: 'Inside GNDE<E> class' },
      { code: 'public boolean IsConnected() {', comment: 'Instance method, not static' },
      { code: '    if (numnodos == 0) return true;', comment: 'Direct attribute access' },
      { code: '    Lista<Integer> pending = new LD<Integer>();', comment: 'Pending INDICES, not elements' },
      { code: '    int i, cont, x, tovisit = numnodos;', comment: '' },
      { code: '', comment: '' },
      { code: '    // Find first non-null node', comment: '' },
      { code: '    for (i = 0; Nodos[i] == null; i++);', comment: 'Direct Nodos[] access' },
      { code: '    pending.Add(i);', comment: 'Add its INDEX to pending' },
      { code: '', comment: '' },
      { code: '    // Reset all Visitado flags to false', comment: 'O(1) lookup preparation!' },
      { code: '    for (cont = numnodos; cont > 0; i++)', comment: '' },
      { code: '        if (Nodos[i] != null) {', comment: '' },
      { code: '            Nodos[i].Visitado = false;', comment: 'Direct flag access' },
      { code: '            cont--;', comment: '' },
      { code: '        }', comment: '' },
      { code: '', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        while (!pending.EsVacia() && tovisit > 0) {', comment: '' },
      { code: '            x = pending.Cabeza();', comment: 'Get index' },
      { code: '            pending = pending.Cola();', comment: '' },
      { code: '            if (!Nodos[x].Visitado) {', comment: 'O(1) flag check!' },
      { code: '                Nodos[x].Visitado = true;', comment: 'Set flag' },
      { code: '                tovisit--;', comment: '' },
      { code: '                // Find adjacent nodes', comment: '' },
      { code: '                for (i = 0, cont = numnodos; cont > 0; i++)', comment: 'Iterate indices' },
      { code: '                    if (Nodos[i] != null) {', comment: '' },
      { code: '                        cont--;', comment: '' },
      { code: '                        if (!Nodos[i].Visitado && Adyacencias[i][x])', comment: 'Check matrix + flag' },
      { code: '                            pending.Add(i);', comment: 'Add adjacent index' },
      { code: '                    }', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { System.out.println(e); }', comment: '' },
      { code: '    return tovisit == 0;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'HIGH: visited.EstaContenido(x) is O(n) - searches list each time',
      'LOW: Nodos[x].Visitado is O(1) - direct flag access',
      'LOW: Works with indices (int) not elements (E)',
      'LOW: Must handle null entries in Nodos[] array',
      'HIGH: Cleaner, generic, works with any graph implementation',
      'LOW: Faster but tied to GNDE<E> internal structure',
      'Same algorithm, different abstraction levels'
    ],
    relatedExercises: ['graph-accessible', 'graph-isconnected']
  },
  {
    id: 'graph-bfs-explained',
    title: 'BFS - Breadth First Search',
    topic: 'graphs',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Traverse a graph level by level using a queue.',
    conceptOverview: `BFS explores nodes in "waves" - first all neighbors of start, then neighbors of neighbors, etc.
Uses a QUEUE (FIFO): First In, First Out
- EnCola() → add to end of queue
- Cabeza() → see front element
- Resto() → queue without front element

Good for: shortest path in unweighted graphs, level-order traversal.`,
    codeWithComments: [
      { code: 'public static List<Integer> bfs(GNDE g, int inicio) {', comment: 'Returns list of nodes in BFS order' },
      { code: '    List<Integer> resultado = new ArrayList<>();', comment: 'Store visited nodes in order' },
      { code: '    boolean[] visitado = new boolean[g.nNodos];', comment: 'Track which nodes we\'ve seen' },
      { code: '    Cola<Integer> cola = new ColaDE<>();', comment: 'Queue for BFS traversal' },
      { code: '', comment: '' },
      { code: '    cola.EnCola(inicio);', comment: 'Start by enqueueing the starting node' },
      { code: '    visitado[inicio] = true;', comment: 'Mark it as visited BEFORE processing' },
      { code: '', comment: '' },
      { code: '    while (!cola.EsVacia()) {', comment: 'Continue while queue has nodes' },
      { code: '        int actual = cola.Cabeza();', comment: 'Get front of queue' },
      { code: '        cola = cola.Resto();', comment: 'Remove front from queue' },
      { code: '        resultado.add(actual);', comment: 'Add to result list' },
      { code: '', comment: '' },
      { code: '        for (int v = 0; v < g.nNodos; v++) {', comment: 'Check all possible neighbors' },
      { code: '            if (g.existeArista(actual, v) && !visitado[v]) {', comment: 'If edge exists AND not visited' },
      { code: '                cola.EnCola(v);', comment: 'Add neighbor to queue' },
      { code: '                visitado[v] = true;', comment: 'Mark as visited immediately' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return resultado;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'QUEUE gives level-order (breadth-first) traversal',
      'Mark visited WHEN enqueueing, not when processing',
      'BFS finds shortest path in unweighted graphs',
      'Time complexity: O(V + E)'
    ],
    relatedExercises: ['graph-accessible']
  },
  {
    id: 'graph-dfs-explained',
    title: 'DFS - Depth First Search',
    topic: 'graphs',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Explore as deep as possible before backtracking using a stack.',
    conceptOverview: `DFS goes as deep as possible down one path before backtracking.
Uses a STACK (LIFO): Last In, First Out
- APila() → push onto stack
- Tope() → see top element
- DesaPila() → stack without top

Can also be done with recursion (implicit stack).`,
    codeWithComments: [
      { code: 'public static List<Integer> dfs(GNDE g, int inicio) {', comment: 'Returns list of nodes in DFS order' },
      { code: '    List<Integer> resultado = new ArrayList<>();', comment: 'Store visited nodes' },
      { code: '    boolean[] visitado = new boolean[g.nNodos];', comment: 'Track visited nodes' },
      { code: '    Pila<Integer> pila = new PilaDE<>();', comment: 'Stack for DFS traversal' },
      { code: '', comment: '' },
      { code: '    pila.APila(inicio);', comment: 'Push starting node' },
      { code: '', comment: '' },
      { code: '    while (!pila.EsVacia()) {', comment: 'Continue while stack has nodes' },
      { code: '        int actual = pila.Tope();', comment: 'Get top of stack' },
      { code: '        pila = pila.DesaPila();', comment: 'Pop from stack' },
      { code: '', comment: '' },
      { code: '        if (!visitado[actual]) {', comment: 'Only process if not visited (check here for DFS)' },
      { code: '            visitado[actual] = true;', comment: 'Mark as visited' },
      { code: '            resultado.add(actual);', comment: 'Add to result' },
      { code: '', comment: '' },
      { code: '            for (int v = g.nNodos - 1; v >= 0; v--) {', comment: 'Add neighbors in reverse (optional: for order)' },
      { code: '                if (g.existeArista(actual, v) && !visitado[v]) {', comment: 'If edge exists and not visited' },
      { code: '                    pila.APila(v);', comment: 'Push neighbor onto stack' },
      { code: '                }', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return resultado;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'STACK gives depth-first traversal',
      'Check visited WHEN popping (can have duplicates in stack)',
      'Reverse loop order to visit lower-numbered neighbors first',
      'Can be implemented recursively without explicit stack'
    ],
    relatedExercises: ['graph-accessible']
  },
  {
    id: 'graph-dfs-recursive-explained',
    title: 'DFS Recursive Version',
    topic: 'graphs',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'DFS using recursion (implicit call stack).',
    conceptOverview: `Recursive DFS uses the call stack instead of an explicit stack.
Cleaner code but limited by stack size for very large graphs.`,
    codeWithComments: [
      { code: 'public static void dfsRecursivo(GNDE g, int v, boolean[] visitado, List<Integer> resultado) {', comment: 'Helper receives current node, visited array, result list' },
      { code: '    visitado[v] = true;', comment: 'Mark current node as visited' },
      { code: '    resultado.add(v);', comment: 'Add to result' },
      { code: '', comment: '' },
      { code: '    for (int u = 0; u < g.nNodos; u++) {', comment: 'Check all neighbors' },
      { code: '        if (g.existeArista(v, u) && !visitado[u]) {', comment: 'If edge exists and not visited' },
      { code: '            dfsRecursivo(g, u, visitado, resultado);', comment: 'Recursive call for neighbor' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Wrapper function:', comment: '' },
      { code: 'public static List<Integer> dfs(GNDE g, int inicio) {', comment: 'Main entry point' },
      { code: '    List<Integer> resultado = new ArrayList<>();', comment: '' },
      { code: '    boolean[] visitado = new boolean[g.nNodos];', comment: '' },
      { code: '    dfsRecursivo(g, inicio, visitado, resultado);', comment: 'Start recursion' },
      { code: '    return resultado;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Recursion = implicit stack',
      'Simpler code, same result',
      'Watch out for stack overflow on huge graphs',
      'visitado array prevents infinite recursion on cycles'
    ],
    relatedExercises: ['graph-accessible']
  },

  // ============================================
  // FLOYD-WARSHALL EXPLANATIONS
  // ============================================
  {
    id: 'floyd-warshall-explained',
    title: 'Floyd-Warshall Algorithm',
    topic: 'floyd',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'All-pairs shortest paths using dynamic programming.',
    conceptOverview: `Floyd-Warshall finds shortest paths between ALL pairs of vertices.
Key idea: For each intermediate vertex k, check if going through k gives a shorter path.

d[i][j] = shortest path from i to j
d[i][j] = min(d[i][j], d[i][k] + d[k][j])

Process: For k = 0 to n-1, update all i,j pairs.`,
    codeWithComments: [
      { code: 'public static int[][] floyd(int[][] dist) {', comment: 'dist = initial adjacency matrix with weights (∞ for no edge)' },
      { code: '    int n = dist.length;', comment: 'Number of vertices' },
      { code: '    int[][] d = new int[n][n];', comment: 'Create result matrix' },
      { code: '', comment: '' },
      { code: '    // Copy initial distances', comment: '' },
      { code: '    for (int i = 0; i < n; i++)', comment: '' },
      { code: '        for (int j = 0; j < n; j++)', comment: '' },
      { code: '            d[i][j] = dist[i][j];', comment: 'Start with direct edges' },
      { code: '', comment: '' },
      { code: '    // Main Floyd-Warshall loop', comment: '' },
      { code: '    for (int k = 0; k < n; k++) {', comment: 'k = intermediate vertex we consider' },
      { code: '        for (int i = 0; i < n; i++) {', comment: 'i = source vertex' },
      { code: '            for (int j = 0; j < n; j++) {', comment: 'j = destination vertex' },
      { code: '                if (d[i][k] != INF && d[k][j] != INF) {', comment: 'Only if path through k exists' },
      { code: '                    if (d[i][k] + d[k][j] < d[i][j]) {', comment: 'Is path through k shorter?' },
      { code: '                        d[i][j] = d[i][k] + d[k][j];', comment: 'Update with shorter path' },
      { code: '                    }', comment: '' },
      { code: '                }', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return d;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Triple nested loop: k (intermediate), i (source), j (dest)',
      'k loop MUST be outermost',
      'Check for infinity before adding to avoid overflow',
      'Time complexity: O(n³)',
      'After algorithm: d[i][i] < 0 means negative cycle through i'
    ],
    relatedExercises: ['floyd-cycle', 'floyd-transform']
  },
  {
    id: 'floyd-path-reconstruction',
    title: 'Floyd Path Reconstruction',
    topic: 'floyd',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Track predecessors to reconstruct actual paths.',
    conceptOverview: `To reconstruct the actual path (not just distance), we maintain a predecessor matrix.
pred[i][j] = the first vertex after i on the shortest path from i to j

When we update d[i][j] = d[i][k] + d[k][j], we set pred[i][j] = pred[i][k].`,
    codeWithComments: [
      { code: 'public static void floydWithPath(int[][] dist) {', comment: '' },
      { code: '    int n = dist.length;', comment: '' },
      { code: '    int[][] d = new int[n][n];', comment: 'Distance matrix' },
      { code: '    int[][] pred = new int[n][n];', comment: 'Predecessor matrix' },
      { code: '', comment: '' },
      { code: '    // Initialize', comment: '' },
      { code: '    for (int i = 0; i < n; i++) {', comment: '' },
      { code: '        for (int j = 0; j < n; j++) {', comment: '' },
      { code: '            d[i][j] = dist[i][j];', comment: '' },
      { code: '            if (dist[i][j] != INF && i != j) {', comment: 'If direct edge exists' },
      { code: '                pred[i][j] = j;', comment: 'First step on path i→j is j itself' },
      { code: '            } else {', comment: '' },
      { code: '                pred[i][j] = -1;', comment: 'No direct path' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    for (int k = 0; k < n; k++) {', comment: '' },
      { code: '        for (int i = 0; i < n; i++) {', comment: '' },
      { code: '            for (int j = 0; j < n; j++) {', comment: '' },
      { code: '                if (d[i][k] + d[k][j] < d[i][j]) {', comment: '' },
      { code: '                    d[i][j] = d[i][k] + d[k][j];', comment: '' },
      { code: '                    pred[i][j] = pred[i][k];', comment: 'Path now goes through k, so first step is toward k' },
      { code: '                }', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Reconstruct path from i to j:', comment: '' },
      { code: 'public static List<Integer> getPath(int[][] pred, int i, int j) {', comment: '' },
      { code: '    List<Integer> path = new ArrayList<>();', comment: '' },
      { code: '    path.add(i);', comment: 'Start at source' },
      { code: '    while (i != j) {', comment: 'While not at destination' },
      { code: '        i = pred[i][j];', comment: 'Move to next vertex on path' },
      { code: '        path.add(i);', comment: 'Add to path' },
      { code: '    }', comment: '' },
      { code: '    return path;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'pred[i][j] stores next hop, not previous node',
      'When path updates through k, first step becomes step toward k',
      'Path reconstruction follows pred pointers until reaching destination',
      'Useful for actually finding the route, not just distance'
    ],
    relatedExercises: ['floyd-cycle']
  },

  // ============================================
  // HUFFMAN EXPLANATIONS
  // ============================================
  {
    id: 'huffman-build-explained',
    title: 'Building a Huffman Tree',
    topic: 'huffman',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Construct an optimal prefix-free code tree from symbol frequencies.',
    conceptOverview: `Huffman coding creates variable-length codes where frequent symbols get shorter codes.

Algorithm:
1. Create a leaf node for each symbol with its frequency
2. Put all nodes in a priority queue (min-heap by frequency)
3. While more than one node remains:
   - Remove two nodes with smallest frequencies
   - Create parent node with sum of frequencies
   - Add parent back to queue
4. Remaining node is the root`,
    codeWithComments: [
      { code: 'public static ArbolHuffman construir(Lista<HuffmanSymbol> simbolos) {', comment: 'Input: list of symbols with frequencies' },
      { code: '    // Create initial forest of single-node trees', comment: '' },
      { code: '    Lista<ArbolHuffman> bosque = new ListaDE<>();', comment: 'Forest = list of trees' },
      { code: '', comment: '' },
      { code: '    for (HuffmanSymbol s : simbolos) {', comment: 'For each symbol' },
      { code: '        ArbolHuffman hoja = new ArbolHuffman(s.simbolo, s.frecuencia);', comment: 'Create leaf node' },
      { code: '        insertarOrdenado(bosque, hoja);', comment: 'Insert maintaining sorted order by frequency' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // Merge until one tree remains', comment: '' },
      { code: '    while (tamaño(bosque) > 1) {', comment: 'While forest has more than 1 tree' },
      { code: '        ArbolHuffman t1 = bosque.Cabeza();', comment: 'Get first tree (smallest freq)' },
      { code: '        bosque = bosque.Cola();', comment: 'Remove it' },
      { code: '        ArbolHuffman t2 = bosque.Cabeza();', comment: 'Get second tree (next smallest)' },
      { code: '        bosque = bosque.Cola();', comment: 'Remove it' },
      { code: '', comment: '' },
      { code: '        int pesoNuevo = t1.peso() + t2.peso();', comment: 'New node weight = sum' },
      { code: '        ArbolHuffman nuevo = new ArbolHuffman(t1, t2, pesoNuevo);', comment: 'Create parent node' },
      { code: '        insertarOrdenado(bosque, nuevo);', comment: 'Insert back in sorted order' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    return bosque.Cabeza();', comment: 'Return the final tree' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Greedy algorithm: always merge two smallest',
      'Sorted list acts as priority queue',
      'Final tree has symbols at leaves only',
      'Path from root determines code (left=0, right=1)'
    ],
    relatedExercises: ['huffman-insert', 'huffman-code']
  },
  {
    id: 'huffman-insert-sorted',
    title: 'Insert into Sorted Huffman List',
    topic: 'huffman',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Maintain sorted order when inserting a new Huffman tree.',
    conceptOverview: `Insertion into a sorted list (by frequency):
- If list is empty, just add
- If new tree's weight ≤ first element, insert at front
- Otherwise, recursively insert into rest of list`,
    codeWithComments: [
      { code: 'public static Lista<ArbolHuffman> insertar(ArbolHuffman t, Lista<ArbolHuffman> lista) {', comment: '' },
      { code: '    if (lista.EsVacia()) {', comment: 'BASE CASE: empty list' },
      { code: '        Lista<ArbolHuffman> nueva = new ListaDE<>();', comment: 'Create new list' },
      { code: '        nueva.Add(t);', comment: 'Add the tree' },
      { code: '        return nueva;', comment: '' },
      { code: '    } else if (t.peso() <= lista.Cabeza().peso()) {', comment: 'Insert at front if smaller or equal' },
      { code: '        Lista<ArbolHuffman> nueva = new ListaDE<>();', comment: '' },
      { code: '        nueva.Add(t);', comment: 'Add new tree first' },
      { code: '        // Then add rest of list', comment: '' },
      { code: '        return concatenar(nueva, lista);', comment: '' },
      { code: '    } else {', comment: 'Need to insert further in' },
      { code: '        ArbolHuffman cabeza = lista.Cabeza();', comment: 'Keep first element' },
      { code: '        Lista<ArbolHuffman> resto = insertar(t, lista.Cola());', comment: 'Recursively insert into rest' },
      { code: '        resto.AddInicio(cabeza);', comment: 'Put first element back' },
      { code: '        return resto;', comment: '' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Compare weights using .peso() method',
      'Maintain sorted order for greedy algorithm',
      '≤ ensures stable ordering',
      'Recursive approach matches high-level style'
    ],
    relatedExercises: ['huffman-insert']
  },
  {
    id: 'huffman-codigo-haskell',
    title: 'Huffman Code in Haskell',
    topic: 'huffman',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the binary code for a symbol in a Huffman tree.',
    conceptOverview: `In Haskell, Huffman trees are defined as:
data Huffman = Hoja Char Float | Nodo Float Huffman Huffman

To find a symbol's code, traverse the tree:
- At a Hoja: if symbol matches, return ""
- At a Nodo: try left with "0", then right with "1"`,
    codeWithComments: [
      { code: 'data Huffman = Hoja Char Float | Nodo Float Huffman Huffman', comment: 'Leaf has symbol and freq, Node has freq and two children' },
      { code: '', comment: '' },
      { code: 'codigo :: Char -> Huffman -> Maybe String', comment: 'Returns Maybe because symbol might not exist' },
      { code: 'codigo c (Hoja s _)', comment: 'At a leaf' },
      { code: '    | c == s    = Just ""', comment: 'Found it! Empty code (we\'ll prepend 0s and 1s on way back)' },
      { code: '    | otherwise = Nothing', comment: 'Wrong symbol, not found here' },
      { code: 'codigo c (Nodo _ i d) =', comment: 'At an internal node' },
      { code: '    case codigo c i of', comment: 'Try left subtree first' },
      { code: '        Just cod -> Just (\'0\' : cod)', comment: 'Found in left, prepend 0' },
      { code: '        Nothing  -> case codigo c d of', comment: 'Not in left, try right' },
      { code: '            Just cod -> Just (\'1\' : cod)', comment: 'Found in right, prepend 1' },
      { code: '            Nothing  -> Nothing', comment: 'Not found anywhere' }
    ],
    keyPoints: [
      'Maybe type handles "not found" case',
      'Prepend 0 for left, 1 for right',
      'Code is built backwards (deepest first)',
      'Pattern matching on Hoja/Nodo replaces if-else'
    ],
    relatedExercises: ['huffman-code']
  },

  // ============================================
  // LIST/QUEUE/STACK EXPLANATIONS
  // ============================================
  {
    id: 'list-highlow-difference',
    title: 'High Level vs Low Level: Lists',
    topic: 'lists',
    language: 'java',
    mode: 'HYBRID',
    description: 'Understanding the two modes using list operations.',
    conceptOverview: `HIGH_LEVEL uses abstract interface:
- Cabeza() → first element
- Cola() → list without first element
- EsVacia() → check if empty
- Add() → add element

LOW_LEVEL uses node pointers:
- NodoCabeza → pointer to first node
- .Info → data in node
- .Siguiente → next node pointer`,
    codeWithComments: [
      { code: '// HIGH_LEVEL: Length of list', comment: '' },
      { code: 'public static <E> int longitud(Lista<E> l) {', comment: '' },
      { code: '    if (l.EsVacia()) return 0;', comment: 'Empty list has length 0' },
      { code: '    return 1 + longitud(l.Cola());', comment: '1 + length of rest' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// LOW_LEVEL: Length of list', comment: '' },
      { code: 'public static <E> int longitud(LDE<E> l) {', comment: 'LDE = Lista Dinámica Enlazada' },
      { code: '    return longitudAux(l.NodoCabeza);', comment: 'Call helper with first node' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: 'private static <E> int longitudAux(Nodo<E> n) {', comment: '' },
      { code: '    if (n == null) return 0;', comment: 'Null means end of list' },
      { code: '    return 1 + longitudAux(n.Siguiente);', comment: '1 + length from next node' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'High Level: work with list as abstraction',
      'Low Level: work with individual nodes',
      'Same algorithm, different syntax',
      'Low Level needs helper for node traversal'
    ],
    relatedExercises: ['list-mix21']
  },
  {
    id: 'queue-explained',
    title: 'Queue Operations (FIFO)',
    topic: 'queues',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'First In, First Out structure operations.',
    conceptOverview: `A Queue follows FIFO: elements leave in the order they arrived.
- EnCola(x) → add x at the end
- Cabeza() → see first element (next to leave)
- Resto() → queue without first element
- EsVacia() → check if empty

Think of it like a line at a store.`,
    codeWithComments: [
      { code: '// Example: Process elements in arrival order', comment: '' },
      { code: 'public static void procesar(Cola<Integer> c) {', comment: '' },
      { code: '    while (!c.EsVacia()) {', comment: 'While queue has elements' },
      { code: '        int primero = c.Cabeza();', comment: 'Get first element' },
      { code: '        System.out.println(primero);', comment: 'Process it' },
      { code: '        c = c.Resto();', comment: 'Move to next (remove first)' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Example: Reverse a queue using a stack', comment: '' },
      { code: 'public static Cola<Integer> reverse(Cola<Integer> c) {', comment: '' },
      { code: '    Pila<Integer> aux = new PilaDE<>();', comment: 'Helper stack' },
      { code: '    while (!c.EsVacia()) {', comment: 'Move all to stack' },
      { code: '        aux.APila(c.Cabeza());', comment: '' },
      { code: '        c = c.Resto();', comment: '' },
      { code: '    }', comment: '' },
      { code: '    Cola<Integer> resultado = new ColaDE<>();', comment: '' },
      { code: '    while (!aux.EsVacia()) {', comment: 'Move all back to queue' },
      { code: '        resultado.EnCola(aux.Tope());', comment: 'Comes out reversed!' },
      { code: '        aux = aux.DesaPila();', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return resultado;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'FIFO: First In, First Out',
      'Used in BFS, level-order traversal',
      'EnCola adds at end, Resto removes from front',
      'Reverse queue with a stack (LIFO reverses order)'
    ],
    relatedExercises: ['queue-reverse-low']
  },
  {
    id: 'stack-explained',
    title: 'Stack Operations (LIFO)',
    topic: 'stacks',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Last In, First Out structure operations.',
    conceptOverview: `A Stack follows LIFO: most recent element leaves first.
- APila(x) → push x onto top
- Tope() → see top element
- DesaPila() → stack without top element
- EsVacia() → check if empty

Think of it like a stack of plates.`,
    codeWithComments: [
      { code: '// Example: Reverse a string using a stack', comment: '' },
      { code: 'public static String reverse(String s) {', comment: '' },
      { code: '    Pila<Character> pila = new PilaDE<>();', comment: '' },
      { code: '    for (char c : s.toCharArray()) {', comment: 'Push each character' },
      { code: '        pila.APila(c);', comment: '' },
      { code: '    }', comment: '' },
      { code: '    StringBuilder result = new StringBuilder();', comment: '' },
      { code: '    while (!pila.EsVacia()) {', comment: 'Pop each character' },
      { code: '        result.append(pila.Tope());', comment: 'Comes out reversed!' },
      { code: '        pila = pila.DesaPila();', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return result.toString();', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'LIFO: Last In, First Out',
      'Used in DFS, recursion simulation, expression evaluation',
      'APila = push, DesaPila = pop, Tope = peek',
      'Natural for reversing sequences'
    ],
    relatedExercises: ['stack-eval-rpn']
  },

  // ============================================
  // PRACTICE PROBLEMS BY PROFESSOR GINÉS
  // ============================================
  {
    id: 'practice-4-floyd-paths',
    title: '📚 Practice 4: Floyd Algorithm with Path Reconstruction',
    topic: 'floyd',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Complete Floyd-Warshall implementation that builds actual paths (as lists) while computing shortest distances. Created by Professor Ginés.',
    conceptOverview: `🎯 PRACTICE 4 - Floyd's Algorithm for Weighted Graphs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 By Professor Ginés | More info: http://en.wikipedia.org/wiki/Floyd-Warshall_algorithm

🔑 THE KEY INSIGHT:
Unlike the standard Floyd algorithm that only computes DISTANCES, this practice
requires you to BUILD THE ACTUAL PATHS as lists while updating distances!

📋 WHAT YOU'RE GIVEN:
• Vertices numbered 0, 1, 2, ..., n-1
• Adjacency matrix adj[i][j] with edge weights (Integer.MAX_VALUE = no edge)
• This is a DIRECTED graph (matrix may not be symmetric)

📋 WHAT YOU MUST RETURN:
• A matrix path[i][j] where each cell contains a LISTA<Integer> representing
  the complete path from i to j
• Empty list = no path exists
• The adj matrix is MODIFIED to contain final shortest distances

💡 THE ALGORITHM STEP BY STEP:

STEP 1: INITIALIZATION
─────────────────────
For each pair (i,j):
• If there's a direct edge (adj[i][j] ≠ ∞ and i ≠ j):
  → path[i][j] = list containing just (i, j)
• Otherwise:
  → path[i][j] = empty list

STEP 2: THE TRIPLE LOOP (k, i, j)
─────────────────────────────────
For each intermediate vertex k = 0, 1, ..., n-1:
  For each source i = 0, 1, ..., n-1:
    For each destination j = 0, 1, ..., n-1:
      
      Check: Can we improve path from i to j by going through k?
      
      IF adj[i][k] + adj[k][j] < adj[i][j] THEN:
        1. Update distance: adj[i][j] = adj[i][k] + adj[k][j]
        2. Update path: path[i][j] = CONCATENATION of path[i][k] and path[k][j]
           (But remove duplicate k!)

⚠️ CRITICAL DETAILS:

1. OVERFLOW PROTECTION:
   Before adding: check that adj[i][k] ≠ ∞ AND adj[k][j] ≠ ∞
   Otherwise Integer.MAX_VALUE + anything = negative number!

2. PATH CONCATENATION:
   When merging path[i][k] and path[k][j], node k appears at the END of 
   path[i][k] and at the START of path[k][j] - you must avoid duplicating it!
   
   Solution: Clone path[i][k], then concatenate the TAIL of path[k][j]
   
3. DIAGONAL = 0:
   adj[i][i] = 0 (distance from node to itself is 0)
   path[i][i] remains empty (no path needed)`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// PRACTICE 4 SOLUTION - Floyd with Path Building', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static Lista<Integer>[][] Floyd(int[][] adj) {', comment: '📥 Input: adjacency matrix with weights' },
      { code: '    int n = adj.length;', comment: 'Number of vertices' },
      { code: '    Lista<Integer>[][] path = new LD[n][n];', comment: '📤 Output: matrix of path lists' },
      { code: '', comment: '' },
      { code: '    // ─────────────────────────────────────────────', comment: '' },
      { code: '    // STEP 1: INITIALIZE THE PATH MATRIX', comment: '' },
      { code: '    // ─────────────────────────────────────────────', comment: '' },
      { code: '    for (int i = 0; i < n; i++) {', comment: '🔄 For each source vertex' },
      { code: '        for (int j = 0; j < n; j++) {', comment: '🔄 For each destination vertex' },
      { code: '            path[i][j] = new LD<>();', comment: '📝 Create empty list' },
      { code: '            if (i != j && adj[i][j] != Integer.MAX_VALUE) {', comment: '✅ If direct edge exists (not diagonal, not ∞)' },
      { code: '                path[i][j].Add(i);', comment: '📍 Add source to path' },
      { code: '                path[i][j].Add(j);', comment: '📍 Add destination to path → Initial path is (i, j)' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // ─────────────────────────────────────────────', comment: '' },
      { code: '    // STEP 2: THE FLOYD TRIPLE LOOP', comment: '' },
      { code: '    // ─────────────────────────────────────────────', comment: '' },
      { code: '    for (int k = 0; k < n; k++) {', comment: '🔑 k = intermediate vertex (MUST be outermost!)' },
      { code: '        for (int i = 0; i < n; i++) {', comment: '📤 i = source vertex' },
      { code: '            for (int j = 0; j < n; j++) {', comment: '📥 j = destination vertex' },
      { code: '', comment: '' },
      { code: '                // 🛡️ Overflow protection: check paths exist', comment: '' },
      { code: '                if (adj[i][k] != Integer.MAX_VALUE &&', comment: 'Path i→k exists?' },
      { code: '                    adj[k][j] != Integer.MAX_VALUE) {', comment: 'Path k→j exists?' },
      { code: '', comment: '' },
      { code: '                    // 🔍 Is going through k better?', comment: '' },
      { code: '                    if (adj[i][k] + adj[k][j] < adj[i][j]) {', comment: '📊 Compare: current vs through k' },
      { code: '', comment: '' },
      { code: '                        // ✅ YES! Update the distance', comment: '' },
      { code: '                        adj[i][j] = adj[i][k] + adj[k][j];', comment: '📝 New shorter distance' },
      { code: '', comment: '' },
      { code: '                        // ✅ Build the new path by concatenation', comment: '' },
      { code: '                        path[i][j] = (Lista<Integer>) path[i][k].clone();', comment: '📋 Clone path i→k' },
      { code: '                        try {', comment: '' },
      { code: '                            path[i][j].Concatena(path[k][j].Cola());', comment: '➕ Concatenate TAIL of k→j (skip k to avoid duplicate!)' },
      { code: '                        } catch (TADVacioException e) {', comment: '' },
      { code: '                            // path[k][j] only had one element', comment: '' },
      { code: '                        }', comment: '' },
      { code: '                    }', comment: '' },
      { code: '                }', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    return path;', comment: '🎯 Return matrix of all shortest paths!' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// TEST EXAMPLE (copy & paste to test!)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'int I = Integer.MAX_VALUE;  // ∞ = no edge', comment: '' },
      { code: '', comment: '' },
      { code: 'int[][] a = {', comment: '6x6 directed weighted graph' },
      { code: '    { 0, 2,20, 4, I, I},', comment: 'From node 0' },
      { code: '    { I, 0, I, 2, 6, I},', comment: 'From node 1' },
      { code: '    {15, I, 0, I, 2, I},', comment: 'From node 2' },
      { code: '    { I, 3, I, 0, I, 2},', comment: 'From node 3' },
      { code: '    { I, 9, I, I, 0, 3},', comment: 'From node 4' },
      { code: '    { I, 4, I, 0, I, 0}', comment: 'From node 5' },
      { code: '};', comment: '' },
      { code: '', comment: '' },
      { code: '// Expected output includes:', comment: '' },
      { code: '// Path from 0 to 4: (0, 1, 4) distance = 8', comment: '0→1 (2) + 1→4 (6) = 8' },
      { code: '// Path from 2 to 1: (2, 4, 5, 3, 1) distance = 8', comment: 'Complex path!' }
    ],
    keyPoints: [
      '🔑 k loop MUST be outermost - this is the core of Floyd\'s algorithm',
      '🛡️ Always check for Integer.MAX_VALUE before adding to prevent overflow',
      '📋 Use clone() to copy paths, then Concatena() with Cola() to avoid duplicate k',
      '📊 adj matrix is modified in-place to contain final shortest distances',
      '📝 Empty list means no path exists between those vertices',
      '⏱️ Time complexity: O(n³) for distances, path building adds overhead',
      '🎯 This builds paths AS you compute distances - not separately!'
    ],
    relatedExercises: ['floyd-cycle', 'floyd-transform']
  },
  {
    id: 'practice-3-huffman-coding',
    title: '📚 Practice 3: Huffman Coding Tree',
    topic: 'huffman',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Build a Huffman tree from a sorted list of symbol frequencies using the greedy algorithm. Created by Professor Ginés.',
    conceptOverview: `🎯 PRACTICE 3 - Huffman Coding Tree Construction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 By Professor Ginés | More info: http://en.wikipedia.org/wiki/Huffman_coding

🔑 WHAT IS HUFFMAN CODING?
Huffman coding is a compression technique that assigns VARIABLE-LENGTH binary
codes to symbols based on their frequency:
• Frequent symbols → SHORT codes
• Rare symbols → LONG codes

This minimizes the total number of bits needed to encode a message!

📋 THE DATA STRUCTURES:

1. Symbol Tree (ABD<Integer>):
   Each symbol is stored as a tree where:
   • Root = frequency (percentage)
   • Left child = ASCII code of the character
   • Right child = empty
   
   Example for 'a' with 12% frequency:
         12          ← frequency
        /  \\
       97   ∅        ← 97 = ASCII of 'a'

2. Sorted List of Trees (Lista<ABD<Integer>>):
   Trees are sorted by frequency in ASCENDING order
   [smallest, ..., largest]

🎯 THE HUFFMAN ALGORITHM:

STEP 1: Start with sorted list of symbol trees
STEP 2: While list has more than 1 tree:
   a) Remove the TWO smallest trees (first two in sorted list)
   b) Create a NEW tree with:
      - Root = sum of their frequencies
      - Left child = first tree
      - Right child = second tree
   c) INSERT this new tree in the CORRECT position (keep sorted!)
STEP 3: Return the single remaining tree

💡 WHY INSERT IN CORRECT POSITION?
The new combined tree might NOT belong at the front!
If we combined trees with frequencies 8 and 12 (= 20), and the next
tree in the list has frequency 15, we must insert AFTER the 15!

📊 VISUAL EXAMPLE:

Initial: [d:8, a:12, c:15, e:25, b:40]

Step 1: Combine d(8) + a(12) = 20
        Insert 20 between 15 and 25
        → [c:15, (d+a):20, e:25, b:40]

Step 2: Combine c(15) + (d+a)(20) = 35
        Insert 35 between 25 and 40
        → [e:25, (c+d+a):35, b:40]

Step 3: Combine e(25) + (c+d+a)(35) = 60
        Insert 60 after 40
        → [b:40, (e+c+d+a):60]

Step 4: Combine b(40) + (e+c+d+a)(60) = 100
        → [final tree with root 100]

⚠️ CRITICAL: The INSERT function must maintain sorted order!`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// PRACTICE 3 SOLUTION - Huffman Tree Construction', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '// ─────────────────────────────────────────────', comment: '' },
      { code: '// METHOD 1: INSERT - Maintain sorted order', comment: '' },
      { code: '// ─────────────────────────────────────────────', comment: '' },
      { code: '', comment: '' },
      { code: 'public static Lista<ABD<Integer>> insert(ABD<Integer> x,', comment: '📥 x = tree to insert' },
      { code: '                                         Lista<ABD<Integer>> y)', comment: '📥 y = sorted list of trees' },
      { code: '    throws TADVacioException', comment: '' },
      { code: '{', comment: '' },
      { code: '    // 🔹 BASE CASE 1: Empty list', comment: '' },
      { code: '    if (y.EsVacia()) {', comment: '📋 List is empty?' },
      { code: '        y.Add(x);', comment: '✅ Just add the tree' },
      { code: '    }', comment: '' },
      { code: '    // 🔹 BASE CASE 2: x belongs at the front', comment: '' },
      { code: '    else if (x.Raiz() <= y.Cabeza().Raiz()) {', comment: '📊 x.frequency ≤ first element?' },
      { code: '        y.Add(x);', comment: '✅ Add at front (Add adds to head!)' },
      { code: '    }', comment: '' },
      { code: '    // 🔹 RECURSIVE CASE: x belongs further in the list', comment: '' },
      { code: '    else {', comment: '🔄 x.frequency > first element' },
      { code: '        ABD<Integer> c = y.Cabeza();', comment: '💾 Save the first element' },
      { code: '        y = y.Cola();', comment: '➡️ Move to rest of list' },
      { code: '        y = insert(x, y);', comment: '🔄 Recursively insert x into rest' },
      { code: '        y.Add(c);', comment: '⬅️ Put first element back at front' },
      { code: '    }', comment: '' },
      { code: '    return y;', comment: '📤 Return modified list' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ─────────────────────────────────────────────', comment: '' },
      { code: '// METHOD 2: HUFFMAN TREE - Main algorithm', comment: '' },
      { code: '// ─────────────────────────────────────────────', comment: '' },
      { code: '', comment: '' },
      { code: 'public static ABD<Integer> huffmanTree(Lista<ABD<Integer>> x) {', comment: '📥 x = sorted list of symbol trees' },
      { code: '    ABD<Integer> sol = new ABD<Integer>();', comment: '📤 Will hold final tree' },
      { code: '    ABD<Integer> ABD;', comment: '🔧 Temporary for new combined tree' },
      { code: '', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        // 🔄 Loop while list has MORE than 1 tree', comment: '' },
      { code: '        while (!x.Cola().EsVacia()) {', comment: '📊 x.Cola().EsVacia() = only 1 element left' },
      { code: '', comment: '' },
      { code: '            // 📋 Get the two smallest trees', comment: '' },
      { code: '            ABD<Integer> first = x.Cabeza();', comment: '🥇 Smallest frequency' },
      { code: '            ABD<Integer> second = x.Cola().Cabeza();', comment: '🥈 Second smallest' },
      { code: '', comment: '' },
      { code: '            // 🌳 Create new combined tree', comment: '' },
      { code: '            int newFreq = first.Raiz() + second.Raiz();', comment: '➕ Sum of frequencies' },
      { code: '            ABD = new ABD<Integer>(newFreq, first, second);', comment: '🌳 New tree: root=sum, children=the two trees' },
      { code: '', comment: '' },
      { code: '            // ✂️ Remove the two trees we just combined', comment: '' },
      { code: '            x = x.Cola().Cola();', comment: '➡️ Skip first two elements' },
      { code: '', comment: '' },
      { code: '            // 📍 Insert new tree in correct sorted position', comment: '' },
      { code: '            x = insert(ABD, x);', comment: '🎯 Maintain sorted order!' },
      { code: '        }', comment: '' },
      { code: '', comment: '' },
      { code: '        // 🎯 Only one tree remains - that\'s our Huffman tree!', comment: '' },
      { code: '        sol = x.Cabeza();', comment: '📤 Get the final tree' },
      { code: '', comment: '' },
      { code: '    } catch (TADVacioException ex) {', comment: '' },
      { code: '        ex.printStackTrace();', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    return sol;', comment: '🌳 Return the Huffman tree!' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// EQUIVALENT HASKELL CODE (for reference)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '-- data Arbol a = AV | AB a (Arbol a) (Arbol a)', comment: 'Tree type definition' },
      { code: '', comment: '' },
      { code: '-- ins :: [Arbol Int] -> Arbol Int -> [Arbol Int]', comment: 'Insert into sorted list' },
      { code: '-- ins [] a = [a]', comment: 'Empty list → just add' },
      { code: '-- ins (h:t) a = if ((raiz a) > (raiz h))', comment: 'Compare roots' },
      { code: '--               then h:(ins t a)', comment: 'Keep h, insert into tail' },
      { code: '--               else (a:h:t)', comment: 'a goes first' },
      { code: '', comment: '' },
      { code: '-- huffmanTree :: [Arbol Int] -> Arbol Int', comment: 'Main algorithm' },
      { code: '-- huffmanTree [] = AV', comment: 'Empty → empty tree' },
      { code: '-- huffmanTree [a] = a', comment: 'One tree → return it' },
      { code: '-- huffmanTree (a1:a2:l) =', comment: 'Two or more trees' },
      { code: '--     huffmanTree (ins l (AB ((raiz a1)+(raiz a2)) a1 a2))', comment: 'Combine & recurse' },
      { code: '', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// TEST EXAMPLE (copy & paste to test!)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '// Create symbol trees: ABD(frequency, ABD(asciiCode), empty)', comment: '' },
      { code: 'ABD<Integer> a = new ABD<Integer>(12,', comment: '\'a\' with 12%' },
      { code: '    new ABD<Integer>((int)\'a\'), new ABD<Integer>());', comment: '' },
      { code: 'ABD<Integer> b = new ABD<Integer>(40,', comment: '\'b\' with 40%' },
      { code: '    new ABD<Integer>((int)\'b\'), new ABD<Integer>());', comment: '' },
      { code: 'ABD<Integer> c = new ABD<Integer>(15,', comment: '\'c\' with 15%' },
      { code: '    new ABD<Integer>((int)\'c\'), new ABD<Integer>());', comment: '' },
      { code: 'ABD<Integer> d = new ABD<Integer>(8,', comment: '\'d\' with 8%' },
      { code: '    new ABD<Integer>((int)\'d\'), new ABD<Integer>());', comment: '' },
      { code: 'ABD<Integer> e = new ABD<Integer>(25,', comment: '\'e\' with 25%' },
      { code: '    new ABD<Integer>((int)\'e\'), new ABD<Integer>());', comment: '' },
      { code: '', comment: '' },
      { code: '// Create sorted list: d(8), a(12), c(15), e(25), b(40)', comment: '' },
      { code: 'Lista<ABD<Integer>> la = new LD<ABD<Integer>>();', comment: '' },
      { code: 'la.Add(b); la.Add(e); la.Add(c); la.Add(a); la.Add(d);', comment: 'Add in reverse (Add adds to head)' },
      { code: '', comment: '' },
      { code: '// Build Huffman tree', comment: '' },
      { code: 'System.out.println(huffmanTree(la));', comment: '' },
      { code: '', comment: '' },
      { code: '// Expected: Tree with root 100', comment: '' },
      { code: '//           \'b\' (40) is one child', comment: 'Most frequent = shortest code' },
      { code: '//           Subtree of 60 is the other child', comment: '' }
    ],
    keyPoints: [
      '🎯 GREEDY algorithm: always combine the two smallest trees',
      '📊 List MUST stay sorted - use insert() to maintain order',
      '🔄 insert() is RECURSIVE: compare, then either add at front or recurse',
      '⚠️ Add() in Lista adds at HEAD, not tail!',
      '📋 x.Cola().EsVacia() checks if list has exactly 1 element',
      '🌳 New tree root = sum of children\'s roots (frequencies)',
      '🔢 Higher frequency → closer to root → shorter binary code',
      '✨ Haskell version is more elegant but same algorithm!'
    ],
    relatedExercises: ['huffman-insert', 'huffman-code', 'huffman-decode']
  },

  // ============================================
  // ISCONNECTED VARIATIONS
  // ============================================
  {
    id: 'graph-isconnected-report-all',
    title: 'IsConnected: Report All Nodes if Connected',
    topic: 'graphs',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Check if graph is connected - if TRUE, report all nodes; if FALSE, report only visited nodes.',
    conceptOverview: `🎯 GOAL: Determine if a graph is connected, with useful feedback:

✅ IF CONNECTED (true):
   → Return list of ALL nodes (they were all visited)
   
❌ IF NOT CONNECTED (false):
   → Return list of only the nodes we COULD reach
   → This shows one "component" of the disconnected graph

💡 KEY INSIGHT: Start from any node and do a traversal.
If we visit all nodes → connected.
If we don't → not connected, and visited list shows reachable component.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// IsConnected with Node Reporting', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E> Lista<E> isConnectedReport(Grafo<E> g) {', comment: '📤 Returns list of visited nodes' },
      { code: '    Lista<E> nodes = g.Nodos();', comment: '📋 Get all nodes in graph' },
      { code: '    Lista<E> visited = new LD<E>();', comment: '📝 Track visited nodes' },
      { code: '    Lista<E> pending = new LD<E>();', comment: '📥 Nodes to process' },
      { code: '    int totalNodes = nodes.Longitud();', comment: '📊 Total count' },
      { code: '', comment: '' },
      { code: '    if (totalNodes == 0) return visited;', comment: '🔹 Empty graph: return empty list' },
      { code: '', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        pending.Add(nodes.Cabeza());', comment: '🚀 Start from first node' },
      { code: '', comment: '' },
      { code: '        while (!pending.EsVacia()) {', comment: '🔄 BFS/DFS loop' },
      { code: '            E x = pending.Cabeza();', comment: '' },
      { code: '            pending = pending.Cola();', comment: '' },
      { code: '', comment: '' },
      { code: '            if (!visited.EstaContenido(x)) {', comment: '❓ Not visited yet?' },
      { code: '                visited.Add(x);', comment: '✅ Mark as visited' },
      { code: '                pending.Concatena(g.Adyacentes(x));', comment: '➕ Add neighbors' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { }', comment: '' },
      { code: '', comment: '' },
      { code: '    // Check result', comment: '' },
      { code: '    if (visited.Longitud() == totalNodes) {', comment: '✅ All nodes visited?' },
      { code: '        System.out.println("CONNECTED! All " + totalNodes + " nodes reachable.");', comment: '' },
      { code: '    } else {', comment: '❌ Not all nodes visited' },
      { code: '        System.out.println("NOT CONNECTED! Only " + visited.Longitud() + " of " + totalNodes + " nodes reachable.");', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    return visited;', comment: '📤 Return visited nodes (all if connected, partial if not)' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '✅ Connected: visited.Longitud() == totalNodes',
      '❌ Not connected: visited list shows one component only',
      '📊 Can use DFS (stack) or BFS (queue) - same result',
      '💡 The returned list is useful for debugging',
      '🔍 To find other components: start from an unvisited node'
    ],
    relatedExercises: ['graph-isconnected', 'graph-components']
  },
  {
    id: 'graph-isconnected-components',
    title: 'IsConnected: Report Components (Left/Right)',
    topic: 'graphs',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'If disconnected, report one component. Also find largest/smallest component.',
    conceptOverview: `🎯 GOAL: When graph is NOT connected, report useful information:

Option 1: Return ONE component (the one containing first node)
Option 2: Return the LARGEST component
Option 3: Return the SMALLEST component
Option 4: Return ALL components as a list of lists

💡 A COMPONENT is a maximal set of nodes that are all connected to each other.
A disconnected graph has 2 or more components.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// Find ALL Components in a Graph', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E> Lista<Lista<E>> findAllComponents(Grafo<E> g) {', comment: '📤 Returns list of components' },
      { code: '    Lista<Lista<E>> components = new LD<>();', comment: '📋 All components' },
      { code: '    Lista<E> allNodes = g.Nodos();', comment: '📋 All nodes' },
      { code: '    Lista<E> globalVisited = new LD<>();', comment: '📝 Nodes assigned to some component' },
      { code: '', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        while (!allNodes.EsVacia()) {', comment: '🔄 Process all nodes' },
      { code: '            E start = allNodes.Cabeza();', comment: '📍 Get a starting node' },
      { code: '            allNodes = allNodes.Cola();', comment: '' },
      { code: '', comment: '' },
      { code: '            if (!globalVisited.EstaContenido(start)) {', comment: '❓ Not yet in any component?' },
      { code: '                // 🆕 Start a new component from this node', comment: '' },
      { code: '                Lista<E> component = bfsComponent(g, start);', comment: '🔍 Find all reachable nodes' },
      { code: '                components.Add(component);', comment: '➕ Add to components list' },
      { code: '                globalVisited.Concatena(component);', comment: '✅ Mark all as visited globally' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { }', comment: '' },
      { code: '', comment: '' },
      { code: '    return components;', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// Helper: BFS to find one component', comment: '' },
      { code: 'private static <E> Lista<E> bfsComponent(Grafo<E> g, E start) {', comment: '' },
      { code: '    Lista<E> visited = new LD<>();', comment: '' },
      { code: '    Lista<E> pending = new LD<>();', comment: '' },
      { code: '    pending.Add(start);', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        while (!pending.EsVacia()) {', comment: '' },
      { code: '            E x = pending.Cabeza();', comment: '' },
      { code: '            pending = pending.Cola();', comment: '' },
      { code: '            if (!visited.EstaContenido(x)) {', comment: '' },
      { code: '                visited.Add(x);', comment: '' },
      { code: '                pending.Concatena(g.Adyacentes(x));', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { }', comment: '' },
      { code: '    return visited;', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// Find LARGEST or SMALLEST Component', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E> Lista<E> findLargestComponent(Grafo<E> g) {', comment: '' },
      { code: '    Lista<Lista<E>> components = findAllComponents(g);', comment: '📋 Get all components' },
      { code: '    Lista<E> largest = new LD<>();', comment: '' },
      { code: '    int maxSize = 0;', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        while (!components.EsVacia()) {', comment: '' },
      { code: '            Lista<E> comp = components.Cabeza();', comment: '' },
      { code: '            components = components.Cola();', comment: '' },
      { code: '            if (comp.Longitud() > maxSize) {', comment: '📊 Bigger than current max?' },
      { code: '                maxSize = comp.Longitud();', comment: '' },
      { code: '                largest = comp;', comment: '✅ Update largest' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { }', comment: '' },
      { code: '    return largest;', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E> Lista<E> findSmallestComponent(Grafo<E> g) {', comment: '' },
      { code: '    Lista<Lista<E>> components = findAllComponents(g);', comment: '' },
      { code: '    Lista<E> smallest = new LD<>();', comment: '' },
      { code: '    int minSize = Integer.MAX_VALUE;', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        while (!components.EsVacia()) {', comment: '' },
      { code: '            Lista<E> comp = components.Cabeza();', comment: '' },
      { code: '            components = components.Cola();', comment: '' },
      { code: '            if (comp.Longitud() < minSize) {', comment: '📊 Smaller than current min?' },
      { code: '                minSize = comp.Longitud();', comment: '' },
      { code: '                smallest = comp;', comment: '✅ Update smallest' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { }', comment: '' },
      { code: '    return smallest;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '🔍 findAllComponents: finds every connected component',
      '📊 findLargestComponent: returns component with most nodes',
      '📉 findSmallestComponent: returns component with fewest nodes',
      '💡 Key insight: keep global visited to not re-explore nodes',
      '🔄 For each unvisited node, start new BFS/DFS to find its component',
      '📋 Number of components = how many times we start new traversal'
    ],
    relatedExercises: ['graph-components', 'graph-isconnected']
  },
  {
    id: 'graph-isconnected-dfs-bfs',
    title: 'IsConnected with DFS vs BFS',
    topic: 'graphs',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Compare DFS (stack) and BFS (queue) approaches for connectivity checking.',
    conceptOverview: `🎯 Both DFS and BFS can check connectivity - they just explore in different orders:

📚 BFS (Breadth-First Search):
   → Uses a QUEUE (Cola)
   → Explores level by level
   → Good for finding shortest paths
   
📚 DFS (Depth-First Search):
   → Uses a STACK (Pila)
   → Goes as deep as possible first
   → Good for detecting cycles, topological sort
   
🔑 For connectivity: BOTH give same answer (connected or not)
   The difference is the ORDER of visited nodes.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// IsConnected using BFS (Queue)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E> boolean isConnectedBFS(Grafo<E> g) {', comment: '' },
      { code: '    Lista<E> nodes = g.Nodos();', comment: '' },
      { code: '    Lista<E> visited = new LD<>();', comment: '' },
      { code: '    Cola<E> pending = new CD<>();', comment: '📦 QUEUE for BFS!' },
      { code: '    int totalNodes = nodes.Longitud();', comment: '' },
      { code: '', comment: '' },
      { code: '    if (totalNodes == 0) return true;', comment: '' },
      { code: '', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        pending.EnCola(nodes.Cabeza());', comment: '📥 Enqueue start node' },
      { code: '', comment: '' },
      { code: '        while (!pending.EsVacia()) {', comment: '' },
      { code: '            E x = pending.Cabeza();', comment: '📤 Dequeue front' },
      { code: '            pending = pending.Resto();', comment: '' },
      { code: '', comment: '' },
      { code: '            if (!visited.EstaContenido(x)) {', comment: '' },
      { code: '                visited.Add(x);', comment: '' },
      { code: '                Lista<E> adj = g.Adyacentes(x);', comment: '' },
      { code: '                while (!adj.EsVacia()) {', comment: '' },
      { code: '                    pending.EnCola(adj.Cabeza());', comment: '📥 Enqueue neighbors' },
      { code: '                    adj = adj.Cola();', comment: '' },
      { code: '                }', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { }', comment: '' },
      { code: '', comment: '' },
      { code: '    return visited.Longitud() == totalNodes;', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// IsConnected using DFS (Stack)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E> boolean isConnectedDFS(Grafo<E> g) {', comment: '' },
      { code: '    Lista<E> nodes = g.Nodos();', comment: '' },
      { code: '    Lista<E> visited = new LD<>();', comment: '' },
      { code: '    Pila<E> pending = new PD<>();', comment: '📚 STACK for DFS!' },
      { code: '    int totalNodes = nodes.Longitud();', comment: '' },
      { code: '', comment: '' },
      { code: '    if (totalNodes == 0) return true;', comment: '' },
      { code: '', comment: '' },
      { code: '    try {', comment: '' },
      { code: '        pending.APila(nodes.Cabeza());', comment: '📥 Push start node' },
      { code: '', comment: '' },
      { code: '        while (!pending.EsVacia()) {', comment: '' },
      { code: '            E x = pending.Tope();', comment: '📤 Pop top' },
      { code: '            pending = pending.DesaPila();', comment: '' },
      { code: '', comment: '' },
      { code: '            if (!visited.EstaContenido(x)) {', comment: '' },
      { code: '                visited.Add(x);', comment: '' },
      { code: '                Lista<E> adj = g.Adyacentes(x);', comment: '' },
      { code: '                while (!adj.EsVacia()) {', comment: '' },
      { code: '                    pending.APila(adj.Cabeza());', comment: '📥 Push neighbors' },
      { code: '                    adj = adj.Cola();', comment: '' },
      { code: '                }', comment: '' },
      { code: '            }', comment: '' },
      { code: '        }', comment: '' },
      { code: '    } catch (TADVacioException e) { }', comment: '' },
      { code: '', comment: '' },
      { code: '    return visited.Longitud() == totalNodes;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '📦 BFS: Cola (Queue) → EnCola, Cabeza, Resto',
      '📚 DFS: Pila (Stack) → APila, Tope, DesaPila',
      '✅ Both return SAME connectivity answer',
      '🔄 Visit order is different (levels vs depth)',
      '💡 Choose based on what else you need (shortest path? use BFS)'
    ],
    relatedExercises: ['graph-bfs', 'graph-dfs', 'graph-isconnected']
  },

  // ============================================
  // BST INSERT OPERATIONS
  // ============================================
  {
    id: 'bst-insert-haskell',
    title: 'BST Insert - Haskell',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Insert a new element into a Binary Search Tree maintaining BST property.',
    conceptOverview: `🎯 BST Property: For every node:
• All values in LEFT subtree are SMALLER
• All values in RIGHT subtree are LARGER

📍 To INSERT a new value:
1. If tree is empty → create new leaf with the value
2. If value < root → insert into LEFT subtree
3. If value > root → insert into RIGHT subtree
4. If value = root → (duplicate handling - can ignore or replace)

💡 Insertion always creates a new LEAF at the appropriate position.`,
    codeWithComments: [
      { code: '-- Tree type definition', comment: '' },
      { code: 'data Arbol a = AV | AB a (Arbol a) (Arbol a)', comment: '' },
      { code: '             deriving (Show, Eq)', comment: '' },
      { code: '', comment: '' },
      { code: '-- Insert into BST', comment: '' },
      { code: 'insertBST :: (Ord a) => a -> Arbol a -> Arbol a', comment: 'Takes value and tree, returns new tree' },
      { code: 'insertBST x AV = AB x AV AV', comment: '📍 BASE: Empty tree → new leaf' },
      { code: 'insertBST x (AB r i d)', comment: '🔄 RECURSIVE: Compare with root' },
      { code: '    | x < r     = AB r (insertBST x i) d', comment: '◀️ Smaller: go LEFT, keep right unchanged' },
      { code: '    | x > r     = AB r i (insertBST x d)', comment: '▶️ Larger: go RIGHT, keep left unchanged' },
      { code: '    | otherwise = AB r i d', comment: '🔹 Equal: ignore duplicate (or could replace)' },
      { code: '', comment: '' },
      { code: '-- Example usage:', comment: '' },
      { code: '-- insertBST 5 AV', comment: '→ AB 5 AV AV' },
      { code: '-- insertBST 3 (AB 5 AV AV)', comment: '→ AB 5 (AB 3 AV AV) AV' },
      { code: '-- insertBST 7 (AB 5 (AB 3 AV AV) AV)', comment: '→ AB 5 (AB 3 AV AV) (AB 7 AV AV)' }
    ],
    keyPoints: [
      '🌿 New elements always become LEAVES',
      '🔄 Recursively descend until finding empty spot',
      '📊 Uses guards (|) for elegant comparison',
      '⚠️ Duplicate handling: this version ignores duplicates',
      '✅ BST property maintained automatically'
    ],
    relatedExercises: ['bst-insert-java-high', 'bst-search-haskell']
  },
  {
    id: 'bst-insert-java-high',
    title: 'BST Insert - Java HIGH LEVEL',
    topic: 'trees',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Insert a new element into a BST using interface methods.',
    conceptOverview: `🎯 Same algorithm as Haskell, but using Java interface methods:
• EsVacio() → check if tree is empty
• Raiz() → get root value
• SubArbolIzqdo(), SubArbolDcho() → get subtrees

⚠️ In HIGH_LEVEL, we typically return a NEW tree (immutable style)
or modify through interface methods.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// BST Insert - HIGH LEVEL', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: '' },
      { code: 'ArbolBinarioE<E> insertBST(E x, ArbolBinarioE<E> a) throws TADVacioException {', comment: '' },
      { code: '', comment: '' },
      { code: '    // 📍 BASE CASE: Empty tree → create new node', comment: '' },
      { code: '    if (a.EsVacio()) {', comment: '' },
      { code: '        return new ABD<E>(x, new ABD<E>(), new ABD<E>());', comment: '🌿 New leaf with x' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    E root = a.Raiz();', comment: '📊 Get root value' },
      { code: '    int cmp = x.compareTo(root);', comment: '🔍 Compare: negative(<), zero(=), positive(>)' },
      { code: '', comment: '' },
      { code: '    if (cmp < 0) {', comment: '◀️ x < root: insert left' },
      { code: '        ArbolBinarioE<E> newLeft = insertBST(x, a.SubArbolIzqdo());', comment: '' },
      { code: '        return new ABD<E>(root, newLeft, a.SubArbolDcho());', comment: '🔧 Rebuild with new left' },
      { code: '    } else if (cmp > 0) {', comment: '▶️ x > root: insert right' },
      { code: '        ArbolBinarioE<E> newRight = insertBST(x, a.SubArbolDcho());', comment: '' },
      { code: '        return new ABD<E>(root, a.SubArbolIzqdo(), newRight);', comment: '🔧 Rebuild with new right' },
      { code: '    } else {', comment: '🔹 x == root: duplicate' },
      { code: '        return a;', comment: '📤 Return unchanged tree' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '🔧 Creates NEW tree nodes on the path to insertion point',
      '📊 compareTo() returns: negative, zero, or positive',
      '🌿 Empty tree becomes new leaf: ABD(x, empty, empty)',
      '⚠️ This is IMMUTABLE style - original tree unchanged',
      '✅ Works with any Comparable type'
    ],
    relatedExercises: ['bst-insert-java-low', 'bst-insert-haskell']
  },
  {
    id: 'bst-insert-java-low',
    title: 'BST Insert - Java LOW LEVEL (In-Place)',
    topic: 'trees',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Insert into BST by directly modifying node pointers.',
    conceptOverview: `🎯 LOW LEVEL approach: Modify the tree IN-PLACE
• Access .NodoRaiz to get root node
• Access .iz and .de to navigate
• Create new NodoArbol and link it

⚡ More efficient than HIGH_LEVEL (no tree reconstruction)
but modifies the original tree.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// BST Insert - LOW LEVEL (In-Place Modification)', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: '' },
      { code: 'void insertBST(E x, ABDE<E> a) {', comment: '⚠️ Returns void - modifies tree directly!' },
      { code: '', comment: '' },
      { code: '    // 📍 CASE 1: Empty tree', comment: '' },
      { code: '    if (a.NodoRaiz == null) {', comment: '' },
      { code: '        a.NodoRaiz = new NodoArbol<E>(x);', comment: '🌿 Create root node' },
      { code: '        return;', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // 🔄 Navigate to insertion point', comment: '' },
      { code: '    NodoArbol<E> current = a.NodoRaiz;', comment: '' },
      { code: '    NodoArbol<E> parent = null;', comment: '📍 Track parent for linking' },
      { code: '    boolean goLeft = false;', comment: '' },
      { code: '', comment: '' },
      { code: '    while (current != null) {', comment: '🔄 Find insertion spot' },
      { code: '        int cmp = x.compareTo(current.info);', comment: '' },
      { code: '        parent = current;', comment: '📍 Save parent' },
      { code: '', comment: '' },
      { code: '        if (cmp < 0) {', comment: '◀️ Go left' },
      { code: '            current = current.iz;', comment: '' },
      { code: '            goLeft = true;', comment: '' },
      { code: '        } else if (cmp > 0) {', comment: '▶️ Go right' },
      { code: '            current = current.de;', comment: '' },
      { code: '            goLeft = false;', comment: '' },
      { code: '        } else {', comment: '🔹 Duplicate found' },
      { code: '            return;', comment: '📤 Do nothing' },
      { code: '        }', comment: '' },
      { code: '    }', comment: '' },
      { code: '', comment: '' },
      { code: '    // 🔗 Create and link new node', comment: '' },
      { code: '    NodoArbol<E> newNode = new NodoArbol<E>(x);', comment: '' },
      { code: '    if (goLeft) {', comment: '' },
      { code: '        parent.iz = newNode;', comment: '◀️ Link as left child' },
      { code: '    } else {', comment: '' },
      { code: '        parent.de = newNode;', comment: '▶️ Link as right child' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '⚡ ITERATIVE version (no recursion) - more efficient',
      '📍 Track parent to know where to link new node',
      '🔗 Directly assign .iz or .de pointer',
      '⚠️ Modifies original tree (void return)',
      '🔄 While loop finds the null spot for insertion'
    ],
    relatedExercises: ['bst-insert-java-high', 'bst-search-java-low']
  },

  // ============================================
  // HEAP OPERATIONS
  // ============================================
  {
    id: 'heap-isheap-haskell',
    title: 'isHeap - Check if Tree is a Heap (Haskell)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Check if a binary tree satisfies the heap property.',
    conceptOverview: `🎯 HEAP PROPERTY (Max-Heap):
Every node's value is ≥ the values of ALL its descendants.
In other words: parent ≥ children for every node.

📍 To check if a tree is a heap:
1. Empty tree → YES (trivially a heap)
2. Leaf → YES (no children to compare)
3. Internal node → root ≥ max of children AND both subtrees are heaps

💡 For MIN-HEAP: Just change ≥ to ≤`,
    codeWithComments: [
      { code: '-- Tree type', comment: '' },
      { code: 'data Arbol a = AV | AB a (Arbol a) (Arbol a)', comment: '' },
      { code: '             deriving (Show, Eq)', comment: '' },
      { code: '', comment: '' },
      { code: '-- Check if tree is a MAX-HEAP', comment: '' },
      { code: 'isHeap :: (Ord a) => Arbol a -> Bool', comment: '' },
      { code: 'isHeap AV = True', comment: '📍 Empty tree is a heap' },
      { code: 'isHeap (AB r AV AV) = True', comment: '🍃 Leaf is a heap' },
      { code: 'isHeap (AB r i AV) =', comment: '◀️ Only left child' },
      { code: '    r >= raiz i && isHeap i', comment: '  root ≥ left child AND left is heap' },
      { code: 'isHeap (AB r AV d) =', comment: '▶️ Only right child' },
      { code: '    r >= raiz d && isHeap d', comment: '  root ≥ right child AND right is heap' },
      { code: 'isHeap (AB r i d) =', comment: '◀️▶️ Both children' },
      { code: '    r >= raiz i && r >= raiz d &&', comment: '  root ≥ both children' },
      { code: '    isHeap i && isHeap d', comment: '  AND both subtrees are heaps' },
      { code: '', comment: '' },
      { code: '-- Helper: get root value', comment: '' },
      { code: 'raiz :: Arbol a -> a', comment: '' },
      { code: 'raiz (AB r _ _) = r', comment: '' },
      { code: '', comment: '' },
      { code: '-- Alternative: cleaner version with guards', comment: '' },
      { code: 'isHeap\' :: (Ord a) => Arbol a -> Bool', comment: '' },
      { code: 'isHeap\' AV = True', comment: '' },
      { code: 'isHeap\' (AB r i d) = checkChildren r i d && isHeap\' i && isHeap\' d', comment: '' },
      { code: '', comment: '' },
      { code: 'checkChildren :: (Ord a) => a -> Arbol a -> Arbol a -> Bool', comment: '' },
      { code: 'checkChildren r AV AV = True', comment: '' },
      { code: 'checkChildren r i AV = r >= raiz i', comment: '' },
      { code: 'checkChildren r AV d = r >= raiz d', comment: '' },
      { code: 'checkChildren r i d = r >= raiz i && r >= raiz d', comment: '' }
    ],
    keyPoints: [
      '📊 Max-Heap: parent ≥ children at every node',
      '📉 Min-Heap: change ≥ to ≤',
      '🔄 Recursive: check current node AND subtrees',
      '⚠️ Don\'t forget to check BOTH conditions: root≥children AND subtrees are heaps',
      '🍃 Leaves and empty trees are trivially heaps'
    ],
    relatedExercises: ['heap-isheap-java', 'heap-insert', 'heap-removemax']
  },
  {
    id: 'heap-getmax',
    title: 'Heap: Get Maximum (Just Return Root!)',
    topic: 'trees',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'In a Max-Heap, the maximum element is always at the root.',
    conceptOverview: `🎯 FINDING MAX IN A HEAP:

The answer is trivial: THE ROOT!

In a Max-Heap, by definition:
• The root is ≥ all its descendants
• Therefore, the root is the MAXIMUM element

⚡ Time complexity: O(1) - just return the root!

💡 This is why heaps are used in Priority Queues:
   Getting the highest priority element is instant.`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// Get Maximum from a Max-Heap - It\'s just the root!', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '// HIGH LEVEL version', comment: '' },
      { code: 'public static <E> E getMax(ArbolBinarioE<E> heap) throws TADVacioException {', comment: '' },
      { code: '    if (heap.EsVacio()) {', comment: '' },
      { code: '        throw new TADVacioException("Heap is empty!");', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return heap.Raiz();', comment: '🎯 That\'s it! Just return the root!' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// LOW LEVEL version', comment: '' },
      { code: 'public static <E> E getMax(ABDE<E> heap) {', comment: '' },
      { code: '    if (heap.NodoRaiz == null) {', comment: '' },
      { code: '        return null;', comment: '' },
      { code: '    }', comment: '' },
      { code: '    return heap.NodoRaiz.info;', comment: '🎯 Return root\'s value!' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '-- Haskell version', comment: '' },
      { code: 'getMax :: Arbol a -> a', comment: '' },
      { code: 'getMax (AB r _ _) = r', comment: '🎯 Pattern match and return root!' }
    ],
    keyPoints: [
      '🎯 Maximum is ALWAYS at the root in a Max-Heap',
      '⚡ O(1) time complexity - instant access!',
      '📊 This is why Priority Queues use heaps',
      '⚠️ Don\'t forget to handle empty heap case',
      '💡 For Min-Heap, root gives the MINIMUM'
    ],
    relatedExercises: ['heap-removemax', 'heap-insert']
  },
  {
    id: 'heap-removemax-mixheap',
    title: 'Heap: Remove Max using mixHeap',
    topic: 'trees',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Remove the maximum element from a heap using the mixHeap operation.',
    conceptOverview: `🎯 REMOVING MAX FROM A HEAP:

The max is at the root, but we can't just delete it!
We need to maintain the heap structure.

💡 KEY INSIGHT: Use mixHeap!

mixHeap(h1, h2) merges two heaps into one valid heap.

To remove max:
1. Get left subtree (h1) and right subtree (h2)
2. Return mixHeap(h1, h2)
3. The result is a valid heap without the old root!

🔄 mixHeap works by:
• Comparing roots of h1 and h2
• Larger root becomes new root
• Recursively merge the other heap with subtree`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// Remove Max from Heap using mixHeap', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '// Remove max = merge left and right subtrees', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: '' },
      { code: 'ArbolBinarioE<E> removeMax(ArbolBinarioE<E> heap) throws TADVacioException {', comment: '' },
      { code: '    if (heap.EsVacio()) {', comment: '' },
      { code: '        return heap;', comment: '📤 Empty heap: nothing to remove' },
      { code: '    }', comment: '' },
      { code: '    // 🔀 Merge left and right subtrees!', comment: '' },
      { code: '    return mixHeap(heap.SubArbolIzqdo(), heap.SubArbolDcho());', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// mixHeap - Merge two heaps into one', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: 'public static <E extends Comparable<E>>', comment: '' },
      { code: 'ArbolBinarioE<E> mixHeap(ArbolBinarioE<E> h1, ArbolBinarioE<E> h2)', comment: '' },
      { code: '    throws TADVacioException {', comment: '' },
      { code: '', comment: '' },
      { code: '    // 📍 BASE CASES', comment: '' },
      { code: '    if (h1.EsVacio()) return h2;', comment: '🔹 h1 empty: return h2' },
      { code: '    if (h2.EsVacio()) return h1;', comment: '🔹 h2 empty: return h1' },
      { code: '', comment: '' },
      { code: '    // 🔄 RECURSIVE CASE: Compare roots', comment: '' },
      { code: '    E root1 = h1.Raiz();', comment: '' },
      { code: '    E root2 = h2.Raiz();', comment: '' },
      { code: '', comment: '' },
      { code: '    if (root1.compareTo(root2) >= 0) {', comment: '📊 root1 is larger (or equal)' },
      { code: '        // root1 becomes new root', comment: '' },
      { code: '        // Mix h2 with one of h1\'s subtrees', comment: '' },
      { code: '        ArbolBinarioE<E> newRight = mixHeap(h1.SubArbolDcho(), h2);', comment: '🔀 Merge h2 with right subtree' },
      { code: '        return new ABD<E>(root1, h1.SubArbolIzqdo(), newRight);', comment: '🔧 Build new heap' },
      { code: '    } else {', comment: '📊 root2 is larger' },
      { code: '        // root2 becomes new root', comment: '' },
      { code: '        ArbolBinarioE<E> newRight = mixHeap(h1, h2.SubArbolDcho());', comment: '🔀 Merge h1 with right subtree' },
      { code: '        return new ABD<E>(root2, h2.SubArbolIzqdo(), newRight);', comment: '🔧 Build new heap' },
      { code: '    }', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// Haskell version', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '-- removeMax using mixHeap', comment: '' },
      { code: 'removeMax :: (Ord a) => Arbol a -> Arbol a', comment: '' },
      { code: 'removeMax AV = AV', comment: '' },
      { code: 'removeMax (AB _ i d) = mixHeap i d', comment: '🔀 Just merge the subtrees!' },
      { code: '', comment: '' },
      { code: '-- mixHeap: merge two heaps', comment: '' },
      { code: 'mixHeap :: (Ord a) => Arbol a -> Arbol a -> Arbol a', comment: '' },
      { code: 'mixHeap AV h2 = h2', comment: '' },
      { code: 'mixHeap h1 AV = h1', comment: '' },
      { code: 'mixHeap h1@(AB r1 i1 d1) h2@(AB r2 i2 d2)', comment: '' },
      { code: '    | r1 >= r2  = AB r1 i1 (mixHeap d1 h2)', comment: '' },
      { code: '    | otherwise = AB r2 i2 (mixHeap h1 d2)', comment: '' }
    ],
    keyPoints: [
      '🎯 removeMax = mixHeap(left, right) - discard root!',
      '🔀 mixHeap merges two heaps maintaining heap property',
      '📊 Larger root becomes new root',
      '🔄 Recursively merge smaller root\'s heap with a subtree',
      '⚡ Used in Priority Queue: removeMax = dequeue highest priority',
      '💡 This is "leftist heap" or "skew heap" style merging'
    ],
    relatedExercises: ['heap-insert', 'heap-getmax', 'priority-queue']
  },

  // ============================================
  // SORTING ALGORITHMS
  // ============================================
  {
    id: 'sorting-overview',
    title: '📊 Sorting Algorithms Overview',
    topic: 'lists',
    language: 'java',
    mode: 'HIGH_LEVEL',
    description: 'Overview of common sorting algorithms and when to use each.',
    conceptOverview: `🎯 SORTING ALGORITHMS COMPARISON:

┌─────────────────┬───────────┬───────────┬────────────┬─────────────┐
│ Algorithm       │ Best      │ Average   │ Worst      │ Space       │
├─────────────────┼───────────┼───────────┼────────────┼─────────────┤
│ Bubble Sort     │ O(n)      │ O(n²)     │ O(n²)      │ O(1)        │
│ Selection Sort  │ O(n²)     │ O(n²)     │ O(n²)      │ O(1)        │
│ Insertion Sort  │ O(n)      │ O(n²)     │ O(n²)      │ O(1)        │
│ Merge Sort      │ O(n log n)│ O(n log n)│ O(n log n) │ O(n)        │
│ Quick Sort      │ O(n log n)│ O(n log n)│ O(n²)      │ O(log n)    │
│ Heap Sort       │ O(n log n)│ O(n log n)│ O(n log n) │ O(1)        │
└─────────────────┴───────────┴───────────┴────────────┴─────────────┘

💡 WHEN TO USE EACH:

• BUBBLE SORT: Educational only (too slow for real use)
• SELECTION SORT: When writes are expensive (always n swaps)
• INSERTION SORT: Small arrays, nearly sorted data
• MERGE SORT: Stable sort needed, linked lists, external sorting
• QUICK SORT: General purpose, usually fastest in practice
• HEAP SORT: Guaranteed O(n log n), no extra space needed`,
    codeWithComments: [
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '// Quick Reference: Sorting Algorithms', comment: '' },
      { code: '// ═══════════════════════════════════════════════════════════════', comment: '' },
      { code: '', comment: '' },
      { code: '// BUBBLE SORT: Compare adjacent pairs, swap if needed', comment: '' },
      { code: '// Simple but O(n²) - good for learning only', comment: '' },
      { code: 'for (int i = 0; i < n-1; i++)', comment: '' },
      { code: '    for (int j = 0; j < n-i-1; j++)', comment: '' },
      { code: '        if (arr[j] > arr[j+1]) swap(arr, j, j+1);', comment: '' },
      { code: '', comment: '' },
      { code: '// INSERTION SORT: Insert each element into sorted portion', comment: '' },
      { code: '// Good for small or nearly-sorted arrays', comment: '' },
      { code: 'for (int i = 1; i < n; i++) {', comment: '' },
      { code: '    int key = arr[i];', comment: '' },
      { code: '    int j = i - 1;', comment: '' },
      { code: '    while (j >= 0 && arr[j] > key) {', comment: '' },
      { code: '        arr[j+1] = arr[j];', comment: '' },
      { code: '        j--;', comment: '' },
      { code: '    }', comment: '' },
      { code: '    arr[j+1] = key;', comment: '' },
      { code: '}', comment: '' },
      { code: '', comment: '' },
      { code: '// MERGE SORT: Divide, sort halves, merge', comment: '' },
      { code: '// Guaranteed O(n log n), stable, but needs O(n) extra space', comment: '' },
      { code: 'mergeSort(arr, left, mid);', comment: '' },
      { code: 'mergeSort(arr, mid+1, right);', comment: '' },
      { code: 'merge(arr, left, mid, right);', comment: '' },
      { code: '', comment: '' },
      { code: '// QUICK SORT: Partition around pivot, sort partitions', comment: '' },
      { code: '// Usually fastest, but O(n²) worst case', comment: '' },
      { code: 'int pivot = partition(arr, low, high);', comment: '' },
      { code: 'quickSort(arr, low, pivot-1);', comment: '' },
      { code: 'quickSort(arr, pivot+1, high);', comment: '' }
    ],
    keyPoints: [
      '📊 O(n²) algorithms: Bubble, Selection, Insertion',
      '⚡ O(n log n) algorithms: Merge, Quick, Heap',
      '💾 In-place (O(1) space): Quick, Heap, Insertion',
      '✅ Stable (preserves order of equal elements): Merge, Insertion',
      '🎯 Most practical: Quick Sort (average case) or Merge Sort (guaranteed)'
    ],
    relatedExercises: ['sorting-bubble', 'sorting-merge', 'sorting-quick']
  },

  // ============================================================================
  // 📚 PROFESSOR GINÉS - EXAM PRACTICE FUNCTIONS
  // ============================================================================

  // -------------- fcnodes - Full Children Nodes Counter ----------------------
  {
    id: 'tree-fcnodes-java',
    title: 'fcnodes - Count Full Children Nodes (Java)',
    topic: 'trees',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Count nodes with full children, returning negative if tree is unbalanced.',
    conceptOverview: `🎯 GOAL: Count nodes where both children exist.

📌 KEY INSIGHT:
- Returns POSITIVE count if tree has equal subtree sizes
- Returns NEGATIVE (with absolute count) if subtrees differ
- This tracks BALANCE while counting!

Uses: i = left result, j = right result, k = combined`,
    codeWithComments: [
      { code: 'public static <E> Integer fcnodes(ArbolBinario<E> t) {', comment: '' },
      { code: '  int sol = 0, i, j, k;', comment: 'sol = result, i = left, j = right' },
      { code: '  ArbolBinario<E> t1, t2;', comment: '' },
      { code: '  if (!t.EsVacio())', comment: '🌳 If tree not empty' },
      { code: '    try {', comment: '' },
      { code: '      i = fcnodes(t.SubArbolIzqdo());', comment: '◀️ Recurse left' },
      { code: '      j = fcnodes(t.SubArbolDcho());', comment: '▶️ Recurse right' },
      { code: '      if (i < 0 || j < 0 || i != j)', comment: '❌ Unbalanced: negative result or sizes differ' },
      { code: '        sol = -(Math.abs(i) + Math.abs(j) + 1);', comment: '📉 Return negative count' },
      { code: '      else', comment: '' },
      { code: '        sol = i + j + 1;', comment: '✅ Balanced: return positive count' },
      { code: '    } catch(TADVacioException e) { System.out.println(e); }', comment: '' },
      { code: '  return sol;', comment: '🔢 0 if empty, +n if balanced, -n if not' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '✅ Returns positive count if all subtrees are balanced',
      '❌ Returns negative if ANY subtree is unbalanced',
      'Balance check: left count must equal right count',
      'Math.abs() used to get true count from negative results',
      'Clever encoding: sign = balance status, magnitude = count'
    ],
    relatedExercises: ['tree-height', 'tree-balanced']
  },

  // -------------- hileaf - Highest Leaf (Haskell) ----------------------
  {
    id: 'tree-hileaf-haskell',
    title: 'hileaf - Find Highest Leaf (Haskell)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Find the value of the rightmost/highest leaf in the tree.',
    conceptOverview: `🎯 GOAL: Find the value at the RIGHTMOST (highest) leaf.

📌 STRATEGY:
- If it's a leaf (AB r AV AV) → return r
- If only left subtree → go left
- Otherwise → go RIGHT (priority to right = higher)

This finds the leaf that would appear last in a right-first traversal.`,
    codeWithComments: [
      { code: 'hileaf :: Arbol a -> a', comment: '📘 Returns the highest leaf value' },
      { code: 'hileaf (AB r AV AV) = r', comment: '🍃 LEAF: return its value' },
      { code: 'hileaf (AB _ i AV) = hileaf i', comment: '◀️ Only left exists: go left' },
      { code: 'hileaf (AB _ _ d) = hileaf d', comment: '▶️ Right exists: ALWAYS go right (highest)' }
    ],
    keyPoints: [
      'Priority: right subtree over left (rightmost = highest)',
      'Pattern matching handles all cases elegantly',
      'Base case: leaf node (both children AV)',
      'Ignores root value (_) when not a leaf',
      'O(h) complexity where h = tree height'
    ],
    relatedExercises: ['tree-maxleaf', 'tree-minleaf']
  },

  // -------------- heightAVL - AVL Height Validation ----------------------
  {
    id: 'tree-heightavl-haskell',
    title: 'heightAVL - AVL Height with Validation (Haskell)',
    topic: 'trees',
    language: 'haskell',
    mode: 'HASKELL',
    description: 'Calculate tree height while validating AVL balance property.',
    conceptOverview: `🎯 GOAL: Return height if valid AVL, -1 if invalid.

📌 AVL PROPERTY:
For every node, |height(left) - height(right)| ≤ 1

📌 STRATEGY:
- Return -1 to indicate "invalid" propagates up
- If either child is -1, whole tree is invalid
- If balance factor > 1, return -1`,
    codeWithComments: [
      { code: 'heightAVL :: Arbol a -> Int', comment: '📘 Returns height or -1 if invalid AVL' },
      { code: 'heightAVL AV = 0', comment: '🌱 Empty tree has height 0' },
      { code: 'heightAVL (AB _ i d) = aux (heightAVL i) (heightAVL d)', comment: '🔄 Compute both heights, combine' },
      { code: '', comment: '' },
      { code: 'aux :: Int -> Int -> Int', comment: '📐 Helper to validate and compute height' },
      { code: 'aux hi hd =', comment: 'hi = left height, hd = right height' },
      { code: '  if hi == (-1) || hd == (-1) || (abs(hi - hd) > 1)', comment: '❌ Invalid if child invalid OR unbalanced' },
      { code: '    then (-1)', comment: '❌ Propagate invalidity' },
      { code: '    else (max hi hd) + 1', comment: '✅ Valid: height = max child + 1' }
    ],
    keyPoints: [
      '-1 encodes "invalid AVL tree"',
      'abs(hi - hd) > 1 checks balance factor',
      'Invalidity propagates up the tree',
      'Empty tree (AV) is valid with height 0',
      'Uses auxiliary function for clean comparison'
    ],
    relatedExercises: ['tree-height', 'tree-isBalanced']
  },

  // -------------- mixheaps - Merge Two Heaps ----------------------
  {
    id: 'heap-mixheaps-java',
    title: 'mixheaps - Merge Two Max-Heaps (Java)',
    topic: 'heaps',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Recursively merge two max-heaps into one valid max-heap.',
    conceptOverview: `🎯 GOAL: Combine two max-heaps into a single max-heap.

📌 STRATEGY:
- Compare roots: larger becomes new root
- Winner's children merged with loser tree
- Recursively maintains heap property

This is similar to "leftist heap" merge!`,
    codeWithComments: [
      { code: 'public static <E extends Comparable> ArbolBinario<E> mixheaps', comment: '' },
      { code: '    (ArbolBinario<E> t1, ArbolBinario<E> t2) {', comment: '🔀 Merge two heaps' },
      { code: '  ArbolBinario<E> iz, de, sol = new ABD<E>();', comment: '' },
      { code: '  E r1, r2;', comment: '' },
      { code: '  if (t1.EsVacio()) return t2;', comment: '📭 t1 empty: return t2' },
      { code: '  if (t2.EsVacio()) return t1;', comment: '📭 t2 empty: return t1' },
      { code: '  try {', comment: '' },
      { code: '    r1 = t1.Raiz(); r2 = t2.Raiz();', comment: '🔝 Get both roots' },
      { code: '    if (r1.compareTo(r2) > 0)', comment: '🏆 r1 wins (larger)' },
      { code: '      return new ABD<E>(r1,', comment: '✅ r1 becomes root' },
      { code: '        mixheaps(t1.SubArbolIzqdo(), t1.SubArbolDcho()),', comment: '🔄 Merge t1 children' },
      { code: '        t2);', comment: '📎 t2 becomes right child' },
      { code: '    else', comment: '🏆 r2 wins (larger or equal)' },
      { code: '      return new ABD<E>(r2,', comment: '✅ r2 becomes root' },
      { code: '        t1,', comment: '📎 t1 becomes left child' },
      { code: '        mixheaps(t2.SubArbolIzqdo(), t2.SubArbolDcho()));', comment: '🔄 Merge t2 children' },
      { code: '  } catch (TADVacioException ex) { System.out.println(ex); }', comment: '' },
      { code: '  return sol;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '🏆 Larger root wins and becomes new root',
      'Loser tree becomes child of winner',
      'Winner children are merged recursively',
      'Base cases: if either is empty, return the other',
      'O(log n + log m) for balanced heaps'
    ],
    relatedExercises: ['heap-insert', 'heap-removeMax']
  },

  // -------------- BST to Graph Constructor ----------------------
  {
    id: 'graph-bst-constructor',
    title: 'GNDE Constructor - BST Search Path to Graph',
    topic: 'graphs',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Build a graph representing the search path in a BST.',
    conceptOverview: `🎯 GOAL: Convert BST search path into a graph.

📌 STRATEGY:
- Traverse BST searching for value x
- Each visited node becomes a graph node
- Connect consecutive nodes with edges
- If found, stop; if not, numnodos = 0`,
    codeWithComments: [
      { code: 'Adyacencias = new boolean[MAX_NODOS][MAX_NODOS];', comment: '📊 Adjacency matrix' },
      { code: 'Nodos = new NodoGrafo[MAX_NODOS];', comment: '📍 Node array' },
      { code: 'numnodos = 0;', comment: '' },
      { code: 'Integer y, z;', comment: '' },
      { code: 'ABD<Integer> t1, t2;', comment: '' },
      { code: 'try {', comment: '' },
      { code: '  while (!t.EsVacio()) {', comment: '🔄 Traverse until empty' },
      { code: '    y = t.Raiz();', comment: '🔝 Get current root' },
      { code: '    Nodos[numnodos] = new NodoGrafo(y, false);', comment: '➕ Add node to graph' },
      { code: '    numnodos++;', comment: '' },
      { code: '    Adyacencias[numnodos-1][numnodos] = ', comment: '🔗 Connect to previous' },
      { code: '      Adyacencias[numnodos][numnodos-1] = true;', comment: '   (bidirectional)' },
      { code: '    if (x == y) return;', comment: '🎯 FOUND! Stop here' },
      { code: '    if (y > x) t = t.SubArbolIzqdo();', comment: '◀️ x smaller: go left' },
      { code: '    else t = t.SubArbolDcho();', comment: '▶️ x larger: go right' },
      { code: '  }', comment: '' },
      { code: '} catch (TADVacioException ex) { System.out.println(ex); }', comment: '' },
      { code: 'if (t.EsVacio()) numnodos = 0;', comment: '❌ Not found: reset graph' }
    ],
    keyPoints: [
      'Builds linear graph from BST search path',
      'BST property: left < root < right',
      'If x found, graph has the search path',
      'If x not found, numnodos reset to 0',
      'Edges connect consecutive visited nodes'
    ],
    relatedExercises: ['bst-search', 'graph-constructor']
  },

  // -------------- Heap to Graph Constructor ----------------------
  {
    id: 'graph-heap-constructor',
    title: 'GNDE Constructor - Heap to Graph using mixheaps',
    topic: 'graphs',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Build a star graph from heap using mixheaps to extract elements.',
    conceptOverview: `🎯 GOAL: Convert heap to a STAR graph (root connected to all).

📌 STRATEGY:
- Root of heap becomes center node (node 0)
- Use mixheaps to repeatedly extract elements
- Each extracted element connects to center
- Creates star topology from heap order`,
    codeWithComments: [
      { code: 'numnodos = 0;', comment: '' },
      { code: 'Adyacencias = new boolean[MAX_NODOS][MAX_NODOS];', comment: '📊 Adjacency matrix' },
      { code: 'Nodos = new NodoGrafo[MAX_NODOS];', comment: '📍 Node array' },
      { code: 'Integer x;', comment: '' },
      { code: 'ArbolBinario<Integer> y, z;', comment: '' },
      { code: 'try {', comment: '' },
      { code: '  if (!t.EsVacio()) {', comment: '🌳 If heap not empty' },
      { code: '    Nodos[0] = new NodoGrafo(t.Raiz(), false);', comment: '⭐ First node = root (center)' },
      { code: '    t = mixheaps(t.SubArbolIzqdo(), t.SubArbolDcho());', comment: '🔄 Merge children' },
      { code: '    numnodos++;', comment: '' },
      { code: '  }', comment: '' },
      { code: '  while (!t.EsVacio()) {', comment: '🔄 Process remaining' },
      { code: '    Nodos[numnodos] = new NodoGrafo(t.Raiz(), false);', comment: '➕ Add node' },
      { code: '    t = mixheaps(t.SubArbolIzqdo(), t.SubArbolDcho());', comment: '🔄 Merge children' },
      { code: '    Adyacencias[0][numnodos] = ', comment: '⭐ Connect to center' },
      { code: '      Adyacencias[numnodos][0] = true;', comment: '   (bidirectional)' },
      { code: '    numnodos++;', comment: '' },
      { code: '  }', comment: '' },
      { code: '} catch (TADVacioException ex) { System.out.println(ex); }', comment: '' }
    ],
    keyPoints: [
      '⭐ Creates STAR graph: center connected to all',
      'Uses mixheaps to extract elements in heap order',
      'Node 0 (max element) is the center',
      'All other nodes connect ONLY to center',
      'Result: n nodes, n-1 edges (star topology)'
    ],
    relatedExercises: ['heap-mixheaps', 'graph-constructor']
  },

  // -------------- hole - Find Path to Hole ----------------------
  {
    id: 'tree-hole-java',
    title: 'hole - Find Path to Missing Node (Java)',
    topic: 'trees',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Find the path to where a missing node (hole) should be inserted.',
    conceptOverview: `🎯 GOAL: Find directions to the "hole" (missing node position).

📌 RETURNS: Lista<Integer> where:
- 0 = go LEFT
- 1 = go RIGHT
- Last element = size of subtree

📌 STRATEGY:
Compare left and right subtree sizes. Smaller side has the "hole".`,
    codeWithComments: [
      { code: 'public static <E> Lista<Integer> hole(ArbolBinario<E> t) {', comment: '' },
      { code: '  Integer l, r;', comment: 'l = left size, r = right size' },
      { code: '  Lista<Integer> sol, left, right;', comment: '' },
      { code: '  sol = new LD<>();', comment: '' },
      { code: '  if (t.EsVacio()) sol.Añade(0);', comment: '📭 Empty: size is 0' },
      { code: '  else try {', comment: '' },
      { code: '    left = hole(t.SubArbolIzqdo());', comment: '◀️ Get left result' },
      { code: '    right = hole(t.SubArbolDcho());', comment: '▶️ Get right result' },
      { code: '    l = left.Cabeza();', comment: '📊 Left size (head of list)' },
      { code: '    r = right.Cabeza();', comment: '📊 Right size' },
      { code: '    if (l < r) {', comment: '◀️ Left smaller: hole is left' },
      { code: '      sol = left.Cola();', comment: '📋 Copy left path' },
      { code: '      sol.Añade(0);', comment: '➕ Add 0 (go left)' },
      { code: '    } else if (l > r) {', comment: '▶️ Right smaller: hole is right' },
      { code: '      sol = right.Cola();', comment: '📋 Copy right path' },
      { code: '      sol.Añade(1);', comment: '➕ Add 1 (go right)' },
      { code: '    }', comment: 'If equal, sol stays empty (complete level)' },
      { code: '    sol.Añade(l + r + 1);', comment: '📊 Add total size' },
      { code: '  } catch (TADVacioException ex) { ex.printStackTrace(); }', comment: '' },
      { code: '  return sol;', comment: '📋 List: [size, direction, direction, ...]' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      '0 = go LEFT, 1 = go RIGHT',
      'Head of list = subtree size',
      'Tail of list = path directions',
      'Hole is in smaller subtree',
      'Useful for complete binary tree insertion'
    ],
    relatedExercises: ['tree-insert-complete', 'tree-isComplete']
  },

  // -------------- Linked List Tree to Graph ----------------------
  {
    id: 'graph-linkedtree-constructor',
    title: 'GNDE Constructor - Tree Chains to Graph',
    topic: 'graphs',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Build a graph from a tree with linked-list style left and right chains.',
    conceptOverview: `🎯 GOAL: Convert special tree structure to graph.

📌 TREE STRUCTURE:
- Left chain: nodes linked via SubArbolIzqdo only
- Right chain: nodes linked via SubArbolDcho only
- Root connects both chains

📌 RESULT: Linear graph with root in middle`,
    codeWithComments: [
      { code: 'public GNDE(ArbolBinario<E> t) {', comment: '' },
      { code: '  Adyacencias = new boolean[MAX_NODOS][MAX_NODOS];', comment: '' },
      { code: '  Nodos = new NodoGrafo[MAX_NODOS];', comment: '' },
      { code: '  numnodos = 0;', comment: '' },
      { code: '  ArbolBinario<E> aux;', comment: '' },
      { code: '  if (!t.EsVacio())', comment: '' },
      { code: '    try {', comment: '' },
      { code: '      Nodos[0] = new NodoGrafo(t.Raiz(), false);', comment: '🔝 Root = node 0' },
      { code: '      numnodos++;', comment: '' },
      { code: '      aux = t.SubArbolIzqdo();', comment: '◀️ Start left chain' },
      { code: '      while (!aux.EsVacio()) {', comment: '🔄 Traverse left chain' },
      { code: '        Nodos[numnodos] = new NodoGrafo(aux.Raiz(), false);', comment: '' },
      { code: '        Adyacencias[numnodos][numnodos-1] =', comment: '🔗 Connect to previous' },
      { code: '          Adyacencias[numnodos-1][numnodos] = true;', comment: '' },
      { code: '        numnodos++;', comment: '' },
      { code: '        aux = aux.SubArbolIzqdo();', comment: '◀️ Follow left' },
      { code: '      }', comment: '' },
      { code: '      if (!(t.SubArbolDcho()).EsVacio()) {', comment: '▶️ If right exists' },
      { code: '        Nodos[numnodos] = new NodoGrafo(', comment: '' },
      { code: '          t.SubArbolDcho().Raiz(), false);', comment: '▶️ First right node' },
      { code: '        Adyacencias[numnodos][0] =', comment: '🔗 Connect to ROOT' },
      { code: '          Adyacencias[0][numnodos] = true;', comment: '' },
      { code: '        numnodos++;', comment: '' },
      { code: '        aux = t.SubArbolDcho().SubArbolDcho();', comment: '' },
      { code: '        while (!aux.EsVacio()) {', comment: '🔄 Traverse right chain' },
      { code: '          Nodos[numnodos] = new NodoGrafo(aux.Raiz(), false);', comment: '' },
      { code: '          Adyacencias[numnodos][numnodos-1] =', comment: '🔗 Connect to previous' },
      { code: '            Adyacencias[numnodos-1][numnodos] = true;', comment: '' },
      { code: '          numnodos++;', comment: '' },
      { code: '          aux = aux.SubArbolDcho();', comment: '▶️ Follow right' },
      { code: '        }', comment: '' },
      { code: '      }', comment: '' },
      { code: '    } catch (TADVacioException ex) { ex.printStackTrace(); }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Left chain: follow SubArbolIzqdo repeatedly',
      'Right chain: follow SubArbolDcho repeatedly',
      'Root connects both chains (center of graph)',
      'Result: linear graph with root as hub',
      'Each chain node connects to previous'
    ],
    relatedExercises: ['graph-constructor', 'tree-toList']
  },

  // -------------- prune - Prune Tree from Nested List ----------------------
  {
    id: 'tree-prune-java',
    title: 'prune - Build Tree from Nested List (Java)',
    topic: 'trees',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Recursively build a binary tree from a nested list structure.',
    conceptOverview: `🎯 GOAL: Convert nested list to binary tree.

📌 LIST FORMAT:
(root, leftList, rightList)

📌 STRATEGY:
- Head = root value
- Skip intermediate elements (trim list)
- Recursively build left and right subtrees`,
    codeWithComments: [
      { code: 'public static <E> ArbolBinario<E> prune(Lista ag) {', comment: '' },
      { code: '  ArbolBinario<E> sol = new ABD<E>();', comment: '' },
      { code: '  if (!ag.EsVacia())', comment: '📋 If list not empty' },
      { code: '    try {', comment: '' },
      { code: '      ArbolBinario<E> left = new ABD<E>(),', comment: '' },
      { code: '        right = new ABD<E>();', comment: '' },
      { code: '      E root = (E) ag.Cabeza();', comment: '🔝 First element = root' },
      { code: '      ag = ag.Cola();', comment: '📋 Remove root from list' },
      { code: '      while (!ag.EsVacia() &&', comment: '⏩ Skip intermediate elements' },
      { code: '             !ag.Cola().EsVacia() &&', comment: '' },
      { code: '             !ag.Cola().Cola().EsVacia()) {', comment: '' },
      { code: '        ag = ag.Cola();', comment: '' },
      { code: '      }', comment: '' },
      { code: '      if (!ag.EsVacia()) {', comment: '◀️ Process left subtree' },
      { code: '        left = prune((Lista) ag.Cabeza());', comment: '🔄 Recurse on left list' },
      { code: '        ag = ag.Cola();', comment: '' },
      { code: '        if (!ag.EsVacia())', comment: '▶️ Process right subtree' },
      { code: '          right = prune((Lista) ag.Cabeza());', comment: '🔄 Recurse on right list' },
      { code: '      }', comment: '' },
      { code: '      sol = new ABD<E>(root, left, right);', comment: '🌳 Build tree node' },
      { code: '    } catch (TADVacioException ex) { System.out.println(ex); }', comment: '' },
      { code: '  return sol;', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'List head = root value',
      'Nested lists = subtrees',
      'Skip intermediate elements to find children',
      'Recursive: each sublist becomes subtree',
      'Empty list → empty tree'
    ],
    relatedExercises: ['tree-fromList', 'tree-constructor']
  },

  // -------------- Heap Array to Graph ----------------------
  {
    id: 'graph-heaparray-constructor',
    title: 'GNDE Constructor - Heap Array Indices to Graph',
    topic: 'graphs',
    language: 'java',
    mode: 'LOW_LEVEL',
    description: 'Build a graph from heap using array index relationships.',
    conceptOverview: `🎯 GOAL: Create graph with heap parent-child relationships.

📌 HEAP ARRAY PROPERTY:
- Parent of node i: (i-1)/2
- Left child of i: 2i + 1
- Right child of i: 2i + 2

📌 This builds the heap TREE structure as a graph!`,
    codeWithComments: [
      { code: 'public GNDE(Integer n) {', comment: '' },
      { code: '  Adyacencias = new boolean[MAX_NODOS][MAX_NODOS];', comment: '' },
      { code: '  Nodos = new NodoGrafo[MAX_NODOS];', comment: '' },
      { code: '  numnodos = 0;', comment: '' },
      { code: '  numnodos = n;', comment: '📊 Total nodes' },
      { code: '  Integer i;', comment: '' },
      { code: '  for (i = 0; i < n; i++) {', comment: '🔢 Create all nodes' },
      { code: '    Nodos[i] = new NodoGrafo(i, false);', comment: '' },
      { code: '  }', comment: '' },
      { code: '  for (i = 0; ; i++) {', comment: '🔗 Create edges' },
      { code: '    if (i * 2 + 1 < n)', comment: '◀️ Left child exists?' },
      { code: '      Adyacencias[i][i*2+1] =', comment: '' },
      { code: '        Adyacencias[i*2+1][i] = true;', comment: '🔗 Connect to left child' },
      { code: '    else break;', comment: '❌ No left child: done' },
      { code: '    if (i * 2 + 2 < n)', comment: '▶️ Right child exists?' },
      { code: '      Adyacencias[i][i*2+2] =', comment: '' },
      { code: '        Adyacencias[i*2+2][i] = true;', comment: '🔗 Connect to right child' },
      { code: '    else break;', comment: '❌ No right child: done' },
      { code: '  }', comment: '' },
      { code: '}', comment: '' }
    ],
    keyPoints: [
      'Left child index: 2*i + 1',
      'Right child index: 2*i + 2',
      'Parent index: (i-1) / 2',
      'Creates complete binary tree structure',
      'Heap property NOT checked - just structure'
    ],
    relatedExercises: ['heap-array', 'graph-constructor']
  }
];

// Get explanations by topic
export function getExplanationsByTopic(topic: string): CodeExplanation[] {
  return explanations.filter(e => e.topic === topic);
}

// Get explanations by language
export function getExplanationsByLanguage(lang: 'java' | 'haskell'): CodeExplanation[] {
  return explanations.filter(e => e.language === lang);
}

// Get explanation by ID
export function getExplanationById(id: string): CodeExplanation | undefined {
  return explanations.find(e => e.id === id);
}

// 🔍 SEARCH FUNCTION - For filtering explanations
export function searchExplanations(query: string): CodeExplanation[] {
  const lowerQuery = query.toLowerCase();
  return explanations.filter(e => 
    e.title.toLowerCase().includes(lowerQuery) ||
    e.description.toLowerCase().includes(lowerQuery) ||
    e.topic.toLowerCase().includes(lowerQuery) ||
    e.conceptOverview.toLowerCase().includes(lowerQuery) ||
    e.keyPoints.some(kp => kp.toLowerCase().includes(lowerQuery))
  );
}
