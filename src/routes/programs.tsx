import { createFileRoute, redirect } from "@tanstack/react-router";

/** The Programs page was retired; old links land on the home page. */
export const Route = createFileRoute("/programs")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
