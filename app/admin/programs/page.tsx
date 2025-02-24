"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Search, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"

interface Program {
  id: string
  title: string
  description: string
  media_url: string
  status: string
  created_at: string
  duration?: string
  location?: string
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchPrograms()
  }, [])

  async function fetchPrograms() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', 'program')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPrograms(data || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch programs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">
            Manage your programs and initiatives
          </p>
        </div>
        <Link href="/admin/programs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search programs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-6">
            {filteredPrograms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No programs found.</p>
              </div>
            ) : (
              filteredPrograms.map((program) => (
                <div key={program.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  {program.media_url && (
                    <div className="relative w-40 aspect-[16/9] rounded-md overflow-hidden">
                      <Image
                        src={program.media_url}
                        alt={program.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold truncate">{program.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {program.description}
                        </p>
                        {(program.duration || program.location) && (
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            {program.duration && <p>Duration: {program.duration}</p>}
                            {program.location && <p>Location: {program.location}</p>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          program.status === 'published' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {program.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <Link href={`/admin/programs/${program.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {new Date(program.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  )
} 
