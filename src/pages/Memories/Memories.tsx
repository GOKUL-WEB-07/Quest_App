import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { quests } from "../../features/quests/catalog";
import {
  Chip,
  CoverImage,
  EmptyState,
  Icon,
  PageHeader,
} from "../../components/ui";
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export default function Memories() {
  const { data } = useApp();
  const [view, setView] = useState("Timeline");
  const completed = Object.values(data.progress)
    .filter((p) => p.status === "completed")
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
  const memories = [...data.memories].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
  return (
    <div>
      <PageHeader
        title="The good little things."
        description={`${completed.length} ${completed.length === 1 ? "experience" : "experiences"} collected. Your own kind of adventure journal.`}
      />
      <div className="category-tabs">
        {["Timeline", "Photo grid", "Quest history"].map((v) => (
          <Chip key={v} selected={view === v} onClick={() => setView(v)}>
            {v}
          </Chip>
        ))}
      </div>
      {view === "Quest history" ? (
        completed.length ? (
          <div className="history-list">
            {completed.map((p) => {
              const q = quests.find((q) => q.id === p.questId);
              return q ? (
                <Link to={`/quest/${q.id}/complete`} key={p.id}>
                  <span className="round-icon">
                    <Icon name="check" />
                  </span>
                  <div>
                    <h3>{q.title}</h3>
                    <span>{formatDate(p.completedAt!)}</span>
                  </div>
                  <span>+{q.xp} XP</span>
                  <Icon name="arrow" />
                </Link>
              ) : null;
            })}
          </div>
        ) : (
          <EmptyState
            title="Your adventures will appear here."
            description="Complete a SideQuest and collect a little experience."
          />
        )
      ) : !memories.length ? (
        <EmptyState
          icon="image"
          title="Your adventures will appear here."
          description="Complete a SideQuest and save a moment from the experience."
        />
      ) : view === "Photo grid" && !memories.some((m) => m.images.length) ? (
        <EmptyState
          icon="image"
          title="A few words, for now."
          description="Your journal has notes. Photo memories will appear here when you add a picture."
          to="/memories"
          action="View your journal"
        />
      ) : (
        <div
          className={view === "Photo grid" ? "memory-grid" : "memory-timeline"}
        >
          {memories
            .filter((m) => view !== "Photo grid" || m.images.length)
            .map((m) => (
              <Link className="memory-card" to={`/memories/${m.id}`} key={m.id}>
                <div className="memory-image">
                  {m.images[0] ? (
                    <CoverImage src={m.images[0]} alt={m.title} />
                  ) : (
                    <>
                      <Icon name="sparkles" size={40} />
                      <span>A moment in words</span>
                    </>
                  )}
                </div>
                <div className="memory-card-copy">
                  <span className="small-label">
                    {formatDate(m.completedAt)}
                  </span>
                  <h2>{m.title}</h2>
                  {m.note && <p>{m.note}</p>}
                  <span className="memory-location">
                    <Icon name="pin" size={15} />
                    {m.location.name || "Somewhere in your story"}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
export function MemoryDetail() {
  const { memoryId } = useParams();
  const { data } = useApp();
  const memory = data.memories.find((m) => m.id === memoryId);
  if (!memory)
    return (
      <EmptyState
        title="This memory isn’t here."
        description="Check your journal for the moment you saved."
        to="/memories"
        action="Your journal"
      />
    );
  return (
    <div className="memory-detail">
      <PageHeader
        title={memory.title}
        description={formatDate(memory.completedAt)}
        back="/memories"
      />
      {memory.images[0] && (
        <div className="memory-detail-image">
          <CoverImage src={memory.images[0]} alt={memory.title} eager />
        </div>
      )}
      <div className="journal-note">
        <Icon name="sparkles" size={25} />
        <p>{memory.note || "Some moments don’t need words."}</p>
        {memory.rating > 0 && (
          <div
            className="memory-stars"
            aria-label={`${memory.rating} out of 5 stars`}
          >
            {"★".repeat(memory.rating)}
          </div>
        )}
        {memory.location.name && (
          <span>
            <Icon name="pin" size={18} />
            {memory.location.name}
          </span>
        )}
      </div>
      <Link className="button secondary" to={`/quest/${memory.questId}`}>
        Revisit the quest <Icon name="arrow" />
      </Link>
    </div>
  );
}
