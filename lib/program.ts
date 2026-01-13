// ═══════════════════════════════════════════════════════════════════════════
// PROGRAMME ARCHITECTURE & ARMURE - 10 SEMAINES
// Objectif : 9km le 14 février + Transformation physique
// ═══════════════════════════════════════════════════════════════════════════

export type SessionType = 
  | "musculation_A" 
  | "musculation_B" 
  | "musculation_C"
  | "cardio_fractionne"
  | "cardio_zone2"
  | "cardio_seuil"
  | "repos"
  | "course_9km";

export interface ProgramSession {
  id: string;
  type: SessionType;
  nom: string;
  description: string;
  duree: string; // ex: "45-60 min"
  details: string[];
  priorite: number; // 1 = obligatoire, 2 = important, 3 = optionnel
  // Nouveaux champs pour débutants
  explicationDebutant?: string; // Explication simple de ce qu'est cette séance
  commentFaire?: string[]; // Étapes concrètes pour réaliser la séance
  conseils?: string[]; // Conseils pratiques
  erreurs?: string[]; // Erreurs à éviter
  videoUrl?: string; // Vidéo explicative si disponible
  lienSeance?: "A" | "B" | "C"; // Lien vers la page de séance musculation
}

export interface WeekProgram {
  semaine: number;
  bloc: 1 | 2;
  theme: string;
  focus: string;
  sessions: ProgramSession[];
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOC 1 : "Objectif 9km & Fondation" (Semaines 1 à 5)
// ═══════════════════════════════════════════════════════════════════════════

const BLOC1_SESSIONS = {
  // Semaine 1 - Apprentissage technique
  S1: {
    muscu_A: {
      id: "s1-muscu-a",
      type: "musculation_A" as SessionType,
      nom: "Dos & Posture (Technique)",
      description: "Apprentissage technique - Charges modérées",
      duree: "45 min",
      details: [
        "Rowing Barre : 3×10 @ 20kg (Tempo 3-0-1-0)",
        "Oiseau Haltères : 3×12 @ 3kg",
        "Superman : 3×30s",
        "Focus : Maîtrise du mouvement, pas la charge"
      ],
      priorite: 1,
      lienSeance: "A",
      explicationDebutant: "Cette séance cible le DOS pour corriger ta posture. Chaque exercice renforce les muscles qui tirent tes épaules en arrière, combattant la cyphose (dos voûté). Utilise des charges légères pour maîtriser parfaitement le tempo."
    },
    muscu_B: {
      id: "s1-muscu-b",
      type: "musculation_B" as SessionType,
      nom: "Pecs & Triceps (Technique)",
      description: "Apprentissage technique - Charges modérées",
      duree: "45 min",
      details: [
        "Développé Couché : 3×8 @ 25kg (Tempo 3-1-1-0)",
        "Floor Press : 3×10 @ 8kg/main",
        "Focus : Position des coudes, contrôle"
      ],
      priorite: 1,
      lienSeance: "B",
      explicationDebutant: "Cette séance cible les PECTORAUX et TRICEPS. Le développé couché est l'exercice roi pour la poitrine. Le floor press limite l'amplitude pour protéger tes épaules pendant l'apprentissage."
    },
    muscu_C: {
      id: "s1-muscu-c",
      type: "musculation_C" as SessionType,
      nom: "Jambes & Core (Technique)",
      description: "Apprentissage Front Squat",
      duree: "45 min",
      details: [
        "Front Squat : 3×10 @ 20kg (Tempo 3-1-1-0)",
        "Soulevé Terre JT : 3×10 @ 6kg/main",
        "Focus : Verticalité du buste"
      ],
      priorite: 1,
      lienSeance: "C",
      explicationDebutant: "Cette séance cible les JAMBES et le CORE. Le front squat force un buste vertical, protégeant ton dos. Le soulevé de terre jambes tendues étire et renforce les ischio-jambiers."
    },
    cardio_frac: {
      id: "s1-cardio-frac",
      type: "cardio_fractionne" as SessionType,
      nom: "Fractionné 30/30",
      description: "Intervalles courts pour initiation",
      duree: "25 min",
      details: [
        "Échauffement : 5 min marche/trot",
        "10× (30s effort / 30s récup)",
        "Retour au calme : 5 min",
        "RPE Effort : 7/10 max"
      ],
      priorite: 1,
      explicationDebutant: "Le fractionné 30/30 alterne 30 secondes de course rapide et 30 secondes de récupération (marche ou trot lent). C'est la méthode la plus efficace pour améliorer ton cardio sans courir longtemps. Ces intervalles courts entraînent ton cœur à récupérer rapidement.",
      commentFaire: [
        "1. Trouve un terrain plat (piste, parc, trottoir)",
        "2. Échauffe-toi 5 min en marchant puis en trottinant doucement",
        "3. Lance un chrono ou utilise l'app Cardio de l'application",
        "4. 30s EFFORT : Cours vite (tu ne peux pas parler), mais pas en sprint total",
        "5. 30s RÉCUP : Marche ou trot très lent pour reprendre ton souffle",
        "6. Répète 10 fois",
        "7. Termine par 5 min de marche pour récupérer"
      ],
      conseils: [
        "L'effort doit être INCONFORTABLE mais TENABLE pendant 30s",
        "Pendant la récup, respire profondément par le ventre",
        "Si tu as la nausée, ralentis les prochains efforts",
        "Fais ça de préférence 2h après un repas"
      ],
      erreurs: [
        "Partir trop vite au premier intervalle (tu vas mourir au 5ème)",
        "Ne pas respecter les 30s de récup (pas de triche !)",
        "Oublier l'échauffement (risque de blessure)"
      ],
      videoUrl: "https://www.youtube.com/watch?v=sTxLq4kehKE"
    },
    cardio_zone2: {
      id: "s1-cardio-z2",
      type: "cardio_zone2" as SessionType,
      nom: "Zone 2 - 5km lent",
      description: "Construction de la base aérobie",
      duree: "35-40 min",
      details: [
        "Allure conversation (tu peux parler)",
        "Distance : 5 km",
        "RPE : 5-6/10",
        "Respiration nasale si possible"
      ],
      priorite: 1,
      explicationDebutant: "La Zone 2 est une allure très lente où tu peux tenir une conversation sans être essoufflé. C'est l'entraînement le plus important pour construire ton endurance de base. Ça paraît trop facile, mais c'est exactement le but ! Tu entraînes ton cœur à être efficace.",
      commentFaire: [
        "1. Pars de chez toi ou d'un parc",
        "2. Commence à courir LENTEMENT (allure grand-mère)",
        "3. Vérifie : peux-tu parler sans t'essouffler ? Si non, RALENTIS",
        "4. Objectif : 5 km sans t'arrêter (marche si besoin)",
        "5. Rythme cible : entre 7:00 et 8:00 par km",
        "6. Si tu as une montre, reste sous 140 bpm"
      ],
      conseils: [
        "Si tu dois choisir entre 'trop lent' et 'un peu rapide', choisis TROP LENT",
        "C'est normal de se faire doubler par des mamies, c'est le but",
        "Respire par le nez si possible, ça force le ralentissement",
        "Écoute un podcast pour passer le temps, pas de musique qui t'excite"
      ],
      erreurs: [
        "Courir trop vite 'parce que c'est gênant d'être lent'",
        "S'arrêter dès que c'est un peu dur (marche plutôt que stop complet)",
        "Ne pas s'hydrater avant la sortie"
      ],
      videoUrl: "https://www.youtube.com/watch?v=gjD3jQvmEak"
    }
  },

  // Semaine 2 - Fixation posturale
  S2: {
    muscu_A: {
      id: "s2-muscu-a",
      type: "musculation_A" as SessionType,
      nom: "Dos & Posture (Tempo Lent)",
      description: "Tempo 4-0-1-0 - Temps sous tension maximal",
      duree: "50 min",
      details: [
        "Rowing Barre : 4×10 @ 22.5kg (Tempo 4-0-1-0)",
        "Oiseau Haltères : 3×15 @ 4kg",
        "Superman : 3×40s",
        "Focus : 4 secondes de descente contrôlée"
      ],
      priorite: 1,
      lienSeance: "A",
      explicationDebutant: "Cette semaine on RALENTIT le tempo à 4 secondes de descente. Ça brûle plus, c'est normal ! Ce temps sous tension force tes muscles à travailler plus longtemps, ce qui améliore la connexion cerveau-muscle."
    },
    muscu_B: {
      id: "s2-muscu-b",
      type: "musculation_B" as SessionType,
      nom: "Pecs & Triceps (Tempo Lent)",
      description: "Tempo 4-1-1-0 - Connexion cerveau-muscle",
      duree: "50 min",
      details: [
        "Développé Couché : 4×8 @ 27.5kg (Tempo 4-1-1-0)",
        "Floor Press : 3×12 @ 8kg/main",
        "Focus : Sentir les pectoraux travailler"
      ],
      priorite: 1,
      lienSeance: "B",
      explicationDebutant: "Même principe : descente en 4 secondes, pause 1 seconde en bas. Tu dois SENTIR tes pectoraux travailler à chaque répétition."
    },
    muscu_C: {
      id: "s2-muscu-c",
      type: "musculation_C" as SessionType,
      nom: "Jambes & Core (Tempo Lent)",
      description: "Tempo 4-1-1-0",
      duree: "50 min",
      details: [
        "Front Squat : 4×10 @ 22.5kg (Tempo 4-1-1-0)",
        "Soulevé Terre JT : 3×12 @ 7kg/main",
        "Focus : Étirement des ischio-jambiers"
      ],
      priorite: 1,
      lienSeance: "C",
      explicationDebutant: "Le tempo lent sur les jambes est DIFFICILE. Tes cuisses vont brûler. C'est exactement ce qu'on cherche !"
    },
    cardio_frac: {
      id: "s2-cardio-frac",
      type: "cardio_fractionne" as SessionType,
      nom: "Fractionné 45/45",
      description: "Intervalles plus longs",
      duree: "30 min",
      details: [
        "Échauffement : 5 min",
        "8× (45s effort / 45s récup)",
        "Retour au calme : 5 min",
        "RPE Effort : 7-8/10"
      ],
      priorite: 1,
      explicationDebutant: "On passe à 45 secondes d'effort et 45 secondes de récupération. Les intervalles sont plus longs mais l'effort reste le même : tu dois être essoufflé mais pas au max.",
      commentFaire: [
        "1. Échauffe-toi 5 min en trottinant doucement",
        "2. Lance le chrono : 45s d'effort soutenu (RPE 7-8/10)",
        "3. 45s de récupération active (marche ou trot lent)",
        "4. Répète 8 fois",
        "5. 5 min de retour au calme"
      ],
      conseils: [
        "45s c'est plus long que 30s, donc pars un peu moins vite",
        "À la fin des 45s tu dois être essoufflé mais pas épuisé",
        "Utilise la récup pour vraiment récupérer, pas de fierté mal placée"
      ],
      erreurs: [
        "Partir au même rythme que le 30/30 (tu vas exploser)",
        "Écourter les récupérations"
      ]
    },
    cardio_zone2: {
      id: "s2-cardio-z2",
      type: "cardio_zone2" as SessionType,
      nom: "Zone 2 - 6.5km",
      description: "Allure Grand-Mère (très lent !)",
      duree: "45-50 min",
      details: [
        "Distance : 6.5 km",
        "Allure : 7:00-7:30/km",
        "Tu dois pouvoir parler facilement",
        "RPE : 5/10 - Ça doit sembler trop facile"
      ],
      priorite: 1,
      explicationDebutant: "On augmente la distance de 500m. L'allure reste la même : TRÈS LENTE. Tu dois pouvoir tenir une conversation entière sans t'essouffler. Si tu halètes, ralentis.",
      commentFaire: [
        "1. Prépare un parcours de 6.5km (ou 2 boucles de 3.25km)",
        "2. Pars DOUCEMENT, plus lent que tu ne le penses",
        "3. Vérifie : peux-tu chanter une chanson ? Si non, RALENTIS",
        "4. Rythme cible : 7:00 à 7:30 par km",
        "5. Finis la sortie sans être épuisé"
      ],
      conseils: [
        "Allure 'Grand-Mère' = tu pourrais parler à ta grand-mère sans qu'elle s'inquiète",
        "C'est normal d'avoir l'impression de ne pas progresser, c'est un investissement long terme"
      ]
    }
  },

  // Semaine 3 - Introduction surcharge
  S3: {
    muscu_A: {
      id: "s3-muscu-a",
      type: "musculation_A" as SessionType,
      nom: "Dos & Posture (+2.5kg)",
      description: "Première surcharge progressive",
      duree: "50 min",
      details: [
        "Rowing Barre : 4×10 @ 25kg (Tempo 3-0-1-0)",
        "Oiseau Haltères : 3×15 @ 4kg",
        "Superman : 3×45s",
        "🎯 +2.5kg sur le rowing vs S2"
      ],
      priorite: 1,
      lienSeance: "A",
      explicationDebutant: "PREMIÈRE SURCHARGE ! On ajoute 2.5kg sur les barres. Si tu as réussi la S2 avec le bon tempo, ton corps est prêt. Sinon, reste aux charges de la S2."
    },
    muscu_B: {
      id: "s3-muscu-b",
      type: "musculation_B" as SessionType,
      nom: "Pecs & Triceps (+2.5kg)",
      description: "Surcharge sur le développé",
      duree: "50 min",
      details: [
        "Développé Couché : 4×8 @ 30kg (Tempo 3-1-1-0)",
        "Floor Press : 3×12 @ 10kg/main",
        "🎯 +2.5kg sur le bench vs S2"
      ],
      priorite: 1,
      lienSeance: "B",
      explicationDebutant: "On monte à 30kg sur le développé couché. Si c'est trop dur pour finir les 8 reps avec le bon tempo, redescends à 27.5kg."
    },
    muscu_C: {
      id: "s3-muscu-c",
      type: "musculation_C" as SessionType,
      nom: "Jambes & Core (+2.5kg)",
      description: "Surcharge sur le squat",
      duree: "50 min",
      details: [
        "Front Squat : 4×10 @ 25kg (Tempo 3-1-1-0)",
        "Soulevé Terre JT : 3×12 @ 8kg/main",
        "🎯 +2.5kg sur le squat vs S2"
      ],
      priorite: 1,
      lienSeance: "C",
      explicationDebutant: "Le front squat passe à 25kg. Concentre-toi sur garder le buste VERTICAL et les coudes HAUTS."
    },
    cardio_seuil: {
      id: "s3-cardio-seuil",
      type: "cardio_seuil" as SessionType,
      nom: "Seuil - 2×2km",
      description: "Travail à l'allure cible du 9km",
      duree: "35 min",
      details: [
        "Échauffement : 10 min trot",
        "2km @ allure 9km (environ 5:30-6:00/km)",
        "Récup : 3 min marche",
        "2km @ allure 9km",
        "Retour au calme : 5 min"
      ],
      priorite: 1,
      explicationDebutant: "Le travail au SEUIL consiste à courir à l'allure que tu veux tenir le jour du 9km. C'est plus lent que le fractionné mais plus long. Tu apprends à ton corps à maintenir cette allure.",
      commentFaire: [
        "1. Échauffe-toi 10 min en trottinant (c'est plus long car l'effort est soutenu)",
        "2. Cours 2km à l'allure cible du 9km (environ 5:30-6:00/km)",
        "3. Marche 3 min pour récupérer",
        "4. Recommence : 2km à la même allure",
        "5. 5 min de retour au calme"
      ],
      conseils: [
        "L'allure seuil = tu peux dire 2-3 mots mais pas une phrase entière",
        "C'est INCONFORTABLE mais pas DOULOUREUX",
        "Utilise un parcours que tu connais pour mesurer les 2km",
        "Si tu n'as pas de montre GPS, cours 12-13 min par bloc"
      ],
      erreurs: [
        "Partir trop vite sur le premier 2km",
        "Ne pas respecter les 3 min de récup (c'est tentant de repartir direct)",
        "Oublier l'échauffement de 10 min (risque de blessure)"
      ]
    },
    cardio_zone2: {
      id: "s3-cardio-z2",
      type: "cardio_zone2" as SessionType,
      nom: "Zone 2 - 7.5km",
      description: "Progression distance",
      duree: "50-55 min",
      details: [
        "Distance : 7.5 km",
        "Allure : 7:00/km",
        "Objectif : Finir sans essoufflement",
        "Hydratation avant !"
      ],
      priorite: 1,
      explicationDebutant: "On monte à 7.5km ! L'allure reste LENTE. Cette sortie longue prépare ton corps et ton mental à courir plus de 30 minutes sans s'arrêter.",
      commentFaire: [
        "1. Bois bien avant de partir (pas juste avant, 1-2h avant)",
        "2. Prépare un parcours de 7.5km ou des boucles",
        "3. Pars LENTEMENT, tu dois pouvoir parler",
        "4. Objectif : finir sans être épuisé",
        "5. Si besoin, marche 1 min toutes les 15 min"
      ],
      conseils: [
        "Prends un gel ou des bonbons si tu as peur d'avoir faim",
        "Cette sortie est ta répétition mentale : tu te prouves que tu peux tenir longtemps"
      ]
    }
  },

  // Semaine 4 - Volume cumulé
  S4: {
    muscu_A: {
      id: "s4-muscu-a",
      type: "musculation_A" as SessionType,
      nom: "Dos & Posture (Volume+)",
      description: "+1 série sur chaque mouvement",
      duree: "55 min",
      details: [
        "Rowing Barre : 5×10 @ 25kg (Tempo 3-0-1-0)",
        "Oiseau Haltères : 4×15 @ 4kg",
        "Superman : 4×45s",
        "🎯 +1 série vs S3"
      ],
      priorite: 1
    },
    muscu_B: {
      id: "s4-muscu-b",
      type: "musculation_B" as SessionType,
      nom: "Pecs & Triceps (Volume+)",
      description: "+1 série sur chaque mouvement",
      duree: "55 min",
      details: [
        "Développé Couché : 5×8 @ 30kg",
        "Floor Press : 4×12 @ 10kg/main",
        "🎯 +1 série vs S3"
      ],
      priorite: 1
    },
    muscu_C: {
      id: "s4-muscu-c",
      type: "musculation_C" as SessionType,
      nom: "Jambes & Core (Volume+)",
      description: "+1 série sur chaque mouvement",
      duree: "55 min",
      details: [
        "Front Squat : 5×10 @ 25kg",
        "Soulevé Terre JT : 4×12 @ 8kg/main",
        "🎯 +1 série vs S3"
      ],
      priorite: 1
    },
    cardio_frac: {
      id: "s4-cardio-frac",
      type: "cardio_fractionne" as SessionType,
      nom: "Fractionné 1min/1min",
      description: "Intervalles longs - Dernier avant le 9km",
      duree: "35 min",
      details: [
        "Échauffement : 8 min",
        "6× (1min effort / 1min récup)",
        "Retour au calme : 8 min",
        "RPE Effort : 8/10"
      ],
      priorite: 1
    },
    cardio_zone2: {
      id: "s4-cardio-z2",
      type: "cardio_zone2" as SessionType,
      nom: "Zone 2 - 8km",
      description: "Dernière longue sortie avant le 9km",
      duree: "55-60 min",
      details: [
        "Distance : 8 km",
        "Allure : 6:45-7:00/km",
        "Aisance respiratoire totale",
        "C'est ta répétition générale !"
      ],
      priorite: 1
    }
  },

  // Semaine 5 - Peak Cardio / Taper (14 février = Vendredi)
  S5: {
    muscu_legere: {
      id: "s5-muscu-legere",
      type: "musculation_A" as SessionType,
      nom: "Maintien (Léger)",
      description: "Séance légère - Préservation avant le 9km",
      duree: "30 min",
      details: [
        "Rowing Barre : 3×8 @ 20kg (Tempo 2-0-1-0)",
        "Oiseau Haltères : 2×12 @ 3kg",
        "Superman : 2×30s",
        "⚠️ PAS de fatigue musculaire !"
      ],
      priorite: 2
    },
    course_9km: {
      id: "s5-course-9km",
      type: "course_9km" as SessionType,
      nom: "🏆 OBJECTIF 9KM",
      description: "14 FÉVRIER - LE JOUR J",
      duree: "50-55 min",
      details: [
        "Échauffement : 5 min marche + mobilité",
        "Départ LENT (premiers 2km = Zone 2)",
        "Km 3-7 : Allure stable, expiration forcée",
        "Km 8-9 : Maintiens, pas d'accélération !",
        "🎯 Focus : EXPIRATION pour éviter la nausée"
      ],
      priorite: 1
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BLOC 2 : "Hypertrophie & Force" (Semaines 6 à 10)
// ═══════════════════════════════════════════════════════════════════════════

const BLOC2_SESSIONS = {
  // Template pour les semaines 6-10
  muscu_A: {
    id: "b2-muscu-a",
    type: "musculation_A" as SessionType,
    nom: "Dos / Épaisseur",
    description: "Tempo 2-0-2-0 - Hypertrophie",
    duree: "60 min",
    details: [
      "Rowing Barre LOURD : 5×8 (Tempo 2-0-2-0)",
      "Oiseau Haltères : 4×12",
      "Rowing Haltère unilatéral : 3×12/côté",
      "Shrugs : 3×15"
    ],
    priorite: 1
  },
  muscu_B: {
    id: "b2-muscu-b",
    type: "musculation_B" as SessionType,
    nom: "Pecs / Largeur",
    description: "Tempo 2-0-2-0 - Hypertrophie",
    duree: "60 min",
    details: [
      "Développé Couché : 5×8 (Tempo 2-0-2-0)",
      "Écartés Haltères : 3×15",
      "Floor Press : 3×10",
      "Extensions triceps : 3×12"
    ],
    priorite: 1
  },
  muscu_C: {
    id: "b2-muscu-c",
    type: "musculation_C" as SessionType,
    nom: "Jambes / Core",
    description: "Tempo 2-0-2-0 + HIIT fin de séance",
    duree: "65 min",
    details: [
      "Front Squat : 5×8 (Tempo 2-0-2-0)",
      "Soulevé Terre Roumain : 4×10",
      "Fentes marchées : 3×20 pas",
      "HIIT 10min : 20s/10s Burpees/Squats"
    ],
    priorite: 1
  },
  cardio_maintenance: {
    id: "b2-cardio",
    type: "cardio_zone2" as SessionType,
    nom: "Maintenance Cardio",
    description: "Maintien capacité pulmonaire",
    duree: "40-45 min",
    details: [
      "Distance : 6-7 km",
      "Allure confortable",
      "Objectif : Récupération active"
    ],
    priorite: 2
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GÉNÉRATION DU PROGRAMME COMPLET
// ═══════════════════════════════════════════════════════════════════════════

export const PROGRAM_WEEKS: WeekProgram[] = [
  {
    semaine: 1,
    bloc: 1,
    theme: "Apprentissage Technique",
    focus: "Maîtrise des mouvements, charges modérées",
    sessions: [
      BLOC1_SESSIONS.S1.muscu_A,
      BLOC1_SESSIONS.S1.muscu_B,
      BLOC1_SESSIONS.S1.muscu_C,
      BLOC1_SESSIONS.S1.cardio_frac,
      BLOC1_SESSIONS.S1.cardio_zone2
    ]
  },
  {
    semaine: 2,
    bloc: 1,
    theme: "Fixation Posturale",
    focus: "Tempo lent 4-0-1-0, temps sous tension",
    sessions: [
      BLOC1_SESSIONS.S2.muscu_A,
      BLOC1_SESSIONS.S2.muscu_B,
      BLOC1_SESSIONS.S2.muscu_C,
      BLOC1_SESSIONS.S2.cardio_frac,
      BLOC1_SESSIONS.S2.cardio_zone2
    ]
  },
  {
    semaine: 3,
    bloc: 1,
    theme: "Introduction Surcharge",
    focus: "+2.5kg sur les Big 3, travail au seuil",
    sessions: [
      BLOC1_SESSIONS.S3.muscu_A,
      BLOC1_SESSIONS.S3.muscu_B,
      BLOC1_SESSIONS.S3.muscu_C,
      BLOC1_SESSIONS.S3.cardio_seuil,
      BLOC1_SESSIONS.S3.cardio_zone2
    ]
  },
  {
    semaine: 4,
    bloc: 1,
    theme: "Volume Cumulé",
    focus: "+1 série par mouvement, 8km Zone 2",
    sessions: [
      BLOC1_SESSIONS.S4.muscu_A,
      BLOC1_SESSIONS.S4.muscu_B,
      BLOC1_SESSIONS.S4.muscu_C,
      BLOC1_SESSIONS.S4.cardio_frac,
      BLOC1_SESSIONS.S4.cardio_zone2
    ]
  },
  {
    semaine: 5,
    bloc: 1,
    theme: "🏆 Peak Cardio - Objectif 9km",
    focus: "Taper muscu, focus total sur le 14 février",
    sessions: [
      BLOC1_SESSIONS.S5.muscu_legere,
      BLOC1_SESSIONS.S5.course_9km
    ]
  },
  // Semaines 6-10 : Bloc 2
  {
    semaine: 6,
    bloc: 2,
    theme: "Hypertrophie - Reprise",
    focus: "Nouveau tempo 2-0-2-0, charges progressives",
    sessions: [
      { ...BLOC2_SESSIONS.muscu_A, id: "s6-muscu-a" },
      { ...BLOC2_SESSIONS.muscu_B, id: "s6-muscu-b" },
      { ...BLOC2_SESSIONS.muscu_C, id: "s6-muscu-c" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s6-cardio-1" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s6-cardio-2", nom: "Maintenance Cardio 2" }
    ]
  },
  {
    semaine: 7,
    bloc: 2,
    theme: "Hypertrophie - Progression",
    focus: "+2.5kg sur les mouvements principaux",
    sessions: [
      { ...BLOC2_SESSIONS.muscu_A, id: "s7-muscu-a" },
      { ...BLOC2_SESSIONS.muscu_B, id: "s7-muscu-b" },
      { ...BLOC2_SESSIONS.muscu_C, id: "s7-muscu-c" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s7-cardio-1" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s7-cardio-2", nom: "Maintenance Cardio 2" }
    ]
  },
  {
    semaine: 8,
    bloc: 2,
    theme: "Force Athlétique",
    focus: "Charges lourdes, moins de reps",
    sessions: [
      { ...BLOC2_SESSIONS.muscu_A, id: "s8-muscu-a" },
      { ...BLOC2_SESSIONS.muscu_B, id: "s8-muscu-b" },
      { ...BLOC2_SESSIONS.muscu_C, id: "s8-muscu-c" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s8-cardio-1" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s8-cardio-2", nom: "Maintenance Cardio 2" }
    ]
  },
  {
    semaine: 9,
    bloc: 2,
    theme: "Peak Volume",
    focus: "Volume maximum avant deload",
    sessions: [
      { ...BLOC2_SESSIONS.muscu_A, id: "s9-muscu-a" },
      { ...BLOC2_SESSIONS.muscu_B, id: "s9-muscu-b" },
      { ...BLOC2_SESSIONS.muscu_C, id: "s9-muscu-c" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s9-cardio-1" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s9-cardio-2", nom: "Maintenance Cardio 2" }
    ]
  },
  {
    semaine: 10,
    bloc: 2,
    theme: "Deload & Évaluation",
    focus: "Récupération, test de force",
    sessions: [
      { ...BLOC2_SESSIONS.muscu_A, id: "s10-muscu-a", description: "Volume réduit -40%" },
      { ...BLOC2_SESSIONS.muscu_B, id: "s10-muscu-b", description: "Volume réduit -40%" },
      { ...BLOC2_SESSIONS.muscu_C, id: "s10-muscu-c", description: "Volume réduit -40%" },
      { ...BLOC2_SESSIONS.cardio_maintenance, id: "s10-cardio-1" }
    ]
  }
];

export function getWeekProgram(weekNumber: number): WeekProgram | undefined {
  return PROGRAM_WEEKS.find(w => w.semaine === weekNumber);
}
