"use client";

import { useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { getSeanceByType } from "@/lib/exercises";
import { Serie, ExerciceLog, SeanceType } from "@/lib/types";
import { calculerTonnageSeance, formaterTonnage } from "@/lib/calculations";
import { saveLocalSeance } from "@/lib/localStorage";
import { TempoEngine } from "@/components/TempoEngine";
import { SetLogger } from "@/components/SetLogger";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ExerciseDetails } from "@/components/ExerciseDetails";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ type: string }>;
}

type ViewMode = "overview" | "details" | "exercise" | "tempo" | "log" | "complete";

export default function SeancePage({ params }: PageProps) {
  const { type } = use(params);
  const router = useRouter();
  const seance = getSeanceByType(type.toUpperCase() as SeanceType);

  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [exercicesLog, setExercicesLog] = useState<ExerciceLog[]>([]);
  const [currentSeries, setCurrentSeries] = useState<Serie[]>([]);
  
  // Notes et mood de fin de séance
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionMood, setSessionMood] = useState<"great" | "good" | "ok" | "bad" | null>(null);

  if (!seance) {
    return (
      <div className="page container">
        <h1>Séance non trouvée</h1>
        <button className="btn btn-primary" onClick={() => router.push("/")}>
          Retour
        </button>
      </div>
    );
  }

  const currentExercise = seance.exercices[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === seance.exercices.length - 1;
  const isLastSet = currentSetIndex === currentExercise.series - 1;

  // Calculer le tonnage total actuel
  const getTotalTonnage = () => {
    const allSeries = [...exercicesLog, { nom: currentExercise.nom, series: currentSeries }];
    return calculerTonnageSeance(allSeries);
  };

  // Afficher les détails de l'exercice (avec vidéo)
  const showExerciseDetails = (index: number) => {
    setCurrentExerciseIndex(index);
    setViewMode("details");
  };

  // Démarrer un exercice (après avoir vu les détails)
  const startExercise = () => {
    setCurrentSetIndex(0);
    setCurrentSeries([]);
    setViewMode("exercise");
  };

  // Démarrer le tempo pour une série
  const startTempo = () => {
    setViewMode("tempo");
  };

  // Tempo terminé, passer au log
  const handleTempoComplete = () => {
    setViewMode("log");
  };

  // Enregistrer une série
  const handleSetComplete = useCallback((serie: Serie) => {
    const updatedSeries = [...currentSeries, serie];
    setCurrentSeries(updatedSeries);

    if (currentSetIndex < currentExercise.series - 1) {
      // Prochaine série
      setCurrentSetIndex((prev) => prev + 1);
      setViewMode("exercise");
    } else {
      // Exercice terminé
      const exerciceLog: ExerciceLog = {
        nom: currentExercise.nom,
        series: updatedSeries,
      };
      setExercicesLog((prev) => [...prev, exerciceLog]);

      if (isLastExercise) {
        // Séance terminée
        setViewMode("complete");
      } else {
        // Prochain exercice
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSetIndex(0);
        setCurrentSeries([]);
        setViewMode("overview");
      }
    }
  }, [currentExercise, currentSetIndex, currentSeries, isLastExercise]);

  // Passer une série
  const handleSkipSet = () => {
    if (!isLastSet) {
      setCurrentSetIndex((prev) => prev + 1);
    } else {
      // Passer à l'exercice suivant
      if (!isLastExercise) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSetIndex(0);
        setCurrentSeries([]);
        setViewMode("overview");
      } else {
        setViewMode("complete");
      }
    }
  };

  // Terminer la séance
  const finishSession = () => {
    // Calculer le tonnage total final
    const totalTonnage = getTotalTonnage();
    
    // Sauvegarder la séance dans le stockage local
    saveLocalSeance({
      date: new Date().toISOString(),
      type: seance.type,
      exercices: exercicesLog,
      tonnageTotal: totalTonnage,
      notes: sessionNotes || undefined,
      mood: sessionMood || undefined,
    });
    
    // Rediriger vers l'accueil
    router.push("/");
  };

  // Vue Overview - Liste des exercices
  if (viewMode === "overview") {
    return (
      <div className="page container">
        <header className={styles.header}>
          <button className="header-back" onClick={() => router.push("/")}>
            ←
          </button>
          <div>
            <h1>Séance {seance.type}</h1>
            <p className="text-secondary">{seance.nom}</p>
          </div>
          <div className={styles.tonnageDisplay}>
            <span className="mono text-accent">{formaterTonnage(getTotalTonnage())}</span>
          </div>
        </header>

        <div className="stack">
          {seance.exercices.map((exercice, index) => {
            const completedLog = exercicesLog.find((e) => e.nom === exercice.nom);
            const isActive = index === currentExerciseIndex && currentSeries.length > 0;
            const isCompleted = !!completedLog;
            const seriesForCard = isActive ? currentSeries : completedLog?.series || [];

            return (
              <ExerciseCard
                key={exercice.id}
                exercice={exercice}
                seriesCompleted={seriesForCard}
                isActive={isActive}
                isCompleted={isCompleted}
                onClick={() => !isCompleted && showExerciseDetails(index)}
              />
            );
          })}
        </div>

        {exercicesLog.length === seance.exercices.length && (
          <button
            className="btn btn-success w-full"
            style={{ marginTop: "var(--space-xl)" }}
            onClick={finishSession}
          >
            ✓ Terminer la séance
          </button>
        )}
      </div>
    );
  }

  // Vue Details - Affiche la vidéo et les instructions avant de commencer
  if (viewMode === "details") {
    return (
      <ExerciseDetails
        exercice={currentExercise}
        onClose={() => setViewMode("overview")}
        onStart={startExercise}
      />
    );
  }

  // Vue Exercice - En cours d'exécution
  if (viewMode === "exercise") {
    return (
      <div className="page container">
        <header className={styles.header}>
          <button className="header-back" onClick={() => setViewMode("overview")}>
            ←
          </button>
          <div>
            <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
              Exercice {currentExerciseIndex + 1}/{seance.exercices.length}
            </p>
            <h1 style={{ fontSize: "1.5rem" }}>{currentExercise.nom}</h1>
          </div>
          <button 
            className={styles.infoButton}
            onClick={() => setViewMode("details")}
            title="Voir les instructions"
          >
            ?
          </button>
        </header>

        <div className={styles.exerciseInfo}>
          {/* Poids suggéré pour la première série */}
          {currentSeries.length === 0 && currentExercise.chargeDepart > 0 && (
            <div className={styles.suggestedWeight}>
              <span className={styles.suggestedLabel}>💪 Poids suggéré</span>
              <span className={styles.suggestedValue}>{currentExercise.chargeDepart}kg</span>
              <span className={styles.suggestedHint}>
                (min {currentExercise.chargeMin}kg — max {currentExercise.chargeMax}kg)
              </span>
            </div>
          )}

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoValue}>{currentExercise.tempo}</span>
              <span className={styles.infoLabel}>Tempo</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoValue}>{currentExercise.series}</span>
              <span className={styles.infoLabel}>Séries</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoValue}>{currentExercise.repsTarget}</span>
              <span className={styles.infoLabel}>Reps</span>
            </div>
          </div>

          {currentExercise.notes && (
            <div className={styles.notes}>
              <p>{currentExercise.notes}</p>
            </div>
          )}

          {/* Séries complétées */}
          {currentSeries.length > 0 && (
            <div className={styles.seriesList}>
              <h4 className="text-secondary" style={{ marginBottom: "var(--space-sm)" }}>
                Séries complétées
              </h4>
              {currentSeries.map((serie, i) => (
                <div key={i} className={styles.serieRow}>
                  <span>Série {i + 1}</span>
                  <span className="mono">
                    {serie.charge}kg × {serie.reps}
                  </span>
                  <span className={serie.tempoRespected ? "text-success" : "text-muted"}>
                    {serie.tempoRespected ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <p className="text-center text-secondary" style={{ marginBottom: "var(--space-md)" }}>
            Série {currentSetIndex + 1} / {currentExercise.series}
          </p>
          <button className="btn btn-primary btn-lg w-full" onClick={startTempo}>
            ▶ Démarrer le tempo
          </button>
          <button
            className="btn btn-ghost w-full"
            onClick={() => setViewMode("log")}
            style={{ marginTop: "var(--space-sm)" }}
          >
            Logger sans tempo
          </button>
        </div>
      </div>
    );
  }

  // Vue Tempo - Moteur de tempo actif
  if (viewMode === "tempo") {
    return (
      <div className="page container">
        <header className={styles.header}>
          <button className="header-back" onClick={() => setViewMode("exercise")}>
            ←
          </button>
          <div>
            <p className="text-secondary">{currentExercise.nom}</p>
            <h1>
              Série {currentSetIndex + 1}/{currentExercise.series}
            </h1>
          </div>
        </header>

        <TempoEngine
          tempo={currentExercise.tempo}
          targetReps={currentExercise.repsTarget}
          onSetComplete={handleTempoComplete}
        />
      </div>
    );
  }

  // Vue Log - Enregistrement de la série
  if (viewMode === "log") {
    // Utiliser la charge suggérée si c'est la première série, sinon la dernière charge utilisée
    const defaultCharge = currentSeries.length === 0 
      ? currentExercise.chargeDepart 
      : currentSeries[currentSeries.length - 1]?.charge || currentExercise.chargeDepart;

    return (
      <div className="page container">
        <header className={styles.header}>
          <button className="header-back" onClick={() => setViewMode("exercise")}>
            ←
          </button>
          <div>
            <p className="text-secondary">{currentExercise.nom}</p>
            <h1>Enregistrer</h1>
          </div>
        </header>

        <div style={{ marginTop: "var(--space-xl)" }}>
          <SetLogger
            setNumber={currentSetIndex + 1}
            targetReps={currentExercise.repsTarget}
            previousCharge={defaultCharge}
            equipement={currentExercise.equipement}
            onComplete={handleSetComplete}
            onSkip={handleSkipSet}
          />
        </div>
      </div>
    );
  }

  // Vue Complete - Séance terminée avec notes
  if (viewMode === "complete") {
    const totalTonnage = getTotalTonnage();
    const totalSeries = exercicesLog.reduce((sum, ex) => sum + ex.series.length, 0);

    return (
      <div className="page container">
        <div className={styles.completeScreen}>
          <div className={styles.completeIcon}>🎉</div>
          <h1>Séance terminée !</h1>
          <p className="text-secondary">Excellent travail</p>

          <div className={styles.completStats}>
            <div className={styles.completeStat}>
              <span className={styles.completeValue}>{seance.exercices.length}</span>
              <span className={styles.completeLabel}>exercices</span>
            </div>
            <div className={styles.completeStat}>
              <span className={styles.completeValue}>{totalSeries}</span>
              <span className={styles.completeLabel}>séries</span>
            </div>
            <div className={styles.completeStat}>
              <span className={styles.completeValue}>{formaterTonnage(totalTonnage)}</span>
              <span className={styles.completeLabel}>tonnage</span>
            </div>
          </div>

          {/* Section Notes & Mood */}
          <div className={styles.feedbackSection}>
            <h3>Comment tu te sens ?</h3>
            <div className={styles.moodSelector}>
              <button 
                className={`${styles.moodBtn} ${sessionMood === "great" ? styles.moodActive : ""}`}
                onClick={() => setSessionMood("great")}
              >
                🔥 Super
              </button>
              <button 
                className={`${styles.moodBtn} ${sessionMood === "good" ? styles.moodActive : ""}`}
                onClick={() => setSessionMood("good")}
              >
                😊 Bien
              </button>
              <button 
                className={`${styles.moodBtn} ${sessionMood === "ok" ? styles.moodActive : ""}`}
                onClick={() => setSessionMood("ok")}
              >
                😐 Bof
              </button>
              <button 
                className={`${styles.moodBtn} ${sessionMood === "bad" ? styles.moodActive : ""}`}
                onClick={() => setSessionMood("bad")}
              >
                😓 Dur
              </button>
            </div>

            <textarea
              className={styles.notesInput}
              placeholder="Notes (optionnel) : fatigue, douleur, sensations..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={3}
            />
          </div>

          <button className="btn btn-primary btn-lg w-full" onClick={finishSession}>
            ✓ Enregistrer et terminer
          </button>
        </div>
      </div>
    );
  }

  return null;
}
