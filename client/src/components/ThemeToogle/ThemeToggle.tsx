import { useEffect, useState } from 'react';

import { switchThemeLight, switchThemeDark  } from '@/assets';

import styles from './ThemeToogle.module.scss'

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div onClick={toggleTheme}>
      {theme === 'light' ? <img src={switchThemeDark.src} alt="Switch To Dark Mode" className={styles.themeToggle}/> : <img src={switchThemeLight.src} alt="Switch To Light Mode"  className={styles.themeToggle}/>}
    </div>
  );
};

export default ThemeToggle;
