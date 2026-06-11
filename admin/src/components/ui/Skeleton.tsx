import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse-brand rounded-md bg-[#E5E7EB]",
        className
      )}
    />
  );
}
