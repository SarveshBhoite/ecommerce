// frontend/lib/db.ts

type ProductBrief = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

/* Return token from localStorage */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/* GET CART → returns { productId: quantity } */
export async function getCart(): Promise<Record<string, number>> {
  const token = getToken();
  if (!token) return {};

  const res = await fetch("/api/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return {};

  const data = await res.json();

  // Convert API response → { productId: quantity }
  const map: Record<string, number> = {};
  data.items.forEach((item: any) => {
    map[item.productId] = item.quantity;
  });

  return map;
}

/* ADD TO CART */
export async function addToCart(productId: string): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const res = await fetch("/api/cart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId }),
  });

  return res.ok;
}

/* UPDATE CART QUANTITY */
export async function updateCartQuantity(productId: string, quantity: number): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const res = await fetch("/api/cart", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  return res.ok;
}

/* REMOVE ITEM FROM CART */
export async function removeFromCart(productId: string): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const res = await fetch("/api/cart", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId }),
  });

  return res.ok;
}
