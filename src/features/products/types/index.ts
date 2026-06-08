export interface PriceHistoryEntry {
  price: number;
  changedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  priceHistory: PriceHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  date?: string;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  date?: string;
}

