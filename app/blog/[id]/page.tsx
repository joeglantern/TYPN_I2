import { createClient } from "@/utils/supabase/server"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogActions } from "../components/BlogActions"

export const revalidate = 3600

export default async function BlogPost({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: post, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', params.id)
    .eq('type', 'blog')
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full">
        {post.media_url ? (
          <>
            <Image
              src={post.media_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />
          </>
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        
        {/* Navigation and Actions */}
        <div className="absolute top-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button variant="outline" size="sm" asChild className="bg-background/30 hover:bg-background/40 backdrop-blur-sm transition-colors">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>

              <BlogActions 
                title={post.title}
                description={post.description}
                content={post.metadata?.content || ''}
                metadata={post.metadata}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl -mt-32 relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-card border rounded-lg shadow-lg p-6 sm:p-8 lg:p-10 mb-8">
          {/* Author and Date */}
          <div className="flex items-center gap-3 mb-6">
            {post.metadata?.author_avatar ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-background">
                <Image
                  src={post.metadata.author_avatar}
                  alt={post.metadata.author_name || 'Author'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                <span className="text-xl font-semibold">
                  {post.metadata?.author_name?.[0] || 'A'}
                </span>
              </div>
            )}
            <div>
              <div className="font-medium text-base sm:text-lg">
                {post.metadata?.author_name || 'Anonymous'}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-balance">{post.title}</h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            {post.description}
          </p>
        </div>

        {/* Content */}
        {post.metadata?.content && (
          <div 
            className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none mb-16"
            dangerouslySetInnerHTML={{ __html: post.metadata.content }}
          />
        )}
      </div>
    </article>
  )
} 