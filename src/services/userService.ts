import type { AppData, Quest, UserProfile } from "../types";
export function createData(
  id = "guest",
  name = "Explorer",
  email?: string,
): AppData {
  const now = new Date().toISOString();
  return {
    version: 1,
    profile: {
      id,
      displayName: name,
      ...(email ? { email } : {}),
      xp: 0,
      level: 1,
      interests: [],
      preferences: {
        typicalDuration: 30,
        difficulty: "",
        budget: "free",
        energy: "",
      },
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    },
    progress: {},
    favorites: [],
    memories: [],
    reports: [],
  };
}
export function levelName(level: number) {
  return level >= 50
    ? "SideQuest Master"
    : level >= 30
      ? "Story Collector"
      : level >= 20
        ? "Adventurer"
        : level >= 10
          ? "Explorer"
          : level >= 5
            ? "Wanderer"
            : "Curious Human";
}
export function completeQuest(
  data: AppData,
  quest: Quest,
  now = new Date().toISOString(),
): AppData {
  const current = data.progress[quest.id];
  if (
    !current ||
    current.status !== "active" ||
    current.completedSteps.length !== quest.steps.length ||
    !quest.steps.every((_, index) => current.completedSteps.includes(index))
  )
    return data;
  const xp = data.profile.xp + quest.xp;
  return {
    ...data,
    profile: {
      ...data.profile,
      xp,
      level: Math.floor(xp / 200) + 1,
      updatedAt: now,
    },
    progress: {
      ...data.progress,
      [quest.id]: { ...current, status: "completed", completedAt: now },
    },
  };
}
export function updateProfile(
  data: AppData,
  updates: Partial<UserProfile>,
): AppData {
  return {
    ...data,
    profile: {
      ...data.profile,
      ...updates,
      id: data.profile.id,
      updatedAt: new Date().toISOString(),
    },
  };
}
