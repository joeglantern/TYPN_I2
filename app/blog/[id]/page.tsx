import { supabase } from '@/lib/supabase'
import { BlogPostClient } from './BlogPostClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default async function BlogPost({ params }: PageProps) {
  const { data: post, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', params.id)
    .eq('type', 'blog')
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return notFound()
  }

  if (!post) {
    return notFound()
  }

  return <BlogPostClient post={post} />
} 