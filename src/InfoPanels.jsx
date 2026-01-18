import React from 'react';

// 通用的卡片容器风格 (毛玻璃 + 赛博霓虹边框)
const CardStyle = {
  width: '300px',
  height: '300px',
  background: 'rgba(10, 10, 20, 0.85)', // 深色半透明背景
  backdropFilter: 'blur(12px)',         // 毛玻璃模糊
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  padding: '20px',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 0 30px rgba(0,0,0,0.5)',
  userSelect: 'none',
  textAlign: 'center',
  fontFamily: 'sans-serif',
};

// 1. 封面场景 (Front)
export const CoverPanel = () => (
  <div style={{...CardStyle, border: '2px solid #f472b6', boxShadow: '0 0 20px #f472b6'}}>
    <h3 style={{color: '#f472b6', letterSpacing: '2px', marginBottom: '5px'}}>IMMERSIVE THEATER</h3>
    <h1 style={{fontSize: '42px', margin: '10px 0', textShadow: '0 0 10px #f472b6'}}>SWAMP<br/>LESQUE</h1>
    <div style={{marginTop: '20px', fontSize: '12px', opacity: 0.8}}>
      ★★★★★ <br/> "The best drag show!"
    </div>
    <div style={{marginTop: 'auto', padding: '8px 16px', background: '#f472b6', color: 'black', borderRadius: '20px', fontWeight: 'bold'}}>
      握拳进入 / FIST TO ENTER
    </div>
  </div>
);

// 2. 基础介绍 (Right)
export const IntroPanel = () => (
  <div style={{...CardStyle, border: '2px solid #a855f7', boxShadow: '0 0 20px #a855f7'}}>
    <h2 style={{color: '#a855f7'}}>ABOUT SHOW</h2>
    <p style={{fontSize: '14px', lineHeight: '1.6', textAlign: 'left', opacity: 0.9}}>
      这是一场打破常规的沉浸式演出。
      <br/><br/>
      在这里，数据不仅仅是数字，而是流动的星尘。挥动双手，你将在光影与节奏中重塑故事的走向。
    </p>
    <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
      {['Burlesque', 'Comedy', 'Drag'].map(tag => (
        <span key={tag} style={{fontSize: '10px', padding: '4px 8px', border: '1px solid #a855f7', borderRadius: '10px'}}>{tag}</span>
      ))}
    </div>
  </div>
);

// 3. 销售数据 (Back) - 用 CSS 画一个动态柱状图
export const SalesPanel = () => (
  <div style={{...CardStyle, border: '2px solid #8b5cf6', boxShadow: '0 0 20px #8b5cf6'}}>
    <h2 style={{color: '#8b5cf6', marginBottom: '20px'}}>DAILY SALES</h2>
    <div style={{display: 'flex', alignItems: 'flex-end', height: '120px', gap: '15px'}}>
      {[40, 70, 50, 90, 60].map((h, i) => (
        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
          <div style={{
            width: '20px', 
            height: `${h}%`, 
            background: 'linear-gradient(to top, #8b5cf6, #c084fc)',
            borderRadius: '4px',
            boxShadow: '0 0 10px #8b5cf6'
          }}></div>
          <span style={{fontSize: '10px', color: '#aaa'}}>0{i+1}</span>
        </div>
      ))}
    </div>
    <div style={{marginTop: '20px', fontSize: '24px', fontWeight: 'bold'}}>
      $1,204,500 <span style={{fontSize: '12px', color: '#4ade80'}}>▲ 12%</span>
    </div>
  </div>
);

// 4. 相关推荐 (Left) - 圆形气泡布局
export const RecsPanel = () => (
  <div style={{...CardStyle, border: '2px solid #3b82f6', boxShadow: '0 0 20px #3b82f6'}}>
    <h2 style={{color: '#3b82f6', marginBottom: '10px'}}>RECOMMEND</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%'}}>
      {['La Clique', 'Reuben', 'Briefs', 'Pals'].map((item, i) => (
        <div key={i} style={{
          background: 'rgba(59, 130, 246, 0.2)', 
          padding: '15px', 
          borderRadius: '10px',
          fontSize: '14px',
          border: '1px solid rgba(59, 130, 246, 0.4)'
        }}>
          {item}
        </div>
      ))}
    </div>
    <p style={{marginTop: '15px', fontSize: '10px', opacity: 0.6}}>Swipe left to view more</p>
  </div>
);