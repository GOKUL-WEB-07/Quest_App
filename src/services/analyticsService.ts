export type AnalyticsEvent =
  | "app_opened"
  | "quest_viewed"
  | "quest_started"
  | "quest_skipped"
  | "quest_saved"
  | "quest_completed"
  | "memory_created"
  | "quest_rated"
  | "filter_used"
  | "chaos_used"
  | "pack_started"
  | "pack_completed";
// No third-party tracking in V1. An opt-in adapter can subscribe to these events.
export function track(
  event: AnalyticsEvent,
  properties: Record<string, string | number> = {},
) {
  window.dispatchEvent(
    new CustomEvent("sidequest:analytics", { detail: { event, properties } }),
  );
}
