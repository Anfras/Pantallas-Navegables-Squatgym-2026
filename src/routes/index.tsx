import { createFileRoute, redirect } from "@tanstack/react-router";

function IndexRedirectComponent() {
  return null;
}

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("squatgym_role");
      if (!role) {
        throw redirect({ to: "/login" });
      }
      
      // Redirección inteligente si ya está logueado
      if (role === "Admin") throw redirect({ to: "/admin/socios" });
      if (role === "Secretaria") throw redirect({ to: "/desk/payments" });
      if (role === "Encargado de Sucursal") throw redirect({ to: "/desk/proveedores" });
      if (role === "Alumno") throw redirect({ to: "/app/billing" });
    }
  },
  component: IndexRedirectComponent,
});
