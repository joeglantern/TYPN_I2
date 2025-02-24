"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Dynamically import the Earth component with no SSR
const Earth3DContent = dynamic(
  () => import('./Earth3DContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
)

export default function Earth3D() {
  return (
    <div className="h-[400px] w-full">
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <Earth3DContent />
      </Suspense>
    </div>
  )
} 