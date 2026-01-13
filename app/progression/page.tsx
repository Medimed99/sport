"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStats, getMilestones, type UserStats, type Milestone } from "@/lib/stats";
import { getWorkoutHistory, type WorkoutHistoryItem } from "@/lib/history";
import styles from "./page.module.css";

export default function ProgressionPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "milestones">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, milestonesData, historyData] = await Promise.all([
          getStats(),
          getMilestones(),
          getWorkoutHistory(),
        ]);
        setStats(statsData);
        setMilestones(milestonesData);
        setHistory(historyData);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page container">
        <div className={styles.loading}>Chargement...</div>
      </div>
    );
  }

  const achievedMilestones = milestones.filter((m) => m.achieved);
  const pendingMilestones = milestones.filter((m) => !m.achieved);

  return (
    <div className="page container">
      {/* Header */}
      <header className={styles.header}>
        <button className="header-back" onClick={() => router.push("/")}>
          ←
        </button>
        <div>
          <h1>Ma Progression</h1>
          <p className="text-secondary">Statistiques et historique</p>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Vue d&apos;ensemble
        </button>
        <button
          className={`${styles.tab} ${activeTab === "history" ? styles.active : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📜 Historique
        </button>
        <button
          className={`${styles.tab} ${activeTab === "milestones" ? styles.active : ""}`}
          onClick={() => setActiveTab("milestones")}
        >
          🏆 Milestones
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && stats && (
        <div className={styles.overviewContent}>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCardLarge}>
              <span className={styles.statIcon}>🏋️</span>
              <div className={styles.statInfo}>
                <span className={styles.statValueLarge}>{stats.totalSeances}</span>
                <span className={styles.statLabelLarge}>séances complétées</span>
              </div>
            </div>

            <div className={styles.statCardLarge}>
              <span className={styles.statIcon}>💪</span>
              <div className={styles.statInfo}>
                <span className={styles.statValueLarge}>
                  {stats.totalTonnage >= 1000 
                    ? `${(stats.totalTonnage / 1000).toFixed(1)}t`
                    : `${stats.totalTonnage}kg`
                  }
                </span>
                <span className={styles.statLabelLarge}>tonnage total</span>
              </div>
            </div>

            <div className={styles.statCardLarge}>
              <span className={styles.statIcon}>🏃</span>
              <div className={styles.statInfo}>
                <span className={styles.statValueLarge}>{stats.totalDistance.toFixed(1)}km</span>
                <span className={styles.statLabelLarge}>distance parcourue</span>
              </div>
            </div>

            <div className={styles.statCardLarge}>
              <span className={styles.statIcon}>🔥</span>
              <div className={styles.statInfo}>
                <span className={styles.statValueLarge}>{stats.bestStreak}</span>
                <span className={styles.statLabelLarge}>meilleur streak</span>
              </div>
            </div>
          </div>

          {/* Comparaison S-1 */}
          <div className={styles.comparisonCard}>
            <h3>📊 Comparaison vs Semaine -1</h3>
            
            <div className={styles.comparisonGrid}>
              {/* Tonnage */}
              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>Tonnage</span>
                <div className={styles.comparisonValues}>
                  <span className={styles.comparisonCurrent}>{stats.comparison.thisWeekTonnage}kg</span>
                  <span className={styles.comparisonVs}>vs</span>
                  <span className={styles.comparisonPrevious}>{stats.comparison.lastWeekTonnage}kg</span>
                </div>
                <span className={`${styles.comparisonChange} ${stats.comparison.tonnageChange >= 0 ? styles.positive : styles.negative}`}>
                  {stats.comparison.tonnageChange >= 0 ? "+" : ""}{stats.comparison.tonnageChange}kg
                  {stats.comparison.tonnageChangePercent !== 0 && ` (${stats.comparison.tonnageChangePercent > 0 ? "+" : ""}${stats.comparison.tonnageChangePercent}%)`}
                </span>
              </div>

              {/* Distance */}
              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>Distance</span>
                <div className={styles.comparisonValues}>
                  <span className={styles.comparisonCurrent}>{stats.comparison.thisWeekDistance.toFixed(1)}km</span>
                  <span className={styles.comparisonVs}>vs</span>
                  <span className={styles.comparisonPrevious}>{stats.comparison.lastWeekDistance.toFixed(1)}km</span>
                </div>
                <span className={`${styles.comparisonChange} ${stats.comparison.distanceChange >= 0 ? styles.positive : styles.negative}`}>
                  {stats.comparison.distanceChange >= 0 ? "+" : ""}{stats.comparison.distanceChange.toFixed(1)}km
                </span>
              </div>

              {/* Séances */}
              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>Séances</span>
                <div className={styles.comparisonValues}>
                  <span className={styles.comparisonCurrent}>{stats.comparison.thisWeekSessions}</span>
                  <span className={styles.comparisonVs}>vs</span>
                  <span className={styles.comparisonPrevious}>{stats.comparison.lastWeekSessions}</span>
                </div>
                <span className={`${styles.comparisonChange} ${stats.comparison.thisWeekSessions >= stats.comparison.lastWeekSessions ? styles.positive : styles.negative}`}>
                  {stats.comparison.thisWeekSessions >= stats.comparison.lastWeekSessions ? "+" : ""}{stats.comparison.thisWeekSessions - stats.comparison.lastWeekSessions}
                </span>
              </div>
            </div>

            {/* Highlights */}
            {stats.comparison.highlights.length > 0 && (
              <div className={styles.highlights}>
                {stats.comparison.highlights.map((highlight, i) => (
                  <p key={i} className={styles.highlight}>{highlight}</p>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions basées sur l'historique */}
          <div className={styles.suggestionsCard}>
            <h3>💡 Suggestions pour la suite</h3>
            <div className={styles.suggestionsList}>
              {stats.totalSeances === 0 ? (
                <p className={styles.suggestionItem}>
                  Commence ta première séance pour débloquer les suggestions personnalisées !
                </p>
              ) : (
                <>
                  {stats.weeklyProgress > 5 && (
                    <p className={styles.suggestionItem}>
                      ✅ Excellente progression ! Continue sur cette lancée.
                    </p>
                  )}
                  {stats.weeklyProgress < 0 && (
                    <p className={styles.suggestionItem}>
                      ⚠️ Tonnage en baisse cette semaine. Fatigue ? Pense à bien récupérer.
                    </p>
                  )}
                  {stats.currentStreak >= 3 && (
                    <p className={styles.suggestionItem}>
                      🔥 Tu es sur une belle série ! Ne casse pas l&apos;élan.
                    </p>
                  )}
                  {stats.totalDistance >= 5 && stats.totalDistance < 9 && (
                    <p className={styles.suggestionItem}>
                      🏃 Tu as déjà {stats.totalDistance.toFixed(1)}km au compteur. Le 9km est à portée !
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className={styles.historyContent}>
          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📝</span>
              <p>Pas encore d&apos;historique</p>
              <p className="text-secondary">Tes séances apparaîtront ici</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {history.map((item, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyDate}>
                    <span className={styles.historyDay}>
                      {item.date.toLocaleDateString("fr-FR", { weekday: "short" })}
                    </span>
                    <span className={styles.historyFullDate}>
                      {item.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className={styles.historyDetails}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyIcon}>
                        {item.type === "musculation" ? "🏋️" : "🏃"}
                      </span>
                      <span className={styles.historyTitle}>{item.nom}</span>
                    </div>
                    {item.type === "musculation" ? (
                      <p className={styles.historyMeta}>
                        {item.tonnage}kg soulevés • {item.exercicesCount} exercices
                      </p>
                    ) : (
                      <p className={styles.historyMeta}>
                        {item.distance}km • {item.duree} min • RPE {item.rpe}/10
                      </p>
                    )}
                    {item.notes && (
                      <p className={styles.historyNotes}>📝 {item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "milestones" && (
        <div className={styles.milestonesContent}>
          {/* Milestones débloqués */}
          {achievedMilestones.length > 0 && (
            <div className={styles.milestonesSection}>
              <h3>✅ Débloqués</h3>
              <div className={styles.milestonesList}>
                {achievedMilestones.map((milestone) => (
                  <div key={milestone.id} className={`${styles.milestoneCard} ${styles.achieved}`}>
                    <span className={styles.milestoneIcon}>{milestone.icon}</span>
                    <div className={styles.milestoneInfo}>
                      <span className={styles.milestoneTitle}>{milestone.title}</span>
                      <span className={styles.milestoneDesc}>{milestone.description}</span>
                    </div>
                    <span className={styles.milestoneCheck}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones à débloquer */}
          {pendingMilestones.length > 0 && (
            <div className={styles.milestonesSection}>
              <h3>🔒 À débloquer</h3>
              <div className={styles.milestonesList}>
                {pendingMilestones.map((milestone) => (
                  <div key={milestone.id} className={`${styles.milestoneCard} ${styles.pending}`}>
                    <span className={styles.milestoneIcon}>{milestone.icon}</span>
                    <div className={styles.milestoneInfo}>
                      <span className={styles.milestoneTitle}>{milestone.title}</span>
                      <span className={styles.milestoneDesc}>{milestone.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
