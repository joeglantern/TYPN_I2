"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ImagePlus, ArrowLeft } from "lucide-react"
import { uploadImage } from "@/utils/image-upload"
import { createProgram } from "@/app/actions"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateProgramPage() {
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    duration: "",
    location: "",
  })

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let media_url = ""
      if (selectedImage) {
        media_url = await uploadImage(selectedImage, {
          bucket: 'images',
          folder: 'programs',
          type: 'image'
        })
      }

      await createProgram({
        ...formData,
        media_url
      })

      toast({
        title: "Success",
        description: "Program created successfully"
      })

      router.push('/admin/programs')
      router.refresh()
    } catch (error) {
      console.error('Error creating program:', error)
      toast({
        title: "Error",
        description: "Failed to create program",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/programs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Program</h1>
            <p className="text-muted-foreground">Create and publish a new program</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter program title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter a brief description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 6 weeks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Online, New York"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            required
            className="min-h-[300px]"
            value={formData.content}
            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your program content here..."
          />
        </div>

        <div className="space-y-4">
          <Label>Featured Image</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Select Image
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>
          {previewUrl && (
            <div className="relative aspect-video w-full max-w-xl rounded-lg overflow-hidden border">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Program
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => router.push('/admin/programs')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 