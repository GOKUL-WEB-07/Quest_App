import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { quests } from "../quests/catalog";
import { compressImage, savePhoto } from "../../services/memoryService";
import { friendlyError } from "../../utils/errors";
import { track } from "../../services/analyticsService";
import {
  Button,
  EmptyState,
  Icon,
  PageHeader,
  ProgressBar,
} from "../../components/ui";
export default function AddMemory() {
  const { questId } = useParams();
  const quest = quests.find((q) => q.id === questId);
  const { data, mutate } = useApp();
  const navigate = useNavigate();
  const [blob, setBlob] = useState<Blob | null>(null),
    [preview, setPreview] = useState(""),
    [rating, setRating] = useState(0),
    [busy, setBusy] = useState(false),
    [preparing, setPreparing] = useState(false),
    [upload, setUpload] = useState(0),
    [error, setError] = useState("");
  const photoVersion = useRef(0),
    locked = useRef(false),
    uploaded = useRef("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const existing = data.memories.find((m) => m.questId === questId);
  if (!quest || data.progress[quest.id]?.status !== "completed")
    return (
      <EmptyState
        title="First, make an experience."
        description="Your memory starts with a completed SideQuest."
      />
    );
  if (existing)
    return (
      <EmptyState
        title="This moment is already in your journal."
        description="You can revisit it whenever you like."
        to={`/memories/${existing.id}`}
        action="View memory"
      />
    );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quest || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const image = blob
        ? uploaded.current || (await savePhoto(blob, setUpload))
        : "";
      uploaded.current = image;
      const now = new Date().toISOString(),
        id = crypto.randomUUID();
      const memory = {
        id,
        userId: data.profile.id,
        questId: quest.id,
        title: String(form.get("title")).trim() || quest.title,
        note: String(form.get("note")).trim(),
        images: image ? [image] : [],
        rating,
        location: { name: String(form.get("location")).trim() },
        completedAt: data.progress[quest.id].completedAt!,
        createdAt: now,
      };
      if (
        mutate((d) =>
          d.memories.some((m) => m.questId === quest.id)
            ? d
            : { ...d, memories: [memory, ...d.memories] },
        )
      ) {
        track("memory_created", { questId: quest.id });
        if (rating) track("quest_rated", { questId: quest.id, rating });
        navigate(`/memories/${id}`, { replace: true });
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  return (
    <div className="memory-form-page">
      <PageHeader
        title="Keep a little piece of today."
        description="A photo, a few words, or just the feeling. Make it yours."
        back={`/quest/${quest.id}/complete`}
      />
      <form className="memory-form" onSubmit={submit}>
        <div className="photo-upload">
          {preview ? (
            <>
              <img src={preview} alt="Your memory preview" />
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  photoVersion.current++;
                  setBlob(null);
                  setPreview("");
                  uploaded.current = "";
                  setPreparing(false);
                }}
              >
                Remove photo
              </Button>
            </>
          ) : (
            <label className="upload-label">
              <Icon name="image" size={38} />
              <strong>
                {preparing ? "Preparing your photo…" : "A moment worth keeping"}
              </strong>
              <span>Add a photo · JPG, PNG, WebP · Up to 8 MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy || preparing}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const version = ++photoVersion.current;
                  setError("");
                  setPreparing(true);
                  try {
                    const compressed = await compressImage(file);
                    if (version === photoVersion.current) {
                      setBlob(compressed);
                      setPreview(URL.createObjectURL(compressed));
                      uploaded.current = "";
                    }
                  } catch (error) {
                    setError(friendlyError(error));
                  } finally {
                    if (version === photoVersion.current) setPreparing(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          )}
        </div>
        <div>
          <label>
            Give this moment a name
            <input
              name="title"
              defaultValue={quest.title}
              maxLength={100}
              required
            />
          </label>
          <label>
            What will you remember? <span className="muted">Optional</span>
            <textarea
              name="note"
              rows={4}
              maxLength={2000}
              placeholder="The light, the unexpected detail, how it felt…"
            />
          </label>
          <label>
            A place to remember <span className="muted">Optional</span>
            <input
              name="location"
              maxLength={100}
              placeholder="The park around the corner"
            />
          </label>
          <fieldset className="rating">
            <legend>
              How was your adventure? <span className="muted">Optional</span>
            </legend>
            <div>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  aria-label={`Rate ${n} out of 5`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(rating === n ? 0 : n)}
                  className={rating >= n ? "rated" : ""}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          {busy && blob && (
            <ProgressBar value={upload} label="Photo upload progress" />
          )}
          <Button type="submit" busy={busy} disabled={preparing}>
            Save the memory <Icon name="check" />
          </Button>
          <p className="small-text muted">
            Your memories live in this browser. Export your journal in Settings
            to keep a backup.
          </p>
        </div>
      </form>
    </div>
  );
}
