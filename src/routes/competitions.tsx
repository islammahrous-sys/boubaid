import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy address only: the retired standalone section has no page content. */
export const Route = createFileRoute("/competitions")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
