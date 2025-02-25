"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"

interface CarouselItem {
  id: number
  title: string
  description: string
  media_url: string
  media_type: 'image' | 'video'
  thumbnail_url?: string
  link_url?: string
  link_text?: string
  status: 'Published' | 'Draft'
  order_index: number
}

export default function CarouselPage() {
  const [items, setItems] = useState<CarouselItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadCarouselItems()
  }, [])

  async function loadCarouselItems() {
    try {
      const { data, error } = await supabase
        .from('carousel')
        .select('*')
        .order('order_index')

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load carousel items",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave(formData: FormData) {
    try {
      const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        media_url: formData.get('media_url') as string,
        media_type: formData.get('media_type') as 'image' | 'video',
        thumbnail_url: formData.get('thumbnail_url') as string,
        link_url: formData.get('link_url') as string,
        link_text: formData.get('link_text') as string,
        status: formData.get('status') as 'Published' | 'Draft',
        order_index: items.length
      }

      if (isEditing) {
        const { error } = await supabase
          .from('carousel')
          .update(data)
          .eq('id', isEditing)

        if (error) throw error
        toast({ title: "Success", description: "Item updated successfully" })
      } else {
        const { error } = await supabase
          .from('carousel')
          .insert(data)

        if (error) throw error
        toast({ title: "Success", description: "Item added successfully" })
      }

      setIsEditing(null)
      loadCarouselItems()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save carousel item",
        variant: "destructive"
      })
    }
  }

  async function handleDelete(id: number) {
    try {
      const { error } = await supabase
        .from('carousel')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: "Success", description: "Item deleted successfully" })
      loadCarouselItems()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete carousel item",
        variant: "destructive"
      })
    }
  }

  async function handleMoveItem(id: number, direction: 'up' | 'down') {
    const currentIndex = items.findIndex(item => item.id === id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === items.length - 1)
    ) {
      return
    }

    const newItems = [...items]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const [movedItem] = newItems.splice(currentIndex, 1)
    newItems.splice(targetIndex, 0, movedItem)

    const updates = newItems.map((item, index) => ({
      id: item.id,
      order_index: index
    }))

    try {
      const { error } = await supabase
        .from('carousel')
        .upsert(updates)

      if (error) throw error
      setItems(newItems)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item order",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Carousel Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Carousel Item</DialogTitle>
            </DialogHeader>
            <form action={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media_type">Media Type</Label>
                <Select name="media_type" defaultValue="image">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="media_url">Media URL</Label>
                <Input id="media_url" name="media_url" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL (for videos)</Label>
                <Input id="thumbnail_url" name="thumbnail_url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL</Label>
                <Input id="link_url" name="link_url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_text">Link Text</Label>
                <Input id="link_text" name="link_text" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="Draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <Card key={item.id} className="group relative">
            <CardHeader>
              <CardTitle className="line-clamp-1">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {item.media_type === 'image' ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={item.media_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <video
                    src={item.media_url}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveItem(item.id, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveItem(item.id, 'down')}
                  disabled={index === items.length - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(item.id)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 