"use client"

import { useRef, Suspense, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useLoader } from "@react-three/fiber"
import { TextureLoader, BackSide, Vector3, MeshBasicMaterial, BufferGeometry, LineBasicMaterial, Line, CubicBezierCurve3, AdditiveBlending } from "three"
import { OrbitControls, Sphere, Html } from "@react-three/drei"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

function LoadingSpinner() {
  return (
    <Html center>
      <div className="text-white text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading Globe...</p>
      </div>
    </Html>
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

function CurvedLine({ start, end, color = "#4ECDC4", opacity = 0.2 }) {
  const curve = useMemo(() => {
    const midPoint = new Vector3().addVectors(start, end).multiplyScalar(0.5)
    const distance = start.distanceTo(end)
    midPoint.normalize().multiplyScalar(1 + distance * 0.3)
    
    return new CubicBezierCurve3(
      start,
      start.clone().lerp(midPoint, 0.3),
      end.clone().lerp(midPoint, 0.3),
      end
    )
  }, [start, end])

  const points = useMemo(() => curve.getPoints(50), [curve])
  const ref = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = opacity * (0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.5)
    }
  })

  return (
    <mesh ref={ref}>
      <tubeGeometry args={[curve, 50, 0.001, 8, false]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

function NodeLabel({ position, text, number }) {
  const { camera } = useThree()
  const ref = useRef()

  useFrame(() => {
    if (ref.current) {
      ref.current.lookAt(camera.position)
    }
  })

  return (
    <group position={position} ref={ref}>
      <Html center transform distanceFactor={10}>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-1 pointer-events-none select-none"
        >
          <div className="px-2 py-1 rounded-lg bg-[#4ECDC4]/20 backdrop-blur-sm border border-[#4ECDC4]/30">
            <p className="text-[12px] font-medium text-[#4ECDC4] whitespace-nowrap">{text}</p>
          </div>
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#4ECDC4] text-white text-[10px] font-bold">
            {number}
          </div>
        </motion.div>
      </Html>
    </group>
  )
}

function NodePoint({ position }) {
  const innerRef = useRef()
  const outerRef = useRef()
  const glowRef = useRef()
  const pulseRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (innerRef.current && outerRef.current && glowRef.current && pulseRef.current) {
      // More subtle scale animations
      const scale = 1 + Math.sin(t * 0.8) * 0.03
      innerRef.current.scale.setScalar(scale * 0.8)
      outerRef.current.scale.setScalar(scale * 0.9)
      
      // Gentler glow effect
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.05)
      glowRef.current.material.opacity = 0.15 + Math.sin(t * 0.8) * 0.05
      
      // Subtle pulse ring
      pulseRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.08)
      pulseRef.current.material.opacity = 0.1 + Math.sin(t * 1.2) * 0.03
    }
  })

  return (
    <group position={position}>
      {/* Smaller bright core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.006, 32, 32]} />
        <meshBasicMaterial 
          color="#4ECDC4" 
          transparent 
          opacity={0.8}
          depthTest={true}
          depthWrite={true}
        />
      </mesh>
      
      {/* Subtle inner glow */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.009, 32, 32]} />
        <meshBasicMaterial 
          color="#4ECDC4" 
          transparent 
          opacity={0.25}
          blending={AdditiveBlending}
          depthTest={true}
          depthWrite={false}
        />
      </mesh>
      
      {/* Minimal outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.012, 32, 32]} />
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthTest={true}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle ring */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.012, 0.014, 32]} />
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.08}
          blending={AdditiveBlending}
          depthTest={true}
          depthWrite={false}
          side={BackSide}
        />
      </mesh>
    </group>
  )
}

