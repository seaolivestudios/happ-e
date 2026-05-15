import { createContext, useContext } from 'react';

export type FeedMode = 'all' | 'following' | 'foryou' | 'trending';

export const FeedModeContext = createContext<{
  feedMode: FeedMode;
  setFeedMode: (m: FeedMode) => void;
  menuVisible: boolean;
  setMenuVisible: (v: boolean) => void;
}>({
  feedMode: 'all',
  setFeedMode: () => {},
  menuVisible: false,
  setMenuVisible: () => {},
});

export const useFeedMode = () => useContext(FeedModeContext);
