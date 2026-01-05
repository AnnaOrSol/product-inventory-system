// src/services/installationService.ts
import { CONFIG } from "@/lib/config"

const API_URL = CONFIG.INSTALLATIONS_API;

export interface CreateInstallationResponse {
    installationId: string;
    pairingCode: string;
    expiresAt: string;
}

export const installationService = {
    createHome: async (): Promise<CreateInstallationResponse> => {
        const response = await fetch(API_URL, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to create home');
        return response.json();
    },

    sendToEmail: async (email: string, installationId: string) => {
        console.log(`Sending ID ${installationId} to ${email}`);
        return new Promise((resolve) => setTimeout(resolve, 1000));
    },

    joinHome: async (code: string): Promise<{ installationId: string }> => {
        const response = await fetch(`${API_URL}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        if (!response.ok) throw new Error('Invalid or expired code');
        return response.json();
    },

    saveId: (id: string) => localStorage.setItem('installation_id', id),
    getId: () => localStorage.getItem('installation_id'),
    clearId: () => localStorage.removeItem('installation_id')
};