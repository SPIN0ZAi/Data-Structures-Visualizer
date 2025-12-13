import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAuthModals, LoginModal, SignupModal } from '../components/Auth';
import { useCreateProblem } from '../hooks/useProblems';
import { useReputation } from '../hooks/useReputation';
import { ProblemCategory, ProblemDifficulty, ProblemType, TestCase } from '../types/community';
import './SubmitProblem.css';

const SubmitProblem: React.FC = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const { createProblem, loading, error } = useCreateProblem();
  const { addReputation } = useReputation();
  const { loginOpen, signupOpen, openLogin, closeLogin, openSignup, closeSignup, switchToSignup, switchToLogin } = useAuthModals();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemType: 'algorithm' as ProblemType,
    difficulty: 'beginner' as ProblemDifficulty,
    category: 'BST' as ProblemCategory,
    tags: '',
    codeSnippet: '',
    language: 'java',
    solution: '',
    isMultipleChoice: false,
    choices: ['', '', '', ''],
    correctAnswer: ''
  });

  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '', explanation: '' }
  ]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases(prev => [...prev, { input: '', expectedOutput: '', explanation: '' }]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      openLogin();
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in the title and description');
      return;
    }

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const validTestCases = testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim());

    const problemData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      problemType: formData.problemType,
      difficulty: formData.difficulty,
      category: formData.category,
      tags,
      codeSnippet: formData.codeSnippet.trim() || undefined,
      language: formData.language,
      solution: formData.solution.trim() || undefined,
      testCases: validTestCases.length > 0 ? validTestCases : undefined,
      isMultipleChoice: formData.isMultipleChoice,
      choices: formData.isMultipleChoice ? formData.choices.filter(c => c.trim()) : undefined,
      correctAnswer: formData.isMultipleChoice ? formData.correctAnswer : undefined
    };

    const problemId = await createProblem(problemData);

    if (problemId) {
      // Award reputation for submitting
      await addReputation('problem_submitted', problemId);
      navigate(`/community/problem/${problemId}`);
    }
  };

  if (isGuest) {
    return (
      <div className="submit-problem">
        <div className="auth-required">
          <span className="auth-icon">🔐</span>
          <h2>Sign in to Submit Problems</h2>
          <p>Join our community to share your algorithm challenges and help others learn!</p>
          <div className="auth-buttons">
            <button className="btn-primary" onClick={openLogin}>
              Sign In
            </button>
            <button className="btn-secondary" onClick={openSignup}>
              Create Account
            </button>
          </div>
        </div>

        <LoginModal 
          isOpen={loginOpen} 
          onClose={closeLogin} 
          onSwitchToSignup={switchToSignup}
        />
        <SignupModal 
          isOpen={signupOpen} 
          onClose={closeSignup} 
          onSwitchToLogin={switchToLogin}
        />
      </div>
    );
  }

  return (
    <div className="submit-problem">
      <div className="submit-header">
        <h1>✏️ Submit a Problem</h1>
        <p>Share your knowledge with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="submit-form">
        {error && (
          <div className="form-error">{error}</div>
        )}

        {/* Basic Info */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Problem Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Implement AVL Tree Rotation"
              maxLength={100}
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the problem in detail. You can use Markdown for formatting."
              rows={8}
            />
            <span className="helper-text">Supports Markdown formatting</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="problemType">Problem Type</label>
              <select
                id="problemType"
                value={formData.problemType}
                onChange={(e) => handleInputChange('problemType', e.target.value)}
              >
                <option value="algorithm">🧮 Algorithm Challenge</option>
                <option value="conceptual">💡 Conceptual Question</option>
                <option value="debugging">🐛 Debugging Scenario</option>
                <option value="optimization">⚡ Optimization Problem</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
              >
                <option value="beginner">🟢 Beginner</option>
                <option value="intermediate">🟡 Intermediate</option>
                <option value="advanced">🔴 Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="BST">🌳 BST</option>
                <option value="AVL">🌲 AVL</option>
                <option value="Graph">🕸️ Graph</option>
                <option value="Floyd">🛤️ Floyd</option>
                <option value="Huffman">🗜️ Huffman</option>
                <option value="Sorting">📊 Sorting</option>
                <option value="Traversal">🔄 Traversal</option>
                <option value="General">📚 General</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="e.g., recursion, tree, rotation, balance"
            />
          </div>
        </section>

        {/* Code Section */}
        <section className="form-section">
          <h2>Code (Optional)</h2>
          
          <div className="form-group">
            <label htmlFor="language">Programming Language</label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="haskell">Haskell</option>
              <option value="pseudocode">Pseudocode</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="codeSnippet">Starter Code / Problem Code</label>
            <textarea
              id="codeSnippet"
              value={formData.codeSnippet}
              onChange={(e) => handleInputChange('codeSnippet', e.target.value)}
              placeholder="// Provide starter code or code for debugging problems"
              rows={10}
              className="code-input"
            />
          </div>
        </section>

        {/* Answer Type */}
        <section className="form-section">
          <h2>Answer Format</h2>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isMultipleChoice}
                onChange={(e) => handleInputChange('isMultipleChoice', e.target.checked)}
              />
              <span>Multiple Choice Question</span>
            </label>
          </div>

          {formData.isMultipleChoice && (
            <div className="choices-section">
              {formData.choices.map((choice, index) => (
                <div key={index} className="choice-row">
                  <label>
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={choice}
                      checked={formData.correctAnswer === choice}
                      onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                    />
                  </label>
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
              <span className="helper-text">Select the correct answer</span>
            </div>
          )}
        </section>

        {/* Test Cases */}
        <section className="form-section">
          <h2>Test Cases (Optional)</h2>
          
          {testCases.map((tc, index) => (
            <div key={index} className="test-case">
              <div className="test-case-header">
                <span>Test Case {index + 1}</span>
                {testCases.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeTestCase(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="test-case-fields">
                <div className="form-group">
                  <label>Input</label>
                  <textarea
                    value={tc.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    placeholder="Input for test case"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Expected Output</label>
                  <textarea
                    value={tc.expectedOutput}
                    onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                    placeholder="Expected output"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Explanation (Optional)</label>
                  <input
                    type="text"
                    value={tc.explanation}
                    onChange={(e) => handleTestCaseChange(index, 'explanation', e.target.value)}
                    placeholder="Brief explanation"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button type="button" className="add-test-case-btn" onClick={addTestCase}>
            + Add Test Case
          </button>
        </section>

        {/* Solution */}
        <section className="form-section">
          <h2>Solution (Optional)</h2>
          <p className="section-note">This will be hidden until the user attempts the problem</p>
          
          <div className="form-group">
            <label htmlFor="solution">Solution / Explanation</label>
            <textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => handleInputChange('solution', e.target.value)}
              placeholder="Provide the solution or detailed explanation..."
              rows={10}
              className="code-input"
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Problem'}
          </button>
        </div>
      </form>

      <LoginModal 
        isOpen={loginOpen} 
        onClose={closeLogin} 
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal 
        isOpen={signupOpen} 
        onClose={closeSignup} 
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
};

export default SubmitProblem;
