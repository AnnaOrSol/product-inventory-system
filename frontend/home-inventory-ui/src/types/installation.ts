export interface InstallationDetails {
    id: string;
    name: string;
}

export interface CreateInstallationResponse {
    installationId: string;
    pairingCode: string;
}