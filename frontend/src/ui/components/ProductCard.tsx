import { Link } from "react-router-dom";
import type { Product } from "../../lib/api";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{product.name}</div>
          <div className="mt-1 line-clamp-2 text-xs text-slate-600">
            {product.description ?? "Yeni çıkan ürünümüzü keşfedin."}
          </div>
        </div>
        {product.is_new ? (
          <span className="shrink-0 rounded-full bg-torkuGreen-50 px-2 py-1 text-[11px] font-semibold text-torkuGreen-700">
            Yeni
          </span>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-slate-100">
        {product.image_url ? (
          <img
            alt={product.name}
            src={product.image_url}
            className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="grid h-36 w-full place-items-center text-xs text-slate-500">
            Görsel yok
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">Detay</span>
        <span className="text-xs font-semibold text-torkuGreen-700">
          İncele →
        </span>
      </div>
    </Link>
  );
}

