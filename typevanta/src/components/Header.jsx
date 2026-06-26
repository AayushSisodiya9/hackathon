import React from 'react';
import { Keyboard, User, Trophy, LogIn, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ currentView, onNavigate, onLoginClick }) {
  const { currentUser } = useAuth();

  const toggleTheme = () => {
    document.body.classList.toggle('theme-yellow');
  };

  return (
    <header className="app-header">
      <div className="logo-container" onClick={() => onNavigate('test')} style={{ cursor: 'pointer' }}>
        <Keyboard className="logo-icon" size={32} />
        <h1 className="logo-text">Type<span className="text-highlight">Vanta</span></h1>
      </div>
      
      <nav className="nav-links">
        <button 
          className={`nav-btn ${currentView === 'test' ? 'active' : ''}`} 
          onClick={() => onNavigate('test')}
          title="Typing Test"
        >
          <Keyboard size={20} />
          <span className="nav-label">Test</span>
        </button>
        
        <button 
          className={`nav-btn ${currentView === 'leaderboard' ? 'active' : ''}`} 
          onClick={() => onNavigate('leaderboard')}
          title="Leaderboard"
        >
          <Trophy size={20} />
          <span className="nav-label">Rankings</span>
        </button>

        <button 
          className="nav-btn" 
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          <Palette size={20} />
        </button>
        
        {currentUser ? (
          <button 
            className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`} 
            onClick={() => onNavigate('profile')}
            title="Profile"
          >
            <div className="avatar-small">{currentUser.username.charAt(0).toUpperCase()}</div>
            <span className="nav-label">{currentUser.username}</span>
          </button>
        ) : (
          <button 
            className="nav-btn login-btn" 
            onClick={onLoginClick}
            title="Login"
          >
            <LogIn size={20} />
            <span className="nav-label">Login</span>
          </button>
        )}
      </nav>
    </header>
  );
}
