import React, { useMemo } from 'react';
import { StarText, MixedColorSphere, FineLinesNatural, THEME, DATA } from './SharedComponents';

// 🌟 辅助函数：超过4个单词强制换行
const formatNameWithLineBreak = (name) => {
  const words = name.split(' ');
  if (words.length > 4) {
    const firstLine = words.slice(0, 4).join(' ');
    const secondLine = words.slice(4).join(' ');
    return `${firstLine}\n${secondLine}`;
  }
  return name;
};

export const RecsSlide = ({ isFist, isActive }) => {
  const spherePositions = useMemo(() => [
    [0, 0.2, 0],           // 0. La Clique (中心)
    [1.6, 1.2, 0.3],       // 1. Right Top
    [-1.7, 1.4, -0.2],     // 2. Left Top (保持上移)
    [2.1, -0.5, 0.1],      // 3. Right Mid
    [-2.2, -0.3, 0],       // 4. Left Mid
    [0.9, -1.8, -0.3],     // 5. Right Bottom
    [-1.2, -1.7, 0.2]      // 6. Left Bottom
  ], []);

  return (
  <group>
    <StarText isFist={isFist} isActive={isActive} position={[0, 3.2, 0]} size={0.6} color="white">Other 【Cabaret】<br />Recommendations</StarText>
    
    <FineLinesNatural positions={spherePositions} color={THEME.white} isFist={isFist} isActive={isActive} />
    
    {DATA.recs.map((item, i) => {
      const [x, y, z] = spherePositions[i];
      const sphereRadius = 0.6; 
      
      const nameLength = item.name.length;
      let baseFontSize = nameLength > 25 ? 0.1 : (nameLength > 15 ? 0.12 : 0.15);
      const finalFontSize = baseFontSize * 1.5;

      const isBottom = i === 5 || i === 6;
      // 限制宽度以强制换行
      const labelWidth = isBottom ? '140px' : '200px';
      const tightSpacing = (isFist && isActive) ? '0.5px' : '1.5px';

      const displayName = formatNameWithLineBreak(item.name);

      return (
        <group key={i} position={[x, y, z]}>
           <MixedColorSphere radius={sphereRadius} colorPrimary={item.color} colorSecondary="#ffffff" isFist={isFist} isActive={isActive} />
           
           {/* 🌟 核心修改：位置从 -0.9 微调到 -1.05，往下一点点 */}
           <StarText 
             isFist={isFist} 
             isActive={isActive} 
             position={[0, -0.9, 0]} 
             size={finalFontSize} 
             color="white"
             width={labelWidth} 
             letterSpacing={tightSpacing}
           >
             {displayName}
           </StarText>
        </group>
      );
    })}
  </group>
)};