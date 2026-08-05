import { Skeleton, LoadingCard } from '@/components/ui/states'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <LoadingCard />
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-40 w-64 shrink-0" />
        <Skeleton className="h-40 w-64 shrink-0" />
      </div>
    </div>
  )
}
