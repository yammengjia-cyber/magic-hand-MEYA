import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandGesture } from './useHandGesture';
import { useIntroAnimation } from './useIntroAnimation'; // 🌟 1. 引入新文件

import { IntroSlide } from './IntroSlide';
import { SalesSlide } from './SalesSlide';
import { RecsSlide } from './RecsSlide';
import { MapSlide } from './MapSlide';

const StructureGroup = () => {
  const groupRef = useRef();
  
  // 🌟 2. 使用入场动画 Hook
  // 它会自动处理前2秒的动画，并返回 isIntroFinished 告诉我们什么时候结束
  const isIntroFinished = useIntroAnimation(groupRef);

  const { rotateHandX, actionGesture } = useHandGesture();
  const lastHandX = useRef(0.5);
  const [activeIndex, setActiveIndex] = useState(0);

  // 手势防抖变量
  const isFistConfirmed = useRef(false); 
  const fistCooldownRef = useRef(0); 
  const COOLDOWN_FRAMES = 15;

  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.Fog('#02020a', 8, 25); 
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 🌟 3. 如果入场动画还没结束，就不要执行下面的手势逻辑
    if (!isIntroFinished) {
      // 重要：在动画播放时持续同步手势位置，
      // 防止动画刚结束那一瞬间，因为手的位置差导致画面“跳动”
      lastHandX.current = rotateHandX.current;
      return; 
    }

    // === 下面是正常的交互逻辑 (只有动画结束后才会运行) ===

    const rawGestureIsFist = actionGesture.current === 'CLOSED_FIST';

    if (rawGestureIsFist) {
      isFistConfirmed.current = true;
      fistCooldownRef.current = COOLDOWN_FRAMES;
    } else {
      if (fistCooldownRef.current > 0) {
        fistCooldownRef.current -= 1;
      } else {
        isFistConfirmed.current = false;
      }
    }
    
    const isFist = isFistConfirmed.current;

    const currentHandX = rotateHandX.current;
    let handDelta = currentHandX - lastHandX.current;
    if (Math.abs(handDelta) < 0.001) handDelta = 0;

    const currentRotation = groupRef.current.rotation.y;
    const step = Math.PI / 2;
    let rawIndex = Math.round(currentRotation / step);
    let normalizedIndex = ((rawIndex % 4) + 4) % 4;
    let finalIndex = (4 - normalizedIndex) % 4;
    if (activeIndex !== finalIndex) setActiveIndex(finalIndex);

    if (isFist) {
      // ✊ 稳定握拳
      const snapAngle = Math.round(currentRotation / step) * step;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotation, snapAngle, delta * 6);
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, 4.5), delta * 5);
    } else {
      // 🖐️ 稳定松开
      const autoSpeed = -0.1 * delta;
      const handForce = handDelta * 5.0;
      groupRef.current.rotation.y += autoSpeed + handForce;
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), delta * 5);
    }

    lastHandX.current = currentHandX;
  });

  const isFist = isFistConfirmed.current;
  const radius = 5.5; 

  return (
    <group ref={groupRef}>
      <group position={[0, 0, radius]}>
        <IntroSlide isFist={isFist} isActive={activeIndex === 0} />
      </group>
      <group position={[radius, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <SalesSlide isFist={isFist} isActive={activeIndex === 1} />
      </group>
      <group position={[0, 0, -radius]} rotation={[0, Math.PI, 0]}>
        <MapSlide isFist={isFist} isActive={activeIndex === 2} />
      </group>
      <group position={[-radius, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <RecsSlide isFist={isFist} isActive={activeIndex === 3} />
      </group>
    </group>
  );
};

export default StructureGroup;