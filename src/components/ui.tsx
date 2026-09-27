import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  Clock3,
  Compass,
  Dices,
  Footprints,
  Home,
  Image,
  Leaf,
  Lightbulb,
  MapPin,
  Menu,
  Palette,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trophy,
  Users,
  X,
  Zap,
  type LucideProps,
} from "lucide-react";
export function Icon({ name, ...props }: LucideProps & { name: string }) {
  const icons: Record<string, React.ComponentType<LucideProps>> = {
    arrow: ArrowRight,
    diagonal: ArrowUpRight,
    bookmark: Bookmark,
    check: Check,
    back: ChevronLeft,
    clock: Clock3,
    compass: Compass,
    dice: Dices,
    footprints: Footprints,
    home: Home,
    image: Image,
    leaf: Leaf,
    idea: Lightbulb,
    pin: MapPin,
    menu: Menu,
    palette: Palette,
    search: Search,
    settings: Settings,
    filter: SlidersHorizontal,
    sparkles: Sparkles,
    sun: Sun,
    trophy: Trophy,
    people: Users,
    close: X,
    zap: Zap,
  };
  const Component = icons[name] || Compass;
  return (
    <Component size={20} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}
export function Button({
  children,
  variant = "primary",
  className = "",
  busy,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "yellow";
  busy?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={`button ${variant} ${className}`}
      aria-busy={busy}
    >
      {busy ? <span className="spinner" /> : null}
      {children}
    </button>
  );
}
export function Chip({
  children,
  selected = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      aria-pressed={selected}
      className={`chip ${selected ? "selected" : ""}`}
    >
      {children}
    </button>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function EmptyState({
  title,
  description,
  icon = "compass",
  to = "/quest/generate",
  action = "Find a quest",
}: {
  title: string;
  description: string;
  icon?: string;
  to?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={32} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button primary" to={to}>
        {action}
        <Icon name="arrow" />
      </Link>
    </div>
  );
}
export function SkeletonLoader() {
  return (
    <div className="skeleton-page" role="status" aria-label="Loading SideQuest">
      <div className="skeleton heading" />
      <div className="skeleton hero" />
      <div className="quest-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton card" />
        ))}
      </div>
      <span className="sr-only">Loading SideQuest…</span>
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    else if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="modal-heading"
    >
      <div className="modal-top">
        <h2 id="modal-heading">{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function PageHeader({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: string;
  back?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      {back && (
        <Link className="back-link" to={back}>
          <Icon name="back" />
          Back
        </Link>
      )}
      <div className="section-heading">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
export function CoverImage({
  src,
  alt = "",
  className = "",
  eager = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
        e.currentTarget.parentElement?.classList.add("image-fallback");
      }}
    />
  );
}
