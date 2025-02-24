import { supabase } from '@/lib/supabase'
import { BlogPostClient } from './BlogPostClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlogPost({ params }: PageProps) {
  const resolvedParams = await params
  
  const { data: post, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', resolvedParams.id)
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