import { SeanceTemplate, Exercice } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// MOIS 1 : Fondation & Alignement
// Focus : Maîtrise du tempo, verticalité et rééducation respiratoire
// 
// POIDS DE DÉPART calculés pour un profil de 70kg débutant
// Règle d'or : Si tu finis les séries facilement → augmente de 2.5kg (barre) ou 1kg (haltères)
//              Si tu ne finis pas les séries → baisse de 2.5kg/1kg
// ═══════════════════════════════════════════════════════════════════════════

export const SEANCE_A: Exercice[] = [
  {
    id: "rowing-barre",
    nom: "Rowing Barre buste penché",
    tempo: "3-0-1-0",
    series: 4,
    repsTarget: 10,
    equipement: "barre",
    // Poids pour 70kg débutant : 30-40% du poids de corps
    chargeDepart: 25, // Barre (20kg) + 2.5kg de chaque côté
    chargeMin: 20, // Juste la barre olympique
    chargeMax: 35, // Maximum semaine 1
    musclesCibles: ["Grand dorsal", "Rhomboïdes", "Trapèzes", "Biceps"],
    execution: [
      "Pieds largeur d'épaules, genoux légèrement fléchis",
      "Penche le buste à 45° en gardant le dos DROIT (pas arrondi !)",
      "Tire la barre vers le nombril, pas vers la poitrine",
      "Serre les omoplates en haut du mouvement",
      "Descente contrôlée en 3 secondes"
    ],
    notes: "Au Rack - Dos DROIT, tirage vers le nombril. Anti-cyphose !",
    videoUrl: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
    erreursCourantes: [
      "Dos arrondi → risque lombaire",
      "Tirer avec les bras au lieu du dos",
      "Élan avec le corps (triche)"
    ]
  },
  {
    id: "oiseau-halteres",
    nom: "Oiseau Haltères (Rear Delt Fly)",
    tempo: "2-1-1-0",
    series: 3,
    repsTarget: 15,
    equipement: "halteres",
    // Exercice d'isolation → poids léger
    chargeDepart: 4, // 4kg par haltère
    chargeMin: 2,
    chargeMax: 6,
    musclesCibles: ["Deltoïde postérieur", "Rhomboïdes", "Trapèzes moyens"],
    execution: [
      "Penché à 45-60°, dos droit, regard vers le sol",
      "Bras légèrement fléchis, paumes face à face",
      "Écarte les bras sur les côtés en arc de cercle",
      "PAUSE 1 seconde en haut (contraction)",
      "Imagine que tu veux toucher tes omoplates ensemble"
    ],
    notes: "Contraction 1s en haut. Excellent pour corriger les épaules en avant !",
    videoUrl: "https://www.youtube.com/watch?v=lPt0GqwaqEw",
    erreursCourantes: [
      "Poids trop lourd → compensation avec le corps",
      "Bras trop tendus → stress sur le coude",
      "Monter trop haut → trapèzes prennent le relais"
    ]
  },
  {
    id: "superman",
    nom: "Superman / Gainage dorsal",
    tempo: "0-0-0-0", // Exercice statique
    series: 3,
    repsTarget: 45, // secondes de maintien
    equipement: "corps",
    chargeDepart: 0,
    chargeMin: 0,
    chargeMax: 0,
    musclesCibles: ["Érecteurs du rachis", "Fessiers", "Ischio-jambiers"],
    execution: [
      "Allongé face au sol, bras tendus devant toi",
      "Lève simultanément bras ET jambes du sol",
      "Garde le regard vers le sol (nuque neutre)",
      "Serre les fessiers et le bas du dos",
      "Maintiens 45 secondes en respirant normalement"
    ],
    notes: "Maintien 45s. Renforce les muscles profonds du dos, anti-lordose !",
    videoUrl: "https://www.youtube.com/watch?v=cc6UVRS7PW4",
    erreursCourantes: [
      "Lever la tête → compression cervicale",
      "Bloquer la respiration",
      "Creuser excessivement le bas du dos"
    ]
  },
];

