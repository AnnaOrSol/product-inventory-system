import { useEffect, useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { installationService } from "@/services/installationService";

import {
    getEventSummary,
    getEventTimeline,
    getTopWastedProducts,
    type EventSummaryResponse,
    type EventTimelinePointResponse,
    type TopWastedProductResponse,
} from "@/api/statsApi";

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <Card className="rounded-[24px] border-black/10 shadow-sm">
            <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            </CardContent>
        </Card>
    );
}

export default function StatsPage() {
    const [summary, setSummary] = useState<EventSummaryResponse | null>(null);
    const [timeline, setTimeline] = useState<EventTimelinePointResponse[]>([]);
    const [topWasted, setTopWasted] = useState<TopWastedProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const installationId = installationService.getId();

    useEffect(() => {
        async function loadData() {
            if (!installationId) {
                setError("No installation selected");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const [summaryRes, timelineRes, wastedRes] = await Promise.all([
                    getEventSummary(installationId),
                    getEventTimeline(installationId, 30),
                    getTopWastedProducts(installationId, 5),
                ]);

                setSummary(summaryRes);
                setTimeline(timelineRes);
                setTopWasted(wastedRes);
            } catch (err) {
                console.error(err);
                setError("Failed to load stats");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [installationId]);

    const chartData = useMemo(
        () =>
            timeline.map((item) => ({
                ...item,
                shortDate: item.date.slice(5), // MM-DD
            })),
        [timeline]
    );

    if (loading) {
        return <div className="p-6">Loading stats...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    if (!summary) {
        return <div className="p-6">No stats available.</div>;
    }

    return (
        <div className="space-y-6 p-4 pb-24 sm:p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    📊 Inventory Insights
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Track how your home inventory changes over time.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard title="Items Added" value={summary.itemsAdded} />
                <StatCard title="Removed" value={summary.itemsDeleted} />
                <StatCard title="Depleted" value={summary.itemsDepleted} />
                <StatCard title="Expired" value={summary.itemsExpiredDiscarded} />
            </div>

            {/* Timeline chart */}
            <Card className="rounded-[24px] border-black/10 shadow-sm">
                <CardHeader>
                    <CardTitle>Activity in the last 30 days</CardTitle>
                </CardHeader>
                <CardContent className="h-[340px] p-4">
                    <BarChart
                        data={chartData}
                        responsive
                        style={{ width: "100%", height: "100%" }}
                        margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="shortDate"
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            contentStyle={{
                                borderRadius: "16px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                backgroundColor: "#ffffff",
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ fontSize: "13px" }}
                        />

                        <Bar
                            dataKey="itemsAdded"
                            name="Added"
                            fill="#86efac"
                            radius={[8, 8, 0, 0]}
                        />
                        <Bar
                            dataKey="itemsDepleted"
                            name="Depleted"
                            fill="#93c5fd"
                            radius={[8, 8, 0, 0]}
                        />
                        <Bar
                            dataKey="itemsExpiredDiscarded"
                            name="Expired"
                            fill="#fca5a5"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </CardContent>
            </Card>

            {/* Top wasted */}
            <Card className="rounded-[24px] border-black/10 shadow-sm">
                <CardHeader>
                    <CardTitle>Most wasted products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {topWasted.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No expired products yet 🎉
                        </p>
                    ) : (
                        topWasted.map((item) => (
                            <div
                                key={item.productName}
                                className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3"
                            >
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-sm text-muted-foreground">
                                    {item.count}
                                </span>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}