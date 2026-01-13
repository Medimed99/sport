"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Seance, CardioSession } from "@/lib/types";
import { getSeances, getCardioSessions } from "@/lib/storage";
import { formaterTonnage, calculerTonnageCumule } from "@/lib/calculations";
import styles from "./page.module.css";

type TabType = "musculation" | "cardio";

export default function HistoriquePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("musculation");
  const [seances, setSeances] = useState<Seance[]>([]);
  const [cardioSessions, setCardioSessions] = useState<CardioSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [seancesData, cardioData] = await Promise.all([
          getSeances(),
          getCardioSessions(),
        ]);
        setSeances(seancesData);
        setCardioSessions(cardioData);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Stats globales
  const totalTonnage = calculerTonnageCumule(seances);
  const totalCardioMinutes = cardioSessions.reduce((sum, s) => sum + s.dureeMinutes, 0);
  const avgRpe = cardioSessions.length > 0
    ? (cardioSessions.reduce((sum, s) => sum + s.rpeGastrique, 0) / cardioSessions.length).toFixed(1)
    : "—";

  // Formater la date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <div className="page container">
      <header className={styles.header}>
        <button className="header-back" onClick={() => router.push("/")}>
          ←
        </button>
        <h1>Historique</h1>
      </header>

      {/* Stats globales */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{seances.length}</span>
          <span className={styles.statLabel}>séances</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formaterTonnage(totalTonnage)}</span>
          <span className={styles.statLabel}>tonnage</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{Math.round(totalCardioMinutes / 60)}h</span>
          <span className={styles.statLabel}>cardio</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "musculation" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("musculation")}
        >
          Musculation
        </button>
        <button
          className={`${styles.tab} ${activeTab === "cardio" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("cardio")}
        >
          Cardio
        </button>
      </div>

      {/* Contenu */}
      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <p className="text-secondary">Chargement...</p>
          </div>
        ) : activeTab === "musculation" ? (
          /* Liste des séances musculation */
          seances.length === 0 ? (
            <div className={styles.empty}>
              <p>Aucune séance enregistrée</p>
              <p className="text-muted">Commence ton programme pour voir ton historique ici</p>
            </div>
          ) : (
            <div className={styles.list}>
              {seances.map((seance) => (
                <div key={seance.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.seanceType}>Séance {seance.type}</span>
                    <span className={styles.date}>{formatDate(seance.date)}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardStat}>
                      <span className="mono text-accent">{formaterTonnage(seance.tonnageTotal)}</span>
                      <span className="text-muted">tonnage</span>
                    </div>
                    <div className={styles.cardStat}>
                      <span className="mono">{seance.exercices.length}</span>
                      <span className="text-muted">exercices</span>
                    </div>
                    <div className={styles.cardStat}>
                      <span className="mono">
                        {seance.exercices.reduce((sum, ex) => sum + ex.series.length, 0)}
                      </span>
                      <span className="text-muted">séries</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Liste des sessions cardio */
          cardioSessions.length === 0 ? (
            <div className={styles.empty}>
              <p>Aucune session cardio enregistrée</p>
              <p className="text-muted">Lance une session cardio pour commencer</p>
            </div>
          ) : (
            <>
              <div className={styles.cardioStats}>
                <div className={styles.cardioStat}>
                  <span className="text-secondary">RPE Gastrique moyen</span>
                  <span className={`mono ${Number(avgRpe) <= 2 ? "text-success" : Number(avgRpe) <= 3 ? "text-accent" : ""}`} style={{ fontSize: "1.5rem" }}>
                    {avgRpe}/5
                  </span>
                </div>
              </div>
              <div className={styles.list}>
                {cardioSessions.map((session) => (
                  <div key={session.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardioMode}>
                        {session.mode === "intervalles" ? "🔥 Intervalles" : "🌬️ Zone 2"}
                      </span>
                      <span className={styles.date}>{formatDate(session.date)}</span>
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.cardStat}>
                        <span className="mono">{session.dureeMinutes}</span>
                        <span className="text-muted">min</span>
                      </div>
                      {session.distanceKm && (
                        <div className={styles.cardStat}>
                          <span className="mono text-success">{session.distanceKm}</span>
                          <span className="text-muted">km</span>
                        </div>
                      )}
                      <div className={styles.cardStat}>
                        <span
                          className="mono"
                          style={{
                            color:
                              session.rpeGastrique <= 2
                                ? "var(--success)"
                                : session.rpeGastrique <= 3
                                ? "var(--accent-secondary)"
                                : "var(--danger)",
                          }}
                        >
                          {session.rpeGastrique}/5
                        </span>
                        <span className="text-muted">RPE</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
