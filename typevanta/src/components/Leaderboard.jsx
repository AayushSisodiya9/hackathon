import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy } from 'lucide-react';
import './Leaderboard.css';

export default function Leaderboard() {
  const { leaderboard, currentUser } = useAuth();

  return (
    <div className="leaderboard-container glass-panel">
      <div className="leaderboard-header">
        <Trophy size={32} className="leaderboard-icon" />
        <h2>Global Rankings</h2>
      </div>

      <div className="table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Top WPM</th>
              <th>Avg Acc</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => {
              const isCurrentUser = currentUser && currentUser.id === user.id;
              
              return (
                <tr key={user.id} className={isCurrentUser ? 'current-user-row' : ''}>
                  <td className="rank-col">#{index + 1}</td>
                  <td className="player-col">
                    {user.username}
                    {isCurrentUser && <span className="you-badge">YOU</span>}
                  </td>
                  <td className="score-col wpm-col">{user.bestWpm}</td>
                  <td className="score-col">{user.avgAccuracy}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
