"use client";

import { Exercice, Serie } from "@/lib/types";
import { calculerTonnageExercice } from "@/lib/calculations";
import styles from "./ExerciseCard.module.css";

interface ExerciseCardProps {
  exercice: Exercice;
  seriesCompleted: Serie[];
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}

export function ExerciseCard({
  exercice,
  seriesCompleted,
  isActive,
  isCompleted,
  onClick,
}: ExerciseCardProps) {
  const tonnage = calculerTonnageExercice({ nom: exercice.nom, series: seriesCompleted });
  const progress = (seriesCompleted.length / exercice.series) * 100;

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""}`}
      onClick={onClick}
    >
      {/* Barre de progression */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{exercice.nom}</h3>
          {isCompleted && <span className={styles.checkmark}>✓</span>}
        </div>

        <div className={styles.meta}>
          <span className={styles.tempo}>
            <span className="mono">{exercice.tempo}</span>
          </span>
          <span className={styles.separator}>•</span>
          <span>
            {seriesCompleted.length}/{exercice.series} séries
          </span>
          <span className={styles.separator}>•</span>
          <span>{exercice.repsTarget} reps</span>
        </div>

        {exercice.notes && (
          <p className={styles.notes}>{exercice.notes}</p>
        )}

        {seriesCompleted.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {seriesCompleted[seriesCompleted.length - 1]?.charge || 0}kg
              </span>
              <span className={styles.statLabel}>dernière charge</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{tonnage}kg</span>
              <span className={styles.statLabel}>tonnage</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
