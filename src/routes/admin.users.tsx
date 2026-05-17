import { createFileRoute, Link } from "@tanstack/react-router";
import { registrarAuditoria } from "@/utils/audit";
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  KeyRound,
  History,
  Pencil,
  Lock,
  Search,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  UserMinus,
  UserCheck,
  Eye,
  EyeOff,
  Settings2,
  Printer,
} from "lucide-react";
import { AUDITORIA, USUARIOS as USUARIOS_INICIALES } from "@/data/auditoria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Gestión de Usuarios y Seguridad — SquatGym" },
      {
        name: "description",
        content:
          "Administración de usuarios, roles, permisos y auditoría del sistema SquatGym.",
      },
    ],
  }),
  component: UsuariosPage,
});


type Rol = "Administrador" | "Secretaria" | "Entrenador" | "Encargado Kiosco";
const ROLES: Rol[] = ["Administrador", "Secretaria", "Entrenador", "Encargado Kiosco"];

const PERMISOS = [
  "Registrar Cobros",
  "Ver Listado de Deudores",
  "Gestionar Stock Kiosco",
  "Modificar Precios",
  "Registrar Pagos a Proveedores",
  "Gestionar Usuarios y Roles",
  "Exportar Reportes Financieros",
  "Editar Ficha de Alumnos",
  "Ver Historial de Auditoría",
] as const;

const PERMISOS_POR_ROL_DEFAULT: Record<Rol, string[]> = {
  Administrador: [...PERMISOS],
  Secretaria: ["Registrar Cobros", "Ver Listado de Deudores", "Editar Ficha de Alumnos"],
  Entrenador: ["Editar Ficha de Alumnos"],
  "Encargado Kiosco": ["Gestionar Stock Kiosco", "Modificar Precios"],
};


