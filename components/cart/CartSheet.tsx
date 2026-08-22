"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore, OrderType } from "@/lib/store/cartStore";

export default function CartSheet() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    generateWhatsAppLink,
  } = useCartStore();

  const router = useRouter();

  const [orderType, setOrderType] = useState<OrderType>("delivery");

  const subtotal = getSubtotal();

  // Langsung buka WhatsApp dengan ringkasan pesanan — tanpa form panjang.
  const handleCheckoutSubmit = async () => {
    // Lazy-load confetti — hanya dimuat saat checkout, bukan di bundle awal
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#a82868", "#e67e22", "#3e7c59", "#f7b733"],
    });

    const waUrl = generateWhatsAppLink(orderType);
    window.open(waUrl, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Sheet panel — no left border, use shadow instead */}
      <SheetContent className="w-full sm:max-w-lg bg-[#ffffff] text-[#241b18] flex flex-col p-0 z-50 shadow-[-8px_0_32px_rgba(36,27,24,0.12)]">
        {/* Header — desain awal */}
        <div className="p-5 sm:p-6 bg-[#faf0f4] shadow-[0_1px_0_rgba(168,40,104,0.06)]">
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-lg font-bold text-[#241b18] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#a82868]" />
              Keranjang Pesanan
            </SheetTitle>
            <SheetDescription className="text-xs text-[#665b56]">
              {items.length} macam menu terpilih
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {items.length === 0 ? (
            /* Empty State — shadow, no border */
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#faf0f4] flex items-center justify-center text-[#a82868] shadow-[0_2px_10px_rgba(168,40,104,0.06)]">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#241b18]">
                  Keranjang masih kosong nih.
                </h3>
                <p className="text-xs text-[#665b56] mt-1 max-w-xs">
                  Yuk pilih risol hangat, nasi liwet, atau snack box favoritmu
                  dulu!
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/menu");
                }}
                className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full text-xs px-6"
              >
                Lihat Menu
              </Button>
            </div>
          ) : (
            /* Cart Items */
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="bg-[#fdfbfc] rounded-[16px] p-3 sm:p-4 flex gap-3 items-center justify-between shadow-[0_2px_10px_rgba(168,40,104,0.04)]"
                >
                  {/* Item image — no border */}
                  <div className="relative w-16 h-16 rounded-[12px] overflow-hidden bg-[#faf0f4] shrink-0 shadow-[0_1px_6px_rgba(36,27,24,0.08)]">
                    <Image
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#241b18] truncate">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-xs text-[#a82868] font-bold mt-0.5">
                      Rp {item.menuItem.price.toLocaleString("id-ID")}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {/* Qty stepper — desain awal */}
                      <div className="flex items-center bg-[#faf0f4] rounded-full overflow-hidden shadow-[0_1px_6px_rgba(168,40,104,0.06)]">
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItem.id, item.quantity - 1)
                          }
                          className="px-2.5 py-1 hover:bg-[#f3e2ec] text-[#241b18] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#241b18] min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItem.id, item.quantity + 1)
                          }
                          className="px-2.5 py-1 hover:bg-[#f3e2ec] text-[#241b18] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#241b18] ml-auto">
                        Rp{" "}
                        {(item.menuItem.price * item.quantity).toLocaleString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.menuItem.id)}
                    className="p-1.5 text-[#968b85] hover:text-[#c74343] transition-colors self-start"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex justify-end pt-1">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-[#968b85] hover:text-[#c74343] flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Kosongkan Keranjang
                </button>
              </div>

              {/* Order Type — langsung di keranjang */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-[#241b18] mb-1.5 block">
                  Tipe Layanan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["delivery", "pickup", "dine-in"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`py-2 px-2.5 rounded-full text-xs font-semibold transition-all ${
                        orderType === type
                          ? "bg-[#a82868] text-white shadow-sm"
                          : "bg-[#faf0f4] text-[#665b56] hover:bg-[#f3e2ec] hover:text-[#241b18]"
                      }`}
                    >
                      {type === "delivery"
                        ? "🚀 Delivery"
                        : type === "pickup"
                          ? "🛍️ Takeaway"
                          : "🍽️ Dine-in"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Actions — no border-t, shadow separation */}
        {items.length > 0 && (
          <div className="p-5 sm:p-6 bg-[#faf0f4] shadow-[0_-1px_0_rgba(168,40,104,0.06)] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#665b56] font-medium">
                Subtotal ({items.length} menu):
              </span>
              <span className="text-xl font-extrabold text-[#a82868]">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>

            <Button
              onClick={handleCheckoutSubmit}
              className="w-full bg-[#3e7c59] hover:bg-[#2e5e43] text-white font-semibold py-5 rounded-full shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Pesan via WhatsApp
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
