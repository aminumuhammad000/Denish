import { Skeleton } from "../ui/Skeleton";

export function AdminPageSkeleton() {
  return (
    <div className="px-8 py-8 flex flex-col items-center flex-1 w-full bg-[#F8FAF9]">
      <div className="w-full max-w-[1004px] flex flex-col gap-8">
        {/* Header Block */}
        <div className="flex justify-between items-center w-full">
          <Skeleton className="w-[280px] h-[38px] rounded-[10px]" />
          <Skeleton className="w-[140px] h-[40px] rounded-[10px]" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] shadow-sm flex flex-col justify-between h-[104px]"
            >
              <Skeleton className="w-[100px] h-[16px] rounded-md" />
              <Skeleton className="w-[60px] h-[32px] rounded-lg" />
            </div>
          ))}
        </div>

        {/* Filters and Search Area */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 py-2 w-full">
          <Skeleton className="w-full md:w-[300px] h-[40px] rounded-[8px] shrink-0" />
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-[90px] h-[38px] rounded-[8px] shrink-0" />
            ))}
          </div>
        </div>

        {/* Content Table / Card List Skeleton */}
        <div className="bg-white rounded-[12px] border border-[#EAEAEA] overflow-hidden p-6 w-full flex flex-col gap-4">
          {/* Table Header row */}
          <div className="flex justify-between items-center pb-4 border-b border-[#F0F0F0]">
            <Skeleton className="w-[120px] h-[18px] rounded-md" />
            <Skeleton className="w-[160px] h-[18px] rounded-md hidden sm:block" />
            <Skeleton className="w-[100px] h-[18px] rounded-md" />
          </div>

          {/* Table Body rows */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-4 border-b border-[#F5F5F5] last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-[40px] h-[40px] rounded-full shrink-0" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="w-[150px] h-[16px] rounded-md" />
                  <Skeleton className="w-[100px] h-[12px] rounded-sm" />
                </div>
              </div>
              <Skeleton className="w-[120px] h-[16px] rounded-md hidden md:block" />
              <Skeleton className="w-[80px] h-[32px] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
