import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Html, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// === 🎨 1. 配色方案 ===
export const THEME = { 
  primary: "#a78bfa",   
  secondary: "#f4d7da", 
  accent: "#7c3aed",    
  white: "#ffffff",     
  gold: "#ffd700"       
};

// === 📊 2. 核心数据 ===
export const DATA = {
  intro: { 
    title: "SWAMPLESQUE", 
    subtitle: "The Ogre-Inspired Burlesque Parody",
    desc: "Winner: Best Cabaret (Adelaide Fringe). \n'Fabulous, filthy and downright funny' - ★★★★★",
    info: "14:00 - 15:10 | Venue 35 | £16.50",
    tags: ["Burlesque", "Comedy", "Drag"]
  },
  sales: [ 
    { day: "1", val: 40, isPeak: false }, { day: "2", val: 80, isPeak: false }, { day: "3", val: 120, isPeak: false }, { day: "4", val: 100, isPeak: false },
    { day: "5", val: 190, isPeak: true }, { day: "6", val: 200, isPeak: true }, { day: "7", val: 100, isPeak: false }, { day: "8", val: 90, isPeak: false },
    { day: "9", val: 140, isPeak: false }, { day: "10", val: 180, isPeak: true }, { day: "11", val: 110, isPeak: false }, { day: "12", val: 150, isPeak: true },
    { day: "13", val: 130, isPeak: false }, { day: "14", val: 125, isPeak: false }, { day: "15", val: 170, isPeak: true }, { day: "16", val: 180, isPeak: true },
    { day: "17", val: 160, isPeak: true }, { day: "18", val: 155, isPeak: true }, { day: "19", val: 130, isPeak: false }, { day: "20", val: 120, isPeak: false },
    { day: "21", val: 170, isPeak: true }, { day: "22", val: 160, isPeak: true }, { day: "23", val: 140, isPeak: false }, { day: "24", val: 165, isPeak: true },
    { day: "25", val: 150, isPeak: true }
  ],
  recs: [
    { name: "《La Clique》", color: THEME.white },
    { name: "《The Dreamer》", color: THEME.primary },
    { name: "《1 Hour of Insane Magic》", color: THEME.secondary },
    { name: "《Best of the Feat》", color: THEME.accent },
    { name: "《Ben Hart》", color: THEME.primary },
    { name: "《The Lady Boys of Bangkok》", color: THEME.secondary },
    { name: "《The Kaye Hole Hosted by Reuben Kaye》", color: THEME.accent }
  ]
};

export const isHero = (isFist, isActive) => isActive;

// === 📝 通用文字组件 ===
export const StarText = ({ children, color = "white", position = [0,0,0], size = 1, isFist, isActive, opacity = 1, width = 'auto', letterSpacing = null }) => {
  const baseOpacity = opacity !== 1 ? opacity : (isFist && isActive ? 1 : (isActive ? 0.7 : 0.1));
  const defaultSpacing = (isFist && isActive) ? '1px' : '3px';
  const spacing = letterSpacing || defaultSpacing;

  return (
    <group position={position}>
      <Html transform sprite center distanceFactor={10} style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 100 }}>
        <div style={{ fontFamily: "'Codystar', sans-serif", color: color, fontSize: `${size * 25}px`, textAlign: 'center', whiteSpace: 'pre-wrap', fontWeight: '900', opacity: baseOpacity, letterSpacing: spacing, filter: isActive ? 'none' : `blur(3px)`, transition: 'all 0.5s ease-out', width: width }}>
          {children}
        </div>
      </Html>
    </group>
  );
};

