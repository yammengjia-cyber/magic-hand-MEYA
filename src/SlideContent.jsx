import React, { useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const THEME = { primary: "#ff2a6d", secondary: "#05d9e8", accent: "#7c3aed", white: "#ffffff", gold: "#ffd700" };

const DATA = {
  intro: { 
    title: "SWAMPLESQUE", 
    subtitle: "The Ogre-Inspired Burlesque Parody",
    desc: "Winner: Best Cabaret (Adelaide Fringe). \n'Fabulous, filthy and downright funny' - ★★★★★",
    info: "14:00 - 15:10 | Venue 35 | £16.50",
    tags: ["Burlesque", "Comedy", "Drag"]
  },
  sales: [ { day: "04", val: 45 }, { day: "05", val: 62 }, { day: "06", val: 88 }, { day: "07", val: 120 }, { day: "08", val: 90 }, { day: "09", val: 85 }, { day: "10", val: 110 }, { day: "11", val: 140 }, { day: "12", val: 180 }, { day: "13", val: 195 }, { day: "14", val: 200 }, { day: "15", val: 200 }, { day: "16", val: 160 }, { day: "17", val: 150 }, { day: "18", val: 175 }, { day: "19", val: 200 }, { day: "20", val: 200 } ],
  recs: [
    { name: "《La Clique》", color: THEME.white },
    { name: "《The Dreamer》", color: THEME.primary },
    { name: "《1 Hour of Insane Magic》", color: THEME.secondary },
    { name: "《Best of the Feat》", color: THEME.accent },
    { name: "《Ben Hart》", color: THEME.primary },
    { name: "《The Lady Boys of Bangkok》", color: THEME.secondary }, // 最下方之一
    { name: "《The Kaye Hole Hosted by Reuben Kaye》", color: THEME.accent } // 最下方之二
  ]
};

const isHero = (isFist, isActive) => isActive;

// === 文字组件 ===
const StarText = ({ children, color = "white", position = [0,0,0], size = 1, isFist, isActive, opacity = 1, width = 'auto' }) => {
  const show = isHero(isFist, isActive);
  const finalOpacity = isFist && isActive ? opacity : (isActive ? opacity * 0.7 : opacity * 0.1);
  
  return (
    <group position={position}>
      <Html transform sprite center distanceFactor={10} style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 100 }}>
        <div style={{ 
          fontFamily: "'Codystar', sans-serif", color: color, fontSize: `${size * 25}px`, textAlign: 'center', whiteSpace: 'pre-wrap', fontWeight: 'bold',
          opacity: finalOpacity,
          // ⬇️ 4. 字间距缩短为原来的一半 (1px->0.5px, 3px->1.5px)
          letterSpacing: (isFist && isActive) ? '0.5px' : '1.5px',
          filter: isActive ? 'none' : `blur(3px)`, 
          transition: 'all 0.5s ease-out',
          width: width 
        }}>
          {children}
        </div>
      </Html>
    </group>
  );
};

