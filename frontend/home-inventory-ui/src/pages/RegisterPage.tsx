import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            setLoading(true);

            await register({
                name,
                email,
                phone,
                password,
            });

            setSuccess("Account created successfully. Please log in.");
            navigate("/login");
        } catch (err) {
            console.error("REGISTER ERROR:", err);
            setError(err instanceof Error ? err.message : "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-lg space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Create account</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sign up to start managing your home inventory
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                    <Input
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </Button>
                </form>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}