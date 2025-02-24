"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

interface CarouselImage {
  id: number
  title: string
  image_url: string
  description: string
}

export function HomeCarousel() {
  const [images, setImages] = useState<CarouselImage[]>([])

  useEffect(() => {
    async function fetchCarouselImages() {
      const supabase = createClient()
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .eq('show_in_carousel', true)
        .order('created_at', { ascending: false })

      if (data) setImages(data)
    }

    fetchCarouselImages()
  }, [])

  if (images.length === 0) return null

  return (
    <Carousel className="w-full max-w-5xl mx-auto">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={image.image_url}
                alt={image.title}
                fill
                className="object-cover rounded-lg"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                {image.description && (
                  <p className="text-white/90 text-sm mt-1">{image.description}</p>
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
} 