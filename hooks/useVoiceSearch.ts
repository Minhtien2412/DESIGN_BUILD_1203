import {
    RecordingStatus,
    VoiceSearchConfig,
    VoiceSearchResult,
    voiceSearchService,
} from "@/services/voiceSearchService";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

type VoiceState = "idle" | "listening" | "finalizing" | "error" | "processing";

/**
 * Hook for voice search with native + web support
 * Uses voiceSearchService for native (expo-audio + Whisper API)
 * Falls back to Web Speech API for browser
 */
export function useVoiceSearch(lang: string = "vi-VN") {
  const [supported, setSupported] = useState<boolean>(true); // Native always supported
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<VoiceSearchResult | null>(null);

  const recognitionRef = useRef<any>(null);

  // Subscribe to voiceSearchService status for native
  useEffect(() => {
    if (Platform.OS !== "web") {
      const unsubscribe = voiceSearchService.addStateListener(
        (status: RecordingStatus) => {
          if (status.state === "recording") {
            setState("listening");
          } else if (status.state === "processing") {
            setState("processing");
          } else if (status.state === "error") {
            setState("error");
            setError(status.error || "Recording error");
          } else {
            // idle - only set to idle if not finalizing
            if (state !== "finalizing") {
              setState("idle");
            }
          }
        },
      );
      return unsubscribe;
    }
  }, [state]);

  // Web Speech API setup (for browser)
  useEffect(() => {
    if (Platform.OS === "web") {
      const w = globalThis as any;
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition || null;
      if (SR) {
        setSupported(true);
        const rec = new SR();
        rec.lang = lang;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setState("listening");
          setError(null);
          setTranscript("");
        };
        rec.onerror = (e: any) => {
          setState("error");
          setError(e?.error || "microphone-error");
        };
        rec.onend = () => {
          if (state === "listening") setState("finalizing");
          else if (state !== "error") setState("idle");
        };
        rec.onresult = (event: any) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text.trim());
        };
        recognitionRef.current = rec;
      } else {
        setSupported(false);
      }
    }
  }, [lang]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");

    if (Platform.OS === "web") {
      // Use Web Speech API
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Some browsers throw if called concurrently
        }
      } else {
        setState("error");
        setError("voice-not-supported");
      }
    } else {
      // Use native recording via voiceSearchService
      const success = await voiceSearchService.startRecording(30000);
      if (!success) {
        setState("error");
        setError("microphone-permission-denied");
      }
    }
  }, []);

  const stop = useCallback(
    async (config?: VoiceSearchConfig) => {
      if (Platform.OS === "web") {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
        setState("finalizing");
      } else {
        // Stop native recording and process with voice search
        setState("processing");
        const result = await voiceSearchService.processRecordingForSearch(
          config || { language: lang },
        );

        if (result.success && result.query) {
          setTranscript(result.query);
          setLastResult(result);
          setState("finalizing");
        } else {
          setError(result.error || "transcription-failed");
          setState("error");
        }
      }
    },
    [lang],
  );

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    setLastResult(null);
    setState("idle");
    // Cancel any ongoing native recording
    if (Platform.OS !== "web") {
      voiceSearchService.cancelRecording();
    }
  }, []);

  return {
    supported,
    state,
    transcript,
    error,
    lastResult,
    start,
    stop,
    reset,
    isRecording: state === "listening",
    isProcessing: state === "processing" || state === "finalizing",
  };
}
