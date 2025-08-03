"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { UserCog, UserCheck } from "lucide-react";
import { Wifi } from "lucide-react";
import { Thermometer, Droplet, Palette, User as UserIcon, Square, Play, Activity } from "lucide-react";
import { useMQTT } from "@/hooks/useMQTT";
import { mqttService, MQTT_TOPICS } from "@/lib/mqtt";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  lastSignInTime: string;
}

export default function AdminPage() {
  const { user, isAdmin, userRole } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Usar datos reales de MQTT
  const { temperatura, humedad, setTempMin, setTempMax, setHumMin, setHumMax, presencia, obraActiva, mqttOnline } = useMQTT();



  // Estado para el formulario de configuración
  const [config, setConfig] = useState({
    setTempMin: "",
    setTempMax: "",
    setHumMin: "",
    setHumMax: "",
    salaId: "",
    email: "",
    multimedia: "",
  });
  const [salasActivas, setSalasActivas] = useState<string[]>(["sala-1", "sala-2"]); // Simulado
  const [showToast, setShowToast] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Manejo de cambios en el formulario
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.id]: e.target.value });
  };

  // Validación simple - solo ID de sala es requerido
  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!config.salaId) errors.salaId = "Requerido";
    return errors;
  };

  // Guardar configuración y enviar comandos MQTT
  const handleGuardarConfig = () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Enviar comandos MQTT solo para los campos que se llenaron
    const configuracionesEnviadas = [];

    if (config.setTempMin) {
      mqttService.publish(MQTT_TOPICS.SET_TEMP_MIN, config.setTempMin);
      configuracionesEnviadas.push(`Temp Min: ${config.setTempMin}°C`);
    }
    if (config.setTempMax) {
      mqttService.publish(MQTT_TOPICS.SET_TEMP_MAX, config.setTempMax);
      configuracionesEnviadas.push(`Temp Max: ${config.setTempMax}°C`);
    }
    if (config.setHumMin) {
      mqttService.publish(MQTT_TOPICS.SET_HUM_MIN, config.setHumMin);
      configuracionesEnviadas.push(`Hum Min: ${config.setHumMin}%`);
    }
    if (config.setHumMax) {
      mqttService.publish(MQTT_TOPICS.SET_HUM_MAX, config.setHumMax);
      configuracionesEnviadas.push(`Hum Max: ${config.setHumMax}%`);
    }
    if (config.multimedia) {
      mqttService.publish(MQTT_TOPICS.MULTIMEDIA, config.multimedia);
      console.log(`📤 Enviando enlace multimedia: ${config.multimedia}`);
      configuracionesEnviadas.push(`Enlace multimedia: ${config.multimedia}`);
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    // Mostrar confirmación solo de los valores enviados
    if (configuracionesEnviadas.length > 0) {
      alert("Configuración enviada a MQTT:\n" + configuracionesEnviadas.join('\n'));
    } else {
      alert("Solo se configuró el ID de sala. Los umbrales mantienen sus valores por defecto.");
    }

    // Simular agregar sala activa
    if (config.salaId && !salasActivas.includes(config.salaId)) {
      setSalasActivas([...salasActivas, config.salaId]);
    }
  };

  useEffect(() => {
    // if (!user) {
    //   router.push("/");
    //   return;
    // }

    // if (!isAdmin) {
    //   router.push("/");
    //   return;
    // }

    // fetchUsers(); // Comentado temporalmente
    setLoading(false); // Simular carga completada
  }, [user, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (uid: string, newRole: "admin" | "user") => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, role: newRole }),
      });

      if (response.ok) {
        // Actualizar la lista de usuarios
        setUsers(
          users.map((user) =>
            user.uid === uid ? { ...user, role: newRole } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  // Estado para el formulario de conversión de usuario a admin
  const [makeAdminEmail, setMakeAdminEmail] = useState("");

  const handleMakeAdmin = async () => {
    if (!makeAdminEmail) {
      alert("Por favor, ingrese el email del usuario a convertir.");
      return;
    }

    // Comentado temporalmente hasta configurar Firebase Admin
    alert("Función temporalmente deshabilitada - Configurar Firebase Admin");
    setMakeAdminEmail("");

    // try {
    //   const response = await fetch("/api/users/make-admin", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ email: makeAdminEmail }),
    //   });

    //   if (response.ok) {
    //     const data = await response.json();
    //     alert(`Usuario ${data.email} ahora es administrador.`);
    //     setMakeAdminEmail(""); // Limpiar el campo
    //     fetchUsers(); // Recargar la lista de usuarios
    //   } else {
    //     const errorData = await response.json();
    //     alert(`Error al convertir a admin: ${errorData.message || response.statusText}`);
    //   }
    // } catch (error) {
    //   console.error("Error al convertir a admin:", error);
    //   alert("Ocurrió un error al intentar convertir a admin.");
    // }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <div className="text-xl text-gray-600">Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#1E1E2F] to-[#6667AB] p-6 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Card de configuración de la sala (izquierda) */}
        <div className="rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md p-6">
          <div className="border-b pb-4 mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">Configuración de la Sala</h2>
            <InformationCircleIcon className="w-5 h-5 text-gray-500" title="Configura los parámetros globales de la instalación." />
          </div>
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Temp. mín. (°C)" id="setTempMin" type="number" value={config.setTempMin} onChange={handleConfigChange} required placeholder="Ej: 18" className={formErrors.setTempMin ? "border-red-500" : ""} title="Temperatura mínima permitida." labelClassName="text-[#1E1E2F] font-semibold" />
              <Input label="Temp. máx. (°C)" id="setTempMax" type="number" value={config.setTempMax} onChange={handleConfigChange} required placeholder="Ej: 30" className={formErrors.setTempMax ? "border-red-500" : ""} title="Temperatura máxima permitida." labelClassName="text-[#1E1E2F] font-semibold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Humedad mín. (%)" id="setHumMin" type="number" value={config.setHumMin} onChange={handleConfigChange} required placeholder="Ej: 40" className={formErrors.setHumMin ? "border-red-500" : ""} title="Humedad mínima permitida." labelClassName="text-[#1E1E2F] font-semibold" />
              <Input label="Humedad máx. (%)" id="setHumMax" type="number" value={config.setHumMax} onChange={handleConfigChange} required placeholder="Ej: 70" className={formErrors.setHumMax ? "border-red-500" : ""} title="Humedad máxima permitida." labelClassName="text-[#1E1E2F] font-semibold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="ID de sala" id="salaId" type="text" value={config.salaId} onChange={handleConfigChange} required placeholder="Ej: sala-1" className={formErrors.salaId ? "border-red-500" : ""} title="Identificador único de la sala." labelClassName="text-[#1E1E2F] font-semibold" />
              <Input label="Correo de contacto" id="email" type="email" value={config.email} onChange={handleConfigChange} required placeholder="ejemplo@email.com" className={formErrors.email ? "border-red-500" : ""} title="Correo para notificaciones." labelClassName="text-[#1E1E2F] font-semibold" />
            </div>
            <Input label="Enlace multimedia (video, etc.)" id="multimedia" type="url" value={config.multimedia} onChange={handleConfigChange} required placeholder="https://..." className={formErrors.multimedia ? "border-red-500" : ""} title="URL de video o recurso multimedia." labelClassName="text-[#1E1E2F] font-semibold" />
            <button type="submit" className="w-full text-lg font-bold rounded-xl py-3 mt-2 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-[#a18cd1] to-[#fbc2eb] text-white hover:scale-105 hover:brightness-110 active:scale-95" onClick={handleGuardarConfig}>
              Guardar configuración
            </button>
          </form>
          {/* Listado de salas activas ... */}
        </div>
        {/* Card de usuarios (derecha) con ancho completo */}
        <div className="rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md p-6 w-full max-w-none">
          <div className="flex items-center gap-2 mb-6">
            <UserCog className="w-7 h-7 text-[#8C8CE9]" />
            <h2 className="text-2xl font-bold text-white">Usuarios registrados</h2>
          </div>
          {/* Tabla de usuarios */}
          <div className="overflow-x-auto">
            {/* Tabla de usuarios: header sin fondo especial, solo texto blanco y glassmorphism */}
            <table className="min-w-full divide-y divide-[#8C8CE9]/30">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Último acceso</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#8C8CE9]/10">
                {/* Ejemplo de usuario */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">Ana Pérez</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">ana@email.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">2024-06-10 14:23</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#8C8CE9]/20 text-[#8C8CE9] border border-[#8C8CE9]/30">Admin</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#a18cd1] to-[#fbc2eb] text-white font-bold shadow hover:scale-105 transition-all">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Formulario para convertir usuario en admin */}
            <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
              <Input
                label="Email del usuario a convertir en admin"
                id="makeAdminEmail"
                type="email"
                value={makeAdminEmail}
                onChange={e => setMakeAdminEmail(e.target.value)}
                placeholder="usuario@email.com"
                className="bg-white/40 text-[#1E1E2F] border-[#8C8CE9] focus:ring-[#8C8CE9] focus:border-[#8C8CE9]"
                labelClassName="text-[#8C8CE9] font-semibold"
              />
              <button onClick={handleMakeAdmin} className="bg-gradient-to-r from-[#a18cd1] to-[#fbc2eb] hover:scale-105 hover:brightness-110 active:scale-95 text-white font-bold px-6 py-2 rounded-xl shadow transition-all duration-200 flex items-center gap-2">
                <UserCog size={20} /> Hacer admin
              </button>
            </div>
          </div>
          {/* Fila de 4 cards de sensores/estado */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 min-h-0 overflow-hidden">
            {/* Temperatura */}
            <div className="rounded-xl shadow border border-[#8C8CE9]/30 bg-white/30 backdrop-blur p-3 flex flex-col items-center min-h-[100px]">
              <Thermometer className="w-7 h-7 text-[#8C8CE9] mb-1" />
              <span className="text-lg font-bold text-[#1E1E2F]">{temperatura.toFixed(1)}°C</span>
              <span className="text-xs text-[#8C8CE9] font-semibold">Temperatura</span>
            </div>
            {/* Humedad */}
            <div className="rounded-xl shadow border border-[#94D9E3]/30 bg-white/30 backdrop-blur p-3 flex flex-col items-center min-h-[100px]">
              <Droplet className="w-7 h-7 text-[#94D9E3] mb-1" />
              <span className="text-lg font-bold text-[#1E1E2F]">{humedad.toFixed(0)}%</span>
              <span className="text-xs text-[#94D9E3] font-semibold">Humedad</span>
            </div>
            {/* Obra activa */}
            <div className="rounded-xl shadow border border-[#a18cd1]/30 bg-white/30 backdrop-blur p-3 flex flex-col items-center min-h-[100px]">
              <Palette className="w-7 h-7 text-[#a18cd1] mb-1" />
              <span className="text-lg font-bold text-[#1E1E2F] flex items-center gap-1">
                {obraActiva ? <Play className="w-4 h-4 text-[#8C8CE9]" /> : <Square className="w-4 h-4 text-gray-400" />}
                {obraActiva ? "Activa" : "Inactiva"}
              </span>
              <span className="text-xs text-[#a18cd1] font-semibold">Obra</span>
            </div>
            {/* Presencia */}
            <div className="rounded-xl shadow border border-[#84cc16]/30 bg-white/30 backdrop-blur p-3 flex flex-col items-center min-h-[100px]">
              <Activity className="w-7 h-7 text-[#84cc16] mb-1" />
              <span className="text-lg font-bold text-[#1E1E2F]">{presencia ? "Con presencia" : "Sin presencia"}</span>
              <span className="text-xs text-[#84cc16] font-semibold">Presencia</span>
            </div>
          </div>
        </div>
      </div>
      {/* Indicador MQTT en la esquina superior derecha */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-[rgba(255,255,255,0.15)] backdrop-blur-md border border-[rgba(255,255,255,0.2)]">
        <Wifi className={`w-5 h-5 ${mqttOnline ? "text-green-400" : "text-red-400"}`} />
        <span className={`font-semibold text-sm ${mqttOnline ? "text-green-400" : "text-red-400"}`}>{mqttOnline ? "MQTT Online" : "MQTT Offline"}</span>
      </div>
    </div>
  );
}
