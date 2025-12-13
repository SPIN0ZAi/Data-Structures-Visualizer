import { useState, useCallback, useEffect, useRef } from 'react';
import { Exercise, ExerciseMode, CodeCheckResult, CodeExplanation } from '../types';
import { exercises } from '../data/exercises';
import { explanations, searchExplanations } from '../data/explanations';

// Helper to highlight matched text in search results
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} style={{ backgroundColor: '#fef08a', padding: '0 2px', borderRadius: 2 }}>{part}</mark> : part
  );
}

// Helper function to strip comments and strings from code for accurate pattern checking
function stripCommentsAndStrings(code: string): string {
  // Remove single-line comments (// ... and -- for Haskell)
  let stripped = code.replace(/\/\/.*$/gm, '');
  stripped = stripped.replace(/--.*$/gm, '');
  
  // Remove multi-line comments /* ... */
  stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove string literals "..." and '...'
  stripped = stripped.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  stripped = stripped.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  
  return stripped;
}

// Check if a pattern is used as actual code (not just a substring)
function isPatternUsedAsCode(code: string, pattern: string): boolean {
  const stripped = stripCommentsAndStrings(code);
  
  // For node access patterns like .iz, .de, .info, check they're used as member access
  if (pattern.startsWith('.')) {
    // Match pattern followed by word boundary or end of identifier usage
    const regex = new RegExp(`\\${pattern}(?![a-zA-Z0-9_])`, 'g');
    return regex.test(stripped);
  }
  
  // For method/class names, use word boundaries
  const regex = new RegExp(`\\b${pattern}\\b`, 'g');
  return regex.test(stripped);
}

