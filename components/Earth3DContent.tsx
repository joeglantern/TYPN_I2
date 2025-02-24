'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ErrorBoundary } from 'react-error-boundary'

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const { scene } = useGLTF('/earth/scene.gltf')

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002
    }
  })

  return <primitive ref={earthRef} object={scene} scale={1.5} />
}

function ErrorFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center text-red-500">
      Error loading 3D content
    </div>
  )
}

export default function Earth3DContent() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, 5]
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[1, 1, 1]} 
          castShadow
          intensity={1}
        />
        <Earth />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </ErrorBoundary>
  )
} 