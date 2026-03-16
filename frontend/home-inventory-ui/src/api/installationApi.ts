import { apiFetch } from "@/api/apiClient";
import { API_PATHS } from "@/lib/config";
import { installationService } from "@/services/installationService";
import { InstallationDetails, CreateInstallationResponse } from "@/types/installation";

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

export async function getCurrentInstallation(): Promise<InstallationDetails> {
    const installationId = installationService.getId();

    if (!installationId) {
        throw new Error("No installation selected");
    }

    return apiFetch(`${API_PATHS.INSTALLATIONS_API}/${installationId}`, {
        headers: {
            "X-Installation-Id": installationId,
        },
    });
}


export async function generatePairCode(): Promise<CreateInstallationResponse> {
    const installationId = installationService.getId();

    if (!installationId) {
        throw new Error("No installation selected");
    }

    return apiFetch(`${API_PATHS.INSTALLATIONS_API}/paircode`, {
        method: "POST",
        body: JSON.stringify({
            installationId,
        }),
    });
}


export async function updateInstallationName(name: string): Promise<InstallationDetails> {
    const installationId = installationService.getId();

    if (!installationId) {
        throw new Error("No installation selected");
    }

    return apiFetch(`${API_PATHS.INSTALLATIONS_API}/${installationId}`, {
        method: "PUT",
        headers: {
            "X-Installation-Id": installationId,
        },
        body: JSON.stringify({
            name,
        }),
    });
}