"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ImageIcon,
  Search, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2
} from "lucide-react"
import Image from "next/image"
import { Gallery, fetchGalleryItems, deleteGalleryItem, createContent } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { updateGalleryItem } from "@/app/actions"

export default function GalleryPage() {
  const router = useRouter()
  const [galleryItems, setGalleryItems] = useState<Gallery[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Gallery | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  async function loadGalleryItems() {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', 'gallery')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGalleryItems(data || [])
    } catch (error) {
      console.error('Error loading gallery items:', error)
      if (error instanceof Error && error.message === 'Not authenticated') {
        router.replace('/login')
        return
      }
      setError('Failed to load gallery items')
      toast({
        title: "Error",
        description: "Failed to load gallery items. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // Check authentication first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      loadGalleryItems()
    }).catch(error => {
      console.error('Session error:', error)
      router.replace('/login')
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  async function handleSubmit(data: any) {
    if (isUploading) return false
    
    try {
      setIsUploading(true)
      
      if (editingItem) {
        // Update existing item
        await updateGalleryItem(editingItem.id, {
          title: data.title || '',
          description: data.description || '',
          show_in_carousel: data.show_in_carousel || false
        })
      } else {
        // Create new item
        const { error } = await supabase
          .from('content')
          .insert([{
            ...data,
            type: 'gallery',
            status: 'published',
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Refresh the gallery items
      await loadGalleryItems()
      
      toast({
        title: "Success",
        description: editingItem ? "Image updated successfully" : "Image uploaded successfully"
      })

      setDialogOpen(false)
      setEditingItem(null)
      return true
    } catch (error) {
      console.error(editingItem ? 'Error updating gallery item:' : 'Error creating gallery item:', error)
      toast({
        title: "Error",
        description: editingItem ? "Failed to update image" : "Failed to upload image",
        variant: "destructive"
      })
      return false
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDeleteItem(id: number) {
    if (isDeleting === id) return
    
    try {
      setIsDeleting(id)
      await deleteGalleryItem(id)
      setGalleryItems(items => items.filter(item => item.id !== id))
      toast({
        title: "Success",
        description: "Gallery item deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      toast({
        title: "Error",
        description: "Failed to delete gallery item",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  function handleEdit(item: Gallery) {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const filteredItems = galleryItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">{error}</p>
          <Button 
            onClick={loadGalleryItems}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Gallery</h1>
          {!isLoading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={loadGalleryItems}
              className="hover:bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingItem ? "Updating..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {editingItem ? "Update Image" : "Add Image"}
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Gallery Item" : "Upload to Gallery"}</DialogTitle>
              <DialogDescription>
                {editingItem 
                  ? "Update the details of your gallery item."
                  : "Upload images to your gallery. You can add multiple images at once."
                }
              </DialogDescription>
            </DialogHeader>
            <GalleryUploadForm onSubmit={handleSubmit} editingItem={editingItem} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search gallery..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading gallery items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.show_in_carousel && (
                      <span className="text-xs text-muted-foreground">
                        Shows in carousel
                      </span>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isDeleting === item.id}
                      >
                        {isDeleting === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
          {!isLoading && filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No gallery items found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "Add some items to get started"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 