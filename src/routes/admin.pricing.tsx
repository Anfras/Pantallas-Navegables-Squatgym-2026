import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import {
  Dumbbell,
  LogOut,
  Plus,
  Tag,
  ShieldAlert,
  Pencil,
  Save,
  X,
  Percent,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({
    meta: [
      { title: "Configuración de Promociones y Precios — SquatGym" },
      {
        name: "description",
        content:
          "Panel del Administrador General: gestión de precios base por actividad y promociones vigentes del gimnasio.",
      },
    ],
  }),
  component: PromocionesPage,
});

const ADMIN_NOMBRE = "Lucía Fernández";

type PrecioBase = {
  actividad: string;
  precio: number;
};

type Promocion = {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "porcentaje" | "monto";
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
};

const PRECIOS_INICIALES: PrecioBase[] = [
  { actividad: "Musculación", precio: 18000 },
  { actividad: "CrossFit", precio: 22000 },
  { actividad: "Zumba", precio: 14000 },
  { actividad: "Funcional", precio: 16000 },
  { actividad: "Pilates", precio: 17000 },
];

const PROMOS_INICIALES: Promocion[] = [
  {
    id: "P-001",
    nombre: "Plan Familiar",
    descripcion: "Descuento para grupos familiares de 2 o más integrantes.",
    tipo: "porcentaje",
    valor: 15,
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    activa: true,
  },
  {
    id: "P-002",
    nombre: "Descuento Amigo",
    descripcion: "Trae a un amigo y obtené un descuento en tu próxima cuota.",
    tipo: "porcentaje",
    valor: 10,
    fechaInicio: "2026-03-01",
    fechaFin: "2026-06-30",
    activa: true,
  },
  {
    id: "P-003",
    nombre: "Bienvenida",
    descripcion: "Promoción para nuevos socios en su primera cuota.",
    tipo: "porcentaje",
    valor: 20,
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    activa: true,
  },
  {
    id: "P-004",
    nombre: "Verano 2025",
    descripcion: "Promo de temporada finalizada.",
    tipo: "monto",
    valor: 3000,
    fechaInicio: "2025-12-01",
    fechaFin: "2026-02-28",
    activa: false,
  },
];

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const fmtFecha = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

