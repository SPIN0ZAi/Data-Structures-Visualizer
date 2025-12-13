import { useState, useEffect, useCallback, useRef } from 'react'
import { HuffmanNode, HuffmanSymbol } from '../types'
import {
  buildHuffmanTree,
  generateHuffmanCodes,
  calculateAverageLength,
  getSampleSymbols,
  HuffmanStep,
} from '../algorithms/huffmanAlgorithm'

// Calculate positions for a single tree in the forest
function calculateTreePositions(
  node: HuffmanNode | null,
  startX: number,
  startY: number,
  levelHeight: number = 50
): { width: number; nodes: Array<{ node: HuffmanNode; x: number; y: number }> } {
  if (!node) return { width: 0, nodes: [] }

  const nodes: Array<{ node: HuffmanNode; x: number; y: number }> = []
  const nodeWidth = 55
  const minSpacing = 10

  function getTreeWidth(n: HuffmanNode | null): number {
    if (!n) return 0
    if (!n.left && !n.right) return nodeWidth
    return getTreeWidth(n.left) + minSpacing + getTreeWidth(n.right)
  }

  function positionNodes(n: HuffmanNode, x: number, y: number, availableWidth: number): void {
    nodes.push({ node: n, x, y })
    n.x = x
    n.y = y

    if (n.left && n.right) {
      const leftWidth = getTreeWidth(n.left)
      const rightWidth = getTreeWidth(n.right)
      const totalWidth = leftWidth + minSpacing + rightWidth
      const scale = Math.min(1, availableWidth / totalWidth)
      
      const leftX = x - (rightWidth * scale) / 2 - minSpacing / 2
      const rightX = x + (leftWidth * scale) / 2 + minSpacing / 2
      
      positionNodes(n.left, leftX, y + levelHeight, leftWidth * scale)
      positionNodes(n.right, rightX, y + levelHeight, rightWidth * scale)
    }
  }

  const width = getTreeWidth(node)
  positionNodes(node, startX + width / 2, startY, width)
  
  return { width, nodes }
}

// Get all edges from a tree
function getTreeEdges(node: HuffmanNode | null): Array<{ from: HuffmanNode; to: HuffmanNode; label: string }> {
  if (!node) return []
  const edges: Array<{ from: HuffmanNode; to: HuffmanNode; label: string }> = []
  
  if (node.left) {
    edges.push({ from: node, to: node.left, label: '0' })
    edges.push(...getTreeEdges(node.left))
  }
  if (node.right) {
    edges.push({ from: node, to: node.right, label: '1' })
    edges.push(...getTreeEdges(node.right))
  }
  
  return edges
}

