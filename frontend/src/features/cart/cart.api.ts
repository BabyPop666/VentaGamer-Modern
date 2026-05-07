import { api } from "../../lib/api";
import type { Cart, Order } from "./cart.types";

export const getCart = async (): Promise<Cart> => (await api.get<Cart>("/cart")).data;

export const addItem = async (productId: number, quantity = 1): Promise<Cart> =>
  (await api.post<Cart>("/cart/items", { productId, quantity })).data;

export const updateItem = async (cartItemId: number, quantity: number): Promise<Cart> =>
  (await api.put<Cart>(`/cart/items/${cartItemId}`, { quantity })).data;

export const removeItem = async (cartItemId: number): Promise<Cart> =>
  (await api.delete<Cart>(`/cart/items/${cartItemId}`)).data;

export const clearCart = async (): Promise<void> => {
  await api.delete("/cart");
};

export const checkout = async (): Promise<Order> =>
  (await api.post<Order>("/orders/checkout")).data;

export const getOrder = async (id: number): Promise<Order> =>
  (await api.get<Order>(`/orders/${id}`)).data;

export const getMyOrders = async (): Promise<Order[]> =>
  (await api.get<Order[]>("/orders/mine")).data;

export const downloadOrderPdf = async (id: number): Promise<Blob> => {
  const res = await api.get(`/orders/${id}/pdf`, { responseType: "blob" });
  return res.data as Blob;
};
