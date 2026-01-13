"use client";

import { useRef, useCallback } from "react";

interface AudioContextRef {
  context: AudioContext | null;
  initialized: boolean;
}

/**
 * Hook pour gérer les bips audio du tempo via Web Audio API
 * Doit être initialisé au premier tap utilisateur (restriction navigateur)
 */
export function useTempoAudio() {
  const audioRef = useRef<AudioContextRef>({
    context: null,
    initialized: false,
  });

  /**
   * Initialise l'AudioContext (doit être appelé sur une interaction utilisateur)
   */
  const initAudio = useCallback(() => {
    if (audioRef.current.initialized) return;

    try {
      audioRef.current.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioRef.current.initialized = true;
    } catch (e) {
      console.error("Web Audio API non supportée:", e);
    }
  }, []);

  /**
   * Joue un bip à une fréquence donnée
   * @param frequency - Fréquence en Hz (220 = grave, 440 = aigu)
   * @param duration - Durée en ms
   * @param volume - Volume (0 à 1)
   */
  const playBeep = useCallback(
    (frequency: number = 440, duration: number = 100, volume: number = 0.3) => {
      const ctx = audioRef.current.context;
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      // Envelope pour un son propre (évite les clicks)
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000 + 0.01);
    },
    []
  );

  /**
   * Bip grave pour le début d'une nouvelle phase
   */
  const playPhaseStart = useCallback(() => {
    playBeep(220, 150, 0.4);
  }, [playBeep]);

  /**
   * Tick subtil pour chaque seconde
   */
  const playTick = useCallback(() => {
    playBeep(330, 50, 0.15);
  }, [playBeep]);

  /**
   * Bip aigu pour la fin d'une répétition
   */
  const playRepComplete = useCallback(() => {
    playBeep(440, 100, 0.35);
    // Double bip pour emphase
    setTimeout(() => playBeep(523, 100, 0.35), 120);
  }, [playBeep]);

  /**
   * Son de fin de série
   */
  const playSetComplete = useCallback(() => {
    playBeep(523, 150, 0.4);
    setTimeout(() => playBeep(659, 150, 0.4), 150);
    setTimeout(() => playBeep(784, 200, 0.5), 300);
  }, [playBeep]);

  return {
    initAudio,
    playBeep,
    playPhaseStart,
    playTick,
    playRepComplete,
    playSetComplete,
    isInitialized: () => audioRef.current.initialized,
  };
}
