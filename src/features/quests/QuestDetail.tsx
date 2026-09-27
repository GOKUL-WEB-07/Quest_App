import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { quests } from "./catalog";
import { useApp } from "../../stores/AppProvider";
import {
  Button,
  CoverImage,
  EmptyState,
  Icon,
  Modal,
} from "../../components/ui";
import { SaveButton } from "../../components/cards/QuestCard";
import { recommend } from "../../services/recommendationService";
import { track } from "../../services/analyticsService";
export default function QuestDetail() {
  const { questId } = useParams();
  const quest = quests.find((q) => q.id === questId);
  const { data, mutate, notify } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [confirm, setConfirm] = useState(false),
    [report, setReport] = useState(false),
    [reason, setReason] = useState("");
  useEffect(() => {
    if (quest) track("quest_viewed", { questId: quest.id });
  }, [quest]);
  if (!quest)
    return (
      <EmptyState
        title="This quest has wandered off."
        description="It may no longer be available. There are plenty more to explore."
        to="/discover"
        action="Explore quests"
      />
    );
  const state = data.progress[quest.id];
  const other = Object.values(data.progress).find(
    (p) => p.status === "active" && p.questId !== quest.id,
  );
  function start() {
    if (!quest) return;
    const now = new Date().toISOString();
    if (
      mutate((d) => {
        const progress = { ...d.progress };
        if (other) progress[other.questId] = { ...other, status: "abandoned" };
        progress[quest.id] = {
          id: `${d.profile.id}_${quest.id}`,
          userId: d.profile.id,
          questId: quest.id,
          status: "active",
          completedSteps: [],
          startedAt: now,
          surprise: params.get("surprise") === "1",
        };
        return { ...d, progress };
      })
    ) {
      track("quest_started", { questId: quest.id });
      navigate(`/quest/${quest.id}/active`);
    }
  }
  function reroll() {
    if (!quest) return;
    track("quest_skipped", { questId: quest.id });
    const next = recommend(quests, {
      category: params.get("surprise") ? "" : quest.category,
      excludeIds: [quest.id],
      recentIds: Object.values(data.progress)
        .filter((p) => p.status === "completed")
        .map((p) => p.questId),
    });
    if (next)
      navigate(
        `/quest/${next.id}${params.get("surprise") ? "?surprise=1" : ""}`,
      );
    else notify("You’ve explored these matches. Try a different category.");
  }
  return (
    <div className="detail-page">
      <Link className="back-link" to="/discover">
        <Icon name="back" />
        All adventures
      </Link>
      <div className="detail-hero">
        <CoverImage src={quest.coverImage} eager />
        <span className={`tag ${quest.category.toLowerCase()}`}>
          {quest.category} / {quest.subcategory}
        </span>
        <SaveButton quest={quest} />
      </div>
      <div className="detail-columns">
        <div>
          <div className="detail-title">
            <h1>{quest.title}</h1>
            <span className="xp-badge">
              <Icon name="zap" size={18} />+{quest.xp} XP
            </span>
          </div>
          <p className="detail-description">{quest.description}</p>
          <div className="detail-meta">
            <span>
              <Icon name="clock" />
              {quest.duration} minutes
            </span>
            <span>
              <Icon name="footprints" />
              {quest.difficulty}
            </span>
            <span>
              <Icon name="people" />
              {quest.participants.includes("solo")
                ? "Solo or together"
                : "With someone"}
            </span>
            <span>
              <Icon name="leaf" />
              Free
            </span>
          </div>
          <section className="mission">
            <h2>Your little mission</h2>
            <ol>
              {quest.steps.map((step, i) => (
                <li key={step}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
          {quest.safetyNote && (
            <div className="safety-note">
              <Icon name="sun" />
              <p>{quest.safetyNote}</p>
            </div>
          )}
          <button
            className="inline-link report-link"
            onClick={() => setReport(true)}
          >
            Report an unsafe quest
          </button>
        </div>
        <aside className="ready-card">
          <Icon name="compass" size={32} />
          <h2>Ready for a little detour?</h2>
          <p>You don’t have to do it perfectly. Just give it a go.</p>
          <h3>Bring along</h3>
          <ul>
            {(quest.requirements.length
              ? quest.requirements
              : ["Just your curiosity"]
            ).map((r) => (
              <li key={r}>
                <Icon name="check" size={16} />
                {r}
              </li>
            ))}
          </ul>
          {state?.status === "completed" ? (
            <>
              <p className="success-text">
                <Icon name="check" />
                An experience collected.
              </p>
              <Link
                className="button primary"
                to={`/quest/${quest.id}/complete`}
              >
                View completion
              </Link>
            </>
          ) : state?.status === "active" ? (
            <Link className="button primary" to={`/quest/${quest.id}/active`}>
              Continue quest <Icon name="arrow" />
            </Link>
          ) : (
            <Button onClick={() => (other ? setConfirm(true) : start())}>
              Start quest <Icon name="arrow" />
            </Button>
          )}
          <Button variant="secondary" onClick={reroll}>
            <Icon name="dice" size={18} />
            Try another
          </Button>
          <span className="small-text muted">
            Go make a story worth keeping.
          </span>
        </aside>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="One adventure at a time"
      >
        <p>
          You have another quest in progress. Starting this one will abandon it.
          Its checklist will be reset if you start it again.
        </p>
        <div className="flow-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Keep current quest
          </Button>
          <Button onClick={start}>Start this quest</Button>
        </div>
      </Modal>
      <Modal
        open={report}
        onClose={() => setReport(false)}
        title="Help keep adventures safe"
      >
        <p>
          What feels unsafe? Your note stays on this device and is included in
          your journal export.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              mutate((d) => ({
                ...d,
                reports: [
                  ...d.reports,
                  {
                    id: crypto.randomUUID(),
                    userId: d.profile.id,
                    questId: quest.id,
                    reason: reason.trim(),
                    createdAt: new Date().toISOString(),
                  },
                ],
              }))
            ) {
              notify("Report saved on this device");
              setReport(false);
              setReason("");
            }
          }}
        >
          <label>
            What should we know?
            <textarea
              required
              minLength={10}
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={reason.trim().length < 10}>
            Save report
          </Button>
        </form>
      </Modal>
    </div>
  );
}
