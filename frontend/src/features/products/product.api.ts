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
