import { expect, type Page } from "@playwright/test";

export const product = {
  id: 7,
  name: "Automation Heavy Tee",
  category: "T-SHIRTS",
  collection: "NEW DROPS",
  price: 1000,
  salePrice: 800,
  stock: 3,
  image: "/favicon.svg",
  colors: "BLACK,WHITE",
  sizes: "M,L",
  description: "A product used by the automated browser tests.",
  variants: [
    { color: "BLACK", size: "M", stock: 2 },
    { color: "BLACK", size: "L", stock: 1 },
    { color: "WHITE", size: "M", stock: 0 },
  ],
  colorImages: [{ color: "BLACK", image: "/favicon.svg" }],
};

export const settings = {
  heroImage: "/og.png",
  campaignImage: "/og.png",
  storyImage: "/og.png",
  aboutImage: "/og.png",
  ticker: ["FREE DELIVERY OVER 2,500 EGP", "TESTED IN CAIRO", "EASY EXCHANGES"],
  marquee: "STREET-BORN   BUILT DIFFERENT   ECHO",
  eyebrow: "TEST / DROP 01",
  headline: "BUILT FOR AUTOMATION.",
  deliveryFee: 80,
  freeDeliveryFrom: 2500,
  deliveryFees: [{ city: "CAIRO", fee: 80 }, { city: "GIZA", fee: 100 }],
  instagramUrl: "https://instagram.com/echo",
  tiktokUrl: "https://tiktok.com/@echo",
  facebookUrl: "https://facebook.com/echo",
  whatsappNumber: "+201000000000",
  storeLocation: "Zamalek, Cairo, Egypt",
  contactEmail: "hello@example.com",
  sizeGuide: [{ size: "M", chest: "96-100", length: "70", shoulder: "46" }],
  sizeGuideNote: "Relaxed test fit.",
};

export async function mockApi(page: Page, options: { authenticated?: boolean } = {}) {
  const state = { authenticated: options.authenticated ?? false, orderStatus: "PENDING" };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

    if (path === "/api/products" && method === "GET") return json({ products: [product] });
    if (path === "/api/settings" && method === "GET") return json({ settings });
    if (path === "/api/discounts/apply") {
      const body = request.postDataJSON();
      return body.code === "SAVE10"
        ? json({ valid: true, type: "percent", value: 10 })
        : json({ valid: false }, 404);
    }
    if (path === "/api/contact") return json({ success: true });
    if (path === "/api/orders" && method === "POST") return json({ order: { id: 4242 } }, 201);
    if (path === "/api/orders" && method === "PATCH") {
      state.orderStatus = request.postDataJSON().status;
      return json({ order: { id: 42, status: state.orderStatus } });
    }
    if (path === "/api/orders") return json({ orders: [{
      id: 42, firstName: "Test", lastName: "Customer", email: "test@example.com",
      phone: "+201000000000", governorate: "CAIRO", area: "ZAMALEK",
      address: "1 Test Street", paymentMethod: "cod",
      items: JSON.stringify([{ id: 100007, name: product.name, color: "BLACK", size: "M", qty: 1, price: 800 }]),
      subtotal: "800", discount: "0", delivery: "80", total: "880",
      status: state.orderStatus, createdAt: new Date().toISOString(),
    }] });
    if (path === "/api/admin/session") return json({ authenticated: state.authenticated });
    if (path === "/api/admin/login") {
      const body = request.postDataJSON();
      state.authenticated = body.username === "admin" && body.password === "secret";
      return state.authenticated ? json({ success: true }) : json({ error: "Invalid credentials" }, 401);
    }
    if (path === "/api/admin/logout") { state.authenticated = false; return json({ success: true }); }
    if (path === "/api/catalog") return json({ collections: [{ id: 1, name: "NEW DROPS" }], categories: [{ id: 1, name: "T-SHIRTS" }] });
    if (path === "/api/discounts") return json({ discountCodes: [{ id: 1, code: "SAVE10", type: "percent", value: 10, active: true }] });
    if (path.includes("/variants")) return json({ variants: product.variants, colorImages: product.colorImages });
    if (path === "/api/payments/paymob") return json({ iframeUrl: "https://example.com/pay" });
    return json({ success: true });
  });
}

export async function openStore(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "ECHO" }).first()).toBeVisible();
}
