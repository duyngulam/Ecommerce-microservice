// HeaderData.ts
// NOTE: category slug is fetched lazily in HeaderMenu instead of at module level
// to avoid crashing the entire header when the backend is unavailable.

export const headerData = [
  { href: "/", match: "/", label: "Home" },
  { href: "/products", match: "/products", label: "Products" },
  { href: "/blogs", match: "/blogs", label: "Blogs" },
  { href: "/faq", match: "/faq", label: "FAQ" },
  { href: "/contact-us", match: "/contact-us", label: "Contact us" },
];
