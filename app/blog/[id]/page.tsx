import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { BlogPostClient } from './BlogPostClient'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: post } = await supabase
    .from('content')
    .select('title,description')
    .eq('id', params.id)
    .single()

  return {
    title: post?.title || 'Blog Post',
    description: post?.description || 'Loading blog post...',
  }
}

export default async function BlogPost({ params }: Props) {
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