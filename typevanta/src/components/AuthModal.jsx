import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-panel">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="modal-title">Join Type<span className="text-highlight">Vanta</span></h2>
        <p className="modal-subtitle">Save your scores and climb the leaderboard.</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            type="text" 
            placeholder="Choose a username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            autoFocus
          />
          <button type="submit" className="auth-submit-btn">Start Playing</button>
        </form>
      </div>
    </div>
  );
}
