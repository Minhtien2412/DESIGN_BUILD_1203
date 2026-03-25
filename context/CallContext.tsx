import { apiFetch } from "@/services/api";
import { getAccessToken as getFreshAccessToken } from "@/services/apiClient";
import {
    buildSocketOptions,
    getWsBaseUrl,
} from "@/services/socket/socketConfig";
import type { Socket } from "@/utils/socketIo";
import { getSocketIo } from "@/utils/socketIo";
import { VideoCallManager } from "@/utils/VideoCallManager";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAuth } from "./AuthContext";

// Types
export type CallType = "video" | "audio";
export type CallStatus =
  | "pending"
  | "ringing"
  | "active"
  | "ended"
  | "rejected"
  | "missed";

export interface Call {
  id: number;
  callerId: number;
  calleeId: number;
  roomId: string;
  status: CallStatus;
  type: CallType;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  caller?: {
    id: number;
    name: string;
    email: string;
  };
  callee?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CallSignal {
  type: "offer" | "answer" | "ice-candidate";
  data: any;
}

interface CallContextValue {
  // State
  currentCall: Call | null;
  incomingCall: Call | null;
  callHistory: Call[];
  connected: boolean; // Renamed from isConnected for consistency
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Actions
  startCall: (calleeId: number, type: CallType) => Promise<Call>;
  acceptCall: (callId: number) => Promise<void>;
  rejectCall: (callId: number) => Promise<void>;
  endCall: () => Promise<void>;
  sendCallSignal: (signal: CallSignal) => void;

  // WebRTC controls
  toggleMicrophone: () => boolean;
  toggleCamera: () => boolean;
  switchCamera: () => Promise<void>;
  toggleSpeaker: () => boolean;

  // Event handlers
  onCallSignal?: (signal: CallSignal) => void;
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

// Call socket URL resolved from single source of truth
const getCallWsUrl = () => `${getWsBaseUrl()}/call`;

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const signalHandlerRef = useRef<((signal: CallSignal) => void) | undefined>(
    undefined,
  );
  const videoCallManagerRef = useRef<VideoCallManager | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const connectionAttemptedRef = useRef(false);

  // Initialize WebSocket connection - DEFERRED to avoid blocking startup
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      connectionAttemptedRef.current = false;
      return;
    }

