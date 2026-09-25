import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string; // chave única: `${productId}-${variationId}`
  productId: string;
  title: string;
  slug: string;
  image: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  variationId: string;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  stock: number;
  retailPrice: number;
  wholesalePrice: number;
  minWholesaleQty: number;
};

export type StoreGroup = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  items: CartItem[];
  totalQuantity: number;
  minWholesaleQty: number;
  isWholesaleActive: boolean;
  piecesRemainingForWholesale: number;
  subtotal: number;
  potentialSavings: number; // Quanto economizou ou economizará com o atacado
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;

  // Seletores calculados
  getStoreGroups: () => StoreGroup[];
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (newItem) => {
        const id = `${newItem.productId}-${newItem.variationId}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === id);

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingIndex].quantity + newItem.quantity;
          updatedItems[existingIndex].quantity = Math.min(newQty, newItem.stock);
          set({ items: updatedItems, isOpen: true });
        } else {
          set({
            items: [...currentItems, { ...newItem, id, quantity: Math.min(newItem.quantity, newItem.stock) }],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      // Agrupa os itens por Loja e calcula as regras de Atacado daquela loja
      getStoreGroups: () => {
        const items = get().items;
        const groupsMap = new Map<string, StoreGroup>();

        for (const item of items) {
          let group = groupsMap.get(item.storeId);

          if (!group) {
            group = {
              storeId: item.storeId,
              storeName: item.storeName,
              storeSlug: item.storeSlug,
              items: [],
              totalQuantity: 0,
              minWholesaleQty: item.minWholesaleQty,
              isWholesaleActive: false,
              piecesRemainingForWholesale: item.minWholesaleQty,
              subtotal: 0,
              potentialSavings: 0,
            };
            groupsMap.set(item.storeId, group);
          }

          group.items.push(item);
          group.totalQuantity += item.quantity;
          // Usa o menor minWholesaleQty dos produtos da loja
          group.minWholesaleQty = Math.min(group.minWholesaleQty, item.minWholesaleQty);
        }

        // Processa as regras de preço de atacado para cada loja
        const groups = Array.from(groupsMap.values());

        for (const group of groups) {
          group.isWholesaleActive = group.totalQuantity >= group.minWholesaleQty;
          group.piecesRemainingForWholesale = Math.max(
            0,
            group.minWholesaleQty - group.totalQuantity
          );

          let subtotal = 0;
          let retailSubtotal = 0;
          let wholesaleSubtotal = 0;

          for (const item of group.items) {
            retailSubtotal += item.retailPrice * item.quantity;
            wholesaleSubtotal += item.wholesalePrice * item.quantity;

            const unitPrice = group.isWholesaleActive ? item.wholesalePrice : item.retailPrice;
            subtotal += unitPrice * item.quantity;
          }

          group.subtotal = subtotal;
          group.potentialSavings = Math.max(0, retailSubtotal - wholesaleSubtotal);
        }

        return groups;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const groups = get().getStoreGroups();
        return groups.reduce((total, g) => total + g.subtotal, 0);
      },
    }),
    {
      name: "bras-market-cart-v1",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
