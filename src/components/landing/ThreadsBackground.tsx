import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ThreadsBackgroundProps {
  className?: string;
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
}

function AnimatedPoints({ color, amplitude, distance }: {
  color: [number, number, number];
  amplitude: number;
  distance: number;
}) {
  const ref = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] = Math.sin(time + positions[i] * distance) * amplitude;
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.rotation.x = time * 0.05;
      ref.current.rotation.y = time * 0.075;
    }
  });

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={new THREE.Color(color[0], color[1], color[2])}
        size={0.002}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
}

export const ThreadsBackground: React.FC<ThreadsBackgroundProps> = ({
  className = '',
  color = [0, 0, 0],
  amplitude = 1.5,
  distance = 0.5,
  enableMouseInteraction = false
}) => {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ background: 'transparent' }}
      >
        <AnimatedPoints 
          color={color} 
          amplitude={amplitude} 
          distance={distance} 
        />
      </Canvas>
    </div>
  );
};