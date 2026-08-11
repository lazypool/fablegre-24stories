import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

type TabBarHeightContextValue = {
  tabBarHeight: number;
  setTabBarHeight: (height: number) => void;
};

const TabBarHeightContext = createContext<TabBarHeightContextValue | null>(null);

export function TabBarHeightProvider({ children }: PropsWithChildren) {
  const [tabBarHeight, setTabBarHeightRaw] = useState(0);
  const setTabBarHeight = useCallback((height: number) => {
    setTabBarHeightRaw((current) => (current === height ? current : height));
  }, []);

  return (
    <TabBarHeightContext.Provider value={{ tabBarHeight, setTabBarHeight }}>{children}</TabBarHeightContext.Provider>
  );
}

export function useTabBarHeight() {
  const context = useContext(TabBarHeightContext);
  if (!context) throw new Error('useTabBarHeight must be used inside TabBarHeightProvider.');
  return context;
}
