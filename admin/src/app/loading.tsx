import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-white pb-20 animate-in fade-in duration-500">
      {/* Hero Section Skeleton */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] mt-8 md:mt-[40px] mb-[40px] md:mb-[64px]">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12 md:gap-[58px]">
          {/* Left Column (Text & Buttons) */}
          <div className="w-full max-w-[638px] flex flex-col gap-6">
            <Skeleton className="h-[60px] md:h-[80px] w-[80%] rounded-xl" />
            <Skeleton className="h-[40px] md:h-[50px] w-[60%] rounded-xl" />
            <Skeleton className="h-[100px] w-[90%] mt-4 rounded-xl" />
            
            <div className="flex flex-row gap-4 mt-6">
              <Skeleton className="h-[60px] w-[180px] rounded-xl" />
              <Skeleton className="h-[60px] w-[180px] rounded-xl" />
            </div>
          </div>
          
          {/* Right Column (Image/Card) */}
          <div className="w-full md:w-[620px] h-[300px] md:h-[500px]">
            <Skeleton className="w-full h-full rounded-[24px]" />
          </div>
        </div>
      </div>

      {/* Content Sections Skeleton */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] mt-20">
        <div className="flex flex-col items-center gap-6 mb-16">
          <Skeleton className="h-[40px] w-[300px] rounded-xl" />
          <Skeleton className="h-[20px] w-[500px] rounded-xl" />
        </div>
        
        {/* Grid of Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[300px] w-full rounded-[20px]" />
          <Skeleton className="h-[300px] w-full rounded-[20px]" />
          <Skeleton className="h-[300px] w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
