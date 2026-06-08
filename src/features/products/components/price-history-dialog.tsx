"use client";

import React from "react";
import { usePriceHistory } from "../hooks/use-products";
import { X, Calendar, Loader2, TrendingUp } from "lucide-react";
import { Product } from "../types";

interface PriceHistoryDialogProps {
  product: Product;
  onClose: () => void;
}

export function PriceHistoryDialog({ product, onClose }: PriceHistoryDialogProps) {
  const { data: history, isLoading, error } = usePriceHistory(product._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden glass-panel rounded-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Price History
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tracking changes for <span className="text-slate-200 font-semibold">{product.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">Fetching price log...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400 text-sm">
              Failed to load history log.
            </div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No price history recorded.
            </div>
          ) : (
            <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-8">
              {history.map((entry, index) => {
                const date = new Date(entry.changedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                
                const isLatest = index === history.length - 1;

                return (
                  <div key={index} className="relative">
                    {/* Timeline Node */}
                    <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      isLatest 
                        ? "bg-blue-500 border-blue-500 ring-4 ring-blue-500/20" 
                        : "bg-slate-900 border-slate-700"
                    }`}>
                      {isLatest && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>

                    {/* Timeline Content */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-sm font-semibold ${isLatest ? "text-slate-100" : "text-slate-300"}`}>
                          ${entry.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{date}</span>
                        </div>
                      </div>
                      {isLatest ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Active Price
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
