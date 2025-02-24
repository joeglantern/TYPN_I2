'use client'

import { format } from 'date-fns'
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogActions } from "../components/BlogActions"

export interface BlogPost {
  id: string
  title: string
  content: string
  description: string
  media_url?: string
  created_at: string
  metadata?: {
    author?: string
    readTime?: string
  }
}

interface BlogPostClientProps {
  post: BlogPost
}

export function BlogPostClient({ post }: BlogPostClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/blog" passHref>
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
      
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.metadata?.author && (
            <p className="text-gray-600 mb-2">
              By {post.metadata.author} · {format(new Date(post.created_at), 'MMMM d, yyyy')}
            </p>
          )}
          {post.metadata?.readTime && (
            <p className="text-gray-500">{post.metadata.readTime} min read</p>
          )}
        </header>

        {post.media_url && (
          <div className="relative w-full h-[400px] mb-8">
            <Image
              src={post.media_url}
              alt={post.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {post.content}
        </div>

        <div className="mt-8">
          <BlogActions post={post} />
        </div>
      </article>
    </div>
  )
} 
