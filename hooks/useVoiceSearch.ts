import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type VoiceState = 'idle' | 'listening' | 'finalizing' | 'error';

export function useVoiceSearch(lang: string = 'vi-VN') {
  const [supported, setSupported] = useState<boolean>(false);
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const w = globalThis as any;
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition || null;
      if (SR) {
        setSupported(true);
        const rec = new SR();
        rec.lang = lang;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setState('listening');
          setError(null);
          setTranscript('');
        };
        rec.onerror = (e: any) => {
          setState('error');
          setError(e?.error || 'microphone-error');
        };
        rec.onend = () => {
          if (state === 'listening') setState('finalizing');
          else if (state !== 'error') setState('idle');
        };
        rec.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text.trim());
        };
        recognitionRef.current = rec;
      } else {
        setSupported(false);
      }
    } else {
      // Native: STT not wired by default. Keep API consistent and report unsupported.
      setSupported(false);
    }
  }, [lang]);

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    if (Platform.OS === 'web' && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Some browsers throw if called concurrently
      }
    } else {
      setState('error');
      setError('voice-not-supported');
    }
  }, []);

  const stop = useCallback(() => {
    if (Platform.OS === 'web' && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setState('finalizing');
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setState('idle');
  }, []);

  return { supported, state, transcript, error, start, stop, reset };
}
