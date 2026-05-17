import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, UserCircle2, Printer } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AUDITORIA, USUARIOS } from "@/data/auditoria";

export const Route = createFileRoute("/admin/audit/$userId")({
  head: ({ params }) => ({
    meta: [
      { title: `Auditoría del usuario — SquatGym` },
      {
        name: "description",
        content: `Historial de actividad del usuario ${params.userId} en el sistema SquatGym.`,
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Usuario no encontrado</h1>
        <p className="mt-2 text-muted-foreground">El usuario solicitado no existe.</p>
        <Link
          to="/admin/users"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a usuarios
        </Link>
      </main>
    </div>
  ),
  component: AuditoriaUsuarioPage,
});

function AuditoriaUsuarioPage() {
  const { userId } = Route.useParams();
  const usuario = USUARIOS.find((u) => u.id === userId);

  if (!usuario) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Usuario no encontrado</h1>
          <Link
            to="/admin/users"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a usuarios
          </Link>
        </main>
      </div>
    );
  }

  const movimientos = AUDITORIA.filter((a) => a.usuarioId === usuario.id);


  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/admin/users"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Gestión de Roles y Auditoría
        </Link>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <UserCircle2 className="h-7 w-7 text-accent-foreground" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Auditoría individual
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {usuario.nombre}
              </h1>
              <p className="text-sm text-muted-foreground">
                {usuario.email} · <span className="font-semibold text-foreground">{usuario.rol}</span>
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background px-5 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-foreground">{movimientos.length}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Movimientos</p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <AlertTriangle className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Historial de actividad del usuario
                </h2>
                <p className="text-sm text-muted-foreground">
                  Registro cronológico inmutable de todas las acciones realizadas por este usuario.
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
                  <TableHead className="px-4">Acción realizada</TableHead>
                  <TableHead className="px-4">Módulo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((entry) => (
                  <TableRow key={entry.id} className="border-border">
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {entry.fecha}
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
                {movimientos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      Este usuario aún no registra movimientos en el sistema.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
