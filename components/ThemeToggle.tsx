import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return !document.documentElement.classList.contains('light') && 
             (localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme'));
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-black/20 dark:bg-white/5 border border-ai-border/50 dark:border-ai-border/50 hover:border-ai-accent transition-all group shadow-sm"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun size={14} className="text-yellow-400 group-hover:scale-110 transition-transform" />
      ) : (
        <Moon size={14} className="text-ai-accent group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
};

export default ThemeToggle;