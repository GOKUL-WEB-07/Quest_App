# SideQuest implementation plan

Repository inspected at project start: empty directory, no existing stack, routes, data, configuration, or assets.

## Current product decision

SideQuest is a personal, local journal. The root and former welcome URL open Home directly. There is no login, sign-up, or cloud account flow. Browser storage keeps the original `sidequest:v1:guest` key so previously saved local adventures survive. Settings provides a full JSON export for backup. The Firebase rules files remain only as reference material and are not deployed by the current hosting configuration.

## Product rule

SIDEQUEST SHOULD CREATE EXPERIENCES, NOT ANOTHER REASON TO STARE AT A SCREEN.

## Design direction

An activity deck and personal field journal. Left-aligned editorial headings, a photographic adventure feature, compact colored category tiles, and quiet supporting cards. Desktop uses a slim navigation rail and a generous main canvas; mobile uses bottom navigation and stacked content.

Tokens: paper #f7f8f2, ink #20382d, forest #234d38, yellow #f5d85b, sage #e3ecdc, muted #526254. Manrope for UI and display; system sans-serif fallback. Different radii reflect hierarchy, with restrained borders and no decorative gradients. Keep the discovery view inviting rather than metric-heavy. The one expressive element is the yellow Surprise me card with an illustrated compass.

## Architecture and phases

1. React, Vite, strict TypeScript; React Router; CSS tokens; accessible shared controls and responsive shell.
2. One durable browser journal under the existing storage key. Optional, skippable interest setup; no authentication.
3. Typed, published seed catalog (30+ quests), cards and details, rules-based recommendations, stepped quick quest, surprise and reroll.
4. Separate user progress, resumable checklist/timer, idempotent completion, XP, optional photo/reflection memories.
5. Discovery/search/filtering/saved, journal, profile/preferences, derived achievements and curated packs.
6. Image validation/compression, journal export, error recovery, loading/empty states, deployment documentation.
7. Strict build, business logic tests, browser acceptance and responsive checks at 390/768/1280/1440. Document browser storage limits and backup needs.

No hosted services were created or deployed. The bundled catalog and personal journal work without Firebase.
