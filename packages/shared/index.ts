export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
};

export type ProductListResponse = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductPriceResponse = {
  id: number;
  price: number;
  stock: number;
};

export type UpdateProductRequest = {
  name?: string;
  description?: string;
};

export type ApiErrorResponse = {
  error: string;
};
