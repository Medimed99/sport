"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SEANCES } from "@/lib/exercises";
import { getStats, type UserStats } from "@/lib/stats";
import styles from "./page.module.css";

// Date de la course : 14 février 2026
const RACE_DATE = new Date(2026, 1, 14);

function getCountdown(): { days: number; hours: number; isRaceDay: boolean; isPast: boolean } {
  const now = new Date();
  const diff = RACE_DATE.getTime() - now.getTime();
  
  if (diff < 0) {
    return { days: 0, hours: 0, isRaceDay: false, isPast: true };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { 
    days, 
    hours, 
    isRaceDay: days === 0 && hours < 24,
    isPast: false 
  };
}

function getMotivationalMessage(stats: UserStats, countdown: { days: number }): string {
  if (stats.totalSeances === 0) {
    return "Commence ta première séance aujourd'hui ! 💪";
  }
  if (stats.currentStreak >= 7) {
    return `🔥 ${stats.currentStreak} jours consécutifs ! Tu es en feu !`;
  }
  if (countdown.days <= 7) {
    return "Dernière ligne droite avant le 9km ! 🏁";
  }
  if (stats.totalSeances >= 10) {
    return "Tu construis des habitudes solides ! 💎";
  }
  if (stats.weeklyProgress > 0) {
    return `+${stats.weeklyProgress}% de tonnage cette semaine ! 📈`;
  }
  return "Chaque séance te rapproche de ton objectif ! 🎯";
}

export default function Dashboard() {
  const [countdown, setCountdown] = useState(getCountdown());
  const [stats, setStats] = useState<UserStats>({
    totalSeances: 0,
    totalTonnage: 0,
    totalDistance: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyProgress: 0,
    lastWorkout: null,
    completedThisWeek: 0,
    plannedThisWeek: 6,
    comparison: {
      thisWeekTonnage: 0,
      lastWeekTonnage: 0,
      tonnageChange: 0,
      tonnageChangePercent: 0,
      thisWeekSessions: 0,
      lastWeekSessions: 0,
      thisWeekDistance: 0,
      lastWeekDistance: 0,
      distanceChange: 0,
      highlights: [],
    },
  });

  useEffect(() => {
    // Mettre à jour le countdown toutes les heures
    const interval = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000 * 60 * 60);

    // Charger les stats
    getStats().then(setStats);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, (stats.totalDistance / 9) * 100);
  const motivationalMessage = getMotivationalMessage(stats, countdown);

  return (
    <div className="page container">
      {/* Countdown vers le 9km */}
      <section className={styles.countdownSection}>
        <div className={styles.countdownCard}>
          <div className={styles.countdownHeader}>
            <span className={styles.raceIcon}>🏆</span>
            <div>
              <h2 className={styles.raceTitle}>Objectif 9km</h2>
              <p className={styles.raceDate}>14 février 2026</p>
            </div>
          </div>
          
          {countdown.isRaceDay ? (
            <div className={styles.raceDayMessage}>
              <span className={styles.raceDayEmoji}>🔥</span>
              <p>C&apos;EST AUJOURD&apos;HUI !</p>
            </div>
          ) : countdown.isPast ? (
            <div className={styles.raceDayMessage}>
              <span className={styles.raceDayEmoji}>✅</span>
              <p>Mission accomplie !</p>
            </div>
          ) : (
            <div className={styles.countdownDisplay}>
              <div className={styles.countdownItem}>
                <span className={styles.countdownNumber}>{countdown.days}</span>
                <span className={styles.countdownLabel}>jours</span>
              </div>
              <div className={styles.countdownSeparator}>:</div>
              <div className={styles.countdownItem}>
                <span className={styles.countdownNumber}>{countdown.hours}</span>
                <span className={styles.countdownLabel}>heures</span>
              </div>
            </div>
          )}

          {/* Barre de progression distance */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>Distance cumulée</span>
              <span className={styles.progressValue}>{stats.totalDistance.toFixed(1)} / 9 km</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Message motivationnel */}
      <div className={styles.motivationalBanner}>
        <p>{motivationalMessage}</p>
      </div>

      {/* Stats rapides */}
      <section className={styles.quickStats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalSeances}</span>
          <span className={styles.statLabel}>séances</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalTonnage >= 1000 ? `${(stats.totalTonnage/1000).toFixed(1)}t` : `${stats.totalTonnage}kg`}</span>
          <span className={styles.statLabel}>tonnage</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.currentStreak}</span>
          <span className={styles.statLabel}>🔥 streak</span>
        </div>
      </section>

      {/* Progression hebdo */}
      {stats.plannedThisWeek > 0 && (
        <section className={styles.weeklyProgress}>
          <div className={styles.weeklyHeader}>
            <span>Cette semaine</span>
            <span>{stats.completedThisWeek} / {stats.plannedThisWeek} séances</span>
          </div>
          <div className={styles.weeklyDots}>
            {Array.from({ length: stats.plannedThisWeek }).map((_, i) => (
              <div 
                key={i} 
                className={`${styles.weeklyDot} ${i < stats.completedThisWeek ? styles.completed : ""}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Accès rapide Calendrier */}
      <section style={{ marginTop: "var(--space-lg)" }}>
        <Link href="/calendrier" style={{ textDecoration: "none" }}>
          <div className={styles.calendarCard}>
            <div className={styles.calendarIcon}>📅</div>
            <div>
              <h3>Mon Programme</h3>
              <p>Voir le calendrier des 10 semaines</p>
            </div>
            <span className={styles.arrow}>→</span>
          </div>
        </Link>
      </section>

      {/* Séances de musculation */}
      <section className="stack-lg" style={{ marginTop: "var(--space-2xl)" }}>
        <h2 className="text-secondary" style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Musculation
        </h2>
        
        <div className="stack">
          {SEANCES.map((seance) => (
            <Link 
              key={seance.type} 
              href={`/seance/${seance.type}`}
              style={{ textDecoration: "none" }}
            >
              <div className="card card-interactive">
                <div className="row row-between">
                  <div>
                    <div className="row" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
                      <span 
                        className="badge badge-accent"
                        style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "var(--radius-full)",
                          fontSize: "1rem"
                        }}
                      >
                        {seance.type}
                      </span>
                      <h3>{seance.nom}</h3>
                    </div>
                    <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
                      {seance.focus}
                    </p>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "1.5rem" }}>
                    →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cardio */}
      <section className="stack-lg" style={{ marginTop: "var(--space-2xl)" }}>
        <h2 className="text-secondary" style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Cardio — Opération 9km
        </h2>
        
        <Link href="/cardio" style={{ textDecoration: "none" }}>
          <div className="card card-interactive" style={{ background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-elevated) 100%)" }}>
            <div className="row row-between">
              <div>
                <h3>Session Cardio</h3>
                <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
                  Intervalles, Zone 2 ou Seuil
                </p>
              </div>
              <div 
                style={{ 
                  width: "64px", 
                  height: "64px", 
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem"
                }}
              >
                🏃
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Historique & Progression */}
      <section className="stack" style={{ marginTop: "var(--space-2xl)" }}>
        <Link href="/progression" style={{ textDecoration: "none" }}>
          <div className="card card-interactive" style={{ background: "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(48, 209, 88, 0.08) 100%)", border: "1px solid rgba(48, 209, 88, 0.2)" }}>
            <div className="row row-between">
              <div>
                <h3>📈 Ma Progression</h3>
                <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
                  Graphiques, historique et suggestions
                </p>
              </div>
              <div style={{ color: "var(--success)", fontSize: "1.5rem" }}>
                →
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Paramètres */}
      <section style={{ marginTop: "var(--space-xl)" }}>
        <Link href="/parametres" style={{ textDecoration: "none" }}>
          <button className="btn btn-ghost w-full">
            ⚙️ Paramètres & Notifications
          </button>
        </Link>
      </section>
    </div>
  );
}
