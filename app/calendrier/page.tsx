"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarWeek,
  CalendarDay,
  ScheduledSession,
  generateCalendar,
  rescheduleSession,
  formatDateFr,
  formatDateShort,
  getSessionIcon,
  getSessionColor,
} from "@/lib/calendar";
import styles from "./page.module.css";

// Date de début du programme (à personnaliser)
const PROGRAM_START_DATE = new Date(2025, 0, 13); // 13 janvier 2025 (lundi)
const RACE_DATE = new Date(2025, 1, 14); // 14 février 2025

export default function CalendrierPage() {
  const router = useRouter();
  
  // Générer le calendrier
  const [calendar, setCalendar] = useState<CalendarWeek[]>(() =>
    generateCalendar(PROGRAM_START_DATE, RACE_DATE)
  );
  
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedSession, setSelectedSession] = useState<ScheduledSession | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState<string | null>(null);

  // Semaine actuelle affichée
  const currentWeek = useMemo(() => 
    calendar.find(w => w.programWeek === selectedWeek),
    [calendar, selectedWeek]
  );

  // Aujourd'hui
  const today = new Date();

  // Reporter une séance
  const handleReschedule = (reason: "busy" | "sick" | "other") => {
    if (!selectedSession) return;

    const result = rescheduleSession(calendar, selectedSession.id, reason);
    
    if (result.success) {
      setCalendar([...calendar]); // Force re-render
      setRescheduleMessage(result.message);
      if (result.warnings.length > 0) {
        setRescheduleMessage(`${result.message}\n⚠️ ${result.warnings.join(", ")}`);
      }
    } else {
      setRescheduleMessage(`❌ ${result.message}`);
    }

    setShowRescheduleModal(false);
    setSelectedSession(null);

    // Effacer le message après 3 secondes
    setTimeout(() => setRescheduleMessage(null), 3000);
  };

  // Marquer une séance comme terminée
  const handleComplete = (session: ScheduledSession) => {
    session.status = "completed";
    session.completedAt = new Date();
    setCalendar([...calendar]);
  };

  // Vérifier si un jour est aujourd'hui
  const isToday = (date: Date) => {
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // Vérifier si un jour est passé
  const isPast = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  return (
    <div className="page container">
      {/* Header */}
      <header className={styles.header}>
        <button className="header-back" onClick={() => router.push("/")}>
          ←
        </button>
        <div>
          <h1>Calendrier</h1>
          <p className="text-secondary">Programme 10 semaines</p>
        </div>
      </header>

      {/* Message de feedback */}
      {rescheduleMessage && (
        <div className={styles.feedbackMessage}>
          {rescheduleMessage}
        </div>
      )}

      {/* Sélecteur de semaine */}
      <div className={styles.weekSelector}>
        <button
          className={styles.weekArrow}
          onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
          disabled={selectedWeek === 1}
        >
          ←
        </button>
        
        <div className={styles.weekInfo}>
          <span className={styles.weekNumber}>Semaine {selectedWeek}</span>
          <span className={styles.weekTheme}>
            {currentWeek ? calendar.find(w => w.programWeek === selectedWeek)?.days[0] && 
              `${formatDateShort(currentWeek.days[0].date)} - ${formatDateShort(currentWeek.days[6].date)}`
            : ""}
          </span>
        </div>

        <button
          className={styles.weekArrow}
          onClick={() => setSelectedWeek(Math.min(10, selectedWeek + 1))}
          disabled={selectedWeek === 10}
        >
          →
        </button>
      </div>

      {/* Thème de la semaine */}
      {currentWeek && (
        <div className={styles.weekThemeCard}>
          <span className={styles.blocBadge}>
            Bloc {calendar.find(w => w.programWeek === selectedWeek)?.programWeek! <= 5 ? 1 : 2}
          </span>
          <h3>{getWeekTheme(selectedWeek)}</h3>
          <p>{getWeekFocus(selectedWeek)}</p>
        </div>
      )}

      {/* Grille des jours */}
      <div className={styles.daysGrid}>
        {currentWeek?.days.map((day) => (
          <div
            key={day.date.toISOString()}
            className={`${styles.dayCard} ${isToday(day.date) ? styles.today : ""} ${isPast(day.date) ? styles.past : ""} ${day.isRaceDay ? styles.raceDay : ""}`}
          >
            <div className={styles.dayHeader}>
              <span className={styles.dayName}>
                {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(day.date)}
              </span>
              <span className={styles.dayNumber}>
                {day.date.getDate()}
              </span>
              {isToday(day.date) && <span className={styles.todayBadge}>Auj.</span>}
            </div>

            <div className={styles.daySessions}>
              {day.isRestDay && !day.isRaceDay ? (
                <div className={styles.restDay}>
                  <span>😴</span>
                  <span>Repos</span>
                </div>
              ) : (
                day.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`${styles.sessionCard} ${styles[session.status]}`}
                    style={{ borderLeftColor: getSessionColor(session.session.type) }}
                    onClick={() => {
                      if (session.status !== "completed") {
                        setSelectedSession(session);
                      }
                    }}
                  >
                    <div className={styles.sessionHeader}>
                      <span className={styles.sessionIcon}>
                        {getSessionIcon(session.session.type)}
                      </span>
                      <span className={styles.sessionName}>
                        {session.session.nom}
                      </span>
                      {session.status === "completed" && (
                        <span className={styles.completedBadge}>✓</span>
                      )}
                      {session.status === "rescheduled" && (
                        <span className={styles.rescheduledBadge}>↻</span>
                      )}
                    </div>
                    <div className={styles.sessionDuration}>
                      {session.session.duree}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de séance sélectionnée */}
      {selectedSession && !showRescheduleModal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSession(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>
                {getSessionIcon(selectedSession.session.type)}
              </span>
              <div>
                <h2>{selectedSession.session.nom}</h2>
                <p className="text-secondary">
                  {formatDateFr(selectedSession.date)}
                </p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedSession(null)}>
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Explication pour débutant */}
              {selectedSession.session.explicationDebutant && (
                <div className={styles.beginnerExplanation}>
                  <h4>💡 C&apos;est quoi ?</h4>
                  <p>{selectedSession.session.explicationDebutant}</p>
                </div>
              )}

              {/* Programme détaillé */}
              <div className={styles.sessionDetails}>
                <h4>📋 Programme</h4>
                <ul>
                  {selectedSession.session.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>

              {/* Comment faire (pour cardio) */}
              {selectedSession.session.commentFaire && (
                <div className={styles.sessionDetails}>
                  <h4>🎯 Comment faire</h4>
                  <ol className={styles.howToList}>
                    {selectedSession.session.commentFaire.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Conseils */}
              {selectedSession.session.conseils && (
                <div className={styles.sessionDetails}>
                  <h4>✅ Conseils</h4>
                  <ul>
                    {selectedSession.session.conseils.map((conseil, i) => (
                      <li key={i}>{conseil}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Erreurs à éviter */}
              {selectedSession.session.erreurs && (
                <div className={styles.errorsSection}>
                  <h4>⚠️ Erreurs à éviter</h4>
                  <ul>
                    {selectedSession.session.erreurs.map((erreur, i) => (
                      <li key={i}>{erreur}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vidéo si disponible */}
              {selectedSession.session.videoUrl && (
                <a 
                  href={selectedSession.session.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.videoLink}
                >
                  📺 Voir la vidéo explicative
                </a>
              )}

              <div className={styles.sessionMeta}>
                <span>⏱️ {selectedSession.session.duree}</span>
                {selectedSession.originalDate && (
                  <span className={styles.originalDate}>
                    ↻ Reporté du {formatDateShort(selectedSession.originalDate)}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.modalActions}>
              {/* Bouton pour aller à la séance (musculation) */}
              {selectedSession.session.lienSeance && (
                <button
                  className="btn btn-primary"
                  onClick={() => router.push(`/seance/${selectedSession.session.lienSeance}`)}
                >
                  ▶ Voir les exercices
                </button>
              )}
              
              {/* Bouton pour le cardio */}
              {selectedSession.session.type.startsWith("cardio") && (
                <button
                  className="btn btn-primary"
                  onClick={() => router.push("/cardio")}
                >
                  ▶ Démarrer le cardio
                </button>
              )}
              
              <button
                className="btn btn-ghost"
                onClick={() => setShowRescheduleModal(true)}
              >
                📅 Reporter
              </button>
            </div>
            
            {/* Bouton terminer en bas */}
            <div className={styles.completeAction}>
              <button
                className="btn btn-success w-full"
                onClick={() => {
                  handleComplete(selectedSession);
                  setSelectedSession(null);
                }}
              >
                ✓ Marquer terminée
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de report */}
      {showRescheduleModal && selectedSession && (
        <div className={styles.modalOverlay} onClick={() => setShowRescheduleModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reporter la séance</h2>
              <button className={styles.closeBtn} onClick={() => setShowRescheduleModal(false)}>
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <p className="text-secondary">
                Pourquoi reportes-tu cette séance ?
              </p>
              <p className={styles.rescheduleNote}>
                L&apos;algorithme trouvera la prochaine date disponible en respectant les temps de récupération.
              </p>
            </div>

            <div className={styles.rescheduleOptions}>
              <button
                className={styles.rescheduleOption}
                onClick={() => handleReschedule("busy")}
              >
                <span>🏢</span>
                <span>Travail / Occupé</span>
              </button>
              <button
                className={styles.rescheduleOption}
                onClick={() => handleReschedule("sick")}
              >
                <span>🤒</span>
                <span>Malade / Fatigué</span>
              </button>
              <button
                className={styles.rescheduleOption}
                onClick={() => handleReschedule("other")}
              >
                <span>📅</span>
                <span>Autre raison</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Légende */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span style={{ color: "var(--accent-primary)" }}>●</span>
          <span>Musculation</span>
        </div>
        <div className={styles.legendItem}>
          <span style={{ color: "var(--success)" }}>●</span>
          <span>Zone 2</span>
        </div>
        <div className={styles.legendItem}>
          <span style={{ color: "var(--danger)" }}>●</span>
          <span>Fractionné</span>
        </div>
        <div className={styles.legendItem}>
          <span style={{ color: "var(--warning)" }}>●</span>
          <span>Course</span>
        </div>
      </div>
    </div>
  );
}

// Helpers pour le thème de la semaine
function getWeekTheme(week: number): string {
  const themes: Record<number, string> = {
    1: "Apprentissage Technique",
    2: "Fixation Posturale",
    3: "Introduction Surcharge",
    4: "Volume Cumulé",
    5: "🏆 Peak Cardio - Objectif 9km",
    6: "Hypertrophie - Reprise",
    7: "Hypertrophie - Progression",
    8: "Force Athlétique",
    9: "Peak Volume",
    10: "Deload & Évaluation"
  };
  return themes[week] || "";
}

function getWeekFocus(week: number): string {
  const focus: Record<number, string> = {
    1: "Maîtrise des mouvements, charges modérées",
    2: "Tempo lent 4-0-1-0, temps sous tension",
    3: "+2.5kg sur les Big 3, travail au seuil",
    4: "+1 série par mouvement, 8km Zone 2",
    5: "Taper muscu, focus total sur le 14 février",
    6: "Nouveau tempo 2-0-2-0, charges progressives",
    7: "+2.5kg sur les mouvements principaux",
    8: "Charges lourdes, moins de reps",
    9: "Volume maximum avant deload",
    10: "Récupération, test de force"
  };
  return focus[week] || "";
}
