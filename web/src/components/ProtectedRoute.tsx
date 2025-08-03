"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLES, type Role } from "@/lib/user-roles";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: Role;
    fallback?: React.ReactNode;
}

export default function ProtectedRoute({
    children,
    requiredRole = ROLES.USER,
    fallback = <div>Cargando...</div>
}: ProtectedRouteProps) {
    const { user, loading, hasAccess } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Usuario no autenticado, redirigir al login
                router.push("/");
                return;
            }

            if (!hasAccess(requiredRole)) {
                // Usuario no tiene permisos, redirigir a página de usuario
                router.push("/usuario");
                return;
            }
        }
    }, [user, loading, hasAccess, requiredRole, router]);

    // Mostrar fallback mientras carga
    if (loading) {
        return <>{fallback}</>;
    }

    // Si no hay usuario o no tiene acceso, no mostrar contenido
    if (!user || !hasAccess(requiredRole)) {
        return null;
    }

    return <>{children}</>;
} 