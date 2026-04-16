export type Video = {
  id: number;
  title: string;
  youtube_url: string;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  is_new: boolean;
  created_at: string;
};

export type ProductDetail = Product & { videos: Video[] };

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Accept: "application/json"
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export function imageUrl(relativePath: string | null | undefined): string | undefined {
  if (!relativePath) return undefined;
  if (relativePath.startsWith("http")) return relativePath;
  return `${API_BASE_URL}/media/${relativePath}`;
}

export const api = {
  listNewProducts: (isNew = true) =>
    request<Product[]>(`/api/products?is_new=${isNew}`),
  getProduct: (productId: number) =>
    request<ProductDetail>(`/api/products/${productId}`)
};
