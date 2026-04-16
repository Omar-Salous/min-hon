import type {
  CardDetails,
  CartItem,
  CheckoutDetails,
  OrderSnapshot,
  PaymentMethod,
  ProductData,
} from "@/features/commerce/commerce-types";

export const SHIPPING_FLAT_RATE = 8;

export function formatPrice(value: number) {
  const formattedNumber = Number.isInteger(value)
    ? new Intl.NumberFormat("en-US").format(value)
    : new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

  return `₪${formattedNumber}`;
}

export function calculateSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function calculateItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateShipping(items: CartItem[]) {
  return items.length > 0 ? SHIPPING_FLAT_RATE : 0;
}

export function calculateTotal(items: CartItem[]) {
  return calculateSubtotal(items) + calculateShipping(items);
}

export function createCartItemId() {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createOrderId() {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MH-${new Date().getFullYear()}-${random}`;
}

export function createEmptyCardDetails(): CardDetails {
  return {
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  };
}

export function createOrderSnapshot({
  items,
  checkoutDetails,
  paymentMethod,
}: {
  items: CartItem[];
  checkoutDetails: CheckoutDetails;
  paymentMethod: PaymentMethod;
}): OrderSnapshot {
  return {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    items,
    subtotal: calculateSubtotal(items),
    shipping: calculateShipping(items),
    total: calculateTotal(items),
    itemCount: calculateItemCount(items),
    checkoutDetails,
    paymentMethod,
  };
}

export function productSupportsSize(product: ProductData) {
  return Boolean(product.sizes && product.sizes.length > 0);
}
