import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, where } from "firebase/firestore";
import { db } from "./firebase";
import { Seance, CardioSession, SeanceType } from "./types";

// Collections
const SEANCES_COLLECTION = "seances";
const CARDIO_COLLECTION = "cardio";

/**
 * Sauvegarde une séance de musculation
 */
export async function saveSeance(seance: Omit<Seance, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, SEANCES_COLLECTION), {
      ...seance,
      date: Timestamp.fromDate(seance.date),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erreur sauvegarde séance:", error);
    throw error;
  }
}

/**
 * Récupère les séances de musculation
 */
export async function getSeances(limitCount: number = 50): Promise<Seance[]> {
  try {
    const q = query(
      collection(db, SEANCES_COLLECTION),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: (doc.data().date as Timestamp).toDate(),
    })) as Seance[];
  } catch (error) {
    console.error("Erreur récupération séances:", error);
    return [];
  }
}

/**
 * Récupère la dernière séance d'un type donné
 */
export async function getLastSeanceByType(type: SeanceType): Promise<Seance | null> {
  try {
    const q = query(
      collection(db, SEANCES_COLLECTION),
      where("type", "==", type),
      orderBy("date", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      date: (doc.data().date as Timestamp).toDate(),
    } as Seance;
  } catch (error) {
    console.error("Erreur récupération dernière séance:", error);
    return null;
  }
}

/**
 * Sauvegarde une session cardio
 */
export async function saveCardioSession(session: Omit<CardioSession, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, CARDIO_COLLECTION), {
      ...session,
      date: Timestamp.fromDate(session.date),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erreur sauvegarde cardio:", error);
    throw error;
  }
}

/**
 * Récupère les sessions cardio
 */
export async function getCardioSessions(limitCount: number = 50): Promise<CardioSession[]> {
  try {
    const q = query(
      collection(db, CARDIO_COLLECTION),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: (doc.data().date as Timestamp).toDate(),
    })) as CardioSession[];
  } catch (error) {
    console.error("Erreur récupération cardio:", error);
    return [];
  }
}

/**
 * Calcule la distance totale parcourue
 */
export async function getTotalDistance(): Promise<number> {
  const sessions = await getCardioSessions();
  return sessions.reduce((total, s) => total + (s.distanceKm || 0), 0);
}

/**
 * Compte le nombre total de séances
 */
export async function getSeancesCount(): Promise<number> {
  const seances = await getSeances();
  return seances.length;
}
