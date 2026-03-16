import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginRequest({ phone, password });
            console.log("LOGIN RESPONSE:", response);
            login(response.accessToken);
            navigate("/onboarding");
        } catch (err) {
            setError("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

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
                <p className="text-sm text-center text-muted-foreground">
                    Don’t have an account?{" "}
                    <Link to="/register" className="underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}