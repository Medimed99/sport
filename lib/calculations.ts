import { Serie, Seance, ExerciceLog } from "./types";

/**
 * Calcule le tonnage d'une série
 * Tonnage = reps × charge
 */
export function calculerTonnageSerie(serie: Serie): number {
  return serie.reps * serie.charge;
}

/**
 * Calcule le tonnage total d'un exercice
 */
export function calculerTonnageExercice(exercice: ExerciceLog): number {
  return exercice.series.reduce((total, serie) => total + calculerTonnageSerie(serie), 0);
}

/**
 * Calcule le tonnage total d'une séance
 */
export function calculerTonnageSeance(exercices: ExerciceLog[]): number {
  return exercices.reduce((total, ex) => total + calculerTonnageExercice(ex), 0);
}

/**
 * Calcule le tonnage cumulé sur plusieurs séances
 */
export function calculerTonnageCumule(seances: Seance[]): number {
  return seances.reduce((total, s) => total + s.tonnageTotal, 0);
}

/**
 * Suggère la charge pour la prochaine séance
 * Règle : Si toutes les séries sont complètes avec tempo respecté, +2.5kg (barre) ou +1kg (haltères)
 */
export function suggererProchaineCharge(
  derniereCharge: number,
  seriesCompletees: Serie[],
  equipement: "barre" | "halteres" | "corps"
): number {
  if (equipement === "corps") return 0;

  const toutesCompletees = seriesCompletees.every((s) => s.tempoRespected && s.reps > 0);
  const increment = equipement === "barre" ? 2.5 : 1;

  return toutesCompletees ? derniereCharge + increment : derniereCharge;
}

/**
 * Formate le tonnage pour l'affichage
 */
export function formaterTonnage(tonnage: number): string {
  if (tonnage >= 1000) {
    return `${(tonnage / 1000).toFixed(1)}t`;
  }
  return `${tonnage}kg`;
}

/**
 * Calcule le pourcentage de progression entre deux valeurs
 */
export function calculerProgression(ancienne: number, nouvelle: number): number {
  if (ancienne === 0) return 0;
  return Math.round(((nouvelle - ancienne) / ancienne) * 100);
}
