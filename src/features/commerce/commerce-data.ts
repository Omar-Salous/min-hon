import { brandImages } from "@/lib/brand-assets";
import type { CheckoutDetails, ProductData, ProductId } from "@/features/commerce/commerce-types";

export const products: ProductData[] = [
  {
    id: "tshirt",
    name: "T-Shirt",
    subtitle: "Story-led apparel",
    description: "A wearable story for everyday moments and warm memories.",
    price: 34,
    image: brandImages.tshirt2,
    colors: ["Ivory", "Clay", "Olive", "Charcoal"],
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "hand-watch",
    name: "Hand Watch",
    subtitle: "Gift-ready keepsake",
    description: "A refined wearable keepsake with room for a name, date, or meaningful phrase.",
    price: 78,
    image: brandImages.watch7,
    colors: ["Ivory", "Clay", "Olive"],
  },
  {
    id: "bracelet",
    name: "Bracelet",
    subtitle: "Lifestyle essential",
    description: "A practical canvas for community-inspired phrases and illustrations.",
    price: 28,
    image: brandImages.hand2,
    colors: ["Ivory", "Clay", "Olive", "Charcoal"],
  },
  {
    id: "cap",
    name: "Cap",
    subtitle: "Minimal statement",
    description: "A compact statement piece with subtle identity and symbolism.",
    price: 26,
    image: brandImages.cap,
    colors: ["Ivory", "Clay", "Olive", "Charcoal"],
  },
  {
    id: "hoodie",
    name: "Hoodie",
    subtitle: "Seasonal favorite",
    description: "A warmer canvas for bolder phrases and story-led graphics.",
    price: 56,
    image: brandImages.hoody,
    colors: ["Ivory", "Clay", "Olive", "Charcoal"],
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
];

export const productsById = products.reduce<Record<ProductId, ProductData>>(
  (accumulator, product) => {
    accumulator[product.id] = product;
    return accumulator;
  },
  {} as Record<ProductId, ProductData>,
);

export const defaultProductId: ProductId = "tshirt";

export const defaultCheckoutDetails: CheckoutDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  area: "",
  postalCode: "",
  deliveryNotes: "",
};
