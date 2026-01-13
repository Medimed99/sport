# Architecture & Armure 🏛️

**Application de transformation physique sur 12 mois**

Une PWA minimaliste conçue pour guider JP dans son programme de musculation et de cardio, avec un focus particulier sur la biomécanique et la sécurité vertébrale.

## 🎯 Fonctionnalités

### Moteur de Tempo
- Guide visuel avec anneau de progression animé
- Bips audio rythmiques via Web Audio API
- Support de tous les tempos (3-0-1-0, 2-1-1-0, etc.)
- Compteur de répétitions automatique

### Calculateur de Volume
- Suivi du tonnage par série, exercice et séance
- Suggestion automatique de charge pour la surcharge progressive
- Historique des performances

### Module Cardio "Opération 9km"
- Mode Intervalles 30/30 avec alternance effort/repos
- Mode Zone 2 pour l'endurance de base
- RPE Gastrique post-séance pour tracker la nausée
- Rappels de respiration

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Base de données** : Firebase Firestore
- **Audio** : Web Audio API native
- **Style** : CSS Modules + Variables CSS
- **PWA** : Manifest + installation mobile

## 🚀 Installation

\`\`\`bash
# Cloner le projet
cd sport

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local
# Remplir avec vos valeurs Firebase

# Lancer le serveur de développement
npm run dev
\`\`\`

## 📱 Utilisation

1. Ouvrir http://localhost:3000
2. Sur mobile : ajouter à l'écran d'accueil pour l'expérience PWA
3. Choisir une séance (A, B ou C)
4. Suivre le tempo pour chaque exercice
5. Logger les séries et observer le tonnage

## 🏋️ Programme Mois 1

### Séance A - Dos & Posture
- Rowing Barre buste penché (4×10, tempo 3-0-1-0)
- Oiseau Haltères (3×15, tempo 2-1-1-0)
- Superman / Gainage (3×45s)

### Séance B - Pecs & Triceps
- Développé Couché (4×8, tempo 3-1-1-0)
- Floor Press Haltères (3×12)

### Séance C - Jambes & Lombaires
- Front Squat (4×10, tempo 3-1-1-0)
- Soulevé de terre jambes tendues (3×12)

### Cardio (2×/semaine)
- 1 séance d'intervalles 30/30
- 1 séance Zone 2 (35 min)

## 🎨 Design "Forge"

Esthétique inspirée de l'acier brut et du métal chauffé :
- Noir charbon (#0a0a0b)
- Orange forge (#e85d04)
- Ambre chaud (#f48c06)

## 📜 Règles d'Or

1. **La Technique est la Loi** : Pas d'augmentation de poids si le tempo n'est pas parfait
2. **Anti-Nausée** : Privilégier la Zone 2 avant de chercher la vitesse
3. **Sécurité Rack** : Toujours utiliser les barres de sécurité
4. **Pas de Sprint Final** : Éviter les accélérations brutales en fin de course

---

*Projet Architecture & Armure — Transformation en cours* 🔥
