import {
  ChatMessageRole,
  ChatSessionStatus,
  CustomizationStatus,
  OrderStatus,
  PaymentMethod as PrismaPaymentMethod,
  PaymentStatus,
  Prisma,
  UploadStatus,
} from "@prisma/client";
import {
  getDatabaseUnavailableMessage,
  isDatabaseAvailable,
  prisma,
} from "@/lib/prisma";
import { products } from "@/features/commerce/commerce-data";
import type {
  ChatMessageInput,
  ChatSessionInput,
  CommerceSessionSnapshot,
  CreateOrderInput,
  CustomizationRequestInput,
  SaveReviewInput,
  UploadIntentInput,
} from "@/features/commerce/commerce-contracts";
import type {
  CartItem,
  DeliveryReview,
  OrderSnapshot,
  PaymentMethod,
  ProductData,
} from "@/features/commerce/commerce-types";
import {
  calculateItemCount,
  calculateShipping,
  calculateSubtotal,
  calculateTotal,
  createOrderId,
} from "@/features/commerce/commerce-utils";

type ProductRecord = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  colors: Prisma.InputJsonValue;
  sizes: Prisma.InputJsonValue | typeof Prisma.JsonNull;
};

const productSeedRecords: ProductRecord[] = products.map((product) => ({
  id: product.id,
  name: product.name,
  subtitle: product.subtitle,
  description: product.description,
  price: product.price,
  imageSrc: product.image.src,
  imageAlt: product.image.alt,
  colors: product.colors,
  sizes: product.sizes ?? Prisma.JsonNull,
}));

function getDatabaseClient() {
  if (!prisma || !isDatabaseAvailable()) {
    return null;
  }

  return prisma;
}

function createEmptyCommerceSnapshot(sessionId: string): CommerceSessionSnapshot {
  return {
    sessionId,
    cartItems: [],
    lastOrder: null,
    reviews: [],
  };
}

function createDatabaseFallbackError(feature: string) {
  return new Error(getDatabaseUnavailableMessage(feature));
}

function paymentMethodToPrisma(method: PaymentMethod) {
  return method === "card" ? PrismaPaymentMethod.CARD : PrismaPaymentMethod.COD;
}

function paymentMethodFromPrisma(method: PrismaPaymentMethod): PaymentMethod {
  return method === PrismaPaymentMethod.CARD ? "card" : "cod";
}

function serializeCartItem(item: {
  id: string;
  productId: string;
  productName: string;
  subtitle: string;
  productImageSrc: string;
  productImageAlt: string;
  unitPrice: number;
  quantity: number;
  color: string;
  size: string | null;
  customTitle: string;
  customStory: string;
  uploadedImageUrl: string | null;
  uploadedImageName?: string | null;
}): CartItem {
  return {
    id: item.id,
    productId: item.productId as CartItem["productId"],
    productName: item.productName,
    subtitle: item.subtitle,
    productImage: {
      src: item.productImageSrc,
      alt: item.productImageAlt,
    },
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    color: item.color as CartItem["color"],
    size: item.size as CartItem["size"],
    customTitle: item.customTitle,
    customStory: item.customStory,
    uploadedImageUrl: item.uploadedImageUrl ?? undefined,
    uploadedImageName: item.uploadedImageName ?? undefined,
  };
}

function serializeReview(review: {
  orderId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  rating: number;
  reviewText: string;
  updatedAt: Date;
}): DeliveryReview {
  return {
    orderId: review.orderId,
    itemId: review.orderItemId,
    productId: review.productId as DeliveryReview["productId"],
    productName: review.productName,
    rating: review.rating as DeliveryReview["rating"],
    reviewText: review.reviewText,
    updatedAt: review.updatedAt.toISOString(),
  };
}

