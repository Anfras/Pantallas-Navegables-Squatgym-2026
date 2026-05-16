import { createFileRoute } from "@tanstack/react-router";
import { registrarAuditoria } from "@/utils/audit";
import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  UserMinus,
  UserCheck,
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/socios")({
  head: () => ({
    meta: [
      { title: "Gestión de Socios — SquatGym" },
      {
        name: "description",
        content:
          "Altas, bajas y administración de socios del gimnasio SquatGym, con planes, promociones y declaración de salud.",
      },
    ],
  }),
  component: SociosPage,
});

type Socio = {
  id: string;
  nombre: string;
  dni: string;
  plan: string;
  alta: string;
  estado: "Activo" | "Inactivo";
};

const PLANES = ["Musculación", "Zumba", "CrossFit", "Funcional", "Pilates"] as const;
const PROMOCIONES = ["Ninguna", "Plan Familiar", "Plan Amigos", "Estudiante", "Anual"] as const;

const SOCIOS_INICIALES: Socio[] = [
  { id: "1", nombre: "Juan Romero", dni: "30.215.498", plan: "Musculación", alta: "12/01/2024", estado: "Activo" },
  { id: "2", nombre: "Ana Gutiérrez", dni: "28.901.334", plan: "Zumba", alta: "03/03/2024", estado: "Activo" },
  { id: "3", nombre: "Pedro López", dni: "35.667.120", plan: "CrossFit", alta: "21/07/2023", estado: "Inactivo" },
  { id: "4", nombre: "María Fernández", dni: "32.118.770", plan: "Funcional", alta: "08/02/2025", estado: "Activo" },
  { id: "5", nombre: "Tomás Vega", dni: "40.225.881", plan: "Musculación", alta: "15/11/2024", estado: "Activo" },
  { id: "6", nombre: "Lucía Acosta", dni: "29.554.001", plan: "Pilates", alta: "30/09/2024", estado: "Inactivo" },
];

