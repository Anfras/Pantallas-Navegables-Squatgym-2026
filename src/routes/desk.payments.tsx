import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { registrarAuditoria } from "@/utils/audit";
import { AppHeader } from "@/components/AppHeader";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  Dumbbell,
  LogOut,
  ArrowLeft,
  User,
  IdCard,
  Tag,
  Percent,
  Wallet,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  Loader2,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const searchSchema = z.object({
  socioId: z.string().optional(),
  nombre: z.string().optional(),
  dni: z.string().optional(),
  plan: z.string().optional(),
});

export const Route = createFileRoute("/desk/payments")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Registro de Pago de Cuota — SquatGym" },
      {
        name: "description",
        content:
          "Pantalla PAG-01: registro de cobro de cuota mensual con promociones, prorrateo y emisión de recibo.",
      },
    ],
  }),
  component: CobrarCuotaPage,
});

const PRECIOS_PLAN: Record<string, number> = {
  Musculación: 18000,
  Zumba: 14000,
  CrossFit: 22000,
  Funcional: 16000,
  Pilates: 17000,
};

type Promocion = {
  codigo: string;
  nombre: string;
  descuento: number;
};

const PROMOCIONES: Promocion[] = [
  { codigo: "NINGUNA", nombre: "Ninguna", descuento: 0 },
  { codigo: "FAMILIAR", nombre: "Plan Familiar", descuento: 15 },
  { codigo: "AMIGO", nombre: "Descuento Amigo", descuento: 10 },
  { codigo: "BIENVENIDA", nombre: "Bienvenida", descuento: 20 },
  { codigo: "ANUAL", nombre: "Pago Anual", descuento: 25 },
];

type MedioPago = "EFECTIVO" | "DEBITO" | "TRANSFERENCIA" | "QR";

const MEDIOS: { id: MedioPago; label: string; icon: typeof Banknote }[] = [
  { id: "EFECTIVO", label: "Efectivo", icon: Banknote },
  { id: "DEBITO", label: "Tarjeta de Débito", icon: CreditCard },
  { id: "TRANSFERENCIA", label: "Transferencia", icon: ArrowRightLeft },
  { id: "QR", label: "Código QR", icon: Smartphone },
];