    // Prevent multiple connection attempts in same session
    if (connectionAttemptedRef.current && socketRef.current) {
      return;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const connectSocket = async () => {
      try {
        // Get access token via centralized token service
        const accessToken = await getFreshAccessToken();

        if (!isMounted) return;

        if (!accessToken) {
          console.log(
            "📞 Call WebSocket: No access token, skipping connection",
          );
          return;
        }

        connectionAttemptedRef.current = true;

        const wsUrl = getCallWsUrl();
        console.log("📞 Call WebSocket: Connecting to", wsUrl);

        const io = await getSocketIo();
        const newSocket = io(
          wsUrl,
          buildSocketOptions(accessToken, {
            reconnectionAttempts: 5,
            timeout: 5000,
          }),
        );

        socketRef.current = newSocket;

        // Refresh token before each reconnect attempt to avoid jwt expired errors
        newSocket.io.on("reconnect_attempt", async () => {
          try {
            const freshToken = await getFreshAccessToken();
            if (freshToken && newSocket) {
              (newSocket as any).auth = { token: freshToken };
              console.log(
                "📞 Call WebSocket: Token refreshed for reconnection",
              );
            }
          } catch (err) {
            console.warn(
              "📞 Call WebSocket: Failed to refresh token for reconnection:",
              err,
            );
          }
        });

        newSocket.on("connect", () => {
          if (!isMounted) return;
          console.log("📞 Call WebSocket connected");
          setConnected(true);
          setSocket(newSocket);
          newSocket.emit("register", { userId: user.id });
        });

        newSocket.on("disconnect", () => {
          if (!isMounted) return;
          console.log("📞 Call WebSocket disconnected");
          setConnected(false);
        });

        newSocket.on("connect_error", async (error: any) => {
          const errorMsg = error?.message || "";
          // Handle token expiration: refresh and update auth for next reconnect
          if (
            errorMsg.includes("jwt expired") ||
            errorMsg.includes("Invalid token") ||
            errorMsg.includes("Authentication")
          ) {
            console.log("📞 Call WebSocket: Token issue, refreshing...");
            try {
              const freshToken = await getFreshAccessToken();
              if (freshToken && newSocket) {
                (newSocket as any).auth = { token: freshToken };
                console.log(
                  "📞 Call WebSocket: Token updated for reconnection",
                );
              } else {
                // Token refresh failed (401) — stop reconnecting with stale token
                console.warn(
                  "📞 Call WebSocket: No fresh token — disconnecting to avoid spam",
                );
                newSocket.disconnect();
              }
            } catch {
              console.warn(
                "📞 Call WebSocket: Token refresh failed — disconnecting",
              );
              newSocket.disconnect();
            }
          } else {
            console.warn(
              "📞 Call WebSocket connection error:",
              errorMsg || "Connection failed",
            );
          }
          setConnected(false);
        });

        newSocket.on("error", (error: any) => {
          // Handle server-side error events gracefully
          const message =
            error?.message ||
            (typeof error === "string" ? error : "Unknown error");
          if (message.includes("Authentication")) {
            console.log("📞 Call WebSocket: Server requires authentication");
          } else {
            console.warn("📞 Call WebSocket server error:", message);
          }
        });

        newSocket.on("incoming_call", (call: Call) => {
          console.log("📞 Incoming call from:", call.caller?.name);
          setIncomingCall(call);
        });

        newSocket.on(
          "call_accepted",
          (data: { callId: number; acceptedBy: number }) => {
            console.log("📞 Call accepted:", data);
            if (currentCall?.id === data.callId) {
              setCurrentCall((prev) =>
                prev ? { ...prev, status: "active" } : null,
              );
            }
          },
        );

        newSocket.on(
          "call_rejected",
          (data: { callId: number; rejectedBy: number }) => {
            console.log("📞 Call rejected:", data);
            if (currentCall?.id === data.callId) {
              setCurrentCall(null);
            }
            if (incomingCall?.id === data.callId) {
              setIncomingCall(null);
            }
          },
        );

        newSocket.on(
          "call_ended",
          (data: { callId: number; endedBy: number }) => {
            console.log("📞 Call ended:", data);
            if (currentCall?.id === data.callId) {
              setCurrentCall(null);
            }
            if (incomingCall?.id === data.callId) {
              setIncomingCall(null);
            }
          },
        );

        newSocket.on(
          "call_signal",
          async (signal: CallSignal & { from?: number }) => {
            console.log(
              "📞 Call signal received:",
              signal.type,
              "from:",
              signal.from,
            );

            try {
              const videoCallManager = videoCallManagerRef.current;

              if (signal.type === "offer") {
                console.log("📨 Received offer, creating answer...");

                if (!videoCallManager) {
                  const newManager = new VideoCallManager({
                    onLocalStream: (stream) => {
                      console.log("📹 Local stream ready");
                      setLocalStream(stream);
                    },
                    onRemoteStream: (stream) => {
                      console.log("📹 Remote stream ready");
                      setRemoteStream(stream);
                    },
                    onIceCandidate: (candidate) => {
                      console.log("🧊 Sending ICE candidate");
                      if (newSocket && signal.from) {
                        // BE expects: { to: targetUserId, signal: any }
                        newSocket.emit("call_signal", {
                          to: signal.from, // Send back to caller
                          signal: { type: "ice-candidate", data: candidate },
                        });
                      }
                    },
                    onConnectionStateChange: (state) => {
                      console.log("🔌 Connection state:", state);
                    },
                    onError: (error) => {
                      console.error("❌ WebRTC error:", error);
                    },
                  });

                  videoCallManagerRef.current = newManager;
                  const answer = await newManager.createAnswer(
                    signal.data,
                    true,
                    true,
                  );

                  if (newSocket && signal.from) {
                    // BE expects: { to: targetUserId, signal: any }
                    newSocket.emit("call_signal", {
                      to: signal.from, // Send answer back to caller
                      signal: { type: "answer", data: answer },
                    });
                  }
                }
              } else if (signal.type === "answer") {
                console.log("📨 Received answer");
                if (videoCallManager) {
                  await videoCallManager.handleAnswer(signal.data);
                }
              } else if (signal.type === "ice-candidate") {
                console.log("🧊 Received ICE candidate");
                if (videoCallManager) {
                  await videoCallManager.addIceCandidate(signal.data);
                }
              }
            } catch (error) {
              console.error("❌ Error handling call signal:", error);
            }

            if (signalHandlerRef.current) {
              signalHandlerRef.current(signal);
            }
          },
        );

        setSocket(newSocket);
      } catch (error) {
        console.log(
          "📞 Call WebSocket initialization skipped:",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    };

    // Defer WebSocket connection to avoid blocking startup
    // Wait 2 seconds after user available before connecting
    timeoutId = setTimeout(() => {
      connectSocket();
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]); // Only re-run when user.id changes, not currentCall

  const loadCallHistory = useCallback(async () => {
    try {
      // apiFetch base URL already contains /api/v1
      const data = await apiFetch("/call/history");
      setCallHistory(data);
    } catch (error) {
      console.error("Failed to load call history:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadCallHistory();
    }
  }, [user, loadCallHistory]);

  const startCall = useCallback(
    async (calleeId: number, type: CallType): Promise<Call> => {
      if (!user) throw new Error("Not authenticated");

      try {
        // apiFetch base URL already contains /api/v1
        const call = await apiFetch("/call/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calleeId, type }),
        });

        setCurrentCall(call);

        const videoCallManager = new VideoCallManager({
          onLocalStream: (stream) => {
            console.log("📹 Local stream ready");
            setLocalStream(stream);
          },
          onRemoteStream: (stream) => {
            console.log("📹 Remote stream ready");
            setRemoteStream(stream);
          },
          onIceCandidate: (candidate) => {
            console.log("🧊 Sending ICE candidate");
            if (socket) {
              // BE expects: { to: targetUserId, signal: any }
              socket.emit("call_signal", {
                to: calleeId,
                signal: { type: "ice-candidate", data: candidate },
              });
            }
          },
          onConnectionStateChange: (state) => {
            console.log("🔌 Connection state:", state);
          },
          onError: (error) => {
            console.error("❌ WebRTC error:", error);
          },
        });

        videoCallManagerRef.current = videoCallManager;

        const offer = await videoCallManager.createOffer(
          type === "video",
          true,
        );

        if (socket) {
          // BE expects: { to: targetUserId, signal: any }
          socket.emit("call_signal", {
            to: calleeId,
            signal: { type: "offer", data: offer },
          });
        }

        return call;
      } catch (error) {
        console.error("Failed to start call:", error);
        throw error;
      }
    },
    [user, socket],
  );

  const acceptCall = useCallback(
    async (callId: number) => {
      if (!user || !socket) throw new Error("Not ready");

      try {
        socket.emit("accept_call", { callId });

        if (incomingCall?.id === callId) {
          setCurrentCall({ ...incomingCall, status: "active" });
          setIncomingCall(null);
        }
      } catch (error) {
        console.error("Failed to accept call:", error);
        throw error;
      }
    },
    [user, socket, incomingCall],
  );

  const rejectCall = useCallback(
    async (callId: number) => {
      if (!user) throw new Error("Not authenticated");

      try {
        // apiFetch base URL already contains /api/v1
        await apiFetch(`/call/reject/${callId}`, {
          method: "POST",
        });

        if (incomingCall?.id === callId) {
          setIncomingCall(null);
        }
        if (currentCall?.id === callId) {
          setCurrentCall(null);
        }
      } catch (error) {
        console.error("Failed to reject call:", error);
        throw error;
      }
    },
    [user, incomingCall, currentCall],
  );

  const endCall = useCallback(async () => {
    if (!user || !currentCall) return;

    try {
      // apiFetch base URL already contains /api/v1
      await apiFetch("/call/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: currentCall.id }),
      });

      if (videoCallManagerRef.current) {
        videoCallManagerRef.current.cleanup();
        videoCallManagerRef.current = null;
      }

      setCurrentCall(null);
      setLocalStream(null);
      setRemoteStream(null);

      loadCallHistory();
    } catch (error) {
      console.error("Failed to end call:", error);
      throw error;
    }
  }, [user, currentCall]);

  const sendCallSignal = useCallback(
    (signal: CallSignal, targetUserId?: number) => {
      if (!socket || !currentCall) return;

      // BE expects: { to: targetUserId, signal: any }
      const toUserId =
        targetUserId ||
        (currentCall.callerId === Number(user?.id)
          ? currentCall.calleeId
          : currentCall.callerId);

      socket.emit("call_signal", {
        to: toUserId,
        signal,
      });
    },
    [socket, currentCall, user?.id],
  );

  const toggleMicrophone = useCallback((): boolean => {
    if (!videoCallManagerRef.current) return false;
    return videoCallManagerRef.current.toggleMicrophone();
  }, []);

  const toggleCamera = useCallback((): boolean => {
    if (!videoCallManagerRef.current) return false;
    return videoCallManagerRef.current.toggleCamera();
  }, []);

  const switchCamera = useCallback(async () => {
    if (!videoCallManagerRef.current) return;
    await videoCallManagerRef.current.switchCamera();
  }, []);

  const toggleSpeaker = useCallback((): boolean => {
    if (!videoCallManagerRef.current) return false;
    return videoCallManagerRef.current.toggleSpeaker();
  }, []);

  const value: CallContextValue = {
    currentCall,
    incomingCall,
    callHistory,
    connected,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    sendCallSignal,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    toggleSpeaker,
    onCallSignal: signalHandlerRef.current,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
}

export function useCallSignalHandler(handler: (signal: CallSignal) => void) {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallSignalHandler must be used within CallProvider");
  }

  useEffect(() => {
    const ref = (context as any).signalHandlerRef;
    if (ref) {
      ref.current = handler;
    }

    return () => {
      if (ref) {
        ref.current = undefined;
      }
    };
  }, [handler]);
}
