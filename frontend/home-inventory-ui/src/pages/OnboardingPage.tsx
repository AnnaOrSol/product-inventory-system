import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInstallation, joinInstallation } from "@/api/installationApi";
import { installationService } from "@/services/installationService";
import { useEffect } from "react";
import { getMyInstallations, type InstallationMemberResponse } from "@/api/installationMemberApi";

export default function OnboardingPage() {
    const navigate = useNavigate();

    const [mode, setMode] = useState<"choose" | "select" | "create" | "join">("choose");
    const [installationName, setInstallationName] = useState("");
    const [pairingCode, setPairingCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [myInstallations, setMyInstallations] = useState<InstallationMemberResponse[]>([]);
    const [loadingInstallations, setLoadingInstallations] = useState(true);

    const handleCreate = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await createInstallation({
                name: installationName || "My Home",
            });

            installationService.saveId(response.installationId);
            navigate("/");
        } catch (err) {
            console.error("CREATE INSTALLATION ERROR:", err);
            setError("Failed to create installation");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadMyInstallations = async () => {
            try {
                const installations = await getMyInstallations();
                console.log("INSTALLATIONS RESPONSE:", installations);
                console.log("IS ARRAY?", Array.isArray(installations));
                setMyInstallations(installations);
            } catch (err) {
                console.error("LOAD INSTALLATIONS ERROR:", err);
                setMyInstallations([]);
            } finally {
                setLoadingInstallations(false);
            }
        };

        loadMyInstallations();
    }, []);

    const handleSelectInstallation = (installationId: string) => {
        installationService.saveId(installationId);
        navigate("/");
    };

    const handleJoin = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await joinInstallation({
                code: pairingCode.toUpperCase(),
            });

            installationService.saveId(response.installationId);
            navigate("/");
        } catch (err) {
            console.error("JOIN INSTALLATION ERROR:", err);
            setError("Failed to join installation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-lg space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Welcome</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create a new home installation or join an existing one
                    </p>
                </div>

                {mode === "choose" && (
                    <div className="space-y-3">
                        {!loadingInstallations && myInstallations.length > 0 && (
                            <Button className="w-full" onClick={() => setMode("select")}>
                                Choose existing home
                            </Button>
                        )}

                        <Button
                            variant={!loadingInstallations && myInstallations.length > 0 ? "secondary" : "default"}
                            className="w-full"
                            onClick={() => setMode("create")}
                        >
                            Create new installation
                        </Button>

                        <Button variant="secondary" className="w-full" onClick={() => setMode("join")}>
                            Join existing installation
                        </Button>
                    </div>
                )}

                {mode === "select" && (
                    <div className="space-y-3">
                        {myInstallations.map((installation) => (
                            <Button
                                key={installation.installationId}
                                variant="secondary"
                                className="w-full"
                                onClick={() => handleSelectInstallation(installation.installationId)}
                            >
                                {installation.installationName}
                            </Button>
                        ))}

                        <Button variant="outline" className="w-full" onClick={() => setMode("choose")}>
                            Back
                        </Button>
                    </div>
                )}

                {mode === "create" && (
                    <div className="space-y-3">
                        <Input
                            placeholder="Installation name"
                            value={installationName}
                            onChange={(e) => setInstallationName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setMode("choose")}>
                                Back
                            </Button>
                            <Button className="flex-1" onClick={handleCreate} disabled={loading}>
                                {loading ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "join" && (
                    <div className="space-y-3">
                        <Input
                            placeholder="Pairing code"
                            value={pairingCode}
                            onChange={(e) => setPairingCode(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setMode("choose")}>
                                Back
                            </Button>
                            <Button className="flex-1" onClick={handleJoin} disabled={loading}>
                                {loading ? "Joining..." : "Join"}
                            </Button>
                        </div>
                    </div>
                )}

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
        </div>
    );
}