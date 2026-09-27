import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { categories, type QuestFilters } from "../../types";
import { quests } from "../../features/quests/catalog";
import { filterQuests } from "../../services/recommendationService";
import { track } from "../../services/analyticsService";
import { useApp } from "../../stores/AppProvider";
import {
  Button,
  Chip,
  EmptyState,
  Icon,
  Modal,
  PageHeader,
} from "../../components/ui";
import { QuestCard } from "../../components/cards/QuestCard";
export default function Discover({ saved = false }: { saved?: boolean }) {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const { data } = useApp();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(12);
  const filters: QuestFilters = {
    category: params.get("category") || category || "",
    duration: Number(params.get("duration")) || undefined,
    search: params.get("search") || "",
    location: params.get("location") || "",
    energy: params.get("energy") || "",
    participants: params.get("participants") || "",
    difficulty: params.get("difficulty") || "",
    budget: params.get("budget") || "",
    equipment: params.get("equipment") || "",
  };
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setVisible(12);
    if (key !== "search") track("filter_used", { filter: key, value });
  }
  const list = filterQuests(
    saved ? quests.filter((q) => data.favorites.includes(q.id)) : quests,
    filters,
  );
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => !["category", "search"].includes(k) && v,
  ).length;
  const fields: [string, string, [string, string][]][] = [
    [
      "duration",
      "Available time",
      [
        ["5", "Up to 5 minutes"],
        ["15", "Up to 15 minutes"],
        ["30", "Up to 30 minutes"],
        ["60", "Up to an hour"],
        ["120", "Up to 2 hours"],
        ["240", "Half a day"],
      ],
    ],
    [
      "location",
      "Location",
      ["Home", "Outside", "Campus", "City"].map((x) => [x, x]),
    ],
    [
      "difficulty",
      "Difficulty",
      ["easy", "medium", "hard", "epic"].map((x) => [x, x]),
    ],
    ["energy", "Energy", ["low", "medium", "high"].map((x) => [x, x])],
    [
      "participants",
      "Company",
      [
        ["solo", "Solo"],
        ["pair", "A pair"],
        ["friends", "Friends"],
      ],
    ],
    ["budget", "Budget", [["free", "Free / use what I have"]]],
    ["equipment", "Equipment", [["none", "No equipment"]]],
  ];
  return (
    <div>
      <PageHeader
        title={saved ? "For another day." : "Follow your curiosity."}
        description={
          saved
            ? "Good ideas, kept close. Your next adventure is waiting."
            : "Creative detours, tiny adventures, and a few unexpected things."
        }
      />
      <div className="discover-toolbar">
        <label className="search-field">
          <Icon name="search" />
          <span className="sr-only">Search quests</span>
          <input
            type="search"
            placeholder="What would you like to discover?"
            value={filters.search}
            onChange={(e) => change("search", e.target.value)}
          />
        </label>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <Icon name="filter" />
          Filters
          {activeCount > 0 && <span className="count">{activeCount}</span>}
        </Button>
      </div>
      <div className="category-tabs">
        <Chip
          selected={!filters.category}
          onClick={() => change("category", "")}
        >
          All adventures
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c}
            selected={filters.category?.toLowerCase() === c.toLowerCase()}
            onClick={() => change("category", c)}
          >
            {c}
          </Chip>
        ))}
      </div>
      {activeCount > 0 && (
        <div className="applied-filters">
          {Object.entries(filters)
            .filter(([k, v]) => !["search", "category"].includes(k) && v)
            .map(([k, v]) => (
              <Chip key={k} onClick={() => change(k, "")}>
                {k}: {v}
                <Icon name="close" size={14} />
              </Chip>
            ))}
          <button
            className="inline-link"
            onClick={() => {
              setParams({});
              setVisible(12);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <p className="result-count" aria-live="polite">
        {list.length} {list.length === 1 ? "possibility" : "possibilities"}{" "}
        {saved ? "saved" : "waiting for you"}
      </p>
      {list.length ? (
        <>
          <div className="quest-grid">
            {list.slice(0, visible).map((q) => (
              <QuestCard quest={q} key={q.id} />
            ))}
          </div>
          {visible < list.length && (
            <div className="load-more">
              <Button
                variant="secondary"
                onClick={() => setVisible(visible + 12)}
              >
                A few more possibilities
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={saved ? "bookmark" : "search"}
          title={
            saved && !data.favorites.length
              ? "Nothing saved yet."
              : "Couldn’t find the perfect match."
          }
          description={
            saved && !data.favorites.length
              ? "Found something interesting? Save it for later."
              : "Try a different search, remove a filter, or let Chaos choose."
          }
          to={saved ? "/discover" : "/quest/generate?surprise=1"}
          action={saved ? "Explore quests" : "Surprise me"}
        />
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Your kind of quest"
      >
        <div className="filter-fields">
          {fields.map(([key, label, options]) => (
            <label key={key}>
              {label}
              <select
                value={params.get(key) || ""}
                onChange={(e) => change(key, e.target.value)}
              >
                <option value="">Any</option>
                {options.map(([value, text]) => (
                  <option value={value} key={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="flow-actions">
          <Button variant="quiet" onClick={() => setParams({})}>
            Clear all
          </Button>
          <Button onClick={() => setOpen(false)}>
            Show {list.length} quests
          </Button>
        </div>
      </Modal>
    </div>
  );
}
