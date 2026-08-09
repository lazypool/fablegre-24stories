import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { defaultTheme, themes, type Theme, type ThemeName } from './themes';

type ThemeContextValue = {
  theme: Theme;
  setThemeName: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState(defaultTheme);

  return (
    <ThemeContext.Provider
      value={{ theme, setThemeName: (name) => setTheme(themes.find((item) => item.name === name) ?? defaultTheme) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider.');
  return context;
}
