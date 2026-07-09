import { api } from "../../lib/api";
import type { Paginated, Product } from "./product.types";

export type GetProductsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
};

export async function getProducts(params: GetProductsParams = {}): Promise<Paginated<Product>> {
  const { data } = await api.get<Paginated<Product>>("/products", { params });
  return data;
}

export async function getCategories(): Promise<string[]> {
  const { data } = await api.get<string[]>("/products/categories");
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export type ProductCreateRequest = {
  title: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
};

export type ProductUpdateRequest = {
  title: string;
  category: string;
  price: number;
  imageUrl?: string | null;
};

export async function createProduct(req: ProductCreateRequest): Promise<Product> {
  const { data } = await api.post<Product>("/products", req);
  return data;
}

export async function updateProduct(id: number, req: ProductUpdateRequest): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, req);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}
