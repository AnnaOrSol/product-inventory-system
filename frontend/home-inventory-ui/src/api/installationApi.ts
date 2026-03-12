import { apiFetch } from "@/api/apiClient";
import { API_PATHS } from "@/lib/config";

export type InstallationResponse = {
    installationId: string;
    name?: string;
    pairingCode?: string;
};

export async function createInstallation(data: { name: string }): Promise<InstallationResponse> {
    return apiFetch(`${API_PATHS.INSTALLATIONS_API}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function joinInstallation(data: { code: string }): Promise<InstallationResponse> {
    return apiFetch(`${API_PATHS.INSTALLATIONS_API}/join`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}