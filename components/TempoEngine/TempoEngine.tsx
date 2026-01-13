"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { parseTempo, TempoPhase } from "@/lib/types";
import { useTempoAudio } from "./useTempoAudio";
import { TempoVisual } from "./TempoVisual";
import styles from "./TempoEngine.module.css";

interface TempoEngineProps {
  tempo: string; // ex: "3-0-1-0"
  targetReps: number;
  onRepComplete?: (repNumber: number) => void;
  onSetComplete?: (totalReps: number) => void;
}

export function TempoEngine({ tempo, targetReps, onRepComplete, onSetComplete }: TempoEngineProps) {
  const phases = parseTempo(tempo);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [repCount, setRepCount] = useState(0);
  
  const audio = useTempoAudio();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentPhase: TempoPhase | null = isRunning ? phases[currentPhaseIndex] : null;

  // Nettoyage de l'intervalle
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Démarre le tempo
  const startTempo = useCallback(() => {
    audio.initAudio();
    setIsRunning(true);
    setCurrentPhaseIndex(0);
    setCountdown(phases[0]?.duration || 0);
    audio.playPhaseStart();
    startTimeRef.current = performance.now();
  }, [audio, phases]);

  // Arrête le tempo
  const stopTempo = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setCountdown(0);
  }, [clearTimer]);

  // Valide la série
  const completeSet = useCallback(() => {
    stopTempo();
    audio.playSetComplete();
    onSetComplete?.(repCount);
  }, [stopTempo, audio, onSetComplete, repCount]);

  // Reset complet
  const resetTempo = useCallback(() => {
    stopTempo();
    setRepCount(0);
  }, [stopTempo]);

  // Gestion du timer avec précision
  useEffect(() => {
    if (!isRunning || !currentPhase) return;

    intervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.ceil(currentPhase.duration - elapsed);

      if (remaining > 0) {
        if (remaining !== countdown) {
          setCountdown(remaining);
          if (remaining < currentPhase.duration) {
            audio.playTick();
          }
        }
      } else {
        // Phase terminée
        const nextPhaseIndex = currentPhaseIndex + 1;

        if (nextPhaseIndex >= phases.length) {
          // Répétition terminée
          const newRepCount = repCount + 1;
          setRepCount(newRepCount);
          audio.playRepComplete();
          onRepComplete?.(newRepCount);

          if (newRepCount >= targetReps) {
            // Série terminée
            completeSet();
            return;
          }

          // Recommence le cycle
          setCurrentPhaseIndex(0);
          setCountdown(phases[0]?.duration || 0);
          startTimeRef.current = performance.now();
          audio.playPhaseStart();
        } else {
          // Passe à la phase suivante
          setCurrentPhaseIndex(nextPhaseIndex);
          setCountdown(phases[nextPhaseIndex]?.duration || 0);
          startTimeRef.current = performance.now();
          audio.playPhaseStart();
        }
      }
    }, 50); // 50ms pour une bonne précision

    return () => clearTimer();
  }, [isRunning, currentPhase, currentPhaseIndex, countdown, phases, repCount, targetReps, audio, onRepComplete, completeSet, clearTimer]);

  return (
    <div className={styles.tempoContainer}>
      {/* Affichage du tempo ciblé */}
      <div className={styles.infoBar}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Tempo</span>
          <span className={styles.infoValue}>{tempo}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Cible</span>
          <span className={styles.infoValue}>{targetReps} reps</span>
        </div>
      </div>

      {/* Visualisation */}
      <TempoVisual
        currentPhase={currentPhase}
        countdown={countdown}
        isActive={isRunning}
        repCount={repCount}
      />

      {/* Contrôles */}
      <div className={styles.controls}>
        {!isRunning ? (
          <>
            <button
              className="btn btn-primary"
              onClick={startTempo}
              style={{ flex: 2 }}
            >
              ▶ Démarrer
            </button>
            {repCount > 0 && (
              <button
                className="btn btn-ghost"
                onClick={resetTempo}
                style={{ flex: 1 }}
              >
                ↺
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="btn btn-danger"
              onClick={stopTempo}
              style={{ flex: 1 }}
            >
              ⏸
            </button>
            <button
              className="btn btn-success"
              onClick={completeSet}
              style={{ flex: 2 }}
            >
              ✓ Valider série
            </button>
          </>
        )}
      </div>
    </div>
  );
}
