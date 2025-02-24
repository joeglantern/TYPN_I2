export default function Loading() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container max-w-4xl py-12">
        <div className="animate-pulse space-y-8">
          {/* Hero Image */}
          <div className="aspect-[21/9] w-full rounded-lg bg-muted" />

          {/* Author and Date */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  )
} 