export default function LoadingDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header skeleton */}
      <header className="flex justify-between items-center pb-6">
        <div className="h-[100px] w-[250px] rounded-2xl bg-secondary animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-20 rounded-full bg-hover-green animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-secondary animate-pulse" />
        </div>
      </header>

      {/* Flights section skeleton */}
      <section className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-hover-purple animate-pulse" />
            <div>
              <div className="h-5 w-32 rounded-lg bg-secondary animate-pulse mb-1.5" />
              <div className="h-3 w-44 rounded-lg bg-secondary animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-24 rounded-full bg-hover-blue animate-pulse" />
        </div>

        <div className="flex flex-col gap-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary" />
                  <div className="flex-1">
                    <div className="h-5 w-36 rounded-lg bg-secondary mb-2" />
                    <div className="h-3.5 w-52 rounded-lg bg-secondary" />
                  </div>
                  <div className="hidden sm:block h-9 w-32 rounded-full bg-secondary" />
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Stats section skeleton */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-hover-blue animate-pulse" />
            <div className="h-5 w-36 rounded-lg bg-secondary animate-pulse" />
          </div>
          <div className="h-10 w-72 rounded-full bg-secondary animate-pulse" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary animate-pulse" />
                  <div className="h-3 w-16 rounded-lg bg-secondary animate-pulse" />
                </div>
                <div className="h-8 w-24 rounded-lg bg-secondary animate-pulse" />
              </div>
            ))}
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="mt-16 pt-6 border-t border-border text-center">
        <div className="h-4 w-80 rounded-lg bg-secondary animate-pulse mx-auto mb-2.5" />
        <div className="h-3 w-56 rounded-lg bg-secondary animate-pulse mx-auto" />
      </footer>
    </div>
  )
}