// === 粒子柱子 ===
const VolumetricBar = ({ width, height, depth, color, isFist, isActive, position, value, label }) => {
  const { positions, randoms } = useMemo(() => {
    const count = 2000; const pos = new Float32Array(count * 3); const rnd = new Float32Array(count * 3);
    for(let i=0; i<count; i++) { pos[i*3]=(Math.random()-0.5)*width; pos[i*3+1]=(Math.random()-0.5)*height; pos[i*3+2]=(Math.random()-0.5)*depth; rnd[i*3]=(Math.random()-0.5)*1.5; rnd[i*3+1]=(Math.random()-0.5)*2; rnd[i*3+2]=(Math.random()-0.5)*1.5; }
    return { positions: pos, randoms: rnd };
  }, [width, height, depth]);

  const pointsRef = useRef();
  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime; const geom = pointsRef.current.geometry; const posAttr = geom.attributes.position; const array = posAttr.array;
    const focused = isFist && isActive;
    for(let i=0; i<2000; i++) {
      const tx = positions[i*3]; const ty = positions[i*3+1]; const tz = positions[i*3+2];
      const dx = tx + randoms[i*3] * 0.4; const dy = ty + randoms[i*3+1] * 0.6; const dz = tz + randoms[i*3+2] * 0.4;
      const hover = Math.sin(time * 3 + i) * 0.005;
      const targetX = focused ? tx : dx; const targetY = focused ? ty : dy + hover; const targetZ = focused ? tz : dz;
      array[i*3] += (targetX - array[i*3]) * 0.1; array[i*3+1] += (targetY - array[i*3+1]) * 0.1; array[i*3+2] += (targetZ - array[i*3+2]) * 0.1;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length/3} array={new Float32Array(positions)} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.025} color={color} transparent blending={THREE.AdditiveBlending} sizeAttenuation={true} depthWrite={false} opacity={isFist && isActive ? 1.0 : (isActive ? 0.6 : 0.1)} />
      </points>
      {(isFist && isActive) && (
        <group position={[0, height/2 + 0.3, 0]}>
           <StarText isFist={true} isActive={true} size={0.3} color="white">{value}</StarText>
           <StarText isFist={true} isActive={true} position={[0, -height - 0.5, 0]} size={0.2} color="#888">{label}</StarText>
        </group>
      )}
    </group>
  );
};

// === 粒子球 ===
const MixedColorSphere = ({ radius, colorPrimary, colorSecondary, isFist, isActive }) => {
  const { positions, colors } = useMemo(() => {
    const count = 3000; const pos = new Float32Array(count * 3); const cols = new Float32Array(count * 3); const c1 = new THREE.Color(colorPrimary); const c2 = new THREE.Color(colorSecondary);
    for(let i=0; i<count; i++) { const theta = Math.random()*Math.PI*2; const phi = Math.acos(2*Math.random()-1); const r = radius*(0.85+Math.random()*0.15); pos[i*3]=r*Math.sin(phi)*Math.cos(theta); pos[i*3+1]=r*Math.sin(phi)*Math.sin(theta); pos[i*3+2]=r*Math.cos(phi); const mixRatio=Math.random(); if(mixRatio>0.6){cols[i*3]=c1.r;cols[i*3+1]=c1.g;cols[i*3+2]=c1.b;}else{cols[i*3]=c2.r;cols[i*3+1]=c2.g;cols[i*3+2]=c2.b;}}
    return { positions: pos, colors: cols };
  }, [radius, colorPrimary, colorSecondary]);

  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length/3} array={positions} itemSize={3} /><bufferAttribute attach="attributes-color" count={colors.length/3} array={colors} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.02} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={isFist && isActive ? 1.0 : (isActive ? 0.6 : 0.1)} />
    </points>
  )
}

