"use client";

import { useState } from "react";
import { Serie } from "@/lib/types";
import styles from "./SetLogger.module.css";

interface SetLoggerProps {
  setNumber: number;
  targetReps: number;
  previousCharge?: number;
  equipement: "barre" | "halteres" | "corps";
  onComplete: (serie: Serie) => void;
  onSkip?: () => void;
}

export function SetLogger({
  setNumber,
  targetReps,
  previousCharge = 0,
  equipement,
  onComplete,
  onSkip,
}: SetLoggerProps) {
  const [charge, setCharge] = useState(previousCharge);
  const [reps, setReps] = useState(targetReps);
  const [tempoRespected, setTempoRespected] = useState(true);

  const increment = equipement === "barre" ? 2.5 : 1;
  const isBodyweight = equipement === "corps";

  const handleChargeChange = (delta: number) => {
    setCharge((prev) => Math.max(0, prev + delta));
  };

  const handleRepsChange = (delta: number) => {
    setReps((prev) => Math.max(0, Math.min(99, prev + delta)));
  };

  const handleComplete = () => {
    onComplete({
      reps,
      charge: isBodyweight ? 0 : charge,
      tempoRespected,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.setNumber}>Série {setNumber}</span>
        <span className={styles.target}>Cible: {targetReps} reps</span>
      </div>

      <div className={styles.inputs}>
        {/* Charge (sauf poids du corps) */}
        {!isBodyweight && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Charge (kg)</label>
            <div className={styles.stepper}>
              <button
                className={styles.stepperBtn}
                onClick={() => handleChargeChange(-increment)}
                disabled={charge <= 0}
              >
                −
              </button>
              <input
                type="number"
                className={styles.stepperInput}
                value={charge}
                onChange={(e) => setCharge(Number(e.target.value))}
                min={0}
                step={increment}
              />
              <button
                className={styles.stepperBtn}
                onClick={() => handleChargeChange(increment)}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Répétitions */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {isBodyweight ? "Secondes" : "Répétitions"}
          </label>
          <div className={styles.stepper}>
            <button
              className={styles.stepperBtn}
              onClick={() => handleRepsChange(-1)}
              disabled={reps <= 0}
            >
              −
            </button>
            <input
              type="number"
              className={styles.stepperInput}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              min={0}
              max={99}
            />
            <button
              className={styles.stepperBtn}
              onClick={() => handleRepsChange(1)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Tempo respecté */}
      <button
        className={`${styles.tempoToggle} ${tempoRespected ? styles.tempoYes : styles.tempoNo}`}
        onClick={() => setTempoRespected(!tempoRespected)}
      >
        <span className={styles.tempoIcon}>{tempoRespected ? "✓" : "✗"}</span>
        <span>Tempo respecté</span>
      </button>

      {/* Actions */}
      <div className={styles.actions}>
        {onSkip && (
          <button className="btn btn-ghost" onClick={onSkip}>
            Passer
          </button>
        )}
        <button
          className="btn btn-success"
          onClick={handleComplete}
          style={{ flex: 1 }}
        >
          ✓ Valider série
        </button>
      </div>
    </div>
  );
}
