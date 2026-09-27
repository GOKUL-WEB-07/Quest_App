import { Link } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { achievements } from "../../services/achievementService";
import { levelName } from "../../services/userService";
import { quests } from "../../features/quests/catalog";
import { Icon, PageHeader, ProgressBar } from "../../components/ui";
export default function Profile() {
  const { data } = useApp();
  const badges = achievements(data, quests);
  const completed = Object.values(data.progress).filter(
    (p) => p.status === "completed",
  ).length;
  return (
    <>
      <PageHeader
        title="Your kind of curious."
        description="Every little adventure adds to your story."
      />
      <div className="profile-card">
        <span className="avatar large">
          {data.profile.displayName[0]?.toUpperCase() || "E"}
        </span>
        <div>
          <span className="small-label">Your adventure journal</span>
          <h1>{data.profile.displayName}</h1>
          <p>
            Level {data.profile.level} — {levelName(data.profile.level)}
          </p>
          <ProgressBar
            value={(data.profile.xp % 200) / 2}
            label="Progress to next level"
          />
          <span className="small-text muted">
            {data.profile.xp % 200} / 200 XP to your next chapter
          </span>
        </div>
        <Link className="button secondary" to="/profile/preferences">
          Edit profile <Icon name="arrow" size={17} />
        </Link>
      </div>
      <div className="profile-stats">
        <div>
          <strong>{completed}</strong>
          <span>experiences collected</span>
        </div>
        <div>
          <strong>{data.memories.length}</strong>
          <span>moments kept</span>
        </div>
        <div>
          <strong>{badges.filter((b) => b.count >= b.target).length}</strong>
          <span>little milestones</span>
        </div>
      </div>
      <section>
        <div className="section-heading">
          <h2>Things that pull you in</h2>
          <Link className="text-link" to="/profile/preferences">
            Make it yours <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="interest-extras">
          {data.profile.interests.length ? (
            data.profile.interests.map((i) => (
              <span className="tag explore" key={i}>
                {i}
              </span>
            ))
          ) : (
            <p className="muted">
              A blank page of possibilities. Add interests to shape your
              recommendations.
            </p>
          )}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Little milestones</h2>
          <Link className="text-link" to="/profile/achievements">
            See all <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="achievement-grid">
          {badges.slice(0, 3).map((b) => (
            <AchievementCard key={b.id} badge={b} />
          ))}
        </div>
      </section>
      <div className="profile-links">
        <Link to="/saved">
          <Icon name="bookmark" />
          Saved quests
          <Icon name="arrow" />
        </Link>
        <Link to="/settings">
          <Icon name="settings" />
          Settings & your data
          <Icon name="arrow" />
        </Link>
      </div>
    </>
  );
}
type Badge = ReturnType<typeof achievements>[number];
function AchievementCard({ badge: b }: { badge: Badge }) {
  const unlocked = b.count >= b.target;
  return (
    <article className={`achievement-card ${unlocked ? "unlocked" : ""}`}>
      <span className="achievement-icon">
        <Icon name={b.icon} size={31} />
      </span>
      <h3>{b.title}</h3>
      <p>{b.description}</p>
      <span>
        {unlocked
          ? "Collected"
          : `${Math.min(b.count, b.target)} / ${b.target}`}
      </span>
      <ProgressBar
        value={(b.count / b.target) * 100}
        label={`${b.title} progress`}
      />
    </article>
  );
}
export function Achievements() {
  const { data } = useApp();
  return (
    <>
      <PageHeader
        title="Little steps. Good stories."
        description="Milestones that happen while you’re busy enjoying the world."
        back="/profile"
      />
      <div className="achievement-grid">
        {achievements(data, quests).map((b) => (
          <AchievementCard badge={b} key={b.id} />
        ))}
      </div>
    </>
  );
}
