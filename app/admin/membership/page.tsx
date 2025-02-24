"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Loader2
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { format } from 'date-fns'

type Application = {
  id: number
  user_id: string
  motivation: string
  experience: string
  commitment_hours: string
  interests: string[]
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  reviewer_notes?: string
  created_at: string
  user: {
    full_name: string
    email: string
    phone: string
    location: string
  }
}

export default function MembershipManagement() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      console.log('Starting to fetch applications...')

      const supabase = createClient()
      const { data: session } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('Not authenticated')
      }
      console.log('User authenticated:', session.user.id)

      // Check if user is admin from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      console.log('User role check:', userData)
      if (userError) {
        console.error('User role check error:', userError)
        throw userError
      }
      
      if (userData?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
      }
      console.log('Admin access confirmed')

      // First fetch all applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('membership_applications')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Applications query result:', { data: applicationsData, error: applicationsError })

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError)
        throw applicationsError
      }

      if (!applicationsData || applicationsData.length === 0) {
        console.log('No applications data returned')
        setApplications([])
        return
      }

      // Then fetch user details for each application
      const userIds = applicationsData.map(app => app.user_id)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name, phone, location')
        .in('id', userIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        throw usersError
      }

      // Combine the data
      const applications = applicationsData.map(app => ({
        ...app,
        user: usersData?.find(user => user.id === app.user_id) || {
          email: 'Unknown',
          full_name: 'Unknown User',
          phone: '',
          location: ''
        }
      }))

      console.log('Setting applications:', applications)
      setApplications(applications)
    } catch (error) {
      console.error('Error in fetchApplications:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch applications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (id: number, newStatus: Application['status']) => {
    try {
      setLoading(true)
      
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('Not authenticated')
      }
      
      // Update application status
      const { error: updateError } = await supabase
        .from('membership_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reviewNotes,
          reviewed_by: session.user.id,
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Update local state
      setApplications(apps =>
        apps.map(app =>
          app.id === id ? { ...app, status: newStatus, reviewer_notes: reviewNotes } : app
        )
      )

      // Show success message
      toast({
        title: 'Success',
        description: `Application status updated to ${newStatus}`,
      })

      // Reset review notes
      setReviewNotes("")
      
      // Refresh applications list
      await fetchApplications()

    } catch (error) {
      console.error('Error updating application:', error)
      toast({
        title: 'Error',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      currentTab === 'all' || app.status === currentTab

    return matchesSearch && matchesTab
  })

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'reviewing':
        return <Badge className="bg-blue-500">Reviewing</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Membership Applications</h1>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={fetchApplications}>Refresh</Button>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.user.full_name}</TableCell>
                      <TableCell>{app.user.email}</TableCell>
                      <TableCell>{app.user.location}</TableCell>
                      <TableCell>
                        {format(new Date(app.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className={`capitalize ${
                          app.status === 'approved' ? 'text-primary' :
                          app.status === 'rejected' ? 'text-red-600' :
                          app.status === 'reviewing' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                              <div>
                                <h3 className="font-semibold">Contact Information</h3>
                                <p>Phone: {app.user.phone}</p>
                                <p>Location: {app.user.location}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold">Areas of Interest</h3>
                                <div className="flex flex-wrap gap-2">
                                  {app.interests.map((interest, i) => (
                                    <span
                                      key={i}
                                      className="rounded-full bg-primary/10 px-3 py-1 text-sm"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold">Motivation</h3>
                                <p className="whitespace-pre-wrap">{app.motivation}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold">Experience</h3>
                                <p className="whitespace-pre-wrap">{app.experience}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold">Weekly Commitment</h3>
                                <p>{app.commitment_hours}</p>
                              </div>
                              <div className="flex gap-2">
                                {app.status !== 'approved' && (
                                  <Button
                                    onClick={() => updateApplicationStatus(app.id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                )}
                                {app.status === 'pending' && (
                                  <Button
                                    onClick={() => updateApplicationStatus(app.id, 'reviewing')}
                                    variant="outline"
                                  >
                                    Mark as Reviewing
                                  </Button>
                                )}
                                {app.status !== 'rejected' && (
                                  <Button
                                    onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                    variant="destructive"
                                  >
                                    Reject
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 
