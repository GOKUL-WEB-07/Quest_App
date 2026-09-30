import { Component, Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "../stores/AppProvider";
import { Shell } from "../components/layout/Shell";
import { EmptyState, SkeletonLoader } from "../components/ui";
const Home = lazy(() => import("../pages/Home/Home"));
const Onboarding = lazy(() => import("../features/onboarding/Onboarding"));
const QuickQuest = lazy(() => import("../features/quests/QuickQuest"));
const QuestDetail = lazy(() => import("../features/quests/QuestDetail"));
const ActiveQuest = lazy(() => import("../features/quests/ActiveQuest"));
const QuestComplete = lazy(() => import("../features/quests/QuestComplete"));
const AddMemory = lazy(() => import("../features/memories/AddMemory"));
const Discover = lazy(() => import("../pages/Discover/Discover"));
const Memories = lazy(() => import("../pages/Memories/Memories"));
const MemoryDetail = lazy(() =>
  import("../pages/Memories/Memories").then((m) => ({
    default: m.MemoryDetail,
  })),
);
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Achievements = lazy(() =>
  import("../pages/Profile/Profile").then((m) => ({ default: m.Achievements })),
);
const Preferences = lazy(() => import("../features/profile/Preferences"));
const Settings = lazy(() => import("../features/profile/Settings"));
const Packs = lazy(() => import("../features/packs/Packs"));
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="fatal-error">
        <h1>A little bump in the road.</h1>
        <p>
          SideQuest could not display this page. Your saved journal is still on
          this device.
        </p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Router() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <Routes>
        <Route path="/" element={<Navigate replace to="/home" />} />
        <Route path="/welcome" element={<Navigate replace to="/home" />} />
        <Route path="/onboarding/interests" element={<Onboarding />} />
        <Route path="/onboarding/preferences" element={<Onboarding />} />
        <Route element={<Shell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/:category" element={<Discover />} />
          <Route path="/search" element={<Discover />} />
          <Route path="/quest/generate" element={<QuickQuest />} />
          <Route path="/quest/:questId" element={<QuestDetail />} />
          <Route path="/quest/:questId/active" element={<ActiveQuest />} />
          <Route path="/quest/:questId/complete" element={<QuestComplete />} />
          <Route path="/quest/:questId/memory" element={<AddMemory />} />
          <Route path="/saved" element={<Discover saved />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/memories/:memoryId" element={<MemoryDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/achievements" element={<Achievements />} />
          <Route path="/profile/preferences" element={<Preferences />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/packs/:packId" element={<Packs />} />
          <Route
            path="*"
            element={
              <EmptyState
                title="A turn off the map."
                description="This page doesn’t exist. Your next adventure does."
                to="/home"
                action="Back home"
              />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
export default function App() {
  const AppRouter = import.meta.env.MODE === "github" ? HashRouter : BrowserRouter;
  return (
    <ErrorBoundary>
      <AppRouter>
        <AppProvider>
          <Router />
        </AppProvider>
      </AppRouter>
    </ErrorBoundary>
  );
}
