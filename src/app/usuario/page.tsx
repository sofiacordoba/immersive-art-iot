"use client"
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useState } from "react";
import { PlayIcon, StopIcon, WifiIcon, EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon, UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { User, Palette, Play, Square, Home, Thermometer, Droplet, Settings, BarChart2, Activity, Loader2, Wifi } from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import VisitasChart from "@/components/VisitasChart";
import { motion } from "framer-motion";
import { useMQTT } from "@/hooks/useMQTT";
import { mqttService } from "@/lib/mqtt";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ROLES } from "@/lib/user-roles";
import UserInfo from "@/components/UserInfo";


// Dial simple con SVG y animación
function Dial({ value, min, max, color, label, alert, threshold }: { value: number; min: number; max: number; color: string; label: string; alert?: boolean; threshold?: number }) {
    const radius = 60;
    const stroke = 12;
    // Usar el threshold como max si está disponible, sino usar el max original
    const effectiveMax = threshold || max;
    const norm = (value - min) / (effectiveMax - min);
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - norm);
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <svg width={150} height={150}>
                    <circle cx={75} cy={75} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
                    <circle
                        cx={75}
                        cy={75}
                        r={radius}
                        stroke={color}
                        strokeWidth={stroke}
                        fill="none"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)" }}
                    />
                    <text x="50%" y="54%" textAnchor="middle" fontSize="2.5rem" fontWeight="bold" fill={color} dy=".3em">
                        {value}
                    </text>
                </svg>
                {alert && (
                    <ExclamationTriangleIcon className="absolute -top-2 -right-2 w-8 h-8 text-red-500 animate-pulse" title="¡Valor fuera de umbral!" />
                )}
            </div>
            <span className="text-lg text-gray-800 font-semibold mt-2">{label}</span>
        </div>
    );
}

const SALAS_SIMULADAS = ["sala-1", "sala-2", "sala-3"];

