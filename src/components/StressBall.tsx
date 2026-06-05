import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface BallProps {
  onHit?: () => void;
  cumulativeDeform?: number;
}

export interface BallRef {
  triggerDeform: () => void;
}

const Ball = forwardRef<BallRef, BallProps>(({ onHit, cumulativeDeform = 0 }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  const originalPositions = useRef<Float32Array | null>(null);
  const [deform, setDeform] = useState(0);
  const [vibration, setVibration] = useState(0);
  const [impactPoint, setImpactPoint] = useState<THREE.Vector3 | null>(null);

  useImperativeHandle(ref, () => ({
    triggerDeform: () => {
      triggerBallDeform();
    }
  }));

  const triggerBallDeform = () => {
    setImpactPoint(new THREE.Vector3(0.5, 1.3, 0));
    setDeform(1);
    setVibration(1);

    setTimeout(() => {
      let progress = 0;
      const duration = 600;
      const startTime = Date.now();

      const recover = () => {
        progress = Math.min((Date.now() - startTime) / duration, 1);
        
        const deformEased = 1 - Math.pow(progress, 0.7);
        setDeform(deformEased);
        
        const vibrationEased = 1 - Math.pow(progress, 0.3);
        setVibration(vibrationEased);

        if (progress < 1) {
          requestAnimationFrame(recover);
        } else {
          setImpactPoint(null);
        }
      };

      recover();
    }, 50);
  };

  useEffect(() => {
    if (geometryRef.current) {
      originalPositions.current = geometryRef.current.attributes.position.array.slice() as Float32Array;
    }
  }, []);

  useFrame((state) => {
    if (meshRef.current && geometryRef.current && originalPositions.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material && material.uniforms) {
        material.uniforms.time.value = state.clock.elapsedTime;
        material.uniforms.distort.value = 0.15 + deform * 0.8 + cumulativeDeform * 0.5;
      }

      const positions = geometryRef.current.attributes.position;
      const originalPos = originalPositions.current;
      
      for (let i = 0; i < positions.count; i++) {
        const ox = originalPos[i * 3];
        const oy = originalPos[i * 3 + 1];
        const oz = originalPos[i * 3 + 2];
        
        let newX = ox;
        let newY = oy;
        let newZ = oz;
        
        // 累积形变：变成饼状（从底部固定，顶部被压）
        if (cumulativeDeform > 0) {
          const squashFactor = 1 - cumulativeDeform * 0.75; // 垂直方向压缩
          const expandFactor = 1 + cumulativeDeform * 0.5; // 水平方向扩展
          
          // 底部固定(y = -1.5)，顶部压下去
          const normalizedY = (oy + 1.5) / 3; // 0在底部，1在顶部
          const squashY = normalizedY * squashFactor;
          newY = -1.5 + squashY * 3;
          
          // 水平方向扩展
          newX = ox * expandFactor;
          newZ = oz * expandFactor;
        }
        
        // 单次砸击形变
        if (impactPoint && deform > 0) {
          const dist = Math.sqrt(
            (newX - impactPoint.x) ** 2 +
            (newY - impactPoint.y) ** 2 +
            (newZ - impactPoint.z) ** 2
          );
          
          if (dist < 1.8) {
            const influence = Math.exp(-dist * 1.5) * deform;
            const dir = new THREE.Vector3(newX, newY, newZ).normalize();
            const impactDir = new THREE.Vector3(-0.4, -0.9, 0).normalize();
            
            newX = newX + impactDir.x * influence * 1.6 * 1.5;
            newY = newY + impactDir.y * influence * 1.6 * 1.5;
            newZ = newZ + impactDir.z * influence * 1.6 * 1.5;
            
            newX += dir.x * influence * 0.3 * 1.5;
            newY += dir.y * influence * 0.3 * 1.5;
            newZ += dir.z * influence * 0.3 * 1.5;
          }
        }
        
        // 震动效果
        if (vibration > 0) {
          const noise = Math.sin(state.clock.elapsedTime * 30 + i) * 0.05 * vibration;
          newX += noise;
          newY += noise * 0.5;
          newZ += noise * 0.3;
        }
        
        positions.setXYZ(i, newX, newY, newZ);
      }
      
      positions.needsUpdate = true;
      geometryRef.current.computeVertexNormals();
      
      // 轻微的整体位置调整
      if (deform > 0) {
        meshRef.current.position.y = deform * 0.15;
      } else {
        meshRef.current.position.y = 0;
      }
    }
  });

  const handleHit = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onHit?.();
  };

  return (
    <>
      <Float speed={1} rotationIntensity={0.15} floatIntensity={0.15}>
        <mesh ref={meshRef} onClick={handleHit} receiveShadow castShadow position={[0, 0, 0]}>
          <sphereGeometry ref={geometryRef} args={[1.5, 80, 80]} />
          <MeshDistortMaterial
            color={deform > 0 ? "#C0392B" : "#E74C3C"}
            attach="material"
            distort={0.15}
            speed={1.5}
            roughness={0.9}
            metalness={0.1}
            emissive="#FF6B6B"
            emissiveIntensity={0.15 + deform * 0.2}
          />
        </mesh>
      </Float>
    </>
  );
});

Ball.displayName = 'Ball';

interface SceneProps {
  onHit?: () => void;
  cumulativeDeform?: number;
}

