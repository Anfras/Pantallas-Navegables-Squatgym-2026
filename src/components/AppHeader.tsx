import { Link, useNavigate } from "@tanstack/react-router";
import { Dumbbell, UserCircle2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type Role = "Admin" | "Encargado de Sucursal" | "Secretaria" | "Alumno";

const NAV: { to?: any; label: string; roles: Role[]; onClick?: () => void }[] = [
  { to: "/admin/socios", label: "Gestión de Socios", roles: ["Admin"] },
  { to: "/admin/users", label: "Usuarios y Seguridad", roles: ["Admin"] },
  { to: "/admin/pricing", label: "Promociones y Precios", roles: ["Admin"] },
  
  { to: "/desk/", label: "Recepción", roles: ["Secretaria"] },
  
  { to: "/app/billing", label: "Mi Cuenta", roles: ["Alumno"] },
  { 
    label: "Ficha de Salud", 
    roles: ["Alumno"],
    onClick: () => toast.info("Ficha de Salud — declaración jurada y certificados.")
  },
  { 
    label: "Mi Asistencia", 
    roles: ["Alumno"],
    onClick: () => toast.info("Mi Asistencia — historial de clases asistidas.")
  },
  { 
    label: "Cronograma", 
    roles: ["Alumno"],
    onClick: () => toast.info("Cronograma — horarios y clases habilitadas según tu plan.")
  },

  { to: "/desk/proveedores", label: "Pago a Proveedores", roles: ["Encargado de Sucursal"] },
];

export function AppHeader({
  adminName: propName,
  role: propRole,
}: {
  adminName?: string;
  role?: Role;
}) {
  const [currentRole, setCurrentRole] = useState<Role>("Admin");
  const [currentName, setCurrentName] = useState("Carlos Mendoza");
  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem("squatgym_role") as Role;
    const savedName = localStorage.getItem("squatgym_name");
    if (savedRole) setCurrentRole(savedRole);
    if (savedName) setCurrentName(savedName);
  }, []);

  const visibleNav = NAV.filter((item) => item.roles.includes(currentRole));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Dumbbell className="h-7 w-7 -rotate-45 text-primary" strokeWidth={2.4} />
          <span className="text-lg font-bold tracking-tight text-foreground">SquatGym</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleNav.map((item) => (
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{
                  className:
                    "rounded-full px-3.5 py-1.5 text-sm font-semibold bg-accent text-accent-foreground",
                }}
                activeOptions={{ exact: true }}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </button>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
            <UserCircle2 className="h-5 w-5 text-foreground/70" strokeWidth={1.8} />
            <span className="hidden text-sm text-foreground sm:inline">
              {currentRole}: <span className="font-semibold">{currentName}</span>
            </span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("squatgym_role");
              localStorage.removeItem("squatgym_name");
              navigate({ to: "/login" });
            }}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-soft transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
