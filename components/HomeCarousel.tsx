"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { useInterval } from "@/hooks/use-interval"
import { useRouter } from "next/navigation"

interface CarouselImage {
  id: number
  title: string
  image_url: string
  description: string
}

export function HomeCarousel() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [api, setApi] = useState<any>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function fetchCarouselImages() {
      const supabase = createClient()
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .eq('show_in_carousel', true)
        .order('created_at', { ascending: false })

      if (data) {
        setImages(data)
        setCount(data.length)
      }
    }

    fetchCarouselImages()
  }, [])

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  // Auto-advance every 5 seconds
  useInterval(() => {
    if (count > 0) {
      const next = (current + 1) % count
      scrollTo(next)
    }
  }, 5000)

  if (images.length === 0) return null

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id}>
              <div 
                className="relative aspect-[16/9] w-full cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => router.push('/gallery')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push('/gallery')
                  }
                }}
              >
                <Image
                  src={image.image_url}
                  alt={image.title || ''}
                  fill
                  className="object-cover rounded-lg"
                  priority={index === 0}
                />
                {(image.title || image.description) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:p-6 transition-opacity duration-300">
                    {image.title && image.title.toLowerCase() !== 'untitled' && (
                      <h3 className="text-white text-xl md:text-2xl font-semibold mb-2">{image.title}</h3>
                    )}
                    {image.description && (
                      <p className="text-white/90 text-sm md:text-base">{image.description}</p>
                    )}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/30 hover:bg-white/50 border-none" />
        <CarouselNext className="right-4 bg-white/30 hover:bg-white/50 border-none" />
      </Carousel>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
} 