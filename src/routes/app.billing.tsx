import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useState } from "react";
import {
  Dumbbell,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  CreditCard,
  QrCode,
  FileDown,
  MapPin,
  Sparkles,
  Info,
  ArrowLeft,
  Loader2,
  Smartphone,
  Hash,
  Copy,
  HeartPulse,
  ClipboardList,
  CalendarDays,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/billing")({
  head: () => ({
    meta: [
      { title: "Mi Cuenta — SquatGym" },
      {
        name: "description",
        content:
          "Dashboard del alumno: estado de cuenta, pagos online, historial de recibos y plan actual en SquatGym.",
      },
    ],
  }),
  component: DashboardAlumno,
});

type Pago = {
  id: string;
  concepto: string;
  fecha: string;
  monto: number;
};

const ALUMNO = {
  nombre: "Martín Suárez",
  plan: "Musculación Full",
  sucursal: "Sucursal Palermo",
  // Cambiá a `false` para ver la versión "Al día"
  conDeuda: true,
  saldo: 18500,
  vencimiento: "10/05/2026",
};

const HISTORIAL: Pago[] = [
  { id: "p1", concepto: "Cuota Marzo 2026", fecha: "05/03/2026", monto: 18500 },
  { id: "p2", concepto: "Cuota Febrero 2026", fecha: "04/02/2026", monto: 17800 },
  { id: "p3", concepto: "Cuota Enero 2026", fecha: "07/01/2026", monto: 17800 },
  { id: "p4", concepto: "Matrícula Anual", fecha: "07/01/2026", monto: 12000 },
  { id: "p5", concepto: "Cuota Diciembre 2025", fecha: "03/12/2025", monto: 16500 },
];

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

type PagoStep = "metodo" | "qr" | "exito";

