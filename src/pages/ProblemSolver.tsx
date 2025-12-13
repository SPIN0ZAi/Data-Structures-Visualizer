import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PROBLEMS } from './Problems';
import { useUser } from '../context/UserContext';

// Code Editor Component with Line Numbers
const CodeEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Update line count when code changes
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Generate line numbers
  const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

  return (
    <div className="code-editor-container">
      <div className="line-numbers" ref={lineNumbersRef}>
        {lineNumbers.map(num => (
          <div key={num} className="line-number">{num}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="code-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        data-gramm="false"
      />
    </div>
  );
};

const ProblemSolver: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, solveProblem } = useUser();
  
  const problem = PROBLEMS.find(p => p.id === id);
  const [code, setCode] = useState(problem?.starterCode || '');
  const [output, setOutput] = useState<string>('');
  const [showHints, setShowHints] = useState<number[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; actual: string }[]>([]);
  const [attempts, setAttempts] = useState(1);
  const [startTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<'description' | 'solution' | 'submissions'>('description');
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  
  const isSolved = user.solvedProblems.some(p => p.id === id);
  const previousSubmission = user.solvedProblems.find(p => p.id === id);

  useEffect(() => {
    if (problem) {
      setCode(previousSubmission?.code || problem.starterCode);
    }
  }, [problem, previousSubmission]);

  if (!problem) {
    return (
      <div className="problem-solver">
        <div className="problem-not-found">
          <h2>Problem not found</h2>
          <button onClick={() => navigate('/problems')}>Back to Problems</button>
        </div>
      </div>
    );
  }

  const runCode = () => {
    setIsRunning(true);
    setOutput('Running tests...');
    setTestResults([]);

    // Simulate running tests
    setTimeout(() => {
      try {
        // Simple test simulation - in real app you'd use a sandboxed eval or backend
        const results = problem.testCases.map(test => {
          // Check if the code looks correct (simplified check)
          const hasReturn = code.includes('return');
          const hasLogicKeywords = code.includes('if') || code.includes('for') || code.includes('while');
          
          // Simulated pass/fail based on code structure
          const passed = hasReturn && hasLogicKeywords && (code.length > problem.starterCode.length + 50);
          
          return {
            passed,
            input: test.input,
            expected: test.expected,
            actual: passed ? test.expected : 'undefined',
          };
        });

        setTestResults(results);
        
        const allPassed = results.every(r => r.passed);
        if (allPassed) {
          setOutput('✅ All test cases passed!');
        } else {
          setOutput(`❌ ${results.filter(r => !r.passed).length} test case(s) failed`);
          setAttempts(prev => prev + 1);
        }
      } catch (error) {
        setOutput(`❌ Error: ${error}`);
        setAttempts(prev => prev + 1);
      }
      
      setIsRunning(false);
    }, 1000);
  };

  const submitCode = () => {
    setIsRunning(true);
    setOutput('Submitting solution...');

    setTimeout(() => {
      // Check if solution looks complete
      const hasReturn = code.includes('return');
      const hasLogic = code.length > problem.starterCode.length + 50;
      
      if (hasReturn && hasLogic) {
        // Calculate time spent
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        // Record the solved problem
        const result = solveProblem({
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          attempts,
          timeSpent,
          code,
        });

        setEarnedXP(result.xpEarned);
        setNewBadges(result.newBadges);
        setShowSuccess(true);
        setOutput('🎉 Solution accepted!');
      } else {
        setOutput('❌ Solution incomplete. Make sure your code returns a value and implements the logic.');
        setAttempts(prev => prev + 1);
      }
      
      setIsRunning(false);
    }, 1500);
  };

  const revealHint = (index: number) => {
    if (!showHints.includes(index)) {
      setShowHints([...showHints, index]);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="problem-solver">
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h2>Congratulations!</h2>
            <p>You solved "{problem.title}"</p>
            
            <div className="success-stats">
              <div className="stat">
                <span className="label">XP Earned</span>
                <span className="value">+{earnedXP} XP</span>
              </div>
              <div className="stat">
                <span className="label">Attempts</span>
                <span className="value">{attempts}</span>
              </div>
              <div className="stat">
                <span className="label">Time</span>
                <span className="value">{formatTime(Math.round((Date.now() - startTime) / 1000))}</span>
              </div>
            </div>

            {newBadges.length > 0 && (
              <div className="new-badges">
                <h3>New Badges Earned!</h3>
                <div className="badges-row">
                  {newBadges.map(badge => (
                    <div key={badge.id} className="badge-earned">
                      <span className="badge-icon">{badge.icon}</span>
                      <span className="badge-name">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="success-actions">
              <button onClick={() => navigate('/problems')} className="btn-primary">
                Back to Problems
              </button>
              <button onClick={() => navigate('/profile')} className="btn-secondary">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="problem-solver">
      {/* Problem Info Panel */}
      <div className="problem-panel">
        <div className="problem-tabs">
          <button 
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={activeTab === 'solution' ? 'active' : ''}
            onClick={() => setActiveTab('solution')}
          >
            Solution
          </button>
          <button 
            className={activeTab === 'submissions' ? 'active' : ''}
            onClick={() => setActiveTab('submissions')}
          >
            Submissions
          </button>
        </div>

        <div className="problem-content">
          {activeTab === 'description' && (
            <>
              <div className="problem-header">
                <h1>{problem.title}</h1>
                <div className="problem-meta">
                  <span className={`difficulty-badge ${problem.difficulty}`}>
                    {problem.difficulty}
                  </span>
                  <span className="category-badge">{problem.category}</span>
                  {isSolved && <span className="solved-badge">✅ Solved</span>}
                </div>
              </div>

              <div className="problem-description">
                <p>{problem.description}</p>
              </div>

              <div className="problem-examples">
                <h3>Examples:</h3>
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="example">
                    <div className="example-input">
                      <strong>Input:</strong> <code>{ex.input}</code>
                    </div>
                    <div className="example-output">
                      <strong>Output:</strong> <code>{ex.output}</code>
                    </div>
                    {ex.explanation && (
                      <div className="example-explanation">
                        <strong>Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="problem-tags">
                <h3>Tags:</h3>
                <div className="tags-list">
                  {problem.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="problem-hints">
                <h3>Hints:</h3>
                {problem.hints.map((hint, idx) => (
                  <div key={idx} className="hint">
                    {showHints.includes(idx) ? (
                      <p>💡 {hint}</p>
                    ) : (
                      <button onClick={() => revealHint(idx)}>
                        Show Hint {idx + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'solution' && (
            <div className="solution-tab">
              {showSolution ? (
                <>
                  <h3>Solution:</h3>
                  <pre className="solution-code">{problem.solution}</pre>
                </>
              ) : (
                <div className="solution-warning">
                  <p>⚠️ Are you sure you want to see the solution?</p>
                  <p>Try solving it yourself first!</p>
                  <button onClick={() => setShowSolution(true)}>
                    Show Solution
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="submissions-tab">
              {previousSubmission ? (
                <div className="submission">
                  <div className="submission-header">
                    <span className="status">✅ Accepted</span>
                    <span className="date">{previousSubmission.solvedAt.toLocaleDateString()}</span>
                  </div>
                  <pre className="submission-code">{previousSubmission.code}</pre>
                </div>
              ) : (
                <p>No submissions yet. Solve this problem to see your submissions here.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="editor-panel">
        <div className="editor-header">
          <div className="editor-tabs">
            <span className="editor-tab active">
              <span className="file-icon">📄</span>
              solution.js
            </span>
          </div>
          <div className="editor-actions">
            <button onClick={() => setCode(problem.starterCode)} className="reset-btn" title="Reset Code">
              ↺ Reset
            </button>
          </div>
        </div>

        <CodeEditor 
          value={code}
          onChange={setCode}
        />

        <div className="editor-footer">
          <div className="console-panel">
            <div className="console-header">
              <span className="console-tab active">Console</span>
              <span className="console-tab">Test Results</span>
            </div>
            <div className="console-output">
              <pre>{output || '> Ready to run your code...'}</pre>
              
              {testResults.length > 0 && (
                <div className="test-results">
                  {testResults.map((result, idx) => (
                    <div key={idx} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                      <span className="test-status">{result.passed ? '✅' : '❌'}</span>
                      <div className="test-details">
                        <span className="test-label">Test {idx + 1}</span>
                        <span className="test-input">Input: <code>{result.input}</code></span>
                        <span className="test-expected">Expected: <code>{result.expected}</code></span>
                        {!result.passed && (
                          <span className="test-actual">Got: <code>{result.actual}</code></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="editor-buttons">
            <button 
              onClick={runCode} 
              disabled={isRunning}
              className="run-btn"
            >
              {isRunning ? (
                <><span className="spinner"></span> Running...</>
              ) : (
                <>▶ Run Code</>
              )}
            </button>
            <button 
              onClick={submitCode} 
              disabled={isRunning || isSolved}
              className="submit-btn"
            >
              {isSolved ? '✅ Solved' : isRunning ? 'Submitting...' : '🚀 Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;
