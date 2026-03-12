import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const value = useMemo(
        () => ({
            token,
            isAuthenticated: !!token,
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
        [token]
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