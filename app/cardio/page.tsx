"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardioMode } from "@/lib/types";
import { CardioTracker } from "@/components/CardioTracker";
import styles from "./page.module.css";

type ViewState = "select" | "session" | "rpe" | "complete";

export default function CardioPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>("select");
  const [selectedMode, setSelectedMode] = useState<CardioMode | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [rpeGastrique, setRpeGastrique] = useState(1);

  const startSession = (mode: CardioMode) => {
    setSelectedMode(mode);
    setViewState("session");
  };

  const handleSessionComplete = (dureeMinutes: number) => {
    setSessionDuration(dureeMinutes);
    setViewState("rpe");
  };

  const handleRpeSubmit = () => {
    // TODO: Sauvegarder dans Firebase
    console.log("Session cardio:", {
      mode: selectedMode,
      dureeMinutes: sessionDuration,
      rpeGastrique,
    });
    setViewState("complete");
  };

  const finishAndReturn = () => {
    router.push("/");
  };

  // Vue sélection du mode
  if (viewState === "select") {
    return (
      <div className="page container">
        <header className={styles.header}>
          <button className="header-back" onClick={() => router.push("/")}>
            ←
          </button>
          <div>
            <h1>Cardio</h1>
            <p className="text-secondary">Opération 9km</p>
          </div>
        </header>

        <div className={styles.modeSelection}>
          <h2 className="text-secondary" style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-md)" }}>
            Choisir le mode
          </h2>

          <button
            className={styles.modeCard}
            onClick={() => startSession("intervalles")}
          >
            <div className={styles.modeIcon}>🔥</div>
            <div className={styles.modeContent}>
              <h3>Intervalles 30/30</h3>
              <p>30s effort intense, 30s récupération</p>
              <span className={styles.modeTag}>Haute intensité</span>
            </div>
          </button>

          <button
            className={styles.modeCard}
            onClick={() => startSession("zone2")}
          >
            <div className={styles.modeIcon}>🌬️</div>
            <div className={styles.modeContent}>
              <h3>Zone 2 - Endurance</h3>
              <p>Course très lente, construction capillaire</p>
              <span className={styles.modeTag}>Basse intensité</span>
            </div>
          </button>
        </div>

        <div className={styles.tips}>
          <h4>💡 Règles Anti-Nausée</h4>
          <ul>
            <li>Privilégie la Zone 2 pour construire ta base</li>
            <li>Pas de sprint en fin de course</li>
            <li>Respire par le nez autant que possible</li>
            <li>Hydrate-toi 2h avant la séance</li>
          </ul>
        </div>
      </div>
    );
  }

  // Vue session active
  if (viewState === "session" && selectedMode) {
    return (
      <div className="page container">
        <header className={styles.header}>
          <button
            className="header-back"
            onClick={() => setViewState("select")}
          >
            ←
          </button>
          <div>
            <h1>{selectedMode === "intervalles" ? "Intervalles" : "Zone 2"}</h1>
          </div>
        </header>

        <CardioTracker mode={selectedMode} onComplete={handleSessionComplete} />
      </div>
    );
  }

  // Vue RPE Gastrique (après la session)
  if (viewState === "rpe") {
    return (
      <div className="page container">
        <div className={styles.rpeScreen}>
          <h2>Comment te sens-tu ?</h2>
          <p className="text-secondary">RPE Gastrique (nausée)</p>

          <div className={styles.rpeScale}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                className={`${styles.rpeButton} ${rpeGastrique === value ? styles.rpeSelected : ""}`}
                onClick={() => setRpeGastrique(value)}
              >
                <span className={styles.rpeValue}>{value}</span>
                <span className={styles.rpeLabel}>
                  {value === 1 && "Parfait"}
                  {value === 2 && "Léger"}
                  {value === 3 && "Modéré"}
                  {value === 4 && "Fort"}
                  {value === 5 && "Nausée"}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.rpeLegend}>
            <span className="text-success">1 = Aucun inconfort</span>
            <span className="text-danger">5 = Nausée présente</span>
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={handleRpeSubmit}
            style={{ marginTop: "var(--space-xl)" }}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  // Vue complète
  if (viewState === "complete") {
    return (
      <div className="page container">
        <div className={styles.completeScreen}>
          <div className={styles.completeIcon}>🏃</div>
          <h1>Session terminée !</h1>

          <div className={styles.completeStats}>
            <div className={styles.completeStat}>
              <span className={styles.completeValue}>{sessionDuration}</span>
              <span className={styles.completeLabel}>minutes</span>
            </div>
            <div className={styles.completeStat}>
              <span className={styles.completeValue}>
                {selectedMode === "intervalles" ? "Int." : "Z2"}
              </span>
              <span className={styles.completeLabel}>mode</span>
            </div>
            <div className={styles.completeStat}>
              <span
                className={styles.completeValue}
                style={{
                  color:
                    rpeGastrique <= 2
                      ? "var(--success)"
                      : rpeGastrique <= 3
                      ? "var(--accent-secondary)"
                      : "var(--danger)",
                }}
              >
                {rpeGastrique}/5
              </span>
              <span className={styles.completeLabel}>RPE</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={finishAndReturn}
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
