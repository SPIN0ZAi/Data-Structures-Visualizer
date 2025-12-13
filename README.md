# Data Structures Visualizer

An interactive web application for learning and visualizing data structures and algorithms including trees, graphs, and more.

![Data Structures Visualizer Screenshot](https://github.com/SPIN0ZAi/Data-Structures-Visualizer/blob/main/Screenshot%202025-12-12%20221422.png?raw=true)

## Features

### 🌲 Trees / BST / AVL
- Binary Search Tree (BST) construction and visualization
- AVL Tree with automatic balancing and rotation visualization
- Support for LL, RR, LR, RL rotations
- Balance factor display
- Tree validation (check if valid BST/AVL)

### 🔄 Tree Traversals
- Preorder traversal (Root → Left → Right)
- Inorder traversal (Left → Root → Right)
- Postorder traversal (Left → Right → Root)
- Level-order traversal (BFS on tree)
- Step-by-step animation with result display

### 📊 Graph Algorithms (DFS/BFS)
- Depth-First Search with stack visualization
- Breadth-First Search with queue visualization
- Custom graph input (adjacency list)
- Directed and undirected graph support
- Interactive node/edge visualization

### 🛤️ Floyd-Warshall Algorithm
- All-pairs shortest path computation
- Step-by-step matrix transformation
- Path reconstruction between any two nodes
- Cycle detection
- Interactive adjacency matrix editor

### 📦 Huffman Coding
- Build Huffman tree from symbol frequencies
- Generate optimal prefix-free codes
- Visualize tree construction step-by-step
- Code table with average length calculation

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** CSS with custom properties
- **Routing:** React Router DOM
- **Visualization:** SVG

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

Or deploy manually:
```bash
npm run build
# Upload dist/ folder to your hosting
```

## Project Structure

```
src/
├── algorithms/           # Algorithm implementations
│   ├── treeAlgorithms.ts    # BST, AVL, traversals
│   ├── graphAlgorithms.ts   # DFS, BFS
│   ├── floydAlgorithm.ts    # Floyd-Warshall
│   └── huffmanAlgorithm.ts  # Huffman coding
├── components/           # Reusable UI components
│   └── Layout.tsx           # Main layout with navigation
├── pages/                # Page components
│   ├── Home.tsx             # Landing page
│   ├── TreeVisualizer.tsx   # Tree/BST/AVL page
│   ├── GraphVisualizer.tsx  # DFS/BFS page
│   ├── FloydVisualizer.tsx  # Floyd-Warshall page
│   └── HuffmanVisualizer.tsx # Huffman coding page
├── types/                # TypeScript type definitions
│   └── index.ts
├── App.tsx               # Main app component
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## Topics Covered

### Tree Basics
- Root, children, leaves, height, levels, paths
- Binary tree structure
- Static and dynamic representations

### Binary Search Trees (BST)
- Ordering property: left < root < right
- Search, insert, delete operations
- Time complexity analysis

### AVL Trees
- Balance factor: height(left) - height(right)
- Rotations: LL, RR, LR, RL
- Self-balancing after insertions

### Graph Traversals
- DFS: Stack-based, explores depth first
- BFS: Queue-based, explores level by level
- Applications in path finding and connectivity

### Floyd-Warshall
- All-pairs shortest paths
- Dynamic programming approach
- O(n³) time complexity
- Path reconstruction using predecessor matrix

### Huffman Coding
- Optimal prefix-free codes
- Greedy algorithm
- Data compression application
- Average code length calculation

## License

MIT
