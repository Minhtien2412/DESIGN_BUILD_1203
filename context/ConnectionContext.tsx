/**
 * Connection Status Context
 * Global state for server connection monitoring
 */

import { ServerInfo, useServerConnection } from '@/hooks/useServerConnection';
import { createContext, ReactNode, useContext } from 'react';

interface ConnectionContextType {
  currentServer: ServerInfo;
  allServers: ServerInfo[];
  checkAllServers: () => Promise<ServerInfo[]>;
  isOnline: boolean;
  isProduction: boolean;
  isOffline: boolean;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const connection = useServerConnection(true, 60000); // Check every 60s

  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider');
  }
  return context;
}
