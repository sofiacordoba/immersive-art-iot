"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUserRole, ROLES, type Role } from "@/lib/user-roles";

// Simple user interface
interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  userRole: Role | null;
  hasAccess: (requiredRole: Role) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start with a default mock user for testing
  const defaultUser: User = {
    uid: 'mock-uid',
    email: 'admin@test.com',
    displayName: 'Admin User'
  };

  const [user, setUser] = useState<User | null>(defaultUser); // Start with mock user
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // Start as admin
  const [userRole, setUserRole] = useState<Role | null>('admin' as Role); // Start with admin role
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock authentication state - no Firebase needed
    const initializeAuth = async () => {
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
        setIsAdmin(role === ROLES.ADMIN);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [user]);

  // Avoid rendering during SSR
  if (!mounted) {
    return <div suppressHydrationWarning />;
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔍 Mock: signIn called with:', email);
    // Mock implementation
  };

  const signUp = async (email: string, password: string) => {
    console.log('🔍 Mock: signUp called with:', email);
    // Mock implementation
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 Mock: loginWithEmail called with:', email);
    const mockUser: User = {
      uid: 'mock-uid',
      email: email,
      displayName: email.split('@')[0]
    };
    setUser(mockUser);
    setUserRole('admin' as Role);
    setIsAdmin(true);
    return true;
  };

  const registerWithEmail = async (email: string, password: string) => {
    console.log('🔍 Mock: registerWithEmail called with:', email);
    const mockUser: User = {
      uid: 'mock-uid',
      email: email,
      displayName: email.split('@')[0]
    };
    setUser(mockUser);
    return { user: mockUser };
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    console.log('🔍 Mock: signInWithGoogle called');
    const mockUser: User = {
      uid: 'mock-uid',
      email: 'admin@test.com',
      displayName: 'Admin User'
    };
    setUser(mockUser);
    setUserRole('admin' as Role);
    setIsAdmin(true);
    return true;
  };

  const logout = async () => {
    console.log('🔍 Mock: logout called');
    setUser(null);
    setUserRole(null);
    setIsAdmin(false);
  };

  const hasAccess = (requiredRole: Role): boolean => {
    if (!userRole) return false;

    if (requiredRole === ROLES.ADMIN) {
      return userRole === ROLES.ADMIN;
    }

    return true; // Users can access user pages
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        loginWithEmail,
        registerWithEmail,
        signInWithGoogle,
        logout,
        isAdmin,
        userRole,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
