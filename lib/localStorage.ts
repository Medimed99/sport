// ═══════════════════════════════════════════════════════════════════════════
// STOCKAGE LOCAL
// Système de persistance des données sans Firebase
// ═══════════════════════════════════════════════════════════════════════════

import { ExerciceLog, SeanceType } from "./types";

// Types pour le stockage local
export interface LocalSeance {
  id: string;
  date: string; // ISO string
  type: SeanceType;
  exercices: ExerciceLog[];
  tonnageTotal: number;
  notes?: string;
  mood?: "great" | "good" | "ok" | "bad";
}

export interface LocalCardio {
  id: string;
  date: string; // ISO string
  mode: "intervalles" | "zone2" | "seuil" | "course";
  dureeMinutes: number;
  distanceKm: number;
  rpeGastrique: number;
  notes?: string;
  mood?: "great" | "good" | "ok" | "bad";
}

// Clés de stockage
const SEANCES_KEY = "armure_seances";
const CARDIO_KEY = "armure_cardio";

// ═══════════════════════════════════════════════════════════════════════════
// SÉANCES DE MUSCULATION
// ═══════════════════════════════════════════════════════════════════════════

export function getLocalSeances(): LocalSeance[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(SEANCES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalSeance(seance: Omit<LocalSeance, "id">): LocalSeance {
  const seances = getLocalSeances();
  const newSeance: LocalSeance = {
    ...seance,
    id: `seance_${Date.now()}`,
  };
  seances.push(newSeance);
  localStorage.setItem(SEANCES_KEY, JSON.stringify(seances));
  return newSeance;
}

export function updateLocalSeance(id: string, updates: Partial<LocalSeance>): void {
  const seances = getLocalSeances();
  const index = seances.findIndex((s) => s.id === id);
  if (index !== -1) {
    seances[index] = { ...seances[index], ...updates };
    localStorage.setItem(SEANCES_KEY, JSON.stringify(seances));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSIONS CARDIO
// ═══════════════════════════════════════════════════════════════════════════

export function getLocalCardio(): LocalCardio[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(CARDIO_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalCardio(cardio: Omit<LocalCardio, "id">): LocalCardio {
  const sessions = getLocalCardio();
  const newCardio: LocalCardio = {
    ...cardio,
    id: `cardio_${Date.now()}`,
  };
  sessions.push(newCardio);
  localStorage.setItem(CARDIO_KEY, JSON.stringify(sessions));
  return newCardio;
}

export function updateLocalCardio(id: string, updates: Partial<LocalCardio>): void {
  const sessions = getLocalCardio();
  const index = sessions.findIndex((s) => s.id === id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(CARDIO_KEY, JSON.stringify(sessions));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION AVEC DONNÉES DE DÉPART
// ═══════════════════════════════════════════════════════════════════════════

export function initializeWithSeedData(): void {
  if (typeof window === "undefined") return;
  
  // Vérifier si on a déjà initialisé
  const initialized = localStorage.getItem("armure_initialized");
  if (initialized) return;
  
  // Ajouter la séance cardio du 11/01/2026
  const firstCardio: Omit<LocalCardio, "id"> = {
    date: "2026-01-11T10:00:00.000Z",
    mode: "zone2",
    dureeMinutes: 35,
    distanceKm: 5,
    rpeGastrique: 5,
    notes: "Première sortie Zone 2 ! Bonne sensation, allure confortable.",
    mood: "good",
  };
  
  saveLocalCardio(firstCardio);
  
  // Marquer comme initialisé
  localStorage.setItem("armure_initialized", "true");
  
  console.log("✅ Données initiales ajoutées : 5km Zone 2 du 11/01/2026");
}

// ═══════════════════════════════════════════════════════════════════════════
// STATISTIQUES À PARTIR DU STOCKAGE LOCAL
// ═══════════════════════════════════════════════════════════════════════════

export interface LocalStats {
  totalSeances: number;
  totalTonnage: number;
  totalDistance: number;
  currentStreak: number;
  bestStreak: number;
  weeklyProgress: number;
  lastWorkout: Date | null;
  completedThisWeek: number;
  plannedThisWeek: number;
  comparison: {
    thisWeekTonnage: number;
    lastWeekTonnage: number;
    tonnageChange: number;
    tonnageChangePercent: number;
    thisWeekSessions: number;
    lastWeekSessions: number;
    thisWeekDistance: number;
    lastWeekDistance: number;
    distanceChange: number;
    highlights: string[];
  };
}

export function getLocalStats(): LocalStats {
  const seances = getLocalSeances();
  const cardios = getLocalCardio();
  
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // Totaux
  let totalSeances = seances.length;
  let totalTonnage = seances.reduce((sum, s) => sum + s.tonnageTotal, 0);
  let totalDistance = cardios.reduce((sum, c) => sum + c.distanceKm, 0);
  
  // Cette semaine vs semaine dernière
  let thisWeekTonnage = 0;
  let lastWeekTonnage = 0;
  let thisWeekSessions = 0;
  let lastWeekSessions = 0;
  let thisWeekDistance = 0;
  let lastWeekDistance = 0;
  let completedThisWeek = 0;
  
  seances.forEach((s) => {
    const date = new Date(s.date);
    if (date >= oneWeekAgo) {
      thisWeekTonnage += s.tonnageTotal;
      thisWeekSessions++;
      completedThisWeek++;
    } else if (date >= twoWeeksAgo) {
      lastWeekTonnage += s.tonnageTotal;
      lastWeekSessions++;
    }
  });
  
  cardios.forEach((c) => {
    const date = new Date(c.date);
    if (date >= oneWeekAgo) {
      thisWeekDistance += c.distanceKm;
      thisWeekSessions++;
      completedThisWeek++;
    } else if (date >= twoWeeksAgo) {
      lastWeekDistance += c.distanceKm;
      lastWeekSessions++;
    }
  });
  
  // Calculs de comparaison
  const tonnageChange = thisWeekTonnage - lastWeekTonnage;
  const tonnageChangePercent = lastWeekTonnage > 0 
    ? Math.round((tonnageChange / lastWeekTonnage) * 100) 
    : (thisWeekTonnage > 0 ? 100 : 0);
  const distanceChange = thisWeekDistance - lastWeekDistance;
  
  // Highlights
  const highlights: string[] = [];
  if (tonnageChange > 0) {
    highlights.push(`+${tonnageChange}kg de tonnage vs S-1 💪`);
  }
  if (distanceChange > 0) {
    highlights.push(`+${distanceChange.toFixed(1)}km de distance vs S-1 🏃`);
  }
  if (thisWeekSessions > lastWeekSessions) {
    highlights.push(`${thisWeekSessions - lastWeekSessions} séance(s) de plus que S-1 📈`);
  }
  if (thisWeekDistance > 0 && lastWeekDistance === 0) {
    highlights.push(`Première semaine de cardio ! 🎉`);
  }
  
  // Streak
  const allDates = new Set<string>();
  seances.forEach((s) => allDates.add(s.date.split("T")[0]));
  cardios.forEach((c) => allDates.add(c.date.split("T")[0]));
  
  const sortedDates = Array.from(allDates).sort().reverse();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  
  let currentStreak = 0;
  let bestStreak = 0;
  
  if (sortedDates.length > 0) {
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      currentStreak = 1;
      let checkDate = new Date(sortedDates[0]);
      
      for (let i = 1; i < sortedDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedDate = checkDate.toISOString().split("T")[0];
        
        if (sortedDates[i] === expectedDate) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    bestStreak = Math.max(currentStreak, 1);
  }
  
  // Dernier entraînement
  const allWorkouts = [
    ...seances.map((s) => new Date(s.date)),
    ...cardios.map((c) => new Date(c.date)),
  ].sort((a, b) => b.getTime() - a.getTime());
  
  const lastWorkout = allWorkouts.length > 0 ? allWorkouts[0] : null;
  
  // Progression hebdo
  const weeklyProgress = lastWeekTonnage > 0 
    ? Math.round(((thisWeekTonnage - lastWeekTonnage) / lastWeekTonnage) * 100)
    : 0;
  
  return {
    totalSeances: totalSeances + cardios.length,
    totalTonnage,
    totalDistance,
    currentStreak,
    bestStreak,
    weeklyProgress,
    lastWorkout,
    completedThisWeek,
    plannedThisWeek: 6,
    comparison: {
      thisWeekTonnage,
      lastWeekTonnage,
      tonnageChange,
      tonnageChangePercent,
      thisWeekSessions,
      lastWeekSessions,
      thisWeekDistance,
      lastWeekDistance,
      distanceChange,
      highlights,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HISTORIQUE LOCAL
// ═══════════════════════════════════════════════════════════════════════════

export interface LocalHistoryItem {
  id: string;
  date: Date;
  type: "musculation" | "cardio";
  nom: string;
  tonnage?: number;
  exercicesCount?: number;
  distance?: number;
  duree?: number;
  rpe?: number;
  notes?: string;
  mood?: "great" | "good" | "ok" | "bad";
}

export function getLocalHistory(): LocalHistoryItem[] {
  const seances = getLocalSeances();
  const cardios = getLocalCardio();
  
  const history: LocalHistoryItem[] = [];
  
  seances.forEach((s) => {
    history.push({
      id: s.id,
      date: new Date(s.date),
      type: "musculation",
      nom: `Séance ${s.type}`,
      tonnage: s.tonnageTotal,
      exercicesCount: s.exercices.length,
      notes: s.notes,
      mood: s.mood,
    });
  });
  
  cardios.forEach((c) => {
    const modeLabels: Record<string, string> = {
      zone2: "Zone 2",
      intervalles: "Fractionné",
      seuil: "Seuil",
      course: "Course",
    };
    
    history.push({
      id: c.id,
      date: new Date(c.date),
      type: "cardio",
      nom: modeLabels[c.mode] || c.mode,
      distance: c.distanceKm,
      duree: c.dureeMinutes,
      rpe: c.rpeGastrique,
      notes: c.notes,
      mood: c.mood,
    });
  });
  
  // Trier par date décroissante
  history.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return history;
}