function serializeOrder(order: {
  orderNumber: string;
  createdAt: Date;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  paymentMethod: PrismaPaymentMethod;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  area: string;
  postalCode: string;
  deliveryNotes: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    subtitle: string;
    productImageSrc: string;
    productImageAlt: string;
    unitPrice: number;
    quantity: number;
    color: string;
    size: string | null;
    customTitle: string;
    customStory: string;
    uploadedImageUrl: string | null;
    uploadedImageName?: string | null;
  }>;
}): OrderSnapshot {
  return {
    id: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(serializeCartItem),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    itemCount: order.itemCount,
    checkoutDetails: {
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      addressLine: order.addressLine,
      city: order.city,
      area: order.area,
      postalCode: order.postalCode,
      deliveryNotes: order.deliveryNotes,
    },
    paymentMethod: paymentMethodFromPrisma(order.paymentMethod),
  };
}

function serializeProduct(product: {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  colors: Prisma.JsonValue;
  sizes: Prisma.JsonValue | null;
}): ProductData {
  return {
    id: product.id as ProductData["id"],
    name: product.name,
    subtitle: product.subtitle,
    description: product.description,
    price: product.price,
    image: {
      src: product.imageSrc,
      alt: product.imageAlt,
    },
    colors: ((Array.isArray(product.colors) ? product.colors : []) as ProductData["colors"]) ?? [],
    sizes: Array.isArray(product.sizes) ? (product.sizes as ProductData["sizes"]) : undefined,
  };
}

export async function syncCatalogProducts() {
  const db = getDatabaseClient();
  if (!db) {
    return;
  }

  await Promise.all(
    productSeedRecords.map((product) =>
      db.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      }),
    ),
  );
}

export async function listProducts() {
  const db = getDatabaseClient();
  if (!db) {
    return products;
  }

  await syncCatalogProducts();
  const dbProducts = await db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return dbProducts.map(serializeProduct);
}

export async function getSessionCommerceState(sessionId: string): Promise<CommerceSessionSnapshot> {
  const db = getDatabaseClient();
  if (!db) {
    return createEmptyCommerceSnapshot(sessionId);
  }

  const [cartItems, lastOrder, reviews] = await Promise.all([
    db.cartItem.findMany({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
    }),
    db.order.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    db.review.findMany({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    sessionId,
    cartItems: cartItems.map(serializeCartItem),
    lastOrder: lastOrder ? serializeOrder(lastOrder) : null,
    reviews: reviews.map(serializeReview),
  };
}

export async function addCartItem(
  input: Omit<CustomizationRequestInput, "uploadStatus"> & {
    sessionId: string;
    uploadedImageUrl?: string;
  },
) {
  const db = getDatabaseClient();
  if (!db) {
    throw createDatabaseFallbackError("Cart sync and customization persistence");
  }

  await syncCatalogProducts();

  const product = await db.product.findUnique({
    where: { id: input.productId },
  });

  if (!product) {
    throw new Error(`Unknown product: ${input.productId}`);
  }

  const existingItem = await db.cartItem.findFirst({
    where: {
      sessionId: input.sessionId,
      productId: input.productId,
      color: input.color,
      size: input.size ?? null,
      customTitle: input.customTitle,
      customStory: input.customStory,
      uploadedImageUrl: input.uploadedImageUrl ?? null,
    },
  });

  if (existingItem) {
    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + (input.quantity ?? 1) },
    });
    return getSessionCommerceState(input.sessionId);
  }

  let customizationRequestId: string | undefined;
  if (input.customTitle.trim() || input.customStory.trim() || input.uploadedImageUrl) {
    const customization = await db.customizationRequest.create({
      data: {
        sessionId: input.sessionId,
        productId: input.productId,
        productName: product.name,
        productSubtitle: product.subtitle,
        color: input.color,
        size: input.size,
        customTitle: input.customTitle,
        customStory: input.customStory,
        quantity: input.quantity ?? 1,
        unitPrice: product.price,
        totalPrice: product.price * (input.quantity ?? 1),
        uploadedImageUrl: input.uploadedImageUrl,
        uploadedImageName: input.uploadedImageName,
        uploadedStorageKey: input.uploadedImageStorageKey,
        uploadStatus: input.uploadedImageUrl ? UploadStatus.UPLOADED : UploadStatus.NOT_STARTED,
        status: CustomizationStatus.DRAFT,
      },
    });
    customizationRequestId = customization.id;
  }

  await db.cartItem.create({
    data: {
      sessionId: input.sessionId,
      productId: product.id,
      productName: product.name,
      subtitle: product.subtitle,
      productImageSrc: product.imageSrc,
      productImageAlt: product.imageAlt,
      unitPrice: product.price,
      quantity: input.quantity ?? 1,
      color: input.color,
      size: input.size,
      customTitle: input.customTitle,
      customStory: input.customStory,
      uploadedImageUrl: input.uploadedImageUrl,
      customizationRequestId,
    },
  });

  return getSessionCommerceState(input.sessionId);
}

