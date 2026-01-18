import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StarText, THEME, DATA, ParticleImage } from './SharedComponents';

export const IntroSlide = ({ isFist, isActive }) => {
  const textGroupRef = useRef();
  const imageGroupRef = useRef();
  const ringMaterialRef = useRef();
  
  // 亮度控制 ref
  const brightnessRef = useRef(0);

  useFrame((state, delta) => {
    const isFocused = isFist && isActive;
    const speed = 4 * delta;

    // 1. 文字组动画
    if (textGroupRef.current) {
      const targetY = isFocused ? 1.2 : 0;
      textGroupRef.current.position.y = THREE.MathUtils.lerp(textGroupRef.current.position.y, targetY, speed);
    }

    // 2. Logo图片位置动画
    if (imageGroupRef.current) {
      const targetScale = isFocused ? 1.0 : 0;
      const currentScale = imageGroupRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, speed);
      imageGroupRef.current.scale.set(nextScale, nextScale, nextScale);
    }

    // 3. 亮度动画控制 (峰值 1.1)
    const targetBrightness = isFocused ? 0.9 : 0;
    brightnessRef.current = THREE.MathUtils.lerp(brightnessRef.current, targetBrightness, speed);

    // 4. 圆环亮度反向控制
    if (ringMaterialRef.current) {
      const targetRingOpacity = isActive ? (isFist ? 0.1 : 0.4) : 0.1;
      ringMaterialRef.current.opacity = THREE.MathUtils.lerp(ringMaterialRef.current.opacity, targetRingOpacity, speed);
    }
  });

  return (
    <group>
      {/* === A组：头部标题区 === */}
      <group ref={textGroupRef}>
        <StarText isFist={isFist} isActive={isActive} position={[0, 2.8, 0]} size={1.1} color={THEME.primary}>
          {DATA.intro.title}
        </StarText>
        <StarText isFist={isFist} isActive={isActive} position={[0, 2.1, 0]} size={0.6} color={THEME.secondary}>
          {DATA.intro.subtitle}
        </StarText>
      </group>

      {/* === B组：Logo图片区 === */}
      <group ref={imageGroupRef} position={[0, 1.9, 0]} scale={[0, 0, 0]}>
         {/* 🌟 核心修改：调整密度。
             配合新的 Shader，160 左右应该能呈现出中间密、边缘有大粒子飘散的效果。
             如果觉得太密就改小，觉得太疏就改大。
         */}
         <ParticleImage 
           url="/logo.png" 
           position={[0, 0, 0]} 
           scale={2.2} 
           density={320} 
           brightness={brightnessRef.current} 
         />
      </group>

      {/* === C组：中间信息区 === */}
      <StarText isFist={isFist} isActive={isActive} position={[0, 0.2, 0]} size={0.4} color="white" opacity={1.0}>
        {DATA.intro.desc}
      </StarText>
      
      {/* === D组：底部圆环区 === */}
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

      {/* === E组：最底部信息区 === */}
      <StarText isFist={isFist} isActive={isActive} position={[0, -1.6, 0]} size={0.5} color={THEME.gold}>
        {DATA.intro.info}
      </StarText>
      
    </group>
  );
};