// Code checker that validates against allowed/forbidden patterns
function checkCode(code: string, exercise: Exercise): CodeCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const strippedCode = stripCommentsAndStrings(code);

  // Check for forbidden patterns (only in actual code, not comments)
  for (const pattern of exercise.forbiddenPatterns) {
    if (isPatternUsedAsCode(code, pattern)) {
      errors.push(`❌ Forbidden pattern found: "${pattern}" - This is not allowed in ${exercise.mode} mode`);
    }
  }

  // Check for required patterns (at least some should be present)
  const usedPatterns = exercise.allowedPatterns.filter(pattern => 
    isPatternUsedAsCode(code, pattern)
  );

  if (usedPatterns.length === 0 && exercise.allowedPatterns.length > 0) {
    warnings.push(`⚠️ No expected methods detected. Try using: ${exercise.allowedPatterns.slice(0, 3).join(', ')}...`);
  }

  // Check if signature is present (more lenient)
  if (exercise.requiredSignature) {
    // Extract just the method name and check it exists
    const methodNameMatch = exercise.requiredSignature.match(/(\w+)\s*\(/);
    if (methodNameMatch) {
      const methodName = methodNameMatch[1];
      if (!strippedCode.includes(methodName)) {
        warnings.push(`⚠️ Method "${methodName}" not found. Expected signature: ${exercise.requiredSignature}`);
      }
    }
  }

  // Mode-specific checks (only on stripped code)
  if (exercise.mode === 'HIGH_LEVEL') {
    // Check for direct node access patterns
    const lowLevelPatterns = ['.iz', '.de', '.info', 'NodoRaiz', 'NodoCabeza', 'NodoArbol'];
    for (const pat of lowLevelPatterns) {
      if (isPatternUsedAsCode(code, pat)) {
        errors.push(`❌ "${pat}" is low-level access - not allowed in HIGH_LEVEL mode. Use interface methods instead.`);
        break; // Only show one error
      }
    }
  } else if (exercise.mode === 'LOW_LEVEL') {
    const highLevelPatterns = ['EsVacio()', 'SubArbolIzqdo()', 'SubArbolDcho()', 'Raiz()'];
    for (const pat of highLevelPatterns) {
      const methodName = pat.replace('()', '');
      if (isPatternUsedAsCode(code, methodName)) {
        errors.push(`❌ "${methodName}()" is a high-level interface method - not allowed in LOW_LEVEL mode. Use direct node access.`);
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    patternsUsed: usedPatterns
  };
}

// Mode badge colors
const modeColors: Record<ExerciseMode, string> = {
  'HIGH_LEVEL': '#10b981',
  'LOW_LEVEL': '#f59e0b',
  'HYBRID': '#8b5cf6',
  'HASKELL': '#06b6d4'
};

const modeLabels: Record<ExerciseMode, string> = {
  'HIGH_LEVEL': 'High Level',
  'LOW_LEVEL': 'Low Level',
  'HYBRID': 'Hybrid',
  'HASKELL': 'Haskell'
};

const difficultyColors: Record<string, string> = {
  'easy': '#10b981',
  'medium': '#f59e0b',
  'hard': '#ef4444'
};

type LabMode = 'practice' | 'learn';

export default function CodeLab() {
  const [labMode, setLabMode] = useState<LabMode>('learn');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedExplanation, setSelectedExplanation] = useState<CodeExplanation | null>(null);
  const [code, setCode] = useState('');
  const [checkResult, setCheckResult] = useState<CodeCheckResult | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showPatternInfo, setShowPatternInfo] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [smartFeedback, setSmartFeedback] = useState<string[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard shortcut: "/" to focus search (only in learn mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && labMode === 'learn' && !selectedExplanation) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [labMode, selectedExplanation]);

  const topics = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'trees', name: 'Trees & BST', icon: '🌳' },
    { id: 'graphs', name: 'Graphs', icon: '🔗' },
    { id: 'floyd', name: 'Floyd-Warshall', icon: '🛤️' },
    { id: 'huffman', name: 'Huffman', icon: '📦' },
    { id: 'lists', name: 'Lists', icon: '📋' },
    { id: 'queues', name: 'Queues', icon: '🚶' },
    { id: 'stacks', name: 'Stacks', icon: '📚' }
  ];

  const modes = [
    { id: 'all', name: 'All Modes' },
    { id: 'HIGH_LEVEL', name: 'High Level (Interface)' },
    { id: 'LOW_LEVEL', name: 'Low Level (Nodes)' },
    { id: 'HYBRID', name: 'Hybrid (Mixed)' },
    { id: 'HASKELL', name: 'Haskell' }
  ];

  const filteredExercises = exercises.filter(ex => {
    const topicMatch = selectedTopic === 'all' || ex.topic === selectedTopic;
    const modeMatch = selectedMode === 'all' || ex.mode === selectedMode;
    return topicMatch && modeMatch;
  });

  // Use search if user provided a query, otherwise use all explanations
  const searchedExplanations = debouncedQuery.trim() ? searchExplanations(debouncedQuery.trim()) : explanations;

  const filteredExplanations = searchedExplanations.filter(ex => {
    const topicMatch = selectedTopic === 'all' || ex.topic === selectedTopic;
    const modeMatch = selectedMode === 'all' || ex.mode === selectedMode;
    return topicMatch && modeMatch;
  });

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCode(exercise.starterCode);
    setCheckResult(null);
    setShowHints(false);
    setShowSolution(false);
    setSmartFeedback(null);
  }, []);

  const handleSelectExplanation = useCallback((explanation: CodeExplanation) => {
    setSelectedExplanation(explanation);
  }, []);

  const handleCheckCode = useCallback(() => {
    if (selectedExercise) {
      const result = checkCode(code, selectedExercise);
      setCheckResult(result);
      setSmartFeedback(null); // Clear previous feedback
    }
  }, [code, selectedExercise]);

  // Generate smart feedback based on code analysis
  const generateSmartFeedback = useCallback(() => {
    if (!selectedExercise) return;
    
    setIsAnalyzing(true);
    const feedback: string[] = [];
    const strippedCode = stripCommentsAndStrings(code);
    
    // Simulate analysis delay for UX
    setTimeout(() => {
      // Check for common issues
      
      // 1. Check if code is just the starter template
      if (code.trim() === selectedExercise.starterCode.trim()) {
        feedback.push("📝 You haven't modified the starter code yet. Start by implementing the logic!");
      }
      
      // 2. Check for recursion in tree/list problems
      if (['trees', 'lists', 'huffman'].includes(selectedExercise.topic)) {
        const methodName = selectedExercise.requiredSignature?.match(/(\w+)\s*\(/)?.[1];
        if (methodName && !strippedCode.includes(methodName + '(')) {
          feedback.push(`🔄 This looks like a recursive problem. Try calling ${methodName}() on subtrees or sublists.`);
        }
        if (strippedCode.includes('while') || strippedCode.includes('for')) {
          feedback.push("💡 While loops work, this problem is typically solved more elegantly with recursion.");
        }
      }
      
      // 3. Check for base case
      if (selectedExercise.mode !== 'HASKELL') {
        if (!strippedCode.includes('if') && !strippedCode.includes('?')) {
          feedback.push("⚠️ No conditional found. Most recursive methods need a base case (if statement).");
        }
        if (strippedCode.includes('EsVacio') && !strippedCode.includes('return')) {
          feedback.push("🎯 You check EsVacio() but don't seem to return a value. Base case should return something!");
        }
      }
      
      // 4. Check for return statement
      if (selectedExercise.language === 'java' && selectedExercise.requiredSignature?.includes('int')) {
        const returnCount = (strippedCode.match(/return/g) || []).length;
        if (returnCount === 0) {
          feedback.push("❌ No return statement found. The method needs to return an int value.");
        } else if (returnCount === 1) {
          feedback.push("💡 Only one return found. Recursive methods often have 2 returns: base case and recursive case.");
        }
      }
      
      // 5. Mode-specific advice
      if (selectedExercise.mode === 'HIGH_LEVEL') {
        if (!strippedCode.includes('SubArbol')) {
          feedback.push("🌳 In HIGH_LEVEL mode, use SubArbolIzqdo() and SubArbolDcho() to traverse the tree.");
        }
      } else if (selectedExercise.mode === 'LOW_LEVEL') {
        if (!strippedCode.includes('.iz') && !strippedCode.includes('.de')) {
          feedback.push("🔗 In LOW_LEVEL mode, use node.iz and node.de to access child nodes directly.");
        }
      } else if (selectedExercise.mode === 'HASKELL') {
        if (!strippedCode.includes('|') && !strippedCode.includes('where') && !strippedCode.includes('case')) {
          feedback.push("λ Consider using guards (|) or pattern matching for cleaner Haskell code.");
        }
      }
      
      // 6. Topic-specific hints
      if (selectedExercise.topic === 'floyd') {
        if (!strippedCode.includes('MAX_VALUE') && !strippedCode.includes('∞') && !strippedCode.includes('Infinity')) {
          feedback.push("∞ Floyd-Warshall uses infinity for unreachable paths. Check for Integer.MAX_VALUE.");
        }
      }
      
      if (selectedExercise.topic === 'graphs' && strippedCode.includes('BFS')) {
        if (!strippedCode.includes('Cola') && !strippedCode.includes('Queue')) {
          feedback.push("🚶 BFS requires a queue data structure. Use Cola or Queue.");
        }
        if (!strippedCode.includes('visited') && !strippedCode.includes('marcado')) {
          feedback.push("✓ Don't forget to track visited nodes to avoid infinite loops!");
        }
      }
      
      // 7. Good job feedback
      if (feedback.length === 0) {
        const result = checkCode(code, selectedExercise);
        if (result.isValid) {
          feedback.push("✅ Great job! Your code structure looks correct.");
          feedback.push("🧪 Remember this is pattern-based analysis. Test your code with the provided test cases!");
        } else {
          feedback.push("🔍 The pattern check found issues. Review the errors above and fix them.");
        }
      }
      
      setSmartFeedback(feedback);
      setIsAnalyzing(false);
    }, 500); // Small delay for UX
  }, [code, selectedExercise]);

  const handleReset = useCallback(() => {
    if (selectedExercise) {
      setCode(selectedExercise.starterCode);
      setCheckResult(null);
    }
  }, [selectedExercise]);

  // Render explanation detail view
  const renderExplanationDetail = () => {
    if (!selectedExplanation) return null;

    return (
      <div className="explanation-detail">
        <button className="back-btn" onClick={() => setSelectedExplanation(null)}>
          ← Back to explanations
        </button>

        <div className="explanation-header">
          <h2>{selectedExplanation.title}</h2>
          <div className="explanation-badges">
            <span 
              className="mode-badge large"
              style={{ backgroundColor: modeColors[selectedExplanation.mode] }}
            >
              {modeLabels[selectedExplanation.mode]}
            </span>
            <span className="language-tag large">
              {selectedExplanation.language === 'java' ? '☕ Java' : 'λ Haskell'}
            </span>
          </div>
        </div>

        <p className="explanation-description">{selectedExplanation.description}</p>

        {/* Concept Overview */}
        <div className="concept-overview">
          <h3>📖 Concept Overview</h3>
          <div className="concept-text">
            {selectedExplanation.conceptOverview.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* Code with Line-by-Line Comments */}
        <div className="code-explanation-section">
          <h3>💻 Code with Explanations</h3>
          <div className="code-with-comments">
            {selectedExplanation.codeWithComments.map((line, index) => (
              <div key={index} className={`code-line ${line.comment ? 'has-comment' : ''}`}>
                <div className="line-number">{index + 1}</div>
                <div className="line-code">
                  <pre><code>{line.code}</code></pre>
                </div>
                {line.comment && (
                  <div className="line-comment">
                    <span className="comment-arrow">←</span>
                    <span className="comment-text">{line.comment}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Points */}
        <div className="key-points-section">
          <h3>🔑 Key Points to Remember</h3>
          <ul className="key-points-list">
            {selectedExplanation.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Related Exercises */}
        {selectedExplanation.relatedExercises.length > 0 && (
          <div className="related-exercises">
            <h3>📝 Practice This Concept</h3>
            <div className="related-exercises-list">
              {selectedExplanation.relatedExercises.map(exId => {
                const ex = exercises.find(e => e.id === exId);
                if (!ex) return null;
                return (
                  <button 
                    key={exId}
                    className="related-exercise-btn"
                    onClick={() => {
                      setLabMode('practice');
                      setSelectedExplanation(null);
                      handleSelectExercise(ex);
                    }}
                  >
                    <span className="ex-icon">📝</span>
                    <span className="ex-title">{ex.title}</span>
                    <span 
                      className="ex-difficulty"
                      style={{ color: difficultyColors[ex.difficulty] }}
                    >
                      {ex.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render exercise detail view
  const renderExerciseDetail = () => {
    if (!selectedExercise) return null;

    return (
      <div className="exercise-detail">
        <button className="back-btn" onClick={() => setSelectedExercise(null)}>
          ← Back to exercises
        </button>

        <div className="exercise-info">
          <div className="exercise-title-row">
            <h2>{selectedExercise.title}</h2>
            <span 
              className="mode-badge large"
              style={{ backgroundColor: modeColors[selectedExercise.mode] }}
            >
              {modeLabels[selectedExercise.mode]}
            </span>
            <span 
              className="difficulty-badge large"
              style={{ backgroundColor: difficultyColors[selectedExercise.difficulty] }}
            >
              {selectedExercise.difficulty}
            </span>
          </div>
          <p className="exercise-description">{selectedExercise.description}</p>

          {/* Allowed/Forbidden patterns */}
          <div className="constraints-panel">
            <div className="allowed-patterns">
              <strong>✅ Allowed:</strong>
              <div className="pattern-list">
                {selectedExercise.allowedPatterns.map((p, i) => (
                  <code key={i}>{p}</code>
                ))}
              </div>
            </div>
            {selectedExercise.forbiddenPatterns.length > 0 && (
              <div className="forbidden-patterns">
                <strong>❌ Forbidden:</strong>
                <div className="pattern-list">
                  {selectedExercise.forbiddenPatterns.map((p, i) => (
                    <code key={i}>{p}</code>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hints */}
          {selectedExercise.hints && selectedExercise.hints.length > 0 && (
            <div className="hints-section">
              <button 
                className="hints-toggle"
                onClick={() => setShowHints(!showHints)}
              >
                💡 {showHints ? 'Hide Hints' : 'Show Hints'} ({selectedExercise.hints.length})
              </button>
              {showHints && (
                <ul className="hints-list">
                  {selectedExercise.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Show Solution Button */}
          {selectedExercise.solution && (
            <div className="solution-section">
              <button 
                className="solution-toggle"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? '🙈 Hide Solution' : '👀 Show Solution'}
              </button>
              {showSolution && (
                <div className="solution-content">
                  <div className="solution-warning">
                    ⚠️ Try to solve it yourself first! Looking at the solution too early may hinder your learning.
                  </div>
                  <pre className="solution-code">
                    <code>{selectedExercise.solution}</code>
                  </pre>
                  <button 
                    className="copy-solution-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedExercise.solution || '');
                    }}
                  >
                    📋 Copy Solution
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="code-editor-section">
          <div className="editor-header">
            <span className="language-indicator">
              {selectedExercise.language === 'java' ? '☕ Java' : 'λ Haskell'}
            </span>
            <div className="editor-actions">
              <button className="btn btn-secondary" onClick={handleReset}>
                🔄 Reset
              </button>
              <button className="btn btn-primary" onClick={handleCheckCode}>
                ✓ Check Code
              </button>
            </div>
          </div>
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>

        {/* Check Results */}
        {checkResult && (
          <div className={`check-result ${checkResult.isValid ? 'valid' : 'invalid'}`}>
            <h4>
              {checkResult.isValid 
                ? '✅ Code follows the required pattern!' 
                : '❌ Pattern violations found'}
            </h4>
            
            {checkResult.errors.length > 0 && (
              <div className="result-errors">
                {checkResult.errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
            
            {checkResult.warnings.length > 0 && (
              <div className="result-warnings">
                {checkResult.warnings.map((warn, i) => (
                  <p key={i}>{warn}</p>
                ))}
              </div>
            )}
            
            {checkResult.patternsUsed.length > 0 && (
              <div className="patterns-used">
                <strong>Patterns detected:</strong>
                {checkResult.patternsUsed.map((p, i) => (
                  <code key={i}>{p}</code>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart AI Feedback */}
        <div className="smart-feedback-section">
          <button 
            className="smart-feedback-btn"
            onClick={generateSmartFeedback}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '🔄 Analyzing...' : '🤖 Get Smart Feedback'}
          </button>
          
          {smartFeedback && smartFeedback.length > 0 && (
            <div className="smart-feedback-content">
              <h4>🤖 Smart Analysis</h4>
              <ul>
                {smartFeedback.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Test Cases Preview */}
        {selectedExercise.testCases.length > 0 && (
          <div className="test-cases-section">
            <h4>📋 Test Cases</h4>
            <div className="test-cases-list">
              {selectedExercise.testCases.map((tc, i) => (
                <div key={i} className="test-case">
                  <strong>{tc.name}</strong>
                  <div className="test-io">
                    <span><strong>Input:</strong> <code>{tc.input}</code></span>
                    <span><strong>Expected:</strong> <code>{tc.expected}</code></span>
                  </div>
                  {tc.description && <p className="test-desc">{tc.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="codelab-container">
      <div className="page-header">
        <h1>🧪 CodeLab</h1>
        <p>Learn data structures with explained code or practice with exam-style exercises</p>
      </div>

      {/* Main Mode Toggle */}
      <div className="lab-mode-toggle">
        <button 
          className={`lab-mode-btn ${labMode === 'learn' ? 'active' : ''}`}
          onClick={() => { setLabMode('learn'); setSelectedExercise(null); setSelectedExplanation(null); }}
        >
          <span className="mode-icon">📖</span>
          <span className="mode-title">Learn</span>
          <span className="mode-desc">Code explanations with line-by-line comments</span>
        </button>
        <button 
          className={`lab-mode-btn ${labMode === 'practice' ? 'active' : ''}`}
          onClick={() => { setLabMode('practice'); setSelectedExercise(null); setSelectedExplanation(null); }}
        >
          <span className="mode-icon">📝</span>
          <span className="mode-title">Practice</span>
          <span className="mode-desc">Exam-style exercises to test your skills</span>
        </button>
      </div>

      {/* LEARN MODE */}
      {labMode === 'learn' && !selectedExplanation && (
        <>
          {/* Filters */}
          <div className="codelab-filters">
            <div className="filter-group">
              <label>Topic:</label>
              <div className="filter-buttons">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    className={`filter-btn ${selectedTopic === topic.id ? 'active' : ''}`}
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    {topic.icon} {topic.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label>Mode:</label>
              <div className="filter-buttons">
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    className={`filter-btn ${selectedMode === mode.id ? 'active' : ''}`}
                    onClick={() => setSelectedMode(mode.id)}
                    style={mode.id !== 'all' ? { borderColor: modeColors[mode.id as ExerciseMode] } : {}}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Explanations Grid */}
          {/* Search bar for quick lookup */}
          <div className="learn-search" style={{ margin: '12px 0', display: 'flex', gap: 8 }}>
            <input
              ref={searchInputRef}
              className="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search explanations (title, topic, keywords)... Press / to focus"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            {searchQuery && (
              <button
                className="btn btn-secondary"
                onClick={() => setSearchQuery('')}
                style={{ padding: '8px 12px' }}
              >
                ✖ Clear
              </button>
            )}
          </div>
          <div className="explanation-grid">
            {filteredExplanations.length === 0 ? (
              <div className="no-exercises">
                {debouncedQuery.trim() ? (
                  <>
                    <p>🔍 No explanations found for "<strong>{debouncedQuery}</strong>"</p>
                    <p style={{ fontSize: '0.9em', color: '#64748b', marginTop: 8 }}>
                      Try searching for: <em>maxleaf</em>, <em>height</em>, <em>floyd</em>, <em>huffman</em>, <em>BST</em>, <em>heap</em>, <em>graph</em>
                    </p>
                  </>
                ) : (
                  <p>No explanations match your filters. Try selecting different options.</p>
                )}
              </div>
            ) : (
              filteredExplanations.map(explanation => (
                <div 
                  key={explanation.id} 
                  className="explanation-card"
                  onClick={() => handleSelectExplanation(explanation)}
                >
                  <div className="card-header">
                    <span 
                      className="mode-badge"
                      style={{ backgroundColor: modeColors[explanation.mode] }}
                    >
                      {modeLabels[explanation.mode]}
                    </span>
                    <span className="language-tag">
                      {explanation.language === 'java' ? '☕' : 'λ'}
                    </span>
                  </div>
                  <h3>{highlightMatch(explanation.title, debouncedQuery)}</h3>
                  <p>{highlightMatch(explanation.description, debouncedQuery)}</p>
                  <div className="card-footer">
                    <span className="topic-tag">{explanation.topic}</span>
                    <span className="code-lines">{explanation.codeWithComments.length} lines explained</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Learn Mode - Detail View */}
      {labMode === 'learn' && selectedExplanation && renderExplanationDetail()}

      {/* PRACTICE MODE */}
      {labMode === 'practice' && !selectedExercise && (
        <>
          {/* Pattern Info Toggle */}
          <div className="pattern-info-toggle">
            <button 
              className={`btn ${showPatternInfo ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setShowPatternInfo(!showPatternInfo)}
            >
              {showPatternInfo ? 'Hide' : 'Show'} Pattern Reference Guide
            </button>
          </div>

          {showPatternInfo && (
            <div className="patterns-info">
              <h3>📖 Coding Modes Reference</h3>
              
              <div className="pattern-section">
                <h4 style={{ color: modeColors['HIGH_LEVEL'] }}>🔵 HIGH_LEVEL Mode</h4>
                <p>Use only abstract interface methods. No direct node manipulation.</p>
                <div className="pattern-grid">
                  <div className="allowed">
                    <strong>✅ Allowed:</strong>
                    <code>EsVacio(), Raiz(), SubArbolIzqdo(), SubArbolDcho()</code>
                    <code>Cabeza(), Cola(), EsVacia(), Add()</code>
                    <code>Tope(), APila(), DesaPila()</code>
                    <code>EnCola(), Resto()</code>
                  </div>
                  <div className="forbidden">
                    <strong>❌ Forbidden:</strong>
                    <code>NodoRaiz, NodoCabeza, NodoFinal</code>
                    <code>.iz, .de, .info, .Siguiente</code>
                  </div>
                </div>
              </div>

              <div className="pattern-section">
                <h4 style={{ color: modeColors['LOW_LEVEL'] }}>🟠 LOW_LEVEL Mode</h4>
                <p>Direct node access only. No interface abstraction.</p>
                <div className="pattern-grid">
                  <div className="allowed">
                    <strong>✅ Allowed:</strong>
                    <code>NodoRaiz, NodoCabeza, NodoFinal</code>
                    <code>.iz, .de, .info</code>
                    <code>.Siguiente, .Info</code>
                    <code>new NodoArbol(), new Nodo()</code>
                  </div>
                  <div className="forbidden">
                    <strong>❌ Forbidden:</strong>
                    <code>EsVacio(), SubArbolIzqdo(), SubArbolDcho()</code>
                    <code>Cabeza(), Cola(), Tope()</code>
                    <code>All interface methods</code>
                  </div>
                </div>
              </div>

              <div className="pattern-section">
                <h4 style={{ color: modeColors['HYBRID'] }}>🟣 HYBRID Mode</h4>
                <p>Mix of both styles. Usually requires using both appropriately.</p>
              </div>

              <div className="pattern-section">
                <h4 style={{ color: modeColors['HASKELL'] }}>🔷 HASKELL Mode</h4>
                <p>Functional style with pattern matching.</p>
                <div className="pattern-grid">
                  <div className="allowed">
                    <strong>Common Patterns:</strong>
                    <code>data Arbol a = AV | AB a (Arbol a) (Arbol a)</code>
                    <code>data Lista a = Vacia | Cons a (Lista a)</code>
                    <code>Pattern matching: f AV = ...; f (AB r i d) = ...</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="codelab-filters">
            <div className="filter-group">
              <label>Topic:</label>
              <div className="filter-buttons">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    className={`filter-btn ${selectedTopic === topic.id ? 'active' : ''}`}
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    {topic.icon} {topic.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label>Mode:</label>
              <div className="filter-buttons">
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    className={`filter-btn ${selectedMode === mode.id ? 'active' : ''}`}
                    onClick={() => setSelectedMode(mode.id)}
                    style={mode.id !== 'all' ? { borderColor: modeColors[mode.id as ExerciseMode] } : {}}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="exercise-grid">
            {filteredExercises.length === 0 ? (
              <div className="no-exercises">
                <p>No exercises match your filters. Try selecting different options.</p>
              </div>
            ) : (
              filteredExercises.map(exercise => (
                <div 
                  key={exercise.id} 
                  className="exercise-card"
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <div className="exercise-header">
                    <span 
                      className="mode-badge"
                      style={{ backgroundColor: modeColors[exercise.mode] }}
                    >
                      {modeLabels[exercise.mode]}
                    </span>
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: difficultyColors[exercise.difficulty] }}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                  <h3>{exercise.title}</h3>
                  <p>{exercise.description}</p>
                  <div className="exercise-meta">
                    <span className="language-tag">{exercise.language}</span>
                    <span className="topic-tag">{exercise.topic}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Practice Mode - Detail View */}
      {labMode === 'practice' && selectedExercise && renderExerciseDetail()}
    </div>
  );
}
