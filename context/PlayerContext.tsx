/**
 * Stub for Player Context
 * TODO: Implement real player functionality
 */

import React from 'react';

interface PlayerState {
  active: boolean;
  source: any;
  mode: 'inline' | 'floating' | 'idle';
  muted: boolean;
}

interface PlayerContextType {
  playing: boolean;
  url: string | null;
  state: PlayerState;
  play: (url: string) => void;
  pause: () => void;
  stop: () => void;
  open: (url: string) => void;
  minimize: () => void;
  expand: () => void;
  close: () => void;
}

const PlayerContext = React.createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = React.useState(false);
  const [url, setUrl] = React.useState<string | null>(null);
  const [state, setState] = React.useState<PlayerState>({
    active: false,
    source: null,
    mode: 'idle',
    muted: false,
  });

  const play = (newUrl: string) => {
    setUrl(newUrl);
    setPlaying(true);
    setState({
      active: true,
      source: newUrl,
      mode: 'inline',
      muted: false,
    });
  };

  const pause = () => {
    setPlaying(false);
  };

  const stop = () => {
    setPlaying(false);
    setUrl(null);
    setState({
      active: false,
      source: null,
      mode: 'idle',
      muted: false,
    });
  };

  const open = (newUrl: string) => {
    play(newUrl);
  };

  return (
    <PlayerContext.Provider value={{ 
      playing, 
      url, 
      state,
      play, 
      pause, 
      stop,
      open,
      minimize: () => {},
      expand: () => {},
      close: stop,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = React.useContext(PlayerContext);
  if (!context) {
    // Return stub if no provider
    return {
      playing: false,
      url: null,
      state: {
        active: false,
        source: null,
        mode: 'idle' as const,
        muted: false,
      },
      play: () => {},
      pause: () => {},
      stop: () => {},
      open: () => {},
      minimize: () => {},
      expand: () => {},
      close: () => {},
    };
  }
  return context;
}
