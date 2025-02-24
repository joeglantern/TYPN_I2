import { createClient } from '@/lib/supabase'
import { BlogPostClient } from './BlogPostClient'

interface PageProps {
  params: {
    id: string
  }
}

export default async function BlogPost({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: post, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }

  if (!post) {
    return null
  }

  return <BlogPostClient post={post} />
} 