import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

function useDoorGeometry() {
  const doorShape = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-1.0, -1.8);
    shape.quadraticCurveTo(-1.15, -1.8, -1.15, -1.62);
    shape.lineTo(-1.15, 0.78);
    shape.quadraticCurveTo(-1.15, 2.0, 0, 2.0);
    shape.quadraticCurveTo(1.15, 2.0, 1.15, 0.78);
    shape.lineTo(1.15, -1.62);
    shape.quadraticCurveTo(1.15, -1.8, 1.0, -1.8);
    shape.lineTo(-1.0, -1.8);

    return shape;
  }, []);

  const trimGeometry = useMemo(() => {
    const trimCurve = new THREE.CurvePath();
    const z = 0.13;

    trimCurve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-0.53, -1.5, z),
        new THREE.Vector3(-0.53, 0.72, z)
      )
    );
    trimCurve.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.53, 0.72, z),
        new THREE.Vector3(-0.53, 1.43, z),
        new THREE.Vector3(0, 1.43, z)
      )
    );
    trimCurve.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 1.43, z),
        new THREE.Vector3(0.53, 1.43, z),
        new THREE.Vector3(0.53, 0.72, z)
      )
    );
    trimCurve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(0.53, 0.72, z),
        new THREE.Vector3(0.53, -1.5, z)
      )
    );

    return new THREE.TubeGeometry(trimCurve, 100, 0.024, 12, false);
  }, []);

  return { doorShape, trimGeometry };
}

function DoorModel({ open = false, interactive = false, pulse = 0 }) {
  const doorRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { doorShape, trimGeometry } = useDoorGeometry();

  useFrame((state) => {
    if (!doorRef.current) return;

    const knock = Math.sin(state.clock.elapsedTime * 18) * pulse * 0.05;
    const targetRotation = open ? -1.34 : knock;
    doorRef.current.rotation.y += (targetRotation - doorRef.current.rotation.y) * 0.07;

    if (glowRef.current) {
      const targetOpacity = open ? 0.2 : 0.045 + pulse * 0.05;
      glowRef.current.material.opacity += (targetOpacity - glowRef.current.material.opacity) * 0.08;
    }
  });

  return (
    <group
      scale={hovered ? 1.03 : 1}
      onPointerOver={() => interactive && setHovered(true)}
      onPointerOut={() => interactive && setHovered(false)}
    >
      <mesh position={[0, 0, -0.24]} scale={[1.16, 1.05, 1]}>
        <shapeGeometry args={[doorShape]} />
        <meshBasicMaterial color="#f0b85a" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      <mesh ref={glowRef} position={[0, 0, -0.18]} scale={0.96}>
        <shapeGeometry args={[doorShape]} />
        <meshBasicMaterial color="#f7c948" transparent opacity={0.045} depthWrite={false} />
      </mesh>

      <group ref={doorRef} position={[-1.15, 0, 0]}>
        <mesh position={[1.15, 0, -0.09]}>
          <extrudeGeometry
            args={[
              doorShape,
              {
                depth: 0.18,
                bevelEnabled: true,
                bevelSize: 0.014,
                bevelThickness: 0.014,
                bevelSegments: 2,
              },
            ]}
          />
          <meshStandardMaterial color="#06143a" roughness={0.82} />
        </mesh>

        <mesh position={[1.15, 0, 0]}>
          <primitive object={trimGeometry} attach="geometry" />
          <meshStandardMaterial color={hovered ? "#f3c84b" : "#d4af37"} />
        </mesh>

        <mesh position={[1.68, -0.02, 0.165]}>
          <sphereGeometry args={[0.105, 32, 32]} />
          <meshStandardMaterial color={hovered ? "#f3c84b" : "#d4af37"} />
        </mesh>
      </group>

      <mesh position={[0, -1.91, -0.08]} scale={[1.18, 0.12, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color="#06143a" transparent opacity={0.11} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function DoorScene({ open = false, pulse = 0, compact = false, interactive = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0, compact ? 7.4 : 7], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.75} />
      <directionalLight position={[4, 6, 5]} intensity={2.3} />
      <pointLight position={[-3, 2, 4]} intensity={0.8} color="#fff1c2" />
      <DoorModel open={open} pulse={pulse} interactive={interactive} />
    </Canvas>
  );
}
