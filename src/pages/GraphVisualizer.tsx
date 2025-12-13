import { useState, useEffect, useCallback, useRef } from 'react'
import { Graph, GraphAlgorithm, AnimationFrame } from '../types'
import { dfs, bfs, calculateGraphPositions, createSampleGraph } from '../algorithms/graphAlgorithms'

// Helper to get the correct traversal order
function getCorrectOrder(graph: Graph, algorithm: GraphAlgorithm, startNode: string): number[] {
  const frames = algorithm === 'dfs' ? dfs(graph, startNode) : bfs(graph, startNode);
  const lastFrame = frames[frames.length - 1];
  return lastFrame?.result || [];
}

function GraphVisualizer() {
  const [graph, setGraph] = useState<Graph>(() => {
    const g = createSampleGraph(6, true)
    return g
  })
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>('dfs')
  const [startNode, setStartNode] = useState('0')
  const [animationFrames, setAnimationFrames] = useState<AnimationFrame[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [message, setMessage] = useState('')
  const [nodeCount, setNodeCount] = useState(6)
  const [edgeInput, setEdgeInput] = useState('0-1, 0-2, 1-3, 2-4, 3-4, 4-5')
  const [isDirected, setIsDirected] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  // Quiz Mode State
  const [quizMode, setQuizMode] = useState(false)
  const [quizAlgorithm, setQuizAlgorithm] = useState<GraphAlgorithm>('dfs')
  const [userSelection, setUserSelection] = useState<number[]>([])
  const [correctOrder, setCorrectOrder] = useState<number[]>([])
  const [mistakes, setMistakes] = useState<number[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const { clientWidth, clientHeight } = svgRef.current.parentElement
        setDimensions({
          width: Math.max(600, clientWidth),
          height: Math.max(400, clientHeight),
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Recalculate positions when graph or dimensions change
  useEffect(() => {
    calculateGraphPositions(graph, dimensions.width, dimensions.height)
    setGraph({ ...graph })
  }, [dimensions, graph.nodes.length])

  // Build graph from input
  const buildGraph = useCallback(() => {
    setAnimationFrames([])
    setCurrentFrame(0)
    setMessage('')

    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      label: String(i),
    }))

    const edgeStrings = edgeInput.split(',').map(e => e.trim())
    const edges: Graph['edges'] = []

    edgeStrings.forEach(edgeStr => {
      const match = edgeStr.match(/(\d+)\s*-\s*(\d+)(?:\s*:\s*(\d+))?/)
      if (match) {
        const from = parseInt(match[1])
        const to = parseInt(match[2])
        const weight = match[3] ? parseInt(match[3]) : 1

        if (from < nodeCount && to < nodeCount) {
          edges.push({
            from: `node-${from}`,
            to: `node-${to}`,
            weight,
          })
        }
      }
    })

    const newGraph: Graph = { nodes, edges, directed: isDirected }
    calculateGraphPositions(newGraph, dimensions.width, dimensions.height)
    setGraph(newGraph)
    setMessage(`Built graph with ${nodes.length} nodes and ${edges.length} edges`)
  }, [nodeCount, edgeInput, isDirected, dimensions])

  // Run algorithm
  const runAlgorithm = useCallback(() => {
    const startId = `node-${startNode}`
    if (!graph.nodes.find(n => n.id === startId)) {
      setMessage(`Node ${startNode} not found`)
      return
    }

    let frames: AnimationFrame[]
    if (algorithm === 'dfs') {
      frames = dfs(graph, startId)
    } else {
      frames = bfs(graph, startId)
    }

    setAnimationFrames(frames)
    setCurrentFrame(0)
    setIsPlaying(true)
  }, [graph, algorithm, startNode])

  // Start Quiz Mode
  const startQuiz = useCallback((algo: GraphAlgorithm) => {
    const startId = `node-${startNode}`
    if (!graph.nodes.find(n => n.id === startId)) {
      setMessage(`Node ${startNode} not found`)
      return
    }

    const order = getCorrectOrder(graph, algo, startId)
    setCorrectOrder(order)
    setQuizAlgorithm(algo)
    setUserSelection([])
    setMistakes([])
    setQuizComplete(false)
    setQuizMode(true)
    setScore({ correct: 0, total: order.length })
    setMessage(`🧪 Quiz Mode: Click nodes in ${algo.toUpperCase()} order starting from node ${startNode}`)
    setAnimationFrames([])
    setCurrentFrame(0)
  }, [graph, startNode])

  // Handle node click in quiz mode
  const handleNodeClick = useCallback((nodeLabel: number) => {
    if (!quizMode || quizComplete) return

    const currentIndex = userSelection.length
    const expectedValue = correctOrder[currentIndex]

    if (nodeLabel === expectedValue) {
      // Correct!
      const newSelection = [...userSelection, nodeLabel]
      setUserSelection(newSelection)
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }))

      if (newSelection.length === correctOrder.length) {
        // Quiz complete!
        setQuizComplete(true)
        const finalScore = ((newSelection.length - mistakes.length) / correctOrder.length * 100).toFixed(0)
        setMessage(`🎉 Quiz Complete! Score: ${finalScore}% (${mistakes.length} mistakes)`)
      } else {
        setMessage(`✅ Correct! ${newSelection.length}/${correctOrder.length}`)
      }
    } else {
      // Wrong!
      setMistakes(prev => [...prev, currentIndex])
      setMessage(`❌ Wrong! Expected ${expectedValue}, you clicked ${nodeLabel}. Continue to find the correct path.`)
    }
  }, [quizMode, quizComplete, userSelection, correctOrder, mistakes])

  // Reset Quiz
  const resetQuiz = useCallback(() => {
    setQuizMode(false)
    setUserSelection([])
    setCorrectOrder([])
    setMistakes([])
    setQuizComplete(false)
    setScore({ correct: 0, total: 0 })
    setMessage('')
  }, [])

  // Animation playback
  useEffect(() => {
    if (!isPlaying || animationFrames.length === 0) return

    if (currentFrame >= animationFrames.length) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setCurrentFrame(prev => prev + 1)
    }, speed)

    return () => clearTimeout(timer)
  }, [isPlaying, currentFrame, animationFrames, speed])

  const frame = animationFrames[currentFrame - 1]

  return (
    <div className="visualizer-page">
      <div className="controls-panel">
        {/* Theory Section */}
        <div className="controls-section">
          <h3>📖 Theory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>DFS:</strong> Uses a stack to explore as far as possible along each branch before backtracking.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            <strong>BFS:</strong> Uses a queue to explore all neighbors at the current depth before moving deeper.
          </p>
        </div>

        {/* Algorithm Selection */}
        <div className="controls-section">
          <h3>Algorithm</h3>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${algorithm === 'dfs' ? 'active' : ''}`}
              onClick={() => setAlgorithm('dfs')}
            >
              DFS
            </button>
            <button
              className={`toggle-btn ${algorithm === 'bfs' ? 'active' : ''}`}
              onClick={() => setAlgorithm('bfs')}
            >
              BFS
            </button>
          </div>
        </div>

        {/* Graph Input */}
        <div className="controls-section">
          <h3>Graph Setup</h3>
          <div className="controls-group">
            <div className="controls-row">
              <label style={{ fontSize: '0.75rem' }}>Nodes:</label>
              <input
                type="number"
                min="2"
                max="15"
                value={nodeCount}
                onChange={(e) => setNodeCount(parseInt(e.target.value) || 2)}
                style={{ width: '60px' }}
              />
            </div>
            <div className="controls-row">
              <label style={{ fontSize: '0.75rem' }}>Directed:</label>
              <input
                type="checkbox"
                checked={isDirected}
                onChange={(e) => setIsDirected(e.target.checked)}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Edges (format: 0-1, 1-2):
            </div>
            <textarea
              value={edgeInput}
              onChange={(e) => setEdgeInput(e.target.value)}
              rows={3}
              style={{ width: '100%', fontSize: '0.75rem' }}
            />
            <button className="btn-primary" onClick={buildGraph}>
              Build Graph
            </button>
          </div>
        </div>

        {/* Algorithm Controls */}
        <div className="controls-section">
          <h3>Run Algorithm</h3>
          <div className="controls-group">
            <div className="controls-row">
              <label style={{ fontSize: '0.75rem' }}>Start Node:</label>
              <input
                type="number"
                min="0"
                max={nodeCount - 1}
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                style={{ width: '60px' }}
              />
            </div>
            <button className="btn-success" onClick={runAlgorithm}>
              Run {algorithm.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Quiz Mode */}
        <div className="controls-section">
          <h3>🧪 Quiz Mode</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Test yourself! Click nodes in traversal order.
          </p>
          {!quizMode ? (
            <div className="controls-group">
              <div className="controls-row">
                <button className="btn-quiz" onClick={() => startQuiz('dfs')}>
                  Test DFS
                </button>
                <button className="btn-quiz" onClick={() => startQuiz('bfs')}>
                  Test BFS
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-info">
              <div className="quiz-progress">
                <strong>Testing: {quizAlgorithm.toUpperCase()}</strong>
                <span>{userSelection.length} / {correctOrder.length}</span>
              </div>
              <div className="quiz-score">
                <span style={{ color: 'var(--success)' }}>✓ {score.correct - mistakes.length}</span>
                <span style={{ color: 'var(--error)' }}>✗ {mistakes.length}</span>
              </div>
              <button className="btn-secondary" onClick={resetQuiz} style={{ marginTop: '0.5rem' }}>
                Exit Quiz
              </button>
            </div>
          )}
        </div>

        {/* Animation Controls */}
        <div className="controls-section">
          <h3>Animation</h3>
          <div className="controls-row">
            <button
              className="btn-secondary"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={animationFrames.length === 0}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setCurrentFrame(0)
                setIsPlaying(false)
              }}
              disabled={animationFrames.length === 0}
            >
              ⟲ Reset
            </button>
          </div>
          <div className="speed-control" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem' }}>Speed:</span>
            <input
              type="range"
              min="100"
              max="1500"
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="visualization-panel">
        {/* Message */}
        {(message || frame?.message) && (
          <div className="info-panel">
            <p>{frame?.message || message}</p>
          </div>
        )}

        {/* Graph Canvas */}
        <div className="visualization-canvas">
          <svg ref={svgRef} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
            {/* Arrow marker for directed graphs */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="25"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--border)" />
              </marker>
              <marker
                id="arrowhead-highlighted"
                markerWidth="10"
                markerHeight="7"
                refX="25"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
              </marker>
            </defs>

            {/* Edges */}
            {graph.edges.map((edge) => {
              const fromNode = graph.nodes.find(n => n.id === edge.from)
              const toNode = graph.nodes.find(n => n.id === edge.to)
              if (!fromNode?.x || !toNode?.x) return null

              const isHighlighted = frame?.highlightedEdges?.includes(`${edge.from}-${edge.to}`)

              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  className={`graph-edge ${isHighlighted ? 'highlighted' : ''}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  markerEnd={graph.directed ? (isHighlighted ? 'url(#arrowhead-highlighted)' : 'url(#arrowhead)') : undefined}
                />
              )
            })}

            {/* Nodes */}
            {graph.nodes.map((node) => {
              const isCurrent = frame?.visitingNode === node.id
              const isVisited = frame?.visitedNodes?.includes(node.id)
              const isFrontier = frame?.highlightedNodes?.includes(node.id)
              
              // Quiz mode states
              const nodeValue = parseInt(node.label)
              const isSelected = quizMode && userSelection.includes(nodeValue)
              const selectionIndex = userSelection.indexOf(nodeValue)

              return (
                <g
                  key={node.id}
                  className={`graph-node ${isCurrent ? 'current' : ''} ${
                    isVisited ? 'visited' : ''
                  } ${isFrontier ? 'frontier' : ''} ${
                    isSelected ? 'quiz-selected' : ''
                  } ${quizMode && !isSelected ? 'quiz-clickable' : ''}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => quizMode && handleNodeClick(nodeValue)}
                  style={{ cursor: quizMode && !isSelected ? 'pointer' : 'default' }}
                >
                  <circle r={25} />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected ? 'white' : 'var(--text-primary)'}
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                  {/* Show selection order in quiz mode */}
                  {isSelected && (
                    <text
                      dy="3em"
                      textAnchor="middle"
                      style={{ fill: 'var(--success)', fontSize: '0.7rem', fontWeight: 'bold' }}
                    >
                      #{selectionIndex + 1}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Stack/Queue Visualization */}
        {(frame?.stack || frame?.queue) && (
          <div className="info-panel">
            <h3>{algorithm === 'dfs' ? 'Stack' : 'Queue'}</h3>
            <div className={`data-structure-view ${algorithm === 'bfs' ? 'horizontal' : ''}`}>
              {(algorithm === 'dfs' ? frame?.stack : frame?.queue)?.length === 0 ? (
                <span style={{ color: 'var(--text-secondary)' }}>Empty</span>
              ) : (
                (algorithm === 'dfs' ? [...(frame?.stack || [])].reverse() : frame?.queue || []).map((val, i) => (
                  <span key={i} className={`ds-item ${i === 0 ? 'current' : ''}`}>
                    {val}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {frame?.result && frame.result.length > 0 && (
          <div className="info-panel">
            <h3>Traversal Order</h3>
            <div className="result-display">
              {frame.result.map((val, i) => (
                <span key={i} className="result-item">
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Mode Selection Progress */}
        {quizMode && userSelection.length > 0 && (
          <div className="info-panel quiz-panel">
            <h3>Your Selection ({quizAlgorithm.toUpperCase()})</h3>
            <div className="result-display">
              {userSelection.map((val, i) => (
                <span key={i} className="result-item quiz-item">
                  {val}
                </span>
              ))}
            </div>
            {quizComplete && (
              <div className="quiz-final-result" style={{ marginTop: '1rem' }}>
                <h4>Correct Answer:</h4>
                <div className="result-display">
                  {correctOrder.map((val, i) => (
                    <span key={i} className="result-item correct-item">
                      {val}
                    </span>
                  ))}
                </div>
                <div className="quiz-score-final" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
                  Score: <strong style={{ color: 'var(--success)' }}>
                    {((score.correct - mistakes.length) / score.total * 100).toFixed(0)}%
                  </strong>
                  <span style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
                    ({score.correct - mistakes.length}/{score.total} correct, {mistakes.length} mistakes)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GraphVisualizer
