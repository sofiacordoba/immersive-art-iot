import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, getAccessiblePages } from '@/lib/user-roles';

export function useAuthRedirect() {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Si el usuario está autenticado, redirigir según su rol
            const accessiblePages = getAccessiblePages(userRole);

            // Si está en la página principal y tiene acceso a admin, ir a admin
            if (window.location.pathname === '/' && accessiblePages.includes('/admin')) {
                router.push('/admin');
            } else if (window.location.pathname === '/' && accessiblePages.includes('/usuario')) {
                router.push('/usuario');
            }
        }
    }, [user, loading, userRole, router]);

    return { user, loading, userRole };
} 