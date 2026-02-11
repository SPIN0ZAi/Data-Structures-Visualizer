import { useState, useEffect } from 'react';
import {
  simulateDekker,
  generateRandomPattern,
  dekkerCodeP0,
  dekkerCodeP1,
  DekkerStep,
} from '../algorithms/dekkerAlgorithm';
import './DekkerVisualizer.css';

export default function DekkerVisualizer() {
  const [steps, setSteps] = useState<DekkerStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [pattern, setPattern] = useState<number[]>([0, 1, 0, 1]);
  const [customPattern, setCustomPattern] = useState('0,1,0,1');
  const [showExplanation, setShowExplanation] = useState(true);

  // Initialize simulation
  useEffect(() => {
    const newSteps = simulateDekker(pattern);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [pattern]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const currentStepData = steps[currentStep] || steps[0];

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePlayPause = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRandomPattern = () => {
    const newPattern = generateRandomPattern(4);
    setPattern(newPattern);
    setCustomPattern(newPattern.join(','));
  };

  const handleCustomPattern = () => {
    try {
      const newPattern = customPattern
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => n === 0 || n === 1);
      if (newPattern.length > 0) {
        setPattern(newPattern);
      }
    } catch (e) {
      alert('Invalid pattern. Use format: 0,1,0,1');
    }
  };

  const presetPatterns = [
    { name: 'Alternating', pattern: [0, 1, 0, 1] },
    { name: 'P0 Heavy', pattern: [0, 0, 0, 1] },
    { name: 'P1 Heavy', pattern: [1, 1, 1, 0] },
    { name: 'Conflict', pattern: [0, 1, 1, 0, 0, 1] },
  ];

  if (!currentStepData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dekker-visualizer">
      <div className="dekker-header">
        <h1>🔒 Dekker's Algorithm Visualizer</h1>
        <p className="dekker-subtitle">
          Interactive simulation of mutual exclusion for concurrent processes
        </p>
      </div>

      {showExplanation && (
        <div className="explanation-banner">
          <button
            className="close-explanation"
            onClick={() => setShowExplanation(false)}
            aria-label="Close explanation"
          >
            ×
          </button>
          <h3>💡 What is Dekker's Algorithm?</h3>
          <p>
            Dekker's algorithm is a mutual exclusion solution that allows two processes to share a
            single-use resource without conflicts. It uses two flags and a turn variable to ensure
            only one process can be in the critical section at a time.
          </p>
          <div className="explanation-concepts">
            <div className="concept">
              <strong>flag[i]:</strong> Process i wants to enter critical section
            </div>
            <div className="concept">
              <strong>turn:</strong> Whose turn it is to enter when both want to enter
            </div>
            <div className="concept">
              <strong>Critical Section:</strong> Code that must not be executed by multiple
              processes simultaneously
            </div>
          </div>
        </div>
      )}

      <div className="dekker-main-content">
        {/* Visual State */}
        <div className="state-visualization">
          <h3>Current State</h3>
          <div className="state-grid">
            <div className="state-row">
              <div className="state-label">flag[0]</div>
              <div className={`state-value ${currentStepData.flag0 ? 'active' : ''}`}>
                {currentStepData.flag0 ? 'true' : 'false'}
              </div>
            </div>
            <div className="state-row">
              <div className="state-label">flag[1]</div>
              <div className={`state-value ${currentStepData.flag1 ? 'active' : ''}`}>
                {currentStepData.flag1 ? 'true' : 'false'}
              </div>
            </div>
            <div className="state-row">
              <div className="state-label">turn</div>
              <div className={`state-value turn-${currentStepData.turn}`}>
                {currentStepData.turn}
              </div>
            </div>
          </div>

          {/* Process Visual */}
          <div className="processes-visual">
            <div
              className={`process-box ${
                currentStepData.process === 0 ? 'active' : ''
              } ${currentStepData.inCriticalSection === 0 ? 'in-critical' : ''}`}
            >
              <div className="process-header">
                <span className="process-icon">⚙️</span>
                <span className="process-name">Process 0</span>
              </div>
              <div className="process-status">
                {currentStepData.inCriticalSection === 0 && (
                  <span className="status-badge critical">In Critical Section</span>
                )}
                {currentStepData.flag0 && currentStepData.inCriticalSection !== 0 && (
                  <span className="status-badge requesting">Requesting Entry</span>
                )}
                {!currentStepData.flag0 && <span className="status-badge idle">Idle</span>}
              </div>
            </div>

            <div className="critical-section-visual">
              <div className="critical-section-label">Critical Section</div>
              <div className="critical-section-box">
                {currentStepData.inCriticalSection !== null ? (
                  <div className="in-section">Process {currentStepData.inCriticalSection}</div>
                ) : (
                  <div className="empty-section">Empty</div>
                )}
              </div>
            </div>

            <div
              className={`process-box ${
                currentStepData.process === 1 ? 'active' : ''
              } ${currentStepData.inCriticalSection === 1 ? 'in-critical' : ''}`}
            >
              <div className="process-header">
                <span className="process-icon">⚙️</span>
                <span className="process-name">Process 1</span>
              </div>
              <div className="process-status">
                {currentStepData.inCriticalSection === 1 && (
                  <span className="status-badge critical">In Critical Section</span>
                )}
                {currentStepData.flag1 && currentStepData.inCriticalSection !== 1 && (
                  <span className="status-badge requesting">Requesting Entry</span>
                )}
                {!currentStepData.flag1 && <span className="status-badge idle">Idle</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Code View */}
        <div className="code-section">
          <h3>Algorithm Code</h3>
          <div className="code-panels">
            <div className="code-panel">
              <h4>Process 0</h4>
              <pre className="code-block">
                {dekkerCodeP0.map((line, idx) => (
                  <div
                    key={idx}
                    className={`code-line ${
                      currentStepData.codeLineP0 === idx ? 'highlight' : ''
                    }`}
                  >
                    <span className="line-number">{idx}</span>
                    <span className="line-content">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
            <div className="code-panel">
              <h4>Process 1</h4>
              <pre className="code-block">
                {dekkerCodeP1.map((line, idx) => (
                  <div
                    key={idx}
                    className={`code-line ${
                      currentStepData.codeLineP1 === idx ? 'highlight' : ''
                    }`}
                  >
                    <span className="line-number">{idx}</span>
                    <span className="line-content">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Step Description */}
      <div className="step-description">
        <div className="step-header">
          <span className="step-number">
            Step {currentStepData.stepNumber + 1} of {steps.length}
          </span>
          <span className="step-action">{currentStepData.action}</span>
        </div>
        <p className="step-text">{currentStepData.description}</p>
      </div>

      {/* Controls */}
      <div className="controls-panel">
        <div className="playback-controls">
          <button onClick={handlePrev} disabled={currentStep === 0} className="control-btn">
            ⏮️ Prev
          </button>
          <button onClick={handlePlayPause} className="control-btn play-btn">
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
            className="control-btn"
          >
            Next ⏭️
          </button>
          <button onClick={handleReset} className="control-btn">
            🔄 Reset
          </button>
        </div>

        <div className="speed-control">
          <label>Speed:</label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
          <span>{((2200 - speed) / 1000).toFixed(1)}x</span>
        </div>

        <div className="step-slider">
          <label>Jump to step:</label>
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStep}
            onChange={(e) => setCurrentStep(parseInt(e.target.value))}
            className="step-range"
          />
        </div>
      </div>

      {/* Pattern Configuration */}
      <div className="pattern-configuration">
        <h3>⚙️ Configure Execution Pattern</h3>
        <p className="pattern-explanation">
          Choose which process attempts to enter the critical section and in what order:
        </p>

        <div className="preset-patterns">
          <h4>Preset Patterns:</h4>
          <div className="preset-buttons">
            {presetPatterns.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setPattern(preset.pattern);
                  setCustomPattern(preset.pattern.join(','));
                }}
                className="preset-btn"
              >
                {preset.name}
                <span className="preset-pattern">{preset.pattern.join(',')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="custom-pattern">
          <h4>Custom Pattern:</h4>
          <div className="custom-input-group">
            <input
              type="text"
              value={customPattern}
              onChange={(e) => setCustomPattern(e.target.value)}
              placeholder="0,1,0,1"
              className="pattern-input"
            />
            <button onClick={handleCustomPattern} className="apply-btn">
              Apply
            </button>
            <button onClick={handleRandomPattern} className="random-btn">
              🎲 Random
            </button>
          </div>
          <p className="pattern-help">Enter comma-separated 0s and 1s (e.g., 0,1,0,1,1,0)</p>
        </div>

        <div className="current-pattern-display">
          <strong>Current Pattern:</strong> {pattern.join(' → ')}
        </div>
      </div>

      {/* Theory Section */}
      <div className="theory-section">
        <h3>📚 How It Works</h3>
        <div className="theory-grid">
          <div className="theory-card">
            <h4>1️⃣ Request Entry</h4>
            <p>
              When a process wants to enter its critical section, it sets its flag to true,
              signaling its intention.
            </p>
          </div>
          <div className="theory-card">
            <h4>2️⃣ Check Other Process</h4>
            <p>
              The process checks if the other process also wants to enter (its flag is true). If
              not, it proceeds directly.
            </p>
          </div>
          <div className="theory-card">
            <h4>3️⃣ Resolve Conflict</h4>
            <p>
              If both want to enter, the process whose turn it is NOT backs off, waits, and then
              tries again when it's its turn.
            </p>
          </div>
          <div className="theory-card">
            <h4>4️⃣ Exit Protocol</h4>
            <p>
              After leaving the critical section, the process sets turn to the other process and
              sets its flag to false.
            </p>
          </div>
        </div>

        <div className="key-properties">
          <h4>✅ Key Properties Guaranteed:</h4>
          <ul>
            <li>
              <strong>Mutual Exclusion:</strong> Only one process in critical section at a time
            </li>
            <li>
              <strong>Progress:</strong> If both want to enter, one will eventually succeed
            </li>
            <li>
              <strong>Bounded Waiting:</strong> A process won't wait indefinitely
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