const formatoARS = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const formatoDniDisplay = (d: string) => {
  if (!d) return "—";
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, d.length - 3)}.${d.slice(-3)}`;
  return `${d.slice(0, d.length - 6)}.${d.slice(-6, -3)}.${d.slice(-3)}`;
};

const mesActual = () =>
  new Date()
    .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

const diasDelMes = () => {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
};

const diaActual = () => new Date().getDate();

function CobrarCuotaPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const nombre = search.nombre ?? "Socio sin nombre";
  const dni = search.dni ?? "";
  const planInicial = search.plan && PRECIOS_PLAN[search.plan] ? search.plan : "Musculación";

  const [plan, setPlan] = useState(planInicial);
  const [promo, setPromo] = useState("NINGUNA");
  const [prorrateo, setProrrateo] = useState(false);
  const [medio, setMedio] = useState<MedioPago>("EFECTIVO");
  const [procesando, setProcesando] = useState(false);
  const [exitoOpen, setExitoOpen] = useState(false);

  // Fechas calculadas en cliente para evitar hydration mismatch
  const [fechaInfo, setFechaInfo] = useState<{ concepto: string; totalDias: number; diasUsados: number }>({
    concepto: "Cuota Mensual",
    totalDias: 30,
    diasUsados: 30,
  });
  useEffect(() => {
    setFechaInfo({
      concepto: `Cuota Mensual — ${mesActual()}`,
      totalDias: diasDelMes(),
      diasUsados: diasDelMes() - diaActual() + 1,
    });
  }, []);
  const concepto = fechaInfo.concepto;
  const importeBase = PRECIOS_PLAN[plan] ?? 0;

  const promoActual = useMemo(
    () => PROMOCIONES.find((p) => p.codigo === promo) ?? PROMOCIONES[0],
    [promo],
  );
  const descuentoPromo = Math.round((importeBase * promoActual.descuento) / 100);

  const totalDias = fechaInfo.totalDias;
  const diasUsados = fechaInfo.diasUsados;
  const descuentoProrrateo = prorrateo
    ? Math.round(((importeBase - descuentoPromo) * (totalDias - diasUsados)) / totalDias)
    : 0;

  const montoFinal = Math.max(0, importeBase - descuentoPromo - descuentoProrrateo);

  const numeroRecibo = useMemo(
    () =>
      "REC-" +
      Math.floor(100000 + Math.random() * 899999).toString() +
      "-" +
      new Date().getFullYear(),
    [],
  );

  const registrarPago = async () => {
    if (!search.nombre) {
      toast.error("Faltan datos del socio. Volvé a Recepción y seleccioná un socio.");
      return;
    }
    setProcesando(true);
    await new Promise((r) => setTimeout(r, 1100));
    setProcesando(false);
    registrarAuditoria("Ana (Recepción)", `Cobro de cuota a ${search.nombre} (${formatoARS(montoFinal)})`, "Cobros");
    setExitoOpen(true);
  };

  const cerrarYVolver = () => {
    setExitoOpen(false);
    toast.success("Pago registrado. Recibo emitido.", {
      description: `${nombre} · ${formatoARS(montoFinal)} · ${concepto}`,
    });
    navigate({ to: "/recepcion" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Volver */}
        <Link
          to="/recepcion"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Recepción
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Registro de Pago de Cuota
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cargá los datos del cobro y emití el recibo correspondiente.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Formulario principal */}
          <div className="space-y-6">
            {/* Datos del socio */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Datos del Socio
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      readOnly
                      value={nombre}
                      className="h-10 cursor-not-allowed rounded-lg bg-muted/40 pl-9 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">DNI</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      readOnly
                      value={formatoDniDisplay(dni)}
                      className="h-10 cursor-not-allowed rounded-lg bg-muted/40 pl-9 font-mono"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Detalle del cobro */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detalle del Cobro
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-xs">Concepto</Label>
                  <Input
                    readOnly
                    value={concepto}
                    className="h-10 cursor-not-allowed rounded-lg bg-muted/40 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs">Plan / Importe Base</Label>
                    <Select value={plan} onValueChange={setPlan}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRECIOS_PLAN).map(([p, precio]) => (
                          <SelectItem key={p} value={p}>
                            {p} — {formatoARS(precio)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      Promoción
                    </Label>
                    <Select value={promo} onValueChange={setPromo}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROMOCIONES.map((p) => (
                          <SelectItem key={p.codigo} value={p.codigo}>
                            {p.descuento > 0
                              ? `${p.nombre} (-${p.descuento}%)`
                              : p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Prorrateo */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        ¿Aplicar prorrateo?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Descuenta los días no utilizados del mes en curso ({diasUsados} de{" "}
                        {totalDias} días).
                      </p>
                      {prorrateo && (
                        <p className="mt-1 text-xs font-semibold text-primary">
                          Descuento por prorrateo: {formatoARS(descuentoProrrateo)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch checked={prorrateo} onCheckedChange={setProrrateo} />
                </div>
              </div>
            </section>

            {/* Transacción */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transacción
              </h2>
              <Label className="mb-2 block text-xs">Medio de pago</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {MEDIOS.map((m) => {
                  const Icon = m.icon;
                  const activo = medio === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMedio(m.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${activo
                          ? "border-primary bg-primary/10 text-foreground shadow-card"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${activo ? "text-primary" : "text-muted-foreground"}`}
                      />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Resumen lateral */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Resumen
                </h2>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Importe base</span>
                  <span>{formatoARS(importeBase)}</span>
                </div>
                {promoActual.descuento > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Promo {promoActual.nombre}</span>
                    <span>− {formatoARS(descuentoPromo)}</span>
                  </div>
                )}
                {prorrateo && (
                  <div className="flex justify-between text-primary">
                    <span>Prorrateo</span>
                    <span>− {formatoARS(descuentoProrrateo)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Monto Final
                </p>
                <p className="mt-1 text-3xl font-extrabold text-primary">
                  {formatoARS(montoFinal)}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  onClick={registrarPago}
                  disabled={procesando}
                  className="h-12 w-full gap-2 rounded-xl text-sm font-bold shadow-card"
                >
                  {procesando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ReceiptText className="h-4 w-4" />
                      Registrar Pago y Emitir Recibo
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  disabled={procesando}
                  onClick={() => navigate({ to: "/recepcion" })}
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border-l-4 border-primary bg-accent/40 p-3 text-xs text-muted-foreground shadow-soft">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
              <span>Toda transacción queda registrada en la auditoría del sistema.</span>
            </div>
          </aside>
        </div>

        {/* Pie identificación */}
        <footer className="mt-10 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Pantalla: <span className="font-semibold text-foreground">PAG-01</span> | Usuario:{" "}
          <span className="font-semibold text-foreground">Secretaria Ana Pérez</span>
        </footer>
      </main>

      {/* Modal éxito */}
      <Dialog open={exitoOpen} onOpenChange={(o) => (o ? null : cerrarYVolver())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <CheckCircle2 className="h-9 w-9 text-primary" strokeWidth={2.4} />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              ¡Pago registrado con éxito!
            </DialogTitle>
            <DialogDescription className="text-center">
              El socio ha sido habilitado para ingresar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Socio</span>
              <span className="font-medium text-foreground">{nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concepto</span>
              <span className="font-medium text-foreground">{concepto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medio</span>
              <span className="font-medium text-foreground">
                {MEDIOS.find((m) => m.id === medio)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">N° Recibo</span>
              <span className="font-mono text-foreground">{numeroRecibo}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <span className="font-semibold">Total cobrado</span>
              <span className="font-extrabold text-primary">{formatoARS(montoFinal)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Recibo descargado", {
                  description: `${numeroRecibo}.pdf`,
                })
              }
              className="gap-2"
            >
              <ReceiptText className="h-4 w-4" /> Descargar recibo
            </Button>
            <Button onClick={cerrarYVolver} className="gap-2 font-semibold">
              <Wallet className="h-4 w-4" /> Volver a Recepción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
