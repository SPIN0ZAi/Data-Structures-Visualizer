import { useState, useEffect, useCallback, useRef } from 'react'
import { TreeNode, TreeType, TraversalType, AnimationFrame } from '../types'
import {
  bstInsert,
  avlInsert,
  resetNodeCounter,
  calculateTreePositions,
  getAllNodes,
  getAllEdges,
  getBalanceFactor,
  isValidBST,
  isValidAVL,
  preorderTraversal,
  inorderTraversal,
  postorderTraversal,
  levelOrderTraversal,
} from '../algorithms/treeAlgorithms'

// Helper to get correct traversal order
function getCorrectOrder(tree: TreeNode, type: TraversalType): number[] {
  const frames = type === 'preorder' ? preorderTraversal(tree)
    : type === 'inorder' ? inorderTraversal(tree)
    : type === 'postorder' ? postorderTraversal(tree)
    : levelOrderTraversal(tree);
  
  // Get final result from last frame
  const lastFrame = frames[frames.length - 1];
  return lastFrame?.result || [];
}

function TreeVisualizer() {
  const [treeType, setTreeType] = useState<TreeType>('bst')
  const [inputValues, setInputValues] = useState('7 4 9 3 6 12 21 16 25')
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [animationFrames, setAnimationFrames] = useState<AnimationFrame[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [message, setMessage] = useState('')
  const [rotationLog, setRotationLog] = useState<string[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  // Quiz Mode State
  const [quizMode, setQuizMode] = useState(false)
  const [quizType, setQuizType] = useState<TraversalType>('inorder')
  const [userSelection, setUserSelection] = useState<number[]>([])
  const [correctOrder, setCorrectOrder] = useState<number[]>([])
  const [mistakes, setMistakes] = useState<number[]>([]) // indices where user made mistakes
  const [quizComplete, setQuizComplete] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [animateBuild, setAnimateBuild] = useState(true) // toggle for animated vs instant build
  const [buildQueue, setBuildQueue] = useState<number[]>([]) // queue for animated building
  const [isBuildingAnimated, setIsBuildingAnimated] = useState(false)

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

  // Recalculate positions when tree or dimensions change
  useEffect(() => {
    if (tree) {
      calculateTreePositions(tree, dimensions.width, dimensions.height)
      setTree({ ...tree })
    }
  }, [dimensions])

  // Build tree from input
  const buildTree = useCallback(() => {
    resetNodeCounter()
    setRotationLog([])
    setMessage('')
    setAnimationFrames([])
    setCurrentFrame(0)
    setIsBuildingAnimated(false)

    const values = inputValues
      .split(/[\s,]+/)
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v))

    if (values.length === 0) {
      setMessage('Please enter valid numbers')
      setTree(null)
      return
    }

    if (animateBuild) {
      // Animated building: start with empty tree and queue values
      setTree(null)
      setBuildQueue(values)
      setIsBuildingAnimated(true)
      setMessage(`Building ${treeType.toUpperCase()} tree with animation...`)
    } else {
      // Instant building: build all at once
      let newTree: TreeNode | null = null
      const rotations: string[] = []

      values.forEach((value, index) => {
        if (treeType === 'avl') {
          const result = avlInsert(newTree, value)
          newTree = result.root
          result.rotations.forEach(r => {
            rotations.push(`Step ${index + 1}: ${r.type} rotation at node ${r.nodeValue}`)
          })
        } else {
          newTree = bstInsert(newTree, value)
        }
      })

      if (newTree) {
        calculateTreePositions(newTree, dimensions.width, dimensions.height)
      }

      setTree(newTree)
      setRotationLog(rotations)
      setMessage(`Built ${treeType.toUpperCase()} tree with values: [${values.join(', ')}]`)
    }
  }, [inputValues, treeType, dimensions, animateBuild])

  // Animated build effect
  useEffect(() => {
    if (!isBuildingAnimated || buildQueue.length === 0) {
      if (isBuildingAnimated && buildQueue.length === 0) {
        setIsBuildingAnimated(false)
        setMessage(`Built ${treeType.toUpperCase()} tree with animation complete!`)
      }
      return
    }

    const timer = setTimeout(() => {
      const [nextValue, ...remaining] = buildQueue
      
      setTree(prevTree => {
        let newTree: TreeNode | null = prevTree
        
        if (treeType === 'avl') {
          const result = avlInsert(newTree, nextValue)
          newTree = result.root
          if (result.rotations.length > 0) {
            setRotationLog(prev => [
              ...prev,
              ...result.rotations.map(r => `${r.type} rotation at node ${r.nodeValue}`)
            ])
          }
        } else {
          newTree = bstInsert(newTree, nextValue)
        }

        if (newTree) {
          calculateTreePositions(newTree, dimensions.width, dimensions.height)
        }

        return newTree
      })

      setBuildQueue(remaining)
      setMessage(`Inserting: ${nextValue} (${remaining.length} remaining)`)
    }, speed)

    return () => clearTimeout(timer)
  }, [isBuildingAnimated, buildQueue, treeType, dimensions, speed])

  // Run traversal
  const runTraversal = useCallback((type: TraversalType) => {
    if (!tree) {
      setMessage('Build a tree first')
      return
    }

    let frames: AnimationFrame[] = []
    switch (type) {
      case 'preorder':
        frames = preorderTraversal(tree)
        break
      case 'inorder':
        frames = inorderTraversal(tree)
        break
      case 'postorder':
        frames = postorderTraversal(tree)
        break
      case 'levelorder':
        frames = levelOrderTraversal(tree)
        break
    }

    setAnimationFrames(frames)
    setCurrentFrame(0)
    setIsPlaying(true)
  }, [tree])

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

  // Validation
  const checkBST = useCallback(() => {
    if (!tree) {
      setMessage('Build a tree first')
      return
    }
    const result = isValidBST(tree)
    setMessage(result.valid ? '✓ Valid BST!' : `✗ Invalid BST: ${result.message}`)
  }, [tree])

  const checkAVL = useCallback(() => {
    if (!tree) {
      setMessage('Build a tree first')
      return
    }
    const bstResult = isValidBST(tree)
    if (!bstResult.valid) {
      setMessage(`✗ Not AVL: ${bstResult.message}`)
      return
    }
    const avlResult = isValidAVL(tree)
    setMessage(avlResult.valid ? '✓ Valid AVL Tree!' : `✗ Invalid AVL: ${avlResult.message}`)
  }, [tree])

  // Start Quiz Mode
  const startQuiz = useCallback((type: TraversalType) => {
    if (!tree) {
      setMessage('Build a tree first')
      return
    }
    
    const order = getCorrectOrder(tree, type)
    setCorrectOrder(order)
    setQuizType(type)
    setUserSelection([])
    setMistakes([])
    setQuizComplete(false)
    setQuizMode(true)
    setScore({ correct: 0, total: order.length })
    setMessage(`🧪 Quiz Mode: Click nodes in ${type.toUpperCase()} order`)
    setAnimationFrames([])
    setCurrentFrame(0)
  }, [tree])

  // Handle node click in quiz mode
  const handleNodeClick = useCallback((nodeValue: number) => {
    if (!quizMode || quizComplete) return
    
    const currentIndex = userSelection.length
    const expectedValue = correctOrder[currentIndex]
    
    if (nodeValue === expectedValue) {
      // Correct!
      const newSelection = [...userSelection, nodeValue]
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
      setMessage(`❌ Wrong! Expected ${expectedValue}, you clicked ${nodeValue}. Continue to find the correct path.`)
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

  // Get current frame data
  const frame = animationFrames[currentFrame - 1]
  const nodes = tree ? getAllNodes(tree) : []
  const edges = tree ? getAllEdges(tree) : []

  return (
    <div className="visualizer-page">
      <div className="controls-panel">
        {/* Theory Section */}
        <div className="controls-section">
          <h3>📖 Theory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>BST:</strong> Left subtree contains smaller values, right subtree contains larger values.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            <strong>AVL:</strong> Self-balancing BST where the height difference between left and right subtrees is at most 1.
          </p>
        </div>

        {/* Tree Type Selection */}
        <div className="controls-section">
          <h3>Tree Type</h3>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${treeType === 'bst' ? 'active' : ''}`}
              onClick={() => setTreeType('bst')}
            >
              BST
            </button>
            <button
              className={`toggle-btn ${treeType === 'avl' ? 'active' : ''}`}
              onClick={() => setTreeType('avl')}
            >
              AVL
            </button>
          </div>
        </div>

        {/* Input Values */}
        <div className="controls-section">
          <h3>Input Values</h3>
          <div className="controls-group">
            <input
              type="text"
              value={inputValues}
              onChange={(e) => setInputValues(e.target.value)}
              placeholder="e.g., 7 4 9 3 6 12"
              disabled={isBuildingAnimated}
            />
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                checked={animateBuild}
                onChange={(e) => setAnimateBuild(e.target.checked)}
                disabled={isBuildingAnimated}
              />
              Show build animation
            </label>
            <button 
              className="btn-primary" 
              onClick={buildTree}
              disabled={isBuildingAnimated}
            >
              {isBuildingAnimated ? 'Building...' : 'Build Tree'}
            </button>
          </div>
        </div>

        {/* Traversals */}
        <div className="controls-section">
          <h3>Traversals</h3>
          <div className="controls-group">
            <div className="controls-row">
              <button className="btn-secondary" onClick={() => runTraversal('preorder')}>
                Preorder
              </button>
              <button className="btn-secondary" onClick={() => runTraversal('inorder')}>
                Inorder
              </button>
            </div>
            <div className="controls-row">
              <button className="btn-secondary" onClick={() => runTraversal('postorder')}>
                Postorder
              </button>
              <button className="btn-secondary" onClick={() => runTraversal('levelorder')}>
                Level-order
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Mode */}
        <div className="controls-section">
          <h3>🧪 Quiz Mode</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Test yourself! Click nodes in the correct order.
          </p>
          {!quizMode ? (
            <div className="controls-group">
              <div className="controls-row">
                <button className="btn-quiz" onClick={() => startQuiz('preorder')}>
                  Test Preorder
                </button>
                <button className="btn-quiz" onClick={() => startQuiz('inorder')}>
                  Test Inorder
                </button>
              </div>
              <div className="controls-row">
                <button className="btn-quiz" onClick={() => startQuiz('postorder')}>
                  Test Postorder
                </button>
                <button className="btn-quiz" onClick={() => startQuiz('levelorder')}>
                  Test Level-order
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-info">
              <div className="quiz-progress">
                <strong>Testing: {quizType.toUpperCase()}</strong>
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

        {/* Validation */}
        <div className="controls-section">
          <h3>Validation</h3>
          <div className="controls-row">
            <button className="btn-secondary" onClick={checkBST}>
              Check BST
            </button>
            <button className="btn-secondary" onClick={checkAVL}>
              Check AVL
            </button>
          </div>
        </div>

        {/* Rotation Log (AVL) */}
        {rotationLog.length > 0 && (
          <div className="controls-section">
            <h3>Rotations</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>
              {rotationLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="visualization-panel">
        {/* Message */}
        {(message || frame?.message) && (
          <div className="info-panel">
            <p>{frame?.message || message}</p>
          </div>
        )}

        {/* Tree Canvas */}
        <div className="visualization-canvas">
          <svg ref={svgRef} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
            {/* Edges */}
            {edges.map(({ from, to }) => (
              <line
                key={`${from.id}-${to.id}`}
                className={`tree-edge ${
                  frame?.highlightedEdges?.includes(`${from.id}-${to.id}`) ? 'highlighted' : ''
                }`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
            ))}

            {/* Nodes */}
            {nodes.map((node) => {
              const isVisiting = frame?.visitingNode === node.id
              const isVisited = frame?.visitedNodes?.includes(node.id)
              const isHighlighted = frame?.highlightedNodes?.includes(node.id)
              
              // Quiz mode states
              const isSelected = quizMode && userSelection.includes(node.value)
              const selectionIndex = userSelection.indexOf(node.value)

              return (
                <g
                  key={node.id}
                  className={`tree-node ${isVisiting ? 'visiting' : ''} ${
                    isVisited ? 'visited' : ''
                  } ${isHighlighted ? 'highlighted' : ''} ${
                    isSelected ? 'quiz-selected' : ''
                  } ${quizMode && !isSelected ? 'quiz-clickable' : ''}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => quizMode && handleNodeClick(node.value)}
                  style={{ cursor: quizMode && !isSelected ? 'pointer' : 'default' }}
                >
                  <circle r={25} />
                  <text dy="0.35em">{node.value}</text>
                  {treeType === 'avl' && (
                    <text
                      className="balance-factor"
                      dy="-2em"
                      textAnchor="middle"
                    >
                      bf: {getBalanceFactor(node)}
                    </text>
                  )}
                  {/* Show selection order in quiz mode */}
                  {isSelected && (
                    <text
                      className="quiz-order"
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

        {/* Traversal Result */}
        {frame?.result && frame.result.length > 0 && (
          <div className="info-panel">
            <h3>Traversal Result</h3>
            <div className="result-display">
              {frame.result.map((val, i) => (
                <span key={i} className="result-item">
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Queue (for level-order) */}
        {frame?.queue && (
          <div className="info-panel">
            <h3>Queue</h3>
            <div className="data-structure-view horizontal">
              {frame.queue.length === 0 ? (
                <span style={{ color: 'var(--text-secondary)' }}>Empty</span>
              ) : (
                frame.queue.map((val, i) => (
                  <span key={i} className={`ds-item ${i === 0 ? 'current' : ''}`}>
                    {val}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Quiz Mode Selection Progress */}
        {quizMode && userSelection.length > 0 && (
          <div className="info-panel quiz-panel">
            <h3>Your Selection ({quizType.toUpperCase()})</h3>
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

export default TreeVisualizer
