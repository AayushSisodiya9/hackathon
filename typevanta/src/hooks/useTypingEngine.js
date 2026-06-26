import { useState, useEffect, useCallback } from 'react';
import { getRandomSnippet } from '../utils/codeSnippets';

const defaultWords = "the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us".split(" ");

const generateWords = (count, mode = 'words') => {
  if (mode === 'code') {
    return getRandomSnippet();
  }
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(defaultWords[Math.floor(Math.random() * defaultWords.length)]);
  }
  return result;
};

export const useTypingEngine = (duration = 30, botWpm = 0, mode = 'words') => {
  const [words, setWords] = useState(() => generateWords(50, mode));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedChars, setTypedChars] = useState('');
  const [typedHistory, setTypedHistory] = useState([]);
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  
  // Gamification State
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const [status, setStatus] = useState('idle'); // idle, typing, finished
  const [timeLeft, setTimeLeft] = useState(duration);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Bot State
  const [botWordIndex, setBotWordIndex] = useState(0);
  const [botCharIndex, setBotCharIndex] = useState(0);

  // Bot Logic
  useEffect(() => {
    let botInterval;
    if (status === 'typing' && botWpm > 0 && timeLeft > 0) {
      // CPM = WPM * 5. Characters per second = CPM / 60
      const charsPerSecond = (botWpm * 5) / 60;
      const msPerChar = 1000 / charsPerSecond;

      botInterval = setInterval(() => {
        setBotCharIndex((prevCharIdx) => {
          const currentBotWord = words[botWordIndex];
          if (!currentBotWord) return prevCharIdx;

          // If bot finishes current word, move to next
          if (prevCharIdx >= currentBotWord.length) {
            setBotWordIndex((prevWordIdx) => prevWordIdx + 1);
            return 0; // Reset char index for new word
          }
          return prevCharIdx + 1;
        });
      }, msPerChar);
    }
    return () => clearInterval(botInterval);
  }, [status, botWpm, timeLeft, botWordIndex, words]);


  // Timer logic
  useEffect(() => {
    let interval;
    if (status === 'typing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'typing') {
      setStatus('finished');
      calculateFinalStats();
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  const calculateFinalStats = useCallback(() => {
    const timeInMinutes = duration / 60;
    const grossWpm = (totalTyped / 5) / timeInMinutes;
    const netWpm = Math.max(0, grossWpm - (errors / timeInMinutes));
    
    setWpm(Math.round(netWpm));
    
    const acc = totalTyped > 0 ? ((totalTyped - errors) / totalTyped) * 100 : 100;
    setAccuracy(Math.max(0, Math.round(acc)));
  }, [totalTyped, errors, duration]);

  const handleKeyDown = useCallback((e) => {
    if (status === 'finished') return;

    if (status === 'idle' && e.key.length === 1) {
      setStatus('typing');
    }

    const currentWord = words[currentWordIndex];

    if (e.key === 'Backspace') {
      if (e.ctrlKey) {
        setTypedChars('');
      } else if (typedChars.length > 0) {
        setTypedChars((prev) => prev.slice(0, -1));
      } else if (currentWordIndex > 0) {
        // Going back to previous word is simplified here to avoid complexity.
      }
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      if (typedChars.length > 0) {
        let wordErrors = 0;
        for (let i = 0; i < currentWord.length; i++) {
          if (typedChars[i] !== currentWord[i]) wordErrors++;
        }
        if (typedChars.length < currentWord.length) {
          wordErrors += currentWord.length - typedChars.length;
        } else if (typedChars.length > currentWord.length) {
          wordErrors += typedChars.length - currentWord.length;
        }

        setErrors((prev) => prev + wordErrors);
        setTotalTyped((prev) => prev + currentWord.length + 1); 
        
        if (wordErrors > 0) {
          setStreak(0);
        }

        setTypedHistory((prev) => [...prev, typedChars]);
        setCurrentWordIndex((prev) => prev + 1);
        setTypedChars('');
        
        if (currentWordIndex > words.length - 10) {
          setWords((prev) => [...prev, ...generateWords(30, mode)]);
        }
      }
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setTypedChars((prev) => prev + e.key);
      
      const isCorrect = e.key === currentWord[typedChars.length];
      if (isCorrect) {
        setStreak((prev) => {
          const newStreak = prev + 1;
          setMaxStreak((max) => Math.max(max, newStreak));
          return newStreak;
        });
      } else {
        setStreak(0);
      }
    }
  }, [status, words, currentWordIndex, typedChars]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const restart = useCallback(() => {
    setWords(generateWords(50, mode));
    setCurrentWordIndex(0);
    setTypedChars('');
    setTypedHistory([]);
    setErrors(0);
    setTotalTyped(0);
    setStatus('idle');
    setTimeLeft(duration);
    setWpm(0);
    setAccuracy(100);
    setBotWordIndex(0);
    setBotCharIndex(0);
    setStreak(0);
  }, [mode, duration]);

  // Restart automatically if mode or duration changes, but only if idle
  // To avoid restarting mid-test, we only apply duration changes on restart
  useEffect(() => {
    if (status === 'idle') {
      restart();
    }
  }, [mode, duration, restart]);

  return {
    words,
    currentWordIndex,
    typedChars,
    typedHistory,
    timeLeft,
    status,
    wpm,
    accuracy,
    botWordIndex,
    botCharIndex,
    botWpm,
    streak,
    maxStreak,
    restart
  };
};
