import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const useIntroAnimation = (groupRef) => {
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const startTime = useRef(null);

  useFrame((state) => {
    if (isIntroFinished || !groupRef.current) return;

    if (startTime.current === null) startTime.current = state.clock.elapsedTime;

    const elapsed = state.clock.elapsedTime - startTime.current;
    
    // 你设置了 5秒，时间比较充裕
    const duration = 5.0; 

    if (elapsed < duration) {
      const t = elapsed / duration;
      const ease = 1 - Math.pow(1 - t, 3);

      // 1. 位置: 按照你的参数 (-10, -5) -> (0, 0)
      groupRef.current.position.z = THREE.MathUtils.lerp(-10, 0, ease);
      groupRef.current.position.y = THREE.MathUtils.lerp(-5, 0, ease);

      // 2. 视角: 45度 -> 0度
      groupRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 4, 0, ease);

      // 3. 🌟 关键修改：旋转角度 🌟
      // Math.PI * 1 = 180度 (转到背面)
      // Math.PI * 2 = 360度 (转一圈回主页)
      // Math.PI * 4 = 720度 (转两圈回主页) -> 推荐这个，配合5秒时长视觉效果更好
      groupRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, ease);

    } else {
      // 强制归位
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.rotation.x = 0;
      
      // 🌟 结束时必须强制设为 0 (或者 Math.PI*2 等倍数)，确保正对主页
      groupRef.current.rotation.y = 0; 
      
      setIsIntroFinished(true);
    }
  });

  return isIntroFinished;
};