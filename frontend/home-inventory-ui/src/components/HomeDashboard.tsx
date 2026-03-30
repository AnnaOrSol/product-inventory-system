import { Package, ShoppingCart, Clock3, Plus, ArrowRight, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuickAction = {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge?: string;
    onClick?: () => void;
    featured?: boolean;
};

interface HomeDashboardProps {
    totalItems?: number;
    expiringSoonCount?: number;
    onOpenInventory?: () => void;
    onOpenStats?: () => void;
    onOpenShoppingList?: () => void;
    onOpenExpiringSoon?: () => void;
    onAddItem?: () => void;
}

function DashboardTile({ action }: { action: QuickAction }) {
    const Icon = action.icon;

    return (
        <button
            type="button"
            onClick={action.onClick}
            className={cn(
                "group relative w-full rounded-[28px] border border-black/10 bg-white/70 p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.09)]",
                "active:translate-y-0",
                action.featured && "bg-white"
            )}
        >
            <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3efe8] text-[#3b342f] transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                </div>

                {action.badge ? (
                    <span className="rounded-full border border-[#f2d58a] bg-[#fff5d9] px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#b56a00] uppercase">
                        {action.badge}
                    </span>
                ) : null}
            </div>

            <div className="space-y-1">
                <h3 className="text-[17px] font-semibold tracking-tight text-[#2f2925]">
                    {action.title}
                </h3>
                <p className="text-sm leading-5 text-[#6f675f]">{action.subtitle}</p>
            </div>

            <div className="mt-5 flex items-center justify-end text-[#2f2925]/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#2f2925]">
                <ArrowRight className="h-4 w-4" />
            </div>
        </button>
    );
}

export default function HomeDashboard({
    totalItems = 24,
    expiringSoonCount = 3,
    onOpenInventory,
    onOpenStats,
    onOpenShoppingList,
    onOpenExpiringSoon,
    onAddItem,
}: HomeDashboardProps) {
    const actions: QuickAction[] = [
        {
            title: "Insights",
            subtitle: "View charts and household trends",
            icon: BarChart3,
            onClick: onOpenStats,
        },
        {
            title: "Shopping List",
            subtitle: "See what needs restocking",
            icon: ShoppingCart,
            onClick: onOpenShoppingList,
        },
        {
            title: "Expiring Soon",
            subtitle:
                expiringSoonCount > 0
                    ? `${expiringSoonCount} items need attention`
                    : "Everything looks fresh",
            icon: Clock3,
            badge: expiringSoonCount > 0 ? "Alert" : "Good",
            onClick: onOpenExpiringSoon,
        },
        {
            title: "Add Item",
            subtitle: "Quickly add something new",
            icon: Plus,
            onClick: onAddItem,
        },
    ];

    return (
        <section className="space-y-4">
            <div className="px-1">
                <h2 className="text-lg font-semibold tracking-tight text-[#2f2925]">
                    Quick actions
                </h2>
                <p className="mt-1 text-sm text-[#736b63]">
                    Jump into the things you use most.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {actions.map((action) => (
                    <DashboardTile key={action.title} action={action} />
                ))}
            </div>

            <Card className="overflow-hidden rounded-[28px] border-black/10 bg-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary/15">
                                <Package className="h-7 w-7" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Full Inventory
                                    </h2>
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage, edit, and browse all household items.
                                </p>
                            </div>
                        </div>

                    </div>
                    <Button
                        type="button"
                        onClick={onOpenInventory}
                        className="rounded-2xl bg-[#2f2925] px-4 text-white hover:bg-[#211d1a]"
                    >
                        Open
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
