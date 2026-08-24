"use client";

import React from "react";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { MenuItem } from "@/lib/data/menuData";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const { addItem, items } = useCartStore();
  const existingCartItem = items.find((i) => i.menuItem.id === item.id);
  const isInCart = Boolean(existingCartItem);

  const handleAddToCart = () => {
    if (!item.isAvailable) return;
    addItem(item, 1);
    const toastId = `toast-${item.id}`;
    toast.success(`${item.name} ditambahkan!`, {
      id: toastId,
      description: `Total di keranjang: ${existingCartItem ? existingCartItem.quantity + 1 : 1} ${item.unit || "pcs"}`,
    });
  };

  return (
    <div className="group bg-[#fcfafb] hover:bg-[#faf0f4]/60 rounded-[20px] overflow-hidden transition-all duration-300 flex flex-col shadow-[0_2px_12px_rgba(36,27,24,0.04)] hover:shadow-[0_8px_28px_rgba(168,40,104,0.1)]">
      {/* Product Photo Container (4:3 ratio) */}
      <div className="relative w-full aspect-[4/3] bg-[#faf0f4] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-104 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.isPopular && (
            <span className="bg-[#a82868] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
              BEST SELLER
            </span>
          )}
          {!item.isAvailable && (
            <span className="bg-[#c74343] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              HABIS
            </span>
          )}
        </div>
      </div>

      {/* Product Info & Action */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#241b18] group-hover:text-[#a82868] transition-colors leading-snug">
            {item.name}
          </h3>
          <p className="text-xs text-[#665b56] mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="pt-3 flex items-center justify-between gap-3">
          <div>
            <span className="text-base sm:text-lg font-extrabold text-[#241b18]">
              Rp {item.price.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-[#665b56] ml-1">
              /{item.unit || "pcs"}
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            size="sm"
            className={`rounded-full font-semibold text-xs px-4 transition-all ${
              item.isAvailable
                ? "bg-[#a82868] hover:bg-[#861f53] text-white shadow-xs"
                : "bg-[#ebd5e1] text-[#968b85] cursor-not-allowed"
            }`}
          >
            {isInCart ? (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Tambah ({existingCartItem?.quantity})
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                {item.isAvailable ? "Tambah" : "Habis"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
