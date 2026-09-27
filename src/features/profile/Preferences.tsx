import { useState, type FormEvent } from "react";
import { useApp } from "../../stores/AppProvider";
import { updateProfile } from "../../services/userService";
import { categories } from "../../types";
import { Button, Chip, PageHeader } from "../../components/ui";
export default function Preferences() {
  const { data, mutate, notify } = useApp();
  const [interests, setInterests] = useState(data.profile.interests);
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      mutate((d) =>
        updateProfile(d, {
          displayName: String(f.get("name")).trim() || "Explorer",
          interests,
          preferences: {
            typicalDuration: Number(f.get("duration")),
            energy: String(f.get("energy")),
            difficulty: String(f.get("difficulty")),
            budget: String(f.get("budget")),
          },
        }),
      )
    )
      notify("Your preferences are saved");
  }
  return (
    <div className="preferences-page">
      <PageHeader
        title="Make it yours."
        description="Your curiosity can change. So can these."
        back="/profile"
      />
      <form className="settings-form" onSubmit={save}>
        <label>
          Your name
          <input
            name="name"
            maxLength={40}
            defaultValue={data.profile.displayName}
            required
          />
        </label>
        <fieldset>
          <legend>Your interests</legend>
          <div className="interest-extras">
            {[
              ...categories,
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
        </fieldset>
        <div className="filter-fields">
          <label>
            Usual time
            <select
              name="duration"
              defaultValue={data.profile.preferences.typicalDuration}
            >
              {[5, 15, 30, 60, 120, 240].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <label>
            Energy
            <select
              name="energy"
              defaultValue={data.profile.preferences.energy}
            >
              <option value="">Any energy</option>
              {["low", "medium", "high"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              name="difficulty"
              defaultValue={data.profile.preferences.difficulty}
            >
              <option value="">Any difficulty</option>
              {["easy", "medium", "hard", "epic"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Budget
            <select
              name="budget"
              defaultValue={data.profile.preferences.budget}
            >
              <option value="">Any budget</option>
              <option value="free">Free / use what I have</option>
            </select>
          </label>
        </div>
        <Button type="submit">Save preferences</Button>
      </form>
    </div>
  );
}
