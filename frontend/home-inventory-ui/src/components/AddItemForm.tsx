import { useState } from "react";
import { Plus, X, Minus, Calendar, ScanBarcode, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSelect } from "./ProductSelect";
import { toast } from "sonner";
import { addInventoryItem } from "@/api/inventoryApi";
import { createProduct } from "@/api/productApi";
import type { GenericProduct, Product } from "@/types/product";
import { installationService } from "@/services/installationService";
import { BarcodeScanner } from "./BarcodeScanner";
import { API_PATHS } from "@/lib/config";

const API_BASE = API_PATHS.PRODUCT_API;

interface AddItemFormProps {
    onItemAdded: () => void;
    onClose: () => void;
}

export function AddItemForm({ onItemAdded, onClose }: AddItemFormProps) {
    const [showScanner, setShowScanner] = useState(false);
    const [isNewProductMode, setIsNewProductMode] = useState(false);

    const [selectedGenericProduct, setSelectedGenericProduct] = useState<GenericProduct | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [bestByDate, setBestByDate] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");

    const [scannedBarcode, setScannedBarcode] = useState("");
    const [foundScannedProduct, setFoundScannedProduct] = useState<Product | null>(null);

    const [newProductData, setNewProductData] = useState({
        name: "",
        brand: "",
        imageUrl: "",
        genericProductId: 1,
    });

    const setQuickDate = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setBestByDate(date.toISOString().split("T")[0]);
    };

    const handleBarcodeDetected = async (barcode: string) => {
        setShowScanner(false);
        setScannedBarcode(barcode);
        toast.info(`Scanned: ${barcode}`);

        try {
            const response = await fetch(`${API_BASE}/barcode/${barcode}`);

            if (response.ok) {
                const product: Product = await response.json();
                setFoundScannedProduct(product);

                if (product.genericProductId && product.genericProductName) {
                    setSelectedGenericProduct({
                        id: product.genericProductId,
                        name: product.genericProductName,
                        categoryCode: "",
                        categoryDisplayName: "",
                        imageUrl: null,
                    });
                }

                setIsNewProductMode(false);
                toast.success(`Found: ${product.name}`);
            } else if (response.status === 404) {
                setFoundScannedProduct(null);
                setIsNewProductMode(true);
                toast.warning("Product not found. Please add it to the catalog.");
            }
        } catch (err) {
            console.error("Search error:", err);
            toast.error("Failed to fetch product info");
        }
    };

    const handleSaveNewProduct = async () => {
        if (!newProductData.name || !newProductData.brand) {
            toast.error("Name and Brand are required");
            return;
        }

        try {
            const createdProduct = await createProduct({
                name: newProductData.name,
                brand: newProductData.brand,
                barcode: scannedBarcode,
                imageUrl: newProductData.imageUrl || null,
                genericProductId: newProductData.genericProductId,
            });

            setFoundScannedProduct(createdProduct);

            if (createdProduct.genericProductId && createdProduct.genericProductName) {
                setSelectedGenericProduct({
                    id: createdProduct.genericProductId,
                    name: createdProduct.genericProductName,
                    categoryCode: "",
                    categoryDisplayName: "",
                    imageUrl: null,
                });
            }

            setIsNewProductMode(false);
            toast.success("Product added to catalog!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save new product to catalog");
        }
    };

    const handleSubmitInventory = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedGenericProduct) {
            toast.error("Please select a generic product first");
            return;
        }

        try {
            const payload = {
                installationId: installationService.getId() || "",
                genericProductId: selectedGenericProduct.id,
                genericProductName: selectedGenericProduct.name,
                quantity,
                bestBefore: bestByDate || undefined,
                location: location.trim() || undefined,
                notes: notes.trim() || undefined,
            };

            await addInventoryItem(payload);
            toast.success("Item added to inventory");
            onItemAdded();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add item to inventory");
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <Card className="shadow-lg border-2 max-w-lg mx-auto">
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
                            <Button variant="outline" size="sm" onClick={() => setShowScanner(false)}>
                                Cancel
                            </Button>
                        </div>
                        <BarcodeScanner onScanSuccess={handleBarcodeDetected} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4 border-b pb-6">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-semibold text-gray-700">Product Info</Label>
                                {!isNewProductMode && (
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
                                )}
                            </div>

                            {isNewProductMode ? (
                                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200 space-y-3 animate-in fade-in zoom-in-95">
                                    <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                                        <PackagePlus className="h-4 w-4" />
                                        New Product (Barcode: {scannedBarcode})
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <Input
                                            placeholder="Product Name *"
                                            value={newProductData.name}
                                            onChange={(e) =>
                                                setNewProductData({ ...newProductData, name: e.target.value })
                                            }
                                            className="bg-white"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Brand *"
                                                value={newProductData.brand}
                                                onChange={(e) =>
                                                    setNewProductData({ ...newProductData, brand: e.target.value })
                                                }
                                                className="bg-white"
                                            />
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            Note: this saves a specific catalog product under the selected generic product id.
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                                            onClick={handleSaveNewProduct}
                                        >
                                            Save to Catalog
                                        </Button>
                                        <Button variant="ghost" onClick={() => setIsNewProductMode(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <ProductSelect
                                    value={selectedGenericProduct?.id ?? null}
                                    onChange={setSelectedGenericProduct}
                                />
                            )}
                        </div>

                        {foundScannedProduct && (
                            <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                                <div className="font-semibold">Scanned catalog product</div>
                                <div>Name: {foundScannedProduct.name}</div>
                                {foundScannedProduct.brand && <div>Brand: {foundScannedProduct.brand}</div>}
                                {foundScannedProduct.genericProductName && (
                                    <div>Generic: {foundScannedProduct.genericProductName}</div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmitInventory} className="space-y-6">
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
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="text-[10px] h-7 px-2"
                                            onClick={() => setQuickDate(7)}
                                        >
                                            +1W
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="text-[10px] h-7 px-2"
                                            onClick={() => setQuickDate(14)}
                                        >
                                            +2W
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="text-[10px] h-7 px-2"
                                            onClick={() => setQuickDate(30)}
                                        >
                                            +1M
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-xs">
                                        Location
                                    </Label>
                                    <Input
                                        id="location"
                                        className="h-9 text-sm"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Fridge, Pantry..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-xs">
                                        Notes
                                    </Label>
                                    <Input
                                        id="notes"
                                        className="h-9 text-sm"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Extra info..."
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isNewProductMode || !selectedGenericProduct}
                                className="w-full h-12 text-lg font-bold mt-4 shadow-md bg-primary hover:bg-primary/90 transition-all"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add to Inventory
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}