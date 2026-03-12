import { apiFetch } from "@/api/apiClient";
import { API_PATHS } from "@/lib/config";

export type InstallationMemberResponse = {
    installationId: string;
    installationName: string;
    role: "OWNER" | "MEMBER";
};

export async function getMyInstallations(): Promise<InstallationMemberResponse[]> {
    return apiFetch(`${API_PATHS.INSTALLATION_MEMBERS_API}/me`);
}
