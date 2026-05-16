export type AuditoriaEntry = {
  id: string;
  fecha: string;
  usuario: string;
  usuarioId: string;
  accion: string;
  modulo: string;
};

export const AUDITORIA: AuditoriaEntry[] = [
  { id: "a1", fecha: "25/04 14:20", usuario: "Secretaria Pérez", usuarioId: "1", accion: "Registró Pago Alumno DNI 30.215.498", modulo: "Cobros" },
  { id: "a2", fecha: "25/04 13:55", usuario: "Admin Mendoza", usuarioId: "5", accion: "Modificó permisos del rol Encargado Kiosco", modulo: "Seguridad" },
  { id: "a3", fecha: "25/04 12:10", usuario: "Encargado Caballero", usuarioId: "3", accion: "Actualizó precio de Proteína Whey 1kg", modulo: "Kiosco" },
  { id: "a4", fecha: "25/04 11:42", usuario: "Secretaria Pérez", usuarioId: "1", accion: "Generó reporte de deudores mensual", modulo: "Reportes" },
  { id: "a5", fecha: "24/04 19:08", usuario: "Admin Mendoza", usuarioId: "5", accion: "Desactivó usuario Diego Salinas", modulo: "Usuarios" },
  { id: "a6", fecha: "24/04 17:30", usuario: "Entrenador Rivero", usuarioId: "2", accion: "Editó ficha del alumno Juan Romero", modulo: "Alumnos" },
  { id: "a7", fecha: "23/04 16:14", usuario: "Secretaria Pérez", usuarioId: "1", accion: "Registró cobro de cuota mensual alumno DNI 28.114.902", modulo: "Cobros" },
  { id: "a8", fecha: "23/04 10:02", usuario: "Encargado Caballero", usuarioId: "3", accion: "Ajustó stock de Barritas Proteicas", modulo: "Kiosco" },
  { id: "a9", fecha: "22/04 18:45", usuario: "Entrenador Rivero", usuarioId: "2", accion: "Actualizó rutina del alumno Lucas Gómez", modulo: "Alumnos" },
  { id: "a10", fecha: "22/04 09:30", usuario: "Admin Mendoza", usuarioId: "5", accion: "Creó usuario Sofía Caballero", modulo: "Usuarios" },
  { id: "a11", fecha: "21/04 16:20", usuario: "Diego Salinas", usuarioId: "4", accion: "Registró cobro de cuota mensual alumno DNI 31.408.221", modulo: "Cobros" },
  { id: "a12", fecha: "21/04 11:05", usuario: "Diego Salinas", usuarioId: "4", accion: "Generó comprobante de pago N° 4521", modulo: "Cobros" },
  { id: "a13", fecha: "20/04 18:50", usuario: "Diego Salinas", usuarioId: "4", accion: "Consultó listado de deudores del mes", modulo: "Reportes" },
  { id: "a14", fecha: "20/04 09:15", usuario: "Lucía Pérez", usuarioId: "1", accion: "Editó datos de contacto del alumno Martín Suárez", modulo: "Alumnos" },
  { id: "a15", fecha: "19/04 20:00", usuario: "Marcos Rivero", usuarioId: "2", accion: "Cargó nueva rutina de hipertrofia para alumno Pablo Núñez", modulo: "Alumnos" },
  { id: "a16", fecha: "19/04 14:35", usuario: "Sofía Caballero", usuarioId: "3", accion: "Registró ingreso de mercadería: 24 unidades Gatorade", modulo: "Kiosco" },
];

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

export const USUARIOS: Usuario[] = [
  { id: "1", nombre: "Lucía Pérez", email: "lucia.perez@squatgym.com", rol: "Secretaria", activo: true },
  { id: "2", nombre: "Marcos Rivero", email: "marcos.rivero@squatgym.com", rol: "Entrenador", activo: true },
  { id: "3", nombre: "Sofía Caballero", email: "sofia.caballero@squatgym.com", rol: "Encargado Kiosco", activo: true },
  { id: "4", nombre: "Diego Salinas", email: "diego.salinas@squatgym.com", rol: "Secretaria", activo: false },
  { id: "5", nombre: "Carlos Mendoza", email: "carlos.mendoza@squatgym.com", rol: "Administrador", activo: true },
];
