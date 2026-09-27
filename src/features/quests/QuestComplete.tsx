import { Link, useParams } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { quests } from "./catalog";
import { EmptyState, Icon } from "../../components/ui";
export default function QuestComplete() {
  const { questId } = useParams();
  const { data } = useApp();
  const quest = quests.find((q) => q.id === questId);
  if (!quest || data.progress[quest.id]?.status !== "completed")
    return (
      <EmptyState
        title="A story still in the making."
        description="Complete your quest before collecting the memory."
        to={quest ? `/quest/${quest.id}` : "/discover"}
        action="View quest"
      />
    );
  const memory = data.memories.find((m) => m.questId === quest.id);
  return (
    <div className="completion-page">
      <div className="completion-art">
        <span>✦</span>
        <div>
          <Icon name="check" size={62} />
        </div>
        <span>✧</span>
      </div>
      <span className="tag explore">Experience collected</span>
      <h1>Look at you, out there.</h1>
      <p>
        You completed <strong>{quest.title}</strong>.<br />A little different
        from the everyday. Entirely yours.
      </p>
      <div className="reward">
        <Icon name="zap" size={28} />
        <strong>+{quest.xp}</strong>
        <span>XP earned</span>
      </div>
      <p className="muted">
        Level {data.profile.level} · {data.profile.xp} XP collected
      </p>
      <div className="completion-actions">
        <Link
          className="button primary"
          to={memory ? `/memories/${memory.id}` : `/quest/${quest.id}/memory`}
        >
          <Icon name="image" />
          {memory ? "Revisit your memory" : "Save the memory"}
        </Link>
        <Link className="button secondary" to="/home">
          Back to the world of possibilities
        </Link>
      </div>
      <span className="quiet-note">
        No streak to keep. Just a moment worth keeping.
      </span>
    </div>
  );
}
