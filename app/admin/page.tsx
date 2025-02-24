"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  Users, 
  Globe, 
  Settings, 
  Plus,
  Search,
  Bell,
  Calendar,
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  Handshake,
  BookOpen,
  Heart,
  UserPlus,
  Activity,
  Loader2,
  ImageIcon
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface DashboardStats {
  activeMembers: number
  activePrograms: number
  totalDonations: number
  totalPartners: number
  monthlyDonations: number
  monthlyGrowth: number
  pendingPartners: number
}

interface ActivityLog {
  id: string
  title: string
  description: string
  type: string
  created_at: string
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('all')
  const [stats, setStats] = useState<DashboardStats>({
    activeMembers: 0,
    activePrograms: 0,
    totalDonations: 0,
    totalPartners: 0,
    monthlyDonations: 0,
    monthlyGrowth: 0,
    pendingPartners: 0
  })
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch active members count
        const { count: membersCount, error: membersError } = await supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('status', 'active')

        if (membersError) throw membersError

        // Fetch active programs count
        const { count: programsCount, error: programsError } = await supabase
          .from('content')
          .select('*', { count: 'exact' })
          .eq('type', 'program')
          .eq('status', 'published')

        if (programsError) throw programsError

        // Fetch partners count
        const { count: partnersCount, error: partnersError } = await supabase
          .from('partners')
          .select('*', { count: 'exact' })

        if (partnersError) throw partnersError

        const { count: pendingPartnersCount, error: pendingError } = await supabase
          .from('partners')
          .select('*', { count: 'exact' })
          .eq('status', 'pending')

        if (pendingError) throw pendingError

        // Fetch donations data
        const { data: monthlyDonations, error: donationsError } = await supabase
          .from('donations')
          .select('amount')
          .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())

        if (donationsError) throw donationsError

        const totalMonthlyDonations = monthlyDonations?.reduce((sum, d) => sum + d.amount, 0) || 0

        // Fetch recent activity
        const { data: activity, error: activityError } = await supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (activityError) throw activityError

        if (mounted) {
          setStats({
            activeMembers: membersCount || 0,
            activePrograms: programsCount || 0,
            totalPartners: partnersCount || 0,
            pendingPartners: pendingPartnersCount || 0,
            monthlyDonations: totalMonthlyDonations,
            totalDonations: 0,
            monthlyGrowth: 0
          })
          setRecentActivity(activity || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        if (mounted) {
          setError('Failed to load dashboard data. Please try again.')
          toast({
            title: "Error",
            description: "Failed to load dashboard data",
            variant: "destructive"
          })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      mounted = false
    }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed h-screen border-r">
        <div className="flex items-center gap-2 px-6 py-4 border-b">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="TYPNI Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl">TYPNI Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Main
            </p>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Community
            </p>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/membership">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Membership
                </Link>
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Content
            </p>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/programs">
                  <Globe className="mr-2 h-4 w-4" />
                  Programs
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/blog">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Blog
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/gallery">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Gallery
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/donations">
                  <Heart className="mr-2 h-4 w-4" />
                  Donations
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/partners">
                  <Handshake className="mr-2 h-4 w-4" />
                  Partners
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              System
            </p>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/activity">
                  <Activity className="mr-2 h-4 w-4" />
                  Activity Log
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search across TYPNI..."
                  className="w-[300px] pl-8"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Calendar className="h-5 w-5" />
              </Button>
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
                <Image
                  src="/placeholder.jpg"
                  alt="Admin Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {/* Overview Section */}
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Members</p>
                      <p className="text-2xl font-bold">{stats.activeMembers}</p>
                      {stats.monthlyGrowth > 0 && (
                        <p className="text-sm text-green-500">+{stats.monthlyGrowth}% this month</p>
                      )}
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Programs</p>
                      <p className="text-2xl font-bold">{stats.activePrograms}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Donations</p>
                      <p className="text-2xl font-bold">${stats.monthlyDonations.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Handshake className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Partner Organizations</p>
                      <p className="text-2xl font-bold">{stats.totalPartners}</p>
                      {stats.pendingPartners > 0 && (
                        <p className="text-sm text-blue-500">{stats.pendingPartners} pending</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Activity</CardTitle>
                    <Tabs defaultValue="all">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="programs">Programs</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all">
                        <div className="space-y-4 mt-4">
                          {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <Activity className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                          {recentActivity.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              No recent activity
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="members">
                        <div className="space-y-4 mt-4">
                          {recentActivity
                            .filter(activity => activity.type === 'member')
                            .map((activity) => (
                              <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                                <div className="p-2 bg-primary/10 rounded-full">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{activity.title}</p>
                                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(activity.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          {recentActivity.filter(activity => activity.type === 'member').length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              No member activity
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="programs">
                        <div className="space-y-4 mt-4">
                          {recentActivity
                            .filter(activity => activity.type === 'program')
                            .map((activity) => (
                              <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                                <div className="p-2 bg-primary/10 rounded-full">
                                  <Globe className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{activity.title}</p>
                                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(activity.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          {recentActivity.filter(activity => activity.type === 'program').length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              No program activity
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardHeader>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
} 