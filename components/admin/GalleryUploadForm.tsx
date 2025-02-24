"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { uploadImage } from "@/utils/image-upload"
import { Loader2, ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Gallery } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GalleryUploadFormProps {
  onSubmit: (data: any) => Promise<boolean>
  editingItem?: Gallery | null
}

interface ImageUpload {
  file: File
  previewUrl: string
  title: string
  description: string
  showInCarousel: boolean
}

export function GalleryUploadForm({ onSubmit, editingItem }: GalleryUploadFormProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showInCarousel, setShowInCarousel] = useState(false)
  const [selectedImages, setSelectedImages] = useState<ImageUpload[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "")
      setDescription(editingItem.description || "")
      setShowInCarousel(editingItem.show_in_carousel || false)
      setSelectedImages([])
    } else {
      setTitle("")
      setDescription("")
      setShowInCarousel(false)
      setSelectedImages([])
    }
  }, [editingItem])

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      title: "",
      description: "",
      showInCarousel: false
    }))

    setSelectedImages(prev => [...prev, ...newImages])
  }

  function handleRemoveImage(index: number) {
    setSelectedImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].previewUrl)
      newImages.splice(index, 1)
      return newImages
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!editingItem && selectedImages.length === 0) return

    try {
      setLoading(true)

      if (editingItem) {
        // Update existing item
        const success = await onSubmit({
          title,
          description,
          show_in_carousel: showInCarousel
        })

        if (success) {
          setTitle("")
          setDescription("")
          setShowInCarousel(false)
        }
      } else {
        // Upload multiple images
      let successCount = 0
        for (const image of selectedImages) {
          try {
            const media_url = await uploadImage(image.file, {
              bucket: 'gallery',
              type: 'image',
              maxSize: 10 * 1024 * 1024 // 10MB
            })
          
          if (!media_url) {
              throw new Error('Failed to upload image')
            }

            const success = await onSubmit({
              title: image.title || title || '',
              description: image.description || description || '',
            media_url,
              show_in_carousel: image.showInCarousel || showInCarousel
            })

            if (success) successCount++
          } catch (error) {
            console.error('Error uploading image:', error)
          }
        }

        if (successCount > 0) {
          toast({
            title: "Success",
            description: `Successfully uploaded ${successCount} of ${selectedImages.length} images`
          })
          setTitle("")
          setDescription("")
          setShowInCarousel(false)
          setSelectedImages([])
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: editingItem 
          ? "Failed to update image. Please try again."
          : "Failed to upload images. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
    <form onSubmit={handleSubmit} className="space-y-6">
        {!editingItem && (
          <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
                onClick={() => document.getElementById('gallery-image-upload')?.click()}
            disabled={loading}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Select Images
          </Button>
          <input
            id="gallery-image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
                disabled={loading}
          />
        </div>

            {selectedImages.length > 0 && (
              <div className="space-y-6">
                {selectedImages.map((image, index) => (
                  <div key={index} className="space-y-4 border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">Image {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveImage(index)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                  <Image
                        src={image.previewUrl}
                        alt="Preview"
                    fill
                    className="object-cover"
                  />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Title (optional)</Label>
                        <Input
                          value={image.title}
                          onChange={e => {
                            const newImages = [...selectedImages]
                            newImages[index].title = e.target.value
                            setSelectedImages(newImages)
                          }}
                          placeholder="Enter image title"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label>Description (optional)</Label>
                        <Textarea
                          value={image.description}
                          onChange={e => {
                            const newImages = [...selectedImages]
                            newImages[index].description = e.target.value
                            setSelectedImages(newImages)
                          }}
                          placeholder="Enter image description"
                          disabled={loading}
                        />
                </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={image.showInCarousel}
                          onCheckedChange={checked => {
                            const newImages = [...selectedImages]
                            newImages[index].showInCarousel = checked as boolean
                            setSelectedImages(newImages)
                          }}
                  disabled={loading}
                        />
                        <Label>Show in homepage carousel</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {editingItem && (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter image title"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter image description"
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-in-carousel"
                checked={showInCarousel}
                onCheckedChange={(checked) => setShowInCarousel(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="show-in-carousel">Show in homepage carousel</Label>
            </div>

            <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
              <Image
                src={editingItem.image_url}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          </>
        )}

        {/* Default title and description for batch upload */}
        {!editingItem && selectedImages.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Default values for all images</h3>
            <div className="space-y-2">
              <Label htmlFor="default-title">Default Title</Label>
              <Input
                id="default-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter default title"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-description">Default Description</Label>
              <Textarea
                id="default-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter default description"
                disabled={loading}
              />
      </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="default-show-in-carousel"
                checked={showInCarousel}
                onCheckedChange={(checked) => setShowInCarousel(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="default-show-in-carousel">Show all in homepage carousel</Label>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || (!editingItem && selectedImages.length === 0)}
          className="w-full"
        >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editingItem ? "Updating..." : "Uploading..."}
          </>
        ) : (
            editingItem ? 'Update Image' : `Upload ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''}`
        )}
      </Button>
    </form>
    </ScrollArea>
  )
} 