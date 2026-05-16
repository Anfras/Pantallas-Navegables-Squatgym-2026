import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/recuperar-password")({
  head: () => ({
    meta: [
      { title: "Recuperar Contraseña — SquatGym" },
      {
        name: "description",
        content:
          "Recuperá el acceso a tu cuenta de SquatGym. Te enviaremos un enlace para restablecer tu contraseña.",
      },
    ],
  }),
  component: RecuperarPasswordPage,
});

function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Ingresá tu email para continuar.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    toast.success("Enlace de recuperación enviado.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decoración de fondo sutil */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <Link to="/login" className="mb-8 flex items-center gap-3">
          <Dumbbell className="h-10 w-10 -rotate-45 text-primary" strokeWidth={2.4} />
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-bold tracking-tight text-foreground">SquatGym</span>
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
              Performance Architect
            </span>
          </div>
        </Link>

        {/* Card */}
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  No te preocupes. Ingresá tu email y te enviaremos un enlace para que puedas
                  restablecerla.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium">Email registrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@squatgym.com"
                      className="h-11 rounded-lg pl-9"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full gap-2 rounded-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando enlace...
                    </>
                  ) : (
                    <>
                      Enviar enlace de recuperación <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Revisá tu casilla
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Si <span className="font-semibold text-foreground">{email}</span> está registrado en
                SquatGym, te enviamos un enlace para restablecer tu contraseña. Puede tardar unos
                minutos en llegar.
              </p>

              <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-left">
                <p className="text-xs font-semibold text-foreground">¿No te llegó el correo?</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• Revisá tu carpeta de spam o promociones.</li>
                  <li>• Verificá que el email ingresado sea correcto.</li>
                  <li>• Esperá unos minutos antes de reintentar.</li>
                </ul>
              </div>

              <Button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="mt-6 h-11 w-full rounded-lg font-semibold"
              >
                Probar con otro email
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2025 SquatGym · Sistema de gestión integral
        </p>
      </div>
    </div>
  );
}
