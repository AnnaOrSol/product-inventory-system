import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    authLoading: boolean;
    login: (token: string) => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("currentInstallationId");
            setToken(null);
        }

        setAuthLoading(false);
    }, []);

    const value = useMemo(
        () => ({
            token,
            isAuthenticated: !!token,
            authLoading,
            login: (newToken: string) => {
                localStorage.setItem("token", newToken);
                setToken(newToken);
            },
            logout: () => {
                localStorage.removeItem("token");
                localStorage.removeItem("currentInstallationId");
                setToken(null);
            },
        }),
        [token, authLoading]
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