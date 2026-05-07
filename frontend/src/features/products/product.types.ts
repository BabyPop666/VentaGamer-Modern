export type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
