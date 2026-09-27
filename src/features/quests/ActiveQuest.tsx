import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { quests, packs } from "./catalog";
import { completeQuest } from "../../services/userService";
import { track } from "../../services/analyticsService";
import {
  Button,
  EmptyState,
  Icon,
  Modal,
  PageHeader,
  ProgressBar,
} from "../../components/ui";
function Timer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const elapsed = Math.max(
    0,
    Math.floor((now - new Date(startedAt).getTime()) / 1000),
  );
  return (
    <span className="timer">
      <Icon name="clock" />
      {Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0")}
      :{(elapsed % 60).toString().padStart(2, "0")} elapsed
    </span>
  );
}
export default function ActiveQuest() {
  const { questId } = useParams();
  const { data, mutate } = useApp();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false),
    [timer, setTimer] = useState(false);
  const quest = quests.find((q) => q.id === questId),
    progress = questId ? data.progress[questId] : undefined;
  if (!quest || !progress || progress.status !== "active")
    return (
      <EmptyState
        title={
          progress?.status === "completed"
            ? "You’ve already made this memory."
            : "No adventure in progress."
        }
        description="Start a quest when you’re ready. We’ll keep your place."
        to={quest ? `/quest/${quest.id}` : "/discover"}
        action={quest ? "View quest" : "Explore quests"}
      />
    );
  const count = progress.completedSteps.length;
  function complete() {
    if (!quest) return;
    let completed = false;
    const ok = mutate((d) => {
      const next = completeQuest(d, quest);
      completed = next !== d;
      return next;
    });
    if (ok && completed) {
      track("quest_completed", { questId: quest.id });
      for (const pack of packs)
        if (
          pack.questIds.includes(quest.id) &&
          pack.questIds.every(
            (id) =>
              id === quest.id || data.progress[id]?.status === "completed",
          )
        )
          track("pack_completed", { packId: pack.id });
      navigate(`/quest/${quest.id}/complete`);
    }
  }
  return (
    <div className="active-page">
      <PageHeader
        title="Out in the world."
        description="Your screen can wait. Your adventure is right here."
        back={`/quest/${quest.id}`}
      />
      <div className="active-panel">
        <span className={`tag ${quest.category.toLowerCase()}`}>
          {quest.category}
        </span>
        <h1>{quest.title}</h1>
        <div className="active-progress">
          <strong>
            {count} of {quest.steps.length} discovered
          </strong>
          <span>+{quest.xp} XP</span>
        </div>
        <ProgressBar
          value={(count / quest.steps.length) * 100}
          label="Mission completion"
        />
        <div className="checklist">
          {quest.steps.map((step, i) => (
            <label
              className={progress.completedSteps.includes(i) ? "checked" : ""}
              key={step}
            >
              <input
                type="checkbox"
                checked={progress.completedSteps.includes(i)}
                onChange={() =>
                  mutate((d) => {
                    const p = d.progress[quest.id];
                    if (p.status !== "active") return d;
                    return {
                      ...d,
                      progress: {
                        ...d.progress,
                        [quest.id]: {
                          ...p,
                          completedSteps: p.completedSteps.includes(i)
                            ? p.completedSteps.filter((n) => n !== i)
                            : [...p.completedSteps, i],
                        },
                      },
                    };
                  })
                }
              />
              <span>{step}</span>
            </label>
          ))}
        </div>
        <div className="timer-row">
          <button className="inline-link" onClick={() => setTimer(!timer)}>
            {timer ? "Hide timer" : "Show optional timer"}
          </button>
          {timer && <Timer startedAt={progress.startedAt!} />}
        </div>
        <Button disabled={count !== quest.steps.length} onClick={complete}>
          Complete quest <Icon name="check" />
        </Button>
        <p className="small-text muted">
          {count === quest.steps.length
            ? "Something ordinary just became a story."
            : "Check off each part when you’re ready. No rush."}
        </p>
      </div>
      <button className="inline-link abandon" onClick={() => setConfirm(true)}>
        Leave this quest
      </button>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Leave this adventure for now?"
      >
        <p>
          No guilt. There are plenty of other possibilities. Starting this quest
          again will begin a fresh checklist.
        </p>
        <div className="flow-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Keep exploring
          </Button>
          <Button
            onClick={() => {
              if (
                mutate((d) => ({
                  ...d,
                  progress: {
                    ...d.progress,
                    [quest.id]: {
                      ...d.progress[quest.id],
                      status: "abandoned",
                    },
                  },
                }))
              )
                navigate("/home");
            }}
          >
            Leave quest
          </Button>
        </div>
      </Modal>
      <Link className="quiet-note" to="/home">
        Your progress is saved as you go.
      </Link>
    </div>
  );
}
