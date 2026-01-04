import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSelect } from "./ProductSelect";
import { toast } from "sonner";
import { addInventoryItem } from "@/api/inventoryApi";
import type { Product } from "@/types/product";


interface AddItemFormProps {
    onItemAdded: () => void;
    onClose: () => void;
}

export function AddItemForm({ onItemAdded, onClose }: AddItemFormProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [bestByDate, setBestByDate] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) {
            toast.error("Please select a product");
            return;
        }



        try {
            const payload: any = {
                installationId: "11111111-1111-1111-1111-111111111111", // temporary installation id
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                quantity,
                bestBefore: bestByDate,
            };

            if (location.trim()) payload.location = location.trim();
            if (notes.trim()) payload.notes = notes.trim();

            await addInventoryItem(payload);

            toast.success("Item added to inventory");
            onItemAdded();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add item");
        }
    };


    const today = new Date().toISOString().split("T")[0];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between">
                    <CardTitle>Add New Item</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Product</Label>
                        <ProductSelect
                            value={selectedProduct?.id ?? null}
                            onChange={setSelectedProduct}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(parseInt(e.target.value, 10) || 1)
                                }
                            />
                        </div>

                        <div>
                            <Label>Best By Date</Label>
                            <Input
                                type="date"
                                min={today}
                                value={bestByDate}
                                onChange={(e) => setBestByDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location (optional)</Label>
                        <Input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Fridge / Pantry / Freezer..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                            id="notes"
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any extra info..."
                        />
                    </div>


                    <Button type="submit" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Inventory
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
