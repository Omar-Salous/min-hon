"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  AddToCartInput,
  CommerceSessionSnapshot,
  CreateOrderInput,
  SaveReviewInput,
} from "@/features/commerce/commerce-contracts";
import { defaultCheckoutDetails, products, productsById } from "@/features/commerce/commerce-data";
import {
  calculateItemCount,
  calculateShipping,
  calculateSubtotal,
  calculateTotal,
  createCartItemId,
  createEmptyCardDetails,
  createOrderSnapshot,
} from "@/features/commerce/commerce-utils";
import type {
  CardDetails,
  CartItem,
  CheckoutDetails,
  DeliveryReview,
  OrderSnapshot,
  PaymentMethod,
  ProductId,
} from "@/features/commerce/commerce-types";

const STORAGE_KEYS = {
  sessionId: "min-hon-session-id",
  cart: "min-hon-cart",
  checkout: "min-hon-checkout",
  paymentMethod: "min-hon-payment-method",
  cardDetails: "min-hon-card-details",
  lastOrder: "min-hon-last-order",
  reviews: "min-hon-delivery-reviews",
} as const;

type CommerceContextValue = {
  hydrated: boolean;
  sessionId: string | null;
  products: typeof products;
  cartItems: CartItem[];
  checkoutDetails: CheckoutDetails;
  paymentMethod: PaymentMethod;
  cardDetails: CardDetails;
  lastOrder: OrderSnapshot | null;
  reviews: DeliveryReview[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (input: AddToCartInput) => Promise<CartItem>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateCheckoutDetails: (value: Partial<CheckoutDetails>) => void;
  updatePaymentMethod: (value: PaymentMethod) => void;
  updateCardDetails: (value: Partial<CardDetails>) => void;
  completeOrder: () => Promise<OrderSnapshot | null>;
  saveReview: (value: Omit<SaveReviewInput, "sessionId">) => Promise<DeliveryReview>;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const emptySubscribe = () => () => {};

function normalizeProductId(productId: string): ProductId {
  return productId === "tote-bag" ? "bracelet" : (productId as ProductId);
}

function normalizeProductName(productName: string) {
  return productName === "Tote Bag" ? "Bracelet" : productName;
}

function normalizeCartItem(item: CartItem): CartItem {
  const legacyItem = item as CartItem & { uploadedImageDataUrl?: string };
  return {
    ...item,
    productId: normalizeProductId(item.productId),
    productName: normalizeProductName(item.productName),
    uploadedImageUrl: item.uploadedImageUrl ?? legacyItem.uploadedImageDataUrl,
  };
}

function normalizeOrderSnapshot(order: OrderSnapshot | null) {
  if (!order) {
    return null;
  }

  return {
    ...order,
    items: order.items.map(normalizeCartItem),
  };
}

function normalizeReview(review: DeliveryReview): DeliveryReview {
  return {
    ...review,
    productId: normalizeProductId(review.productId),
    productName: normalizeProductName(review.productName),
  };
}

function normalizeSessionSnapshot(snapshot: CommerceSessionSnapshot): CommerceSessionSnapshot {
  return {
    ...snapshot,
    cartItems: snapshot.cartItems.map(normalizeCartItem),
    lastOrder: normalizeOrderSnapshot(snapshot.lastOrder),
    reviews: snapshot.reviews.map(normalizeReview),
  };
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function readStoredValue<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function createBrowserSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getInitialSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSessionId = readStoredValue<string | null>(STORAGE_KEYS.sessionId, null);
  return storedSessionId ?? createBrowserSessionId();
}

async function readJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function CommerceProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const [sessionId] = useState<string | null>(getInitialSessionId);
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStoredValue<CartItem[]>(STORAGE_KEYS.cart, []).map(normalizeCartItem),
  );
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>(() =>
    readStoredValue<CheckoutDetails>(STORAGE_KEYS.checkout, defaultCheckoutDetails),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() =>
    readStoredValue<PaymentMethod>(STORAGE_KEYS.paymentMethod, "cod"),
  );
  const [cardDetails, setCardDetails] = useState<CardDetails>(() =>
    readStoredValue<CardDetails>(STORAGE_KEYS.cardDetails, createEmptyCardDetails()),
  );
  const [lastOrder, setLastOrder] = useState<OrderSnapshot | null>(() =>
    normalizeOrderSnapshot(readStoredValue<OrderSnapshot | null>(STORAGE_KEYS.lastOrder, null)),
  );
  const [reviews, setReviews] = useState<DeliveryReview[]>(() =>
    readStoredValue<DeliveryReview[]>(STORAGE_KEYS.reviews, []).map(normalizeReview),
  );
  const loadedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !sessionId) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.sessionId, JSON.stringify(sessionId));
  }, [hydrated, sessionId]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.checkout, JSON.stringify(checkoutDetails));
  }, [checkoutDetails, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.paymentMethod, JSON.stringify(paymentMethod));
  }, [paymentMethod, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.cardDetails, JSON.stringify(cardDetails));
  }, [cardDetails, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (lastOrder) {
      window.localStorage.setItem(STORAGE_KEYS.lastOrder, JSON.stringify(lastOrder));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.lastOrder);
  }, [lastOrder, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  }, [reviews, hydrated]);

  useEffect(() => {
    if (!hydrated || !sessionId) {
      return;
    }

    if (loadedSessionRef.current === sessionId) {
      return;
    }

    loadedSessionRef.current = sessionId;

    let cancelled = false;

    async function loadRemoteSnapshot() {
      try {
        const snapshot = normalizeSessionSnapshot(
          await readJson<CommerceSessionSnapshot>(`/api/commerce/session/${sessionId}`),
        );

        if (cancelled) {
          return;
        }

        const remoteHasState =
          snapshot.cartItems.length > 0 || snapshot.reviews.length > 0 || Boolean(snapshot.lastOrder);

        if (!remoteHasState && (cartItems.length > 0 || reviews.length > 0 || lastOrder)) {
          return;
        }

        setCartItems(snapshot.cartItems);
        setLastOrder(snapshot.lastOrder);
        setReviews(snapshot.reviews);
      } catch {
        // Keep the local fallback active when the backend is not available yet.
      }
    }

    void loadRemoteSnapshot();

    return () => {
      cancelled = true;
    };
  }, [cartItems.length, hydrated, lastOrder, reviews.length, sessionId]);

  const subtotal = useMemo(() => calculateSubtotal(cartItems), [cartItems]);
  const shipping = useMemo(() => calculateShipping(cartItems), [cartItems]);
  const total = useMemo(() => calculateTotal(cartItems), [cartItems]);
  const itemCount = useMemo(() => calculateItemCount(cartItems), [cartItems]);

  const updateFromSnapshot = (snapshot: CommerceSessionSnapshot) => {
    const normalizedSnapshot = normalizeSessionSnapshot(snapshot);
    setCartItems(normalizedSnapshot.cartItems);
    setLastOrder(normalizedSnapshot.lastOrder);
    setReviews(normalizedSnapshot.reviews);
  };

  const addToCart = async (input: AddToCartInput) => {
    const product = productsById[input.productId];
    const nextItem: CartItem = {
      id: createCartItemId(),
      productId: product.id,
      productName: product.name,
      subtitle: product.subtitle,
      productImage: product.image,
      unitPrice: product.price,
      quantity: input.quantity ?? 1,
      color: input.color,
      size: input.size,
      customTitle: input.customTitle.trim(),
      customStory: input.customStory.trim(),
      uploadedImageUrl: input.uploadedImageUrl,
      uploadedImageName: input.uploadedImageName,
    };

    setCartItems((currentItems) => {
      const matchingItem = currentItems.find((item) => {
        return (
          item.productId === nextItem.productId &&
          item.color === nextItem.color &&
          item.size === nextItem.size &&
          item.customTitle === nextItem.customTitle &&
          item.customStory === nextItem.customStory &&
          item.uploadedImageUrl === nextItem.uploadedImageUrl
        );
      });

      if (!matchingItem) {
        return [...currentItems, nextItem];
      }

      return currentItems.map((item) =>
        item.id === matchingItem.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });

    if (!sessionId) {
      return nextItem;
    }

    try {
      const snapshot = await readJson<CommerceSessionSnapshot>("/api/cart", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          quantity: input.quantity ?? 1,
          ...input,
        }),
      });
      updateFromSnapshot(snapshot);

      return (
        snapshot.cartItems.find((item) => {
          return (
            item.productId === nextItem.productId &&
            item.color === nextItem.color &&
            item.size === nextItem.size &&
            item.customTitle === nextItem.customTitle &&
            item.customStory === nextItem.customStory &&
            item.uploadedImageUrl === nextItem.uploadedImageUrl
          );
        }) ?? nextItem
      );
    } catch {
      return nextItem;
    }
  };

  const removeFromCart = async (itemId: string) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));

    if (!sessionId) {
      return;
    }

    try {
      const snapshot = await readJson<CommerceSessionSnapshot>(
        `/api/cart/items/${itemId}?sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "DELETE",
        },
      );
      updateFromSnapshot(snapshot);
    } catch {
      // Keep local fallback state.
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );

    if (!sessionId) {
      return;
    }

    try {
      const snapshot = await readJson<CommerceSessionSnapshot>(
        `/api/cart/items/${itemId}?sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        },
      );
      updateFromSnapshot(snapshot);
    } catch {
      // Keep local fallback state.
    }
  };

  const clearCart = async () => {
    setCartItems([]);

    if (!sessionId) {
      return;
    }

    try {
      const snapshot = await readJson<CommerceSessionSnapshot>(
        `/api/cart?sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "DELETE",
        },
      );
      updateFromSnapshot(snapshot);
    } catch {
      // Keep local fallback state.
    }
  };

  const updateCheckoutDetails = (value: Partial<CheckoutDetails>) => {
    setCheckoutDetails((currentValue) => ({ ...currentValue, ...value }));
  };

  const updatePaymentMethod = (value: PaymentMethod) => {
    setPaymentMethod(value);
  };

  const updateCardDetails = (value: Partial<CardDetails>) => {
    setCardDetails((currentValue) => ({ ...currentValue, ...value }));
  };

  const completeOrder = async () => {
    if (cartItems.length === 0) {
      return null;
    }

    const fallbackOrder = createOrderSnapshot({
      items: cartItems,
      checkoutDetails,
      paymentMethod,
    });

    if (!sessionId) {
      setLastOrder(fallbackOrder);
      setCartItems([]);
      return fallbackOrder;
    }

    try {
      const payload: CreateOrderInput = {
        sessionId,
        checkoutDetails,
        paymentMethod,
        cardDetails: paymentMethod === "card" ? cardDetails : undefined,
      };
      const response = await readJson<{ order: OrderSnapshot }>("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const normalizedOrder = normalizeOrderSnapshot(response.order);
      setLastOrder(normalizedOrder);
      setCartItems([]);
      return normalizedOrder;
    } catch {
      setLastOrder(fallbackOrder);
      setCartItems([]);
      return fallbackOrder;
    }
  };

  const saveReview = async (value: Omit<SaveReviewInput, "sessionId">) => {
    const nextReview: DeliveryReview = {
      ...value,
      reviewText: value.reviewText.trim(),
      updatedAt: new Date().toISOString(),
    };

    setReviews((currentReviews) => {
      const existingIndex = currentReviews.findIndex(
        (review) => review.orderId === nextReview.orderId && review.itemId === nextReview.itemId,
      );

      if (existingIndex === -1) {
        return [...currentReviews, nextReview];
      }

      return currentReviews.map((review, index) =>
        index === existingIndex ? nextReview : review,
      );
    });

    if (!sessionId) {
      return nextReview;
    }

    try {
      const response = await readJson<{ review: DeliveryReview }>("/api/reviews", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          ...value,
        }),
      });
      const normalizedReview = normalizeReview(response.review);
      setReviews((currentReviews) => {
        const existingIndex = currentReviews.findIndex(
          (review) =>
            review.orderId === normalizedReview.orderId && review.itemId === normalizedReview.itemId,
        );

        if (existingIndex === -1) {
          return [...currentReviews, normalizedReview];
        }

        return currentReviews.map((review, index) =>
          index === existingIndex ? normalizedReview : review,
        );
      });
      return normalizedReview;
    } catch {
      return nextReview;
    }
  };

  return (
    <CommerceContext.Provider
      value={{
        hydrated,
        sessionId,
        products,
        cartItems,
        checkoutDetails,
        paymentMethod,
        cardDetails,
        lastOrder,
        reviews,
        itemCount,
        subtotal,
        shipping,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        updateCheckoutDetails,
        updatePaymentMethod,
        updateCardDetails,
        completeOrder,
        saveReview,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }

  return context;
}
