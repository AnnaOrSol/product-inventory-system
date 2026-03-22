import { InventoryRequirementsList } from "@/components/InventoryRequirementsList";

const InventoryRequirementsPage = () => {
    return (
        <div className="container py-6  px-3 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Inventory Requirements</h1>
                <p className="text-sm text-muted-foreground">
                    Define the minimum stock you want to keep at home for essential products.
                </p>
            </div>

            <section className="rounded-2xl border bg-card p-4 md:p-6 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Minimum stock by generic product
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add your own required items or start with a recommended default essentials list.
                    </p>
                </div>

                <InventoryRequirementsList />
            </section>
        </div>
    );
};

export default InventoryRequirementsPage;