import { useState, useSyncExternalStore } from "react";
import { canInstall, installApp, subscribeInstall } from "../../services/installService";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { Button, Icon, Modal, PageHeader } from "../../components/ui";
import { createData } from "../../services/userService";

export default function Settings() {
  const { data, mutate, notify } = useApp();
  const navigate = useNavigate();
  const [reset, setReset] = useState(false);
  const installAvailable = useSyncExternalStore(subscribeInstall, canInstall, () => false);
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `sidequest-journal-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Your journal export is ready");
  }
  return (
    <div className="settings-page">
      <PageHeader
        title="A few practical things."
        description="Your journal, your choices."
        back="/profile"
      />
      <div className="settings-group">
        <h2>Your personal journal</h2>
        <p>
          Your profile, saved quests, progress, and photos stay in this browser.
          They work without an account or an internet connection. Export a
          backup before clearing browser data or changing devices.
        </p>
        <Link className="button secondary" to="/profile/preferences">
          Edit your preferences <Icon name="arrow" size={17} />
        </Link>
      </div>
      <div className="settings-group">
        <h2>Install SideQuest</h2>
        {installAvailable && (
          <Button onClick={async () => {
            try { await installApp(); }
            catch { notify("Use your browser menu to install SideQuest."); }
          }}>Install SideQuest</Button>
        )}
        <p>
          On Android, open this site in a normal Chrome tab. Tap the three-dot
          menu, then Add to Home screen and Install (or Install app). If you
          opened the link inside another app, open it in Chrome first.
          Installation is unavailable in Incognito mode. On iPhone or iPad, use Safari’s Share
          button and choose Add to Home Screen. The installed app opens on its
          own and works offline after its first load.
        </p>
        <p>
          Each device keeps a separate journal. Export a backup before switching
          devices.
        </p>
      </div>
      <div className="settings-group">
        <h2>Keep a copy</h2>
        <p>
          Download your profile, progress, notes, embedded photos, and safety
          reports as JSON.
        </p>
        <Button variant="secondary" onClick={exportData}>
          <Icon name="image" />
          Export my journal
        </Button>
      </div>
      <div className="settings-group">
        <h2>A quieter kind of app</h2>
        <p>
          No push notifications, advertising trackers, or streak to protect.
          SideQuest is here when you want a little possibility.
        </p>
        <p>
          Safety reports are included in your export. They stay on this device
          unless you choose to share them.
        </p>
      </div>
      <div className="settings-group">
        <h2>A fresh page</h2>
        <p>
          Clear this browser’s profile, saved quests, and journal. Export your
          memories first if you want to keep them.
        </p>
        <Button variant="secondary" onClick={() => setReset(true)}>
          Reset my journal
        </Button>
      </div>
      <Modal
        open={reset}
        onClose={() => setReset(false)}
        title="Start a completely fresh page?"
      >
        <p>
          This removes all experiences, XP, saved quests, and photos from this
          browser. It cannot be undone.
        </p>
        <div className="flow-actions">
          <Button variant="secondary" onClick={() => setReset(false)}>
            Keep my journal
          </Button>
          <Button
            onClick={() => {
              if (mutate(() => createData())) navigate("/home");
            }}
          >
            Reset my journal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
