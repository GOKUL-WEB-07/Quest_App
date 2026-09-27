import { Link } from "react-router-dom";
import type { Quest, QuestPack } from "../../types";
import { useApp } from "../../stores/AppProvider";
import { CoverImage, Icon } from "../ui";
import { track } from "../../services/analyticsService";
export const categoryIcons: Record<string, string> = {
  Create: "palette",
  Explore: "compass",
  Play: "dice",
  Learn: "idea",
  Social: "people",
  Chill: "leaf",
};
export function SaveButton({ quest }: { quest: Quest }) {
  const { data, mutate, notify } = useApp();
  const saved = data.favorites.includes(quest.id);
  return (
    <button
      className={`save-button ${saved ? "is-saved" : ""}`}
      aria-label={`${saved ? "Unsave" : "Save"} ${quest.title}`}
      aria-pressed={saved}
      onClick={() => {
        if (
          mutate((d) => ({
            ...d,
            favorites: saved
              ? d.favorites.filter((id) => id !== quest.id)
              : [...d.favorites, quest.id],
          }))
        ) {
          notify(saved ? "Removed from saved quests" : "Saved for another day");
          if (!saved) track("quest_saved", { questId: quest.id });
        }
      }}
    >
      <Icon name="bookmark" fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
export function QuestCard({ quest }: { quest: Quest }) {
  return (
    <article className="quest-card">
      <div className="quest-card-image">
        <Link to={`/quest/${quest.id}`} tabIndex={-1} aria-hidden="true">
          <CoverImage src={quest.coverImage} />
        </Link>
        <span className={`tag ${quest.category.toLowerCase()}`}>
          <Icon name={categoryIcons[quest.category]} size={13} />
          {quest.category}
        </span>
        <SaveButton quest={quest} />
      </div>
      <div className="quest-card-body">
        <Link to={`/quest/${quest.id}`} className="card-title">
          <h3>{quest.title}</h3>
        </Link>
        <p>{quest.description}</p>
        <div className="card-meta">
          <span>
            <Icon name="clock" size={15} />
            {quest.duration} min
          </span>
          <span>{quest.difficulty}</span>
          <span>
            <Icon name="people" size={15} />
            {quest.participants.includes("solo") ? "Solo friendly" : "Together"}
          </span>
        </div>
      </div>
    </article>
  );
}
export function PackCard({ pack }: { pack: QuestPack }) {
  return (
    <Link to={`/packs/${pack.id}`} className={`pack-card ${pack.color}`}>
      <div>
        <span className="small-label">
          {pack.questIds.length} little adventures
        </span>
        <h3>{pack.title}</h3>
        <span className="pack-link">
          Explore pack <Icon name="arrow" size={17} />
        </span>
      </div>
      <CoverImage src={pack.image} />
    </Link>
  );
}
