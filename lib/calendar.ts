// ═══════════════════════════════════════════════════════════════════════════
// SYSTÈME DE CALENDRIER - Architecture & Armure
// Gestion des séances avec report intelligent et respect des récupérations
// ═══════════════════════════════════════════════════════════════════════════

import { SessionType, ProgramSession, PROGRAM_WEEKS, getWeekProgram } from "./program";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Dimanche = 0

export type ScheduledSessionStatus = "planned" | "completed" | "skipped" | "rescheduled";

export interface ScheduledSession {
  id: string;
  date: Date;
  session: ProgramSession;
  status: ScheduledSessionStatus;
  originalDate?: Date; // Si reportée
  completedAt?: Date;
}

export interface CalendarDay {
  date: Date;
  sessions: ScheduledSession[];
  isRestDay: boolean;
  isRaceDay: boolean;
}

export interface CalendarWeek {
  weekNumber: number;
  programWeek: number; // Semaine du programme (1-10)
  startDate: Date;
  days: CalendarDay[];
}

// ═══════════════════════════════════════════════════════════════════════════
// RÈGLES DE RÉCUPÉRATION
// ═══════════════════════════════════════════════════════════════════════════

const RECOVERY_RULES = {
  // Minimum de jours entre les séances du même type
  musculation: {
    minDaysBetween: 2, // 48h minimum
    maxDaysBetween: 4, // Ne pas dépasser 4 jours
  },
  cardio_fractionne: {
    minDaysBetween: 2, // 48h avant un autre fractionné
    maxDaysBetween: 5,
  },
  cardio_zone2: {
    minDaysBetween: 1, // Peut être fait le lendemain
    maxDaysBetween: 3,
  },
  cardio_seuil: {
    minDaysBetween: 2,
    maxDaysBetween: 5,
  },
  // Avant une course
  beforeRace: {
    noHardSessionDays: 2, // Pas de séance intense 48h avant
    noMuscuDays: 3, // Pas de muscu lourde 72h avant
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE DE SEMAINE PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════════════════

// Distribution optimale des séances sur une semaine
// Lundi: Muscu A, Mardi: Cardio, Mercredi: Repos, Jeudi: Muscu B, 
// Vendredi: Cardio, Samedi: Muscu C, Dimanche: Repos

export interface WeekTemplate {
  [key: number]: SessionType[]; // Jour de la semaine -> types de séances
}

const DEFAULT_WEEK_TEMPLATE: WeekTemplate = {
  0: [], // Dimanche - Repos
  1: ["musculation_A"], // Lundi
  2: ["cardio_fractionne"], // Mardi
  3: [], // Mercredi - Repos
  4: ["musculation_B"], // Jeudi
  5: ["cardio_zone2"], // Vendredi
  6: ["musculation_C"], // Samedi
};

// Template pour la semaine 5 (avant le 9km du 14 février)
const TAPER_WEEK_TEMPLATE: WeekTemplate = {
  0: [], // Dimanche - Repos
  1: ["musculation_A"], // Lundi - Muscu légère
  2: [], // Mardi - Repos
  3: [], // Mercredi - Repos
  4: [], // Jeudi - Repos (J-2)
  5: ["course_9km"], // Vendredi 14 février - LE JOUR J
  6: [], // Samedi - Repos
};

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS DE GÉNÉRATION DU CALENDRIER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Génère le calendrier complet pour les 10 semaines
 * @param startDate - Date de début du programme
 * @param raceDate - Date du 9km (14 février)
 */
export function generateCalendar(startDate: Date, raceDate: Date): CalendarWeek[] {
  const calendar: CalendarWeek[] = [];
  const currentDate = new Date(startDate);
  
  // S'assurer qu'on commence un lundi
  const dayOfWeek = currentDate.getDay();
  if (dayOfWeek !== 1) {
    currentDate.setDate(currentDate.getDate() - dayOfWeek + 1);
  }

  for (let programWeek = 1; programWeek <= 10; programWeek++) {
    const weekProgram = getWeekProgram(programWeek);
    if (!weekProgram) continue;

    const week = generateWeek(
      currentDate,
      programWeek,
      weekProgram.sessions,
      raceDate,
      programWeek === 5 // Semaine du 9km
    );
    
    calendar.push(week);
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return calendar;
}

/**
 * Génère une semaine du calendrier
 */
function generateWeek(
  startDate: Date,
  programWeek: number,
  sessions: ProgramSession[],
  raceDate: Date,
  isTaperWeek: boolean
): CalendarWeek {
  const days: CalendarDay[] = [];
  const template = isTaperWeek ? TAPER_WEEK_TEMPLATE : DEFAULT_WEEK_TEMPLATE;
  
  // Créer un mapping des sessions par type
  const sessionsByType: Map<SessionType, ProgramSession[]> = new Map();
  sessions.forEach(session => {
    const existing = sessionsByType.get(session.type) || [];
    sessionsByType.set(session.type, [...existing, session]);
  });

  // Générer chaque jour de la semaine
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayOffset);
    
    const dayOfWeek = dayDate.getDay() as DayOfWeek;
    const scheduledSessions: ScheduledSession[] = [];
    
    // Vérifier si c'est le jour de la course
    const isRaceDay = isSameDay(dayDate, raceDate);
    
    if (isRaceDay) {
      // Jour de la course
      const raceSessions = sessionsByType.get("course_9km") || [];
      if (raceSessions.length > 0) {
        scheduledSessions.push({
          id: `${formatDateId(dayDate)}-race`,
          date: dayDate,
          session: raceSessions[0],
          status: "planned"
        });
      }
    } else {
      // Jour normal
      const sessionTypes = template[dayOfWeek] || [];
      sessionTypes.forEach((type, index) => {
        const availableSessions = sessionsByType.get(type) || [];
        if (availableSessions.length > 0) {
          // Prendre la première session disponible de ce type
          const session = availableSessions.shift()!;
          scheduledSessions.push({
            id: `${formatDateId(dayDate)}-${type}-${index}`,
            date: new Date(dayDate),
            session,
            status: "planned"
          });
        }
      });
    }

    days.push({
      date: new Date(dayDate),
      sessions: scheduledSessions,
      isRestDay: scheduledSessions.length === 0,
      isRaceDay
    });
  }

  // Attribuer les séances restantes aux jours de repos si nécessaire
  assignRemainingSessions(days, sessionsByType);

  return {
    weekNumber: getISOWeekNumber(startDate),
    programWeek,
    startDate: new Date(startDate),
    days
  };
}

/**
 * Attribue les séances restantes aux jours disponibles
 */
function assignRemainingSessions(
  days: CalendarDay[],
  sessionsByType: Map<SessionType, ProgramSession[]>
) {
  sessionsByType.forEach((sessions, type) => {
    sessions.forEach(session => {
      // Trouver un jour de repos approprié
      const suitableDay = findSuitableDayForSession(days, type);
      if (suitableDay) {
        suitableDay.sessions.push({
          id: `${formatDateId(suitableDay.date)}-${type}-extra`,
          date: new Date(suitableDay.date),
          session,
          status: "planned"
        });
        suitableDay.isRestDay = false;
      }
    });
  });
}

/**
 * Trouve un jour approprié pour une séance en respectant les règles de récupération
 */
function findSuitableDayForSession(
  days: CalendarDay[],
  sessionType: SessionType
): CalendarDay | null {
  const isMuscuSession = sessionType.startsWith("musculation");
  const isCardioSession = sessionType.startsWith("cardio");

  for (const day of days) {
    if (day.isRaceDay) continue;
    
    // Vérifier si on peut ajouter cette séance ce jour
    const hasMuscu = day.sessions.some(s => s.session.type.startsWith("musculation"));
    const hasHardCardio = day.sessions.some(s => 
      s.session.type === "cardio_fractionne" || s.session.type === "cardio_seuil"
    );

    // Règle : pas de muscu + fractionné le même jour
    if (isMuscuSession && hasHardCardio) continue;
    if ((sessionType === "cardio_fractionne" || sessionType === "cardio_seuil") && hasMuscu) continue;

    // Règle : max 1 séance muscu par jour
    if (isMuscuSession && hasMuscu) continue;

    // Zone 2 peut être combinée avec muscu légère
    if (sessionType === "cardio_zone2" || (isCardioSession && !hasHardCardio)) {
      return day;
    }

    if (day.isRestDay || (!hasMuscu && !hasHardCardio)) {
      return day;
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS DE REPORT DE SÉANCE
// ═══════════════════════════════════════════════════════════════════════════

export interface RescheduleResult {
  success: boolean;
  newDate?: Date;
  message: string;
  warnings: string[];
}

/**
 * Reporte une séance à une nouvelle date en respectant les règles de récupération
 */
export function rescheduleSession(
  calendar: CalendarWeek[],
  sessionId: string,
  reason: "busy" | "sick" | "other"
): RescheduleResult {
  // Trouver la séance
  let targetSession: ScheduledSession | null = null;
  let targetDay: CalendarDay | null = null;
  let targetWeek: CalendarWeek | null = null;

  for (const week of calendar) {
    for (const day of week.days) {
      for (const session of day.sessions) {
        if (session.id === sessionId) {
          targetSession = session;
          targetDay = day;
          targetWeek = week;
          break;
        }
      }
      if (targetSession) break;
    }
    if (targetSession) break;
  }

  if (!targetSession || !targetDay || !targetWeek) {
    return {
      success: false,
      message: "Séance non trouvée",
      warnings: []
    };
  }

  const sessionType = targetSession.session.type;
  const originalDate = targetSession.date;
  const warnings: string[] = [];

  // Trouver la prochaine date disponible
  const newDate = findNextAvailableDate(
    calendar,
    originalDate,
    sessionType,
    targetWeek.programWeek
  );

  if (!newDate) {
    return {
      success: false,
      message: "Impossible de trouver une date de report valide",
      warnings: ["La semaine est trop chargée ou la course approche"]
    };
  }

  // Vérifier les impacts
  const daysDifference = Math.floor((newDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference > 3) {
    warnings.push(`Report de ${daysDifference} jours - Le repos sera plus long que prévu`);
  }

  // Appliquer le report
  targetSession.originalDate = new Date(originalDate);
  targetSession.date = newDate;
  targetSession.status = "rescheduled";

  // Mettre à jour le calendrier
  targetDay.sessions = targetDay.sessions.filter(s => s.id !== sessionId);
  if (targetDay.sessions.length === 0) {
    targetDay.isRestDay = true;
  }

  // Ajouter au nouveau jour
  const newDay = findDayInCalendar(calendar, newDate);
  if (newDay) {
    newDay.sessions.push(targetSession);
    newDay.isRestDay = false;
  }

  return {
    success: true,
    newDate,
    message: `Séance reportée au ${formatDateFr(newDate)}`,
    warnings
  };
}

/**
 * Trouve la prochaine date disponible pour une séance
 */
function findNextAvailableDate(
  calendar: CalendarWeek[],
  fromDate: Date,
  sessionType: SessionType,
  currentProgramWeek: number
): Date | null {
  const isMuscuSession = sessionType.startsWith("musculation");

  // Chercher dans les 7 prochains jours
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const candidateDate = new Date(fromDate);
    candidateDate.setDate(fromDate.getDate() + dayOffset);

    const candidateDay = findDayInCalendar(calendar, candidateDate);
    if (!candidateDay) continue;

    // Pas de report sur un jour de course
    if (candidateDay.isRaceDay) continue;

    // Vérifier la charge du jour
    const dayLoad = candidateDay.sessions.length;
    if (dayLoad >= 2) continue; // Max 2 séances par jour

    // Vérifier les incompatibilités avec les séances existantes
    const hasMuscu = candidateDay.sessions.some(s => s.session.type.startsWith("musculation"));
    const hasHardCardio = candidateDay.sessions.some(s => 
      s.session.type === "cardio_fractionne" || s.session.type === "cardio_seuil"
    );

    // Règle : pas 2 séances muscu le même jour
    if (isMuscuSession && hasMuscu) continue;
    // Règle : pas muscu + fractionné le même jour
    if (isMuscuSession && hasHardCardio) continue;
    if ((sessionType === "cardio_fractionne" || sessionType === "cardio_seuil") && hasMuscu) continue;

    // Pour les jours de repos, autoriser plus facilement
    if (candidateDay.isRestDay) {
      return candidateDate;
    }

    // Pour les autres jours, vérifier les règles de récupération
    // mais être plus permissif pour la Zone 2 et le cardio léger
    if (sessionType === "cardio_zone2" || sessionType === "repos") {
      return candidateDate;
    }

    // Vérifier les règles de récupération pour muscu et cardio intense
    const hasConflict = checkRecoveryConflict(calendar, candidateDate, sessionType);
    if (!hasConflict) {
      return candidateDate;
    }
  }

  // En dernier recours, chercher n'importe quel jour de repos
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const candidateDate = new Date(fromDate);
    candidateDate.setDate(fromDate.getDate() + dayOffset);
    
    const candidateDay = findDayInCalendar(calendar, candidateDate);
    if (candidateDay && candidateDay.isRestDay && !candidateDay.isRaceDay) {
      return candidateDate;
    }
  }

  return null;
}

/**
 * Vérifie s'il y a un conflit de récupération
 */
function checkRecoveryConflict(
  calendar: CalendarWeek[],
  targetDate: Date,
  sessionType: SessionType
): boolean {
  const isMuscuSession = sessionType.startsWith("musculation");
  const rules = isMuscuSession ? RECOVERY_RULES.musculation :
                sessionType === "cardio_fractionne" ? RECOVERY_RULES.cardio_fractionne :
                RECOVERY_RULES.cardio_zone2;

  // Vérifier les jours avant
  for (let dayOffset = 1; dayOffset <= rules.minDaysBetween; dayOffset++) {
    const checkDate = new Date(targetDate);
    checkDate.setDate(targetDate.getDate() - dayOffset);
    
    const day = findDayInCalendar(calendar, checkDate);
    if (!day) continue;

    const hasSameType = day.sessions.some(s => {
      if (isMuscuSession) {
        return s.session.type.startsWith("musculation");
      }
      return s.session.type === sessionType;
    });

    if (hasSameType) return true;
  }

  // Vérifier les jours après
  for (let dayOffset = 1; dayOffset <= rules.minDaysBetween; dayOffset++) {
    const checkDate = new Date(targetDate);
    checkDate.setDate(targetDate.getDate() + dayOffset);
    
    const day = findDayInCalendar(calendar, checkDate);
    if (!day) continue;

    const hasSameType = day.sessions.some(s => {
      if (isMuscuSession) {
        return s.session.type.startsWith("musculation");
      }
      return s.session.type === sessionType;
    });

    if (hasSameType) return true;
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

function findDayInCalendar(calendar: CalendarWeek[], date: Date): CalendarDay | null {
  for (const week of calendar) {
    for (const day of week.days) {
      if (isSameDay(day.date, date)) {
        return day;
      }
    }
  }
  return null;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function formatDateId(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDateFr(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric'
  }).format(date);
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getSessionIcon(type: SessionType): string {
  switch (type) {
    case "musculation_A": return "🏋️";
    case "musculation_B": return "💪";
    case "musculation_C": return "🦵";
    case "cardio_fractionne": return "🔥";
    case "cardio_zone2": return "🌬️";
    case "cardio_seuil": return "⚡";
    case "course_9km": return "🏆";
    case "repos": return "😴";
    default: return "📅";
  }
}

export function getSessionColor(type: SessionType): string {
  switch (type) {
    case "musculation_A":
    case "musculation_B":
    case "musculation_C":
      return "var(--accent-primary)";
    case "cardio_fractionne":
    case "cardio_seuil":
      return "var(--danger)";
    case "cardio_zone2":
      return "var(--success)";
    case "course_9km":
      return "var(--warning)";
    default:
      return "var(--text-muted)";
  }
}
