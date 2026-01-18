import { useEffect, useState, useRef } from 'react';

export function useHandGesture() {
  const [gesture, setGesture] = useState('正在启动摄像头...');
  
  // rotateHandX: 左手 (控制旋转)
  // actionGesture: 右手 (控制握拳)
  const rotateHandX = useRef(0.5); 
  const actionGesture = useRef('OPEN_HAND'); 

  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = document.createElement("video");
    videoElement.style.display = "none";
    document.body.appendChild(videoElement);
    videoRef.current = videoElement;

    // 使用外挂脚本
    const Hands = window.Hands;
    const Camera = window.Camera;

    if (!Hands || !Camera) {
      setGesture("等待 AI 加载...");
      return;
    }

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks) return;

      let leftHandDetected = false;
      let rightHandDetected = false;

      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        
        if (results.multiHandedness && results.multiHandedness[i]) {
            const label = results.multiHandedness[i].label; 

            // ✋ 屏幕左边的手 -> 旋转
            if (label === 'Left') {
              rotateHandX.current = 1 - landmarks[0].x; 
              leftHandDetected = true;
            } 
            
            // 👊 屏幕右边的手 -> 动作
            if (label === 'Right') {
              detectRightHandPose(landmarks);
              rightHandDetected = true;
            }
        }
      }

      if (leftHandDetected && rightHandDetected) {
        setGesture("✅ 双手就绪：左手转动 | 右手握拳");
      } else if (leftHandDetected) {
        setGesture("✋ 左手已识别 (旋转)");
      } else if (rightHandDetected) {
        setGesture("👊 右手已识别 (动作)");
      } else {
        setGesture("👀 请举起双手...");
      }
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if(videoRef.current) await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480
    });
    
    camera.start().then(() => setGesture("摄像头已启动"));

    return () => {
      hands.close();
      if(videoElement) videoElement.remove();
    };
  }, []);

  const detectRightHandPose = (landmarks) => {
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20]; 
    let foldedCount = 0;
    const palmSize = Math.hypot(landmarks[0].x - landmarks[9].x, landmarks[0].y - landmarks[9].y);

    tips.forEach(tipIdx => {
      const tip = landmarks[tipIdx];
      const distance = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      if (distance < palmSize * 1.1) foldedCount++;
    });

    if (foldedCount >= 3) {
      actionGesture.current = 'CLOSED_FIST';
    } else {
      actionGesture.current = 'OPEN_HAND';
    }
  };

  return { gesture, rotateHandX, actionGesture };
}