type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let pending: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

// Capture the event at startup, before the lazy Settings screen is opened.
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  pending = event as InstallPrompt;
  emit();
});
window.addEventListener("appinstalled", () => {
  pending = null;
  emit();
});

export const canInstall = () => pending !== null;
export function subscribeInstall(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export async function installApp() {
  const prompt = pending;
  if (!prompt) return "unavailable";
  pending = null;
  emit();
  await prompt.prompt();
  return (await prompt.userChoice).outcome;
}
