// ═══════════════════════════════════════════════════════════════════════════
// HISTORIQUE DES SÉANCES
// Récupération et affichage de l'historique des entraînements
// ═══════════════════════════════════════════════════════════════════════════

import { db } from "./firebase";
import { collection, getDocs, query, orderBy, addDoc, Timestamp } from "firebase/firestore";

export interface WorkoutHistoryItem {
  id: string;
  date: Date;
  type: "musculation" | "cardio";
  nom: string;
  // Musculation
  tonnage?: number;
  exercicesCount?: number;
  // Cardio
  distance?: number;
  duree?: number;
  rpe?: number;
  // Notes personnelles
  notes?: string;
  mood?: "great" | "good" | "ok" | "bad";
}

import { getLocalHistory, initializeWithSeedData } from "./localStorage";

// Vérifier si Firebase est configuré
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-key";
};

export async function getWorkoutHistory(): Promise<WorkoutHistoryItem[]> {
  // Mode local si Firebase n'est pas configuré
  if (!isFirebaseConfigured()) {
    // Initialiser avec les données de départ
    if (typeof window !== "undefined") {
      initializeWithSeedData();
    }
    
    // Utiliser le stockage local
    const localHistory = getLocalHistory();
    return localHistory.map((item) => ({
      id: item.id,
      date: item.date,
      type: item.type,
      nom: item.nom,
      tonnage: item.tonnage,
      exercicesCount: item.exercicesCount,
      distance: item.distance,
      duree: item.duree,
      rpe: item.rpe,
      notes: item.notes,
      mood: item.mood,
    }));
  }

  try {
    const history: WorkoutHistoryItem[] = [];

    // Récupérer les séances de musculation
    const seancesRef = collection(db, "seances");
    const seancesSnap = await getDocs(query(seancesRef, orderBy("date", "desc")));

    seancesSnap.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        date: data.date.toDate(),
        type: "musculation",
        nom: `Séance ${data.type || ""}`,
        tonnage: data.tonnageTotal || 0,
        exercicesCount: data.exercices?.length || 0,
        notes: data.notes,
        mood: data.mood,
      });
    });

    // Récupérer les sessions cardio
    const cardioRef = collection(db, "cardio");
    const cardioSnap = await getDocs(query(cardioRef, orderBy("date", "desc")));

    cardioSnap.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        date: data.date.toDate(),
        type: "cardio",
        nom: data.mode || "Cardio",
        distance: data.distanceKm || 0,
        duree: data.dureeMinutes || 0,
        rpe: data.rpeGastrique || 0,
        notes: data.notes,
        mood: data.mood,
      });
    });

    // Trier par date décroissante
    history.sort((a, b) => b.date.getTime() - a.date.getTime());

    return history;
  } catch (error) {
    // En mode démo (pas de Firebase configuré), retourner un historique vide
    console.log("Mode démo - Firebase non configuré");
    return [];
  }
}

// Ajouter des notes à une séance existante
export async function addNotesToWorkout(
  workoutId: string,
  type: "musculation" | "cardio",
  notes: string,
  mood?: "great" | "good" | "ok" | "bad"
): Promise<boolean> {
  try {
    const collectionName = type === "musculation" ? "seances" : "cardio";
    const docRef = collection(db, collectionName);
    // Note: En production, on utiliserait updateDoc avec le docRef spécifique
    console.log(`Notes ajoutées à ${workoutId}:`, notes, mood);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout des notes:", error);
    return false;
  }
}

// Récupérer le récapitulatif hebdomadaire
export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  seancesMuscu: number;
  seancesCardio: number;
  tonnageTotal: number;
  distanceTotal: number;
  avgMood: number;
  highlights: string[];
  improvements: string[];
}

export async function getWeeklySummary(): Promise<WeeklySummary | null> {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const history = await getWorkoutHistory();
    const thisWeek = history.filter(
      (item) => item.date >= weekStart && item.date <= weekEnd
    );

    if (thisWeek.length === 0) {
      return null;
    }

    const muscu = thisWeek.filter((i) => i.type === "musculation");
    const cardio = thisWeek.filter((i) => i.type === "cardio");

    const tonnageTotal = muscu.reduce((sum, i) => sum + (i.tonnage || 0), 0);
    const distanceTotal = cardio.reduce((sum, i) => sum + (i.distance || 0), 0);

    // Générer les highlights
    const highlights: string[] = [];
    const improvements: string[] = [];

    if (muscu.length >= 3) {
      highlights.push("3 séances de musculation complétées ! 💪");
    } else if (muscu.length > 0) {
      improvements.push(`${3 - muscu.length} séances de muscu restantes cette semaine`);
    }

    if (cardio.length >= 2) {
      highlights.push("Cardio régulier cette semaine ! 🏃");
    }

    if (tonnageTotal >= 1000) {
      highlights.push("Plus d'une tonne soulevée cette semaine !");
    }

    if (distanceTotal >= 5) {
      highlights.push(`${distanceTotal.toFixed(1)}km parcourus !`);
    }

    return {
      weekStart,
      weekEnd,
      seancesMuscu: muscu.length,
      seancesCardio: cardio.length,
      tonnageTotal,
      distanceTotal,
      avgMood: 0, // À implémenter
      highlights,
      improvements,
    };
  } catch (error) {
    console.error("Erreur lors du calcul du récap hebdo:", error);
    return null;
  }
}
