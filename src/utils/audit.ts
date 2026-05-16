export function registrarAuditoria(usuario: string, accion: string, modulo: string) {
  try {
    const logsRaw = localStorage.getItem("squatgym_audit_logs");
    const logs = logsRaw ? JSON.parse(logsRaw) : [];
    logs.unshift({
      id: crypto.randomUUID(),
      fecha: new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) + " hs",
      usuario,
      accion,
      modulo,
    });
    localStorage.setItem("squatgym_audit_logs", JSON.stringify(logs));
  } catch (e) {
    console.error("Error guardando log de auditoría", e);
  }
}
