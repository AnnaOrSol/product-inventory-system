import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                console.error("Failed to load products", err);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const lower = search.toLowerCase();
        return products.filter((p) =>
            p.name.toLowerCase().includes(lower) ||
            (p.brand && p.brand.toLowerCase().includes(lower))
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
                    className="w-full justify-between h-12 text-left font-normal bg-white border-2 shadow-sm rounded-xl"
                >
                    <span className="truncate">
                        {selectedProduct ? selectedProduct.name : "Search or select product..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[calc(100vw-2rem)] md:w-[350px] p-0 bg-white border-2 shadow-xl rounded-xl"
                align="start"
                sideOffset={5}
            >
                <div className="flex items-center border-b p-3 bg-slate-50/50 sticky top-0 z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                    <Input
                        placeholder="Search product name or brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 w-full border-none bg-transparent focus-visible:ring-0 text-base"
                        autoFocus
                    />
                </div>

                <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin overscroll-contain">
                    {loading ? (
                        <div className="py-6 text-center text-sm text-slate-500">Loading catalogue...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-10 text-center text-sm text-slate-400 font-medium">
                            No product found for "{search}"
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => handleSelect(product)}
                                className={cn(
                                    "flex w-full items-center rounded-lg px-3 py-3 text-sm transition-all hover:bg-primary/10",
                                    value === product.id && "bg-primary/5 font-semibold text-primary"
                                )}
                            >
                                <Check
                                    className={cn(
                                        "mr-3 h-4 w-4 shrink-0 text-primary",
                                        value === product.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className="truncate">{product.name}</span>
                                    {product.brand && (
                                        <span className="truncate text-[10px] text-slate-400 uppercase tracking-wider">
                                            {product.brand}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}