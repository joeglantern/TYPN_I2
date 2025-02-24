'use client'

import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

type BlogPost = {
  id: string
  title: string
  description: string
  media_url?: string
  created_at: string
  metadata: {
    content?: string
    author_name?: string
    author_avatar?: string | null
  } | null
}

export default function BlogList({ posts = [] }: { posts: BlogPost[] }) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No Blog Posts Yet</h2>
          <p className="text-muted-foreground">Check back soon for new content!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Latest Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <Link href={`/blog/${post.id}`} className="block h-full">
              <CardHeader className="p-0">
                <div className="relative aspect-video w-full">
                  {post.media_url ? (
                    <Image
                      src={post.media_url}
                      alt={post.title || 'Blog post image'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {post.metadata?.author_avatar ? (
                    <div className="relative h-6 w-6 rounded-full overflow-hidden ring-2 ring-background">
                      <Image
                        src={post.metadata.author_avatar}
                        alt={post.metadata.author_name || 'Author'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                      <span className="text-xs font-semibold">
                        {post.metadata?.author_name?.[0] || 'A'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {post.metadata?.author_name || 'Anonymous'}
                    </span>
                    •
                    <span>
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {post.description}
                </p>
                
                <div className="flex items-center text-sm text-primary font-medium">
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
} 