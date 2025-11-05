import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// View Component Props Interface
interface ViewProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

// View Component
export const View: React.FC<ViewProps> = ({
  children,
  isLoading = false,
  className = "",
}) => {
  if (isLoading) {
    return (
      <section
        className={cn(
          "min-h-screen flex items-center justify-center px-4 py-12",
          className
        )}
      >
        <div className="w-full max-w-3xl space-y-6 animate-pulse">
          {/* Header skeleton with shimmer effect */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3 mx-auto rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
            <Skeleton className="h-4 w-3/4 mx-auto rounded-md" />
          </div>

          {/* Content skeletons */}
          <div className="space-y-3 pt-6">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-11/12 rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>

          {/* Card skeleton */}
          <div className="pt-4">
            <Skeleton className="h-48 w-full rounded-xl shadow-sm" />
          </div>

          {/* Additional elements */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return <section className={cn("w-full", className)}>{children}</section>;
};
