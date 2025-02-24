"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Eye, EyeOff, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { ProgramForm } from "@/components/admin/ProgramForm"
import { GalleryForm } from "@/components/admin/GalleryForm"
import { logActivity } from "@/utils/activity-logger"
import Image from "next/image"

interface ContentItem {
  id: string
  title: string
  description: string
  type: 'blog' | 'program' | 'gallery'
  status: 'draft' | 'published'
  media_url: string
  media_urls?: string[]
  created_at: string
}

export default function ContentManagement() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedType, setSelectedType] = useState<'blog' | 'program' | 'gallery'>('blog')
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: "Error",
        description: "Failed to fetch content items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: any) {
    try {
      console.log('Starting content creation with data:', { ...data, type: selectedType })

      // Validate required fields
      if (!data.title || !data.description || !data.content) {
        throw new Error('Please fill in all required fields')
      }

      // Prepare the content data
      const contentData = {
        title: data.title.trim(),
        description: data.description.trim(),
        content: data.content.trim(),
        media_url: data.media_url || null,
        type: data.type || selectedType, // Allow override from form but fallback to selected
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Inserting content with data:', contentData)

      // Create the content item
      const { data: newContent, error: insertError } = await supabase
        .from('content')
        .insert([contentData])
        .select()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(`Failed to create content: ${insertError.message}`)
      }

      if (!newContent || newContent.length === 0) {
        throw new Error('Failed to create content - no data returned')
      }

      const createdContent = newContent[0]
      console.log('Content created successfully:', createdContent)

      // Update local state immediately
      setItems(prev => [createdContent, ...prev])

      // Log activity
      try {
        await logActivity({
          title: "Content Created",
          description: `New ${contentData.type} "${contentData.title}" created`,
          type: contentData.type
        })
      } catch (error) {
        console.error('Error logging activity:', error)
        // Don't throw here as content was created successfully
      }

      toast({
        title: "Success",
        description: `${contentData.type} created successfully`
      })

      setDialogOpen(false)
      return createdContent // Return the created content
    } catch (error) {
      console.error('Error creating content:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create content",
        variant: "destructive"
      })
      throw error // Re-throw to prevent dialog from closing on error
    }
  }

  async function toggleStatus(item: ContentItem) {
    try {
      const newStatus = item.status === 'draft' ? 'published' : 'draft'
      const { error } = await supabase
        .from('content')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (error) throw error

      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: newStatus } : i
      ))

      await logActivity({
        title: "Content Status Updated",
        description: `${item.type} "${item.title}" ${newStatus}`,
        type: 'program'
      })

      toast({
        title: "Success",
        description: `Content ${newStatus} successfully`
      })
    } catch (error) {
      console.error('Error updating content status:', error)
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive"
      })
    }
  }

  async function deleteContent(id: string) {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(prev => prev.filter(item => item.id !== id))

      await logActivity({
        title: "Content Deleted",
        description: "Content item was deleted",
        type: 'program'
      })

      toast({
        title: "Success",
        description: "Content deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting content:', error)
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Content Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="blog" onValueChange={(value) => setSelectedType(value as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="blog">Blog Post</TabsTrigger>
                <TabsTrigger value="program">Program</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="blog">
                <BlogPostForm onSubmit={handleSubmit} />
              </TabsContent>
              <TabsContent value="program">
                <ProgramForm onSubmit={handleSubmit} />
              </TabsContent>
              <TabsContent value="gallery">
                <GalleryForm onSubmit={handleSubmit} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="program">Programs</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ContentGrid
            items={items}
            onToggleStatus={toggleStatus}
            onDelete={deleteContent}
          />
        </TabsContent>

        {['blog', 'program', 'gallery'].map(type => (
          <TabsContent key={type} value={type} className="mt-4">
            <ContentGrid
              items={items.filter(item => item.type === type)}
              onToggleStatus={toggleStatus}
              onDelete={deleteContent}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ContentGrid({ 
  items, 
  onToggleStatus, 
  onDelete 
}: { 
  items: ContentItem[]
  onToggleStatus: (item: ContentItem) => void
  onDelete: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No content items found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <Card key={item.id} className="p-4">
          {item.media_url && (
            <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
              <Image
                src={item.media_url}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          {item.media_urls && item.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {item.media_urls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`${item.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{item.title}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(item)}
                >
                  {item.status === 'draft' ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="capitalize">{item.type}</span>
              <span>•</span>
              <span className="capitalize">{item.status}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 