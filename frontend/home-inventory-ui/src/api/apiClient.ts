export async function apiFetch(
    path: string,
    options: RequestInit = {},
    skipAuth: boolean = false
) {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    if (!skipAuth && token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(path, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentInstallationId");
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return response.text();
}