export async function updateCartItem(
  sessionId: string,
  itemId: string,
  updates: {
    quantity?: number;
    color?: string;
    size?: string | null;
    customTitle?: string;
    customStory?: string;
    uploadedImageUrl?: string | null;
  },
) {
  const db = getDatabaseClient();
  if (!db) {
    throw createDatabaseFallbackError("Cart sync");
  }

  if (updates.quantity === 0) {
    await removeCartItem(sessionId, itemId);
    return getSessionCommerceState(sessionId);
  }

  await db.cartItem.updateMany({
    where: {
      id: itemId,
      sessionId,
    },
    data: {
      quantity: updates.quantity,
      color: updates.color,
      size: updates.size,
      customTitle: updates.customTitle,
      customStory: updates.customStory,
      uploadedImageUrl: updates.uploadedImageUrl,
    },
  });

  return getSessionCommerceState(sessionId);
}

export async function removeCartItem(sessionId: string, itemId: string) {
  const db = getDatabaseClient();
  if (!db) {
    throw createDatabaseFallbackError("Cart sync");
  }

  await db.cartItem.deleteMany({
    where: {
      id: itemId,
      sessionId,
    },
  });

  return getSessionCommerceState(sessionId);
}

export async function clearCart(sessionId: string) {
  const db = getDatabaseClient();
  if (!db) {
    throw createDatabaseFallbackError("Cart sync");
  }

  await db.cartItem.deleteMany({
    where: { sessionId },
  });

  return getSessionCommerceState(sessionId);
}

export async function createOrderFromSession(input: CreateOrderInput) {
  const db = getDatabaseClient();
  if (!db) {
    throw createDatabaseFallbackError("Order creation");
  }

  const cartItems = await db.cartItem.findMany({
    where: { sessionId: input.sessionId },
    orderBy: { createdAt: "asc" },
  });

  if (cartItems.length === 0) {
    throw new Error("Cannot create an order from an empty cart.");
  }

  const uiCartItems = cartItems.map(serializeCartItem);
  const subtotal = calculateSubtotal(uiCartItems);
  const shipping = calculateShipping(uiCartItems);
  const total = calculateTotal(uiCartItems);
  const itemCount = calculateItemCount(uiCartItems);

  const order = await db.order.create({
    data: {
      orderNumber: createOrderId(),
      sessionId: input.sessionId,
      status: OrderStatus.CONFIRMED,
      paymentMethod: paymentMethodToPrisma(input.paymentMethod),
      paymentStatus:
        input.paymentMethod === "card" && input.cardDetails
          ? PaymentStatus.AUTHORIZED
          : PaymentStatus.PENDING,
      subtotal,
      shipping,
      total,
      itemCount,
      firstName: input.checkoutDetails.firstName,
      lastName: input.checkoutDetails.lastName,
      email: input.checkoutDetails.email,
      phone: input.checkoutDetails.phone,
      addressLine: input.checkoutDetails.addressLine,
      city: input.checkoutDetails.city,
      area: input.checkoutDetails.area,
      postalCode: input.checkoutDetails.postalCode,
      deliveryNotes: input.checkoutDetails.deliveryNotes,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          subtitle: item.subtitle,
          productImageSrc: item.productImageSrc,
          productImageAlt: item.productImageAlt,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          customTitle: item.customTitle,
          customStory: item.customStory,
          uploadedImageUrl: item.uploadedImageUrl,
          customizationRequestId: item.customizationRequestId,
        })),
      },
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  await db.cartItem.deleteMany({
    where: { sessionId: input.sessionId },
  });

  return serializeOrder(order);
}

