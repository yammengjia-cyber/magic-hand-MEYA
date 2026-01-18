import { useRef, useEffect } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export const useHandGesture = () => {
  // 核心数据 Ref (用于输出)
  const rotateHandX = useRef(0.5);       // 控制旋转 (0.0 - 1.0)
  const actionGesture = useRef('NONE');  // 控制动作 ('CLOSED_FIST' / 'OPEN_PALM' / 'NONE')

  // 内部状态 Ref (用于处理)
  const videoRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU" // 尝试使用 GPU 加速
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        startWebcam();
      } catch (error) {
        console.error("模型加载失败:", error);
      }
    };

    const startWebcam = async () => {
      try {
        // 🌟 1. 手机端关键：强制使用前置摄像头 (facingMode: 'user')
        const constraints = {
          video: {
            facingMode: "user", 
            width: { ideal: 640 },  // 降低分辨率以提高手机流畅度
            height: { ideal: 480 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // 创建视频元素
        const video = document.createElement("video");
        
        // 🌟 2. iOS 关键：必须设置 playsInline，否则 iPhone 上无法运行
        video.playsInline = true; 
        video.muted = true;
        video.srcObject = stream;

        // 等待视频元数据加载完成
        video.onloadedmetadata = () => {
          video.play();
          videoRef.current = video;
          predict();
        };

      } catch (err) {
        console.error("无法启动摄像头:", err);
        // 如果前置摄像头失败，尝试不带参数启动（回退方案）
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const video = document.createElement("video");
          video.playsInline = true;
          video.muted = true;
          video.srcObject = fallbackStream;
          video.onloadedmetadata = () => {
            video.play();
            videoRef.current = video;
            predict();
          };
        } catch (e) {
          console.error("摄像头完全不可用");
        }
      }
    };

    const predict = () => {
      if (videoRef.current && handLandmarkerRef.current) {
        let startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // --- A. 计算手势位置 (X轴映射) ---
          // 取食指根部(5)和粉指根部(17)的中心点
          const x = (landmarks[5].x + landmarks[17].x) / 2;
          
          // 手机是镜像的，所以 1-x 让方向符合直觉
          rotateHandX.current = 1 - x; 

          // --- B. 简单的握拳检测算法 ---
          // 检查指尖是否低于指关节 (Y轴向下为大)
          // 拇指(4), 食指(8), 中指(12), 无名指(16), 小指(20)
          // 简单的判断：如果三个以上的手指指尖位置 低于(数值大于) 它们对应的第二关节
          
          let closedFingers = 0;
          // 检查 食指(8 vs 6), 中指(12 vs 10), 无名指(16 vs 14), 小指(20 vs 18)
          if (landmarks[8].y > landmarks[6].y) closedFingers++;
          if (landmarks[12].y > landmarks[10].y) closedFingers++;
          if (landmarks[16].y > landmarks[14].y) closedFingers++;
          if (landmarks[20].y > landmarks[18].y) closedFingers++;

          if (closedFingers >= 3) {
            actionGesture.current = 'CLOSED_FIST';
          } else {
            actionGesture.current = 'OPEN_PALM';
          }

        } else {
          // 如果没检测到手，保持“无动作”
          actionGesture.current = 'NONE';
        }
      }
      animationFrameId.current = requestAnimationFrame(predict);
    };

    initHandLandmarker();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { rotateHandX, actionGesture };
};