"use client";

import { useRouter } from "next/navigation";
import { NotificationSettings } from "@/components/NotificationSettings";
import styles from "./page.module.css";

export default function ParametresPage() {
  const router = useRouter();

  return (
    <div className="page container">
      {/* Header */}
      <header className={styles.header}>
        <button className="header-back" onClick={() => router.push("/")}>
          ←
        </button>
        <div>
          <h1>Paramètres</h1>
          <p className="text-secondary">Personnalise ton expérience</p>
        </div>
      </header>

      <div className={styles.content}>
        {/* Section Notifications */}
        <section className={styles.section}>
          <NotificationSettings />
        </section>

        {/* Section Infos */}
        <section className={styles.section}>
          <div className={styles.infoCard}>
            <h3>ℹ️ À propos</h3>
            <div className={styles.infoRow}>
              <span>Version</span>
              <span className="mono">1.0.0</span>
            </div>
            <div className={styles.infoRow}>
              <span>Objectif</span>
              <span>9km le 14 février 2026</span>
            </div>
          </div>
        </section>

        {/* Section Données */}
        <section className={styles.section}>
          <div className={styles.dangerCard}>
            <h3>⚠️ Données</h3>
            <p className="text-secondary">
              Tes données sont stockées localement et sur Firebase.
            </p>
            <button className="btn btn-ghost" style={{ marginTop: "var(--space-md)" }}>
              Exporter mes données
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
