"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Poll {
  id: string
  title: string
  description: string
  options: string[]
  status: 'active' | 'closed'
  created_at: string
  expires_at: string | null
  votes?: { [key: string]: number }
  user_vote?: number
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchPolls()
    }
  }, [user])

  async function fetchPolls() {
    try {
      // Fetch active polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (pollsError) throw pollsError

      // Fetch vote counts for each poll
      const pollsWithVotes = await Promise.all(pollsData.map(async (poll) => {
        const { data: votesData } = await supabase
          .from('poll_votes')
          .select('selected_option')
          .eq('poll_id', poll.id)

        const votes = votesData?.reduce((acc: { [key: string]: number }, vote) => {
          acc[vote.selected_option] = (acc[vote.selected_option] || 0) + 1
          return acc
        }, {})

        // Check if user has voted
        const { data: userVote } = await supabase
          .from('poll_votes')
          .select('selected_option')
          .eq('poll_id', poll.id)
          .eq('user_id', user?.id)
          .single()

        return {
          ...poll,
          votes,
          user_vote: userVote?.selected_option
        }
      }))

      setPolls(pollsWithVotes || [])
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

  const vote = async (pollId: string, optionIndex: number) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to vote",
        variant: "destructive"
      })
      return
    }

    setVotingId(pollId)
    try {
      // First check if the poll is still active
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('status, expires_at')
        .eq('id', pollId)
        .single()

      if (pollError) throw pollError

      if (!pollData) {
        throw new Error('Poll not found')
      }

      if (pollData.status !== 'active') {
        throw new Error('This poll is no longer active')
      }

      if (pollData.expires_at && new Date(pollData.expires_at) < new Date()) {
        throw new Error('This poll has expired')
      }

      // Check if user has already voted
      const { data: existingVote, error: voteCheckError } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (voteCheckError) throw voteCheckError

      if (existingVote) {
        throw new Error('You have already voted in this poll')
      }

      // Insert the vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          selected_option: optionIndex
        })

      if (insertError) {
        // Check for unique constraint violation
        if (insertError.code === '23505') {
          throw new Error('You have already voted in this poll')
        }
        throw insertError
      }

      // Update local state optimistically
      setPolls(prev => prev.map(poll => {
        if (poll.id === pollId) {
          const newVotes = { ...poll.votes } || {}
          newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1
          return {
            ...poll,
            votes: newVotes,
            user_vote: optionIndex
          }
        }
        return poll
      }))

      toast({
        title: "Success! 🎉",
        description: "Your vote has been recorded",
      })

      // Refresh polls to get latest data
      await fetchPolls()

    } catch (error) {
      console.error('Voting error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cast vote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setVotingId(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Polls</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Please log in to view and participate in polls.
          </p>
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const calculatePercentage = (votes: { [key: string]: number } | undefined, optionIndex: number) => {
    if (!votes) return 0
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0)
    return totalVotes === 0 ? 0 : Math.round((votes[optionIndex] || 0) / totalVotes * 100)
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-background to-background/80">
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Welcome to TYPNI Polls
            </DialogTitle>
            <DialogDescription>
              <p className="mb-2">Welcome to our polling system! Please note:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You can only vote once per poll</li>
                <li>Your vote cannot be changed once submitted</li>
                <li>Results are updated in real-time</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowWelcome(false)}>
            Got it
          </Button>
        </DialogContent>
      </Dialog>

      <div className="container py-8">
        <motion.h1 
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Active Polls
        </motion.h1>

        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {polls.map((poll) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  mass: 1
                }}
                className="poll-card-hover"
              >
                <Card className="p-6 overflow-hidden bg-gradient-to-br from-background via-background to-muted border-2 transition-all duration-300">
                  <motion.h2 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {poll.title}
                  </motion.h2>
                  {poll.description && (
                    <motion.p 
                      className="text-muted-foreground mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {poll.description}
                    </motion.p>
                  )}

                  <div className="space-y-4">
                    {poll.options.map((option, index) => {
                      const percentage = calculatePercentage(poll.votes, index)
                      const isVoted = poll.user_vote === index
                      const isVoting = votingId === poll.id

                      return (
                        <motion.div 
                          key={index} 
                          className="relative"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: 0.1 * index,
                            type: "spring",
                            stiffness: 100,
                            damping: 10
                          }}
                          whileHover={{ scale: !poll.user_vote ? 1.02 : 1 }}
                        >
                          <div className="relative rounded-lg overflow-hidden bg-muted/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                            <motion.div
                              className="absolute inset-0 bg-primary/20"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                            />
                            <div className="relative flex items-center p-4">
                              <Button
                                variant={isVoted ? "default" : "ghost"}
                                className={`w-full justify-start transition-all duration-300 ${
                                  !poll.user_vote ? "hover:bg-primary/10" : ""
                                }`}
                                onClick={() => !poll.user_vote && vote(poll.id, index)}
                                disabled={isVoting || poll.user_vote !== undefined}
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <motion.span 
                                    className="flex-1"
                                    animate={isVoted ? { scale: [1, 1.1, 1] } : {}}
                                  >
                                    {option}
                                  </motion.span>
                                  {isVoted && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ 
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15
                                      }}
                                    >
                                      <CheckCircle2 className="h-5 w-5 text-primary" />
                                    </motion.div>
                                  )}
                                  <motion.div 
                                    className="text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-full text-sm"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    {percentage}% ({poll.votes?.[index] || 0})
                                  </motion.div>
                                </div>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <motion.div 
                    className="mt-6 flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span>Created: {format(new Date(poll.created_at), 'PPP')}</span>
                    {poll.expires_at && (
                      <span>• Expires: {format(new Date(poll.expires_at), 'PPP')}</span>
                    )}
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {polls.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-muted-foreground">No active polls at the moment</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 