export const SEANCE_B: Exercice[] = [
  {
    id: "developpe-couche",
    nom: "Développé Couché",
    tempo: "3-1-1-0",
    series: 4,
    repsTarget: 8,
    equipement: "barre",
    // Pour 70kg débutant : 40-50% avec sécurité
    chargeDepart: 30, // Barre (20kg) + 5kg de chaque côté
    chargeMin: 20, // Juste la barre
    chargeMax: 40,
    musclesCibles: ["Pectoraux", "Deltoïdes antérieurs", "Triceps"],
    execution: [
      "BARRES DE SÉCURITÉ OBLIGATOIRES au niveau de la poitrine",
      "Allongé, pieds au sol, fesses et omoplates collées au banc",
      "Prise légèrement plus large que les épaules",
      "Descends la barre vers le bas des pectoraux (ligne des tétons)",
      "PAUSE 1 seconde en bas, puis pousse explosif",
      "Verrouille les coudes en haut sans hyper-extension"
    ],
    notes: "SÉCURITÉ : Toujours avec les barres de sécurité du rack !",
    videoUrl: "https://www.youtube.com/watch?v=gRVjAtPip0Y",
    erreursCourantes: [
      "Décoller les fesses du banc",
      "Faire rebondir la barre sur la poitrine",
      "Coudes trop écartés (90°) → stress épaules",
      "Pas de barres de sécurité → DANGER"
    ]
  },
  {
    id: "floor-press",
    nom: "Floor Press Haltères",
    tempo: "2-1-1-0",
    series: 3,
    repsTarget: 12,
    equipement: "halteres",
    chargeDepart: 10, // 10kg par haltère
    chargeMin: 6,
    chargeMax: 14,
    musclesCibles: ["Pectoraux", "Triceps"],
    execution: [
      "Allongé au sol, genoux pliés, pieds à plat",
      "Haltères au-dessus de la poitrine, paumes vers l'avant",
      "Descends jusqu'à ce que les coudes touchent le sol",
      "PAUSE 1 seconde au sol (élimine l'élan)",
      "Coudes à 45° du corps, pas à 90°",
      "Pousse vers le plafond en contractant les pecs"
    ],
    notes: "Le sol limite l'amplitude → protège les épaules. Parfait pour apprendre !",
    videoUrl: "https://www.youtube.com/watch?v=uUGDRwge4F8",
    erreursCourantes: [
      "Coudes trop écartés",
      "Ne pas marquer la pause au sol",
      "Arquer excessivement le dos"
    ]
  },
];

