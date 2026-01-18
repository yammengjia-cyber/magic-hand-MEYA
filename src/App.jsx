import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import StructureGroup from './StructureGroup';

const containerStyle = {
  width: '100vw', height: '100vh', backgroundColor: '#02020a', margin: 0, overflow: 'hidden', position: 'fixed', top: 0, left: 0,
};

function App() {
  return (
    <div style={containerStyle}>
      <Canvas camera={{ position: [0, 1, 16], fov: 50 }}>
        <color attach="background" args={['#02020a']} />
        
        <Stars radius={200} depth={150} count={8000} factor={4} saturation={0.5} fade speed={0.2} />
        <ambientLight intensity={0.1} color="#581c87" /> 
        <pointLight position={[10, 10, 10]} intensity={1.0} color="#d8b4fe" />

        {/* 🌟 氛围感紫色星星 (清晰版) */}
        <Sparkles 
          count={400}     // 数量加倍
          scale={25} 
          size={4}        // 尺寸变大
          speed={0.3} 
          opacity={0.8}   // 不透明度提高，看得更清楚
          color="#a855f7" 
        />

        <Suspense fallback={null}>
          <StructureGroup />
        </Suspense>

        <OrbitControls enableZoom={true} enablePan={false} minDistance={5} maxDistance={30} />

        {/* 🌟 后期处理：只保留辉光，去掉模糊 */}
        <EffectComposer multisampling={0}>
          {/* ❌ 删除了 DepthOfField，保证绝对清晰 */}
          
          {/* Bloom: 这种微光会让清晰的粒子更有质感 */}
          <Bloom luminanceThreshold={1.1} intensity={0.3} levels={9} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />
        </EffectComposer>

      </Canvas>
    </div>
  );
}

export default App;