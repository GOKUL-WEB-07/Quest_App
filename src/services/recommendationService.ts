import type { Quest, QuestContext, QuestFilters } from "../types";
export const moodCategories: Record<string, string> = {
  Creative: "Create",
  Adventurous: "Explore",
  Relaxed: "Chill",
  Curious: "Learn",
  Social: "Social",
  Energetic: "Play",
};
export function filterQuests(quests: Quest[], f: QuestFilters): Quest[] {
  return quests.filter(
    (q) =>
      q.status === "published" &&
      (!f.category || q.category.toLowerCase() === f.category.toLowerCase()) &&
      (!f.duration || q.duration <= f.duration) &&
      (!f.location ||
        f.location === "Anywhere" ||
        q.locationTypes.includes(f.location)) &&
      (!f.energy || q.energy === f.energy) &&
      (!f.participants || q.participants.includes(f.participants)) &&
      (!f.budget || q.budget === f.budget) &&
      (!f.difficulty || q.difficulty === f.difficulty) &&
      (!f.equipment || f.equipment !== "none" || q.requirements.length === 0) &&
      (!f.search?.trim() ||
        `${q.title} ${q.description} ${q.tags.join(" ")}`
          .toLowerCase()
          .includes(f.search.trim().toLowerCase())),
  );
}
export function recommend(
  quests: Quest[],
  context: QuestContext,
  random = Math.random,
): Quest | null {
  const recent = new Set(context.recentIds || []);
  const recentCategoryCount = quests.reduce<Record<string, number>>(
    (count, quest) => {
      if (recent.has(quest.id))
        count[quest.category] = (count[quest.category] || 0) + 1;
      return count;
    },
    {},
  );
  const eligible = filterQuests(quests, context).filter(
    (q) => !recent.has(q.id) && !context.excludeIds?.includes(q.id),
  );
  const scored = eligible
    .map((q) => ({
      q,
      score:
        (moodCategories[context.mood || ""] === q.category ? 30 : 0) +
        (context.duration
          ? 20 * Math.min(q.duration / context.duration, 1)
          : 10) +
        (context.location && q.locationTypes.includes(context.location)
          ? 15
          : 0) +
        (context.interests?.some((i) => q.tags.includes(i.toLowerCase()))
          ? 15
          : 0) +
        (context.energy === q.energy ? 10 : 0) +
        10 / (1 + (recentCategoryCount[q.category] || 0)),
    }))
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  const top = scored.filter((s) => s.score >= scored[0].score - 15).slice(0, 5);
  return top[Math.min(top.length - 1, Math.floor(random() * top.length))].q;
}
