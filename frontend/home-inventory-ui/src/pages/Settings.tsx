import { InventoryRequirementsList } from "@/components/InventoryRequirementsList";

const Settings = () => {
    return (
        <div className="container py-6 space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>

            <section className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">
                    Inventory Requirements
                </h2>

                <InventoryRequirementsList />
            </section>
        </div>
    );
};

export default Settings;
