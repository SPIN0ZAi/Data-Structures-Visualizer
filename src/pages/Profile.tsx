import React, { useState } from 'react';
import { useUser, ALL_BADGES } from '../context/UserContext';

const AVATARS = ['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐸', '🦄', '🐲', '🤖', '👾'];

const Profile: React.FC = () => {
  const { 
    user, 
    isSetup, 
    setupProfile, 
    getUnlockedBadges, 
    getLockedBadges,
    getXPProgress,
    resetProgress 
  } = useUser();
  
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍💻');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const xpProgress = getXPProgress();
  const unlockedBadges = getUnlockedBadges();
  const lockedBadges = getLockedBadges();

  // Stats calculations
  const easyCount = user.solvedProblems.filter(p => p.difficulty === 'easy').length;
  const mediumCount = user.solvedProblems.filter(p => p.difficulty === 'medium').length;
  const hardCount = user.solvedProblems.filter(p => p.difficulty === 'hard').length;

  // Streak calendar (last 30 days)
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const activity = user.dailyActivity.find(a => a.date === dateString);
      days.push({
        date: dateString,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        problemsSolved: activity?.problemsSolved || 0,
        xpEarned: activity?.xpEarned || 0,
      });
    }
    return days;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Setup form
  if (!isSetup) {
    return (
      <div className="profile-page">
        <div className="setup-container">
          <h1>Welcome to DS Visualizer! 🎉</h1>
          <p>Let's set up your profile to track your progress</p>
          
          <div className="setup-form">
            <div className="form-group">
              <label>What's your name?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label>Choose your avatar</label>
              <div className="avatar-grid">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="setup-btn"
              onClick={() => {
                if (name.trim()) {
                  setupProfile(name.trim(), selectedAvatar);
                }
              }}
              disabled={!name.trim()}
            >
              Start Learning! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-avatar">{user.profile.avatar}</div>
        <div className="profile-info">
          <h1>{user.profile.name}</h1>
          <div className="level-badge">Level {user.level}</div>
        </div>
        <div className="streak-display">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{user.streak}</span>
          <span className="streak-label">Day Streak</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="xp-section">
        <div className="xp-header">
          <span>Level {user.level}</span>
          <span>{user.xp} XP</span>
          <span>Level {user.level + 1}</span>
        </div>
        <div className="xp-bar">
          <div 
            className="xp-fill" 
            style={{ width: `${xpProgress.percentage}%` }}
          />
        </div>
        <div className="xp-text">
          {xpProgress.current} / {xpProgress.needed} XP to next level
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{user.solvedProblems.length}</div>
          <div className="stat-label">Problems Solved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.longestStreak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(user.totalTimeSpent)}</div>
          <div className="stat-label">Total Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{unlockedBadges.length}/{ALL_BADGES.length}</div>
          <div className="stat-label">Badges Earned</div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="difficulty-section">
        <h2>Problems by Difficulty</h2>
        <div className="difficulty-bars">
          <div className="difficulty-item">
            <div className="difficulty-label">
              <span className="difficulty-dot easy"></span>
              Easy
            </div>
            <div className="difficulty-bar">
              <div 
                className="difficulty-fill easy" 
                style={{ width: `${(easyCount / Math.max(user.solvedProblems.length, 1)) * 100}%` }}
              />
            </div>
            <span className="difficulty-count">{easyCount}</span>
          </div>
          <div className="difficulty-item">
            <div className="difficulty-label">
              <span className="difficulty-dot medium"></span>
              Medium
            </div>
            <div className="difficulty-bar">
              <div 
                className="difficulty-fill medium" 
                style={{ width: `${(mediumCount / Math.max(user.solvedProblems.length, 1)) * 100}%` }}
              />
            </div>
            <span className="difficulty-count">{mediumCount}</span>
          </div>
          <div className="difficulty-item">
            <div className="difficulty-label">
              <span className="difficulty-dot hard"></span>
              Hard
            </div>
            <div className="difficulty-bar">
              <div 
                className="difficulty-fill hard" 
                style={{ width: `${(hardCount / Math.max(user.solvedProblems.length, 1)) * 100}%` }}
              />
            </div>
            <span className="difficulty-count">{hardCount}</span>
          </div>
        </div>
      </div>

      {/* Activity Calendar */}
      <div className="activity-section">
        <h2>Last 30 Days Activity</h2>
        <div className="activity-calendar">
          {getLast30Days().map((day, idx) => (
            <div 
              key={idx}
              className={`activity-day ${day.problemsSolved > 0 ? 'active' : ''}`}
              style={{
                opacity: day.problemsSolved > 0 ? 0.4 + Math.min(day.problemsSolved * 0.2, 0.6) : 0.2,
              }}
              title={`${day.date}: ${day.problemsSolved} problems, ${day.xpEarned} XP`}
            >
              <span className="day-number">{day.dayOfMonth}</span>
            </div>
          ))}
        </div>
        <div className="activity-legend">
          <span>Less</span>
          <div className="legend-boxes">
            <div className="legend-box" style={{ opacity: 0.2 }}></div>
            <div className="legend-box" style={{ opacity: 0.4 }}></div>
            <div className="legend-box" style={{ opacity: 0.6 }}></div>
            <div className="legend-box" style={{ opacity: 0.8 }}></div>
            <div className="legend-box" style={{ opacity: 1 }}></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Badges Section */}
      <div className="badges-section">
        <h2>Badges ({unlockedBadges.length}/{ALL_BADGES.length})</h2>
        
        {/* Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <div className="badges-group">
            <h3>🏆 Unlocked</h3>
            <div className="badges-grid">
              {unlockedBadges.map(badge => (
                <div key={badge.id} className="badge-card unlocked">
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-desc">{badge.description}</div>
                  <div className="badge-date">
                    {badge.unlockedAt?.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div className="badges-group">
            <h3>🔒 Locked</h3>
            <div className="badges-grid">
              {lockedBadges.map(badge => (
                <div key={badge.id} className="badge-card locked">
                  <div className="badge-icon">🔒</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-desc">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {user.solvedProblems.length > 0 && (
        <div className="recent-section">
          <h2>Recent Problems</h2>
          <div className="recent-list">
            {user.solvedProblems.slice(-5).reverse().map((problem, idx) => (
              <div key={idx} className="recent-item">
                <div className="recent-status">✅</div>
                <div className="recent-info">
                  <div className="recent-title">{problem.title}</div>
                  <div className="recent-meta">
                    <span className={`difficulty-tag ${problem.difficulty}`}>
                      {problem.difficulty}
                    </span>
                    <span>{formatTime(problem.timeSpent)}</span>
                    <span>{problem.attempts} attempt{problem.attempts > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="recent-date">
                  {problem.solvedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="danger-zone">
        <h2>⚠️ Danger Zone</h2>
        {!showResetConfirm ? (
          <button 
            className="reset-btn"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset All Progress
          </button>
        ) : (
          <div className="reset-confirm">
            <p>Are you sure? This will delete all your progress, badges, and stats!</p>
            <div className="reset-actions">
              <button 
                className="confirm-reset-btn"
                onClick={() => {
                  resetProgress();
                  setShowResetConfirm(false);
                }}
              >
                Yes, Reset Everything
              </button>
              <button 
                className="cancel-reset-btn"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
