import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, INITIAL_MENU, FALYA_CONTACT } from '@/lib/data/menuData';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'delivery' | 'pickup' | 'dine-in';

interface CartStoreState {
  items: CartItem[];
  menuItems: MenuItem[];
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

  // WhatsApp Order Link Generator
  generateWhatsAppLink: (orderType: OrderType) => string;

  // Menu Management (for Admin)
  updateMenuItemPrice: (id: string, newPrice: number) => void;
  toggleMenuItemAvailability: (id: string) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  resetMenuToDefault: () => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      menuItems: INITIAL_MENU,
      isOpen: false,

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
        const { items, getSubtotal } = get();
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
        text += `💰 *TOTAL PESANAN: Rp ${subtotal.toLocaleString('id-ID')}*\n`;
        text += `\nMohon konfirmasi ketersediaan, alamat & ongkirnya ya. Terima kasih! 🙏✨`;

        const encodedMessage = encodeURIComponent(text);
        return `https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=${encodedMessage}`;
      },

      // Admin actions
      updateMenuItemPrice: (id, newPrice) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, price: newPrice } : item
          ),
        }));
      },

      toggleMenuItemAvailability: (id) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
          ),
        }));
      },

      addMenuItem: (item) => {
        set((state) => ({
          menuItems: [item, ...state.menuItems],
        }));
      },

      deleteMenuItem: (id) => {
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
      },

      resetMenuToDefault: () => {
        set({ menuItems: INITIAL_MENU });
      },
    }),
    {
      name: 'falya-cart-menu-storage-v11',
      partialize: (state) => ({
        items: state.items,
        menuItems: state.menuItems,
      }),
      merge: (persistedState: any, currentState) => {
        const persistedMenuItems = persistedState?.menuItems || [];
        const mergedMenuItems = INITIAL_MENU.map((initialItem) => {
          const persisted = persistedMenuItems.find((p: MenuItem) => p.id === initialItem.id);
          if (persisted) {
            return {
              ...initialItem,
              price: persisted.price ?? initialItem.price,
              isAvailable: persisted.isAvailable ?? initialItem.isAvailable,
            };
          }
          return initialItem;
        });

        return {
          ...currentState,
          ...persistedState,
          menuItems: mergedMenuItems.length > 0 ? mergedMenuItems : currentState.menuItems,
        };
      },
    }
  )
);