function ConnectionParticle({ curve }) {
  const ref = useRef()
  const progress = useRef(Math.random())
  const speed = useRef(0.2 + Math.random() * 0.3)
  const glowRef = useRef()

  useFrame(({ clock }) => {
    if (ref.current && glowRef.current) {
      progress.current += speed.current * 0.01
      if (progress.current > 1) progress.current = 0

      const point = curve.getPointAt(progress.current)
      ref.current.position.copy(point)
      glowRef.current.position.copy(point)
      
      const scale = 0.008 * (1 + Math.sin(progress.current * Math.PI) * 0.5)
      ref.current.scale.setScalar(scale)
      glowRef.current.scale.setScalar(scale * 2)
      
      // Fade particles at the ends of the curve
      const opacity = Math.sin(progress.current * Math.PI)
      ref.current.material.opacity = opacity * 0.8
      glowRef.current.material.opacity = opacity * 0.4
    }
  })

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#4ECDC4" transparent opacity={0.8} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.4}
          blending={AdditiveBlending}
        />
      </mesh>
    </>
  )
}

function ConnectionNodes() {
  const nodesRef = useRef()
  const linesRef = useRef()
  const scrollRef = useRef({ offset: 0, speed: 0, direction: 0 })
  const prevScrollY = useRef(0)
  const momentumRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const newOffset = scrollTop / docHeight
      
      const speed = (scrollTop - prevScrollY.current) / 50 // Reduced speed sensitivity
      const direction = Math.sign(speed)
      
      scrollRef.current = {
        offset: newOffset,
        speed: speed * 0.6, // Reduced speed impact
        direction: direction
      }
      
      prevScrollY.current = scrollTop
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Define node positions with exact surface placement
  const nodePositions = useMemo(() => {
    const positions = [
      // North America
      { lat: 40, lng: -74 },    // New York
      { lat: 37, lng: -122 },   // San Francisco
      { lat: 51, lng: -114 },   // Calgary
      { lat: 19, lng: -99 },    // Mexico City
      
      // South America
      { lat: -22, lng: -43 },   // Rio
      { lat: -33, lng: -70 },   // Santiago
      { lat: -12, lng: -77 },   // Lima
      { lat: 4, lng: -74 },     // Bogota
      
      // Europe
      { lat: 51.5, lng: -0.12 }, // London
      { lat: 48.8, lng: 2.35 },  // Paris
      { lat: 52.5, lng: 13.4 },  // Berlin
      { lat: 41.9, lng: 12.5 },  // Rome
      { lat: 59.9, lng: 10.7 },  // Oslo
      
      // Asia
      { lat: 35.6, lng: 139.6 }, // Tokyo
      { lat: 31.2, lng: 121.4 }, // Shanghai
      { lat: 37.5, lng: 127 },   // Seoul
      { lat: 1.3, lng: 103.8 },  // Singapore
      { lat: 19.1, lng: 72.8 },  // Mumbai
      { lat: 39.9, lng: 116.4 }, // Beijing
      
      // Africa
      { lat: -1.3, lng: 36.8 },  // Nairobi
      { lat: 6.5, lng: 3.3 },    // Lagos
      { lat: 30.0, lng: 31.2 },  // Cairo
      { lat: -26.2, lng: 28.0 }, // Johannesburg
      
      // Oceania
      { lat: -33.8, lng: 151.2 }, // Sydney
      { lat: -37.8, lng: 144.9 }, // Melbourne
      { lat: -41.3, lng: 174.7 }, // Wellington
    ]

    return positions.map(({ lat, lng }) => {
      const latRad = (90 - lat) * (Math.PI / 180)
      const lngRad = (180 + lng) * (Math.PI / 180)
      const radius = 1.001  // Keep exact surface placement
      const x = -radius * Math.sin(latRad) * Math.cos(lngRad)
      const y = radius * Math.cos(latRad)
      const z = radius * Math.sin(latRad) * Math.sin(lngRad)
      return new Vector3(x, y, z)
    })
  }, [])

  const curves = useMemo(() => {
    const result = []
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const start = nodePositions[i]
        const end = nodePositions[j]
        const midPoint = new Vector3().addVectors(start, end).multiplyScalar(0.5)
        const distance = start.distanceTo(end)
        // Reduced curve height for closer surface alignment
        midPoint.normalize().multiplyScalar(1 + distance * 0.15)
        
        result.push(new CubicBezierCurve3(
          start,
          start.clone().lerp(midPoint, 0.3),
          end.clone().lerp(midPoint, 0.3),
          end
        ))
      }
    }
    return result
  }, [nodePositions])

  useFrame((state) => {
    if (nodesRef.current && linesRef.current) {
      const time = state.clock.getElapsedTime()
      const { speed, direction, offset } = scrollRef.current
      
      // Update momentum with more dampening
      momentumRef.current *= 0.92
      momentumRef.current += speed * 0.03

      // Slower base rotation
      const baseRotation = time * 0.03
      
      // More controlled scroll effects
      const scrollRotation = offset * Math.PI * 2
      const momentumRotation = momentumRef.current * Math.PI * 0.5
      
      // Smoother rotation interpolation
      const targetRotation = baseRotation + scrollRotation + momentumRotation
      const currentRotation = nodesRef.current.rotation.y
      const smoothRotation = currentRotation + (targetRotation - currentRotation) * 0.05
      
      // Apply rotations
      nodesRef.current.rotation.y = smoothRotation
      linesRef.current.rotation.y = smoothRotation

      // Gentler tilt based on scroll
      const targetTiltX = speed * 0.15
      const currentTiltX = nodesRef.current.rotation.x
      const smoothTiltX = currentTiltX + (targetTiltX - currentTiltX) * 0.05
      
      nodesRef.current.rotation.x = smoothTiltX
      linesRef.current.rotation.x = smoothTiltX

      // Subtle breathing effect
      const breathingScale = 1 + Math.sin(time * 0.8) * 0.02
      const scrollImpact = Math.abs(speed) * 1.5
      const targetScale = breathingScale * (1 + scrollImpact)

      // Apply scale with minimal variation
      nodesRef.current.children.forEach((node, index) => {
        const positionOffset = Math.sin(time + index * 0.3) * 0.01
        const finalScale = targetScale * (1 + positionOffset)
        node.scale.setScalar(finalScale)
      })

      // Particle speed modification
      const particleSpeedMultiplier = 1 + Math.abs(speed)
      linesRef.current.children.forEach(child => {
        if (child.material) {
          child.material.opacity = 0.15 + Math.abs(speed) * 0.2
        }
      })
    }
  })

  return (
    <>
      <group ref={nodesRef}>
        {nodePositions.map((position, i) => (
          <NodePoint key={i} position={position} />
        ))}
      </group>
      <group ref={linesRef}>
        {nodePositions.map((start, i) =>
          nodePositions.slice(i + 1).map((end, j) => (
            <CurvedLine 
              key={`${i}-${j}`} 
              start={start} 
              end={end}
              opacity={0.12}
            />
          ))
        )}
        {curves.map((curve, i) => (
          Array.from({ length: 4 }).map((_, j) => (
            <ConnectionParticle key={`particle-${i}-${j}`} curve={curve} />
          ))
        ))}
      </group>
    </>
  )
}