function SociosPage() {
  const [socios, setSocios] = useState(SOCIOS_INICIALES);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "Activo" | "Inactivo">("todos");
  const [filtroPlan, setFiltroPlan] = useState<string>("todos");
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    nombre: "",
    dni: "",
    celular: "",
    email: "",
    peso: "",
    estatura: "",
    actividad: "Musculación",
    promocion: "Ninguna",
    djFirmada: false,
    certificado: false,
  });

  const filtrados = useMemo(
    () =>
      socios.filter((s) => {
        const matchSearch =
          s.nombre.toLowerCase().includes(search.toLowerCase()) || s.dni.includes(search);
        const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado;
        const matchPlan = filtroPlan === "todos" || s.plan === filtroPlan;
        return matchSearch && matchEstado && matchPlan;
      }),
    [socios, search, filtroEstado, filtroPlan],
  );

  const resetForm = () =>
    setForm({
      nombre: "",
      dni: "",
      celular: "",
      email: "",
      peso: "",
      estatura: "",
      actividad: "Musculación",
      promocion: "Ninguna",
      djFirmada: false,
      certificado: false,
    });

  const soloLetras = (v: string) => v.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, "");
  const soloDigitos = (v: string) => v.replace(/\D/g, "");
  const formatoDni = (v: string) => {
    const d = soloDigitos(v).slice(0, 8);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, d.length - 3)}.${d.slice(-3)}`;
    return `${d.slice(0, d.length - 6)}.${d.slice(-6, -3)}.${d.slice(-3)}`;
  };
  const formatoCelular = (v: string) => {
    // permite + inicial y dígitos/espacios
    const limpio = v.replace(/[^\d+\s]/g, "");
    return limpio.startsWith("+") ? "+" + limpio.slice(1).replace(/\+/g, "") : limpio;
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.dni.trim()) {
      toast.error("Completá al menos Nombre y DNI.");
      return;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(form.nombre.trim())) {
      toast.error("El nombre solo puede contener letras.");
      return;
    }
    const dniDigitos = soloDigitos(form.dni);
    if (dniDigitos.length < 7 || dniDigitos.length > 8) {
      toast.error("El DNI debe tener entre 7 y 8 dígitos numéricos.");
      return;
    }
    if (form.celular) {
      const celDigitos = soloDigitos(form.celular);
      if (celDigitos.length < 8 || celDigitos.length > 15) {
        toast.error("El celular debe contener solo números (8 a 15 dígitos).");
        return;
      }
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Ingresá un email válido.");
      return;
    }
    if (form.peso) {
      const p = Number(form.peso);
      if (Number.isNaN(p) || p <= 0 || p > 400) {
        toast.error("El peso debe ser un número válido (kg).");
        return;
      }
    }
    if (form.estatura) {
      const h = Number(form.estatura);
      if (Number.isNaN(h) || h < 50 || h > 260) {
        toast.error("La estatura debe ser un número válido (cm).");
        return;
      }
    }
    if (!form.djFirmada) {
      toast.error("La Declaración Jurada debe estar firmada.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSocios((prev) => [
      {
        id: String(prev.length + 1),
        nombre: form.nombre,
        dni: form.dni,
        plan: form.actividad,
        alta: new Date().toLocaleDateString("es-AR"),
        estado: "Activo",
      },
      ...prev,
    ]);
    setLoading(false);
    setOpenForm(false);
    registrarAuditoria("Carlos Mendoza (Admin)", `Alta de socio: ${form.nombre}`, "Gestión de Socios");
    setSuccess(true);
    resetForm();
  };

  const darDeBaja = (id: string) => {
    const socio = socios.find(s => s.id === id);
    setSocios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "Inactivo" as const } : s)),
    );
    registrarAuditoria("Carlos Mendoza (Admin)", `Baja de socio: ${socio?.nombre}`, "Gestión de Socios");
    toast.success("Socio dado de baja. Acción registrada en auditoría.");
  };

  const reactivar = (id: string) => {
    const socio = socios.find(s => s.id === id);
    setSocios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "Activo" as const } : s)),
    );
    registrarAuditoria("Carlos Mendoza (Admin)", `Reactivación de socio: ${socio?.nombre}`, "Gestión de Socios");
    toast.success("Socio reactivado. Acción registrada en auditoría.");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Gestión de Socios
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {socios.length} socios registrados ·{" "}
              {socios.filter((s) => s.estado === "Activo").length} activos
            </p>
          </div>
          <Button
            onClick={() => setOpenForm(true)}
            className="h-11 gap-2 rounded-lg font-semibold"
          >
            <UserPlus className="h-4 w-4" /> Nuevo Socio
          </Button>
        </div>

        {/* Buscador y filtros */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o DNI..."
                className="h-11 rounded-lg border-border bg-background pl-9"
              />
            </div>
            <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as typeof filtroEstado)}>
              <SelectTrigger className="h-11 w-full rounded-lg border-border bg-background md:w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroPlan} onValueChange={setFiltroPlan}>
              <SelectTrigger className="h-11 w-full rounded-lg border-border bg-background md:w-48">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los planes</SelectItem>
                {PLANES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Tabla */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="px-4">Nombre</TableHead>
                  <TableHead className="px-4">DNI</TableHead>
                  <TableHead className="px-4">Plan</TableHead>
                  <TableHead className="px-4">Fecha de Alta</TableHead>
                  <TableHead className="px-4">Estado</TableHead>
                  <TableHead className="px-4 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((s) => (
                  <TableRow key={s.id} className="border-border">
                    <TableCell className="px-4 py-3 font-medium text-foreground">
                      {s.nombre}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {s.dni}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        {s.plan}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {s.alta}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            s.estado === "Activo"
                              ? "bg-primary shadow-[0_0_0_3px_oklch(0.86_0.22_130_/_0.25)]"
                              : "bg-muted-foreground/40"
                          }`}
                        />
                        <span className={s.estado === "Activo" ? "text-foreground" : "text-muted-foreground"}>
                          {s.estado}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
                          <Eye className="h-3.5 w-3.5" /> Perfil
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Button>
                        {s.estado === "Activo" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => darDeBaja(s.id)}
                            className="h-8 gap-1.5 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <UserMinus className="h-3.5 w-3.5" /> Baja
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reactivar(s.id)}
                            className="h-8 gap-1.5 rounded-lg border-primary text-foreground hover:bg-primary/10"
                          >
                            <UserCheck className="h-3.5 w-3.5 text-primary" /> Reactivar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No se encontraron socios con esos filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Pie auditoría */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border-l-4 border-primary bg-accent/40 p-4 shadow-soft">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Aviso de seguridad: </span>
            Toda modificación en el estado o plan del socio será registrada en el log de
            auditoría.
          </p>
        </div>
      </main>

      {/* Formulario Nuevo Socio */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Alta de Nuevo Socio</DialogTitle>
            <DialogDescription>
              Completá los datos del socio. La Declaración Jurada es obligatoria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Datos personales */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Nombre completo</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: soloLetras(e.target.value) })}
                    placeholder="Juan Romero"
                    maxLength={80}
                    autoComplete="name"
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">DNI</Label>
                  <Input
                    value={form.dni}
                    onChange={(e) => setForm({ ...form, dni: formatoDni(e.target.value) })}
                    placeholder="30.215.498"
                    inputMode="numeric"
                    maxLength={10}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Celular</Label>
                  <Input
                    value={form.celular}
                    onChange={(e) => setForm({ ...form, celular: formatoCelular(e.target.value) })}
                    placeholder="+54 11 ..."
                    inputMode="tel"
                    maxLength={20}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="socio@email.com"
                    maxLength={120}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Peso (kg)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={400}
                    step="0.1"
                    value={form.peso}
                    onChange={(e) => setForm({ ...form, peso: e.target.value })}
                    placeholder="75"
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Estatura (cm)</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={50}
                    max={260}
                    step="1"
                    value={form.estatura}
                    onChange={(e) => setForm({ ...form, estatura: e.target.value })}
                    placeholder="178"
                    className="h-10 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Plan */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plan y Promociones
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Actividad</Label>
                  <Select
                    value={form.actividad}
                    onValueChange={(v) => setForm({ ...form, actividad: v })}
                  >
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Promoción</Label>
                  <Select
                    value={form.promocion}
                    onValueChange={(v) => setForm({ ...form, promocion: v })}
                  >
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMOCIONES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Salud */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Salud (Vital)
              </h3>
              <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={form.djFirmada}
                    onCheckedChange={(c) => setForm({ ...form, djFirmada: c === true })}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Declaración Jurada Firmada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confirmo que el socio firmó la declaración jurada de salud.
                    </p>
                  </div>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, certificado: !form.certificado })}
                  className="h-10 w-full justify-start gap-2 rounded-lg"
                >
                  <Paperclip className="h-4 w-4" />
                  {form.certificado
                    ? "Certificado Médico adjuntado ✓"
                    : "Adjuntar Certificado Médico"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpenForm(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2 font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Confirmar Alta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <CheckCircle2 className="h-9 w-9 text-primary" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-foreground">¡Alta exitosa!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              El socio ha sido registrado correctamente en la base de datos centralizada.
            </p>
            <Button onClick={() => setSuccess(false)} className="mt-6 w-full font-semibold">
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
