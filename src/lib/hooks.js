import { useState, useEffect } from 'react';

/**
 * Persists a boolean (or JSON-serializable value) in localStorage.
 * Reads the stored value on mount, writes it back on every change.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? defaultValue : JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value]);

  return [value, setValue];
}
