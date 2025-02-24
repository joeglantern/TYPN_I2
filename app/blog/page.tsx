import { createClient } from "@/utils/supabase/server"
import BlogList from "./components/BlogList"

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export default async function BlogPage() {
  const supabase = createClient()
  
  const { data: posts } = await supabase
    .from('content')
    .select('id, title, description, media_url, created_at, metadata')
    .eq('type', 'blog')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen pt-16">
      <BlogList posts={posts || []} />
    </div>
  )
}

