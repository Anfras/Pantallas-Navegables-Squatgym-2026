import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { registrarAuditoria } from "@/utils/audit";
import { useMemo, useState } from "react";
import {
  Dumbbell,
  LogOut,
  Search,
  UserPlus,
  Wallet,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  IdCard,
  Phone,
  Mail,
  ClipboardCheck,
  Tag,
  Percent,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/")({
  head: () => ({
    meta: [
      { title: "Panel de Recepción — SquatGym" },
      {
        name: "description",
        content:
          "Panel de la Secretaría: búsqueda rápida de socios, inscripción y control de habilitación de acceso al gimnasio.",
      },
    ],
  }),
  component: RecepcionPage,
});

type SocioRecepcion = {
  id: string;
  nombre: string;
  dni: string;
  plan: string;
  estado: "HABILITADO" | "DEUDOR";
};

const PLANES = ["Musculación", "Zumba", "CrossFit", "Funcional", "Pilates"] as const;

const PRECIOS_PLAN: Record<string, number> = {
  "Musculación": 18000,
  "Zumba": 14000,
  "CrossFit": 22000,
  "Funcional": 16000,
  "Pilates": 17000,
};

type Promocion = {
  codigo: string;
  nombre: string;
  descripcion: string;
  descuento: number; // porcentaje
};

const PROMOCIONES: Promocion[] = [
  { codigo: "NINGUNA", nombre: "Sin promoción", descripcion: "No aplicar promoción", descuento: 0 },
  { codigo: "BIENVENIDA20", nombre: "Bienvenida 20%", descripcion: "20% off primer mes para nuevos socios", descuento: 20 },
  { codigo: "FAMILIA15", nombre: "Plan Familiar 15%", descripcion: "15% off al inscribir un familiar directo", descuento: 15 },
  { codigo: "ESTUDIANTE10", nombre: "Estudiante 10%", descripcion: "10% off presentando libreta vigente", descuento: 10 },
  { codigo: "ANUAL25", nombre: "Pago Anual 25%", descripcion: "25% off abonando 12 meses por adelantado", descuento: 25 },
];

const formatoARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const SOCIOS_INICIALES: SocioRecepcion[] = [
  { id: "1", nombre: "Juan Romero", dni: "30215498", plan: "Musculación", estado: "HABILITADO" },
  { id: "2", nombre: "Ana Gutiérrez", dni: "28901334", plan: "Zumba", estado: "HABILITADO" },
  { id: "3", nombre: "Pedro López", dni: "35667120", plan: "CrossFit", estado: "DEUDOR" },
  { id: "4", nombre: "María Fernández", dni: "32118770", plan: "Funcional", estado: "HABILITADO" },
  { id: "5", nombre: "Tomás Vega", dni: "40225881", plan: "Musculación", estado: "DEUDOR" },
  { id: "6", nombre: "Lucía Acosta", dni: "29554001", plan: "Pilates", estado: "HABILITADO" },
];

