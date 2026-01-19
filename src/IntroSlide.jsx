import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StarText, THEME, DATA, ParticleImage } from './SharedComponents';

export const IntroSlide = ({ isFist, isActive }) => {
  // 1. 定义两个“电梯”：一个往上走，一个往下走
  const topGroupRef = useRef();
  const bottomGroupRef = useRef();
  
  // 2. 图片和亮度的控制
  const imageGroupRef = useRef();
  const brightnessRef = useRef(0);
  const ringMaterialRef = useRef();

  useFrame((state, delta) => {
    const isFocused = isFist && isActive;
    const speed = 5 * delta; // 动画速度

    // === ⬆️ 上层电梯：带着标题往上飞 ===
    if (topGroupRef.current) {
      // 握拳时 Y=2.5 (上移)，松手时 Y=0 (原位)
      const targetTopY = isFocused ? 2.5 : 0;
      topGroupRef.current.position.y = THREE.MathUtils.lerp(topGroupRef.current.position.y, targetTopY, speed);
    }

    // === ⬇️ 下层电梯：带着挡视线的文字往下沉 ===
    if (bottomGroupRef.current) {
      // 握拳时 Y=-3.0 (下移)，松手时 Y=0 (原位)
      const targetBottomY = isFocused ? -3.0 : 0;
      bottomGroupRef.current.position.y = THREE.MathUtils.lerp(bottomGroupRef.current.position.y, targetBottomY, speed);
    }

    // === 🖼️ 图片动画：放大出现 ===
    if (imageGroupRef.current) {
      // 握拳时放大到 1.0，松手缩小回 0
      const targetScale = isFocused ? 1.0 : 0;
      const currentScale = imageGroupRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, speed);
      imageGroupRef.current.scale.set(nextScale, nextScale, nextScale);
    }

    // === 💡 亮度动画：握拳变亮 ===
    const targetBrightness = isFocused ? 1.5 : 0;
    brightnessRef.current = THREE.MathUtils.lerp(brightnessRef.current, targetBrightness, speed);

    // === 💍 圆环动画：握拳淡出 ===
    if (ringMaterialRef.current) {
      const targetRingOpacity = isActive ? (isFist ? 0.05 : 0.4) : 0;
      ringMaterialRef.current.opacity = THREE.MathUtils.lerp(ringMaterialRef.current.opacity, targetRingOpacity, speed);
    }
  });

  return (
    <group>
      {/* === ⬆️ 上层组 (Ref绑定在这里) === */}
      <group ref={topGroupRef}>
        <StarText isFist={isFist} isActive={isActive} position={[0, 2.8, 0]} size={1.1} color={THEME.primary}>
          {DATA.intro.title}
        </StarText>
        <StarText isFist={isFist} isActive={isActive} position={[0, 2.1, 0]} size={0.6} color={THEME.secondary}>
          {DATA.intro.subtitle}
        </StarText>
      </group>

      {/* === 🖼️ 中间 Logo 图片 === */}
      <group ref={imageGroupRef} position={[0, 0.5, 0]} scale={[0, 0, 0]}>
         {/* 注意：isFist={isFist} 必须传进去，图片才会发光 */}
         <ParticleImage 
           url="/logo.png" 
           position={[0, 0, 0]} 
           scale={2.5} 
           density={200} 
           brightness={brightnessRef.current} 
           isFist={isFist} 
         />
      </group>

      {/* === ⬇️ 下层组 (Ref绑定在这里) === */}
      {/* 🌟 关键点：原来挡住图片的文字，都被装进了这个 bottomGroupRef 里 */}
      <group ref={bottomGroupRef}>
        <StarText isFist={isFist} isActive={isActive} position={[0, 0.2, 0]} size={0.4} color="white" opacity={1.0}>
          {DATA.intro.desc}
        </StarText>
        
        <points rotation={[Math.PI/3, 0, 0]} position={[0, -0.1, 0]}>
          <torusGeometry args={[2.0, 0.4, 40, 200]} />
          <pointsMaterial 
              ref={ringMaterialRef}
              size={0.025} 
              color={THEME.primary} 
              transparent 
              opacity={0.1} 
              blending={THREE.AdditiveBlending}
          />
        </points>

        <StarText isFist={isFist} isActive={isActive} position={[0, -1.6, 0]} size={0.5} color={THEME.gold}>
          {DATA.intro.info}
        </StarText>
      </group>
      
    </group>
  );
};