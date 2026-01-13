"use client";

import { Exercice } from "@/lib/types";
import styles from "./ExerciseDetails.module.css";

interface ExerciseDetailsProps {
  exercice: Exercice;
  onClose: () => void;
  onStart: () => void;
}

export function ExerciseDetails({ exercice, onClose, onStart }: ExerciseDetailsProps) {
  // Extraire l'ID YouTube de l'URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(exercice.videoUrl);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
          <h2>{exercice.nom}</h2>
          <div className={styles.muscles}>
            {exercice.musclesCibles.map((muscle, i) => (
              <span key={i} className={styles.muscleTag}>
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* Video */}
        <div className={styles.videoContainer}>
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              title={exercice.nom}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
          ) : (
            <div className={styles.noVideo}>
              <a href={exercice.videoUrl} target="_blank" rel="noopener noreferrer">
                📺 Voir la vidéo
              </a>
            </div>
          )}
        </div>

        {/* Poids suggérés */}
        <div className={styles.weightSection}>
          <h3>💪 Poids de départ suggéré</h3>
          <div className={styles.weightCards}>
            <div className={styles.weightCard}>
              <span className={styles.weightLabel}>Minimum</span>
              <span className={styles.weightValue}>{exercice.chargeMin}kg</span>
            </div>
            <div className={`${styles.weightCard} ${styles.weightCardMain}`}>
              <span className={styles.weightLabel}>Suggéré</span>
              <span className={styles.weightValue}>{exercice.chargeDepart}kg</span>
            </div>
            <div className={styles.weightCard}>
              <span className={styles.weightLabel}>Maximum S1</span>
              <span className={styles.weightValue}>{exercice.chargeMax}kg</span>
            </div>
          </div>
          <p className={styles.weightHint}>
            {exercice.equipement === "barre" 
              ? "💡 La barre olympique pèse déjà 20kg"
              : exercice.equipement === "halteres"
              ? "💡 Poids indiqué par haltère"
              : ""}
          </p>
        </div>

        {/* Exécution */}
        <div className={styles.section}>
          <h3>📋 Exécution</h3>
          <ol className={styles.executionList}>
            {exercice.execution.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Erreurs courantes */}
        {exercice.erreursCourantes && exercice.erreursCourantes.length > 0 && (
          <div className={styles.section}>
            <h3>⚠️ Erreurs à éviter</h3>
            <ul className={styles.errorList}>
              {exercice.erreursCourantes.map((erreur, i) => (
                <li key={i}>{erreur}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tempo */}
        <div className={styles.tempoSection}>
          <h3>⏱️ Tempo : {exercice.tempo}</h3>
          <div className={styles.tempoExplain}>
            {exercice.tempo.split("-").map((val, i) => {
              const labels = ["Descente", "Pause bas", "Remontée", "Pause haut"];
              const duree = parseInt(val);
              if (duree === 0) return null;
              return (
                <div key={i} className={styles.tempoPhase}>
                  <span className={styles.tempoValue}>{duree}s</span>
                  <span className={styles.tempoLabel}>{labels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        {exercice.notes && (
          <div className={styles.notes}>
            <strong>📝 Note :</strong> {exercice.notes}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button className="btn btn-primary btn-lg w-full" onClick={onStart}>
            ▶ Commencer l&apos;exercice
          </button>
        </div>
      </div>
    </div>
  );
}