export const SEANCE_C: Exercice[] = [
  {
    id: "front-squat",
    nom: "Front Squat",
    tempo: "3-1-1-0",
    series: 4,
    repsTarget: 10,
    equipement: "barre",
    // Front squat = plus technique, commencer léger
    chargeDepart: 25, // Barre + 2.5kg de chaque côté
    chargeMin: 20, // Juste la barre
    chargeMax: 35,
    musclesCibles: ["Quadriceps", "Fessiers", "Core (gainage)"],
    execution: [
      "Barre sur les deltoïdes avant (pas sur la gorge !)",
      "Prise 'clean' (coudes hauts) ou croisée",
      "Pieds largeur d'épaules, pointes légèrement vers l'extérieur",
      "Descends en gardant le buste LE PLUS VERTICAL possible",
      "Genoux dans l'axe des orteils",
      "PAUSE 1 seconde en bas, puis remonte"
    ],
    notes: "RACK OBLIGATOIRE. La position verticale protège ton dos !",
    videoUrl: "https://www.youtube.com/watch?v=m4ytaCJZpl0",
    erreursCourantes: [
      "Coudes qui tombent → barre glisse",
      "Se pencher en avant → stress lombaire",
      "Genoux qui rentrent vers l'intérieur",
      "Talons qui décollent"
    ]
  },
  {
    id: "souleve-terre-jambes-tendues",
    nom: "Soulevé de terre jambes tendues",
    tempo: "3-0-1-0",
    series: 3,
    repsTarget: 12,
    equipement: "halteres",
    chargeDepart: 8, // 8kg par haltère
    chargeMin: 5,
    chargeMax: 12,
    musclesCibles: ["Ischio-jambiers", "Fessiers", "Érecteurs du rachis"],
    execution: [
      "Debout, pieds largeur de hanches, genoux LÉGÈREMENT fléchis",
      "Haltères devant les cuisses, paumes vers toi",
      "Pousse les hanches vers l'ARRIÈRE (hip hinge)",
      "Descends en glissant les haltères le long des jambes",
      "Dos DROIT, regard vers l'avant",
      "Étire les ischio-jambiers, puis remonte en serrant les fessiers"
    ],
    notes: "LÉGÈRE flexion des genoux toujours ! Étirement ischio.",
    videoUrl: "https://www.youtube.com/watch?v=1uDiW5--rAE",
    erreursCourantes: [
      "Arrondir le dos → DANGER lombaire",
      "Jambes complètement verrouillées → stress genoux",
      "Descendre trop bas sans souplesse suffisante",
      "Ne pas pousser les hanches vers l'arrière"
    ]
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATES DES SÉANCES
// ═══════════════════════════════════════════════════════════════════════════

export const SEANCES: SeanceTemplate[] = [
  {
    type: "A",
    nom: "Dos & Posture",
    focus: "Rééducation posturale et renforcement du dos",
    exercices: SEANCE_A,
  },
  {
    type: "B",
    nom: "Pecs & Triceps",
    focus: "Développement de la poussée horizontale",
    exercices: SEANCE_B,
  },
  {
    type: "C",
    nom: "Jambes & Lombaires",
    focus: "Force des membres inférieurs et stabilité du tronc",
    exercices: SEANCE_C,
  },
];

export function getSeanceByType(type: "A" | "B" | "C"): SeanceTemplate | undefined {
  return SEANCES.find((s) => s.type === type);
}

// ═══════════════════════════════════════════════════════════════════════════
// FONCTION DE CALCUL DES POIDS DE DÉPART
// Basée sur des ratios éprouvés pour débutants
// ═══════════════════════════════════════════════════════════════════════════

export interface PoidsDepart {
  exerciceId: string;
  poidsSuggere: number;
  poidsMin: number;
  poidsMax: number;
  ratio: string;
}

/**
 * Calcule les poids de départ suggérés pour un profil donné
 * @param poidsCorps - Poids de l'utilisateur en kg
 * @returns Tableau des poids suggérés par exercice
 */
export function calculerPoidsDepart(poidsCorps: number): PoidsDepart[] {
  // Ratios pour débutants (% du poids de corps)
  const ratios: Record<string, { min: number; suggere: number; max: number }> = {
    "rowing-barre": { min: 0.28, suggere: 0.36, max: 0.50 },
    "oiseau-halteres": { min: 0.03, suggere: 0.06, max: 0.09 },
    "superman": { min: 0, suggere: 0, max: 0 },
    "developpe-couche": { min: 0.28, suggere: 0.43, max: 0.57 },
    "floor-press": { min: 0.09, suggere: 0.14, max: 0.20 },
    "front-squat": { min: 0.28, suggere: 0.36, max: 0.50 },
    "souleve-terre-jambes-tendues": { min: 0.07, suggere: 0.11, max: 0.17 },
  };

  return Object.entries(ratios).map(([exerciceId, ratio]) => ({
    exerciceId,
    poidsSuggere: Math.round(poidsCorps * ratio.suggere / 2.5) * 2.5, // Arrondi à 2.5kg
    poidsMin: Math.round(poidsCorps * ratio.min / 2.5) * 2.5,
    poidsMax: Math.round(poidsCorps * ratio.max / 2.5) * 2.5,
    ratio: `${Math.round(ratio.suggere * 100)}% du poids de corps`,
  }));
}
