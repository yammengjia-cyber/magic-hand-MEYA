import React, { useMemo } from 'react';
import * as THREE from 'three';

const ParticlePlane = ({ color = '#a855f7', ...props }) => {
  // 创建一个 4x3 的平面，切分得更细一些(64x64)，让粒子更多更密
  const geometry = useMemo(() => new THREE.PlaneGeometry(4, 3, 64, 64), []);

  return (
    <points args={[geometry]} {...props}>
      <pointsMaterial
        size={0.04}             // 稍微调大了一点点粒子
        color={color}
        transparent={true}
        opacity={0.8}           // 稍微调高不透明度，让它更清晰
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending} // 叠加发光模式
        depthWrite={false}
      />
    </points>
  );
};

export default ParticlePlane;