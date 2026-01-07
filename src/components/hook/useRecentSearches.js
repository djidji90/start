// src/hooks/useRecentSearches.js
import { useState, useEffect, useCallback } from 'react';

export function useRecentSearches(maxItems = 5) {
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dji_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, maxItems));
      } catch {
        setRecentSearches([]);
      }
    }
  }, [maxItems]);

  const addSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => 
        s.toLowerCase() !== searchTerm.toLowerCase()
      );
      const updated = [searchTerm, ...filtered].slice(0, maxItems);
      
      localStorage.setItem('dji_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, [maxItems]);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('dji_recent_searches');
  }, []);

  return { recentSearches, addSearch, clearRecent };
}