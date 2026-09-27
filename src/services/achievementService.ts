import type { AppData, Quest } from "../types";
export function achievements(data: AppData, quests: Quest[]) {
  const done = Object.values(data.progress).filter(
    (p) => p.status === "completed",
  );
  const category = (name: string) =>
    done.filter(
      (p) => quests.find((q) => q.id === p.questId)?.category === name,
    ).length;
  return [
    {
      id: "first",
      title: "First step",
      description: "Complete your first SideQuest",
      count: done.length,
      target: 1,
      icon: "footprints",
    },
    {
      id: "grass",
      title: "Touch grass",
      description: "Complete 10 outdoor quests",
      count: done.filter((p) =>
        quests
          .find((q) => q.id === p.questId)
          ?.locationTypes.includes("Outside"),
      ).length,
      target: 10,
      icon: "leaf",
    },
    {
      id: "maker",
      title: "Maker",
      description: "Complete 20 creative quests",
      count: category("Create"),
      target: 20,
      icon: "palette",
    },
    {
      id: "explorer",
      title: "Explorer",
      description: "Collect memories from 10 named places",
      count: new Set(
        data.memories
          .map((m) => m.location.name.trim().toLowerCase())
          .filter(Boolean),
      ).size,
      target: 10,
      icon: "compass",
    },
    {
      id: "social",
      title: "Social butterfly",
      description: "Complete 10 social quests",
      count: category("Social"),
      target: 10,
      icon: "people",
    },
    {
      id: "chaos",
      title: "Chaos enjoyer",
      description: "Complete 10 Surprise me quests",
      count: done.filter((p) => p.surprise).length,
      target: 10,
      icon: "sparkles",
    },
    {
      id: "weekend",
      title: "Weekend wanderer",
      description: "Complete 5 weekend quests",
      count: done.filter((p) =>
        [0, 6].includes(new Date(p.completedAt!).getDay()),
      ).length,
      target: 5,
      icon: "sun",
    },
  ];
}
