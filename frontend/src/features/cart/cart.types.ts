export type CartItem = {
  cartItemId: number;
  productId: number;
  productTitle: string;
  category: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Cart = {
  id: number;
  items: CartItem[];
  total: number;
};

export type Order = {
  id: number;
  orderNumber: string;
  placedAtUtc: string;
  total: number;
  customerUsername: string;
  items: {
    productId: number;
    productTitle: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};