// === 📊 粒子柱子组件 (回归版：形状静止 + 数字逐一弹出) ===
export const VolumetricBar = ({ width, height, depth, isFist, isActive, position, value, label, isPeak, index }) => {
  // 1. 生成完整的长方体粒子
  const { positions, randoms } = useMemo(() => {
    const count = 2000; 
    const pos = new Float32Array(count * 3); 
    const rnd = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
      // 粒子均匀分布在完整的长宽高内
      pos[i*3] = (Math.random() - 0.5) * width;
      pos[i*3+1] = (Math.random() - 0.5) * height; 
      pos[i*3+2] = (Math.random() - 0.5) * depth;
      
      // 随机微动参数
      rnd[i*3] = (Math.random() - 0.5) * 0.1;
      rnd[i*3+1] = (Math.random() - 0.5) * 0.1;
      rnd[i*3+2] = (Math.random() - 0.5) * 0.1;
    }
    return { positions: pos, randoms: rnd };
  }, [width, height, depth]);

  const pointsRef = useRef();

  // 🌟 2. 仅控制文字的显示状态
  const [showLabels, setShowLabels] = useState(false);

  // 🌟 3. 顺序延迟逻辑
  useEffect(() => {
    let timeout;
    if (isFist && isActive) {
      // 握拳时：根据 index 延迟显示文字
      // index * 80ms (每个数字间隔60毫秒弹出)
      const delay = index * 60; 
      timeout = setTimeout(() => {
        setShowLabels(true);
      }, delay);
    } else {
      // 松手时：立即隐藏文字
      setShowLabels(false);
    }
    return () => clearTimeout(timeout);
  }, [isFist, isActive, index]);

  // 4. 粒子微动动画 (仅呼吸感，不改变形状)
  useFrame((state) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const array = posAttr.array;

    // 让粒子在原地轻微漂浮，保持画面鲜活
    for(let i=0; i<2000; i++) {
      // 恢复到原始位置 + 随机扰动
      const tx = positions[i*3];
      const ty = positions[i*3+1];
      const tz = positions[i*3+2];

      const time = state.clock.elapsedTime;
      // 极小的波动
      const hover = Math.sin(time + positions[i*3]) * 0.002; 

      // 简单平滑移动回到设定位置 (防止之前动画的残留)
      array[i*3] += (tx - array[i*3]) * 0.1;
      array[i*3+1] += ((ty + hover) - array[i*3+1]) * 0.1;
      array[i*3+2] += (tz - array[i*3+2]) * 0.1;
    }
    posAttr.needsUpdate = true;
  });

  return (
    // 🌟 位置固定，形状固定
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length/3} array={new Float32Array(positions)} itemSize={3} /></bufferGeometry>
        {/* 激活时完全不透明(1.0)，未激活时半透明(0.1) */}
        <pointsMaterial size={0.025} color={isPeak ? THEME.primary : THEME.secondary} transparent blending={THREE.AdditiveBlending} sizeAttenuation={true} depthWrite={false} opacity={isFist && isActive ? 1.0 : (isActive ? 0.6 : 0.1)} />
      </points>

      {/* 🌟 文字标签：根据 showLabels 决定是否渲染 */}
      {(isFist && isActive && showLabels) && (
        <group position={[0, height/2 + 0.3, 0]}>
           {/* 数字 */}
           <StarText isFist={true} isActive={true} size={0.3} color="white">{value}</StarText>
           {/* 日期 (在柱子底部下方) */}
           <StarText isFist={true} isActive={true} position={[0, -height - 0.5, 0]} size={0.2} color="#888">{label}</StarText>
        </group>
      )}
    </group>
  );
};

