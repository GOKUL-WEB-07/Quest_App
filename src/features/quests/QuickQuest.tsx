import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import {
  Button,
  Chip,
  EmptyState,
  Icon,
  PageHeader,
  ProgressBar,
} from "../../components/ui";
import { quests } from "./catalog";
import {
  recommend,
  moodCategories,
} from "../../services/recommendationService";
import { track } from "../../services/analyticsService";
import type { QuestContext } from "../../types";
import LearningFinder from "./LearningFinder";
export default function QuickQuest() {
  const [params, setParams] = useSearchParams();
  const kind = params.get("kind");
  if (params.get("surprise") === "1") return <TaskFinder />;
  if (kind === "learning") return <LearningFinder />;
  if (kind === "task") return <TaskFinder />;
  return (
    <div className="quick-page">
      <PageHeader
        title="What kind of quest?"
        description="First, choose what you want to do. We’ll tailor the next choices to you."
        back="/home"
      />
      <div className="quick-panel">
        <h2>Task or learning quest?</h2>
        <div className="quick-options">
          <Button
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("kind", "task");
              setParams(next);
            }}
          >
            Task
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("kind", "learning");
              setParams(next);
            }}
          >
            Learning quest
          </Button>
        </div>
        <p>Task: choose your mood, time, and place for an activity.</p>
        <p>
          Learning quest: choose a topic and time for a short lesson with
          practice.
        </p>
      </div>
    </div>
  );
}
function TaskFinder() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const surprise = params.get("surprise") === "1";
  const initialMood =
    Object.entries(moodCategories).find(
      ([, v]) => v !== "Learn" && v === params.get("category"),
    )?.[0] || "";
  const [step, setStep] = useState(initialMood ? 1 : 0),
    [context, setContext] = useState<QuestContext>({
      mood: initialMood,
      duration: data.profile.preferences.typicalDuration,
      location: "Anywhere",
      energy: data.profile.preferences.energy,
      difficulty: data.profile.preferences.difficulty,
      budget: data.profile.preferences.budget,
    }),
    [generating, setGenerating] = useState(false),
    [noMatch, setNoMatch] = useState(false),
    [advanced, setAdvanced] = useState(false);
  const started = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function generate(chaos = false) {
    setGenerating(true);
    setNoMatch(false);
    if (chaos) track("chaos_used");
    const quest = recommend(
      surprise ? quests : quests.filter((q) => q.category !== "Learn"),
      {
        ...(chaos ? {} : context),
        interests: data.profile.interests,
        recentIds: Object.values(data.progress)
          .filter((p) => p.status === "completed")
          .map((p) => p.questId),
      },
    );
    timer.current = setTimeout(() => {
      if (quest)
        navigate(`/quest/${quest.id}${chaos ? "?surprise=1" : ""}`, {
          replace: true,
        });
      else {
        setGenerating(false);
        setNoMatch(true);
      }
    }, 350);
  }
  useEffect(() => {
    if (surprise && !started.current) {
      started.current = true;
      generate(true);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  if (generating)
    return (
      <div className="generation" role="status">
        <div className="generation-compass">
          <Icon name="compass" size={72} />
        </div>
        <h1>Finding your SideQuest…</h1>
        <p>A little possibility is on its way.</p>
      </div>
    );
  if (noMatch)
    return (
      <>
        <PageHeader title="A different kind of possibility" back="/home" />
        <EmptyState
          title="Couldn’t find the perfect match."
          description="Remove a filter or let Chaos choose. Completed quests stay out of recommendations, but you can always revisit them in Discover."
          to="/discover"
          action="Browse all quests"
        />
        <Button
          onClick={() => {
            setNoMatch(false);
            setStep(0);
          }}
        >
          Adjust preferences
        </Button>{" "}
        <Button variant="secondary" onClick={() => generate(true)}>
          Surprise me
        </Button>
      </>
    );
  return (
    <div className="quick-page">
      <PageHeader
        title="Find your next little adventure."
        description="A few quick choices. A world of possibilities."
        back="/quest/generate"
      />
      <div className="quick-panel">
        <div className="step-caption">
          {["A feeling", "A little time", "A starting point"][step]}
          <span>Step {step + 1} of 3</span>
        </div>
        <ProgressBar
          value={((step + 1) / 3) * 100}
          label="Quest finder progress"
        />
        <h2>
          {
            [
              "How are you feeling?",
              "How much time do you have?",
              "Where are you?",
            ][step]
          }
        </h2>
        <p>
          {
            [
              "Go with your first instinct.",
              "There’s an adventure for every little gap.",
              "We’ll find something that fits.",
            ][step]
          }
        </p>
        <div className="quick-options">
          {step === 0
            ? Object.keys(moodCategories)
                .filter((m) => m !== "Curious")
                .concat("Surprise me")
                .map((m) => (
                  <Chip
                    key={m}
                    selected={context.mood === m}
                    onClick={() => setContext({ ...context, mood: m })}
                  >
                    <Icon
                      name={
                        [
                          "palette",
                          "compass",
                          "leaf",
                          "idea",
                          "people",
                          "zap",
                          "sparkles",
                        ][m === "Surprise me" ? 6 : Object.keys(moodCategories).indexOf(m)]
                      }
                    />
                    {m}
                  </Chip>
                ))
            : step === 1
              ? [5, 15, 30, 60, 120, 240].map((time) => (
                  <Chip
                    key={time}
                    selected={context.duration === time}
                    onClick={() => setContext({ ...context, duration: time })}
                  >
                    <Icon name="clock" />
                    {time === 60
                      ? "1 hour"
                      : time === 120
                        ? "2+ hours"
                        : time === 240
                          ? "Half day"
                          : `${time} min`}
                  </Chip>
                ))
              : ["Home", "Outside", "Campus", "City", "Anywhere"].map((l) => (
                  <Chip
                    key={l}
                    selected={context.location === l}
                    onClick={() => setContext({ ...context, location: l })}
                  >
                    <Icon name={l === "Home" ? "home" : "pin"} />
                    {l}
                  </Chip>
                ))}
        </div>
        {step === 2 && (
          <>
            <button
              className="text-link"
              onClick={() => setAdvanced(!advanced)}
              aria-expanded={advanced}
            >
              <Icon name="filter" size={17} />A little more specific
            </button>
            {advanced && (
              <div className="filter-fields">
                <label>
                  Energy
                  <select
                    value={context.energy || ""}
                    onChange={(e) =>
                      setContext({ ...context, energy: e.target.value })
                    }
                  >
                    <option value="">Any energy</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Company
                  <select
                    value={context.participants || ""}
                    onChange={(e) =>
                      setContext({ ...context, participants: e.target.value })
                    }
                  >
                    <option value="">Anyone</option>
                    <option value="solo">Solo</option>
                    <option value="pair">A pair</option>
                    <option value="friends">Friends</option>
                  </select>
                </label>
                <label>
                  Budget
                  <select
                    value={context.budget || ""}
                    onChange={(e) =>
                      setContext({ ...context, budget: e.target.value })
                    }
                  >
                    <option value="">Any budget</option>
                    <option value="free">Free / use what I have</option>
                  </select>
                </label>
              </div>
            )}
          </>
        )}
        <div className="flow-actions">
          {step > 0 && (
            <Button variant="quiet" onClick={() => setStep(step - 1)}>
              <Icon name="back" />
              Back
            </Button>
          )}
          <Button
            disabled={step === 0 && !context.mood}
            onClick={() => (step === 2 ? generate() : setStep(step + 1))}
          >
            {step === 2 ? "Find my SideQuest" : "Next"}
            <Icon name={step === 2 ? "sparkles" : "arrow"} />
          </Button>
        </div>
      </div>
      <p className="quiet-note">
        <Icon name="leaf" size={17} />
        No perfect choice needed. Just a place to start.
      </p>
    </div>
  );
}