export async function saveReview(input: SaveReviewInput) {
  const db = getDatabaseClient();
  if (!db) {
    throw createDatabaseFallbackError("Review saving");
  }

  await syncCatalogProducts();

  const [order, orderItem] = await Promise.all([
    db.order.findFirst({
      where: {
        orderNumber: input.orderId,
        sessionId: input.sessionId,
      },
    }),
    db.orderItem.findFirst({
      where: { id: input.itemId },
    }),
  ]);

  if (!order || !orderItem) {
    throw new Error("Unable to locate the order item for this review.");
  }

  const review = await db.review.upsert({
    where: {
      orderId_orderItemId: {
        orderId: order.id,
        orderItemId: orderItem.id,
      },
    },
    update: {
      rating: input.rating,
      reviewText: input.reviewText,
      productName: input.productName,
      sessionId: input.sessionId,
    },
    create: {
      sessionId: input.sessionId,
      orderId: order.id,
      orderItemId: orderItem.id,
      productId: input.productId,
      productName: input.productName,
      rating: input.rating,
      reviewText: input.reviewText,
    },
  });

  return serializeReview(review);
}

export async function createCustomizationRequest(input: CustomizationRequestInput) {
  const db = getDatabaseClient();
  if (!db) {
    throw createDatabaseFallbackError("Customization request saving");
  }

  await syncCatalogProducts();
  const product = await db.product.findUnique({
    where: { id: input.productId },
  });

  if (!product) {
    throw new Error(`Unknown product: ${input.productId}`);
  }

  const quantity = input.quantity ?? 1;
  return db.customizationRequest.create({
    data: {
      sessionId: input.sessionId,
      productId: input.productId,
      productName: product.name,
      productSubtitle: product.subtitle,
      color: input.color,
      size: input.size,
      customTitle: input.customTitle,
      customStory: input.customStory,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      uploadedImageUrl: input.uploadedImageUrl,
      uploadedImageName: input.uploadedImageName,
      uploadedStorageKey: input.uploadedImageStorageKey,
      uploadStatus:
        input.uploadStatus === "uploaded"
          ? UploadStatus.UPLOADED
          : input.uploadStatus === "pending"
            ? UploadStatus.PENDING
            : input.uploadStatus === "failed"
              ? UploadStatus.FAILED
              : UploadStatus.NOT_STARTED,
      status: CustomizationStatus.DRAFT,
    },
  });
}

export async function createUploadIntent(input: UploadIntentInput) {
  const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storageKey = `${input.sessionId}/${Date.now()}-${safeFileName}`;

  return {
    provider: process.env.MIN_HON_UPLOAD_PROVIDER ?? "local-stub",
    bucket: process.env.MIN_HON_UPLOAD_BUCKET ?? "min-hon-customizations",
    storageKey,
    uploadUrl: null,
    publicUrl: `/uploads/${storageKey}`,
    headers: {
      "content-type": input.fileType,
    },
    maxFileSize: 20 * 1024 * 1024,
  };
}

export async function createChatSession(input: ChatSessionInput) {
  const db = getDatabaseClient();
  if (!db) {
    return {
      id: `fallback-chat-${Date.now()}`,
      sessionId: input.sessionId,
      title: input.title ?? "Fallback chat session",
      status: ChatSessionStatus.ACTIVE,
      contextSummary: getDatabaseUnavailableMessage("Chat session storage"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return db.chatSession.create({
    data: {
      sessionId: input.sessionId,
      title: input.title,
      status: ChatSessionStatus.ACTIVE,
    },
  });
}

export async function appendChatMessage(chatSessionId: string, input: ChatMessageInput) {
  const db = getDatabaseClient();
  if (!db) {
    return {
      id: `fallback-message-${Date.now()}`,
      chatSessionId,
      role:
        input.role === "assistant"
          ? ChatMessageRole.ASSISTANT
          : input.role === "system"
            ? ChatMessageRole.SYSTEM
            : ChatMessageRole.USER,
      content: input.content,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    };
  }

  return db.chatMessage.create({
    data: {
      chatSessionId,
      role:
        input.role === "assistant"
          ? ChatMessageRole.ASSISTANT
          : input.role === "system"
            ? ChatMessageRole.SYSTEM
            : ChatMessageRole.USER,
      content: input.content,
      metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
    },
  });
}
