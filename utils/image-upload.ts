import { createClient } from "@/utils/supabase/client"
import { supabase } from '@/lib/supabase'

const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/webm']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface UploadOptions {
  bucket?: string
  folder?: string
  type?: 'image'
  maxSize?: number
}

async function ensureBucketExists(bucketName: string) {
  if (!bucketName || typeof bucketName !== 'string') {
    throw new Error('Valid bucket name is required')
  }

  // Remove any special characters and spaces from bucket name
  const sanitizedBucketName = bucketName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  
  const supabase = createClient()
  
  try {
    console.log('Checking bucket:', sanitizedBucketName)
    
    // Try to get bucket info
    const { data: buckets, error: getBucketError } = await supabase
      .storage
      .getBucket(sanitizedBucketName)

    // If bucket exists, return early
    if (!getBucketError) {
      console.log('Bucket already exists:', sanitizedBucketName)
      return sanitizedBucketName
    }

    // If error is not "not found", throw it
    if (!getBucketError.message.includes('not found')) {
      throw getBucketError
    }

    console.log('Creating bucket:', sanitizedBucketName)
    
    // Create the bucket
    const { error: createError } = await supabase
      .storage
      .createBucket(sanitizedBucketName, {
        public: true,
        allowedMimeTypes: ALLOWED_FILE_TYPES.image,
        fileSizeLimit: MAX_FILE_SIZE
      })

    if (createError) {
      console.error('Error creating bucket:', createError)
      throw createError
    }

    console.log('Bucket created successfully:', sanitizedBucketName)

    // Update bucket settings to make it public
    const { error: updateError } = await supabase
      .storage
      .updateBucket(sanitizedBucketName, {
        public: true,
        allowedMimeTypes: ALLOWED_FILE_TYPES.image,
        fileSizeLimit: MAX_FILE_SIZE
      })

    if (updateError) {
      console.error('Error updating bucket settings:', updateError)
      throw updateError
    }

    console.log('Bucket settings updated successfully')
    return sanitizedBucketName
  } catch (error) {
    console.error('Error ensuring bucket exists:', error)
    throw new Error(`Storage setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function validateFile(file: File, options: { type?: keyof typeof ALLOWED_FILE_TYPES, maxSize?: number } = {}) {
  const { type, maxSize = MAX_FILE_SIZE } = options

  if (type && !ALLOWED_FILE_TYPES[type].includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES[type].join(', ')}`)
  }

  if (file.size > maxSize) {
    throw new Error(`File size too large. Maximum size: ${maxSize / 1024 / 1024}MB`)
  }

  return true
}

export async function uploadImage(file: File, options: UploadOptions = {}): Promise<string> {
  const supabase = createClient()
  
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Validate file size (default 10MB max)
  const maxSize = options.maxSize || 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${options.folder || 'uploads'}/${fileName}`

  const { data, error } = await supabase.storage
    .from(options.bucket || 'images')
    .upload(filePath, file)

  if (error) {
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from(options.bucket || 'images')
    .getPublicUrl(filePath)

  return publicUrl
}

export async function uploadMultipleImages(files: File[], bucket: string = 'gallery') {
  try {
    const uploadPromises = files.map(file => uploadImage(file, bucket))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}

export async function deleteImage(url: string) {
  try {
    const path = url.split('/').pop()
    if (!path) throw new Error('Invalid image URL')

    const { error } = await supabase.storage
      .from('gallery')
      .remove([path])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

export async function uploadMultipleFiles(files: File[], options: UploadOptions): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Error uploading multiple files:', error)
    throw new Error('Failed to upload one or more files')
  }
}

export async function deleteFile(path: string, bucket: string): Promise<void> {
  const supabase = createClient()
  
  try {
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('Please sign in to delete files')
    }

    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path])

    if (error) {
      if (error.message.includes('Unauthorized')) {
        throw new Error('You are not authorized to delete this file')
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to delete file')
  }
} 