// === 🌐 粒子球组件 (保持不变) ===
export const MixedColorSphere = ({ radius, colorPrimary, colorSecondary, isFist, isActive, particleCount = 3000 }) => {
  const { positions, colors } = useMemo(() => {
    const count = particleCount; 
    const pos = new Float32Array(count * 3); const cols = new Float32Array(count * 3); const c1 = new THREE.Color(colorPrimary); const c2 = new THREE.Color(colorSecondary);
    for(let i=0; i<count; i++) { const theta = Math.random()*Math.PI*2; const phi = Math.acos(2*Math.random()-1); const r = radius*(0.85+Math.random()*0.15); pos[i*3]=r*Math.sin(phi)*Math.cos(theta); pos[i*3+1]=r*Math.sin(phi)*Math.sin(theta); pos[i*3+2]=r*Math.cos(phi); const mixRatio=Math.random(); if(mixRatio>0.6){cols[i*3]=c1.r;cols[i*3+1]=c1.g;cols[i*3+2]=c1.b;}else{cols[i*3]=c2.r;cols[i*3+1]=c2.g;cols[i*3+2]=c2.b;}}
    return { positions: pos, colors: cols };
  }, [radius, colorPrimary, colorSecondary, particleCount]);

  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length/3} array={positions} itemSize={3} /><bufferAttribute attach="attributes-color" count={colors.length/3} array={colors} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.02} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={isFist && isActive ? 1.0 : (isActive ? 0.6 : 0.1)} />
    </points>
  )
}

// === 🖼️ 图片转粒子组件 (保持你满意的版本) ===
export const ParticleImage = ({ url, scale = 1, position = [0, 0, 0], density = 150, brightness = 0.8 }) => {
  const texture = useTexture(url);
  const widthSegments = density;
  const heightSegments = Math.floor(density * (1/3.5)); 

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uBrightness: { value: brightness },
    },
    vertexShader: `
      varying vec2 vUv;
      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vUv = uv;
        vec3 pos = position;
        vec2 d = abs(vUv - 0.5);
        float rectDist = max(d.x, d.y);
        float inEdgeZone = step(0.35, rectDist);
        float luckyNumber = random(vUv + 1.0);
        float canFly = inEdgeZone * step(0.80, luckyNumber);
        float baseJitter = 0.01;
        float flightDist = 0.4; 
        float totalOffset = baseJitter + (canFly * flightDist);

        pos.x += (random(vUv) - 0.5) * totalOffset;
        pos.y += (random(vUv + 1.2) - 0.5) * totalOffset;
        pos.z += (random(vUv + 2.4) - 0.5) * totalOffset * 2.0; 

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float sizeRandomizer = 1.0 + random(vUv * 3.0) * 4.0;
        gl_PointSize = 10.0 * sizeRandomizer * (1.0 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uBrightness;
      varying vec2 vUv;
      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        vec2 d = abs(vUv - 0.5);
        float rectDist = max(d.x, d.y);
        float mask = 1.0 - smoothstep(0.45, 0.5, rectDist);
        float lightGradient = 1.0 - (rectDist * 0.4);
        float finalBrightness = uBrightness * 1.1 * lightGradient;
        gl_FragColor = texColor;
        gl_FragColor.rgb *= finalBrightness; 
        gl_FragColor.a *= mask * finalBrightness;
        if (gl_FragColor.a < 0.1) discard;
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending 
  }), [texture]);

  useFrame(() => {
    if (material.uniforms) {
      material.uniforms.uBrightness.value = brightness;
    }
  });

  return (
    <points position={position} material={material}>
      <planeGeometry args={[scale * 3.5, scale, widthSegments, heightSegments]} />
    </points>
  );
};

// === 🕸️ 连接线组件 ===
export const FineLinesNatural = ({ positions, color, isFist, isActive }) => {
  const linesGeometry = useMemo(() => {
    const points = [];
    const connections = [ [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 3], [3, 5], [5, 0], [2, 4], [4, 6], [6, 0] ];
    connections.forEach(([startIdx, endIdx]) => { points.push(new THREE.Vector3(...positions[startIdx])); points.push(new THREE.Vector3(...positions[endIdx])); });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positions]);
  return (
    <lineSegments geometry={linesGeometry}>
      <lineBasicMaterial color="#ffffff" transparent blending={THREE.AdditiveBlending} linewidth={1} opacity={isFist && isActive ? 0.5 : (isActive ? 0.2 : 0.05)} />
    </lineSegments>
  )
}