"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";

export default function UserInfo() {
    const { user, userRole, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white" />
                <div className="text-white">
                    <div className="font-semibold">{user.email}</div>
                    <div className="text-sm opacity-80">
                        Rol: {userRole === 'admin' ? 'Administrador' : 'Usuario'}
                    </div>
                </div>
            </div>
            <button
                onClick={logout}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
                <LogOut className="w-4 h-4" />
                Salir
            </button>
        </div>
    );
} 