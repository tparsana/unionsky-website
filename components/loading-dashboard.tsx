export default function LoadingDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header skeleton */}
      <header className="flex justify-between items-center pb-6 border-b border-border">
        <div className="h-[100px] w-[250px] rounded bg-secondary animate-pulse" />
        <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
      </header>

      {/* Stats section skeleton */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-32 rounded bg-secondary animate-pulse" />
          <div className="h-9 w-64 rounded-md bg-secondary animate-pulse" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-16 rounded bg-secondary animate-pulse" />
                </div>
                <div className="h-7 w-20 rounded bg-secondary animate-pulse" />
              </div>
            ))}
        </div>
      </section>

      {/* Flights section skeleton */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-28 rounded bg-secondary animate-pulse" />
          <div className="h-6 w-20 rounded bg-secondary animate-pulse" />
        </div>

        <div className="flex flex-col gap-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border border-border rounded-md p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-secondary" />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-secondary mb-2" />
                    <div className="h-3 w-48 rounded bg-secondary" />
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="h-3 w-14 rounded bg-secondary" />
                    <div className="h-3 w-14 rounded bg-secondary" />
                    <div className="h-3 w-6 rounded bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="mt-12 pt-6 border-t border-border text-center">
        <div className="h-4 w-80 rounded bg-secondary animate-pulse mx-auto mb-2" />
        <div className="h-3 w-56 rounded bg-secondary animate-pulse mx-auto" />
      </footer>
    </div>
  )
}
