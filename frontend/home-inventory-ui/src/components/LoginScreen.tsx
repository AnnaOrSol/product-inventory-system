import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { installationService } from "@/services/installationService";
import { Mail, ArrowRight, Key } from "lucide-react";

interface LoginScreenProps {
    onLoginSuccess: (id: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [view, setView] = useState<"initial" | "created" | "direct">("initial");
    const [code, setCode] = useState("");
    const [directId, setDirectId] = useState("");
    const [email, setEmail] = useState("");
    const [generatedInfo, setGeneratedInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const data = await installationService.createHome();
            setGeneratedInfo(data);
            installationService.saveId(data.installationId);
            setView("created");
        } catch (e) { alert("error while creating new home"); }
        finally { setLoading(false); }
    };

    const handleJoin = async () => {
        if (!code) return;
        setLoading(true);
        try {
            const data = await installationService.joinHome(code.toUpperCase());
            installationService.saveId(data.installationId);
            onLoginSuccess(data.installationId);
        } catch (e) { alert("INVALID CODE"); }
        finally { setLoading(false); }
    };

    const handleDirectLogin = () => {
        if (directId.length < 10) return alert("INVALID ID");
        installationService.saveId(directId);
        onLoginSuccess(directId);
    };

    const handleSendEmail = async () => {
        if (!email) return;
        setLoading(true);
        await installationService.sendToEmail(email, generatedInfo.installationId);
        alert("Installation ID set to email!");
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6" >
            <div className="w-full max-w-sm space-y-8 rounded-xl border bg-card p-8 shadow-lg animate-in fade-in zoom-in duration-300">

                {view === "initial" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight">Home Inventory</h1>
                            <p className="text-sm text-muted-foreground mt-1">Easily manage your home inventory</p>
                        </div>
                        <Button className="w-full h-12 text-lg" onClick={handleCreate} disabled={loading}>
                            Create new Home
                        </Button>
                        <div className="relative"><div className="absolute inset-0 flex items-center" ><span className="w-full border-t" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-muted-foreground">Or join existing one</span></div>
                        </div>
                        <div className="space-y-3">
                            <Input className="text-center text-xl tracking-widest uppercase h-12" placeholder="enter code here" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
                            <Button variant="secondary" className="w-full" onClick={handleJoin} disabled={loading}>Join with code  </Button>
                        </div>
                        <button onClick={() => setView("direct")} className="w-full text-xs text-muted-foreground hover:underline text-center mt-4">
                            Do you already have a home ID (UUID)? Click here
                        </button>
                    </div>
                )}

                {view === "created" && (
                    <div className="space-y-6 text-center">
                        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                            <p className="text-sm font-medium text-green-800 mb-2">Home is created! joining code:</p>
                            <span className="text-4xl font-mono font-extrabold text-green-700 tracking-widest">{generatedInfo.pairingCode}</span>
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                            <p className="text-xs text-muted-foreground text-right">It’s recommended to send the permanent ID to yourself as a backup:</p>
                            <div className="flex gap-2">
                                <Input placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                <Button size="icon" onClick={handleSendEmail} disabled={loading}><Mail className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => onLoginSuccess(generatedInfo.installationId)}>Continue to app  <ArrowRight className="mr-2 h-4 w-4" /></Button>
                    </div>
                )}

                {/* מצב התחברות ישירה עם UUID */}
                {view === "direct" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Key className="mx-auto h-10 w-10 text-primary mb-2" />
                            <h2 className="text-xl font-bold"> Login with installation ID </h2>
                            <p className="text-xs text-muted-foreground">Enter the UUID you received by email</p>
                        </div>
                        <Input className="font-mono text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx..." value={directId} onChange={(e) => setDirectId(e.target.value)} />
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setView("initial")}>back</Button>
                            <Button className="flex-[2]" onClick={handleDirectLogin}>login</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};