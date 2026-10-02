import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { Button, Chip, PageHeader } from "../../components/ui";
import { learningMatches, learningTopics } from "./learning";
import type { Quest } from "../../types";

export default function LearningFinder() {
  const { data } = useApp();
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [suggestion, setSuggestion] = useState<Quest | null>(null);
  const completed = Object.values(data.progress)
    .filter((p) => p.status === "completed")
    .map((p) => p.questId);
  const matches = learningMatches(topic, minutes, completed);
  function choose() {
    const fresh = matches.filter((q) => q.id !== suggestion?.id);
    const pool = fresh.length ? fresh : matches;
    setSuggestion(pool[Math.floor(Math.random() * pool.length)] || null);
  }
  return (
    <div className="quick-page">
      <PageHeader
        title="Learn something in a little time."
        description="30 short learning tasks. Choose your topic and time; we’ll pick something for you."
        back="/quest/generate"
      />
      <div className="quick-panel">
        <h2>What would you like to learn?</h2>
        <div className="quick-options">
          {["", ...learningTopics].map((t) => (
            <Chip
              key={t}
              selected={topic === t}
              onClick={() => {
                setTopic(t);
                setSuggestion(null);
              }}
            >
              {t || "Any topic"}
            </Chip>
          ))}
        </div>
        <h2>How much time do you have?</h2>
        <div className="quick-options">
          {[5, 10, 15, 20, 30].map((t) => (
            <Chip
              key={t}
              selected={minutes === t}
              onClick={() => {
                setMinutes(t);
                setSuggestion(null);
              }}
            >
              {t} min
            </Chip>
          ))}
        </div>
        <p>
          {matches.length
            ? `${matches.length} unfinished tasks fit your choices. Tasks take at most ${minutes} minutes.`
            : "You’ve finished every matching task. Try another topic or allow more time."}
        </p>
        <Button disabled={!matches.length} onClick={choose}>
          {suggestion ? "Pick another task" : "Find something to learn"}
        </Button>
        {suggestion && (
          <section aria-live="polite" className="settings-group">
            <h2>{suggestion.title}</h2>
            <p>
              {suggestion.subcategory} · {suggestion.duration} minutes
            </p>
            <p>{suggestion.description}</p>
            <Link className="button primary" to={`/quest/${suggestion.id}`}>
              See learning steps
            </Link>
          </section>
        )}
        <p className="quiet-note">
          Time is a guide, not a deadline. Use the quest timer while you
          practice, and take longer if you need it.
        </p>
      </div>
    </div>
  );
}
