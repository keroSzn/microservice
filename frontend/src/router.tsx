import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./ui/RootLayout";
import { HomePage } from "./ui/pages/HomePage";
import { ProductPage } from "./ui/pages/ProductPage";
import { AdminLayout } from "./ui/admin/AdminLayout";
import { AdminLoginPage } from "./ui/admin/AdminLoginPage";
import { AdminProductsPage } from "./ui/admin/AdminProductsPage";
import { AdminProductDetailPage } from "./ui/admin/AdminProductDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products/:productId", element: <ProductPage /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { path: "login", element: <AdminLoginPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "products/:productId", element: <AdminProductDetailPage /> }
        ]
      }
    ]
  }
]);
