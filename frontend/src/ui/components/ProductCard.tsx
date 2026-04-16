import { Link } from "react-router-dom";
import type { Product } from "../../lib/api";
import { imageUrl } from "../../lib/api";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col items-center rounded-2xl border bg-white px-4 pb-5 pt-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      {product.is_new && (
        <span className="mb-3 rounded-full bg-torkuGreen-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
          Yeni Ürün
        </span>
      )}

      <div className="flex h-48 w-full items-center justify-center p-2">
        {product.image_url ? (
          <img
            alt={product.name}
            src={imageUrl(product.image_url)}
            className="max-h-full max-w-full object-contain drop-shadow-md transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-4xl text-slate-300">📷</div>
        )}
      </div>

      <h3 className="mt-4 text-center text-sm font-bold text-slate-900">
        {product.name}
      </h3>

      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-torkuGreen-50 px-4 py-1.5 text-xs font-semibold text-torkuGreen-700 transition group-hover:bg-torkuGreen-100">
        İncele <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
