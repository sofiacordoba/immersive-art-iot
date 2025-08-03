"use client";
import { useState } from "react";
import { Menu, Home, Users, Settings, User as UserIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function HeaderWithDrawer() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { user, logout } = useAuth();
    return (
        <>
            <AnimatePresence>
                {drawerOpen && (
                    <motion.aside
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full w-72 z-50 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg border-r border-white/20 shadow-2xl flex flex-col p-0"
                    >
                        <div className="bg-gradient-to-br from-[#8C8CE9] to-[#6667AB] px-0 pt-8 pb-6 flex flex-col items-center rounded-b-3xl">
                            <UserIcon size={48} className="text-white mb-2" />
                            <span className="text-lg font-bold text-white text-center">
                                {user ? (user.displayName || user.email?.split("@")[0]) : "Invitado"}
                            </span>
                            <span className="text-sm text-white/80 text-center">
                                {user ? user.email : "Sin sesión"}
                            </span>
                        </div>
                        <button onClick={() => setDrawerOpen(false)} className="absolute top-3 right-3 text-lg font-bold text-white/80 bg-[#8C8CE9]/40 rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#6667AB]/60 transition">✕</button>
                        <div className="flex-1 flex flex-col px-6 pt-6 gap-2">
                            <nav className="flex flex-col gap-1">
                                <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-[#1E1E2F] hover:bg-[#e3e6f3] transition-all">
                                    <Home size={20} /> Inicio
                                </Link>
                                <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-[#1E1E2F] hover:bg-[#e3e6f3] transition-all">
                                    <Users size={20} /> Administración
                                </Link>
                                <Link href="/configuracion" className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-[#1E1E2F] hover:bg-[#e3e6f3] transition-all">
                                    <Settings size={20} /> Configuración
                                </Link>
                            </nav>
                            <div className="mt-6 mb-2 text-xs text-[#6667AB] font-semibold uppercase tracking-wide select-none">Opciones de sesión</div>
                            <button
                                onClick={async () => { await logout(); window.location.href = "/"; }}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-[#8C8CE9] hover:bg-[#e3e6f3] transition-all"
                            >
                                <LogOut size={20} /> Cerrar sesión
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
            <header className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur border-b border-[#e3e6f3] shadow-sm flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-lg bg-[#e3e6f3] hover:bg-[#d1cfe2] transition-colors">
                        <Menu size={28} color="#2C2A4A" />
                    </button>
                    <span className="text-xl font-bold text-[#2C2A4A] tracking-wide">Inmersive Art</span>
                </div>
            </header>
        </>
    );
} 