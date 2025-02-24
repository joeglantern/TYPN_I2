"use client"

import { useRef, useState, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useLoader } from "@react-three/fiber"
import { TextureLoader, BackSide, Vector3 } from "three"
import { OrbitControls, Sphere, Html } from "@react-three/drei"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { ErrorBoundary } from "react-error-boundary"

function LoadingSpinner() {
  return (
    <Html center>
      <div className="text-white text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading Earth...</p>
      </div>
    </Html>
  )
}

function SpeechBubble() {
  const { camera } = useThree()
  const bubbleRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (bubbleRef.current) {
      // Always face camera
      bubbleRef.current.lookAt(camera.position)
    }
  })

  return (
    <group ref={bubbleRef} position={[0, 0, 0]}>
      <Html center transform distanceFactor={1.5}>
        <div className="relative">
          {/* Main speech bubble */}
          <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-[30px] shadow-xl text-center whitespace-nowrap border-4 border-primary/20">
            <p className="text-2xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent animate-pulse">
              TYPNI
            </p>
            <p className="text-lg font-semibold text-gray-600">
              We are global
            </p>
          </div>
          {/* Triangle pointer */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-white/95 border-r-[12px] border-r-transparent" />
        </div>
      </Html>
    </group>
  )
}

function LogoSun() {
  const sunRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useFrame(({ clock }) => {
    if (sunRef.current) {
      // Gentle pulsing effect
      const scale = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05
      sunRef.current.scale.set(scale, scale, scale)
      
      // Fixed position at the top right of the frame
      const angle = clock.getElapsedTime() * 0.1
      // Calculate position to stay within frame bounds
      const maxRadius = 1.8
      let x = Math.sin(angle) * maxRadius
      let z = Math.cos(angle) * maxRadius
      
      // Ensure the sun stays within a rectangular boundary
      const maxX = 1.5
      const maxZ = 1.5
      x = Math.max(Math.min(x, maxX), -maxX)
      z = Math.max(Math.min(z, maxZ), -maxZ)
      
      sunRef.current.position.set(x, 1.8, z)
      sunRef.current.lookAt(camera.position)
    }
  })

  return (
    <group ref={sunRef} position={[1.5, 1.8, 0]}>
      <Html center transform distanceFactor={6}>
        <div className="relative w-16 h-16">
          <Image
            src="/TYPNI-20_copy-removebg-preview.png"
            alt="TYPNI Logo Sun"
            fill
            className="object-contain drop-shadow-[0_0_40px_rgba(255,220,0,0.9)]"
            priority
          />
        </div>
      </Html>
      <pointLight intensity={1.5} color="#FFD700" distance={6} decay={1} />
      <pointLight intensity={0.8} color="#FFFFFF" distance={10} decay={1} />
    </group>
  )
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  
  const [colorMap, cloudsMap] = useLoader(TextureLoader, [
    '/earth/8k_earth_daymap.jpg',
    '/earth/8k_earth_clouds.jpg'
  ])

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    
    if (earthRef.current) {
      earthRef.current.rotation.y = elapsedTime * 0.05
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsedTime * 0.07
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = elapsedTime * 0.03
    }
  })

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[-5, 3, -5]} intensity={1.5} color="#FFFFFF" />
      <LogoSun />
      <SpeechBubble />

      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          map={colorMap}
          roughness={0.3}
          metalness={0.1}
        />
      </Sphere>

      <Sphere ref={cloudsRef} args={[1.01, 64, 64]}>
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>

      <Sphere ref={atmosphereRef} args={[1.1, 64, 64]}>
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.05}
          side={BackSide}
        />
      </Sphere>

      {Array.from({ length: 100 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        const distance = Math.random() * 15 + 5
        const position = [
          distance * Math.sin(phi) * Math.cos(theta),
          distance * Math.sin(phi) * Math.sin(theta),
          distance * Math.cos(phi)
        ]
        return (
          <mesh key={i} position={position as [number, number, number]}>
            <sphereGeometry args={[0.002 + Math.random() * 0.002, 8, 8]} />
            <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
          </mesh>
        )
      })}
    </>
  )
}

function ErrorFallback() {
  return (
    <Html center>
      <div className="text-white text-center">
        <p className="text-sm">Something went wrong loading the globe.</p>
      </div>
    </Html>
  )
}

function Earth3DContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
    >
      {/* Spin me text */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-center whitespace-nowrap border-2 border-secondary/20">
          <p className="text-lg font-bold text-secondary animate-bounce">
            ↻ Spin me! ↺
          </p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B]/10 via-[#4ECDC4]/10 to-[#45B7D1]/10 rounded-full blur-3xl" />
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true }}
        style={{ position: 'relative' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0)
        }}
      >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={0.3}
              autoRotate
              autoRotateSpeed={0.5}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 1.5}
            />
            <Earth />
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </motion.div>
  )
}

export default function Earth3D() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Earth3DContent />
    </ErrorBoundary>
  )
} 