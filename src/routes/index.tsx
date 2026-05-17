import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function IndexRedirectComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("squatgym_role");
    if (!role) {
      navigate({ to: "/login", replace: true });
      return;
    }
    
    if (role === "Admin") navigate({ to: "/admin/socios", replace: true });
    else if (role === "Secretaria") navigate({ to: "/desk/payments", replace: true });
    else if (role === "Encargado de Sucursal") navigate({ to: "/desk/proveedores", replace: true });
    else if (role === "Alumno") navigate({ to: "/app/billing", replace: true });
    else navigate({ to: "/login", replace: true });
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground font-medium">Cargando SquatGym...</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: IndexRedirectComponent,
});