// === 自然连接线 ===
const FineLinesNatural = ({ positions, color, isFist, isActive }) => {
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

// --- 页面布局 ---

export const IntroSlide = ({ isFist, isActive }) => (
  <group>
    <StarText isFist={isFist} isActive={isActive} position={[0, 2.5, 0]} size={1.45} color={THEME.primary}>{DATA.intro.title}</StarText>
    <StarText isFist={isFist} isActive={isActive} position={[0, 1.8, 0]} size={0.6} color={THEME.secondary}>{DATA.intro.subtitle}</StarText>
    <StarText isFist={isFist} isActive={isActive} position={[0, 0.5, 0]} size={0.4} color="white" opacity={0.9}>{DATA.intro.desc}</StarText>
    <StarText isFist={isFist} isActive={isActive} position={[0, -0.8, 0]} size={0.5} color={THEME.gold}>{DATA.intro.info}</StarText>
    <points rotation={[Math.PI/3, 0, 0]} position={[0, -0.5, 0]}>
       <torusGeometry args={[2.2, 0.6, 24, 120]} />
       <pointsMaterial size={0.03} color={THEME.primary} transparent opacity={isActive ? 0.4 : 0.1} blending={THREE.AdditiveBlending}/>
    </points>
  </group>
);

export const SalesSlide = ({ isFist, isActive }) => {
  const barWidth = 0.15; const gap = 0.08; const totalWidth = DATA.sales.length * (barWidth + gap); const offsetX = -totalWidth / 2;
  return (
    <group>
      <StarText isFist={isFist} isActive={isActive} position={[0, 3.5, 0]} size={1.0} color="white">Daily Sales Trend</StarText>
      <group position={[offsetX, -1.5, 0]}>
        {DATA.sales.map((item, i) => {
          const height = (item.val / 200) * 4.0; const isSoldOut = item.val >= 200;
          return <VolumetricBar key={i} width={barWidth} height={height} depth={barWidth} color={isSoldOut ? THEME.primary : THEME.secondary} isFist={isFist} isActive={isActive} position={[i*(barWidth+gap), height/2, 0]} value={item.val} label={item.day} />;
        })}
      </group>
    </group>
  );
};

export const RecsSlide = ({ isFist, isActive }) => {
  const spherePositions = useMemo(() => [
    [0, 0.2, 0], [1.6, 1.2, 0.3], [-1.7, 0.9, -0.2], [2.1, -0.5, 0.1], [-2.2, -0.3, 0], 
    [0.9, -1.8, -0.3], // 索引 5 (最下方之一)
    [-1.2, -1.7, 0.2]  // 索引 6 (最下方之二)
  ], []);

  return (
  <group>
    <StarText isFist={isFist} isActive={isActive} position={[0, 3.2, 0]} size={0.8} color="white">Other 【Cabaret】<br />Recommendations</StarText>
    
    <FineLinesNatural positions={spherePositions} color={THEME.white} isFist={isFist} isActive={isActive} />
    
    {DATA.recs.map((item, i) => {
      const [x, y, z] = spherePositions[i];
      const sphereRadius = 0.6; 
      
      const nameLength = item.name.length;
      let baseFontSize = nameLength > 25 ? 0.1 : (nameLength > 15 ? 0.12 : 0.15);
      // ⬇️ 3. 字号大一圈 (1.5倍)
      const finalFontSize = baseFontSize * 1.5;

      // ⬇️ 1. 判断是否为最下方的两个球
      const isBottom = i === 5 || i === 6;
      // 如果是最下方，宽度收窄到 140px 以强制换行；其他保持 180px
      const labelWidth = isBottom ? '140px' : '180px';

      return (
        <group key={i} position={[x, y, z]}>
           <MixedColorSphere radius={sphereRadius} colorPrimary={item.color} colorSecondary="#ffffff" isFist={isFist} isActive={isActive} />
           
           {/* ⬇️ 2. 位置更靠近球体 (y从 -1.0 改为 -0.5) */}
           <StarText 
             isFist={isFist} 
             isActive={isActive} 
             position={[0, -0.5, 0]} 
             size={finalFontSize} 
             color="white"
             width={labelWidth} 
           >
             {item.name}
           </StarText>
        </group>
      );
    })}
  </group>
)};

export const MapSlide = ({ isFist, isActive }) => {
   const points = useMemo(() => {
     const count = 8000; const p = new Float32Array(count * 3);
     for(let i=0; i<count; i++) { const theta = Math.random()*Math.PI*2; const phi = Math.acos(2*Math.random()-1); const r = 2.5 + Math.sin(theta*5)*0.5 + Math.cos(phi*4)*0.5; p[i*3]=r*Math.sin(phi)*Math.cos(theta); p[i*3+1]=r*Math.sin(phi)*Math.sin(theta)*0.6; p[i*3+2]=r*Math.cos(phi)*0.8; }
     return p;
   }, []);
   return (
    <group>
     <StarText isFist={isFist} isActive={isActive} position={[0, 3.0, 0]} size={1.0} color="white">Audience Distribution</StarText>
     <points>
       <bufferGeometry><bufferAttribute attach="attributes-position" count={8000} array={points} itemSize={3}/></bufferGeometry>
       <pointsMaterial size={0.03} color={THEME.secondary} transparent opacity={isActive ? 0.8 : 0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
     </points>
    </group>
   )
};