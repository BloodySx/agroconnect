import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { PackageType } from './quotation-flow';
import { FIXED_DELIVERY_TERM } from './quotation-flow';

export interface OrderDraftItem {
  id: string;
  productId: string;
  productName: string;
  packageId: string;
  packageName: string;
  packageType: PackageType;
  volumeLiters: number;
  quantityLiters: number;
  boxCount: number | null;
  unitPrice: number;
  total: number;
  priceVersion: {
    source: 'client' | 'default';
    priceId: string;
    updatedAt: string;
  };
}

interface OrderDraftContextValue {
  items: OrderDraftItem[];
  addItem: (item: OrderDraftItem) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  totalValue: number;
  paymentTerm: string | null;
  deliveryTerm: string;
  setPaymentTerm: (term: string | null) => void;
  isAddingAnotherProduct: boolean;
  setIsAddingAnotherProduct: (value: boolean) => void;
  markAddingProduct: () => void;
  clearAddingProduct: () => void;
}

const OrderDraftContext = createContext<OrderDraftContextValue | null>(null);

export function useOrderDraft(): OrderDraftContextValue {
  const context = useContext(OrderDraftContext);
  if (!context) {
    throw new Error('useOrderDraft must be used within OrderDraftProvider');
  }
  return context;
}

export function OrderDraftProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderDraftItem[]>([]);
  const [paymentTerm, setPaymentTerm] = useState<string | null>(null);
  const [isAddingAnotherProduct, setIsAddingAnotherProduct] = useState(false);

  const deliveryTerm = FIXED_DELIVERY_TERM;

  const addItem = useCallback((item: OrderDraftItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.packageId === item.packageId);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantityLiters: i.quantityLiters + item.quantityLiters, total: i.total + item.total } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    setPaymentTerm(null);
    setIsAddingAnotherProduct(false);
  }, []);

  const markAddingProduct = useCallback(() => {
    setIsAddingAnotherProduct(true);
  }, []);

  const clearAddingProduct = useCallback(() => {
    setIsAddingAnotherProduct(false);
  }, []);

  const totalValue = useMemo(
    () => items.reduce((acc, item) => acc + item.total, 0),
    [items],
  );

  return (
    <OrderDraftContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearAll,
        totalValue,
        paymentTerm,
        deliveryTerm,
        setPaymentTerm,
        isAddingAnotherProduct,
        setIsAddingAnotherProduct,
        markAddingProduct,
        clearAddingProduct,
      }}
    >
      {children}
    </OrderDraftContext.Provider>
  );
}