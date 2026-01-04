import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/api/productApi";
import type { Product } from "@/types/product";

interface ProductSelectProps {
    value: number | null;
    onChange: (product: Product) => void;
}

export function ProductSelect({ value, onChange }: ProductSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const data = await fetchProducts();
                setProducts(data);
            } catch {
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!search) return products;
        const lower = search.toLowerCase();
        return products.filter((p) =>
            p.name.toLowerCase().includes(lower)
        );
    }, [products, search]);

    const selectedProduct = products.find((p) => p.id === value);

    const handleSelect = (product: Product) => {
        onChange(product);
        setOpen(false);
        setSearch("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-11 font-normal"
                >
                    {selectedProduct ? selectedProduct.name : "Select a product..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-60 overflow-y-auto p-1">
                    {loading && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                            Loading products...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="py-4 text-center text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No products found
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className={cn(
                                    "flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-secondary",
                                    value === product.id && "bg-secondary"
                                )}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === product.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                                {product.name}
                            </button>
                        ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