function ConnectedEarth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  
  const [colorMap] = useLoader(TextureLoader, [
    '/earth/8k_earth_daymap.jpg',
  ])

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    
    if (earthRef.current) {
      earthRef.current.rotation.y = elapsedTime * 0.03 // Slower rotation
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = elapsedTime * 0.02 // Slower atmosphere rotation
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-5, 3, -5]} intensity={0.8} color="#FFFFFF" />

      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          map={colorMap}
          metalness={0.1}
          roughness={0.7}
          transparent={false}
          depthWrite={true}
          depthTest={true}
        />
      </Sphere>

      <ConnectionNodes />

      <Sphere ref={atmosphereRef} args={[1.1, 64, 64]}>
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.1}
          side={BackSide}
          depthWrite={false}
        />
      </Sphere>

      <Html center>
        <div className="relative">
          <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-[30px] shadow-xl text-center whitespace-nowrap border-4 border-[#4ECDC4]/20">
            <p className="text-2xl font-bold text-[#4ECDC4] animate-pulse">
              We Connect!
            </p>
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-white/95 border-r-[12px] border-r-transparent" />
        </div>
      </Html>
    </>
  )
}

function ConnectedGlobeContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#4ECDC4]/10 via-[#4ECDC4]/10 to-[#4ECDC4]/10 rounded-full blur-3xl" />
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
            <ConnectedEarth />
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </motion.div>
  )
}

export default function ConnectedGlobe() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ConnectedGlobeContent />
    </ErrorBoundary>
  )
} 