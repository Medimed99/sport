// ═══════════════════════════════════════════════════════════════════════════
// STATISTIQUES & PROGRESSION
// Gestion des stats utilisateur et suggestions de poids
// ═══════════════════════════════════════════════════════════════════════════

import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from "firebase/firestore";

export interface UserStats {
  totalSeances: number;
  totalTonnage: number;
  totalDistance: number;
  currentStreak: number;
  bestStreak: number;
  weeklyProgress: number; // % d'augmentation du tonnage vs semaine précédente
  lastWorkout: Date | null;
  completedThisWeek: number;
  plannedThisWeek: number;
  // Comparaison S-1
  comparison: WeekComparison;
}

export interface WeekComparison {
  thisWeekTonnage: number;
  lastWeekTonnage: number;
  tonnageChange: number; // en kg
  tonnageChangePercent: number; // en %
  thisWeekSessions: number;
  lastWeekSessions: number;
  thisWeekDistance: number;
  lastWeekDistance: number;
  distanceChange: number; // en km
  highlights: string[];
}

export interface ExerciseHistory {
  date: Date;
  charge: number;
  reps: number;
  tempoRespected: boolean;
}

export interface WeightSuggestion {
  exerciseId: string;
  currentMax: number;
  suggestedNext: number;
  reason: string;
  confidence: "high" | "medium" | "low";
}

import { getLocalStats, initializeWithSeedData } from "./localStorage";

// Vérifier si Firebase est configuré
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-key";
};

// Comparaison vide par défaut
const EMPTY_COMPARISON: WeekComparison = {
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
};

