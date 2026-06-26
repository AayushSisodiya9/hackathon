import React, { useState } from 'react';
import { useTypingEngine } from './hooks/useTypingEngine';
import Header from './components/Header';
import TypingTest from './components/TypingTest';
import StatsDashboard from './components/StatsDashboard';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const [botWpm, setBotWpm] = useState(0); // 0 = Solo, > 0 = Bot Mode
  const [testDuration, setTestDuration] = useState(30);
  const [testMode, setTestMode] = useState('words'); // words or code
  
  const engine = useTypingEngine(testDuration, botWpm, testMode);
  const { currentUser, saveTestResult } = useAuth();
  
  const [currentView, setCurrentView] = useState('test'); // test, leaderboard, profile
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Hook to handle saving when a test finishes
  React.useEffect(() => {
    if (engine.status === 'finished') {
      if (currentUser) {
        saveTestResult(engine.wpm, engine.accuracy);
      }
    }
  }, [engine.status, engine.wpm, engine.accuracy]);

  const navigateTo = (view) => {
    if (view === 'profile' && !currentUser) {
      setShowAuthModal(true);
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="app-layout">
      <Header currentView={currentView} onNavigate={navigateTo} onLoginClick={() => setShowAuthModal(true)} />
      
      <main className="main-content">
        {currentView === 'test' && (
          engine.status === 'finished' ? (
            <StatsDashboard 
              wpm={engine.wpm} 
              accuracy={engine.accuracy} 
              restart={engine.restart} 
              botWpm={engine.botWpm}
            />
          ) : (
            <>
              {engine.status === 'idle' && (
                <div className="test-settings">
                  <div className="settings-group mode-selector">
                    <button className={`mode-btn ${botWpm === 0 ? 'active' : ''}`} onClick={() => setBotWpm(0)}>Solo</button>
                    <button className={`mode-btn ${botWpm === 80 ? 'active' : ''}`} onClick={() => setBotWpm(80)}>VS Bot (Medium)</button>
                    <button className={`mode-btn ${botWpm === 120 ? 'active' : ''}`} onClick={() => setBotWpm(120)}>VS Bot (Pro)</button>
                  </div>
                  <div className="settings-group duration-selector">
                    <button className={`mode-btn ${testDuration === 15 ? 'active' : ''}`} onClick={() => setTestDuration(15)}>15s</button>
                    <button className={`mode-btn ${testDuration === 30 ? 'active' : ''}`} onClick={() => setTestDuration(30)}>30s</button>
                    <button className={`mode-btn ${testDuration === 60 ? 'active' : ''}`} onClick={() => setTestDuration(60)}>60s</button>
                  </div>
                  <div className="settings-group language-selector">
                    <button className={`mode-btn ${testMode === 'words' ? 'active' : ''}`} onClick={() => setTestMode('words')}>Random Words</button>
                    <button className={`mode-btn ${testMode === 'code' ? 'active' : ''}`} onClick={() => setTestMode('code')}>Code Snippets</button>
                  </div>
                </div>
              )}
              <TypingTest engine={engine} />
            </>
          )
        )}

        {currentView === 'leaderboard' && <Leaderboard />}
        {currentView === 'profile' && <Profile />}
      </main>
      
      <footer className="app-footer">
        <p>TypeVanta &copy; 2026. Minimal Competitive Typing.</p>
      </footer>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default App;
