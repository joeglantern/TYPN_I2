"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, X } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface Poll {
  id: string
  title: string
  description: string
  options: string[]
  status: 'active' | 'closed'
  created_at: string
  expires_at: string | null
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    options: ["", ""],
    expires_at: ""
  })
  const supabase = createClient()
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    fetchPolls()
  }, [])

  async function fetchPolls() {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPolls(data || [])
    } catch (error) {
      console.error('Error fetching polls:', error)
      toast({
        title: "Error",
        description: "Failed to fetch polls",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }))
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length <= 2) return // Minimum 2 options
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    // Validate
    if (!newPoll.title.trim() || newPoll.options.some(opt => !opt.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          title: newPoll.title.trim(),
          description: newPoll.description?.trim() || null,
          options: newPoll.options.filter(opt => opt.trim()),
          status: 'active',
          expires_at: newPoll.expires_at || null
        })
        .select()
        .single()

      if (error) throw error

      setPolls(prev => [data, ...prev])
      setDialogOpen(false)
      setNewPoll({
        title: "",
        description: "",
        options: ["", ""],
        expires_at: ""
      })
      toast({
        title: "Success",
        description: "Poll created successfully"
      })
    } catch (error) {
      console.error('Error creating poll:', error)
      toast({
        title: "Error",
        description: "Failed to create poll"
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePollStatus = async (pollId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active'
      const { error } = await supabase
        .from('polls')
        .update({ status: newStatus })
        .eq('id', pollId)

      if (error) throw error

      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? { ...poll, status: newStatus } : poll
      ))

      toast({
        title: "Success",
        description: `Poll ${newStatus === 'active' ? 'activated' : 'closed'} successfully`
      })
    } catch (error) {
      console.error('Error updating poll status:', error)
      toast({
        title: "Error",
        description: "Failed to update poll status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Polls</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Poll title"
                    value={newPoll.title}
                    onChange={e => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Poll description (optional)"
                    value={newPoll.description}
                    onChange={e => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    type="datetime-local"
                    value={newPoll.expires_at}
                    onChange={e => setNewPoll(prev => ({ ...prev, expires_at: e.target.value }))}
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty for no expiration
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Options</p>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={e => updateOption(index, e.target.value)}
                        disabled={loading}
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    disabled={loading}
                    className="w-full"
                  >
                    Add Option
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Poll...
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {polls.map((poll) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{poll.title}</h2>
                    {poll.description && (
                      <p className="text-muted-foreground mb-4">{poll.description}</p>
                    )}
                    <div className="space-y-2">
                      {poll.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {format(new Date(poll.created_at), 'PPP')}</span>
                      {poll.expires_at && (
                        <span>Expires: {format(new Date(poll.expires_at), 'PPP')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={poll.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => togglePollStatus(poll.id, poll.status)}
                    >
                      {poll.status === 'active' ? 'Close Poll' : 'Activate Poll'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {polls.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No polls found</p>
          </div>
        )}
      </div>
    </div>
  )
} 