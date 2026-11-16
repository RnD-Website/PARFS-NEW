"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Browser speech-to-text (Web Speech API). `supported` is false where unavailable. */
export function useVoiceInput(onText: (text: string, final: boolean) => void) {
  const hydrated = useHydrated();
  const supported = hydrated && !!getCtor();
  const [listening, setListening] = useState(false);
  const rec = useRef<SpeechRecognitionLike | null>(null);
  const cb = useRef(onText);

  useEffect(() => {
    cb.current = onText;
  }, [onText]);
  useEffect(() => () => rec.current?.stop(), []);

  const toggle = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    if (!rec.current) {
      const r = new Ctor();
      r.lang = "en-US";
      r.interimResults = true;
      r.continuous = false;
      r.onresult = (e) => {
        const results = Array.from(e.results);
        cb.current(results.map((res) => res[0].transcript).join(" "), results.some((res) => res.isFinal));
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      rec.current = r;
    }
    if (listening) {
      rec.current.stop();
      return;
    }
    try {
      rec.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening]);

  return { supported, listening, toggle };
}
