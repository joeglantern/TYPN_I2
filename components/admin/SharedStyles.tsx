import { cn } from "@/lib/utils"

export const adminPageContainer = "p-6 space-y-6"

export const adminPageHeader = "flex items-center justify-between mb-6"

export const adminPageTitle = "text-2xl font-bold tracking-tight"

export const adminPageDescription = "text-muted-foreground"

export const adminCard = "p-4 rounded-lg border bg-card"

export const adminCardHeader = "flex items-center justify-between p-4 border-b"

export const adminSearchContainer = "relative flex-1 max-w-sm"

export const adminSearchInput = "pl-8"

export const adminTableContainer = "overflow-x-auto"

export const adminStatusBadge = (status: string) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
  const statusClasses = {
    Active: "bg-primary/10 text-primary",
    Pending: "bg-yellow-100 text-yellow-700",
    Completed: "bg-primary/10 text-primary",
    Draft: "bg-gray-100 text-gray-700",
    Published: "bg-primary/10 text-primary",
  }
  return cn(baseClasses, statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-700")
}

export const adminIconContainer = "p-3 bg-primary/10 rounded-full"

export const adminStatsCard = "p-6 space-y-2"

export const adminStatsValue = "text-2xl font-bold"

export const adminStatsLabel = "text-sm text-muted-foreground"

export const adminActionButton = "flex items-center gap-2"

export const adminDropdownTrigger = "h-8 w-8 p-0"

export const adminDropdownContent = "w-[160px]" 