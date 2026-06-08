"use client";

import React, { useState } from "react";
import { useProducts } from "@/features/products/hooks/use-products";
import { ProductTable } from "@/features/products/components/product-table";
import { ProductForm } from "@/features/products/components/product-form";
import { PriceHistoryDialog } from "@/features/products/components/price-history-dialog";
import { Product } from "@/features/products/types";
import { ProductFormValues } from "@/features/products/validation/product-schema";
import { Plus, Loader2, Package } from "lucide-react";

export default function ProductsPage() {
  const {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setActionError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setActionError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const input = {
        ...values,
        date: values.date || undefined,
      };

      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id,
          input,
        });
      } else {
        await createProduct(input);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      setActionError(err.message || "An error occurred while saving the product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete product.");
      }
    }
  };

  return (
    <main className="flex-1 min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header Panel */}
      <div className="glass-panel rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            Products Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Manage your item listings, baseline prices, and track automatic price modification history.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Main Listing Panel */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="w-10 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Loading products catalog...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 border border-red-500/20 bg-red-500/5 rounded-2xl">
            <p className="font-semibold text-lg">Unable to fetch products</p>
            <p className="text-sm text-slate-400 mt-2">
              Please check if the backend API server is running on port 5001.
            </p>
          </div>
        ) : (
          <ProductTable
            products={products}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onViewHistory={setHistoryProduct}
          />
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden glass-panel rounded-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">
                {editingProduct ? "Modify Product details" : "Register New Product"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {editingProduct ? "Editing details for product" : "Provide name and starting baseline price"}
              </p>
            </div>
            
            <div className="p-6">
              {actionError && (
                <div className="mb-4 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
                  {actionError}
                </div>
              )}
              
              <ProductForm
                product={editingProduct || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Price History Dialog */}
      {historyProduct && (
        <PriceHistoryDialog
          product={historyProduct}
          onClose={() => setHistoryProduct(null)}
        />
      )}
    </main>
  );
}
