import { createData } from "./userService";
import type { AppData } from "../types";

// Keep the original key so existing personal journals survive this update.
const key = "sidequest:v1:guest";

export function loadLocal(): AppData {
  const raw = localStorage.getItem(key);
  if (!raw) return createData();
  try {
    const data = JSON.parse(raw) as AppData;
    if (
      data.version !== 1 ||
      data.profile.id !== "guest" ||
      !data.progress ||
      !Array.isArray(data.memories) ||
      !Array.isArray(data.favorites)
    )
      throw new Error("Invalid saved data");
    return { ...data, reports: data.reports || [] };
  } catch {
    throw new Error(
      "Your saved journal could not be read. Please export or back up this browser’s site data before resetting it.",
    );
  }
}

export function saveLocal(data: AppData) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    throw new Error(
      "This browser could not save your progress. Free some browser storage and try again.",
    );
  }
}
