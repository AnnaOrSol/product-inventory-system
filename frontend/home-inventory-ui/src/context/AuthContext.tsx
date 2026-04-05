import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = {
    userId: string;
    name: string;
    phone: string;
};

type AuthContextType = {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    authLoading: boolean;
    login: (auth: { token: string; user: AuthUser }) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isTokenExpired(token: string): boolean {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return true;

        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return false;

        const now = Math.floor(Date.now() / 1000);
        return payload.exp <= now;
    } catch {
        return true;
    }
}

function extractUserFromToken(token: string): AuthUser | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));

        return {
            userId: payload.sub ?? "",
            name: payload.name ?? "",
            phone: payload.phone ?? "",
        };
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
            setUser(extractUserFromToken(storedToken));
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("currentInstallationId");
            setToken(null);
            setUser(null);
        }

        setAuthLoading(false);
    }, []);

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: !!token,
            authLoading,
            login: ({ token, user }: { token: string; user: AuthUser }) => {
                localStorage.setItem("token", token);
                setToken(token);
                setUser(user);
            },
            logout: () => {
                localStorage.removeItem("token");
                localStorage.removeItem("currentInstallationId");
                setToken(null);
                setUser(null);
            },
        }),
        [token, user, authLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}