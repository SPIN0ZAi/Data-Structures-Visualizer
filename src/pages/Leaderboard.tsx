import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useReputation';
import { LeaderboardPeriod } from '../types/community';
import './Leaderboard.css';

const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('allTime');
  const { leaderboard, loading } = useLeaderboard(period);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top contributors in our community</p>
      </div>

      <div className="period-tabs">
        <button
          className={`period-tab ${period === 'weekly' ? 'active' : ''}`}
          onClick={() => setPeriod('weekly')}
        >
          This Week
        </button>
        <button
          className={`period-tab ${period === 'monthly' ? 'active' : ''}`}
          onClick={() => setPeriod('monthly')}
        >
          This Month
        </button>
        <button
          className={`period-tab ${period === 'allTime' ? 'active' : ''}`}
          onClick={() => setPeriod('allTime')}
        >
          All Time
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="leaderboard-skeleton"></div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <h3>No contributors yet</h3>
          <p>Be the first to contribute and earn reputation!</p>
          <Link to="/community/submit" className="btn-primary">
            Submit a Problem
          </Link>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="podium">
            {leaderboard.length >= 2 && (
              <div className="podium-place second">
                <div className="podium-avatar">
                  {leaderboard[1].userAvatar ? (
                    <img src={leaderboard[1].userAvatar} alt="" />
                  ) : (
                    <div className="avatar-placeholder">
                      {leaderboard[1].userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="podium-rank">🥈</span>
                <span className="podium-name">{leaderboard[1].userName}</span>
                <span className="podium-score">{leaderboard[1].reputation} pts</span>
              </div>
            )}

            {leaderboard.length >= 1 && (
              <div className="podium-place first">
                <div className="podium-avatar">
                  {leaderboard[0].userAvatar ? (
                    <img src={leaderboard[0].userAvatar} alt="" />
                  ) : (
                    <div className="avatar-placeholder">
                      {leaderboard[0].userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="podium-rank">🥇</span>
                <span className="podium-name">{leaderboard[0].userName}</span>
                <span className="podium-score">{leaderboard[0].reputation} pts</span>
              </div>
            )}

            {leaderboard.length >= 3 && (
              <div className="podium-place third">
                <div className="podium-avatar">
                  {leaderboard[2].userAvatar ? (
                    <img src={leaderboard[2].userAvatar} alt="" />
                  ) : (
                    <div className="avatar-placeholder">
                      {leaderboard[2].userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="podium-rank">🥉</span>
                <span className="podium-name">{leaderboard[2].userName}</span>
                <span className="podium-score">{leaderboard[2].reputation} pts</span>
              </div>
            )}
          </div>

          {/* Full Leaderboard Table */}
          <div className="leaderboard-table">
            <div className="table-header">
              <span className="col-rank">Rank</span>
              <span className="col-user">User</span>
              <span className="col-reputation">Reputation</span>
              <span className="col-problems">Problems</span>
              <span className="col-answers">Best Answers</span>
              <span className="col-badges">Badges</span>
            </div>

            {leaderboard.map((entry) => (
              <Link 
                key={entry.userId}
                to={`/community/user/${entry.userId}`}
                className={`table-row ${entry.rank <= 3 ? `top-${entry.rank}` : ''}`}
              >
                <span className="col-rank">
                  {getRankIcon(entry.rank)}
                </span>
                <span className="col-user">
                  {entry.userAvatar ? (
                    <img src={entry.userAvatar} alt="" className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {entry.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{entry.userName}</span>
                </span>
                <span className="col-reputation">
                  <span className="reputation-value">{entry.reputation}</span>
                  <span className="reputation-label">pts</span>
                </span>
                <span className="col-problems">{entry.problemsSubmitted}</span>
                <span className="col-answers">{entry.bestAnswers}</span>
                <span className="col-badges">
                  {entry.badges.slice(0, 3).map((badge) => (
                    <span key={badge.id} className="badge-icon" title={badge.name}>
                      {badge.emoji}
                    </span>
                  ))}
                  {entry.badges.length > 3 && (
                    <span className="badge-more">+{entry.badges.length - 3}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
