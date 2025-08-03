// Firebase removed - basic role definitions only

export interface UserRole {
    uid: string;
    email: string;
    role: 'admin' | 'user';
    displayName?: string;
    createdAt: Date;
    lastLogin: Date;
}

export const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Mock function for getting user role
export async function getUserRole(uid: string): Promise<Role | null> {
    console.log('🔍 Mock: getUserRole called for UID:', uid);
    // Return admin for testing
    return 'admin' as Role;
}

// Mock function for setting user role
export async function setUserRole(uid: string, email: string, role: Role, displayName?: string): Promise<void> {
    console.log('🔍 Mock: setUserRole called for UID:', uid);
    // Mock implementation - no Firebase
}

// Mock function for updating user role
export async function updateUserRole(uid: string, newRole: Role): Promise<void> {
    console.log('🔍 Mock: updateUserRole called for UID:', uid);
    // Mock implementation - no Firebase
}

// Function to verify if a user has access to a page
export function hasAccess(userRole: Role | null, requiredRole: Role): boolean {
    if (!userRole) return false;

    if (requiredRole === ROLES.ADMIN) {
        return userRole === ROLES.ADMIN;
    }

    return true; // Users can access user pages
}

// Function to get all pages a role can access
export function getAccessiblePages(role: Role | null): string[] {
    if (!role) return ['/'];

    const pages = {
        [ROLES.ADMIN]: ['/', '/admin', '/usuario'],
        [ROLES.USER]: ['/', '/usuario']
    };

    return pages[role] || ['/'];
} 