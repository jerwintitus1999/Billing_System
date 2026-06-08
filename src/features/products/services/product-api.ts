import { apiClient } from "@/lib/api-client";
import { Product, CreateProductInput, UpdateProductInput, PriceHistoryEntry } from "../types";

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const productApi = {
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    return apiClient.get("/products/get-all");
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return apiClient.get(`/products/${id}`);
  },

  createProduct: async (input: CreateProductInput): Promise<ApiResponse<Product>> => {
    return apiClient.post("/products", input);
  },

  updateProduct: async (id: string, input: UpdateProductInput): Promise<ApiResponse<Product>> => {
    return apiClient.put(`/products/${id}`, input);
  },

  deleteProduct: async (id: string): Promise<ApiResponse<Product>> => {
    return apiClient.delete(`/products/${id}`);
  },

  getPriceHistory: async (id: string): Promise<ApiResponse<PriceHistoryEntry[]>> => {
    return apiClient.get(`/products/${id}/price-history`);
  },
};
