"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage, validateFile } from "@/utils/image-upload"
import { Loader2, ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import 'react-quill/dist/quill.snow.css'

interface BlogPostFormProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: any
}

export function BlogPostForm({ onSubmit, initialData }: BlogPostFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    media_url: initialData?.media_url || "",
    type: "blog"
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(initialData?.media_url || "")
  const [ReactQuill, setReactQuill] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-quill').then((mod) => {
        setReactQuill(() => mod.default)
      })
    }
  }, [])

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await validateFile(file, { type: 'image' })
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to select image",
        variant: "destructive"
      })
      e.target.value = ''
    }
  }

  function clearImage() {
    setSelectedImage(null)
    setPreviewUrl("")
    if (formData.media_url) {
      setFormData(prev => ({ ...prev, media_url: "" }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.description.trim()) throw new Error('Description is required')
      if (!formData.content.trim()) throw new Error('Content is required')

      let media_url = formData.media_url

      if (selectedImage) {
        try {
          media_url = await uploadImage(selectedImage, {
            bucket: 'images',
            folder: 'blog',
            type: 'image',
            maxSize: 10 * 1024 * 1024
          })
        } catch (error) {
          throw error
        }
      }

      await onSubmit({
        ...formData,
        media_url,
        type: 'blog'
      })

      setFormData({
        title: "",
        description: "",
        content: "",
        media_url: "",
        type: "blog"
      })
      setSelectedImage(null)
      setPreviewUrl("")

      toast({
        title: "Success",
        description: `Blog post ${initialData ? 'updated' : 'created'} successfully`
      })
    } catch (error) {
      console.error('Form submission failed:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog post",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter blog post title"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          required
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter a brief description"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <div className="border rounded-md bg-white">
          {ReactQuill ? (
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
              modules={modules}
              className="min-h-[400px]"
              placeholder="Write your blog post content here..."
            />
          ) : (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
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
          {(previewUrl || formData.media_url) && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
        {previewUrl && (
          <div className="relative aspect-video w-full max-w-xl mt-4 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Recommended size: 1200x630px. Maximum size: 10MB. Supported formats: JPG, PNG, GIF, WebP
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Update' : 'Create'} Blog Post
      </Button>
    </form>
  )
} 