const INSTALLATION_ID_KEY = "currentInstallationId";

export const installationService = {
    getId(): string | null {
        return localStorage.getItem(INSTALLATION_ID_KEY);
    },

    saveId(id: string) {
        localStorage.setItem(INSTALLATION_ID_KEY, id);
    },

    clearId() {
        localStorage.removeItem(INSTALLATION_ID_KEY);
    },
};