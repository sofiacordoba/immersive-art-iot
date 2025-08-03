"use client";

import Login from "@/components/Login";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Home() {
  const { user, loading } = useAuthRedirect();

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar login (será redirigido)
  if (user) {
    return null;
  }

  return <Login />;
}
