// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PWA
// Système de rappels pour les séances d'entraînement
// ═══════════════════════════════════════════════════════════════════════════

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // Format HH:MM
  reminderDays: number[]; // 0 = Dimanche, 1 = Lundi, etc.
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderTime: "18:00",
  reminderDays: [1, 2, 4, 5, 6], // Lundi, Mardi, Jeudi, Vendredi, Samedi
};

// Vérifier si les notifications sont supportées
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

// Demander la permission pour les notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log("Les notifications ne sont pas supportées sur ce navigateur");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Erreur lors de la demande de permission:", error);
    return false;
  }
}

// Vérifier si les notifications sont autorisées
export function isNotificationPermissionGranted(): boolean {
  if (!isNotificationSupported()) return false;
  return Notification.permission === "granted";
}

// Récupérer les paramètres de notification
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  
  const stored = localStorage.getItem("notification_settings");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

// Sauvegarder les paramètres de notification
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("notification_settings", JSON.stringify(settings));
  
  // Reprogrammer les notifications si activées
  if (settings.enabled) {
    scheduleNotifications(settings);
  } else {
    cancelAllNotifications();
  }
}

// Afficher une notification immédiate
export async function showNotification(
  title: string,
  body: string,
  options?: { icon?: string; tag?: string; data?: any }
): Promise<void> {
  if (!isNotificationPermissionGranted()) {
    console.log("Permission de notification non accordée");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: options?.icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: options?.tag || "workout-reminder",
      data: options?.data,
      vibrate: [200, 100, 200],
      requireInteraction: false,
    });
  } catch (error) {
    // Fallback vers notification simple si service worker non disponible
    new Notification(title, {
      body,
      icon: options?.icon || "/icons/icon-192.png",
    });
  }
}

// Programmer les notifications quotidiennes
export async function scheduleNotifications(settings: NotificationSettings): Promise<void> {
  if (!settings.enabled || !isNotificationPermissionGranted()) return;

  // Note: Les vraies notifications programmées nécessitent un service worker
  // Pour une implémentation simple, on stocke les paramètres et on vérifie périodiquement
  
  // Stocker l'heure de rappel pour vérification côté client
  localStorage.setItem("next_reminder_check", new Date().toISOString());
}

// Annuler toutes les notifications programmées
export function cancelAllNotifications(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("next_reminder_check");
}

// Vérifier si c'est l'heure d'envoyer un rappel
export function shouldSendReminder(settings: NotificationSettings): boolean {
  if (!settings.enabled) return false;
  
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  
  // Vérifier si c'est un jour de rappel
  if (!settings.reminderDays.includes(currentDay)) return false;
  
  // Vérifier si c'est l'heure du rappel (avec une marge de 5 minutes)
  const [reminderHour, reminderMinute] = settings.reminderTime.split(":").map(Number);
  const reminderDate = new Date();
  reminderDate.setHours(reminderHour, reminderMinute, 0, 0);
  
  const diff = Math.abs(now.getTime() - reminderDate.getTime());
  const isWithinWindow = diff < 5 * 60 * 1000; // 5 minutes
  
  // Vérifier qu'on n'a pas déjà envoyé un rappel aujourd'hui
  const lastReminder = localStorage.getItem("last_reminder_date");
  const today = now.toISOString().split("T")[0];
  
  if (lastReminder === today) return false;
  
  return isWithinWindow;
}

// Envoyer le rappel quotidien
export async function sendDailyReminder(): Promise<void> {
  const settings = getNotificationSettings();
  
  if (!shouldSendReminder(settings)) return;
  
  // Marquer le rappel comme envoyé
  localStorage.setItem("last_reminder_date", new Date().toISOString().split("T")[0]);
  
  // Messages de motivation aléatoires
  const messages = [
    "C'est l'heure de ta séance ! 💪 Ton corps t'attend.",
    "Rappel : Ta séance d'aujourd'hui t'attend ! Chaque rep compte 🔥",
    "Hey ! N'oublie pas ton entraînement. Tu es à J-X du 9km ! 🏆",
    "C'est le moment de forger ton armure ! 🛡️ Go séance !",
    "Ton futur toi te remerciera. C'est parti pour la séance ! 💪",
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  await showNotification("Architecture & Armure", randomMessage, {
    tag: "daily-reminder",
    data: { action: "open-calendar" },
  });
}

// Envoyer une notification de félicitations
export async function sendCongratulationsNotification(
  type: "workout" | "milestone" | "streak",
  details: string
): Promise<void> {
  if (!isNotificationPermissionGranted()) return;
  
  const titles: Record<string, string> = {
    workout: "Séance terminée ! 🎉",
    milestone: "Nouveau milestone ! 🏆",
    streak: "Streak en feu ! 🔥",
  };
  
  await showNotification(titles[type], details);
}

// Hook pour vérifier périodiquement les rappels (à appeler dans un useEffect)
export function startReminderCheck(): () => void {
  if (typeof window === "undefined") return () => {};
  
  // Vérifier toutes les minutes
  const interval = setInterval(() => {
    sendDailyReminder();
  }, 60 * 1000);
  
  // Vérifier immédiatement aussi
  sendDailyReminder();
  
  return () => clearInterval(interval);
}
