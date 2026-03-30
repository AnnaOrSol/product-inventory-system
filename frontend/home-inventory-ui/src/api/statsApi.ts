import { apiFetch } from "@/api/apiClient";
import { API_PATHS } from "@/lib/config";

const EVENTS_STATS_API = API_PATHS.EVENTS_STATS_API;

export type EventSummaryResponse = {
    itemsAdded: number;
    itemsDeleted: number;
    itemsDepleted: number;
    itemsExpiredDiscarded: number;
};

export type EventTimelinePointResponse = {
    date: string;
    itemsAdded: number;
    itemsDeleted: number;
    itemsDepleted: number;
    itemsExpiredDiscarded: number;
};

export type TopWastedProductResponse = {
    productName: string;
    count: number;
};

function buildInstallationHeaders(installationId: string): HeadersInit {
    return {
        "X-Installation-Id": installationId,
    };
}


export async function getEventSummary(
    installationId: string
): Promise<EventSummaryResponse> {
    return apiFetch(`${EVENTS_STATS_API}/summary`, {
        method: "GET",
        headers: buildInstallationHeaders(installationId),
    }) as Promise<EventSummaryResponse>;
}

export async function getEventTimeline(
    installationId: string,
    days: number = 30
): Promise<EventTimelinePointResponse[]> {
    return apiFetch(`${EVENTS_STATS_API}/timeline?days=${days}`, {
        method: "GET",
        headers: buildInstallationHeaders(installationId),
    }) as Promise<EventTimelinePointResponse[]>;
}

export async function getTopWastedProducts(
    installationId: string,
    limit: number = 5
): Promise<TopWastedProductResponse[]> {
    return apiFetch(`${EVENTS_STATS_API}/top-wasted-products?limit=${limit}`, {
        method: "GET",
        headers: buildInstallationHeaders(installationId),
    }) as Promise<TopWastedProductResponse[]>;
}