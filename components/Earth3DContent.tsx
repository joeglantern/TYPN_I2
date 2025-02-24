'use client'

import { useRef, useEffect, useState } from 'react'
import Script from 'next/script'
import * as THREE from 'three'

// Create a component that loads Three.js directly
function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sphere: THREE.Mesh;
    cleanup: () => void;
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current || sceneRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Create sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32)
    const texture = new THREE.TextureLoader().load('/earth-texture.jpg')
    texture.encoding = THREE.sRGBEncoding
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.4,
      roughness: 0.7,
    })

    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Position camera
    camera.position.z = 2.5

    // Animation
    let animationFrameId: number

    const animate = () => {
      sphere.rotation.y += 0.002
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)
    animate()

    // Store references for cleanup
    sceneRef.current = {
      scene,
      camera,
      renderer,
      sphere,
      cleanup: () => {
        window.removeEventListener('resize', handleResize)
        cancelAnimationFrame(animationFrameId)
        renderer.dispose()
        geometry.dispose()
        material.dispose()
        texture.dispose()
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.cleanup()
        sceneRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default function Earth3DContent() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse">Loading 3D content...</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full" style={{ height: '100%', minHeight: '400px' }}>
      <ThreeScene />
    </div>
  )
} 
