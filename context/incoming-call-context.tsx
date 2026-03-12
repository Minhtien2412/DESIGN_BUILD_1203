/**
 * Incoming Call Context
 * Quản lý cuộc gọi đến toàn ứng dụng
 */

import IncomingCallOverlay, { IncomingCallData } from '@/components/incoming-call-overlay';
import { createContext, ReactNode, useContext, useState } from 'react';

interface IncomingCallContextType {
  showIncomingCall: (callData: IncomingCallData) => void;
  dismissIncomingCall: () => void;
  currentCall: IncomingCallData | null;
}

const IncomingCallContext = createContext<IncomingCallContextType | null>(null);

export function IncomingCallProvider({ children }: { children: ReactNode }) {
  const [currentCall, setCurrentCall] = useState<IncomingCallData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showIncomingCall = (callData: IncomingCallData) => {
    setCurrentCall(callData);
    setIsVisible(true);
  };

  const dismissIncomingCall = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentCall(null);
    }, 300);
  };

  return (
    <IncomingCallContext.Provider
      value={{
        showIncomingCall,
        dismissIncomingCall,
        currentCall,
      }}
    >
      {children}
      <IncomingCallOverlay
        visible={isVisible}
        callData={currentCall}
        onDismiss={dismissIncomingCall}
      />
    </IncomingCallContext.Provider>
  );
}

export function useIncomingCall() {
  const context = useContext(IncomingCallContext);
  if (!context) {
    throw new Error('useIncomingCall must be used within IncomingCallProvider');
  }
  return context;
}
