export type NotificationType =
  | "system"
  | "membership"
  | "role_change"
  | "financial"
  | "contribution"
  | "lineage"
  | "family_tree"
  | "event"
  | "event_registration"
  | "article"
  | "initiative"
  | "announcement"
  | "inquiry"
  | "contact_message"
  | "registration"
  | "general";

export type NotificationCategory =
  "all" | "unread" | "system" | "events" | "contributions" | "heritage";

export function getCategoryForType(type: string): NotificationCategory {
  switch (type) {
    case "event":
    case "event_registration":
      return "events";
    case "financial":
    case "contribution":
    case "treasury":
      return "contributions";
    case "lineage":
    case "family_tree":
    case "article":
    case "initiative":
    case "announcement":
      return "heritage";
    case "membership":
    case "role_change":
    case "system":
    case "account":
    case "registration":
    case "inquiry":
    case "contact_message":
    default:
      return "system";
  }
}
