import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, FALYA_CONTACT } from '@/lib/data/menuData';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'delivery' | 'pickup' | 'dine-in';

interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;

  // Cart Actions
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;

  // Calculated values
  getTotalItems: () => number;
  getSubtotal: () => number;

  // Order Notes
  orderNotes: string;
  setOrderNotes: (notes: string) => void;

  // WhatsApp Order Link Generator
  generateWhatsAppLink: (orderType: OrderType) => string;
}

// Catatan: katalog menu (menuItems) TIDAK lagi disimpan di store ini.
// Dulu menuItems ikut di-persist ke localStorage lewat store ini, artinya
// perubahan dari admin panel (tambah/edit/hapus menu, ganti gambar, dst.)
// hanya tersimpan di browser admin itu sendiri — tidak pernah terlihat
// oleh pengunjung lain di device/browser berbeda. Sekarang katalog menu
// dibaca dari database (lihat app/actions/menu.ts, dipakai oleh
// app/page.tsx, app/menu, app/snackbox, app/nasi-liwet, dan app/admin),
// jadi perubahan admin langsung terlihat semua orang tanpa perlu deploy.
// Store ini murni untuk keranjang belanja (state per-browser, memang
// wajar tidak dibagi antar device).
export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      orderNotes: '',

      setOrderNotes: (notes) => set({ orderNotes: notes }),

      addItem: (menuItem, quantity = 1, notes = '') => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.menuItem.id === menuItem.id
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
              notes: notes || updatedItems[existingIndex].notes,
            };
            return { items: updatedItems };
          }

          return {
            items: [...state.items, { menuItem, quantity, notes }],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.menuItem.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.menuItem.id !== itemId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.menuItem.id === itemId ? { ...i, quantity } : i
            ),
          };
        });
      },

      updateNotes: (itemId, notes) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItem.id === itemId ? { ...i, notes } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },

      generateWhatsAppLink: (orderType: OrderType) => {
        const { items, getSubtotal, orderNotes } = get();
        const subtotal = getSubtotal();

        const formattedDate = new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        let text = `*HALO FALYA RISOL MAYO, SAYA INGIN PESAN*\n`;
        text += `───────────────────────\n`;
        text += `📅 *Tanggal:* ${formattedDate}\n`;
        text += `📍 *Tipe Layanan:* ${
          orderType === 'delivery'
            ? '🚀 Delivery (Pesan Antar)'
            : orderType === 'pickup'
            ? '🛍️ Takeaway (Ambil Sendiri)'
            : '🍽️ Dine-in (Makan di Tempat)'
        }\n`;
        text += `───────────────────────\n`;
        text += `*DETAIL PESANAN:*\n`;

        items.forEach((item, index) => {
          const itemTotal = item.menuItem.price * item.quantity;
          text += `${index + 1}. *${item.menuItem.name}*\n`;
          text += `   • ${item.quantity} ${item.menuItem.unit || 'pcs'} x Rp ${item.menuItem.price.toLocaleString('id-ID')} = *Rp ${itemTotal.toLocaleString('id-ID')}*\n`;
          if (item.notes) {
            text += `   • _Catatan: ${item.notes}_\n`;
          }
        });

        text += `───────────────────────\n`;
        if (orderNotes.trim()) {
          text += `📝 *Catatan Tambahan:*\n_${orderNotes.trim()}_\n`;
          text += `───────────────────────\n`;
        }
        text += `💰 *TOTAL PESANAN: Rp ${subtotal.toLocaleString('id-ID')}*\n`;
        text += `\nMohon konfirmasi ketersediaan, alamat & ongkirnya ya. Terima kasih! 🙏✨`;

        const encodedMessage = encodeURIComponent(text);
        return `https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=${encodedMessage}`;
      },
    }),
    {
      name: 'falya-cart-menu-storage-v13',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
