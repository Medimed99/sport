"use client";

import { TempoPhase } from "@/lib/types";
import styles from "./TempoEngine.module.css";

interface TempoVisualProps {
  currentPhase: TempoPhase | null;
  countdown: number;
  isActive: boolean;
  repCount: number;
}

export function TempoVisual({ currentPhase, countdown, isActive, repCount }: TempoVisualProps) {
  // Couleur selon la phase
  const getPhaseColor = () => {
    if (!currentPhase) return "var(--text-muted)";
    switch (currentPhase.name) {
      case "excentrique":
        return "var(--phase-excentrique)";
      case "concentrique":
        return "var(--phase-concentrique)";
      case "pause_bas":
      case "pause_haut":
        return "var(--phase-pause)";
      default:
        return "var(--accent-primary)";
    }
  };

  // Calcul du pourcentage pour l'animation circulaire
  const progress = currentPhase 
    ? ((currentPhase.duration - countdown) / currentPhase.duration) * 100 
    : 0;

  // Circonférence du cercle (rayon 130px)
  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.tempoContainer}>
      {/* Cercle de progression */}
      <div className={`tempo-ring ${isActive ? "active" : ""}`}>
        <svg 
          width="280" 
          height="280" 
          style={{ position: "absolute", transform: "rotate(-90deg)" }}
        >
          {/* Cercle de fond */}
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="8"
          />
          {/* Cercle de progression */}
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke={getPhaseColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isActive ? strokeDashoffset : circumference}
            style={{ 
              transition: isActive ? "stroke-dashoffset 0.1s linear" : "none",
              filter: `drop-shadow(0 0 10px ${getPhaseColor()})`
            }}
          />
        </svg>

        {/* Contenu central */}
        <div className={styles.tempoContent}>
          {isActive ? (
            <>
              <div 
                className="tempo-display"
                style={{ color: getPhaseColor() }}
              >
                {countdown}
              </div>
              <div className="tempo-phase">
                {currentPhase?.label || "—"}
              </div>
            </>
          ) : (
            <>
              <div className={styles.repDisplay}>
                <span className="mono" style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
                  REP
                </span>
                <span 
                  className="mono" 
                  style={{ 
                    fontSize: "4rem", 
                    fontWeight: 700, 
                    color: repCount > 0 ? "var(--accent-secondary)" : "var(--text-muted)" 
                  }}
                >
                  {repCount}
                </span>
              </div>
              <div className="tempo-phase">
                Prêt
              </div>
            </>
          )}
        </div>
      </div>

      {/* Indicateur de répétition sous le cercle */}
      {isActive && (
        <div className={styles.repIndicator}>
          <span className="mono text-secondary">Rep {repCount + 1}</span>
        </div>
      )}
    </div>
  );
}
