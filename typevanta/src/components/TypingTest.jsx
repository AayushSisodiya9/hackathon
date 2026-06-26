import React, { useRef, useEffect } from 'react';
import './TypingTest.css';
import { RefreshCw } from 'lucide-react';

export default function TypingTest({ engine }) {
  const { 
    words, 
    currentWordIndex, 
    typedChars, 
    typedHistory,
    timeLeft, 
    status, 
    botWordIndex,
    botCharIndex,
    botWpm,
    streak,
    restart 
  } = engine;

  const wordContainerRef = useRef(null);

  const getComboText = () => {
    if (streak >= 100) return "MAX COMBO!";
    if (streak >= 60) return "COMBO x4!";
    if (streak >= 40) return "COMBO x3!";
    if (streak >= 20) return "COMBO x2!";
    return null;
  };
  
  const comboText = getComboText();

  // Auto-scroll logic to keep the current word in view
  useEffect(() => {
    if (wordContainerRef.current) {
      const activeWord = wordContainerRef.current.querySelector('.word.active');
      if (activeWord) {
        const containerRect = wordContainerRef.current.getBoundingClientRect();
        const activeRect = activeWord.getBoundingClientRect();
        
        // If the active word is below the visible area, scroll down
        if (activeRect.bottom > containerRect.bottom) {
           wordContainerRef.current.scrollTop += 40; // Approx height of a line
        }
      }
    }
  }, [currentWordIndex]);

  return (
    <div className="typing-test-container">
      <div className="test-header">
        <div className="timer">{timeLeft}s</div>
        {comboText && (
          <div className={`combo-text combo-${comboText.replace(/\s/g, '').toLowerCase()}`}>
            {comboText}
          </div>
        )}
      </div>

      <div 
        className={`words-container ${status === 'idle' ? 'blurred' : ''}`}
        ref={wordContainerRef}
      >
        {words.map((word, wIdx) => {
          const isActive = wIdx === currentWordIndex;
          const isPassed = wIdx < currentWordIndex;
          
          return (
            <div key={wIdx} className={`word ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}>
              {word.split('').map((char, cIdx) => {
                let charClass = '';
                
                if (isActive) {
                  if (cIdx < typedChars.length) {
                    charClass = typedChars[cIdx] === char ? 'correct' : 'incorrect';
                  } else if (cIdx === typedChars.length) {
                    charClass += ' current-char';
                  }
                } else if (isPassed) {
                  const historyChars = typedHistory[wIdx] || '';
                  if (cIdx < historyChars.length) {
                    charClass = historyChars[cIdx] === char ? 'correct' : 'incorrect';
                  } else {
                    charClass = 'incorrect'; // user skipped this char
                  }
                }

                // Add bot cursor class
                if (botWpm > 0 && wIdx === botWordIndex && cIdx === botCharIndex) {
                  charClass += ' bot-cursor';
                }

                return (
                  <span key={cIdx} className={`char ${charClass}`}>
                    {char}
                  </span>
                );
              })}
              
              {/* Extra typed characters (incorrect overflow) */}
              {isActive && typedChars.length > word.length && (
                <span className="char incorrect overflow">
                  {typedChars.slice(word.length)}
                </span>
              )}
              {isPassed && typedHistory[wIdx] && typedHistory[wIdx].length > word.length && (
                <span className="char incorrect overflow">
                  {typedHistory[wIdx].slice(word.length)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {status === 'idle' && (
        <div className="start-prompt">
          Start typing to begin
        </div>
      )}

      <div className="controls">
        <button className="restart-btn" onClick={restart}>
          <RefreshCw size={24} />
        </button>
      </div>
    </div>
  );
}
