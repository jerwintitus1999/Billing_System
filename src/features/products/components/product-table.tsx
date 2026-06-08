"use client";

import React, { useState } from "react";
import { Product } from "../types";
import { Edit, Trash2, History, Calendar, Search } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewHistory: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onDelete, onViewHistory }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center gap-3 max-w-md bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
        <Search className="w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-sm text-slate-200 focus:outline-none w-full placeholder-slate-500"
        />
      </div>

      {/* Table Shell */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs uppercase font-bold tracking-wider">
              <th className="py-4 px-6">Product Details</th>
              <th className="py-4 px-6 text-right">Current Price</th>
              <th className="py-4 px-6">Created On</th>
              <th className="py-4 px-6">Price History Points</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  {searchTerm ? "No matching products found." : "No products available. Add one to get started!"}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const createdDate = new Date(product.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr
                    key={product._id}
                    className="hover:bg-slate-800/35 transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {product.name}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 text-right font-bold text-emerald-400">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Creation Date */}
                    <td className="py-4 px-6 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{createdDate}</span>
                      </div>
                    </td>

                    {/* Price History Log count */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => onViewHistory(product)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>{product.priceHistory?.length || 1} logs</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
