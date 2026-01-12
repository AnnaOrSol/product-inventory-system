import { useState } from "react";
import { Plus, X, Minus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSelect } from "./ProductSelect";
import { toast } from "sonner";
import { addInventoryItem } from "@/api/inventoryApi";
import type { Product } from "@/types/product";
import { installationService } from "@/services/installationService";
import { BarcodeScanner } from "./BarcodeScanner";
import { Camera, ScanBarcode } from "lucide-react";
import { CONFIG } from "@/lib/config";

const API_BASE = CONFIG.PRODUCT_API;

const INSTALLATION_ID = installationService.getId() || "";

interface AddItemFormProps {
    onItemAdded: () => void;
    onClose: () => void;
}

export function AddItemForm({ onItemAdded, onClose }: AddItemFormProps) {
    const [showScanner, setShowScanner] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [bestByDate, setBestByDate] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");

    const setQuickDate = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setBestByDate(date.toISOString().split('T')[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) {
            toast.error("Please select a product");
            return;
        }

        try {
            const payload: any = {
                installationId: installationService.getId() || "",
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
    const handleBarcodeDetected = async (barcode: string) => {
        setShowScanner(false);
        toast.info(`Scanned Barcode: ${barcode}`);

        try {
            const response = await fetch(`${API_BASE}/products/barcode/${barcode}`);
            if (response.ok) {
                const product = await response.json();
                setSelectedProduct(product);
                toast.success(`Found: ${product.name}`);
            } else {
                toast.error("Product not found in system");
            }
        } catch (err) {
            toast.error("Failed to fetch product info");
        }
    };

    const today = new Date().toISOString().split("T")[0];
    return (
        <Card className="shadow-lg border-2">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold">Add to Inventory</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {showScanner ? (
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <Label className="font-bold text-blue-600">Scanning Barcode...</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowScanner(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                        <BarcodeScanner onScanSuccess={handleBarcodeDetected} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-semibold text-gray-700">Product</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowScanner(true)}
                                    className="h-8 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                    <ScanBarcode className="h-4 w-4" />
                                    <span className="text-xs">Scan Barcode</span>
                                </Button>
                            </div>
                            <ProductSelect
                                value={selectedProduct?.id ?? null}
                                onChange={setSelectedProduct}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Quantity</Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-full border-2"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        className="text-center text-lg font-bold h-10 w-16"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-full border-2"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-orange-600 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Best By Date
                                </Label>
                                <Input
                                    type="date"
                                    min={today}
                                    className="h-10"
                                    value={bestByDate}
                                    onChange={(e) => setBestByDate(e.target.value)}
                                />
                                <div className="flex gap-1 pt-1">
                                    <Button type="button" variant="secondary" size="sm" className="text-[10px] h-7 px-2" onClick={() => setQuickDate(7)}>+1W</Button>
                                    <Button type="button" variant="secondary" size="sm" className="text-[10px] h-7 px-2" onClick={() => setQuickDate(14)}>+2W</Button>
                                    <Button type="button" variant="secondary" size="sm" className="text-[10px] h-7 px-2" onClick={() => setQuickDate(30)}>+1M</Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-xs">Location</Label>
                                <Input
                                    id="location"
                                    className="h-9 text-sm"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Fridge, Pantry..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-xs">Notes</Label>
                                <Input
                                    id="notes"
                                    className="h-9 text-sm"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any extra info..."
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 shadow-md bg-primary hover:bg-primary/90 transition-all">
                            <Plus className="h-5 w-5 mr-2" />
                            Add to Inventory
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}