import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/desk")({
  component: DeskLayout,
});

function DeskLayout() {
  return <Outlet />;
}
