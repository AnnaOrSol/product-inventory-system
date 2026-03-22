import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated, authLoading } = useAuth();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate("/onboarding", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginRequest({ phone, password });
            login(response.accessToken);
            navigate("/onboarding", { replace: true });
        } catch (err) {
            setError("Login failed");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don’t have an account?{" "}
                    <Link to="/register" className="underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}