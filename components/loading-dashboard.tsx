import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingDashboard() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center py-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-48" />
      </header>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-10 w-64 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="bg-black/50 backdrop-blur-sm border-indigo-900/50">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-7 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="bg-black/50 backdrop-blur-sm border-indigo-900/50">
                <CardContent className="p-6 h-64 flex flex-col gap-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      <footer className="mt-8 pt-6 border-t border-indigo-900/30 text-center">
        <Skeleton className="h-4 w-80 mx-auto mb-2" />
        <Skeleton className="h-3 w-64 mx-auto" />
      </footer>
    </div>
  )
}
