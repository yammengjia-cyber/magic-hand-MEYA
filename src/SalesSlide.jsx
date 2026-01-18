import React from 'react';
import { StarText, VolumetricBar, MixedColorSphere, THEME, DATA } from './SharedComponents';

export const SalesSlide = ({ isFist, isActive }) => {
  // === 📐 1. 图表尺寸配置 (想改疏密程度改这里) ===
  const barWidth = 0.1;  // 柱子的宽度 (越小越细)
  const gap = 0.12;      // 柱子之间的空隙 (越大越宽敞)
  
  // 自动计算图表总宽度，保持居中
  const totalWidth = DATA.sales.length * (barWidth + gap); 
  const offsetX = -totalWidth / 2;

  return (
    <group>
      {/* 🏷️ 大标题位置 */}
      <StarText isFist={isFist} isActive={isActive} position={[0, 3.5, 0]} size={0.75} color="white">Daily Sales Volume</StarText>
      
      {/* === 🧩 2. 图例/角标配置 (想改位置改这里) === */}
      {/* [x, y, z] -> [左右, 上下, 前后] */}
      {/* 3.2: 靠右, -1.5: 靠下 */}
      <group position={[3.0, -1.5, 0]}>
        
        {/* Peak day 说明项 */}
        <group position={[0, 0.25, 0]}>
          {/* 球的大小 radius=0.05 */}
          {/* 🌟 核心修改：传入 particleCount={600} 让粒子变稀疏 (默认是3000) */}
          <MixedColorSphere 
            radius={0.05} 
            colorPrimary={THEME.primary} 
            colorSecondary={THEME.primary} 
            isFist={isFist} 
            isActive={isActive} 
            particleCount={200} // ✨ 这里控制稀疏度，数字越小越稀疏
          />
          {/* 文字位置 x=0.6 (离球的距离), size=0.25 (字体大小) */}
          <StarText isFist={isFist} isActive={isActive} position={[0.6, 0, 0]} size={0.25} color="white">Peak day</StarText>
        </group>

        {/* Low day 说明项 */}
        <group position={[0, 0, 0]}>
          {/* 🌟 核心修改：同样传入 particleCount={600} */}
          <MixedColorSphere 
            radius={0.05} 
            colorPrimary={THEME.secondary} 
            colorSecondary={THEME.secondary} 
            isFist={isFist} 
            isActive={isActive}
            particleCount={200} // ✨ 这里控制稀疏度
          />
          {/* 文字位置 x=0.6 */}
          <StarText isFist={isFist} isActive={isActive} position={[0.6, 0, 0]} size={0.25} color="white">Low day</StarText>
        </group>

      </group>

      {/* 📊 3. 循环生成柱状图 */}
      <group position={[offsetX, -1.5, 0]}>
        {DATA.sales.map((item, i) => {
          // 高度计算公式 (数值除以200再乘以4)
          const height = (item.val / 200) * 4.0; 
          return <VolumetricBar key={i} width={barWidth} height={height} depth={barWidth} isPeak={item.isPeak} isFist={isFist} isActive={isActive} position={[i*(barWidth+gap), height/2, 0]} value={item.val} label={item.day} />;
        })}
      </group>
    </group>
  );
};