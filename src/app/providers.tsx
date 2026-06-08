"use client";

import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient as defaultQueryClient } from "@/lib/query-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Using useState to avoid sharing a single client instance if server rendered
  const [queryClient] = useState(() => defaultQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
