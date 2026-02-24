export default function LoadingDashboard() {
  return (
    <div className="mx-auto w-full max-w-[92rem] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <section className="rounded-[2rem] bg-primary px-5 pb-16 pt-5 sm:px-8 sm:pb-20 sm:pt-7 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="h-10 w-32 rounded-lg bg-white/20 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-16 rounded-full bg-white/20 animate-pulse sm:w-20" />
            <div className="h-9 w-24 rounded-full bg-white/20 animate-pulse sm:w-32" />
          </div>
        </header>

        <div className="mt-8 lg:mt-10">
          <div className="mb-3 h-3 w-44 rounded-full bg-white/20 animate-pulse" />
          <div className="h-12 w-[640px] max-w-full rounded-xl bg-white/20 animate-pulse" />
        </div>
      </section>

      <section className="-mt-6 rounded-[2rem] border border-border bg-card px-4 pb-8 pt-10 sm:-mt-8 sm:px-7 sm:pb-10 sm:pt-12 lg:px-10">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-muted animate-pulse" />
              <div>
                <div className="mb-2 h-5 w-36 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-52 rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
          </div>

          <div className="flex flex-col gap-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-background/80 p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                    <div className="flex-1">
                      <div className="mb-2 h-5 w-36 rounded-lg bg-muted animate-pulse" />
                      <div className="h-3.5 w-52 rounded-lg bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="mt-10 border-t border-border pt-10">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-muted animate-pulse" />
              <div className="h-8 w-52 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-full max-w-[360px] rounded-full bg-muted animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="rounded-2xl border border-border p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
                    <div className="h-3 w-20 rounded-lg bg-muted animate-pulse" />
                  </div>
                  <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
                </div>
              ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-border pt-6">
          <div className="mx-auto h-4 w-80 max-w-full rounded-lg bg-muted animate-pulse" />
          <div className="mx-auto mt-2.5 h-3 w-56 max-w-full rounded-lg bg-muted animate-pulse" />
        </footer>
      </section>
    </div>
  )
}
