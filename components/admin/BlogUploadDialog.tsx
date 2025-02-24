"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/utils/image-upload"
import { Loader2, ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Editor } from "@/components/editor/Editor"
import { createClient } from "@/utils/supabase/client"

interface BlogUploadDialogProps {
  onClose: () => void
}

export function BlogUploadDialog({ onClose }: BlogUploadDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("")
  const { toast } = useToast()
  const supabase = createClient()

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>, isAvatar: boolean = false) {
    const file = e.target.files?.[0]
    if (!file) return

    if (isAvatar) {
      setSelectedAvatar(file)
      setAvatarPreviewUrl(URL.createObjectURL(file))
    } else {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  function clearImage(isAvatar: boolean = false) {
    if (isAvatar) {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
      setSelectedAvatar(null)
      setAvatarPreviewUrl("")
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setSelectedImage(null)
      setPreviewUrl("")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!title.trim() || !content.trim() || !authorName.trim() || !selectedImage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a featured image",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      // Upload featured image
      let media_url
      try {
        media_url = await uploadImage(selectedImage, {
          bucket: 'images',
          folder: 'blog',
          type: 'image',
          maxSize: 10 * 1024 * 1024 // 10MB
        })
      } catch (uploadError) {
        console.error('Error uploading featured image:', uploadError)
        throw new Error('Failed to upload featured image')
      }

      // Upload author avatar if selected
      let author_avatar = null
      if (selectedAvatar) {
        try {
          author_avatar = await uploadImage(selectedAvatar, {
            bucket: 'images',
            folder: 'avatars',
            type: 'image',
            maxSize: 2 * 1024 * 1024 // 2MB
          })
        } catch (avatarError) {
          console.error('Error uploading avatar:', avatarError)
          throw new Error('Failed to upload author avatar')
        }
      }

      // Create blog post with the correct schema
      const { data, error } = await supabase
        .from('content')
        .insert([{
          title: title.trim(),
          description: description.trim(),
          type: 'blog',
          status: 'published',
          media_url,
          metadata: {
            content: content.trim(), // Store content in metadata
            author_name: authorName.trim(),
            author_avatar
          }
        }])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw new Error(error.message || 'Failed to create blog post')
      }

      if (!data) {
        throw new Error('No data returned from database')
      }

      toast({
        title: "Success",
        description: "Blog post created successfully"
      })

      onClose()
    } catch (error) {
      console.error('Error creating blog post:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollArea className="h-[80vh] pr-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter blog title"
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter blog description"
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Featured Image</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('featured-image-upload')?.click()}
              disabled={loading}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Select Image
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => clearImage(false)}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <input
              id="featured-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleImageSelect(e, false)}
              disabled={loading}
            />
          </div>
          {previewUrl && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
              <Image
                src={previewUrl}
                alt="Featured image preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author Name</Label>
          <Input
            id="author"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Enter author name"
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Author Avatar (optional)</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={loading}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Select Avatar
            </Button>
            {avatarPreviewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => clearImage(true)}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleImageSelect(e, true)}
              disabled={loading}
            />
          </div>
          {avatarPreviewUrl && (
            <div className="relative h-20 w-20 rounded-full overflow-hidden border">
              <Image
                src={avatarPreviewUrl}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <Editor
            value={content}
            onChange={setContent}
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !title || !content || !authorName || !selectedImage}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Blog Post...
            </>
          ) : (
            'Create Blog Post'
          )}
        </Button>
      </form>
    </ScrollArea>
  )
} 
