import { createFileRoute, redirect } from "@tanstack/react-router";

/** The Competitions & Awards page was removed; old links/bookmarks land on the home page instead of a 404. */
export const Route = createFileRoute("/competitions")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