// Récupérer les stats globales
export async function getStats(): Promise<UserStats> {
  // Mode local si Firebase n'est pas configuré
  if (!isFirebaseConfigured()) {
    // Initialiser avec les données de départ (5km du 11/01)
    if (typeof window !== "undefined") {
      initializeWithSeedData();
    }
    
    // Utiliser le stockage local
    const localStats = getLocalStats();
    return {
      totalSeances: localStats.totalSeances,
      totalTonnage: localStats.totalTonnage,
      totalDistance: localStats.totalDistance,
      currentStreak: localStats.currentStreak,
      bestStreak: localStats.bestStreak,
      weeklyProgress: localStats.weeklyProgress,
      lastWorkout: localStats.lastWorkout,
      completedThisWeek: localStats.completedThisWeek,
      plannedThisWeek: localStats.plannedThisWeek,
      comparison: localStats.comparison,
    };
  }

  try {
    // Récupérer toutes les séances
    const seancesRef = collection(db, "seances");
    const seancesSnap = await getDocs(query(seancesRef, orderBy("date", "desc")));
    
    // Récupérer toutes les sessions cardio
    const cardioRef = collection(db, "cardio");
    const cardioSnap = await getDocs(query(cardioRef, orderBy("date", "desc")));
    
    let totalSeances = 0;
    let totalTonnage = 0;
    let totalDistance = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let lastWorkout: Date | null = null;
    
    // Calculer le tonnage total et compter les séances
    seancesSnap.forEach((doc) => {
      const data = doc.data();
      totalSeances++;
      totalTonnage += data.tonnageTotal || 0;
      
      if (!lastWorkout && data.date) {
        lastWorkout = data.date.toDate();
      }
    });
    
    // Calculer la distance totale
    cardioSnap.forEach((doc) => {
      const data = doc.data();
      totalDistance += data.distanceKm || 0;
      
      if (!lastWorkout && data.date) {
        const cardioDate = data.date.toDate();
        if (!lastWorkout || cardioDate > lastWorkout) {
          lastWorkout = cardioDate;
        }
      }
    });
    
    // Calculer le streak (jours consécutifs d'entraînement)
    const allDates = new Set<string>();
    
    seancesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.date) {
        const dateStr = data.date.toDate().toISOString().split("T")[0];
        allDates.add(dateStr);
      }
    });
    
    cardioSnap.forEach((doc) => {
      const data = doc.data();
      if (data.date) {
        const dateStr = data.date.toDate().toISOString().split("T")[0];
        allDates.add(dateStr);
      }
    });
    
    // Trier les dates et calculer le streak
    const sortedDates = Array.from(allDates).sort().reverse();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    if (sortedDates.length > 0) {
      // Vérifier si la dernière séance est aujourd'hui ou hier
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
      
      // Calculer le meilleur streak
      let tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, currentStreak);
    }
    
    // Calculer la progression hebdomadaire
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
    
    let thisWeekTonnage = 0;
    let lastWeekTonnage = 0;
    let completedThisWeek = 0;
    
    seancesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.date) {
        const date = data.date.toDate();
        if (date >= oneWeekAgo) {
          thisWeekTonnage += data.tonnageTotal || 0;
          completedThisWeek++;
        } else if (date >= twoWeeksAgo) {
          lastWeekTonnage += data.tonnageTotal || 0;
        }
      }
    });
    
    let thisWeekSessions = 0;
    let lastWeekSessions = 0;
    let thisWeekDistance = 0;
    let lastWeekDistance = 0;
    
    cardioSnap.forEach((doc) => {
      const data = doc.data();
      if (data.date) {
        const date = data.date.toDate();
        if (date >= oneWeekAgo) {
          completedThisWeek++;
          thisWeekSessions++;
          thisWeekDistance += data.distanceKm || 0;
        } else if (date >= twoWeeksAgo) {
          lastWeekSessions++;
          lastWeekDistance += data.distanceKm || 0;
        }
      }
    });
    
    // Ajouter les séances muscu aux sessions
    seancesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.date) {
        const date = data.date.toDate();
        if (date >= oneWeekAgo) {
          thisWeekSessions++;
        } else if (date >= twoWeeksAgo) {
          lastWeekSessions++;
        }
      }
    });
    
    const weeklyProgress = lastWeekTonnage > 0 
      ? Math.round(((thisWeekTonnage - lastWeekTonnage) / lastWeekTonnage) * 100)
      : 0;
    
    // Calculer la comparaison S-1
    const tonnageChange = thisWeekTonnage - lastWeekTonnage;
    const tonnageChangePercent = lastWeekTonnage > 0 
      ? Math.round((tonnageChange / lastWeekTonnage) * 100) 
      : 0;
    const distanceChange = thisWeekDistance - lastWeekDistance;
    
    // Générer les highlights
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
    if (tonnageChange < 0 && thisWeekSessions > 0) {
      highlights.push(`Tonnage en baisse : pense à récupérer 😴`);
    }
    
    const comparison: WeekComparison = {
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
    };
    
    return {
      totalSeances,
      totalTonnage,
      totalDistance,
      currentStreak,
      bestStreak,
      weeklyProgress,
      lastWorkout,
      completedThisWeek,
      plannedThisWeek: 6, // 3 muscu + 2-3 cardio par semaine
      comparison,
    };
  } catch (error) {
    // En mode démo (pas de Firebase configuré), retourner des valeurs par défaut
    console.log("Mode démo - Firebase non configuré");
    return {
      totalSeances: 0,
      totalTonnage: 0,
      totalDistance: 0,
      currentStreak: 0,
      bestStreak: 0,
      weeklyProgress: 0,
      lastWorkout: null,
      completedThisWeek: 0,
      plannedThisWeek: 6,
      comparison: EMPTY_COMPARISON,
    };
  }
}

// Récupérer l'historique d'un exercice spécifique
export async function getExerciseHistory(exerciseId: string): Promise<ExerciseHistory[]> {
  try {
    const seancesRef = collection(db, "seances");
    const seancesSnap = await getDocs(query(seancesRef, orderBy("date", "desc")));
    
    const history: ExerciseHistory[] = [];
    
    seancesSnap.forEach((doc) => {
      const data = doc.data();
      const exercice = data.exercices?.find((ex: any) => ex.id === exerciseId);
      
      if (exercice && exercice.series) {
        exercice.series.forEach((serie: any) => {
          history.push({
            date: data.date.toDate(),
            charge: serie.charge,
            reps: serie.reps,
            tempoRespected: serie.tempoRespected,
          });
        });
      }
    });
    
    return history;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return [];
  }
}

