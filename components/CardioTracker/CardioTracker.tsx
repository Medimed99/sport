"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CardioMode } from "@/lib/types";
import { useTempoAudio } from "@/components/TempoEngine";
import styles from "./CardioTracker.module.css";

interface CardioTrackerProps {
  mode: CardioMode;
  onComplete: (dureeMinutes: number) => void;
}

export function CardioTracker({ mode, onComplete }: CardioTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [intervalPhase, setIntervalPhase] = useState<"effort" | "repos">("effort");
  const [breathingReminder, setBreathingReminder] = useState(false);

  const audio = useTempoAudio();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Configuration selon le mode
  const INTERVAL_DURATION = 30; // 30 secondes effort/repos
  const BREATHING_REMINDER_INTERVAL = 300; // 5 minutes

  // Temps restant dans l'intervalle actuel (mode intervalles)
  const intervalTimeRemaining = mode === "intervalles"
    ? INTERVAL_DURATION - (elapsedSeconds % INTERVAL_DURATION)
    : 0;

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Démarrer
  const start = useCallback(() => {
    audio.initAudio();
    setIsRunning(true);
    startTimeRef.current = performance.now() - pausedTimeRef.current * 1000;
    audio.playPhaseStart();
  }, [audio]);

  // Pause
  const pause = () => {
    setIsRunning(false);
    pausedTimeRef.current = elapsedSeconds;
  };

  // Reset
  const reset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setIntervalPhase("effort");
    pausedTimeRef.current = 0;
  };

  // Terminer
  const finish = () => {
    setIsRunning(false);
    const minutes = Math.ceil(elapsedSeconds / 60);
    onComplete(minutes);
  };

  // Timer principal
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((performance.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      // Mode intervalles: changement de phase
      if (mode === "intervalles") {
        const phase = Math.floor(elapsed / INTERVAL_DURATION) % 2 === 0 ? "effort" : "repos";
        if (phase !== intervalPhase) {
          setIntervalPhase(phase);
          audio.playPhaseStart();
        }
        // Bip à 3 secondes avant la fin
        if ((elapsed % INTERVAL_DURATION) === INTERVAL_DURATION - 3) {
          audio.playTick();
        }
      }

      // Mode Zone 2: rappel respiration toutes les 5 min
      if (mode === "zone2" && elapsed > 0 && elapsed % BREATHING_REMINDER_INTERVAL === 0) {
        setBreathingReminder(true);
        audio.playRepComplete();
        setTimeout(() => setBreathingReminder(false), 5000);
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, intervalPhase, audio]);

  return (
    <div className={styles.container}>
      {/* Indicateur de mode */}
      <div className={styles.modeIndicator}>
        {mode === "intervalles" ? "Intervalles 30/30" : "Zone 2 - Endurance"}
      </div>

      {/* Chrono principal */}
      <div
        className={`chrono ${
          mode === "intervalles"
            ? intervalPhase === "effort"
              ? "chrono-effort"
              : "chrono-repos"
            : "chrono-zone2"
        }`}
      >
        {formatTime(elapsedSeconds)}
      </div>

      {/* Timer intervalle (mode intervalles) */}
      {mode === "intervalles" && isRunning && (
        <div className={styles.intervalInfo}>
          <span
            className={styles.phaseLabel}
            style={{
              color:
                intervalPhase === "effort"
                  ? "var(--accent-primary)"
                  : "var(--success)",
            }}
          >
            {intervalPhase === "effort" ? "🔥 EFFORT" : "💨 REPOS"}
          </span>
          <span className={styles.intervalTimer}>{intervalTimeRemaining}s</span>
        </div>
      )}

      {/* Rappel respiration (mode Zone 2) */}
      {mode === "zone2" && breathingReminder && (
        <div className={styles.breathingReminder}>
          <span>🌬️</span>
          <span>Respire profondément</span>
        </div>
      )}

      {/* Stats en temps réel */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {Math.floor(elapsedSeconds / 60)}
          </span>
          <span className={styles.statLabel}>minutes</span>
        </div>
        {mode === "intervalles" && (
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {Math.floor(elapsedSeconds / 60)}
            </span>
            <span className={styles.statLabel}>cycles</span>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className={styles.controls}>
        {!isRunning ? (
          <>
            <button className="btn btn-primary btn-lg" onClick={start} style={{ flex: 2 }}>
              {elapsedSeconds > 0 ? "▶ Reprendre" : "▶ Démarrer"}
            </button>
            {elapsedSeconds > 0 && (
              <button className="btn btn-ghost" onClick={reset}>
                ↺
              </button>
            )}
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={pause} style={{ flex: 1 }}>
              ⏸ Pause
            </button>
            <button className="btn btn-success" onClick={finish} style={{ flex: 2 }}>
              ✓ Terminer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
