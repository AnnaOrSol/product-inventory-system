import { apiFetch } from "@/api/apiClient";
import { CONFIG } from "@/lib/config";

export type LoginRequest = {
    phone: string;
    password: string;
};

export type RegisterRequest = {
    name: string;
    email: string;
    phone: string;
    password: string;
};

export type RegisterResponse = {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    role: string;
};

export type AuthResponse = {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    userId: string;
    name: string;
    phone: string;
};

export async function login(data: LoginRequest): Promise<AuthResponse> {
    return apiFetch(
        `${CONFIG.API_BASE_URL}/auth/login`,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        true
    );
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
    return apiFetch(
        `${CONFIG.API_BASE_URL}/auth/register`,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        true
    );
}