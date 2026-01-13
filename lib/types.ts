// Types pour les séances et exercices

export type SeanceType = "A" | "B" | "C";

export interface Serie {
  reps: number;
  charge: number;
  tempoRespected: boolean;
}

export interface ExerciceLog {
  nom: string;
  series: Serie[];
}

export interface Seance {
  id: string;
  date: Date;
  type: SeanceType;
  exercices: ExerciceLog[];
  tonnageTotal: number;
}

export interface Exercice {
  id: string;
  nom: string;
  tempo: string; // ex: "3-0-1-0"
  series: number;
  repsTarget: number;
  equipement: "barre" | "halteres" | "corps";
  notes?: string;
  // Nouveaux champs
  chargeDepart: number; // Poids suggéré en kg pour débutant 70kg
  chargeMin: number; // Minimum pour sentir le travail
  chargeMax: number; // Maximum semaine 1 (sécurité)
  musclesCibles: string[];
  execution: string[]; // Points clés d'exécution
  videoUrl: string; // Lien vidéo de démonstration
  erreursCourantes?: string[];
}

export interface SeanceTemplate {
  type: SeanceType;
  nom: string;
  focus: string;
  exercices: Exercice[];
}

// Types pour le cardio
export type CardioMode = "intervalles" | "zone2";

export interface CardioSession {
  id: string;
  date: Date;
  mode: CardioMode;
  dureeMinutes: number;
  distanceKm?: number;
  rpeGastrique: number; // 1-5
}

// Types pour le tempo
export interface TempoPhase {
  name: "excentrique" | "pause_bas" | "concentrique" | "pause_haut";
  duration: number;
  label: string;
}

export function parseTempo(tempo: string): TempoPhase[] {
  const [exc, pauseBas, conc, pauseHaut] = tempo.split("-").map(Number);

  // Typage explicite pour conserver les littéraux du discriminant `name`
  const phases: TempoPhase[] = [
    { name: "excentrique", duration: exc, label: "Descente" },
    { name: "pause_bas", duration: pauseBas, label: "Pause" },
    { name: "concentrique", duration: conc, label: "Remontée" },
    { name: "pause_haut", duration: pauseHaut, label: "Pause" },
  ];

  return phases.filter((p) => p.duration > 0);
}
