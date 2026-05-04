import { useState, useRef, useCallback } from "react";

export function useSpeech({ onLipSync, onUserSpeech, lang = "en" }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const animFrameRef = useRef(null);
  const speakingRef = useRef(false);

  const LANG_MAP = {
    en: { stt: "en-US", tts: "en-US" },
    fr: { stt: "fr-FR", tts: "fr-FR" },
  };
  const langConfig = LANG_MAP[lang] || LANG_MAP.en;

  const runLipAnim = useCallback(() => {
    if (!speakingRef.current) return;
    const t = Date.now() / 1000;
    const val = Math.max(0.05, Math.min(1,
      0.4 + Math.sin(t * 8.5) * 0.3 + Math.sin(t * 17.3) * 0.15
    ));
    onLipSync?.(val);
    animFrameRef.current = requestAnimationFrame(runLipAnim);
  }, [onLipSync]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setIsSpeaking(false);
    cancelAnimationFrame(animFrameRef.current);
    onLipSync?.(0);
  }, [onLipSync]);

  const speak = useCallback((text, forceLang) => {
    stopSpeaking();
    const activeLang = forceLang || lang;
    const activeTts = activeLang === "fr" ? "fr-FR" : "en-US";

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = activeTts;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();

      if (activeLang === "fr") {
        const frVoice =
          voices.find(v => v.lang === "fr-FR" && v.name.includes("Henri")) ||
          voices.find(v => v.lang === "fr-FR" && v.name.includes("Thomas")) ||
          voices.find(v => v.lang === "fr-FR" && v.name.includes("Nicolas")) ||
          voices.find(v => v.lang === "fr-FR" && v.name.toLowerCase().includes("male")) ||
          voices.find(v => v.lang === "fr-FR" && !v.localService) ||
          voices.find(v => v.lang === "fr-FR") ||
          voices.find(v => v.lang.startsWith("fr"));

        if (frVoice) utterance.voice = frVoice;
        utterance.pitch = 0.40;
        utterance.rate = 0.80;
      } else {
        const enVoice =
          voices.find(v => v.name.includes("Google UK English Male")) ||
          voices.find(v => v.name.includes("Microsoft David")) ||
          voices.find(v => v.name.includes("Daniel")) ||
          voices.find(v => v.name.toLowerCase().includes("male") && v.lang.startsWith("en")) ||
          voices.find(v => v.lang === "en-US" && !v.localService) ||
          voices.find(v => v.lang === "en-US");

        if (enVoice) utterance.voice = enVoice;
        utterance.pitch = 0.85;
        utterance.rate = 0.88;
      }

      utterance.onstart = () => {
        speakingRef.current = true;
        setIsSpeaking(true);
        animFrameRef.current = requestAnimationFrame(runLipAnim);
      };
      utterance.onboundary = (e) => {
        if (e.name === "word") onLipSync?.(0.7 + Math.random() * 0.3);
      };
      utterance.onend = () => {
        speakingRef.current = false;
        setIsSpeaking(false);
        cancelAnimationFrame(animFrameRef.current);
        onLipSync?.(0);
      };
      utterance.onerror = () => {
        speakingRef.current = false;
        setIsSpeaking(false);
        cancelAnimationFrame(animFrameRef.current);
        onLipSync?.(0);
      };
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
    }
  }, [onLipSync, stopSpeaking, runLipAnim, lang, langConfig]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice input."); return; }
    stopSpeaking();
    const recognition = new SR();
    recognition.lang = langConfig.stt;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => onUserSpeech?.(e.results[0][0].transcript);
    recognitionRef.current = recognition;
    recognition.start();
  }, [stopSpeaking, onUserSpeech, langConfig]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSpeaking, speak, stopSpeaking, startListening, stopListening };
}
