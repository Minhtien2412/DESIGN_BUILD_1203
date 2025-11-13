/**
 * Stub for Live Context
 * TODO: Implement real live streaming functionality
 */

import React from 'react';

interface LiveContextType {
  isLive: boolean;
  viewers: number;
  viewerCount: number;
  current: any;
  comments: any[];
  startLive: () => void;
  stopLive: () => void;
  addComment: (text: string) => void;
  getComments: (videoId?: string) => any[];
  addCommentFor: (videoId: string, text: string) => void;
  getLikes: (videoId?: string) => number;
  isLiked: (videoId?: string) => boolean;
  toggleLike: (videoId?: string) => void;
  toggleCommentsVisible: () => void;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => void;
}

const LiveContext = React.createContext<LiveContextType | undefined>(undefined);

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [isLive, setIsLive] = React.useState(false);
  const [viewers, setViewers] = React.useState(0);
  const [comments, setComments] = React.useState<any[]>([]);

  const startLive = () => {
    setIsLive(true);
  };

  const stopLive = () => {
    setIsLive(false);
    setViewers(0);
  };

  const addComment = (text: string) => {
    setComments(prev => [...prev, { text, timestamp: Date.now() }]);
  };

  const getComments = (_videoId?: string) => comments;

  return (
    <LiveContext.Provider value={{ 
      isLive, 
      viewers,
      viewerCount: viewers,
      current: null,
      comments,
      startLive, 
      stopLive,
      addComment,
      getComments,
      addCommentFor: () => {},
      getLikes: () => 0,
      isLiked: () => false,
      toggleLike: () => {},
      toggleCommentsVisible: () => {},
      isFollowing: () => false,
      toggleFollow: () => {},
    }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  const context = React.useContext(LiveContext);
  if (!context) {
    return {
      isLive: false,
      viewers: 0,
      viewerCount: 0,
      current: null,
      comments: [],
      startLive: () => {},
      stopLive: () => {},
      addComment: () => {},
      getComments: () => [],
      addCommentFor: () => {},
      getLikes: () => 0,
      isLiked: () => false,
      toggleLike: () => {},
      toggleCommentsVisible: () => {},
      isFollowing: () => false,
      toggleFollow: () => {},
    };
  }
  return context;
}
