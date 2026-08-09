import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

type PageScrollContextValue = {
  isScrolled: boolean;
  scrollToTop: () => void;
  setPageScroll: (isScrolled: boolean, scrollToTop: () => void) => void;
};

const PageScrollContext = createContext<PageScrollContextValue | null>(null);

export function PageScrollProvider({ children }: PropsWithChildren) {
  const [isScrolled, setScrolled] = useState(false);
  const [scrollToTop, setScrollToTop] = useState<() => void>(() => () => {});
  const setPageScroll = useCallback((nextIsScrolled: boolean, nextScrollToTop: () => void) => {
    setScrolled((current) => current === nextIsScrolled ? current : nextIsScrolled);
    setScrollToTop(() => nextScrollToTop);
  }, []);

  return <PageScrollContext.Provider value={{ isScrolled, scrollToTop, setPageScroll }}>{children}</PageScrollContext.Provider>;
}

export function usePageScroll() {
  const context = useContext(PageScrollContext);
  if (!context) throw new Error('usePageScroll must be used inside PageScrollProvider.');
  return context;
}
