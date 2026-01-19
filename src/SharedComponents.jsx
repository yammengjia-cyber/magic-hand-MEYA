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
export const StarText = ({ children, color = "white", position = [0,0,0], size = 1, isActive, opacity = 1, width = 'auto', letterSpacing = '1px' }) => {
  // 简化逻辑：只要isActive，透明度就是1 (除非强制传了opacity)
  const baseOpacity = opacity !== 1 ? opacity : (isActive ? 1.0 : 0.0);

  return (
    <group position={position}>
      <Html transform sprite center distanceFactor={10} style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 100 }}>
        <div style={{ fontFamily: "'Codystar', sans-serif", color: color, fontSize: `${size * 25}px`, textAlign: 'center', whiteSpace: 'pre-wrap', fontWeight: '900', opacity: baseOpacity, letterSpacing: letterSpacing, filter: isActive ? 'none' : `blur(5px)`, transition: 'all 0.5s ease-out', width: width }}>
          {children}
        </div>
      </Html>
    </group>
  );
};

// === 📊 粒子柱子组件 (纯净版：自动报数) ===
export const VolumetricBar = ({ width, height, depth, isActive, position, value, label, isPeak, index }) => {
  // 1. 生成固定的粒子形状 (不长高，也不动)
  const { positions } = useMemo(() => {
    const count = 1500; // 粒子数量适中
    const pos = new Float32Array(count * 3); 
    for(let i=0; i<count; i++) {
      pos[i*3] = (Math.random() - 0.5) * width;
      pos[i*3+1] = (Math.random() - 0.5) * height; 
      pos[i*3+2] = (Math.random() - 0.5) * depth;
    }
    return { positions: pos };
  }, [width, height, depth]);

  const pointsRef = useRef();
  
  // 2. 控制数字显示的开关
  const [showLabels, setShowLabels] = useState(false);

  // 3. 🌟 关键逻辑：自动逐一显示
  useEffect(() => {
    let timeout;
    if (isActive) {
      // 只要翻到这一页，就开始倒计时
      // index * 30ms：第1个立即显示，第2个等30ms，第3个等60ms...
      // 这样会形成一个快速的“多米诺骨牌”效果，不需要握拳
      const delay = index * 30; 
      timeout = setTimeout(() => {
        setShowLabels(true);
      }, delay);
    } else {
      // 翻走时，重置状态
      setShowLabels(false);
    }
    return () => clearTimeout(timeout);
  }, [isActive, index]);

  // 4. 粒子呼吸 (仅仅为了不让画面太死板，很微弱的呼吸)
  useFrame((state) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;
    for(let i=0; i<1500; i++) {
      // 依然保持原位，只是在Y轴微微浮动
      array[i*3+1] = positions[i*3+1] + Math.sin(time + positions[i*3]) * 0.005;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* 柱子本体：isActive时亮度为0.8，否则变暗 */}
      <points ref={pointsRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length/3} array={new Float32Array(positions)} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.03} color={isPeak ? THEME.primary : THEME.secondary} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={isActive ? 0.8 : 0.1} />
      </points>

      {/* 数字和标签：完全由自动计时器控制 */}
      {(isActive && showLabels) && (
        <group position={[0, height/2 + 0.3, 0]}>
           {/* 数值 */}
           <StarText isActive={true} size={0.3} color="white" opacity={1}>{value}</StarText>
           {/* 日期 */}
           <StarText isActive={true} position={[0, -height - 0.5, 0]} size={0.2} color="#888" opacity={1}>{label}</StarText>
        </group>
      )}
    </group>
  );
};

// === 🌐 粒子球组件 (装饰用，保持不变) ===
export const MixedColorSphere = ({ radius, colorPrimary, colorSecondary, isActive, particleCount = 2000 }) => {
  const { positions, colors } = useMemo(() => {
    const count = particleCount; 
    const pos = new Float32Array(count * 3); const cols = new Float32Array(count * 3); const c1 = new THREE.Color(colorPrimary); const c2 = new THREE.Color(colorSecondary);
    for(let i=0; i<count; i++) { const theta = Math.random()*Math.PI*2; const phi = Math.acos(2*Math.random()-1); const r = radius*(0.85+Math.random()*0.15); pos[i*3]=r*Math.sin(phi)*Math.cos(theta); pos[i*3+1]=r*Math.sin(phi)*Math.sin(theta); pos[i*3+2]=r*Math.cos(phi); const mixRatio=Math.random(); if(mixRatio>0.6){cols[i*3]=c1.r;cols[i*3+1]=c1.g;cols[i*3+2]=c1.b;}else{cols[i*3]=c2.r;cols[i*3+1]=c2.g;cols[i*3+2]=c2.b;}}
    return { positions: pos, colors: cols };
  }, [radius, colorPrimary, colorSecondary, particleCount]);

  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length/3} array={positions} itemSize={3} /><bufferAttribute attach="attributes-color" count={colors.length/3} array={colors} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.02} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={isActive ? 0.8 : 0.1} />
    </points>
  )
}

// === 🖼️ 图片转粒子组件 (保持之前的发光逻辑，但去掉复杂的pop) ===
export const ParticleImage = ({ url, scale = 1, position = [0, 0, 0], density = 150, brightness = 0.8, isFist = false }) => {
  const texture = useTexture(url);
  const widthSegments = density;
  const heightSegments = Math.floor(density * (1/3.5)); 

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uBrightness: { value: brightness },
      uPopStrength: { value: 0.0 }, 
    },
    vertexShader: `
      varying vec2 vUv;
      float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
      void main() {
        vUv = uv;
        vec3 pos = position;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float sizeRandomizer = 1.0 + random(vUv * 3.0) * 4.0;
        gl_PointSize = 10.0 * sizeRandomizer * (1.0 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uBrightness;
      uniform float uPopStrength;
      varying vec2 vUv;
      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        // 简单亮度控制
        float finalBrightness = uBrightness * (1.0 + uPopStrength); 
        gl_FragColor = texColor;
        gl_FragColor.rgb *= finalBrightness; 
        gl_FragColor.a *= finalBrightness;
        if (gl_FragColor.a < 0.1) discard;
      }
    `,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending 
  }), [texture]);

  useFrame((state, delta) => {
    if (material.uniforms) {
      // 这里的 pop 依然保留一点点，以防万一你之后还要用
      const targetPop = isFist ? 0.8 : 0.0;
      material.uniforms.uPopStrength.value = THREE.MathUtils.lerp(material.uniforms.uPopStrength.value, targetPop, delta * 5);
      material.uniforms.uBrightness.value = brightness;
    }
  });

  return (
    <points position={position} material={material}>
      <planeGeometry args={[scale * 3.5, scale, widthSegments, heightSegments]} />
    </points>
  );
};

// === 🕸️ 连接线组件 (保持不变) ===
export const FineLinesNatural = ({ positions, color, isActive }) => {
  const linesGeometry = useMemo(() => {
    const points = [];
    const connections = [ [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 3], [3, 5], [5, 0], [2, 4], [4, 6], [6, 0] ];
    connections.forEach(([startIdx, endIdx]) => { points.push(new THREE.Vector3(...positions[startIdx])); points.push(new THREE.Vector3(...positions[endIdx])); });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positions]);
  return (
    <lineSegments geometry={linesGeometry}>
      <lineBasicMaterial color="#ffffff" transparent blending={THREE.AdditiveBlending} linewidth={1} opacity={isActive ? 0.2 : 0.05} />
    </lineSegments>
  )
}