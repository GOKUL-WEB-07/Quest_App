import { Link } from "react-router-dom";
import { categories } from "../../types";
import { useApp } from "../../stores/AppProvider";
import { packs, photos, quests } from "../../features/quests/catalog";
import {
  categoryIcons,
  PackCard,
  QuestCard,
} from "../../components/cards/QuestCard";
import { CoverImage, Icon, ProgressBar } from "../../components/ui";
const categoryCopy: Record<string, string> = {
  Create: "Make a little mess",
  Explore: "Take a different turn",
  Play: "Just for the fun of it",
  Learn: "Follow your curiosity",
  Social: "Better with company",
  Chill: "Find your slow lane",
};
export default function Home() {
  const { data } = useApp();
  const active = Object.values(data.progress).find(
    (p) => p.status === "active",
  );
  const activeQuest = quests.find((q) => q.id === active?.questId);
  const recommended = [...quests]
    .filter((q) => data.progress[q.id]?.status !== "completed")
    .sort(
      (a, b) =>
        Number(data.profile.interests.includes(b.category)) -
        Number(data.profile.interests.includes(a.category)),
    )
    .slice(0, 3);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <div className="home-page">
      <header className="home-heading">
        <div>
          <p className="greeting">
            {greeting},{" "}
            {data.profile.displayName === "Explorer"
              ? "curious human"
              : data.profile.displayName}{" "}
            <Icon name="sun" size={18} />
          </p>
          <h1>
            Make today a little
            <br className="mobile-break" /> less ordinary.
          </h1>
          <p>A small adventure. A fresh perspective. A story worth keeping.</p>
        </div>
        <div className="date-stamp">
          <Icon name="sun" size={28} />
          <span>
            NO BIG PLANS
            <br />
            NECESSARY
          </span>
        </div>
      </header>
      <div className="home-feature-grid">
        <Link to="/quest/micro-adventure" className="feature-hero">
          <CoverImage src={photos.forest} eager />
          <div className="hero-shade" />
          <div className="hero-top">
            <span className="hero-label">
              <span />
              Your everyday escape
            </span>
            <span className="hero-arrow">
              <Icon name="diagonal" size={24} />
            </span>
          </div>
          <div className="hero-copy">
            <span className="hero-kicker">
              A little fresh air goes a long way.
            </span>
            <h2>
              The best things
              <br />
              aren’t on your screen.
            </h2>
            <p>Take the unfamiliar turn. See what you find.</p>
            <span className="hero-button">
              Go on a micro adventure <Icon name="arrow" size={18} />
            </span>
          </div>
          <span className="hero-bottom">
            30 MINUTES <span>OUTSIDE</span> FREE
          </span>
        </Link>
        <Link className="surprise-card" to="/quest/generate?surprise=1">
          <div className="surprise-top">
            <span>Leave it to chance</span>
            <Icon name="sparkles" />
          </div>
          <div className="compass-art" aria-hidden="true">
            <span className="compass-n">N</span>
            <span className="compass-s">S</span>
            <span className="compass-e">E</span>
            <span className="compass-w">W</span>
            <div className="compass-rings" />
            <div className="compass-needle" />
            <span className="compass-center" />
            <span className="orbit-star one">✦</span>
            <span className="orbit-star two">✧</span>
          </div>
          <div>
            <h2>
              Less thinking.
              <br />
              More doing.
            </h2>
            <p>
              No filters. No overthinking.
              <br />
              Just a little unexpected.
            </p>
            <span className="button dark">
              Surprise me <Icon name="dice" />
            </span>
          </div>
        </Link>
      </div>
      {activeQuest && active && (
        <Link
          className="continue-banner"
          to={`/quest/${activeQuest.id}/active`}
        >
          <span className="round-icon">
            <Icon name="footprints" />
          </span>
          <div>
            <small>Your adventure is waiting</small>
            <h3>{activeQuest.title}</h3>
            <ProgressBar
              value={
                (active.completedSteps.length / activeQuest.steps.length) * 100
              }
              label="Quest progress"
            />
          </div>
          <span>
            Keep going <Icon name="arrow" />
          </span>
        </Link>
      )}
      <section className="mood-section">
        <div className="section-heading">
          <h2>What are you in the mood for?</h2>
          <span className="muted">There’s no wrong answer.</span>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={`/quest/generate?category=${category}`}
              key={category}
              className={`category-card ${category.toLowerCase()}`}
            >
              <span className="category-icon">
                <Icon name={categoryIcons[category]} size={25} />
              </span>
              <h3>{category}</h3>
              <span>{categoryCopy[category]}</span>
              <Icon className="category-arrow" name="diagonal" size={17} />
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <h2>A little inspiration for you</h2>
            <p>Small quests. Surprisingly good stories.</p>
          </div>
          <Link className="text-link" to="/discover">
            View all quests <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="quest-grid">
          {recommended.map((q) => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <h2>Pick a pack. Find your thing.</h2>
            <p>A few adventures that belong together.</p>
          </div>
          <Link className="text-link" to="/packs">
            All packs <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="pack-grid">
          {packs.slice(0, 3).map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>
      </section>
      <div className="closing-note">
        <Icon name="sparkles" size={19} />
        <p>You don’t need a whole free day. Just a little curiosity.</p>
        <Link to="/discover?duration=5">
          Got five minutes? <Icon name="arrow" size={16} />
        </Link>
      </div>
    </div>
  );
}
