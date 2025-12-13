import { useState, useCallback } from 'react'
import { FloydResult } from '../types'
import {
  floydWarshall,
  reconstructPath,
  findMinCycle,
  createSampleMatrix,
  formatMatrixValue,
  parseMatrixValue,
} from '../algorithms/floydAlgorithm'

const INF = Infinity

function FloydVisualizer() {
  const [size, setSize] = useState(4)
  const [matrix, setMatrix] = useState<number[][]>(() => createSampleMatrix(4))
  const [result, setResult] = useState<FloydResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [pathFrom, setPathFrom] = useState(0)
  const [pathTo, setPathTo] = useState(3)
  const [path, setPath] = useState<number[]>([])
  const [message, setMessage] = useState('')

  // Quiz Mode State
  const [quizMode, setQuizMode] = useState(false)
  const [quizType, setQuizType] = useState<'distance' | 'path'>('distance')
  const [quizFrom, setQuizFrom] = useState(0)
  const [quizTo, setQuizTo] = useState(3)
  const [userAnswer, setUserAnswer] = useState('')
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })

  // Update matrix size
  const updateSize = useCallback((newSize: number) => {
    const s = Math.min(10, Math.max(2, newSize))
    setSize(s)
    setMatrix(createSampleMatrix(s))
    setResult(null)
    setCurrentStep(0)
    setPath([])
  }, [])

  // Update matrix cell
  const updateCell = useCallback((i: number, j: number, value: string) => {
    setMatrix(prev => {
      const newMatrix = prev.map(row => [...row])
      newMatrix[i][j] = parseMatrixValue(value)
      return newMatrix
    })
  }, [])

  // Run Floyd-Warshall
  const runFloyd = useCallback(() => {
    const res = floydWarshall(matrix)
    setResult(res)
    setCurrentStep(0)
    setPath([])
    setMessage(`Floyd-Warshall completed with ${res.steps.length} steps`)
  }, [matrix])

  // Step through algorithm
  const nextStep = useCallback(() => {
    if (result && currentStep < result.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [result, currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Find path
  const findPath = useCallback(() => {
    if (!result) {
      setMessage('Run Floyd-Warshall first')
      return
    }

    const p = reconstructPath(result.predecessors, pathFrom, pathTo)
    setPath(p)

    if (p.length === 0) {
      setMessage(`No path exists from ${pathFrom} to ${pathTo}`)
    } else {
      const dist = result.distances[pathFrom][pathTo]
      setMessage(`Shortest path from ${pathFrom} to ${pathTo}: [${p.join(' → ')}] with distance ${formatMatrixValue(dist)}`)
    }
  }, [result, pathFrom, pathTo])

  // Find minimum cycle
  const findCycle = useCallback(() => {
    if (!result) {
      setMessage('Run Floyd-Warshall first')
      return
    }

    const cycle = findMinCycle(result.distances)
    if (cycle) {
      setMessage(`🔄 Minimum cycle: [${cycle.cycle.join(' → ')}] with weight ${cycle.weight}`)
    } else {
      setMessage('⚠️ No cycle exists in this graph. A cycle requires a path from i→j and back j→i.')
    }
  }, [result])

  // Start Quiz Mode
  const startQuiz = useCallback((type: 'distance' | 'path') => {
    if (!result) {
      setMessage('Run Floyd-Warshall first')
      return
    }
    
    // Generate random from/to nodes
    const from = Math.floor(Math.random() * size)
    let to = Math.floor(Math.random() * size)
    while (to === from) {
      to = Math.floor(Math.random() * size)
    }
    
    setQuizType(type)
    setQuizFrom(from)
    setQuizTo(to)
    setUserAnswer('')
    setQuizFeedback(null)
    setQuizMode(true)
    setMessage(`🧪 Quiz: What is the ${type === 'distance' ? 'shortest distance' : 'shortest path'} from ${from} to ${to}?`)
  }, [result, size])

  // Check Quiz Answer
  const checkAnswer = useCallback(() => {
    if (!result) return

    const correctDistance = result.distances[quizFrom][quizTo]
    const correctPath = reconstructPath(result.predecessors, quizFrom, quizTo)

    if (quizType === 'distance') {
      const userDist = parseMatrixValue(userAnswer)
      const isCorrect = userDist === correctDistance

      setQuizFeedback({
        correct: isCorrect,
        message: isCorrect 
          ? `✅ Correct! The shortest distance from ${quizFrom} to ${quizTo} is ${formatMatrixValue(correctDistance)}`
          : `❌ Wrong! You answered ${userAnswer}, but the correct distance is ${formatMatrixValue(correctDistance)}`
      })

      setQuizScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }))
    } else {
      // Path quiz - parse user input like "0, 1, 3" or "0 -> 1 -> 3"
      const userPath = userAnswer
        .replace(/→|->|,/g, ' ')
        .split(/\s+/)
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n))

      const isCorrect = JSON.stringify(userPath) === JSON.stringify(correctPath)

      setQuizFeedback({
        correct: isCorrect,
        message: isCorrect
          ? `✅ Correct! The shortest path from ${quizFrom} to ${quizTo} is [${correctPath.join(' → ')}]`
          : `❌ Wrong! You answered [${userPath.join(' → ')}], but the correct path is [${correctPath.join(' → ')}]`
      })

      setQuizScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }))
    }
  }, [result, quizFrom, quizTo, quizType, userAnswer])

  // Next Quiz Question
  const nextQuizQuestion = useCallback(() => {
    const from = Math.floor(Math.random() * size)
    let to = Math.floor(Math.random() * size)
    while (to === from) {
      to = Math.floor(Math.random() * size)
    }
    
    setQuizFrom(from)
    setQuizTo(to)
    setUserAnswer('')
    setQuizFeedback(null)
    setMessage(`🧪 Quiz: What is the ${quizType === 'distance' ? 'shortest distance' : 'shortest path'} from ${from} to ${to}?`)
  }, [size, quizType])

  // Reset Quiz
  const resetQuiz = useCallback(() => {
    setQuizMode(false)
    setUserAnswer('')
    setQuizFeedback(null)
    setMessage('')
  }, [])

  // Get current display matrix
  const currentMatrix = result 
    ? (result.steps[currentStep]?.matrix || result.distances)
    : matrix

  const currentK = result?.steps[currentStep]?.k ?? -1

  return (
    <div className="visualizer-page">
      <div className="controls-panel">
        {/* Theory Section */}
        <div className="controls-section">
          <h3>📖 Theory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Floyd-Warshall</strong> finds shortest paths between all pairs of vertices.
            It works by considering each vertex as an intermediate node and updating distances.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Formula: <code>D[i][j] = min(D[i][j], D[i][k] + D[k][j])</code>
          </p>
        </div>

        {/* Matrix Size */}
        <div className="controls-section">
          <h3>Matrix Size</h3>
          <div className="controls-row">
            <input
              type="number"
              min="2"
              max="10"
              value={size}
              onChange={(e) => updateSize(parseInt(e.target.value) || 2)}
              style={{ width: '60px' }}
            />
            <button className="btn-secondary" onClick={() => setMatrix(createSampleMatrix(size))}>
              Reset
            </button>
          </div>
        </div>

        {/* Run Algorithm */}
        <div className="controls-section">
          <h3>Algorithm</h3>
          <button className="btn-primary" onClick={runFloyd}>
            Run Floyd-Warshall
          </button>
        </div>

        {/* Step Controls */}
        {result && (
          <div className="controls-section">
            <h3>Step Through</h3>
            <div className="controls-row">
              <button className="btn-secondary" onClick={prevStep} disabled={currentStep === 0}>
                ◀ Prev
              </button>
              <button className="btn-secondary" onClick={nextStep} disabled={currentStep >= result.steps.length - 1}>
                Next ▶
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              Step {currentStep + 1} / {result.steps.length}
              {currentK >= 0 && <span> (k = {currentK})</span>}
            </div>
          </div>
        )}

        {/* Path Finding */}
        {result && (
          <div className="controls-section">
            <h3>Find Path</h3>
            <div className="controls-group">
              <div className="controls-row">
                <label style={{ fontSize: '0.75rem' }}>From:</label>
                <input
                  type="number"
                  min="0"
                  max={size - 1}
                  value={pathFrom}
                  onChange={(e) => setPathFrom(parseInt(e.target.value) || 0)}
                  style={{ width: '50px' }}
                />
                <label style={{ fontSize: '0.75rem' }}>To:</label>
                <input
                  type="number"
                  min="0"
                  max={size - 1}
                  value={pathTo}
                  onChange={(e) => setPathTo(parseInt(e.target.value) || 0)}
                  style={{ width: '50px' }}
                />
              </div>
              <div className="controls-row">
                <button className="btn-success" onClick={findPath}>
                  Find Path
                </button>
                <button className="btn-warning" onClick={findCycle}>
                  Find Cycle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Mode */}
        {result && (
          <div className="controls-section">
            <h3>🧪 Quiz Mode</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Test your Floyd-Warshall knowledge!
            </p>
            {!quizMode ? (
              <div className="controls-group">
                <button className="btn-quiz" onClick={() => startQuiz('distance')}>
                  Quiz: Distance
                </button>
                <button className="btn-quiz" onClick={() => startQuiz('path')} style={{ marginTop: '0.5rem' }}>
                  Quiz: Path
                </button>
              </div>
            ) : (
              <div className="quiz-info">
                <div className="quiz-progress">
                  <strong>Question: {quizType === 'distance' ? 'Distance' : 'Path'}</strong>
                  <span>{quizScore.correct}/{quizScore.total}</span>
                </div>
                <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong>From {quizFrom} to {quizTo}</strong>
                </div>
                <div className="quiz-input-row">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={quizType === 'distance' ? 'e.g., 5 or ∞' : 'e.g., 0, 1, 3'}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                  />
                  <button className="btn-primary" onClick={checkAnswer}>
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
                    Next Question
                  </button>
                  <button className="btn-secondary" onClick={resetQuiz}>
                    Exit Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="visualization-panel">
        {/* Message */}
        {message && (
          <div className="info-panel">
            <p>{message}</p>
          </div>
        )}

        {/* Input Matrix */}
        <div className="info-panel">
          <h3>{result ? 'Distance Matrix' : 'Adjacency Matrix'} (∞ = no edge)</h3>
          <div className="matrix-container">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th></th>
                  {Array.from({ length: size }, (_, i) => (
                    <th key={i}>{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentMatrix.map((row, i) => (
                  <tr key={i}>
                    <th>{i}</th>
                    {row.map((cell, j) => {
                      const isOnPath = path.includes(i) && path.includes(j) &&
                        Math.abs(path.indexOf(i) - path.indexOf(j)) === 1 &&
                        path.indexOf(i) < path.indexOf(j)
                      const isKRow = currentK >= 0 && i === currentK
                      const isKCol = currentK >= 0 && j === currentK
                      
                      return (
                        <td
                          key={j}
                          className={`matrix-cell ${isOnPath ? 'path' : ''} ${
                            isKRow || isKCol ? 'current-k' : ''
                          }`}
                        >
                          {result ? (
                            formatMatrixValue(cell)
                          ) : (
                            <input
                              type="text"
                              value={cell === INF ? '∞' : cell}
                              onChange={(e) => updateCell(i, j, e.target.value)}
                            />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Path Display */}
        {path.length > 0 && (
          <div className="info-panel">
            <h3>Shortest Path</h3>
            <div className="result-display">
              {path.map((node, i) => (
                <span key={i}>
                  <span className="result-item">{node}</span>
                  {i < path.length - 1 && <span style={{ margin: '0 0.25rem' }}>→</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Algorithm Explanation */}
        <div className="info-panel">
          <h3>How It Works</h3>
          <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>
            <li>Initialize distance matrix with edge weights (∞ for no edge)</li>
            <li>For each intermediate vertex k (0 to n-1):
              <ul>
                <li>For each pair (i, j), check if path through k is shorter</li>
                <li>Update: D[i][j] = min(D[i][j], D[i][k] + D[k][j])</li>
              </ul>
            </li>
            <li>Final matrix contains shortest distances between all pairs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default FloydVisualizer
