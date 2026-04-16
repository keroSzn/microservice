export type Video = {
  id: number;
  title: string;
  mime_type: string;
  duration_sec: number | null;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
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

export const api = {
  listNewProducts: (isNew = true) =>
    request<Product[]>(`/api/products?is_new=${isNew}`),
  getProduct: (slug: string) => request<ProductDetail>(`/api/products/${slug}`),
  videoStreamUrl: (videoId: number) => `${API_BASE_URL}/api/videos/${videoId}/stream`
};