function DashboardAlumno() {
  const [openPago, setOpenPago] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);
  const [step, setStep] = useState<PagoStep>("metodo");
  const [metodoElegido, setMetodoElegido] = useState<string>("");
  const [procesando, setProcesando] = useState(false);
  const { nombre, plan, sucursal, conDeuda, saldo, vencimiento } = ALUMNO;

  const abrirPago = () => {
    setStep("metodo");
    setMetodoElegido("");
    setOpenPago(true);
  };

  const elegirMetodo = (metodo: string) => {
    setMetodoElegido(metodo);
    if (metodo === "Código QR") {
      setStep("qr");
    } else {
      // Tarjeta: simulamos procesamiento corto y vamos al éxito
      setProcesando(true);
      setTimeout(() => {
        setProcesando(false);
        setStep("exito");
      }, 900);
    }
  };

  const confirmarQr = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      setStep("exito");
    }, 1200);
  };

  const cerrarPago = () => {
    setOpenPago(false);
    setTimeout(() => {
      setStep("metodo");
      setMetodoElegido("");
    }, 200);
  };

  const copiarCodigo = () => {
    navigator.clipboard?.writeText("SQGYM-2026-MAR-018500");
    toast.success("Código de pago copiado");
  };

  const descargarRecibo = (concepto: string) => {
    toast.success(`Descargando recibo: ${concepto}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header propio del Socio */}
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Bienvenida */}
        <section className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ¡Hola, {nombre.split(" ")[0]}! 👋
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acá tenés el resumen de tu cuenta y tus pagos en SquatGym.
          </p>


        </section>

        {/* Banner de aviso si tiene deuda */}
        {conDeuda && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border-l-4 border-destructive bg-destructive/5 p-4 shadow-soft">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Recordatorio: </span>
              Recordá regularizar tu situación para evitar restricciones de acceso al
              gimnasio.
            </p>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Estado de cuenta + acción */}
          <section className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {/* Banda de estado */}
              <div className="flex flex-col gap-4 border-b border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado de tu cuenta
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {conDeuda ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-sm font-semibold text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Con Deuda
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        Al día
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 shadow-soft">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <div className="leading-tight">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Próximo vencimiento
                    </p>
                    <p className="text-sm font-semibold text-foreground">{vencimiento}</p>
                  </div>
                </div>
              </div>

              {/* Saldo */}
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Saldo total adeudado
                </p>
                <p
                  className={`mt-2 text-5xl font-bold tracking-tight sm:text-6xl ${
                    conDeuda ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {formatARS(conDeuda ? saldo : 0)}
                </p>

                {conDeuda ? (
                  <Link
                    to="/app/checkout"
                    className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
                  >
                    <CreditCard className="h-5 w-5" />
                    Pagar Cuota Online
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="mt-6 h-14 w-full gap-2 rounded-xl text-base font-bold shadow-card"
                  >
                    <CreditCard className="h-5 w-5" />
                    Sin pagos pendientes
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Información del plan */}
          <aside>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tu plan
              </p>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-accent/40 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Plan actual
                  </p>
                  <p className="text-base font-bold text-foreground">{plan}</p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Sucursal
                  </p>
                  <p className="text-base font-semibold text-foreground">{sucursal}</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setOpenPlan(true)}
                className="mt-5 h-10 w-full rounded-lg font-medium"
              >
                Ver detalles del plan
              </Button>
            </div>
          </aside>
        </div>

        {/* Historial de pagos */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Historial de pagos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Descargá los recibos de tus últimas cuotas.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="px-4">Mes / Concepto</TableHead>
                  <TableHead className="px-4">Fecha de Pago</TableHead>
                  <TableHead className="px-4">Monto</TableHead>
                  <TableHead className="px-4 text-right">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HISTORIAL.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="px-4 py-3 font-medium text-foreground">
                      {p.concepto}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {p.fecha}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm text-foreground">
                      {formatARS(p.monto)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => descargarRecibo(p.concepto)}
                        className="h-8 gap-1.5 rounded-lg"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        Descargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>

      {/* Modal de pago — multi-step */}
      <Dialog
        open={openPago}
        onOpenChange={(v) => {
          if (!v) cerrarPago();
        }}
      >
        <DialogContent className="sm:max-w-md">
          {/* Paso 1: elegir método */}
          {step === "metodo" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Elegí cómo pagar</DialogTitle>
                <DialogDescription>
                  Vas a abonar {formatARS(saldo)} correspondiente a tu cuota actual.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <button
                  type="button"
                  disabled={procesando}
                  onClick={() => elegirMetodo("Tarjeta de Crédito/Débito")}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-card disabled:opacity-60"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 transition-colors group-hover:bg-primary/25">
                    {procesando && metodoElegido.startsWith("Tarjeta") ? (
                      <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                    ) : (
                      <CreditCard className="h-6 w-6 text-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Tarjeta de Crédito/Débito</p>
                    <p className="text-xs text-muted-foreground">
                      Visa, Mastercard, Amex y más. Pago seguro.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={procesando}
                  onClick={() => elegirMetodo("Código QR")}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-card disabled:opacity-60"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 transition-colors group-hover:bg-primary/25">
                    <QrCode className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Código QR</p>
                    <p className="text-xs text-muted-foreground">
                      Escaneá con Mercado Pago, MODO o tu billetera virtual.
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Paso 2: mostrar QR */}
          {step === "qr" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Escaneá el código QR</DialogTitle>
                <DialogDescription>
                  Abrí tu billetera virtual y escaneá. Total a pagar:{" "}
                  <span className="font-semibold text-foreground">{formatARS(saldo)}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4 py-2">
                {/* QR falso */}
                <div className="rounded-2xl border-4 border-primary bg-white p-4 shadow-card">
                  <FakeQrCode />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="h-3.5 w-3.5" />
                  Compatible con Mercado Pago, MODO, Cuenta DNI y más
                </div>

                <button
                  type="button"
                  onClick={copiarCodigo}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent/30"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div className="leading-tight">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Código de pago
                      </p>
                      <p className="font-mono text-sm font-semibold text-foreground">
                        SQGYM-2026-MAR-018500
                      </p>
                    </div>
                  </div>
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep("metodo")}
                  disabled={procesando}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver
                </Button>
                <Button
                  onClick={confirmarQr}
                  disabled={procesando}
                  className="gap-2 font-semibold"
                >
                  {procesando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Esperando pago...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Ya escaneé el QR
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Paso 3: éxito */}
          {step === "exito" && (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2
                  className="h-12 w-12 text-primary"
                  strokeWidth={2.5}
                />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                ¡Pago realizado!
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Acreditamos tu pago de{" "}
                <span className="font-semibold text-foreground">{formatARS(saldo)}</span>{" "}
                con éxito. Tu cuenta ya figura al día.
              </p>

              <div className="mt-5 w-full space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-left">
                <Detail label="Método" value={metodoElegido || "—"} />
                <Detail label="Concepto" value="Cuota Marzo 2026" />
                <Detail label="Fecha" value={new Date().toLocaleDateString("es-AR")} />
                <Detail
                  label="N° de operación"
                  value="SQGYM-OP-94821"
                  mono
                />
              </div>

              <div className="mt-5 flex w-full flex-col-reverse gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => descargarRecibo("Cuota Marzo 2026")}
                  className="flex-1 gap-2"
                >
                  <FileDown className="h-4 w-4" /> Descargar recibo
                </Button>
                <Button onClick={cerrarPago} className="flex-1 font-semibold">
                  Volver al inicio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalles del plan */}
      <Dialog open={openPlan} onOpenChange={setOpenPlan}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Detalles de tu plan</DialogTitle>
            <DialogDescription>
              Información completa sobre tu membresía actual en SquatGym.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="rounded-xl border border-border bg-accent/40 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Plan actual
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">{plan}</p>
              <p className="mt-1 text-sm text-muted-foreground">{sucursal}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">¿Qué incluye?</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Acceso ilimitado a la sala de musculación
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Rutina personalizada por profesor
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Evaluación física trimestral
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Vestuarios, duchas y guardado de bolsos
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Cuota mensual
                </p>
                <p className="mt-1 text-base font-bold text-foreground">{formatARS(18500)}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Horarios
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">Lun a Sáb · 7 a 23 hs</p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">¿Querés modificar tu membresía?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Podés sumar otra actividad sin perder la actual o reemplazar tu plan vigente por otro.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => {
                    toast.success("Te contactaremos para coordinar tu nuevo plan.");
                    setOpenPlan(false);
                  }}
                  className="h-10 flex-1 gap-2 rounded-lg font-semibold"
                >
                  <Sparkles className="h-4 w-4" />
                  Anotarme a otro plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.success("Solicitud de cambio de plan registrada.");
                    setOpenPlan(false);
                  }}
                  className="h-10 flex-1 gap-2 rounded-lg font-semibold"
                >
                  <Repeat className="h-4 w-4" />
                  Cambiar de Plan
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-semibold text-foreground ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/** QR falso decorativo (grilla pseudo-aleatoria pero estable). */
function FakeQrCode() {
  const size = 21; // módulos por lado
  // patrón determinístico para que siempre sea el mismo "QR"
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    cells.push(((i * 37 + (i % 7) * 13 + ((i / size) | 0) * 5) % 3) === 0);
  }
  const isFinder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) =>
      r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0);
  };
  const finderFill = (r: number, c: number) => {
    const local = (r0: number, c0: number) => {
      const rr = r - r0;
      const cc = c - c0;
      if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
      if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    };
    if (r < 7 && c < 7) return local(0, 0);
    if (r < 7 && c >= size - 7) return local(0, size - 7);
    if (r >= size - 7 && c < 7) return local(size - 7, 0);
    return false;
  };

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${size}, 8px)`,
        gridTemplateRows: `repeat(${size}, 8px)`,
        gap: 0,
      }}
      aria-label="Código QR de pago (simulado)"
      role="img"
    >
      {Array.from({ length: size * size }).map((_, idx) => {
        const r = Math.floor(idx / size);
        const c = idx % size;
        const filled = isFinder(r, c) ? finderFill(r, c) : cells[idx];
        return (
          <div
            key={idx}
            style={{
              width: 8,
              height: 8,
              background: filled ? "#0a0a0a" : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

