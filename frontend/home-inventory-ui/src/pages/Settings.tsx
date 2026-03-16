import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Check,
    Copy,
    Home,
    LogOut,
    Pencil,
    QrCode,
    RefreshCw,
    Save,
} from "lucide-react";
import {
    generatePairCode,
    getCurrentInstallation,
    updateInstallationName,
} from "@/api/installationApi";
import { InstallationDetails } from "@/types/installation";
import { installationService } from "@/services/installationService";

const Settings = () => {
    const navigate = useNavigate();

    const [installation, setInstallation] = useState<InstallationDetails | null>(null);
    const [pairingCode, setPairingCode] = useState<string | null>(null);

    const [loadingInstallation, setLoadingInstallation] = useState(true);
    const [generatingCode, setGeneratingCode] = useState(false);
    const [savingName, setSavingName] = useState(false);

    const [copied, setCopied] = useState<"code" | "link" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [editingName, setEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");

    useEffect(() => {
        loadInstallation();
    }, []);

    async function loadInstallation() {
        try {
            setLoadingInstallation(true);
            setError(null);

            const data = await getCurrentInstallation();
            setInstallation(data);
            setEditedName(data.name);
        } catch (err) {
            console.error(err);
            setError("Failed to load home details");
        } finally {
            setLoadingInstallation(false);
        }
    }

    async function handleGenerateInvite() {
        try {
            setGeneratingCode(true);
            setError(null);

            const result = await generatePairCode();
            setPairingCode(result.pairingCode);
        } catch (err) {
            console.error(err);
            setError("Failed to generate invite code");
        } finally {
            setGeneratingCode(false);
        }
    }

    async function handleSaveName() {
        const trimmedName = editedName.trim();

        if (!trimmedName) {
            setError("Home name cannot be empty");
            return;
        }

        if (!installation) return;

        try {
            setSavingName(true);
            setError(null);

            const updated = await updateInstallationName(trimmedName);
            setInstallation(updated);
            setEditedName(updated.name);
            setEditingName(false);
        } catch (err) {
            console.error(err);
            setError("Failed to update home name");
        } finally {
            setSavingName(false);
        }
    }

    function handleCancelEditName() {
        setEditedName(installation?.name || "");
        setEditingName(false);
    }

    const joinUrl = useMemo(() => {
        if (!pairingCode) return "";
        return `${window.location.origin}/join?code=${pairingCode}`;
    }, [pairingCode]);

    async function handleCopyCode() {
        if (!pairingCode) return;

        try {
            await navigator.clipboard.writeText(pairingCode);
            setCopied("code");
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error(err);
            setError("Failed to copy code");
        }
    }

    async function handleCopyLink() {
        if (!joinUrl) return;

        try {
            await navigator.clipboard.writeText(joinUrl);
            setCopied("link");
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error(err);
            setError("Failed to copy invite link");
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        installationService.clearId();
        window.location.href = "/login";
    }

    function handleBackHome() {
        navigate("/");
    }

    return (
        <div className="container max-w-3xl py-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your home and account.
                    </p>
                </div>

                <Button variant="outline" onClick={handleBackHome}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to home
                </Button>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Home Settings
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Manage your home details and invite new members.
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {loadingInstallation && (
                        <p className="text-sm text-muted-foreground">Loading home details...</p>
                    )}

                    {!loadingInstallation && installation && (
                        <div className="rounded-2xl border p-4 bg-muted/30 space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <p className="text-sm text-muted-foreground">Home name</p>

                                    {!editingName ? (
                                        <p className="mt-1 text-base font-medium">{installation.name}</p>
                                    ) : (
                                        <div className="mt-2 flex gap-2 flex-wrap">
                                            <Input
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                placeholder="Enter home name"
                                                className="max-w-sm"
                                            />

                                            <Button onClick={handleSaveName} disabled={savingName}>
                                                <Save className="h-4 w-4 mr-2" />
                                                {savingName ? "Saving..." : "Save"}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={handleCancelEditName}
                                                disabled={savingName}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {!editingName && (
                                    <Button variant="outline" onClick={() => setEditingName(true)}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit name
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            <h2 className="font-semibold">Invite with QR code</h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Generate a temporary invite code, then scan it on another device.
                        </p>

                        {!pairingCode ? (
                            <Button onClick={handleGenerateInvite} disabled={generatingCode}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {generatingCode ? "Generating..." : "Generate invite QR"}
                            </Button>
                        ) : (
                            <>
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-2xl border shadow-sm">
                                        <QRCode value={joinUrl || pairingCode} size={180} />
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-muted/40 p-4 text-center space-y-1">
                                    <p className="text-sm text-muted-foreground">Pairing code</p>
                                    <p className="text-xl font-bold tracking-[0.3em]">{pairingCode}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Button variant="outline" onClick={handleCopyCode}>
                                        {copied === "code" ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy code
                                            </>
                                        )}
                                    </Button>

                                    <Button variant="outline" onClick={handleCopyLink}>
                                        {copied === "link" ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy invite link
                                            </>
                                        )}
                                    </Button>

                                    <Button onClick={handleGenerateInvite} disabled={generatingCode}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Regenerate
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Account actions and session management.
                    </p>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;