export default function UsuarioPage() {
    // Usar datos reales de MQTT en lugar de mock
    const { temperatura, humedad, setTempMin, setTempMax, setHumMin, setHumMax, presencia, obraActiva, mqttOnline, enlaceMultimedia, iniciarObra, detenerObra } = useMQTT();

    const [feedback, setFeedback] = useState<string | null>(null);
    const [salaActiva, setSalaActiva] = useState(SALAS_SIMULADAS[0]);
    const [alertaMail, setAlertaMail] = useState(false);
    const [estadoObraLocal, setEstadoObraLocal] = useState(false);

    // Umbrales dinámicos desde MQTT
    const tempMin = setTempMin;
    const tempMax = setTempMax;
    const humedadMin = setHumMin;
    const humedadMax = setHumMax;
    const correoContacto = "contacto@email.com";

    // Funciones para control MQTT
    const handleToggleObra = () => {
        setLoadingObra(true);

        if (estadoObraLocal) {
            // Si está activa, detener
            setFeedback("Deteniendo obra...");
            setEstadoObraLocal(false);
            mqttService.publish('/sala/123/comando', 'OFF');
        } else {
            // Si está inactiva, iniciar
            setFeedback("Iniciando obra...");
            setEstadoObraLocal(true);
            mqttService.publish('/sala/123/comando', 'ON');
        }

        setTimeout(() => {
            setFeedback(null);
            setLoadingObra(false);
        }, 2000);
    };

    // Modo pantalla completa
    const handleFullscreen = () => {
        if (typeof window !== "undefined" && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    // Simular alerta por mail
    const handleAlertaMail = () => {
        setAlertaMail(true);
        setTimeout(() => setAlertaMail(false), 2000);
        // TODO: Enviar mail real si se supera umbral
    };

    // Detectar si hay alerta usando rangos completos
    const alertaTemp = temperatura < tempMin || temperatura > tempMax;
    const alertaHumedad = humedad < humedadMin || humedad > humedadMax;
    const hayAlerta = alertaTemp || alertaHumedad;

    // Mock de datos de visitas para gráfico de línea
    const visitasLineData = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Visitas',
                data: [12, 19, 8, 15, 22, 30, 18],
                fill: true,
                borderColor: '#a18cd1',
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: canvas, chartArea } = chart;
                    if (!chartArea) return null;
                    const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(161,140,209,0.4)');
                    gradient.addColorStop(1, 'rgba(161,140,209,0.05)');
                    return gradient;
                },
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
        ],
    };
    const visitasLineOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Visitas semanales', color: '#fff', font: { size: 18, weight: 'bold' as const } },
        },
        scales: {
            x: {
                ticks: { color: '#bdbdfc', font: { weight: 'bold' as const } },
                grid: { color: 'rgba(161,140,209,0.1)' },
            },
            y: {
                ticks: { color: '#bdbdfc', font: { weight: 'bold' as const } },
                grid: { color: 'rgba(161,140,209,0.1)' },
            },
        },
    };

    // Mock para historia de presencia
    const ultimaPresencia = new Date(Date.now() - 1000 * 60 * 7); // hace 7 minutos
    const minutosDesdeUltima = Math.floor((Date.now() - ultimaPresencia.getTime()) / 60000);

    // Animación de pulso para presencia reciente
    const pulsoPresencia = presencia ? "animate-pulse" : "";

    // Estado de loading para feedback visual
    const [loadingObra, setLoadingObra] = useState(false);

    // Anillo pulsante para actividad
    const RingPulse = ({ color = "#8C8CE9" }) => (
        <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop" }}
            style={{ zIndex: 0 }}
        >
            <div
                className="rounded-full border-4"
                style={{ borderColor: color, width: 72, height: 72, opacity: 0.5 }}
            />
        </motion.div>
    );

    return (
        <ProtectedRoute requiredRole={ROLES.USER}>
            <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#1E1E2F] to-[#6667AB] p-6 font-sans">
                {/* Indicador de conexión MQTT */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    {mqttOnline ? (
                        <span className="flex items-center text-green-600 font-medium"><WifiIcon className="w-6 h-6 mr-1" /> MQTT Online</span>
                    ) : (
                        <span className="flex items-center text-red-500 font-medium"><WifiIcon className="w-6 h-6 mr-1" /> MQTT Offline</span>
                    )}
                </div>
                {/* Encabezado con logo */}
                {/* Layout optimizado para capturas: 4 cards en una fila, gráfico abajo */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-6xl flex flex-col gap-8"
                >
                    {/* Título principal */}
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg mb-2 tracking-tight">
                        🎨 Instalación de Arte Inmersivo
                    </h1>
                    {/* Fila de 4 cards: presencia, obra, temperatura, humedad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card de presencia */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className={`relative rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md flex flex-col items-center min-h-[160px] p-4 transition-all duration-300 ${pulsoPresencia}`}
                        >
                            {presencia && <RingPulse color="#84cc16" />}
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop" }} style={{ zIndex: 1 }}>
                                <User className="w-10 h-10 mb-1 text-[#6667AB]" />
                            </motion.div>
                            <span className="text-lg font-bold text-[#1E1E2F]">{presencia ? "Con presencia" : "Sin presencia"}</span>
                            <span className="mt-1 text-xs text-[#6667AB] font-semibold">
                                Última: {ultimaPresencia.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({minutosDesdeUltima} min.)
                            </span>
                        </motion.div>
                        {/* Card de estado de obra */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="relative rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md flex flex-col items-center min-h-[160px] p-4 transition-all duration-300"
                        >
                            <Palette className="w-10 h-10 mb-1 text-[#8C8CE9]" />
                            <span className="text-base font-bold text-[#1E1E2F] mb-1">Obra</span>
                            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg shadow mb-2 text-base font-bold ${estadoObraLocal ? "bg-[#8C8CE9]/20 text-[#8C8CE9]" : "bg-gray-100 text-gray-400"}`}>
                                {estadoObraLocal ? <Play /> : <Square />}
                                <span>{estadoObraLocal ? "Activa" : "Inactiva"}</span>
                            </div>
                            <select className="px-2 py-1 rounded-lg border border-[#8C8CE9] bg-white text-[#1E1E2F] font-semibold text-sm shadow mb-2">
                                {SALAS_SIMULADAS.map(sala => (
                                    <option key={sala} value={sala}>{sala}</option>
                                ))}
                            </select>
                            <button
                                onClick={async () => {
                                    setLoadingObra(true);
                                    await new Promise(r => setTimeout(r, 1200));
                                    handleToggleObra();
                                    setLoadingObra(false);
                                }}
                                disabled={loadingObra}
                                className={`w-full text-sm font-bold rounded-xl py-2 mt-1 transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                                 bg-gradient-to-r from-[#a18cd1] to-[#fbc2eb] text-white
                                 hover:scale-105 hover:brightness-110 active:scale-95
                                 ${estadoObraLocal ? "opacity-80" : ""}
                                 ${loadingObra ? "animate-vibrate" : ""}
                             `}
                            >
                                {loadingObra ? (
                                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                        <Loader2 className="w-5 h-5" />
                                    </motion.span>
                                ) : (
                                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop" }}>
                                        {estadoObraLocal ? <Square className="inline mr-1 w-5 h-5" /> : <Play className="inline mr-1 w-5 h-5" />}
                                    </motion.span>
                                )}
                                {loadingObra ? "..." : estadoObraLocal ? "Detener" : "Iniciar"}
                            </button>
                        </motion.div>
                        {/* Card de temperatura */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="relative rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md flex flex-col items-center min-h-[160px] p-4 transition-all duration-300"
                        >
                            <RingPulse color="#8C8CE9" />
                            <Thermometer className="w-10 h-10 mb-1 text-[#8C8CE9] relative z-10" />
                            <span className="text-base font-bold text-[#1E1E2F] mb-1">🌡 Temp.</span>
                            <div className="text-xs text-blue-600 mb-2">Umbral: {tempMin}-{tempMax}°C</div>
                            <motion.div
                                key={temperatura}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                style={{ zIndex: 1 }}
                            >
                                <Dial value={temperatura} min={tempMin} max={tempMax} color="#8C8CE9" label="" alert={alertaTemp} threshold={tempMax} />
                            </motion.div>
                        </motion.div>
                        {/* Card de humedad */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                            className="relative rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md flex flex-col items-center min-h-[160px] p-4 transition-all duration-300"
                        >
                            <RingPulse color="#94D9E3" />
                            <Droplet className="w-10 h-10 mb-1 text-[#94D9E3] relative z-10" />
                            <span className="text-base font-bold text-[#1E1E2F] mb-1">💧 Humedad</span>
                            <div className="text-xs text-blue-600 mb-2">Umbral: {humedadMin}-{humedadMax}%</div>
                            <motion.div
                                key={humedad}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                style={{ zIndex: 1 }}
                            >
                                <Dial value={humedad} min={humedadMin} max={humedadMax} color="#94D9E3" label="" alert={alertaHumedad} threshold={humedadMax} />
                            </motion.div>
                        </motion.div>
                    </div>
                    {/* Gráfico de visitas */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="md:col-span-2 rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md flex flex-col items-center p-8 transition-all duration-300 mt-8"
                    >
                        <VisitasChart />
                    </motion.div>

                    {/* Enlace multimedia */}
                    {enlaceMultimedia && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.7 }}
                            className="w-full rounded-2xl shadow-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] backdrop-blur-md p-6 transition-all duration-300"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🎬</span>
                                <h3 className="text-xl font-bold text-white">Contenido Multimedia</h3>
                            </div>
                            <div className="bg-white/20 rounded-lg p-4">
                                <p className="text-white/90 mb-3">Enlace configurado:</p>
                                <a
                                    href={enlaceMultimedia}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-300 hover:text-blue-200 underline break-all"
                                >
                                    {enlaceMultimedia}
                                </a>
                            </div>
                        </motion.div>
                    )}


                </motion.div>
                {/* Alerta visual y opción de enviar mail */}
                {hayAlerta && (
                    <div className="mb-6 flex flex-col items-center">
                        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded shadow text-lg font-semibold">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                            ¡Alerta! Valores fuera de umbral
                        </div>
                        <Button onClick={handleAlertaMail} className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                            <EnvelopeIcon className="w-5 h-5" />
                            Enviar alerta a {correoContacto}
                        </Button>
                        {alertaMail && (
                            <div className="mt-2 text-green-600 flex items-center gap-1"><EnvelopeIcon className="w-5 h-5" /> Alerta enviada (simulado)</div>
                        )}
                    </div>
                )}
                {/* Feedback inmediato */}
                {feedback && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded shadow text-xl font-semibold z-50 animate-bounce">
                        {feedback}
                    </div>
                )}
                {/* Modo pantalla completa */}
                <button
                    onClick={handleFullscreen}
                    className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow text-sm font-medium"
                    title="Pantalla completa"
                >
                    Pantalla completa
                </button>
                {/* Indicador MQTT en la esquina superior derecha */}
                <div className="fixed top-6 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-[rgba(255,255,255,0.15)] backdrop-blur-md border border-[rgba(255,255,255,0.2)]">
                    <Wifi className={`w-5 h-5 ${mqttOnline ? "text-green-400" : "text-red-400"}`} />
                    <span className={`font-semibold text-sm ${mqttOnline ? "text-green-400" : "text-red-400"}`}>{mqttOnline ? "MQTT Online" : "MQTT Offline"}</span>
                </div>

                {/* Información del usuario */}
                <div className="fixed top-6 left-8 z-50">
                    <UserInfo />
                </div>
                {/* Agregar animación CSS para vibración */}
                <style jsx global>{`
                @keyframes vibrate {
                    0% { transform: translateX(0); }
                    20% { transform: translateX(-2px); }
                    40% { transform: translateX(2px); }
                    60% { transform: translateX(-2px); }
                    80% { transform: translateX(2px); }
                    100% { transform: translateX(0); }
                }
                .animate-vibrate {
                    animation: vibrate 0.4s linear 1;
                }
            `}</style>
            </div>
        </ProtectedRoute>
    );
} 