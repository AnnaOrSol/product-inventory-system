import { InventoryRequirementsList } from "@/components/InventoryRequirementsList";

const InventoryRequirementsPage = () => {
    return (
        <div className="container py-6 space-y-6">
            <h1 className="text-2xl font-bold">Inventory Requirements</h1>

            <section className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">
                    Minimum stock / requirements
                </h2>

                <InventoryRequirementsList />
            </section>
        </div>
    );
};

export default InventoryRequirementsPage;