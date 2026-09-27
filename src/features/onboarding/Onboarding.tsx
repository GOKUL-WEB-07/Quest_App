import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../types";
import { useApp } from "../../stores/AppProvider";
import { updateProfile } from "../../services/userService";
import { Button, Chip, Icon, ProgressBar } from "../../components/ui";
import { categoryIcons } from "../../components/cards/QuestCard";
export default function Onboarding() {
  const { data, mutate } = useApp();
  const navigate = useNavigate();
  const preferences = useLocation().pathname.endsWith("preferences");
  const [interests, setInterests] = useState(data.profile.interests);
  function finish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      mutate((d) =>
        updateProfile(d, {
          displayName: String(f.get("name")).trim() || "Explorer",
          onboardingCompleted: true,
          preferences: {
            ...d.profile.preferences,
            typicalDuration: Number(f.get("duration")),
            energy: String(f.get("energy")),
          },
        }),
      )
    )
      navigate("/home");
  }
  const skip = () => {
    if (mutate((d) => updateProfile(d, { onboardingCompleted: true })))
      navigate("/home");
  };
  return (
    <div className="onboarding-page">
      <header>
        <Link className="brand" to="/home">
          <Icon name="sparkles" />
          sidequest.
        </Link>
        <button className="inline-link" onClick={skip}>
          Skip for now
        </button>
      </header>
      <div className="onboarding-panel">
        <div className="step-caption">
          A little about you <span>{preferences ? "2" : "1"} of 2</span>
        </div>
        <ProgressBar
          value={preferences ? 100 : 50}
          label="Onboarding progress"
        />
        <span className="round-icon">
          <Icon name={preferences ? "sun" : "sparkles"} size={28} />
        </span>
        <h1>
          {preferences ? "Your kind of adventure." : "What pulls you in?"}
        </h1>
        <p>
          {preferences
            ? "A couple of starting points. You can change these anytime."
            : "Pick the things you enjoy. We’ll follow your curiosity."}
        </p>
        {preferences ? (
          <form onSubmit={finish}>
            <label>
              What should we call you?
              <input
                name="name"
                defaultValue={
                  data.profile.displayName === "Explorer"
                    ? ""
                    : data.profile.displayName
                }
                maxLength={40}
                placeholder="Explorer"
              />
            </label>
            <label>
              Your usual pocket of free time
              <select
                name="duration"
                defaultValue={data.profile.preferences.typicalDuration}
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">An hour</option>
                <option value="180">A whole afternoon</option>
              </select>
            </label>
            <label>
              Your usual energy
              <select
                name="energy"
                defaultValue={data.profile.preferences.energy}
              >
                <option value="">A little of everything</option>
                <option value="low">Taking it easy</option>
                <option value="medium">Up for something</option>
                <option value="high">Ready to move</option>
              </select>
            </label>
            <Button type="submit">
              Let’s find your SideQuest <Icon name="arrow" />
            </Button>
          </form>
        ) : (
          <>
            <div className="interest-grid">
              {categories.map((c) => (
                <Chip
                  selected={interests.includes(c)}
                  onClick={() =>
                    setInterests((prev) =>
                      prev.includes(c)
                        ? prev.filter((i) => i !== c)
                        : [...prev, c],
                    )
                  }
                  key={c}
                >
                  <Icon name={categoryIcons[c]} />
                  {c}
                </Chip>
              ))}
            </div>
            <div className="interest-extras">
              {[
                "Photography",
                "Writing",
                "Nature",
                "Music",
                "Design",
                "Cooking",
                "Architecture",
                "DIY",
              ].map((i) => (
                <Chip
                  key={i}
                  selected={interests.includes(i)}
                  onClick={() =>
                    setInterests((prev) =>
                      prev.includes(i)
                        ? prev.filter((x) => x !== i)
                        : [...prev, i],
                    )
                  }
                >
                  {i}
                </Chip>
              ))}
            </div>
            <Button
              onClick={() => {
                if (mutate((d) => updateProfile(d, { interests })))
                  navigate("/onboarding/preferences");
              }}
            >
              Next <Icon name="arrow" />
            </Button>
            <span className="muted small-text">
              Choose as many as you like. Or none at all.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
