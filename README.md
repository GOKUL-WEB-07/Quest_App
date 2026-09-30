# SideQuest

**Do something different today.** A personal adventure journal that helps you find a small offline experience and keep the moments that matter.

> SIDEQUEST SHOULD CREATE EXPERIENCES, NOT ANOTHER REASON TO STARE AT A SCREEN.

## Run locally

Node.js 22+ and npm are required. On Windows:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the address printed by Vite. SideQuest opens directly to Home. It needs no account, API key, or Firebase service. Your existing local SideQuest journal remains under the same browser storage key (`sidequest:v1:guest`), so progress made before the personal-app update remains available.

## Install from a browser

GitHub Pages deploys automatically from `main` using `.github/workflows/deploy.yml`. In repository **Settings → Pages**, the source must be **GitHub Actions**. The workflow runs `npm run build:pages`, which builds for `/Quest_App/` and uses hash routes so refreshing a screen works on GitHub Pages. Share https://gokul-web-07.github.io/Quest_App/ after deployment succeeds. Other hosting platforms continue to use `npm run build`.

Build and host the `dist` folder over HTTPS, then open the site on each device. On Android, choose **Install app** or **Add to Home screen** from Chrome’s menu. On Windows or macOS, use the install icon in Chrome or Edge’s address bar. On iPhone or iPad, open the site in Safari, tap **Share**, then **Add to Home Screen**. To try installation on this computer, run `npm.cmd run build` followed by `npm.cmd run preview` and use the preview address. A phone cannot install from the computer’s `127.0.0.1` address; it needs a hosted HTTPS site.

The production build includes a web app manifest, your black-on-white Q icon, and an offline service worker. After the first online visit, the installed app can open its bundled screens offline. Each browser and device has a separate journal; installation does not sync data across devices. Export a backup from Settings before moving to another device.

## How it works

React, Vite, strict TypeScript, React Router, and modular CSS form the frontend. The 32 published quests and six packs are bundled for immediate browsing. `AppProvider` owns one personal journal in browser storage; progress records never modify the master quest catalog. `src/services/` contains quest recommendations, progress, local persistence, image compression, and analytics event abstractions. Screens load by route. The app has no login, sign-up, or account prompt.

```text
src/
  app/          routes and error boundary
  components/   cards, controls, navigation, feedback
  features/     optional personal setup, quests, memories, packs, profile
  pages/        home, discover, memories, profile
  services/     recommendations, progress, local persistence, images
  stores/       personal journal state
  styles/       design tokens and responsive styles
  types/        quest, progress, memory and filter models
tests/          domain and browser acceptance tests
```

`/` and the former `/welcome` address go straight to `/home`. Optional interest and preference setup remains at `/onboarding/interests` and `/onboarding/preferences`; the same choices can be edited under `/profile/preferences`. Quest routes cover generation, details, active checklists, completion, and adding a memory. `/discover`, `/saved`, `/packs`, `/memories`, `/profile`, and `/settings` provide the rest of the experience.

The quest finder removes incompatible and completed quests, scores mood, time, location, interests, energy, and category novelty, then varies its pick among strong matches. Surprise me skips the setup choices. Quest completion awards XP once. Photo memories accept JPG, PNG, and WebP files up to 8 MB and compress them into the personal journal.

## Your data and backups

Profile, favorites, progress, memories, compressed photos, and safety notes are saved in this browser. They are available offline after the installed app's first successful load. **Settings → Export my journal** downloads them together as JSON. Export before clearing browser data or changing devices. There is no automatic cloud backup or cross-device sync. Browser storage can fill up after many photos; when saving fails, the app shows an error instead of claiming the change succeeded.

The repository still contains `firestore.rules` and `storage.rules` from the earlier account-based prototype because they may be useful as a reference. The personal app does not load Firebase or deploy those rules. `firebase.json` configures static hosting only. If hosted online, anyone with the site address can open their own separate local journal in their browser; this build has no access control for hosting.

## Verify

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run build
```

Domain tests cover catalog integrity, filtering, recommendations, XP, and once-only completion. Chrome tests cover direct entry, optional setup, quest discovery, saving, active progress after refresh, completion, memory photos, journal export, offline use, invalid photos, storage-full recovery, keyboard access, and responsive layouts at 390, 768, 1280, and 1440px. Automated WCAG AA scans cover key mobile and desktop screens. The build creates a static `dist` folder suitable for the hosting rewrites in `firebase.json` or `vercel.json`.
