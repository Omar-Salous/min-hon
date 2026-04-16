import type {
  CardDetails,
  CartItem,
  CheckoutDetails,
  DeliveryReview,
  OrderSnapshot,
  PaymentMethod,
  ProductColor,
  ProductId,
  ProductSize,
} from "@/features/commerce/commerce-types";

export type AddToCartInput = {
  productId: ProductId;
  color: ProductColor;
  size?: ProductSize;
  quantity?: number;
  customTitle: string;
  customStory: string;
  uploadedImageUrl?: string;
  uploadedImageName?: string;
  uploadedImageStorageKey?: string;
};

export type CreateOrderInput = {
  sessionId: string;
  checkoutDetails: CheckoutDetails;
  paymentMethod: PaymentMethod;
  cardDetails?: CardDetails;
};

export type SaveReviewInput = {
  sessionId: string;
  orderId: string;
  itemId: string;
  productId: ProductId;
  productName: string;
  rating: DeliveryReview["rating"];
  reviewText: string;
};

export type CustomizationRequestInput = {
  sessionId: string;
  productId: ProductId;
  color: ProductColor;
  size?: ProductSize;
  quantity?: number;
  customTitle: string;
  customStory: string;
  uploadedImageUrl?: string;
  uploadedImageName?: string;
  uploadedImageStorageKey?: string;
  uploadStatus?: "not_started" | "pending" | "uploaded" | "failed";
};

export type UploadIntentInput = {
  sessionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type ChatSessionInput = {
  sessionId: string;
  title?: string;
};

export type ChatMessageInput = {
  role: "assistant" | "user" | "system";
  content: string;
  metadata?: Record<string, unknown>;
};

export type CommerceSessionSnapshot = {
  sessionId: string;
  cartItems: CartItem[];
  lastOrder: OrderSnapshot | null;
  reviews: DeliveryReview[];
};