function Scene({ onHit, cumulativeDeform = 0 }: SceneProps) {
  const [swingAngle, setSwingAngle] = useState(0);
  const ballRef = useRef<BallRef>(null);

  const maxSwingAngle = 1.2 + cumulativeDeform * 0.3; // 球越扁，旋转角度稍大一些

  const swingHammer = () => {
    let progress = 0;
    const duration = 300;
    const startTime = Date.now();
    let impactTriggered = false;

    const animate = () => {
      progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const angle = eased * maxSwingAngle;
      setSwingAngle(angle);

      if (progress > 0.6 && !impactTriggered) {
        impactTriggered = true;
        ballRef.current?.triggerDeform();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          progress = 0;
          const returnStartTime = Date.now();

          const returnAnimate = () => {
            progress = Math.min((Date.now() - returnStartTime) / 400, 1);
            const easedReturn = progress * progress * (3 - 2 * progress);
            const angle = maxSwingAngle - easedReturn * maxSwingAngle;
            setSwingAngle(angle);

            if (progress < 1) {
              requestAnimationFrame(returnAnimate);
            } else {
              onHit?.();
            }
          };

          returnAnimate();
        }, 50);
      }
    };

    animate();
  };

  const handleBallHit = () => {
    swingHammer();
  };

  const squashFactor = 1 - cumulativeDeform * 0.75;
  const ballTopY = -1.5 + 3 * squashFactor;
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.4} />

      <Ball ref={ballRef} onHit={handleBallHit} cumulativeDeform={cumulativeDeform} />

      <group rotation={[0, 0, -2.8+swingAngle]} position={[4, 0.8 + (ballTopY - 0) * 0.5, 0]} scale={[0.7, 0.7, 0.7]}>
        <mesh position={[0, -5.2, 0]}>
          <boxGeometry args={[2, 1.5, 1.5]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.1} roughness={0.9} />
        </mesh>

        <mesh position={[0, -2.1, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 5.2, 16]} />
          <meshStandardMaterial color="#8B4513" metalness={0.1} roughness={0.8} />
        </mesh>
      </group>
    </>
  );
}

interface StressBallProps {
  onComplete?: () => void;
}

function StressBall({ onComplete }: StressBallProps) {
  const [clicks, setClicks] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [cumulativeDeform, setCumulativeDeform] = useState(0);
  const lastHitTime = useRef<number>(0);

  const handleHit = () => {
    const now = Date.now();
    const timeSinceLastHit = now - lastHitTime.current;
    lastHitTime.current = now;
    
    setClicks((prev) => prev + 1);

    setIntensity((prev) => {
      const newIntensity = Math.min(prev + 18, 100);
      setTimeout(() => setIntensity((prev) => Math.max(0, prev - 6)), 150);
      return newIntensity;
    });

    // 根据砸击频率增加累积形变
    setCumulativeDeform((prev) => {
      let increment = 0.05;
      // 如果砸得快，累积更多
      if (timeSinceLastHit < 800) {
        increment = 0.12;
      }
      if (timeSinceLastHit < 500) {
        increment = 0.2;
      }
      if (timeSinceLastHit < 300) {
        increment = 0.3;
      }
      return Math.min(prev + increment, 1.0);
    });
  };

  // 累积形变缓慢恢复
  useEffect(() => {
    if (cumulativeDeform > 0) {
      const timer = setInterval(() => {
        setCumulativeDeform((prev) => Math.max(0, prev - 0.008));
      }, 50);
      return () => clearInterval(timer);
    }
  }, [cumulativeDeform]);

  useEffect(() => {
    if (clicks > 0 && clicks % 50 === 0 && !showMessage) {
      setShowMessage(true);
      if (onComplete) setTimeout(() => onComplete(), 1000);
    }
  }, [clicks, showMessage, onComplete]);

  const getMessage = () => {
    if (clicks < 10) return '点击压力球释放压力！';
    if (clicks < 25) return '压力正在释放...';
    if (clicks < 40) return '很好，继续加油！';
    if (clicks < 50) return '快要完成了！';
    return '太棒了！压力已经被释放！🎉';
  };

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 16], fov: 35 }}>
        <Scene onHit={handleHit} cumulativeDeform={cumulativeDeform} />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '0.6rem 1.5rem',
          borderRadius: '25px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        }}
      >
        <span style={{ fontSize: '1.3rem', color: '#7F8C8D' }}>
          砸击次数: <span style={{ fontWeight: 800, color: '#E74C3C', fontSize: '1.8rem' }}>{clicks}</span>
        </span>
      </div>

      {intensity > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            maxWidth: '350px',
            height: '14px',
            background: '#E8E8E8',
            borderRadius: '7px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${intensity}%`,
              background: 'linear-gradient(90deg, #FF8C66, #E74C3C, #F39C12)',
              borderRadius: '7px',
              transition: 'width 0.15s ease',
              boxShadow: '0 0 12px rgba(231, 76, 60, 0.6)',
            }}
          />
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '3.8rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#7F8C8D',
          fontSize: '1.1rem',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '0.4rem 1.2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {getMessage()}
      </div>

      {cumulativeDeform > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 200, 100, 0.95)',
            padding: '0.4rem 1rem',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: '#8B4513', fontWeight: 600 }}>
            🍪 压扁程度: {Math.round(cumulativeDeform * 100)}%
          </span>
        </div>
      )}

      {showMessage && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #F0FFF4, #E8F4F8)',
            padding: '2rem 3rem',
            borderRadius: '25px',
            boxShadow: '0 15px 50px rgba(0,0,0,0.18)',
            animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          <p style={{ fontWeight: 700, color: '#1ABC9C', fontSize: '1.5rem', margin: 0 }}>
            🎉 压力释放完成！
          </p>
        </div>
      )}
    </div>
  );
}

export default StressBall;