const soloLetras = (v: string) => v.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, "");
const soloDigitos = (v: string) => v.replace(/\D/g, "");
const formatoCelular = (v: string) => {
  const limpio = v.replace(/[^\d+\s]/g, "");
  return limpio.startsWith("+") ? "+" + limpio.slice(1).replace(/\+/g, "") : limpio;
};
const formatoDniDisplay = (d: string) => {
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, d.length - 3)}.${d.slice(-3)}`;
  return `${d.slice(0, d.length - 6)}.${d.slice(-6, -3)}.${d.slice(-3)}`;
};

function avatarInitials(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RecepcionPage() {
  const navigate = useNavigate();
  const [socios, setSocios] = useState<SocioRecepcion[]>(SOCIOS_INICIALES);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "HABILITADO" | "DEUDOR">("TODOS");
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    dni: "",
    celular: "",
    email: "",
    djFirmada: false,
    plan: "Musculación",
    promo: "NINGUNA",
  });

  const promoActual = useMemo(
    () => PROMOCIONES.find((p) => p.codigo === form.promo) ?? PROMOCIONES[0],
    [form.promo],
  );
  const precioBase = PRECIOS_PLAN[form.plan] ?? 0;
  const descuentoMonto = Math.round((precioBase * promoActual.descuento) / 100);
  const precioFinal = precioBase - descuentoMonto;

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDni = soloDigitos(q);
    return socios.filter((s) => {
      if (filtroEstado !== "TODOS" && s.estado !== filtroEstado) return false;
      if (!q) return true;
      return (
        s.nombre.toLowerCase().includes(q) ||
        (qDni.length > 0 && s.dni.includes(qDni))
      );
    });
  }, [socios, search, filtroEstado]);

  const habilitados = socios.filter((s) => s.estado === "HABILITADO").length;
  const deudores = socios.length - habilitados;

  const resetForm = () =>
    setForm({
      nombre: "",
      dni: "",
      celular: "",
      email: "",
      djFirmada: false,
      plan: "Musculación",
      promo: "NINGUNA",
    });

  const handleInscribir = async () => {
    // Validaciones
    if (!form.nombre.trim() || !form.dni.trim()) {
      toast.error("Completá Nombre y DNI.");
      return;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(form.nombre.trim())) {
      toast.error("El nombre solo puede contener letras.");
      return;
    }
    const dni = soloDigitos(form.dni);
    if (dni.length < 7 || dni.length > 8) {
      toast.error("El DNI debe tener entre 7 y 8 dígitos numéricos.");
      return;
    }
    if (form.celular) {
      const cel = soloDigitos(form.celular);
      if (cel.length < 8 || cel.length > 15) {
        toast.error("El celular debe contener solo números (8 a 15 dígitos).");
        return;
      }
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Ingresá un email válido.");
      return;
    }
    if (!form.djFirmada) {
      toast.error("La Declaración Jurada de Salud es obligatoria.");
      return;
    }

    // Validación de duplicado por DNI
    const yaExiste = socios.some((s) => s.dni === dni);
    if (yaExiste) {
      toast.error("El socio ya se encuentra registrado.", {
        description: `Ya existe un socio con DNI ${formatoDniDisplay(dni)}.`,
      });
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSocios((prev) => [
      {
        id: String(prev.length + 1),
        nombre: form.nombre.trim(),
        dni,
        plan: form.plan,
        estado: "HABILITADO",
      },
      ...prev,
    ]);
    setLoading(false);
    setOpenForm(false);
    const detallePromo =
      promoActual.descuento > 0
        ? `Promo "${promoActual.nombre}" aplicada · Cuota: ${formatoARS(precioFinal)} (${promoActual.descuento}% off)`
        : `Cuota: ${formatoARS(precioFinal)} · Sin promoción`;
    
    registrarAuditoria(
      "Ana (Recepción)",
      `Alta de socio: ${form.nombre.trim()} (DNI ${dni})`,
      "Recepción"
    );

    toast.success("Socio inscripto correctamente.", {
      description: `${detallePromo}. Acción registrada en auditoría.`,
    });
    resetForm();
  };

  const cobrarCuota = (s: SocioRecepcion) => {
    navigate({
      to: "/desk/payments",
      search: { socioId: s.id, nombre: s.nombre, dni: s.dni, plan: s.plan },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header propio Recepción */}
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Encabezado */}
        <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Recepción
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {socios.length} socios · {habilitados} habilitados · {deudores} con deuda
            </p>
          </div>
          <Button
            onClick={() => setOpenForm(true)}
            className="h-12 gap-2 rounded-xl px-5 text-base font-bold shadow-card"
          >
            <UserPlus className="h-5 w-5" /> Inscribir Nuevo Socio
          </Button>
        </section>

        {/* Buscador prominente */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Buscador rápido
          </Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI o Nombre del socio..."
              className="h-14 rounded-xl border-border bg-background pl-12 text-base"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filtrar:
            </span>
            {(["TODOS", "HABILITADO", "DEUDOR"] as const).map((f) => {
              const active = filtroEstado === f;
              const isDeudor = f === "DEUDOR";
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroEstado(f)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? isDeudor
                        ? "border-destructive bg-destructive/15 text-destructive"
                        : "border-primary bg-primary/20 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {f === "TODOS" ? "Todos" : f === "HABILITADO" ? "Habilitados" : "Deudores"}
                  {f === "DEUDOR" && (
                    <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}>
                      {deudores}
                    </span>
                  )}
                </button>
              );
            })}
            {(search || filtroEstado !== "TODOS") && (
              <p className="ml-auto text-xs text-muted-foreground">
                {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </section>

        {/* Tabla maestro */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="px-4">Socio</TableHead>
                  <TableHead className="px-4">DNI</TableHead>
                  <TableHead className="px-4">Plan</TableHead>
                  <TableHead className="px-4">Acceso</TableHead>
                  <TableHead className="px-4 text-right">Acción rápida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((s) => (
                  <TableRow key={s.id} className="border-border">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                          {avatarInitials(s.nombre)}
                        </div>
                        <span className="font-medium text-foreground">{s.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatoDniDisplay(s.dni)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        {s.plan}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {s.estado === "HABILITADO" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-bold text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          HABILITADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          DEUDOR
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        variant={s.estado === "DEUDOR" ? "default" : "outline"}
                        size="sm"
                        onClick={() => cobrarCuota(s)}
                        className="h-9 gap-1.5 rounded-lg font-semibold"
                      >
                        <Wallet className="h-4 w-4" />
                        Cobrar Cuota
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No se encontraron socios con esa búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Nota de auditoría */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border-l-4 border-primary bg-accent/40 p-4 shadow-soft">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Nota de seguridad: </span>
            Toda inscripción y verificación de estado es auditada por el sistema.
          </p>
        </div>
      </main>

      {/* Modal Inscripción */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Inscribir Nuevo Socio</DialogTitle>
            <DialogDescription>
              Cargá los datos del nuevo socio. La Declaración Jurada de Salud es
              obligatoria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Datos personales */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Datos personales
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: soloLetras(e.target.value) })
                      }
                      placeholder="Juan Romero"
                      maxLength={80}
                      className="h-10 rounded-lg pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">DNI</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={form.dni}
                      onChange={(e) =>
                        setForm({ ...form, dni: soloDigitos(e.target.value).slice(0, 8) })
                      }
                      placeholder="30215498"
                      inputMode="numeric"
                      maxLength={8}
                      className="h-10 rounded-lg pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={form.celular}
                      onChange={(e) =>
                        setForm({ ...form, celular: formatoCelular(e.target.value) })
                      }
                      placeholder="+54 11 ..."
                      inputMode="tel"
                      maxLength={20}
                      className="h-10 rounded-lg pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="socio@email.com"
                      maxLength={120}
                      className="h-10 rounded-lg pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ficha médica + plan */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ficha médica y plan
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox
                      checked={form.djFirmada}
                      onCheckedChange={(c) =>
                        setForm({ ...form, djFirmada: c === true })
                      }
                      className="mt-0.5"
                    />
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        Completó Declaración Jurada de Salud
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confirmo que el socio firmó la DJ de salud antes de iniciar las
                        actividades.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs">Plan</Label>
                    <Select
                      value={form.plan}
                      onValueChange={(v) => setForm({ ...form, plan: v })}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLANES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p} — {formatoARS(PRECIOS_PLAN[p] ?? 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      Aplicar promoción
                    </Label>
                    <Select
                      value={form.promo}
                      onValueChange={(v) => setForm({ ...form, promo: v })}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROMOCIONES.map((p) => (
                          <SelectItem key={p.codigo} value={p.codigo}>
                            {p.descuento > 0 ? `${p.nombre} (-${p.descuento}%)` : p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {promoActual.descripcion}
                    </p>
                  </div>
                </div>

                {/* Resumen de cuota */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Percent className="h-3.5 w-3.5" />
                    Resumen de cuota mensual
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Plan {form.plan}</span>
                      <span>{formatoARS(precioBase)}</span>
                    </div>
                    {promoActual.descuento > 0 && (
                      <div className="flex items-center justify-between text-primary">
                        <span>Descuento ({promoActual.nombre})</span>
                        <span>− {formatoARS(descuentoMonto)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                      <span>Total a abonar</span>
                      <span>{formatoARS(precioFinal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenForm(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInscribir}
              disabled={loading}
              className="gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Inscribiendo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Confirmar Inscripción
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
