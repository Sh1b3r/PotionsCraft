import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function PotionModel({ color = '#ff52ad', emissive = '#ff2090', isSpinning = true }) {
  const groupRef = useRef();
  const liquidRef = useRef();
  const bubblesRef = useRef();

  const bubbleCount = 20;
  const bubblePositions = useMemo(() => {
    const pos = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.9;
      pos[i * 3 + 1] = -0.6 + Math.random() * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (isSpinning && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
    if (liquidRef.current) {
      const t = state.clock.getElapsedTime();
      liquidRef.current.position.y = -0.3 + Math.sin(t * 2) * 0.02;
    }
    if (bubblesRef.current) {
      const positions = bubblesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < bubbleCount; i++) {
        positions[i * 3 + 1] += delta * 0.3;
        if (positions[i * 3 + 1] > 0.2) {
          positions[i * 3 + 1] = -0.7;
          positions[i * 3] = (Math.random() - 0.5) * 0.8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        }
      }
      bubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Cork Stopper */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.3, 16]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>

      {/* Bottle Neck Rim */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0.1}
          transmission={0.8}
          ior={1.45}
        />
      </mesh>

      {/* Bottle Neck */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.5, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.1}
          transmission={0.85}
          ior={1.45}
        />
      </mesh>

      {/* Bottle Shoulder */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.24, 0.85, 0.45, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.1}
          transmission={0.85}
          ior={1.45}
        />
      </mesh>

      {/* Main Glass Body */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.85, 0.82, 0.9, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.55}
          roughness={0.08}
          metalness={0.05}
          transmission={0.88}
          ior={1.45}
        />
      </mesh>

      {/* Bottom Glass Base */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.82, 0.75, 0.1, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.7}
          roughness={0.15}
          transmission={0.8}
        />
      </mesh>

      {/* INNER LIQUID */}
      <group ref={liquidRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.76, 0.74, 0.75, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>
        <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.76, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.8}
            roughness={0.1}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>

      {/* Rising Bubbles */}
      <points ref={bubblesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={bubbleCount}
            array={bubblePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ffffff"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Inner Glowing Point Light */}
      <pointLight color={color} intensity={2.5} distance={3.5} position={[0, -0.2, 0]} />

      {/* Status Effect Sparkles */}
      <Sparkles
        count={28}
        scale={[2.2, 2.8, 2.2]}
        size={2.5}
        speed={0.6}
        noise={0.3}
        color={color}
      />
    </group>
  );
}

export default function ThreePotionBottle({
  color = '#ff52ad',
  emissive = '#ff2090',
  height = '340px',
  interactive = true,
  autoRotate = true,
}) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0.5, 3.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#99aacc" />
        <pointLight position={[0, 2, 2]} intensity={1.0} />

        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
          <PotionModel color={color} emissive={emissive} isSpinning={autoRotate} />
        </Float>

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(3 * Math.PI) / 4}
          />
        )}
      </Canvas>
    </div>
  );
}