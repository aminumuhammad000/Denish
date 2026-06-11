import { Skeleton } from "@/components/ui/Skeleton";

export default function TermsLoading() {
  return (
    <div className="bg-white min-h-screen pt-0 md:pt-10 animate-in fade-in duration-500">
      {/* Hero Section Skeleton */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] mt-8 md:mt-[40px] mb-[40px] md:mb-[64px]">
        <div className="relative w-full h-[200px] md:h-[409px] rounded-[20px] overflow-hidden">
          <Skeleton className="w-full h-full rounded-[20px]" />
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="w-full max-w-[800px] mx-auto px-4 pb-20 md:pb-32">
        <Skeleton className="h-[40px] w-[60%] mb-4 rounded-xl" />
        <Skeleton className="h-[20px] w-[30%] mb-12 rounded-lg" />

        <div className="space-y-6">
          <Skeleton className="h-[20px] w-full rounded-lg" />
          <Skeleton className="h-[20px] w-[90%] rounded-lg" />
          <Skeleton className="h-[20px] w-[95%] rounded-lg" />
          
          <div className="mt-8">
            <Skeleton className="h-[30px] w-[40%] mb-4 rounded-lg" />
            <Skeleton className="h-[20px] w-full mb-2 rounded-lg" />
            <Skeleton className="h-[20px] w-[80%] rounded-lg" />
          </div>

          <div className="mt-8">
            <Skeleton className="h-[30px] w-[40%] mb-4 rounded-lg" />
            <Skeleton className="h-[20px] w-full mb-2 rounded-lg" />
            <Skeleton className="h-[20px] w-[85%] rounded-lg" />
          </div>
          
          <div className="mt-8">
            <Skeleton className="h-[30px] w-[40%] mb-4 rounded-lg" />
            <Skeleton className="h-[20px] w-full mb-2 rounded-lg" />
            <Skeleton className="h-[20px] w-[75%] rounded-lg" />
          </div>
        </div>
      </div>
      
      <div className="w-full h-[300px]">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}
