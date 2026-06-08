"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "../validation/product-schema";
import { Product } from "../types";
import { Loader2, DollarSign, Calendar } from "lucide-react";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price !== undefined ? product.price : "" as any,
      date: product?.priceHistory && product.priceHistory.length > 0
        ? new Date(new Date(product.priceHistory[product.priceHistory.length - 1].changedAt).getTime() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Product Name
        </label>
        <input
          type="text"
          placeholder="e.g. Intel Core i9 Processor"
          {...register("name")}
          className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
            errors.name ? "border-red-500/50" : "border-slate-800"
          }`}
        />
        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Product Price */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Base Price ($)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <DollarSign className="w-4 h-4" />
          </span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("price", {
    valueAsNumber: true,
  })}
            className={`w-full pl-10 pr-4 py-3 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
              errors.price ? "border-red-500/50" : "border-slate-800"
            }`}
          />
        </div>
        {errors.price && (
          <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
        )}
      </div>

      {/* Effective Date */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Effective Date (Optional)
        </label>
        <input
          type="datetime-local"
          {...register("date")}
          className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
            errors.date ? "border-red-500/50" : "border-slate-800"
          }`}
        />
        {errors.date && (
          <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Product</span>
          )}
        </button>
      </div>
    </form>
  );
}
