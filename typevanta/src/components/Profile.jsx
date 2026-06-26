import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, LogOut } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { currentUser, history, logout } = useAuth();

  const chartData = useMemo(() => {
    return history.map((session, index) => ({
      name: `Test ${index + 1}`,
      wpm: session.wpm,
      accuracy: session.accuracy,
    }));
  }, [history]);

  if (!currentUser) {
    return (
      <div className="profile-container glass-panel empty-state">
        <User size={48} className="empty-icon" />
        <h2>You are not logged in.</h2>
        <p>Log in to save your stats and view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header glass-panel">
        <div className="user-info">
          <div className="avatar">{currentUser.username.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{currentUser.username}</h2>
            <p className="user-subtitle">TypeVanta Member</p>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card glass-panel">
          <div className="stat-label">Top Speed</div>
          <div className="stat-value highlight-blue">{currentUser.bestWpm} <span className="stat-unit">WPM</span></div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-label">Avg Accuracy</div>
          <div className="stat-value highlight-purple">{currentUser.avgAccuracy}%</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-label">Tests Completed</div>
          <div className="stat-value">{history.length}</div>
        </div>
      </div>

      <div className="chart-container glass-panel">
        <h3>WPM Progression</h3>
        {history.length > 0 ? (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#15181e', border: '1px solid #00f0ff', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wpm" 
                  stroke="#00f0ff" 
                  strokeWidth={3}
                  dot={{ fill: '#00f0ff', strokeWidth: 2 }}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="empty-chart">Complete your first test to see your progression!</p>
        )}
      </div>
    </div>
  );
}
