import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../services/product-api";
import { CreateProductInput, UpdateProductInput } from "../types";

export function useProducts() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getProducts().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProductInput) => productApi.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productApi.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePriceHistory(productId: string | null) {
  return useQuery({
    queryKey: ["products", productId, "history"],
    queryFn: () => {
      if (!productId) return Promise.resolve([]);
      return productApi.getPriceHistory(productId).then((res) => res.data);
    },
    enabled: !!productId,
  });
}