// Générer une suggestion de poids pour un exercice
export async function getSuggestedWeight(
  exerciseId: string,
  targetReps: number,
  isBarbell: boolean = true
): Promise<WeightSuggestion | null> {
  const history = await getExerciseHistory(exerciseId);
  
  if (history.length === 0) {
    return null;
  }
  
  // Trouver la meilleure performance récente (dernier mois)
  const recentHistory = history.filter(
    (h) => h.date > new Date(Date.now() - 30 * 86400000)
  );
  
  if (recentHistory.length === 0) {
    return null;
  }
  
  // Trouver la charge max avec tempo respecté
  const successfulSets = recentHistory.filter(
    (h) => h.tempoRespected && h.reps >= targetReps
  );
  
  if (successfulSets.length === 0) {
    // Pas de sets réussis avec tempo, garder la même charge
    const lastCharge = recentHistory[0].charge;
    return {
      exerciseId,
      currentMax: lastCharge,
      suggestedNext: lastCharge,
      reason: "Continue à cette charge jusqu'à maîtriser le tempo",
      confidence: "high",
    };
  }
  
  const maxCharge = Math.max(...successfulSets.map((s) => s.charge));
  
  // Vérifier si toutes les dernières séries à cette charge sont réussies
  const lastSessionSets = successfulSets.filter(
    (s) => s.charge === maxCharge
  );
  
  const increment = isBarbell ? 2.5 : 1;
  
  if (lastSessionSets.length >= 3) {
    // Au moins 3 séries réussies à cette charge → prêt à augmenter
    return {
      exerciseId,
      currentMax: maxCharge,
      suggestedNext: maxCharge + increment,
      reason: `Tu as réussi ${lastSessionSets.length} séries à ${maxCharge}kg avec tempo ✓`,
      confidence: "high",
    };
  } else if (lastSessionSets.length >= 2) {
    // 2 séries réussies → peut-être prêt
    return {
      exerciseId,
      currentMax: maxCharge,
      suggestedNext: maxCharge + increment,
      reason: `Proche du cap ! Essaie ${maxCharge + increment}kg sur la première série`,
      confidence: "medium",
    };
  } else {
    // Pas assez de séries réussies
    return {
      exerciseId,
      currentMax: maxCharge,
      suggestedNext: maxCharge,
      reason: "Continue à consolider à cette charge",
      confidence: "high",
    };
  }
}

// Calculer les milestones atteints
export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedDate?: Date;
}

export async function getMilestones(): Promise<Milestone[]> {
  const stats = await getStats();
  
  const milestones: Milestone[] = [
    {
      id: "first-workout",
      title: "Premier pas",
      description: "Complète ta première séance",
      icon: "🎯",
      achieved: stats.totalSeances >= 1,
    },
    {
      id: "week-complete",
      title: "Semaine complète",
      description: "Fais 6 séances en une semaine",
      icon: "📅",
      achieved: stats.completedThisWeek >= 6,
    },
    {
      id: "streak-7",
      title: "Flamme ardente",
      description: "7 jours consécutifs d'entraînement",
      icon: "🔥",
      achieved: stats.bestStreak >= 7,
    },
    {
      id: "tonnage-1000",
      title: "Première tonne",
      description: "Soulève 1000 kg cumulés",
      icon: "💪",
      achieved: stats.totalTonnage >= 1000,
    },
    {
      id: "distance-5",
      title: "5 bornes",
      description: "Cours 5 km cumulés",
      icon: "🏃",
      achieved: stats.totalDistance >= 5,
    },
    {
      id: "distance-9",
      title: "Objectif 9km",
      description: "Prêt pour la course !",
      icon: "🏆",
      achieved: stats.totalDistance >= 9,
    },
  ];
  
  return milestones;
}
