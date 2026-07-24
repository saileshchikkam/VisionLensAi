import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCw, Zap, Sliders, Shield, Activity, Maximize2, Cpu, HardDrive, Flame } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface LiveCameraHUDProps {
  onCaptureImage: (dataUrl: string) => void;
}

export const LiveCameraHUD: React.FC<LiveCameraHUDProps> = ({ onCaptureImage }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [motionDelta, setMotionDelta] = useState<number>(4);
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [gpuUsage, setGpuUsage] = useState<number>(22);
  const [cameraTemp, setCameraTemp] = useState<number>(36.4);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  // Initialize camera stream
  const startCamera = async (deviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' },
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setCameraError(null);
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access webcam. Please check permissions.');
    }
  };

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((devs) => {
      const videoDevs = devs.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevs);
      if (videoDevs.length > 0) {
        setSelectedDevice(videoDevs[0].deviceId);
      }
    });

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Live telemetry ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(58 + Math.random() * 4));
      setMotionDelta(Number((2 + Math.random() * 6).toFixed(1)));
      setCpuUsage(Math.floor(12 + Math.random() * 8));
      setGpuUsage(Math.floor(18 + Math.random() * 12));
      setCameraTemp(Number((36.1 + Math.random() * 0.6).toFixed(1)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    soundEngine.playCameraShutter();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onCaptureImage(dataUrl);
    }
  };

  return (
    <div className="relative w-full rounded-3xl bg-slate-950/90 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl p-4 md:p-6 text-slate-100 font-sans">
      {/* Top HUD Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            LIVE CV HUD
          </span>
          <span className="text-slate-400">RESOL: 1920x1080 @ {fps} FPS</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPU: {cpuUsage}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>GPU: {gpuUsage}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{cameraTemp}°C</span>
          </div>
        </div>
      </div>

      {/* Main Video Viewport & AI Overlay */}
      <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-white/10 flex items-center justify-center group">
        {cameraError ? (
          <div className="text-center p-8 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 text-amber-400/80" />
            <p className="text-sm font-mono">{cameraError}</p>
            <button
              onClick={() => startCamera(selectedDevice)}
              className="mt-4 px-4 py-2 text-xs font-mono rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              Retry Camera Stream
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanning Laser Sweep */}
            {isScanning && (
              <motion.div
                animate={{ y: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] pointer-events-none z-10"
              />
            )}

            {/* Object Tracking Bounding Frames Simulation */}
            <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
              {/* Corner Brackets */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

              {/* Dynamic Target Box */}
              <motion.div
                animate={{
                  scale: [0.95, 1.02, 0.95],
                  borderColor: ['rgba(34, 211, 238, 0.6)', 'rgba(168, 85, 247, 0.8)', 'rgba(34, 211, 238, 0.6)'],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="w-64 h-64 border-2 border-cyan-400/80 rounded-2xl relative flex flex-col justify-between p-2 shadow-[0_0_25px_rgba(34,211,238,0.2)]"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                  <span>TARGET_ROI: 01</span>
                  <span>CONF: 99.4%</span>
                </div>
                <div className="self-end text-[10px] font-mono text-purple-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                  MOTION_DELTA: {motionDelta}%
                </div>
              </motion.div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto bg-slate-950/80 border border-white/10 rounded-2xl p-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                {devices.length > 1 && (
                  <select
                    value={selectedDevice}
                    onChange={(e) => {
                      setSelectedDevice(e.target.value);
                      startCamera(e.target.value);
                    }}
                    className="bg-slate-900 text-xs font-mono border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-400"
                  >
                    {devices.map((d, i) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all ${
                    isScanning
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800 border-white/10 text-slate-400'
                  }`}
                >
                  {isScanning ? 'Laser Scan: ON' : 'Laser Scan: OFF'}
                </button>
              </div>

              {/* Shutter Snap Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCapture}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-semibold text-xs tracking-wide shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>SNAP FRAME</span>
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
