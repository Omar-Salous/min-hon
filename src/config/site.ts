export type NavigationItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  mainNavigation: [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "Customize", href: "/customize" },
    { label: "Style Assistant", href: "/assistant" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Cart", href: "/cart" },
  ] satisfies NavigationItem[],
  commerceNavigation: [
    { label: "Checkout", href: "/checkout" },
    { label: "Payment", href: "/payment" },
    { label: "Order Confirmation", href: "/order-confirmation" },
    { label: "Delivery", href: "/delivery" },
    { label: "Post Purchase", href: "/post-purchase" },
  ] satisfies NavigationItem[],
};