function PromocionesPage() {
  const [precios, setPrecios] = useState<PrecioBase[]>(PRECIOS_INICIALES);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<string>("");

  const [promos, setPromos] = useState<Promocion[]>(PROMOS_INICIALES);
  const [openNueva, setOpenNueva] = useState(false);
  const [nueva, setNueva] = useState({
    nombre: "",
    descripcion: "",
    tipo: "porcentaje" as "porcentaje" | "monto",
    valor: "",
    fechaInicio: "",
    fechaFin: "",
    activar: true,
  });

  const activas = useMemo(() => promos.filter((p) => p.activa).length, [promos]);

  const iniciarEdicion = (p: PrecioBase) => {
    setEditando(p.actividad);
    setBorrador(String(p.precio));
  };

  const guardarPrecio = (actividad: string) => {
    const v = Number(borrador);
    if (!Number.isFinite(v) || v <= 0) {
      toast.error("Ingresá un precio válido.");
      return;
    }
    setPrecios((prev) =>
      prev.map((p) => (p.actividad === actividad ? { ...p, precio: v } : p)),
    );
    setEditando(null);
    toast.success(`Precio de ${actividad} actualizado a ${fmtARS(v)}.`);
  };

  const togglePromo = (id: string, activa: boolean) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, activa } : p)));
    const promo = promos.find((p) => p.id === id);
    toast.success(
      `Promoción "${promo?.nombre}" ${activa ? "activada" : "desactivada"}.`,
    );
  };

  const crearPromo = () => {
    if (!nueva.nombre.trim() || !nueva.descripcion.trim() || !nueva.valor) {
      toast.error("Completá todos los campos obligatorios.");
      return;
    }
    if (!nueva.fechaInicio || !nueva.fechaFin) {
      toast.error("Definí el rango de fechas de la promoción.");
      return;
    }
    if (nueva.fechaInicio > nueva.fechaFin) {
      toast.error("La fecha de inicio no puede ser posterior a la de fin.");
      return;
    }
    const valor = Number(nueva.valor);
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error("El valor del descuento debe ser mayor a 0.");
      return;
    }
    if (nueva.tipo === "porcentaje" && valor > 100) {
      toast.error("El porcentaje no puede superar el 100%.");
      return;
    }
    const promo: Promocion = {
      id: `P-${String(promos.length + 1).padStart(3, "0")}`,
      nombre: nueva.nombre.trim(),
      descripcion: nueva.descripcion.trim(),
      tipo: nueva.tipo,
      valor,
      fechaInicio: nueva.fechaInicio,
      fechaFin: nueva.fechaFin,
      activa: nueva.activar,
    };
    setPromos((prev) => [promo, ...prev]);
    setOpenNueva(false);
    setNueva({
      nombre: "",
      descripcion: "",
      tipo: "porcentaje",
      valor: "",
      fechaInicio: "",
      fechaFin: "",
      activar: true,
    });
    toast.success(`Promoción "${promo.nombre}" creada correctamente.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Precios base (Maestro)
              </h1>
              <p className="text-sm text-muted-foreground">
                Define el valor mensual de cada actividad. Estos precios se
                aplican en todo el sistema de cobros.
              </p>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Precio mensual</TableHead>
                  <TableHead className="w-[180px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {precios.map((p) => {
                  const enEdicion = editando === p.actividad;
                  return (
                    <TableRow key={p.actividad}>
                      <TableCell className="font-medium">
                        {p.actividad}
                      </TableCell>
                      <TableCell>
                        {enEdicion ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              value={borrador}
                              onChange={(e) => setBorrador(e.target.value)}
                              className="h-8 w-32"
                              min={0}
                            />
                          </div>
                        ) : (
                          <span className="font-semibold text-primary">
                            {fmtARS(p.precio)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {enEdicion ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => guardarPrecio(p.actividad)}
                            >
                              <Save className="h-4 w-4" /> Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditando(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => iniciarEdicion(p)}
                          >
                            <Pencil className="h-4 w-4" /> Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Gestión de promociones
              </h2>
              <p className="text-sm text-muted-foreground">
                {promos.length} promociones registradas · {activas} activas
              </p>
            </div>
            <Button onClick={() => setOpenNueva(true)}>
              <Plus className="h-4 w-4" />
              Nueva promoción
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Activa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Tag className="h-4 w-4 text-primary" />
                        {p.nombre}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.id}</p>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      {p.descripcion}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        {p.tipo === "porcentaje" ? (
                          <>
                            <Percent className="h-3.5 w-3.5" />
                            {p.valor}%
                          </>
                        ) : (
                          <>{fmtARS(p.valor)}</>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {fmtFecha(p.fechaInicio)} → {fmtFecha(p.fechaFin)}
                    </TableCell>
                    <TableCell>
                      {p.activa ? (
                        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={p.activa}
                        onCheckedChange={(v) => togglePromo(p.id, v)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <footer className="flex items-start gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Los cambios en la estructura de precios y promociones afectan
            directamente al módulo de Cobros y serán registrados en el log de
            auditoría.
          </p>
        </footer>

        <p className="text-center text-xs text-muted-foreground">
          Pantalla: ADM-PROMO-01 | Usuario: Admin {ADMIN_NOMBRE}
        </p>
      </main>

      <Dialog open={openNueva} onOpenChange={setOpenNueva}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva promoción</DialogTitle>
            <DialogDescription>
              Definí los datos de la promoción y su período de vigencia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Ej. Plan Familiar"
                value={nueva.nombre}
                onChange={(e) =>
                  setNueva((n) => ({ ...n, nombre: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea
                id="desc"
                placeholder="Detalle breve del beneficio..."
                value={nueva.descripcion}
                onChange={(e) =>
                  setNueva((n) => ({ ...n, descripcion: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo de descuento</Label>
                <Select
                  value={nueva.tipo}
                  onValueChange={(v) =>
                    setNueva((n) => ({
                      ...n,
                      tipo: v as "porcentaje" | "monto",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                    <SelectItem value="monto">Monto fijo (ARS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  min={0}
                  placeholder={nueva.tipo === "porcentaje" ? "15" : "3000"}
                  value={nueva.valor}
                  onChange={(e) =>
                    setNueva((n) => ({ ...n, valor: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ini">Fecha de inicio</Label>
                <Input
                  id="ini"
                  type="date"
                  value={nueva.fechaInicio}
                  onChange={(e) =>
                    setNueva((n) => ({ ...n, fechaInicio: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin">Fecha de fin</Label>
                <Input
                  id="fin"
                  type="date"
                  value={nueva.fechaFin}
                  onChange={(e) =>
                    setNueva((n) => ({ ...n, fechaFin: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="activar"
                checked={nueva.activar}
                onCheckedChange={(v) =>
                  setNueva((n) => ({ ...n, activar: Boolean(v) }))
                }
              />
              <Label htmlFor="activar" className="cursor-pointer">
                Activar inmediatamente
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenNueva(false)}>
              Cancelar
            </Button>
            <Button onClick={crearPromo}>
              <Plus className="h-4 w-4" />
              Crear promoción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
