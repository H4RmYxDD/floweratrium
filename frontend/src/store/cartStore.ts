import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Product {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  addProduct: (productId: number) => void;
  removeProduct: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number; // return type added
}

const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      // ← add `get` here!
      items: [],

      addProduct: (productId) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { productId, quantity: 1 }],
          };
        }),

      removeProduct: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      // Now it works: use the `get` from the creator
      getTotalItems: () =>
        get().items.reduce(
          (total: number, item: CartItem) => total + item.quantity,
          0
        ),
    }),
    {
      name: "cart-storage", // saved in localStorage
    }
  )
);

export default useCart;
