"use client"

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const { scene } = useGLTF('/earth/scene.gltf')

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002
    }
  })

  return <primitive ref={earthRef} object={scene} scale={1.5} />
}

export default function Earth3D() {
  return (
    <div className="h-[400px] w-full">
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, 5]
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} />
        <Earth />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
} 