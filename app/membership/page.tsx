"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"
import { Loader2, CheckCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MembershipStatus } from "@/components/membership/MembershipStatus"

const interests = [
  "Youth Empowerment",
  "Youth Mentorship",
  "Youth Employment",
  "Entrepreneurship",
  "Financial Literacy",
  "Youth Representation",
  "Education",
  "Sports, Arts & Talent",
  "Pan Africanism",
  "Technology & Digital Literacy",
  "Maternal Health",
  "Sexual Education",
  "Female Genital Mutilation",
  "Childhood Marriages",
  "Childhood Pregnancies",
  "Alcohol, Drugs & Substance Abuse",
  "Mental Health Action",
  "Inclusivity of Young PWDs",
  "Cyberbullying",
  "Blood Donation",
  "Climate Change Mitigation",
  "Climate Change Adaptation & Resilience",
  "Nature-Based Solutions",
  "Water Solutions & Management",
  "Smart Agriculture"
]

export default function MembershipPage() {
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    occupation: "",
    motivation: "",
    experience: "",
    commitment_hours: "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in and get application status
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          await checkApplicationStatus(session.user.id)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }
    
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await checkApplicationStatus(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkApplicationStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('membership_applications')
        .select('status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking application:', error)
        return
      }

      if (data) {
        setApplicationStatus(data.status)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to submit an application",
          variant: "destructive"
        })
        return
      }

      const userId = session.user.id

      // Check if user has selected at least one interest
      if (!selectedInterests.length) {
        toast({
          title: "Error",
          description: "Please select at least one area of interest",
          variant: "destructive"
        })
        return
      }

      // Check for existing application first
      const { data: existingApp, error: existingError } = await supabase
        .from('membership_applications')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError
      }

      if (existingApp) {
        toast({
          title: "Info",
          description: "You have already submitted an application"
        })
        setApplicationStatus('pending')
        return
      }

      // Submit new application
      const { error: applicationError } = await supabase
        .from('membership_applications')
        .insert({
          user_id: userId,
          motivation: formData.motivation,
          experience: formData.experience,
          commitment_hours: formData.commitment_hours,
          interests: selectedInterests,
          status: 'pending'
        })

      if (applicationError) {
        throw applicationError
      }

      // Update local state and show success message
      setApplicationStatus('pending')
      toast({
        title: "Success",
        description: "Application submitted successfully"
      })

      // Reset form
      setFormData({
        phone: "",
        location: "",
        occupation: "",
        motivation: "",
        experience: "",
        commitment_hours: "",
      })
      setSelectedInterests([])

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen pt-16">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>Please Log In</CardTitle>
                <CardDescription>
                  You need to be logged in to register as a member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/login">Log In</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    )
  }

  if (applicationStatus) {
    return (
      <div className="min-h-screen pt-16">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold text-center mb-4">Application Status</h1>
                <p className="text-lg text-center text-muted-foreground mb-8">
                  Track the progress of your membership application
                </p>

                <Card>
                  <CardContent className="pt-6">
                    <MembershipStatus currentStatus={applicationStatus} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-center mb-4">Join TYPNI</h1>
              <p className="text-lg text-center text-muted-foreground mb-8">
                Register as a member and be part of our mission to empower youth across Africa.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle>Membership Application</CardTitle>
                  <CardDescription>
                    Please fill out the form below to apply for membership.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          required
                          value={formData.occupation}
                          onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label>Areas of Interest</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {interests.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={interest}
                                checked={selectedInterests.includes(interest)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedInterests(prev => [...prev, interest])
                                  } else {
                                    setSelectedInterests(prev => prev.filter(i => i !== interest))
                                  }
                                }}
                                disabled={loading}
                              />
                              <Label htmlFor={interest} className="text-sm">
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="motivation">Why do you want to join TYPNI?</Label>
                        <Textarea
                          id="motivation"
                          required
                          value={formData.motivation}
                          onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                          disabled={loading}
                          className="h-32"
                        />
                      </div>

                      <div>
                        <Label htmlFor="experience">Relevant Experience</Label>
                        <Textarea
                          id="experience"
                          required
                          value={formData.experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                          disabled={loading}
                          className="h-32"
                        />
                      </div>

                      <div>
                        <Label htmlFor="commitment">Weekly Time Commitment</Label>
                        <Select
                          value={formData.commitment_hours}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, commitment_hours: value }))}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hours per week" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5">1-5 hours</SelectItem>
                            <SelectItem value="5-10">5-10 hours</SelectItem>
                            <SelectItem value="10-20">10-20 hours</SelectItem>
                            <SelectItem value="20+">20+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