function HuffmanVisualizer() {
  const [symbols, setSymbols] = useState<HuffmanSymbol[]>(getSampleSymbols())
  const [symbolInput, setSymbolInput] = useState('')
  const [freqInput, setFreqInput] = useState('')
  const [steps, setSteps] = useState<HuffmanStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [codes, setCodes] = useState<Map<string, string>>(new Map())
  const [message, setMessage] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 })

  // Quiz Mode State
  const [quizMode, setQuizMode] = useState(false)
  const [quizType, setQuizType] = useState<'encode' | 'decode'>('encode')
  const [quizQuestion, setQuizQuestion] = useState('')
  const [quizAnswer, setQuizAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })

  // Easter Egg State 🥚
  const [showGinesEasterEgg, setShowGinesEasterEgg] = useState(false)

  // Input Mode State
  const [inputMode, setInputMode] = useState<'symbol' | 'text'>('symbol')
  const [textInput, setTextInput] = useState('')

  // Update dimensions
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

  // Add symbol
  const addSymbol = useCallback(() => {
    if (!symbolInput.trim() || !freqInput.trim()) {
      setMessage('Enter both symbol and frequency')
      return
    }

    const freq = parseFloat(freqInput)
    if (isNaN(freq) || freq <= 0) {
      setMessage('Frequency must be a positive number')
      return
    }

    if (symbols.some(s => s.symbol === symbolInput.trim())) {
      setMessage('Symbol already exists')
      return
    }

    // 🥚 Easter Egg: Check for Ginés!
    const inputLower = symbolInput.trim().toLowerCase()
    if (inputLower === 'gines' || inputLower === 'ginés') {
      setShowGinesEasterEgg(true)
      setSymbolInput('')
      setFreqInput('')
      setMessage('🎉 You found the secret!')
      return
    }

    setSymbols(prev => [...prev, { symbol: symbolInput.trim(), frequency: freq }])
    setSymbolInput('')
    setFreqInput('')
    setMessage('')
    // Reset when symbols change
    setSteps([])
    setCurrentStep(0)
    setCodes(new Map())
  }, [symbolInput, freqInput, symbols])

  // Remove symbol
  const removeSymbol = useCallback((symbol: string) => {
    setSymbols(prev => prev.filter(s => s.symbol !== symbol))
    setSteps([])
    setCurrentStep(0)
    setCodes(new Map())
  }, [])

  // Parse text input and calculate frequencies
  const parseTextInput = useCallback(() => {
    if (!textInput.trim()) {
      setMessage('Enter some text to analyze')
      return
    }

    const text = textInput.trim()
    
    // 🥚 Easter Egg: Check if text contains "gines" or "ginés"
    const textLower = text.toLowerCase()
    if (textLower.includes('gines') || textLower.includes('ginés')) {
      setShowGinesEasterEgg(true)
      setMessage('🎉 You found the secret!')
      return
    }

    // Calculate character frequencies
    const freqMap = new Map<string, number>()
    for (const char of text) {
      freqMap.set(char, (freqMap.get(char) || 0) + 1)
    }

    // Convert to symbols array
    const newSymbols: HuffmanSymbol[] = Array.from(freqMap.entries()).map(([symbol, frequency]) => ({
      symbol,
      frequency
    }))

    if (newSymbols.length < 2) {
      setMessage('Need at least 2 different characters')
      return
    }

    setSymbols(newSymbols)
    setTextInput('')
    setMessage(`Parsed "${text.length > 20 ? text.slice(0, 20) + '...' : text}" - Found ${newSymbols.length} unique characters`)
    setSteps([])
    setCurrentStep(0)
    setCodes(new Map())
  }, [textInput])

  // Build Huffman tree - generates all steps
  const buildTree = useCallback(() => {
    if (symbols.length < 2) {
      setMessage('Need at least 2 symbols')
      return
    }

    const { tree: finalTree, steps: newSteps } = buildHuffmanTree(symbols)
    
    if (finalTree && newSteps.length > 0) {
      setSteps(newSteps)
      setCurrentStep(0)
      setIsPlaying(false)
      
      // Generate codes from final tree
      const newCodes = generateHuffmanCodes(finalTree)
      setCodes(newCodes)
      
      setMessage(`Built! Use controls to step through ${newSteps.length} steps.`)
    }
  }, [symbols])

  // Animation playback
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return

    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, steps, speed])

  // Load sample data
  const loadSample = useCallback(() => {
    setSymbols(getSampleSymbols())
    setSteps([])
    setCurrentStep(0)
    setCodes(new Map())
    setMessage('Loaded sample data. Click "Build Tree" to start.')
  }, [])

  // Step controls
  const stepForward = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps.length])

  const stepBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const skipToEnd = useCallback(() => {
    setCurrentStep(steps.length - 1)
    setIsPlaying(false)
  }, [steps.length])

  const skipToStart = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  // Quiz functions
  const startQuiz = useCallback((type: 'encode' | 'decode') => {
    if (codes.size === 0) {
      setMessage('Build Huffman tree first')
      return
    }
    
    setQuizType(type)
    
    if (type === 'encode') {
      const symbolList = Array.from(codes.keys())
      const randomSymbol = symbolList[Math.floor(Math.random() * symbolList.length)]
      setQuizQuestion(randomSymbol)
      setQuizAnswer(codes.get(randomSymbol) || '')
    } else {
      const entries = Array.from(codes.entries())
      const [symbol, code] = entries[Math.floor(Math.random() * entries.length)]
      setQuizQuestion(code)
      setQuizAnswer(symbol)
    }
    
    setUserAnswer('')
    setQuizFeedback(null)
    setQuizMode(true)
  }, [codes])

  const checkQuizAnswer = useCallback(() => {
    const isCorrect = userAnswer.trim() === quizAnswer

    setQuizFeedback({
      correct: isCorrect,
      message: isCorrect
        ? `✅ Correct!`
        : `❌ Wrong! Answer: "${quizAnswer}"`
    })

    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }))
  }, [userAnswer, quizAnswer])

  const nextQuizQuestion = useCallback(() => {
    if (quizType === 'encode') {
      const symbolList = Array.from(codes.keys())
      const randomSymbol = symbolList[Math.floor(Math.random() * symbolList.length)]
      setQuizQuestion(randomSymbol)
      setQuizAnswer(codes.get(randomSymbol) || '')
    } else {
      const entries = Array.from(codes.entries())
      const [symbol, code] = entries[Math.floor(Math.random() * entries.length)]
      setQuizQuestion(code)
      setQuizAnswer(symbol)
    }
    
    setUserAnswer('')
    setQuizFeedback(null)
  }, [codes, quizType])

  const resetQuiz = useCallback(() => {
    setQuizMode(false)
    setUserAnswer('')
    setQuizFeedback(null)
    setQuizScore({ correct: 0, total: 0 })
  }, [])

  // Calculate forest visualization for current step
  const currentStepData = steps[currentStep]
  const forestData = currentStepData ? (() => {
    const forest = currentStepData.forest
    const allNodes: Array<{ node: HuffmanNode; x: number; y: number }> = []
    const allEdges: Array<{ from: HuffmanNode; to: HuffmanNode; label: string }> = []
    
    // Calculate spacing for forest
    const padding = 30
    const spacing = 20
    let currentX = padding
    
    // Calculate total width needed
    const treeWidths = forest.map(tree => {
      const result = calculateTreePositions(tree, 0, 0)
      return result.width || 55
    })
    const totalWidth = treeWidths.reduce((a, b) => a + b, 0) + (forest.length - 1) * spacing
    
    // Scale if needed
    const availableWidth = dimensions.width - 2 * padding
    const scale = totalWidth > availableWidth ? availableWidth / totalWidth : 1
    
    // Position each tree in the forest
    currentX = padding + (availableWidth - totalWidth * scale) / 2
    
    forest.forEach((tree, index) => {
      const treeWidth = treeWidths[index] * scale
      const result = calculateTreePositions(tree, currentX, 60, 55)
      
      // Scale positions
      result.nodes.forEach(n => {
        n.x = currentX + (n.x - currentX) * scale + treeWidth / 2 - (treeWidths[index] * scale) / 2
        n.node.x = n.x
        n.node.y = n.y
        allNodes.push(n)
      })
      
      // Get edges for this tree
      const edges = getTreeEdges(tree)
      allEdges.push(...edges)
      
      currentX += treeWidth + spacing * scale
    })
    
    return { nodes: allNodes, edges: allEdges, merged: currentStepData.merged }
  })() : { nodes: [], edges: [], merged: undefined }

  const avgLength = codes.size > 0 ? calculateAverageLength(symbols, codes) : 0

  return (
    <div className="visualizer-page">
      <div className="controls-panel">
        {/* Theory Section */}
        <div className="controls-section">
          <h3>📖 Theory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Huffman coding</strong> creates optimal prefix-free codes by building a binary tree.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Repeatedly merge the two smallest nodes until one tree remains.
          </p>
        </div>

        {/* Add Symbol */}
        <div className="controls-section">
          <h3>Input Mode</h3>
          <div className="controls-row" style={{ marginBottom: '0.75rem' }}>
            <button 
              className={inputMode === 'symbol' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setInputMode('symbol')}
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
            >
              Symbol + Freq
            </button>
            <button 
              className={inputMode === 'text' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setInputMode('text')}
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
            >
              Text String
            </button>
          </div>

          {inputMode === 'symbol' ? (
            <div className="controls-group">
              <div className="controls-row">
                <input
                  type="text"
                  placeholder="Symbol"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  style={{ width: '60px' }}
                  maxLength={3}
                />
                <input
                  type="number"
                  placeholder="Freq"
                  value={freqInput}
                  onChange={(e) => setFreqInput(e.target.value)}
                  style={{ width: '80px' }}
                  min="0"
                  step="1"
                />
                <button className="btn-primary" onClick={addSymbol}>
                  Add
                </button>
              </div>
              <button className="btn-secondary" onClick={loadSample} style={{ marginTop: '0.5rem' }}>
                Load Sample
              </button>
            </div>
          ) : (
            <div className="controls-group">
              <input
                type="text"
                placeholder="Enter text like 'ABRACADABRA' or 'hello world'"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && parseTextInput()}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <div className="controls-row">
                <button className="btn-primary" onClick={parseTextInput} style={{ flex: 1 }}>
                  Calculate Frequencies
                </button>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Enter any text and we'll count character frequencies automatically!
              </p>
            </div>
          )}
        </div>

        {/* Current Symbols */}
        <div className="controls-section">
          <h3>Symbols ({symbols.length})</h3>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {symbols.map((s) => (
              <div
                key={s.symbol}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.2rem 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  '{s.symbol}': {s.frequency}
                </span>
                <button
                  onClick={() => removeSymbol(s.symbol)}
                  style={{
                    background: 'transparent',
                    color: 'var(--danger)',
                    padding: '0.125rem 0.5rem',
                    fontSize: '0.7rem',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Build Tree */}
        <div className="controls-section">
          <h3>Build Tree</h3>
          <button 
            className="btn-success" 
            onClick={buildTree}
            style={{ width: '100%' }}
          >
            Build Huffman Tree
          </button>
        </div>

        {/* Step-by-Step Controls */}
        {steps.length > 0 && (
          <div className="controls-section">
            <h3>Animation</h3>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: '600' }}>
              Step {currentStep + 1} / {steps.length}
            </div>
            <div className="controls-row" style={{ justifyContent: 'center', gap: '0.25rem' }}>
              <button
                className="btn-secondary"
                onClick={skipToStart}
                disabled={currentStep === 0}
                title="Skip to Start"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                ⏮
              </button>
              <button
                className="btn-secondary"
                onClick={stepBack}
                disabled={currentStep === 0}
                title="Step Back"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                ◀
              </button>
              <button
                className="btn-primary"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause' : 'Play'}
                style={{ padding: '0.4rem 0.8rem' }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                className="btn-secondary"
                onClick={stepForward}
                disabled={currentStep >= steps.length - 1}
                title="Step Forward"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                ▶
              </button>
              <button
                className="btn-secondary"
                onClick={skipToEnd}
                disabled={currentStep >= steps.length - 1}
                title="Skip to End"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                ⏭
              </button>
            </div>
            <div className="speed-control" style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem' }}>Speed:</span>
              <input
                type="range"
                min="200"
                max="2000"
                value={2200 - speed}
                onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Quiz Mode */}
        {codes.size > 0 && !quizMode && (
          <div className="controls-section">
            <h3>🧪 Quiz Mode</h3>
            <div className="controls-group">
              <button className="btn-quiz" onClick={() => startQuiz('encode')}>
                Quiz: Encode
              </button>
              <button className="btn-quiz" onClick={() => startQuiz('decode')} style={{ marginTop: '0.5rem' }}>
                Quiz: Decode
              </button>
            </div>
          </div>
        )}

        {quizMode && (
          <div className="controls-section">
            <h3>🧪 Quiz</h3>
            <div className="quiz-info">
              <div className="quiz-progress">
                <strong>{quizType === 'encode' ? 'Encode' : 'Decode'}</strong>
                <span>{quizScore.correct}/{quizScore.total}</span>
              </div>
              <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                {quizType === 'encode' ? (
                  <span>Symbol: <strong style={{ fontSize: '1.2rem' }}>'{quizQuestion}'</strong></span>
                ) : (
                  <span>Code: <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{quizQuestion}</strong></span>
                )}
              </div>
              <div className="quiz-input-row">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={quizType === 'encode' ? 'e.g., 101' : 'e.g., A'}
                  onKeyPress={(e) => e.key === 'Enter' && checkQuizAnswer()}
                />
                <button className="btn-primary" onClick={checkQuizAnswer}>
                  Check
                </button>
              </div>
              {quizFeedback && (
                <div className={`quiz-feedback ${quizFeedback.correct ? 'correct' : 'incorrect'}`}>
                  {quizFeedback.message}
                </div>
              )}
              <div className="controls-row" style={{ marginTop: '0.5rem' }}>
                <button className="btn-secondary" onClick={nextQuizQuestion}>
                  Next
                </button>
                <button className="btn-secondary" onClick={resetQuiz}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="visualization-panel">
        {/* Message */}
        {(message || currentStepData?.message) && (
          <div className="info-panel" style={{ 
            background: currentStepData?.merged ? 'rgba(99, 102, 241, 0.1)' : undefined,
            borderColor: currentStepData?.merged ? 'var(--primary)' : undefined
          }}>
            <p style={{ margin: 0, fontWeight: currentStepData?.merged ? '600' : '400' }}>
              {currentStepData?.message || message}
            </p>
          </div>
        )}

        {/* Forest Visualization */}
        <div className="visualization-canvas" style={{ minHeight: '400px' }}>
          <svg ref={svgRef} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {forestData.edges.map(({ from, to, label }, idx) => {
              const isMergedEdge = forestData.merged && 
                (forestData.merged.result.id === from.id)
              
              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isMergedEdge ? 'var(--primary)' : 'var(--text-secondary)'}
                    strokeWidth={isMergedEdge ? 3 : 2}
                    opacity={0.7}
                  />
                  <text
                    x={(from.x! + to.x!) / 2 + (label === '0' ? -12 : 8)}
                    y={(from.y! + to.y!) / 2}
                    fill="var(--warning)"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {label}
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {forestData.nodes.map(({ node }) => {
              const isLeaf = node.symbol !== null
              const isMergedNode = forestData.merged && 
                (forestData.merged.left.id === node.id || 
                 forestData.merged.right.id === node.id)
              const isResultNode = forestData.merged && 
                forestData.merged.result.id === node.id

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ transition: 'transform 0.3s ease' }}
                >
                  {/* Highlight ring for merged nodes */}
                  {(isMergedNode || isResultNode) && (
                    <circle
                      r={32}
                      fill="none"
                      stroke={isResultNode ? 'var(--secondary)' : 'var(--primary)'}
                      strokeWidth={3}
                      opacity={0.6}
                    />
                  )}
                  
                  {/* Node circle/rect */}
                  {isLeaf ? (
                    <rect
                      x={-25}
                      y={-22}
                      width={50}
                      height={44}
                      rx={8}
                      fill={isMergedNode ? 'var(--primary)' : 'var(--secondary)'}
                      stroke={isMergedNode ? 'var(--primary)' : 'var(--secondary)'}
                      strokeWidth={2}
                    />
                  ) : (
                    <circle
                      r={24}
                      fill={isResultNode ? 'var(--primary)' : 'var(--bg-card)'}
                      stroke={isResultNode ? 'var(--secondary)' : 'var(--primary)'}
                      strokeWidth={2}
                    />
                  )}
                  
                  {/* Node label */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={isLeaf ? 16 : 14}
                    fontWeight="700"
                    dy={isLeaf ? -6 : 0}
                  >
                    {isLeaf ? node.symbol : node.weight}
                  </text>
                  
                  {/* Weight for leaf nodes */}
                  {isLeaf && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.8)"
                      fontSize={11}
                      dy={10}
                    >
                      {node.weight}
                    </text>
                  )}
                </g>
              )
            })}

            {/* "Trees in forest" label */}
            {steps.length > 0 && currentStepData && (
              <text
                x={dimensions.width / 2}
                y={dimensions.height - 15}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="12"
              >
                Forest: {currentStepData.forest.length} tree{currentStepData.forest.length !== 1 ? 's' : ''}
              </text>
            )}
          </svg>
        </div>

        {/* Codes Table - only show when complete */}
        {codes.size > 0 && currentStep === steps.length - 1 && (
          <div className="info-panel">
            <h3>Huffman Codes (Avg Length: {avgLength.toFixed(2)} bits)</h3>
            <table className="code-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Freq</th>
                  <th>Code</th>
                  <th>Bits</th>
                </tr>
              </thead>
              <tbody>
                {symbols
                  .sort((a, b) => b.frequency - a.frequency)
                  .map((s) => {
                    const code = codes.get(s.symbol) || ''
                    return (
                      <tr key={s.symbol}>
                        <td style={{ fontWeight: '600' }}>'{s.symbol}'</td>
                        <td>{s.frequency}</td>
                        <td style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{code}</td>
                        <td>{code.length}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* How it works */}
        {steps.length === 0 && (
          <div className="info-panel">
            <h3>How Huffman Coding Works</h3>
            <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>
              <li>Create a leaf node for each symbol with its frequency</li>
              <li>Put all nodes in a priority queue (sorted by frequency)</li>
              <li>While there is more than one node:</li>
              <li style={{ marginLeft: '1rem' }}>• Remove the two nodes with lowest frequency</li>
              <li style={{ marginLeft: '1rem' }}>• Create a new internal node with these as children</li>
              <li style={{ marginLeft: '1rem' }}>• The new node's weight = sum of children's weights</li>
              <li style={{ marginLeft: '1rem' }}>• Add the new node back to the queue</li>
              <li>The remaining node is the root of the Huffman tree</li>
              <li>Codes: traverse left = 0, right = 1</li>
            </ol>
          </div>
        )}
      </div>

      {/* 🥚 Ginés Easter Egg Modal */}
      {showGinesEasterEgg && (
        <div 
          className="easter-egg-overlay"
          onClick={() => setShowGinesEasterEgg(false)}
        >
          <div className="easter-egg-content" onClick={e => e.stopPropagation()}>
            <button 
              className="easter-egg-close"
              onClick={() => setShowGinesEasterEgg(false)}
            >
              ✕
            </button>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>🎉 ¡Has encontrado el secreto!</h2>
            <img 
              src="/images/gines-meme.jpg" 
              alt="Ginés Meme" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '60vh',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
              }} 
            />
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Dedicated to our beloved professor Ginés 😂
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HuffmanVisualizer
