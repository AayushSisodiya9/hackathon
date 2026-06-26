import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Initial mock leaderboard
const mockLeaderboard = [
  { id: '1', username: 'NinjaTyper', bestWpm: 184, avgAccuracy: 98 },
  { id: '2', username: 'CyberGhost', bestWpm: 156, avgAccuracy: 95 },
  { id: '3', username: 'SpeedDemon', bestWpm: 142, avgAccuracy: 99 },
  { id: '4', username: 'VantaPro', bestWpm: 120, avgAccuracy: 94 },
  { id: '5', username: 'KeyboardWarrior', bestWpm: 105, avgAccuracy: 96 }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [history, setHistory] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('typevanta_user');
    const storedHistory = localStorage.getItem('typevanta_history');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const login = (username) => {
    const user = { 
      id: Date.now().toString(), 
      username, 
      bestWpm: 0, 
      avgAccuracy: 0 
    };
    setCurrentUser(user);
    localStorage.setItem('typevanta_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setHistory([]);
    localStorage.removeItem('typevanta_user');
    localStorage.removeItem('typevanta_history');
  };

  const saveTestResult = (wpm, accuracy) => {
    if (!currentUser) return; // Only save for logged-in users in this MVP

    const newResult = {
      id: Date.now(),
      wpm,
      accuracy,
      date: new Date().toISOString()
    };

    const newHistory = [...history, newResult];
    setHistory(newHistory);
    localStorage.setItem('typevanta_history', JSON.stringify(newHistory));

    // Update user best stats
    const bestWpm = Math.max(currentUser.bestWpm, wpm);
    const avgAccuracy = Math.round(
      newHistory.reduce((acc, curr) => acc + curr.accuracy, 0) / newHistory.length
    );

    const updatedUser = { ...currentUser, bestWpm, avgAccuracy };
    setCurrentUser(updatedUser);
    localStorage.setItem('typevanta_user', JSON.stringify(updatedUser));

    // Update leaderboard
    setLeaderboard((prev) => {
      const filtered = prev.filter(u => u.id !== currentUser.id);
      filtered.push(updatedUser);
      return filtered.sort((a, b) => b.bestWpm - a.bestWpm);
    });
  };

  return (
    <AuthContext.Provider value={{ currentUser, leaderboard, history, login, logout, saveTestResult }}>
      {children}
    </AuthContext.Provider>
  );
};
