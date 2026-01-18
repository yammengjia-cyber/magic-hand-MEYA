import React, { useMemo } from 'react';
import * as THREE from 'three';
import { StarText, THEME } from './SharedComponents';

export const MapSlide = ({ isFist, isActive }) => {
   const points = useMemo(() => {
     const count = 8000; const p = new Float32Array(count * 3);
     for(let i=0; i<count; i++) { const theta = Math.random()*Math.PI*2; const phi = Math.acos(2*Math.random()-1); const r = 2.5 + Math.sin(theta*5)*0.5 + Math.cos(phi*4)*0.5; p[i*3]=r*Math.sin(phi)*Math.cos(theta); p[i*3+1]=r*Math.sin(phi)*Math.sin(theta)*0.6; p[i*3+2]=r*Math.cos(phi)*0.8; }
     return p;
   }, []);
   return (
    <group>
     {/* ⬇️ 字号缩小: 1.0 -> 0.75 */}
     <StarText isFist={isFist} isActive={isActive} position={[0, 3.0, 0]} size={0.75} color="white">Audience Distribution</StarText>
     <points>
       <bufferGeometry><bufferAttribute attach="attributes-position" count={8000} array={points} itemSize={3}/></bufferGeometry>
       <pointsMaterial size={0.03} color={THEME.secondary} transparent opacity={isActive ? 0.8 : 0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
     </points>
    </group>
   )
};