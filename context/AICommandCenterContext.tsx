/**
 * AI Command Center Context
 * Global context để quản lý AI Command Center từ bất kỳ đâu trong app
 * Created: 19/01/2026
 */

import AICommandCenter from "@/components/ai/AICommandCenter";
import React, { createContext, useCallback, useContext, useState } from "react";

interface AICommandCenterContextType {
  isVisible: boolean;
  open: (initialQuery?: string) => void;
  close: () => void;
}

const AICommandCenterContext = createContext<AICommandCenterContextType>({
  isVisible: false,
  open: () => {},
  close: () => {},
});

export const useAICommandCenterContext = () =>
  useContext(AICommandCenterContext);

interface AICommandCenterProviderProps {
  children: React.ReactNode;
}

export function AICommandCenterProvider({
  children,
}: AICommandCenterProviderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const open = useCallback((query?: string) => {
    setInitialQuery(query || "");
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setInitialQuery("");
  }, []);

  return (
    <AICommandCenterContext.Provider value={{ isVisible, open, close }}>
      {children}
      <AICommandCenter
        visible={isVisible}
        onClose={close}
        initialQuery={initialQuery}
      />
    </AICommandCenterContext.Provider>
  );
}

export default AICommandCenterContext;
