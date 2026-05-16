import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar Sesión — SquatGym" },
      {
        name: "description",
        content:
          "Accedé al panel administrativo de SquatGym o registrá una nueva cuenta para gestionar el gimnasio.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: true });
  const [regForm, setRegForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    
    const email = loginForm.email.toLowerCase();
    let role = "Admin";
    let name = "Carlos Mendoza";
    let dest = "/admin/users";

    if (email.includes("socio") || email.includes("alumno")) {
      role = "Alumno";
      name = "Socio SquatGym";
      dest = "/app/billing";
    } else if (email.includes("secretaria")) {
      role = "Secretaria";
      name = "Ana (Recepción)";
      dest = "/desk/";
    } else if (email.includes("encargado")) {
      role = "Encargado de Sucursal";
      name = "Lucas (Encargado)";
      dest = "/desk/proveedores";
    } else {
      role = "Admin";
      name = "Carlos Mendoza";
      dest = "/admin/users";
    }

    localStorage.setItem("squatgym_role", role);
    localStorage.setItem("squatgym_name", name);

    toast.success(`¡Bienvenido/a, ${name}!`);
    navigate({ to: dest as any });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.nombre || !regForm.email || !regForm.password) {
      toast.error("Completá todos los campos.");
      return;
    }
    if (regForm.password !== regForm.confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (!regForm.terms) {
      toast.error("Debés aceptar los términos y condiciones.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    toast.success("Cuenta creada correctamente. Ya podés iniciar sesión.");
    setTab("login");
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
        <Link to="/" className="mb-8 flex items-center gap-3">
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
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="sr-only">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login" className="mt-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Bienvenido de nuevo
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ingresá tus credenciales para acceder al panel.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="admin@squatgym.com"
                      className="h-11 rounded-lg pl-9"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className="text-xs font-medium">Contraseña</Label>
                    <Link
                      to="/recuperar-password"
                      className="text-xs font-medium text-foreground/70 hover:text-primary"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="h-11 rounded-lg pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={loginForm.remember}
                    onCheckedChange={(c) =>
                      setLoginForm({ ...loginForm, remember: c === true })
                    }
                  />
                  <span className="text-sm text-muted-foreground">Mantener sesión iniciada</span>
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full gap-2 rounded-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Ingresando...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿No tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  Registrate acá
                </button>
              </p>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register" className="mt-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Crear cuenta nueva
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sumate al equipo administrativo de SquatGym.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={regForm.nombre}
                      onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })}
                      placeholder="Juan Pérez"
                      className="h-11 rounded-lg pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="h-11 rounded-lg pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Mínimo 8 caracteres"
                      className="h-11 rounded-lg pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-medium">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={regForm.confirm}
                      onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })}
                      placeholder="Repetí tu contraseña"
                      className="h-11 rounded-lg pl-9"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-2">
                  <Checkbox
                    checked={regForm.terms}
                    onCheckedChange={(c) => setRegForm({ ...regForm, terms: c === true })}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-muted-foreground">
                    Acepto los{" "}
                    <span className="font-semibold text-foreground">términos y condiciones</span> y
                    la política de privacidad de SquatGym.
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full gap-2 rounded-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear mi cuenta <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  Iniciá sesión
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2025 SquatGym · Sistema de gestión integral
        </p>
      </div>
    </div>
  );
}
