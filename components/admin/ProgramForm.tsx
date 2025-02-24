"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/utils/image-upload"
import { Loader2, ImagePlus } from "lucide-react"
import Image from "next/image"

interface ProgramFormProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: any
}

export function ProgramForm({ onSubmit, initialData }: ProgramFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    objectives: initialData?.objectives || "",
    requirements: initialData?.requirements || "",
    duration: initialData?.duration || "",
    location: initialData?.location || "",
    media_url: initialData?.media_url || "",
    type: "program"
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(initialData?.media_url || "")

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
      let media_url = formData.media_url

      if (selectedImage) {
        media_url = await uploadImage(selectedImage, 'programs')
      }

      await onSubmit({
        ...formData,
        media_url
      })
    } catch (error) {
      console.error('Error submitting program:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Program Title</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            required
            value={formData.duration}
            onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="e.g., 6 weeks, 3 months"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            required
            value={formData.location}
            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Online, New York, Global"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objectives">Program Objectives</Label>
        <Textarea
          id="objectives"
          required
          value={formData.objectives}
          onChange={e => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
          placeholder="List the main objectives of the program"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={e => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
          placeholder="List any prerequisites or requirements"
        />
      </div>

      <div className="space-y-2">
        <Label>Program Image</Label>
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
          <div className="relative aspect-video w-full max-w-xl mt-4 rounded-lg overflow-hidden">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Update' : 'Create'} Program
      </Button>
    </form>
  )
} 