function UsuariosPage() {
  const [tab, setTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState(USUARIOS_INICIALES);
  const [search, setSearch] = useState("");
  
  const [logsAuditoria, setLogsAuditoria] = useState(() => {
    try {
      const saved = localStorage.getItem("squatgym_audit_logs");
      if (saved) return [...JSON.parse(saved), ...AUDITORIA];
    } catch (e) {}
    return AUDITORIA;
  });

  // Permisos por rol (plantilla base)
  const [permisosPorRol, setPermisosPorRol] = useState<Record<Rol, string[]>>(
    () => ({
      Administrador: [...PERMISOS_POR_ROL_DEFAULT.Administrador],
      Secretaria: [...PERMISOS_POR_ROL_DEFAULT.Secretaria],
      Entrenador: [...PERMISOS_POR_ROL_DEFAULT.Entrenador],
      "Encargado Kiosco": [...PERMISOS_POR_ROL_DEFAULT["Encargado Kiosco"]],
    }),
  );

  // Permisos individuales por usuario
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string>(
    USUARIOS_INICIALES[0].id,
  );
  const [permisosPorUsuario, setPermisosPorUsuario] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        USUARIOS_INICIALES.map((u) => [u.id, [...(PERMISOS_POR_ROL_DEFAULT[u.rol as Rol] ?? [])]]),
      ),
  );

  const usuarioSeleccionado = usuarios.find((u) => u.id === usuarioSeleccionadoId) ?? usuarios[0];
  const permisosUsuario = permisosPorUsuario[usuarioSeleccionado.id] ?? [];

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estado del editor de roles
  const [rolEnEdicion, setRolEnEdicion] = useState<Rol>("Secretaria");
  const [rolesAbierto, setRolesAbierto] = useState(false);
  const [edicionRolDesbloqueada, setEdicionRolDesbloqueada] = useState(false);

  // Modales de usuario
  const [editandoUsuario, setEditandoUsuario] = useState<typeof USUARIOS_INICIALES[number] | null>(null);
  const [formEdit, setFormEdit] = useState({ nombre: "", email: "", rol: "Secretaria" as Rol });
  const [confirmBaja, setConfirmBaja] = useState(false);

  const [pwForm, setPwForm] = useState({ nueva: "", repetir: "" });
  const [pwVisible, setPwVisible] = useState(false);

  const sugerenciasUsuarios = useMemo(() => {
    const q = busquedaUsuario.trim().toLowerCase();
    if (!q) return usuarios.slice(0, 6);
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q),
    );
  }, [usuarios, busquedaUsuario]);

  const filtrados = useMemo(
    () =>
      usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [usuarios, search],
  );

  const togglePermiso = (permiso: string) => {
    setPermisosPorUsuario((prev) => {
      const actual = prev[usuarioSeleccionado.id] ?? [];
      const nuevo = actual.includes(permiso)
        ? actual.filter((p) => p !== permiso)
        : [...actual, permiso];
      return { ...prev, [usuarioSeleccionado.id]: nuevo };
    });
  };

  const resetearAlRol = () => {
    setPermisosPorUsuario((prev) => ({
      ...prev,
      [usuarioSeleccionado.id]: [...(permisosPorRol[usuarioSeleccionado.rol as Rol] ?? [])],
    }));
    toast.success("Permisos restaurados según el rol base.");
  };

  const togglePermisoRol = (permiso: string) => {
    setPermisosPorRol((prev) => {
      const actual = prev[rolEnEdicion] ?? [];
      const nuevo = actual.includes(permiso)
        ? actual.filter((p) => p !== permiso)
        : [...actual, permiso];
      return { ...prev, [rolEnEdicion]: nuevo };
    });
  };

  const guardarPermisosRol = () => {
    registrarAuditoria("Carlos Mendoza (Admin)", `Permisos modificados para el rol ${rolEnEdicion}`, "Seguridad");
    toast.success(`Permisos del rol "${rolEnEdicion}" actualizados. Cambio registrado en auditoría.`);
    setEdicionRolDesbloqueada(false);
  };

  // Acciones usuario
  const abrirEditar = (u: typeof USUARIOS_INICIALES[number]) => {
    setEditandoUsuario(u);
    setFormEdit({ nombre: u.nombre, email: u.email, rol: u.rol as Rol });
    setPwForm({ nueva: "", repetir: "" });
    setPwVisible(false);
  };

  const guardarEdicion = () => {
    if (!editandoUsuario) return;
    if (!formEdit.nombre.trim()) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEdit.email)) {
      toast.error("Ingresá un email válido.");
      return;
    }
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === editandoUsuario.id
          ? { ...u, nombre: formEdit.nombre, email: formEdit.email, rol: formEdit.rol }
          : u,
      ),
    );
    registrarAuditoria("Carlos Mendoza (Admin)", `Perfil actualizado: ${formEdit.nombre}`, "Usuarios");
    toast.success("Perfil actualizado. Cambio registrado en auditoría.");
    setEditandoUsuario(null);
  };

  const confirmarBaja = () => {
    if (!editandoUsuario) return;
    setUsuarios((prev) =>
      prev.map((u) => (u.id === editandoUsuario.id ? { ...u, activo: false } : u)),
    );
    registrarAuditoria("Carlos Mendoza (Admin)", `Baja de usuario: ${editandoUsuario.nombre}`, "Usuarios");
    toast.success(`${editandoUsuario.nombre} fue dado de baja. Acción registrada en auditoría.`);
    setConfirmBaja(false);
    setEditandoUsuario(null);
  };

  const reactivarUsuario = () => {
    if (!editandoUsuario) return;
    setUsuarios((prev) =>
      prev.map((u) => (u.id === editandoUsuario.id ? { ...u, activo: true } : u)),
    );
    toast.success(`${editandoUsuario.nombre} fue reactivado.`);
    setEditandoUsuario((u) => (u ? { ...u, activo: true } : u));
  };

  const guardarPassword = () => {
    if (!editandoUsuario) return;
    if (pwForm.nueva.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pwForm.nueva !== pwForm.repetir) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    registrarAuditoria("Carlos Mendoza (Admin)", `Cambio de contraseña para: ${editandoUsuario.nombre}`, "Seguridad");
    toast.success(`Contraseña actualizada para ${editandoUsuario.nombre}. Acción auditada.`);
    setPwForm({ nueva: "", repetir: "" });
    setPwVisible(false);
  };

  const permisosRolActual = permisosPorRol[rolEnEdicion] ?? [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Gestión de Roles y Auditoría
          </h1>
        </div>

        {/* Banner de acceso restringido */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl border-l-4 border-primary bg-accent/40 p-4 shadow-soft">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Acceso exclusivo Nivel Administrador</p>
            <p className="text-muted-foreground">
              Todas las modificaciones realizadas en este módulo se registran bajo protocolo de
              auditoría.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="h-11 rounded-xl bg-muted p-1">
            <TabsTrigger value="usuarios" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-soft">
              <Users className="h-4 w-4" /> Usuarios
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-soft">
              <KeyRound className="h-4 w-4" /> Permisos
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-soft">
              <History className="h-4 w-4" /> Auditoría
            </TabsTrigger>
          </TabsList>

          {/* USUARIOS */}
          <TabsContent value="usuarios" className="mt-0">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Panel de gestión de usuarios</h2>
                  <p className="text-sm text-muted-foreground">
                    {usuarios.length} usuarios registrados ·{" "}
                    {usuarios.filter((u) => u.activo).length} activos
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="h-10 w-full rounded-lg border-border bg-background pl-9 sm:w-72"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="px-4">Nombre</TableHead>
                      <TableHead className="px-4">Email</TableHead>
                      <TableHead className="px-4">Rol Actual</TableHead>
                      <TableHead className="px-4">Estado</TableHead>
                      <TableHead className="px-4 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtrados.map((u) => (
                      <TableRow key={u.id} className="border-border">
                        <TableCell className="px-4 py-3 font-medium">
                          <Link
                            to="/admin/audit/$userId"
                            params={{ userId: u.id }}
                            className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-primary"
                            title="Ver auditoría individual"
                          >
                            {u.nombre}
                            <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                            {u.rol}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                            <span
                              className={`h-2 w-2 rounded-full ${u.activo ? "bg-primary shadow-[0_0_0_3px_oklch(0.86_0.22_130_/_0.25)]" : "bg-muted-foreground/40"}`}
                            />
                            <span className={u.activo ? "text-foreground" : "text-muted-foreground"}>
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
                              <Link to="/admin/audit/$userId" params={{ userId: u.id }}>
                                <History className="h-3.5 w-3.5" /> Ver auditoría
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 rounded-lg"
                              onClick={() => abrirEditar(u)}
                            >
                              <Pencil className="h-3.5 w-3.5" /> Editar
                            </Button>

                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          No se encontraron usuarios.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </TabsContent>

          {/* PERMISOS POR USUARIO */}
          <TabsContent value="roles" className="mt-0 space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Permisos individuales por usuario
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Seleccioná un usuario para ajustar de forma puntual qué acciones puede realizar dentro del sistema.
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Usuario a configurar
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={busquedaUsuario}
                      onChange={(e) => {
                        setBusquedaUsuario(e.target.value);
                        setMostrarSugerencias(true);
                      }}
                      onFocus={() => setMostrarSugerencias(true)}
                      onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                      placeholder="Buscar por nombre, email o rol..."
                      className="h-11 rounded-lg border-border bg-background pl-9"
                    />
                  </div>
                  {mostrarSugerencias && sugerenciasUsuarios.length > 0 && (
                    <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-border bg-popover shadow-card">
                      {sugerenciasUsuarios.map((u) => {
                        const seleccionado = u.id === usuarioSeleccionado.id;
                        return (
                          <button
                            type="button"
                            key={u.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setUsuarioSeleccionadoId(u.id);
                              setBusquedaUsuario("");
                              setMostrarSugerencias(false);
                            }}
                            className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                              seleccionado ? "bg-accent/60" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{u.nombre}</p>
                              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {u.rol}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {mostrarSugerencias &&
                    sugerenciasUsuarios.length === 0 &&
                    busquedaUsuario.trim() && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover px-3 py-3 text-sm text-muted-foreground shadow-card">
                        Sin coincidencias.
                      </div>
                    )}
                </div>
              </div>

              <div className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {usuarioSeleccionado.nombre}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {usuarioSeleccionado.email}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rol base:{" "}
                    <span className="font-medium text-foreground">{usuarioSeleccionado.rol}</span>.
                    Los cambios aplican únicamente a este usuario.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PERMISOS.map((permiso) => {
                  const activo = permisosUsuario.includes(permiso);
                  return (
                    <button
                      type="button"
                      key={permiso}
                      onClick={() => togglePermiso(permiso)}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        activo
                          ? "border-primary bg-accent/40 shadow-soft"
                          : "border-border bg-background hover:border-foreground/20"
                      }`}
                    >
                      {activo ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.5} />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={`text-sm ${activo ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                      >
                        {permiso}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {permisosUsuario.length} de {PERMISOS.length} permisos asignados a{" "}
                  <span className="font-semibold text-foreground">{usuarioSeleccionado.nombre}</span>.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetearAlRol}
                    className="h-10 gap-2 rounded-lg"
                  >
                    Restaurar permisos del rol
                  </Button>
                  <Button
                    className="h-10 gap-2 rounded-lg font-semibold"
                    onClick={() => toast.success("Permisos del usuario guardados.")}
                  >
                    <ShieldCheck className="h-4 w-4" /> Guardar cambios
                  </Button>
                </div>
              </div>
            </section>

            {/* CONFIGURACIÓN AVANZADA: Permisos por rol */}
            <Collapsible open={rolesAbierto} onOpenChange={setRolesAbierto}>
              <section className="rounded-2xl border border-dashed border-border bg-muted/20">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-foreground">
                      <Settings2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Configuración avanzada — Permisos por rol
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Modifica la plantilla base de permisos de un rol completo. Afecta a todos los usuarios con ese rol.
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${rolesAbierto ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Acción de alto impacto</p>
                        Los cambios aquí redefinen la plantilla del rol y se reflejarán en todos los usuarios que lo utilicen como base. Por seguridad, debés desbloquear la edición manualmente.
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Rol a editar
                        </Label>
                        <Select value={rolEnEdicion} onValueChange={(v) => setRolEnEdicion(v as Rol)}>
                          <SelectTrigger className="h-11 rounded-lg border-border bg-background sm:w-72">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5">
                        <div className="text-xs">
                          <p className="font-medium text-foreground">Edición desbloqueada</p>
                          <p className="text-muted-foreground">Activá para modificar permisos</p>
                        </div>
                        <Switch
                          checked={edicionRolDesbloqueada}
                          onCheckedChange={setEdicionRolDesbloqueada}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {PERMISOS.map((permiso) => {
                        const activo = permisosRolActual.includes(permiso);
                        return (
                          <button
                            type="button"
                            key={permiso}
                            disabled={!edicionRolDesbloqueada}
                            onClick={() => togglePermisoRol(permiso)}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                              activo
                                ? "border-primary/60 bg-accent/30"
                                : "border-border bg-background"
                            } ${!edicionRolDesbloqueada ? "cursor-not-allowed opacity-60" : "hover:border-foreground/20"}`}
                          >
                            {activo ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                            )}
                            <span className={`text-sm ${activo ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                              {permiso}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        {permisosRolActual.length} de {PERMISOS.length} permisos en la plantilla de{" "}
                        <span className="font-semibold text-foreground">{rolEnEdicion}</span>.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="h-10 rounded-lg"
                          disabled={!edicionRolDesbloqueada}
                          onClick={() => {
                            setPermisosPorRol((prev) => ({
                              ...prev,
                              [rolEnEdicion]: [...PERMISOS_POR_ROL_DEFAULT[rolEnEdicion]],
                            }));
                            toast.success("Plantilla restaurada al valor de fábrica.");
                          }}
                        >
                          Restaurar valores por defecto
                        </Button>
                        <Button
                          className="h-10 gap-2 rounded-lg font-semibold"
                          disabled={!edicionRolDesbloqueada}
                          onClick={guardarPermisosRol}
                        >
                          <ShieldCheck className="h-4 w-4" /> Guardar plantilla del rol
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </TabsContent>

          {/* AUDITORÍA */}
          <TabsContent value="auditoria" className="mt-0">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <AlertTriangle className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Historial de actividad y auditoría
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Registro cronológico inmutable de todas las acciones realizadas en el sistema.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-9 shrink-0 gap-1.5 rounded-lg print:hidden"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir informe de Auditoría
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="px-4">Fecha / Hora</TableHead>
                      <TableHead className="px-4">Usuario</TableHead>
                      <TableHead className="px-4">Acción realizada</TableHead>
                      <TableHead className="px-4">Módulo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsAuditoria.map((entry) => (
                      <TableRow key={entry.id} className="border-border">
                        <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {entry.fecha}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-foreground">
                          {entry.usuario}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground/80">
                          {entry.accion}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {entry.modulo}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL EDITAR USUARIO */}
      <Dialog
        open={!!editandoUsuario}
        onOpenChange={(o) => {
          if (!o) setEditandoUsuario(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" /> Editar perfil de usuario
            </DialogTitle>
            <DialogDescription>
              Modificá los datos del usuario. Los cambios quedan registrados en auditoría.
            </DialogDescription>
          </DialogHeader>

          {editandoUsuario && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {editandoUsuario.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-foreground">ID #{editandoUsuario.id}</p>
                  <p className="text-muted-foreground">
                    Estado actual:{" "}
                    <span className={editandoUsuario.activo ? "font-medium text-foreground" : "font-medium text-destructive"}>
                      {editandoUsuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-nombre" className="text-xs font-medium text-muted-foreground">
                  Nombre completo
                </Label>
                <Input
                  id="edit-nombre"
                  value={formEdit.nombre}
                  onChange={(e) => setFormEdit((f) => ({ ...f, nombre: e.target.value }))}
                  className="h-10 rounded-lg border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs font-medium text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formEdit.email}
                  onChange={(e) => setFormEdit((f) => ({ ...f, email: e.target.value }))}
                  className="h-10 rounded-lg border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Rol asignado</Label>
                <Select
                  value={formEdit.rol}
                  onValueChange={(v) => setFormEdit((f) => ({ ...f, rol: v as Rol }))}
                >
                  <SelectTrigger className="h-10 rounded-lg border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Zona sensible
                </p>
                {editandoUsuario.activo ? (
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-2 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmBaja(true)}
                  >
                    <UserMinus className="h-4 w-4" /> Dar de baja al usuario
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-center gap-2 rounded-lg"
                    onClick={reactivarUsuario}
                  >
                    <UserCheck className="h-4 w-4" /> Reactivar usuario
                  </Button>
                )}
                
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-3 text-xs font-semibold text-foreground">Restablecer contraseña</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type={pwVisible ? "text" : "password"}
                        value={pwForm.nueva}
                        onChange={(e) => setPwForm((f) => ({ ...f, nueva: e.target.value }))}
                        className="h-9 rounded-lg border-border bg-background pr-10 text-sm"
                        placeholder="Nueva contraseña (Mín 8 caracteres)"
                      />
                      <button
                        type="button"
                        onClick={() => setPwVisible((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {pwVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <Input
                      type={pwVisible ? "text" : "password"}
                      value={pwForm.repetir}
                      onChange={(e) => setPwForm((f) => ({ ...f, repetir: e.target.value }))}
                      className="h-9 rounded-lg border-border bg-background text-sm"
                      placeholder="Repetir nueva contraseña"
                    />
                    <Button 
                      variant="outline"
                      onClick={guardarPassword} 
                      className="h-9 w-full gap-2 rounded-lg text-xs font-semibold"
                      disabled={!pwForm.nueva || !pwForm.repetir}
                    >
                      <Lock className="h-3.5 w-3.5" /> Actualizar credencial
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditandoUsuario(null)} className="h-10 rounded-lg">
              Cancelar
            </Button>
            <Button onClick={guardarEdicion} className="h-10 gap-2 rounded-lg font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAR BAJA */}
      <AlertDialog open={confirmBaja} onOpenChange={setConfirmBaja}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja a este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              {editandoUsuario?.nombre} dejará de poder iniciar sesión. La acción quedará registrada en auditoría y podés reactivarlo más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarBaja} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, dar de baja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}
