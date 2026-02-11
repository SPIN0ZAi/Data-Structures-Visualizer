import { Link } from 'react-router-dom'
import LetterGlitch from '../components/LetterGlitch'
import ASCIIText from '../components/ASCIIText'

const modules = [
  {
    id: 'trees',
    title: 'Trees / BST / AVL',
    description: 'Explore binary trees, binary search trees, and AVL trees with insertion, deletion, and balancing operations.',
    icon: '🌲',
    path: '/trees',
  },
  {
    id: 'traversals',
    title: 'Tree Traversals',
    description: 'Visualize preorder, inorder, postorder, and level-order traversals with step-by-step animations.',
    icon: '🔄',
    path: '/trees',
  },
  {
    id: 'graphs',
    title: 'DFS / BFS',
    description: 'Learn depth-first and breadth-first search algorithms on graphs with stack and queue visualizations.',
    icon: '�',
    path: '/graphs',
  },
  {
    id: 'floyd',
    title: 'Floyd-Warshall',
    description: 'Discover all-pairs shortest paths algorithm with matrix transformations and path reconstruction.',
    icon: '🛤️',
    path: '/floyd',
  },
  {
    id: 'huffman',
    title: 'Huffman Coding',
    description: 'Build Huffman trees from symbol frequencies and generate optimal prefix codes for compression.',
    icon: '📦',
    path: '/huffman',
  },
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    description: 'Visualize Bubble, Selection, Insertion, Merge, Quick, and Heap sort with animations and sound.',
    icon: '📊',
    path: '/sorting',
  },
  {
    id: 'pathfinding',
    title: 'Pathfinding',
    description: "Explore Dijkstra's, A*, BFS, and DFS algorithms on an interactive grid with maze generation.",
    icon: '🗺️',
    path: '/pathfinding',
  },
  {
    id: 'dekker',
    title: "Dekker's Algorithm",
    description: 'Interactive simulation of mutual exclusion for concurrent processes with step-by-step visualization.',
    icon: '🔒',
    path: '/dekker',
  },
]

function Home() {
  return (
    <div>
      {/* Hero Section with ASCIIText SB signature */}
      <section className="home-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glitch-background">
          <LetterGlitch
            glitchColors={['#00f7ff', '#ff00ff', '#00ff00']}
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={true}
            smooth={true}
          />
        </div>
        
        {/* ASCIIText SB - Main Feature */}
        <div className="hero-ascii-container">
          <ASCIIText
            text="SB"
            enableWaves={true}
            asciiFontSize={8}
            textFontSize={250}
            planeBaseHeight={10}
          />
        </div>

        <div className="hero-content">
          <h1 className="hero-main-title">Data Structures Visualizer</h1>
          <p className="hero-subtitle">
            Interactive visualizations to help you understand trees, graphs, and algorithms. 
            Explore each module to learn through animations and hands-on experimentation.
          </p>
        </div>
      </section>

      <div className="modules-grid">
        {modules.map((module) => (
          <Link key={module.id} to={module.path} className="module-card">
            <div className="module-icon">{module.icon}</div>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
          </Link>
        ))}
      </div>

      <section className="theory-section" style={{ marginTop: '3rem' }}>
        <h2>📚 Course Topics Overview</h2>
        <p>
          This visualizer covers essential data structure concepts including:
        </p>
        <ul>
          <li><strong>Tree Basics:</strong> Root, children, leaves, height, levels, and paths</li>
          <li><strong>Binary Trees:</strong> Structure, static/dynamic representations, completeness</li>
          <li><strong>Binary Search Trees (BST):</strong> Ordering property, search, insert, delete operations</li>
          <li><strong>AVL Trees:</strong> Balance factor, rotations (LL, RR, LR, RL), insertion rebalancing</li>
          <li><strong>Traversals:</strong> Preorder, inorder, postorder, level-order (BFS on tree)</li>
          <li><strong>Graph Algorithms:</strong> Depth-first search (DFS) and breadth-first search (BFS)</li>
          <li><strong>Floyd-Warshall:</strong> All-pairs shortest paths, cycles, path reconstruction</li>
          <li><strong>Huffman Coding:</strong> Building Huffman trees, generating optimal codes</li>
          <li><strong>Dekker's Algorithm:</strong> Mutual exclusion, concurrent process synchronization, critical sections</li>
        </ul>
      </section>

      {/* Footer with GitHub Link */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-signature">
            <span className="signature-text">Made with 💜 by</span>
            <span className="signature-name">SB</span>
          </div>
          <a 
            href="https://github.com/SPIN0ZAi/Data-Structures-Visualizer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-github-link"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export default Home
