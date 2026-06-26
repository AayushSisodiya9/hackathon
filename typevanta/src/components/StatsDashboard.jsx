import React from 'react';
import './StatsDashboard.css';
import { RefreshCw, ChevronRight } from 'lucide-react';

export default function StatsDashboard({ wpm, accuracy, botWpm, restart }) {
  const won = wpm >= botWpm;

  return (
    <div className="stats-container glass-panel">
      <h2 className="stats-title">Test Complete</h2>
      
      {botWpm > 0 && (
        <div className={`bot-result ${won ? 'win' : 'loss'}`}>
          {won ? 'You defeated the AI Bot!' : 'The AI Bot defeated you.'}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">WPM</div>
          <div className="stat-value highlight-blue">{wpm}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Accuracy</div>
          <div className="stat-value highlight-purple">{accuracy}%</div>
        </div>
      </div>

      <div className="stats-actions">
        <button className="action-btn next-btn" onClick={restart}>
          <span>Next Test</span>
          <ChevronRight size={20} />
        </button>
        <button className="action-btn restart-action" onClick={restart}>
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}
