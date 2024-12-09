//Try to fix the SSR problem
// components/properties/DynamicMap.tsx
"use client"; // This directive marks this file as a Client Component
import { fetchPropertyDetails } from "@/utils/actions";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the map component with SSR disabled

export const DynamicaPropertyMap = dynamic(
  () => import("@/components/properties/PropertyMap"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  }
);
