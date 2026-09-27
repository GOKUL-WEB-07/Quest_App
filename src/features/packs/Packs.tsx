import { Link, useParams } from "react-router-dom";
import { packs, quests } from "../quests/catalog";
import { useApp } from "../../stores/AppProvider";
import {
  CoverImage,
  EmptyState,
  Icon,
  PageHeader,
  ProgressBar,
} from "../../components/ui";
import { PackCard, QuestCard } from "../../components/cards/QuestCard";
import { track } from "../../services/analyticsService";
export default function Packs() {
  const { packId } = useParams();
  const { data } = useApp();
  if (!packId)
    return (
      <>
        <PageHeader
          title="A few adventures that belong together."
          description="Choose a feeling. Make a little room for it."
        />
        <div className="pack-grid">
          {packs.map((p) => (
            <PackCard key={p.id} pack={p} />
          ))}
        </div>
      </>
    );
  const pack = packs.find((p) => p.id === packId);
  if (!pack)
    return (
      <EmptyState
        title="This pack has wandered off."
        description="Explore another collection of little adventures."
        to="/packs"
        action="All packs"
      />
    );
  const list = pack.questIds
    .map((id) => quests.find((q) => q.id === id))
    .filter((q) => q !== undefined);
  const done = list.filter(
    (q) => data.progress[q.id]?.status === "completed",
  ).length;
  const next =
    list.find((q) => data.progress[q.id]?.status === "active") ||
    list.find((q) => data.progress[q.id]?.status !== "completed");
  return (
    <div>
      <PageHeader
        title={pack.title}
        description={pack.description}
        back="/packs"
      />
      <div className="pack-hero">
        <CoverImage src={pack.image} eager />
        <div className="pack-progress">
          <Icon name="compass" size={32} />
          <h2>
            {done === list.length
              ? "A whole collection of stories."
              : "Make a little space for adventure."}
          </h2>
          <p>
            {done} of {list.length} experiences collected
          </p>
          <ProgressBar
            value={(done / list.length) * 100}
            label="Pack completion"
          />
          {next && (
            <Link
              className="button primary"
              to={`/quest/${next.id}${data.progress[next.id]?.status === "active" ? "/active" : ""}`}
              onClick={() => track("pack_started", { packId: pack.id })}
            >
              {done ? "Continue pack" : "Start pack"}
              <Icon name="arrow" />
            </Link>
          )}
        </div>
      </div>
      <div className="quest-grid">
        {list.map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
      </div>
    </div>
  );
}
