import type { Product, ProductDetail, Video } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://127.0.0.1:8000";

export type AdminUser = {
  id: number;
  email: string;
  created_at: string;
};

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}

function humanizeField(field: string): string {
  switch (field) {
    case "email":
      return "E-posta";
    case "password":
      return "Şifre";
    case "file":
      return "Dosya";
    default:
      return field;
  }
}

function humanizePydanticMsg(msg: string): string {
  // FastAPI/Pydantic varsayılan mesajlarını daha kullanıcı dostu yapalım
  if (msg.toLowerCase().includes("at least")) return "En az gerekli karakter sayısını karşılamıyor.";
  if (msg.toLowerCase().includes("field required")) return "Bu alan zorunludur.";
  return msg;
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
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = (await res.json().catch(() => null)) as any;
      const detail = data?.detail;

      // detail: string
      if (typeof detail === "string" && detail.trim()) {
        throw new Error(detail);
      }

      // detail: [{loc, msg, type, ...}, ...]  (422 validation)
      if (Array.isArray(detail) && detail.length > 0) {
        const items = detail
          .map((d: any) => {
            const locArr = Array.isArray(d?.loc) ? d.loc : [];
            const field = locArr[locArr.length - 1];
            const label = typeof field === "string" ? humanizeField(field) : "Alan";
            const msg = typeof d?.msg === "string" ? humanizePydanticMsg(d.msg) : "Geçersiz değer";
            return `${label}: ${msg}`;
          })
          .filter(Boolean);

        if (items.length) {
          throw new Error(items.join("\n"));
        }
      }
    }

    const text = await res.text().catch(() => "");
    throw new Error(text || "İşlem başarısız. Lütfen bilgileri kontrol edin.");
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

  getProduct: (token: string, productId: number) =>
    request<ProductDetail>(`/api/products/${productId}`),

  createProduct: (
    token: string,
    payload: { name: string; description?: string; is_new?: boolean }
  ) =>
    request<Product>("/api/admin/products", {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    }),

  uploadProductImage: (token: string, productId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Product>(`/api/admin/products/${productId}/image`, {
      method: "POST",
      headers: authHeaders(token),
      body: form
    });
  },

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

  addVideo: (
    token: string,
    productId: number,
    payload: { title: string; youtube_url: string }
  ) =>
    request<Video>(`/api/admin/products/${productId}/videos`, {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    }),

  deleteVideo: async (token: string, videoId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/products/videos/${videoId}`, {
      method: "DELETE",
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(await res.text());
  },

  listAdmins: (token: string) =>
    request<AdminUser[]>("/api/admin/auth/admins", { headers: authHeaders(token) }),

  createAdmin: (token: string, payload: { email: string; password: string }) =>
    request<AdminUser>("/api/admin/auth/admins", {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    })
};
