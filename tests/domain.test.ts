import { describe, expect, it } from "vitest";
import { quests } from "../src/features/quests/catalog";
import { filterQuests, recommend } from "../src/services/recommendationService";
import { completeQuest, createData } from "../src/services/userService";
import { achievements } from "../src/services/achievementService";
import {
  learningQuests,
  learningTopics,
  learningMatches,
} from "../src/features/quests/learning";
describe("Timed learning", () => {
  it("offers 30 distinct lessons with five tasks per topic", () => {
    expect(learningQuests).toHaveLength(30);
    expect(new Set(learningQuests.map((q) => q.title)).size).toBe(30);
    for (const topic of learningTopics)
      expect(
        learningQuests.filter((q) => q.subcategory === topic),
      ).toHaveLength(5);
    for (const q of learningQuests) {
      const minutes = q.steps.reduce(
        (sum, step) => sum + Number(step.match(/(\d+) min/)?.[1]),
        0,
      );
      expect(minutes).toBe(q.duration);
      expect(quests.some((item) => item.id === q.id)).toBe(true);
    }
  });
  it("respects topic, available time, and completed work", () => {
    const matches = learningMatches("Coding", 15, ["learning-1"]);
    expect(matches.map((q) => q.id)).toEqual(["learning-2", "learning-3"]);
    expect(learningMatches("Science", 4, [])).toHaveLength(0);
    expect(
      learningMatches(
        "",
        30,
        learningQuests.map((q) => q.id),
      ),
    ).toHaveLength(0);
  });
});
describe("Published catalog", () => {
  it("contains 30+ usable, distinct quests across every category", () => {
    expect(quests.length).toBeGreaterThanOrEqual(30);
    expect(new Set(quests.map((q) => q.id)).size).toBe(quests.length);
    expect(new Set(quests.map((q) => q.category)).size).toBe(6);
    quests.forEach((q) => {
      expect(q.steps.length).toBeGreaterThan(2);
      expect(q.xp).toBeGreaterThan(0);
      expect(q.status).toBe("published");
    });
  });
});
describe("Recommendations and discovery", () => {
  it("respects time, place, energy, participants, and equipment together", () => {
    const result = filterQuests(quests, {
      duration: 5,
      location: "Home",
      energy: "low",
      participants: "solo",
      equipment: "none",
    });
    expect(result.map((q) => q.id)).toEqual(["window-watch"]);
  });
  it("matches trimmed case-insensitive text", () => {
    expect(
      filterQuests(quests, { search: "  SHADOW  " }).some(
        (q) => q.id === "shadow-hunter",
      ),
    ).toBe(true);
  });
  it("does not silently relax incompatible filters", () => {
    expect(
      recommend(quests, {
        duration: 5,
        category: "Social",
        participants: "solo",
      }),
    ).toBeNull();
  });
  it("removes recent and excluded quests", () => {
    const eligible = quests.slice(0, 3);
    expect(
      recommend(eligible, {
        recentIds: [eligible[0].id],
        excludeIds: [eligible[1].id],
      }),
    ).toEqual(eligible[2]);
  });
  it("returns null when every quest was completed", () => {
    expect(
      recommend(quests, { recentIds: quests.map((q) => q.id) }),
    ).toBeNull();
  });
  it("randomizes among strong matches", () => {
    const a = recommend(quests, { mood: "Creative" }, () => 0),
      b = recommend(quests, { mood: "Creative" }, () => 0.999);
    expect(a?.category).toBe("Create");
    expect(b?.category).toBe("Create");
    expect(a?.id).not.toBe(b?.id);
  });
  it("weights an unvisited category above a familiar one when other context is equal", () => {
    const recent = { ...quests[0], id: "recent-explore" };
    const explore = { ...quests[0], id: "new-explore" };
    const create = {
      ...quests[0],
      id: "new-create",
      category: "Create" as const,
    };
    expect(
      recommend([recent, explore, create], { recentIds: [recent.id] }, () => 0)
        ?.id,
    ).toBe(create.id);
  });
  it("filters difficulty and budget", () => {
    expect(
      filterQuests(quests, { difficulty: "epic", budget: "free" }).map(
        (q) => q.id,
      ),
    ).toEqual(["local-tourist"]);
  });
});
describe("Completion integrity", () => {
  const quest = quests[0];
  function active() {
    const d = createData();
    d.progress[quest.id] = {
      id: "guest_shadow-hunter",
      userId: "guest",
      questId: quest.id,
      status: "active",
      completedSteps: quest.steps.map((_, i) => i),
      surprise: true,
      startedAt: "2026-09-26T10:00:00Z",
    };
    return d;
  }
  it("awards XP once and unlocks first-step achievement", () => {
    const d = completeQuest(active(), quest, "2026-09-26T11:00:00Z");
    expect(d.profile.xp).toBe(40);
    expect(d.progress[quest.id].status).toBe("completed");
    expect(completeQuest(d, quest)).toBe(d);
    expect(achievements(d, quests)[0].count).toBe(1);
  });
  it("does not complete an incomplete checklist or abandoned quest", () => {
    const d = active();
    d.progress[quest.id].completedSteps = [0];
    expect(completeQuest(d, quest)).toBe(d);
    d.progress[quest.id].status = "abandoned";
    expect(completeQuest(d, quest)).toBe(d);
  });
  it("levels up at the XP boundary", () => {
    const d = active();
    d.profile.xp = 180;
    const result = completeQuest(d, quest);
    expect(result.profile.xp).toBe(220);
    expect(result.profile.level).toBe(2);
  });
  it("isolates user progress from the master quest", () => {
    const before = JSON.stringify(quest);
    completeQuest(active(), quest);
    expect(JSON.stringify(quest)).toBe(before);
  });
});
