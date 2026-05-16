import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useEffect, useState } from "react";
import {
  Dumbbell,
  ArrowLeft,
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
  Copy,
  Smartphone,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/checkout")({
  head: () => ({
    meta: [
      { title: "Pasarela de Pago — SquatGym" },
      {
        name: "description",
        content:
          "Pagá tu cuota de SquatGym de forma segura con tarjeta, billetera virtual o transferencia bancaria.",
      },
    ],
  }),
  component: PasarelaPago,
});

const SOCIO = {
  nombre: "Martín Suárez",
  concepto: "Cuota Mensual + Matrícula",
  montoBase: 21500,
  descuento: 3000, // promo vigente
};

type Metodo = "tarjeta" | "qr" | "transferencia";

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function PasarelaPago() {
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<Metodo>("tarjeta");
  const [estado, setEstado] = useState<"idle" | "procesando" | "exito">("idle");
  const [fecha, setFecha] = useState("");

  // Tarjeta
  const [numero, setNumero] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvc, setCvc] = useState("");
  const [titular, setTitular] = useState("");

  useEffect(() => {
    setFecha(new Date().toLocaleString("es-AR"));
  }, []);

  const total = SOCIO.montoBase - SOCIO.descuento;

  const pagar = () => {
    if (metodo === "tarjeta") {
      if (numero.replace(/\s/g, "").length < 12 || !vencimiento || cvc.length < 3 || !titular.trim()) {
        toast.error("Completá los datos de la tarjeta para continuar.");
        return;
      }
    }
    setEstado("procesando");
    setTimeout(() => setEstado("exito"), 2200);
  };

  const copiar = (txt: string, label: string) => {
    navigator.clipboard?.writeText(txt);
    toast.success(`${label} copiado`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/app/billing"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mi cuenta
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Pasarela de Pago Online
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Elegí tu medio de pago preferido. La operación es 100% segura y encriptada.
        </p>

        {estado === "exito" ? (
          <ExitoCard nombre={SOCIO.nombre} total={total} fecha={fecha} />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Columna izquierda: método */}
            <section className="lg:col-span-2 space-y-6">
              {/* Selector métodos */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Medio de pago
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MetodoBtn
                    activo={metodo === "tarjeta"}
                    onClick={() => setMetodo("tarjeta")}
                    icon={<CreditCard className="h-5 w-5" />}
                    label="Tarjeta"
                    sub="Crédito o Débito"
                  />
                  <MetodoBtn
                    activo={metodo === "qr"}
                    onClick={() => setMetodo("qr")}
                    icon={<QrCode className="h-5 w-5" />}
                    label="Billetera / QR"
                    sub="MercadoPago, MODO"
                  />
                  <MetodoBtn
                    activo={metodo === "transferencia"}
                    onClick={() => setMetodo("transferencia")}
                    icon={<Building2 className="h-5 w-5" />}
                    label="Transferencia"
                    sub="CBU / Alias"
                  />
                </div>
              </div>

              {/* Detalle del método elegido */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
                {metodo === "tarjeta" && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Datos de la tarjeta</h2>
                      <p className="text-xs text-muted-foreground">
                        Tus datos viajan cifrados extremo a extremo.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="numero">Número de tarjeta</Label>
                        <Input
                          id="numero"
                          inputMode="numeric"
                          maxLength={19}
                          placeholder="0000 0000 0000 0000"
                          value={numero}
                          onChange={(e) =>
                            setNumero(
                              e.target.value
                                .replace(/\D/g, "")
                                .replace(/(.{4})/g, "$1 ")
                                .trim(),
                            )
                          }
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="titular">Titular</Label>
                        <Input
                          id="titular"
                          placeholder="Como figura en la tarjeta"
                          value={titular}
                          onChange={(e) => setTitular(e.target.value)}
                          maxLength={60}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="venc">Vencimiento</Label>
                        <Input
                          id="venc"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={vencimiento}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setVencimiento(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {metodo === "qr" && (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <h2 className="self-start text-lg font-bold text-foreground">
                      Escaneá el QR
                    </h2>
                    <div className="rounded-2xl border-4 border-primary bg-white p-4 shadow-card">
                      <FakeQrCode />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Smartphone className="h-3.5 w-3.5" />
                      Compatible con Mercado Pago, MODO, Cuenta DNI y más
                    </div>
                    <button
                      type="button"
                      onClick={() => copiar("SQGYM-2026-MAY-018500", "Código de pago")}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent/30"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <div className="leading-tight">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Código de pago
                          </p>
                          <p className="font-mono text-sm font-semibold text-foreground">
                            SQGYM-2026-MAY-018500
                          </p>
                        </div>
                      </div>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}

                {metodo === "transferencia" && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        Datos para transferencia
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Realizá la transferencia desde tu home banking. La acreditación es
                        inmediata.
                      </p>
                    </div>
                    <DatoCopia
                      label="Titular"
                      valor="SquatGym S.A."
                      onCopy={(v) => copiar(v, "Titular")}
                    />
                    <DatoCopia
                      label="CUIT"
                      valor="30-71234567-9"
                      onCopy={(v) => copiar(v, "CUIT")}
                    />
                    <DatoCopia
                      label="CBU"
                      valor="0170099220000012345678"
                      onCopy={(v) => copiar(v, "CBU")}
                    />
                    <DatoCopia
                      label="Alias"
                      valor="SQUATGYM.PAGOS.AR"
                      onCopy={(v) => copiar(v, "Alias")}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Resumen */}
            <aside>
              <div className="sticky top-6 space-y-4">
                <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resumen de pago
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <Linea label="Concepto" valor={SOCIO.concepto} />
                    <Linea label="Monto base" valor={formatARS(SOCIO.montoBase)} />
                    <Linea
                      label="Descuento (Promo Mayo)"
                      valor={`- ${formatARS(SOCIO.descuento)}`}
                      muted
                    />
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total a pagar
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {formatARS(total)}
                    </p>
                  </div>

                  <Button
                    onClick={pagar}
                    disabled={estado === "procesando"}
                    className="mt-5 h-12 w-full gap-2 rounded-xl text-base font-bold shadow-card"
                  >
                    {estado === "procesando" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Procesando pago seguro...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Confirmar y Pagar Ahora
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate({ to: "/app/billing" })}
                    disabled={estado === "procesando"}
                    className="mt-2 h-11 w-full rounded-xl"
                  >
                    Volver a mi cuenta
                  </Button>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <p>
                    Conexión cifrada SSL/TLS. SquatGym no almacena los datos de tu
                    tarjeta.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-4 text-center text-xs text-muted-foreground">
          ID Transacción: <span className="font-mono font-semibold">#PAY-999</span> · Usuario:{" "}
          <span className="font-semibold">{SOCIO.nombre}</span> · Fecha: {fecha || "—"}
        </div>
      </footer>
    </div>
  );
}

function Linea({ label, valor, muted }: { label: string; valor: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-semibold text-foreground"}>
        {valor}
      </span>
    </div>
  );
}

function MetodoBtn({
  activo,
  onClick,
  icon,
  label,
  sub,
}: {
  activo: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
        activo
          ? "border-primary bg-primary/10 shadow-card"
          : "border-border bg-white hover:border-primary/50"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          activo ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}

function DatoCopia({
  label,
  valor,
  onCopy,
}: {
  label: string;
  valor: string;
  onCopy: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(valor)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent/30"
    >
      <div className="leading-tight">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-sm font-semibold text-foreground">{valor}</p>
      </div>
      <Copy className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function ExitoCard({
  nombre,
  total,
  fecha,
}: {
  nombre: string;
  total: number;
  fecha: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center shadow-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
        <CheckCircle2 className="h-9 w-9 text-primary" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-foreground">¡Pago acreditado!</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu cuenta se ha actualizado automáticamente. Ya podés volver a entrenar sin
        restricciones.
      </p>
      <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border bg-white p-5 text-left text-sm">
        <Linea label="Socio" valor={nombre} />
        <div className="my-3 border-t border-border" />
        <Linea label="Monto pagado" valor={formatARS(total)} />
        <div className="my-3 border-t border-border" />
        <Linea label="Fecha" valor={fecha || "—"} />
        <div className="my-3 border-t border-border" />
        <Linea label="ID Transacción" valor="#PAY-999" />
      </div>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Link
          to="/app/billing"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
        >
          Volver a mi cuenta
        </Link>
      </div>
    </div>
  );
}

function FakeQrCode() {
  // QR decorativo (no es real)
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    // patrones de esquinas
    const corner =
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (corner) {
      const cx = x < 7 ? x : x - 14;
      const cy = y < 7 ? y : y - 14;
      const ring =
        cx === 0 || cx === 6 || cy === 0 || cy === 6
          ? true
          : cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4;
      return ring;
    }
    // pseudo-random determinista
    return ((x * 73 + y * 31 + x * y) % 5) % 2 === 0;
  });
  return (
    <div
      className="grid gap-px"
      style={{ gridTemplateColumns: "repeat(21, 10px)" }}
      aria-label="Código QR de pago (simulado)"
    >
      {cells.map((on, i) => (
        <div
          key={i}
          className={on ? "h-[10px] w-[10px] bg-foreground" : "h-[10px] w-[10px] bg-white"}
        />
      ))}
    </div>
  );
}
