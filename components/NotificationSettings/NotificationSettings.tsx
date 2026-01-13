"use client";

import React, { useState, useEffect } from "react";
import {
  isNotificationSupported,
  isNotificationPermissionGranted,
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  showNotification,
  type NotificationSettings as NotifSettings,
} from "@/lib/notifications";
import styles from "./NotificationSettings.module.css";

const DAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
];

export function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [permitted, setPermitted] = useState(false);
  const [settings, setSettings] = useState<NotifSettings>({
    enabled: false,
    reminderTime: "18:00",
    reminderDays: [1, 2, 4, 5, 6],
  });
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setSupported(isNotificationSupported());
    setPermitted(isNotificationPermissionGranted());
    setSettings(getNotificationSettings());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermitted(granted);
    
    if (granted) {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...settings, reminderTime: e.target.value };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleDayToggle = (day: number) => {
    const newDays = settings.reminderDays.includes(day)
      ? settings.reminderDays.filter((d) => d !== day)
      : [...settings.reminderDays, day];
    
    const newSettings = { ...settings, reminderDays: newDays };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTestNotification = async () => {
    await showNotification(
      "Test de notification 🔔",
      "Les notifications fonctionnent parfaitement !",
      { tag: "test" }
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  if (!supported) {
    return (
      <div className={styles.container}>
        <div className={styles.notSupported}>
          <span className={styles.icon}>🔕</span>
          <p>Les notifications ne sont pas supportées sur ce navigateur.</p>
          <p className="text-muted">Essaie avec Chrome ou Safari sur mobile.</p>
        </div>
      </div>
    );
  }

  if (!permitted) {
    return (
      <div className={styles.container}>
        <div className={styles.permissionRequest}>
          <span className={styles.icon}>🔔</span>
          <h3>Activer les rappels</h3>
          <p className="text-secondary">
            Reçois un rappel quotidien pour ne jamais manquer une séance.
          </p>
          <button className="btn btn-primary" onClick={handleEnableNotifications}>
            Activer les notifications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>🔔</span>
        <h3>Rappels</h3>
      </div>

      {/* Toggle principal */}
      <div className={styles.setting}>
        <div className={styles.settingInfo}>
          <span className={styles.settingLabel}>Rappels quotidiens</span>
          <span className={styles.settingDesc}>
            {settings.enabled ? "Activés" : "Désactivés"}
          </span>
        </div>
        <button
          className={`${styles.toggle} ${settings.enabled ? styles.toggleOn : ""}`}
          onClick={() => handleToggleEnabled(!settings.enabled)}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Heure de rappel */}
          <div className={styles.setting}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Heure du rappel</span>
            </div>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={handleTimeChange}
              className={styles.timeInput}
            />
          </div>

          {/* Jours de rappel */}
          <div className={styles.daysSection}>
            <span className={styles.settingLabel}>Jours de rappel</span>
            <div className={styles.daysGrid}>
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  className={`${styles.dayBtn} ${
                    settings.reminderDays.includes(day.value) ? styles.dayActive : ""
                  }`}
                  onClick={() => handleDayToggle(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test notification */}
          <button
            className={`btn btn-ghost w-full ${styles.testBtn}`}
            onClick={handleTestNotification}
            disabled={testSent}
          >
            {testSent ? "✓ Notification envoyée !" : "🔔 Tester les notifications"}
          </button>
        </>
      )}
    </div>
  );
}
