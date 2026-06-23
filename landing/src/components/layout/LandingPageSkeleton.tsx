import { Skeleton } from "../ui/Skeleton";

export function LandingPageSkeleton() {
  return (
    <div className="w-full bg-white">
      <main>
        {/* Hero Section Skeleton */}
        <section className="pt-[70px] lg:pt-[60px] pb-12 lg:pb-[110px] px-4 lg:px-[100px] max-w-[1440px] mx-auto overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-[58px]">
            <div className="w-full max-w-[638px] space-y-6">
              <Skeleton className="w-full max-w-[500px] h-12 md:h-20" />
              <Skeleton className="w-full max-w-[400px] h-6 md:h-10" />
              <Skeleton className="w-full max-w-[544px] h-24" />
              <div className="flex space-x-4">
                <Skeleton className="w-[130px] sm:w-[180px] h-[40px] sm:h-[54px]" />
                <Skeleton className="w-[130px] sm:w-[180px] h-[40px] sm:h-[54px]" />
              </div>
            </div>
            <Skeleton className="w-full lg:max-w-[544px] aspect-square lg:aspect-544/632 rounded-[12px]" />
          </div>
        </section>

        {/* Value Prop Row Skeleton */}
        <div className="w-full bg-[#F2F4F3] py-8 md:py-[50px] px-4 lg:px-[100px]">
          <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 justify-center md:justify-start">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-24 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Categories/Essentials Section Skeleton */}
        <section className="py-16 lg:py-[113px] px-4 lg:px-[100px] max-w-[1216px] mx-auto">
          <div className="flex flex-col items-center mb-10 lg:mb-[64px]">
            <Skeleton className="w-[280px] h-10 mb-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-[43px]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-square rounded-[16px]" />
                <Skeleton className="w-3/4 h-6 mx-auto" />
              </div>
            ))}
          </div>
        </section>

        {/* Key Features Section Skeleton */}
        <section className="py-16 lg:py-[118px] bg-[#F1F3F2] px-4 lg:px-0">
          <div className="max-w-[1216px] mx-auto">
             <div className="flex flex-col items-center mb-10 lg:mb-[64px]">
               <Skeleton className="w-[200px] h-10 mb-4" />
               <Skeleton className="w-[400px] h-6" />
             </div>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-[32px]">
               {[...Array(8)].map((_, i) => (
                 <Skeleton key={i} className="w-full h-[280px] rounded-[12px]" />
               ))}
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
