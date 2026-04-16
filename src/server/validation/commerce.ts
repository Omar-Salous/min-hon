import { z } from "zod";

const productIdSchema = z.enum(["tshirt", "hand-watch", "bracelet", "cap", "hoodie"]);
const productColorSchema = z.enum(["Ivory", "Clay", "Olive", "Charcoal"]);
const productSizeSchema = z.enum(["S", "M", "L", "XL", "2XL"]);
const paymentMethodSchema = z.enum(["cod", "card"]);
const reviewRatingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
const sessionIdSchema = z.string().trim().min(8).max(120);

export const imageValueSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^https?:\/\//.test(value),
    "Expected an absolute image URL.",
  );

export const cardDetailsSchema = z.object({
  cardholderName: z.string().trim().max(120).default(""),
  cardNumber: z.string().trim().max(32).default(""),
  expiry: z.string().trim().max(10).default(""),
  cvc: z.string().trim().max(8).default(""),
});

export const checkoutDetailsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(1).max(40),
  addressLine: z.string().trim().min(1).max(240),
  city: z.string().trim().min(1).max(120),
  area: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(1).max(40),
  deliveryNotes: z.string().trim().max(500).default(""),
});

export const addToCartSchema = z.object({
  sessionId: sessionIdSchema,
  productId: productIdSchema,
  color: productColorSchema,
  size: productSizeSchema.optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  customTitle: z.string().trim().min(1).max(120),
  customStory: z.string().trim().max(500).default(""),
  uploadedImageUrl: imageValueSchema.optional(),
  uploadedImageName: z.string().trim().max(255).optional(),
  uploadedImageStorageKey: z.string().trim().max(500).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(99).optional(),
  color: productColorSchema.optional(),
  size: productSizeSchema.optional().nullable(),
  customTitle: z.string().trim().min(1).max(120).optional(),
  customStory: z.string().trim().max(500).optional(),
  uploadedImageUrl: imageValueSchema.optional().nullable(),
});

export const createOrderSchema = z.object({
  sessionId: sessionIdSchema,
  checkoutDetails: checkoutDetailsSchema,
  paymentMethod: paymentMethodSchema,
  cardDetails: cardDetailsSchema.optional(),
});

export const saveReviewSchema = z.object({
  sessionId: sessionIdSchema,
  orderId: z.string().trim().min(1).max(120),
  itemId: z.string().trim().min(1).max(120),
  productId: productIdSchema,
  productName: z.string().trim().min(1).max(120),
  rating: reviewRatingSchema,
  reviewText: z.string().trim().max(1000).default(""),
});

export const customizationRequestSchema = z.object({
  sessionId: sessionIdSchema,
  productId: productIdSchema,
  color: productColorSchema,
  size: productSizeSchema.optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  customTitle: z.string().trim().min(1).max(120),
  customStory: z.string().trim().max(1000).default(""),
  uploadedImageUrl: imageValueSchema.optional(),
  uploadedImageName: z.string().trim().max(255).optional(),
  uploadedImageStorageKey: z.string().trim().max(500).optional(),
  uploadStatus: z.enum(["not_started", "pending", "uploaded", "failed"]).default("not_started"),
});

export const uploadIntentSchema = z.object({
  sessionId: sessionIdSchema,
  fileName: z.string().trim().min(1).max(255),
  fileType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().min(1).max(20 * 1024 * 1024),
});

export const createChatSessionSchema = z.object({
  sessionId: sessionIdSchema,
  title: z.string().trim().max(120).optional(),
});

export const createChatMessageSchema = z.object({
  role: z.enum(["assistant", "user", "system"]),
  content: z.string().trim().min(1).max(4000),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const sessionQuerySchema = z.object({
  sessionId: sessionIdSchema,
});

export type AddToCartPayload = z.output<typeof addToCartSchema>;
export type UpdateCartItemPayload = z.output<typeof updateCartItemSchema>;
export type CreateOrderPayload = z.output<typeof createOrderSchema>;
export type SaveReviewPayload = z.output<typeof saveReviewSchema>;
export type CustomizationRequestPayload = z.output<typeof customizationRequestSchema>;
export type UploadIntentPayload = z.output<typeof uploadIntentSchema>;
export type CreateChatSessionPayload = z.output<typeof createChatSessionSchema>;
export type CreateChatMessagePayload = z.output<typeof createChatMessageSchema>;
