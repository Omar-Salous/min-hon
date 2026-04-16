export type ProductId = "tshirt" | "hand-watch" | "bracelet" | "cap" | "hoodie";

export type ProductColor = "Ivory" | "Clay" | "Olive" | "Charcoal";

export type ProductSize = "S" | "M" | "L" | "XL" | "2XL";

export type ProductData = {
  id: ProductId;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  image: {
    src: string;
    alt: string;
  };
  colors: ProductColor[];
  sizes?: ProductSize[];
};

export type CartItem = {
  id: string;
  productId: ProductId;
  productName: string;
  subtitle: string;
  productImage: {
    src: string;
    alt: string;
  };
  unitPrice: number;
  quantity: number;
  color: ProductColor;
  size?: ProductSize;
  customTitle: string;
  customStory: string;
  uploadedImageUrl?: string;
  uploadedImageName?: string;
};

export type CheckoutDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  area: string;
  postalCode: string;
  deliveryNotes: string;
};

export type PaymentMethod = "cod" | "card";

export type CardDetails = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

export type OrderSnapshot = {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  checkoutDetails: CheckoutDetails;
  paymentMethod: PaymentMethod;
};

export type DeliveryReview = {
  orderId: string;
  itemId: string;
  productId: ProductId;
  productName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewText: string;
  updatedAt: string;
};
