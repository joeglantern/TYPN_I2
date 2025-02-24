"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Mail, Phone, MapPin, Camera, Shield, Key, Bell, AlertTriangle, X } from "lucide-react"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HelpCircle } from "lucide-react"

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  avatar_url: string
  created_at: string
  has_seen_tutorial?: boolean
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<any>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (!session) {
        router.push('/login')
        return
      }

      setSession(session)
      await fetchProfile(session.user.id)
    } catch (error) {
      console.error('Session error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function fetchProfile(userId: string) {
    try {
      // First try to get the existing profile
      let { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, phone, location, avatar_url, created_at, has_seen_tutorial')
        .eq('id', userId)
        .single()

      // If no user found, create one with data from auth
      if (error && error.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser()
        
        const newUser = {
          id: userId,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || '',
          avatar_url: user?.user_metadata?.avatar_url || '',
          phone: '',
          location: '',
          created_at: new Date().toISOString(),
          has_seen_tutorial: false // Ensure new users see the tutorial
        }

        // Insert the new user
        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select('id, full_name, email, phone, location, avatar_url, created_at, has_seen_tutorial')
          .single()

        if (insertError) throw insertError
        data = insertedUser
      } else if (error) {
        throw error
      }

      setProfile(data)
      // Always show tutorial if has_seen_tutorial is false or undefined
      setShowTutorial(data?.has_seen_tutorial === false || data?.has_seen_tutorial === undefined)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    try {
      // Ensure user exists first
      await fetchProfile(session.user.id)

      // Then update the profile
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state with the returned data
      setProfile(prev => prev ? { ...prev, ...data } : data)
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })

      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }

  async function handleUpdateField(field: string) {
    try {
      if (!editValue.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid value",
          variant: "destructive"
        })
        return
      }

      // Show loading state
      setLoading(true)

      // Update the profile
      await updateProfile({ [field]: editValue.trim() })

      // Reset the edit state
      setEditingField(null)
      setEditValue("")

      // Refresh the profile data to ensure UI is in sync
      await fetchProfile(session.user.id)
    } catch (error) {
      console.error('Error updating field:', error)
      toast({
        title: "Error",
        description: "Failed to update information. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 2MB",
          variant: "destructive"
        })
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "File must be JPEG, PNG, or GIF",
          variant: "destructive"
        })
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`])
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL and refresh data
      await updateProfile({ avatar_url: publicUrl })
      await fetchProfile(session.user.id)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteAccount() {
    try {
      setIsDeleting(true)
      const userId = session.user.id

      if (!deletePassword.trim()) {
        toast({
          title: "Error",
          description: "Please enter your password",
          variant: "destructive"
        })
        return
      }

      // Verify password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: deletePassword
      })

      if (signInError) {
        toast({
          title: "Error",
          description: "Incorrect password. Please try again.",
          variant: "destructive"
        })
        return
      }

      // Delete user's avatar from storage if it exists
      if (profile?.avatar_url) {
        const avatarPath = profile.avatar_url.split('/').pop()
        if (avatarPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${avatarPath}`])
        }
      }

      // Delete user's profile from the users table
      const { error: deleteProfileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteProfileError) throw deleteProfileError

      // Sign out and delete auth user
      await supabase.auth.signOut()

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      })

      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setDeletePassword("")
    }
  }

  async function markTutorialAsSeen() {
    try {
      await updateProfile({ has_seen_tutorial: true })
      setShowTutorial(false)
    } catch (error) {
      console.error('Error marking tutorial as seen:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-semibold text-2xl">Welcome to TYPNI! 👋</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={markTutorialAsSeen}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Let's help you get started with your account:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <User className="h-6 w-6 mt-1 text-primary" />
                  <div>
                    <p className="font-medium">Complete Your Profile</p>
                    <p className="text-sm text-muted-foreground">Add your full name, phone number, and location</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Camera className="h-6 w-6 mt-1 text-primary" />
                  <div>
                    <p className="font-medium">Add a Profile Picture</p>
                    <p className="text-sm text-muted-foreground">Click the camera icon to upload your photo</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HelpCircle className="h-6 w-6 mt-1 text-primary" />
                  <div>
                    <p className="font-medium">Need Help?</p>
                    <p className="text-sm text-muted-foreground">Click the help icon in the top right at any time</p>
                  </div>
                </li>
              </ul>
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={markTutorialAsSeen}
              >
                Got it, let's get started!
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Account Dashboard</h1>
              <p className="text-muted-foreground">
                View and manage your account information
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Need Help?</h4>
                  <p className="text-sm text-muted-foreground">
                    Here's what you can do in your dashboard:
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Update your profile information</li>
                    <li>Change your profile picture</li>
                    <li>Manage your account settings</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-border">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-1 rounded-full bg-primary hover:bg-primary/90 cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 text-primary-foreground" />
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium">{profile?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between group">
                    <div>
                      <Label className="text-muted-foreground text-sm">Full Name</Label>
                      <p className="mt-1 font-medium">
                        {profile?.full_name || (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </p>
                    </div>
                    {(!profile?.full_name || profile.full_name.trim() === '') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setEditingField('full_name')
                              setEditValue(profile?.full_name || '')
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Full Name</DialogTitle>
                            <DialogDescription>
                              Enter your full name below.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingField(null)
                                setEditValue("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={() => handleUpdateField('full_name')}>
                              Save
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-sm">Email Address</Label>
                    <p className="mt-1 font-medium">{profile?.email}</p>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <Label className="text-muted-foreground text-sm">Phone Number</Label>
                      <p className="mt-1 font-medium">
                        {profile?.phone || (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </p>
                    </div>
                    {(!profile?.phone || profile.phone.trim() === '') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setEditingField('phone')
                              setEditValue(profile?.phone || '')
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Phone Number</DialogTitle>
                            <DialogDescription>
                              Enter your phone number below.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              type="tel"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingField(null)
                                setEditValue("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={() => handleUpdateField('phone')}>
                              Save
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <Label className="text-muted-foreground text-sm">Location</Label>
                      <p className="mt-1 font-medium">
                        {profile?.location || (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </p>
                    </div>
                    {(!profile?.location || profile.location.trim() === '') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setEditingField('location')
                              setEditValue(profile?.location || '')
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Location</DialogTitle>
                            <DialogDescription>
                              Enter your location below.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Enter your location"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingField(null)
                                setEditValue("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={() => handleUpdateField('location')}>
                              Save
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone Card */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <div className="space-y-4">
                          <div>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data from our servers, including:
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Profile information</li>
                            <li>Activity history</li>
                            <li>Membership applications</li>
                            <li>Avatar and uploaded files</li>
                          </ul>
                          <div className="pt-4">
                            <Label htmlFor="delete-password" className="text-sm font-medium">
                              Please enter your password to confirm deletion
                            </Label>
                            <Input
                              id="delete-password"
                              type="password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              placeholder="Enter your password"
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletePassword("")}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 
