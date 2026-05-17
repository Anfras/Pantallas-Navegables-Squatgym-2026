import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, CheckCircle2, Loader2, FileText, Calendar, CreditCard, Building2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { registrarAuditoria } from "@/utils/audit";

export const Route = createFileRoute("/desk/proveedores")({
  head: () => ({
    meta: [
      { title: "Registro de Pago a Proveedores — SquatGym" },
      { name: "description", content: "Gestión de egresos y pago a proveedores del sistema SquatGym." },
    ],
  }),
  component: PagoProveedoresPage,
});

type LineItem = {
  id: string;
  insumo: string;
  cantidad: number;
  costo: number;
};

const PROVEEDORES = ["Suplementos del Norte", "Bebidas Vital", "Distribuidora FitMax", "Nutrición Andina"];
const MEDIOS_PAGO = ["Transferencia", "QR", "Efectivo"];
const INSUMOS_PERMITIDOS = [
  "Proteína Whey 1kg",
  "Creatina Monohidratada 300g",
  "Barras de Cereal Fit",
  "Bebida Isotónica 500ml",
  "Agua Mineral 500ml",
  "Pre-entreno 250g",
  "Aminoácidos BCAA",
];

function PagoProveedoresPage() {
  const [proveedor, setProveedor] = useState("");
  const [factura, setFactura] = useState("");
  const [fecha, setFecha] = useState("");
  const [medio, setMedio] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), insumo: "", cantidad: 1, costo: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.cantidad * i.costo, 0),
    [items],
  );

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addItem = () =>
    setItems((p) => [...p, { id: crypto.randomUUID(), insumo: "", cantidad: 1, costo: 0 }]);

  const removeItem = (id: string) =>
    setItems((p) => (p.length === 1 ? p : p.filter((i) => i.id !== id)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedor || !factura || !fecha || !medio) {
      toast.error("Completá los datos obligatorios del comprobante");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    registrarAuditoria("Lucas (Encargado)", `Pago a proveedor: ${proveedor} ($${total})`, "Proveedores");
    toast.success("Pago autorizado correctamente");
    setSuccess(true);
  };

  const resetForm = () => {
    setProveedor("");
    setFactura("");
    setFecha("");
    setMedio("");
    setItems([{ id: crypto.randomUUID(), insumo: "", cantidad: 1, costo: 0 }]);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader role="Encargado de Sucursal" adminName="Lucía Fernández" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Task header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">Egresos</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Gestión de Egresos:{" "}
            <span className="text-foreground">Pago a Proveedores</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Registra y autoriza pagos a proveedores del kiosco. La información se sincroniza con la base de datos centralizada de SquatGym.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form section */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Datos del comprobante
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field icon={<Building2 className="h-4 w-4" />} label="Proveedor">
                <Select value={proveedor} onValueChange={setProveedor} required>
                  <SelectTrigger className="h-11 rounded-lg border-border bg-background">
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVEEDORES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field icon={<CreditCard className="h-4 w-4" />} label="Medio de pago">
                <Select value={medio} onValueChange={setMedio} required>
                  <SelectTrigger className="h-11 rounded-lg border-border bg-background">
                    <SelectValue placeholder="Elige el medio" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIOS_PAGO.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field icon={<FileText className="h-4 w-4" />} label="Nro. de Factura">
                <Input
                  required
                  value={factura}
                  onChange={(e) => setFactura(e.target.value)}
                  placeholder="0001-00012345"
                  className="h-11 rounded-lg border-border bg-background"
                />
              </Field>

              <Field icon={<Calendar className="h-4 w-4" />} label="Fecha de emisión">
                <Input
                  required
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-11 rounded-lg border-border bg-background"
                />
              </Field>
            </div>
          </section>

          {/* Items table */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Detalle del pedido
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">Insumos para el kiosco</p>
              </div>
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                className="rounded-lg border-primary/30 text-primary hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Agregar insumo
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="hidden grid-cols-[1fr_120px_160px_140px_44px] gap-3 border-b border-border bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
                <div>Insumo</div>
                <div>Cantidad</div>
                <div>Costo Unitario</div>
                <div>Subtotal</div>
                <div></div>
              </div>
              <div className="divide-y divide-border">
                {items.map((item, idx) => {
                  const subtotal = item.cantidad * item.costo;
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1fr_120px_160px_140px_44px] md:items-center"
                    >
                      <Select
                        value={item.insumo}
                        onValueChange={(val) => updateItem(item.id, { insumo: val })}
                        required
                      >
                        <SelectTrigger className="h-10 rounded-md border-border bg-background">
                          <SelectValue placeholder="Elegir insumo" />
                        </SelectTrigger>
                        <SelectContent>
                          {INSUMOS_PERMITIDOS.map((ins) => (
                            <SelectItem key={ins} value={ins}>{ins}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        required
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={(e) => updateItem(item.id, { cantidad: Number(e.target.value) })}
                        className="h-10 rounded-md border-border bg-background"
                      />
                      <Input
                        required
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.costo}
                        onChange={(e) => updateItem(item.id, { costo: Number(e.target.value) })}
                        className="h-10 rounded-md border-border bg-background"
                      />
                      <div className="text-sm font-medium tabular-nums text-foreground">
                        ${subtotal.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Eliminar fila"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Footer / Total */}
          <section className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-6 rounded-2xl border-2 border-primary bg-accent/50 px-6 py-4 shadow-soft sm:min-w-[320px]">
              <span className="text-sm font-bold uppercase tracking-wider text-foreground">Total a pagar</span>
              <span className="text-3xl font-bold tabular-nums text-accent-foreground">
                ${total.toFixed(2)}
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-14 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-card transition-all hover:bg-primary/90 hover:shadow-glow disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar y Autorizar Pago
                </>
              )}
            </Button>
          </section>
        </form>
      </main>

      <Dialog open={success} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent className="sm:max-w-md">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <CheckCircle2 className="h-9 w-9 text-primary" strokeWidth={2} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">¡Pago autorizado!</DialogTitle>
            <DialogDescription className="text-center text-base">
              El pago ha sido registrado correctamente en la base de datos centralizada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={resetForm}
              className="rounded-lg bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              Registrar otro pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}
