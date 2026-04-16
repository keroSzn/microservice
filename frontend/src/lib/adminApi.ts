import type { Product, ProductDetail } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://127.0.0.1:8000";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}

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

export const adminApi = {
  login: async (email: string, password: string) => {
    const out = await request<{ access_token: string; token_type: string }>(
      "/api/admin/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ email, password })
      }
    );
    return out.access_token;
  },

  listProducts: (token: string) =>
    request<Product[]>("/api/admin/products", { headers: authHeaders(token) }),

  createProduct: (token: string, payload: Partial<Product> & { name: string; slug: string }) =>
    request<Product>("/api/admin/products", {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    }),

  updateProduct: (token: string, productId: number, payload: Partial<Product>) =>
    request<Product>(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { ...authHeaders(token), "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    }),

  deleteProduct: async (token: string, productId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
      method: "DELETE",
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(await res.text());
  },

  getPublicProductBySlug: (slug: string) =>
    request<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`),

  deleteVideo: async (token: string, videoId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/products/videos/${videoId}`, {
      method: "DELETE",
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(await res.text());
  },

  uploadVideo: (
    token: string,
    productId: number,
    title: string,
    file: File,
    onProgress?: (pct: number) => void
  ) =>
    new Promise<{ id: number }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/api/admin/products/${productId}/videos`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.responseType = "json";

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress?.(pct);
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as { id: number });
        } else {
          reject(new Error(typeof xhr.response === "string" ? xhr.response : JSON.stringify(xhr.response)));
        }
      };

      const form = new FormData();
      form.append("title", title);
      form.append("file", file);
      xhr.send(form);
    })
};

