export const categories = [
  "Create",
  "Explore",
  "Play",
  "Learn",
  "Social",
  "Chill",
] as const;
export type Category = (typeof categories)[number];
export type Energy = "low" | "medium" | "high";
export type Difficulty = "easy" | "medium" | "hard" | "epic";
export interface Quest {
  id: string;
  title: string;
  description: string;
  category: Category;
  subcategory: string;
  duration: number;
  difficulty: Difficulty;
  energy: Energy;
  locationTypes: string[];
  participants: string[];
  budget: string;
  requirements: string[];
  steps: string[];
  xp: number;
  tags: string[];
  coverImage: string;
  safetyNote?: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
}
export interface Preferences {
  typicalDuration: number;
  difficulty: string;
  budget: string;
  energy: string;
}
export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  xp: number;
  level: number;
  interests: string[];
  preferences: Preferences;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  status: "viewed" | "saved" | "active" | "completed" | "skipped" | "abandoned";
  completedSteps: number[];
  startedAt?: string;
  completedAt?: string;
  surprise: boolean;
}
export interface Memory {
  id: string;
  userId: string;
  questId: string;
  title: string;
  note: string;
  images: string[];
  rating: number;
  location: { name: string };
  completedAt: string;
  createdAt: string;
}
export interface SafetyReport {
  id: string;
  userId: string;
  questId: string;
  reason: string;
  createdAt: string;
}
export interface AppData {
  version: 1;
  profile: UserProfile;
  progress: Record<string, UserQuest>;
  favorites: string[];
  memories: Memory[];
  reports: SafetyReport[];
}
export interface QuestFilters {
  category?: string;
  duration?: number;
  location?: string;
  energy?: string;
  participants?: string;
  budget?: string;
  difficulty?: string;
  equipment?: string;
  search?: string;
}
export interface QuestContext extends QuestFilters {
  mood?: string;
  interests?: string[];
  recentIds?: string[];
  excludeIds?: string[];
}
export interface QuestPack {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
  questIds: string[];
}
