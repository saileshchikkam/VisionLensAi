import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  AlertCircle,
  Video,
  Layers,
} from 'lucide-react';
import { SamplePreset } from '../../types';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface ImageAcquisitionProps {
  onImageAcquired: (dataUrl: string, fileMeta?: { name: string; size: number; type: string }) => void;
  samplePresets: SamplePreset[];
  activeSubTab?: 'capture' | 'upload';
}

export const ImageAcquisition: React.FC<ImageAcquisitionProps> = ({
  onImageAcquired,
  samplePresets,
  activeSubTab = 'capture',
}) => {
  const { themeTokens, isLight } = useTheme();
  const [subTab, setSubTab] = useState<'capture' | 'upload'>(activeSubTab);
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  
  // Drag & drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (activeSubTab !== subTab) {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === 0) {
      executeSnap();
      setCountdown(null);
      return;
    }

    if (countdown === null) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle camera stream setup
  const startCamera = async (deviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraError(null);

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Enumerate camera devices
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (!selectedDeviceId && videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Camera permission pending or device unavailable. You can also upload any image file or test with sample presets below.'
      );
    }
  };

  useEffect(() => {
    if (subTab === 'capture') {
      startCamera(selectedDeviceId);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [subTab, selectedDeviceId]);

  // Trigger camera snap with countdown
  const triggerCapture = () => {
    if (countdown !== null) return;
    soundEngine.playClick();
    setCountdown(3);
  };

  const executeSnap = () => {
    if (!videoRef.current) return;
    setIsFlashActive(true);
    soundEngine.playShutter();

    setTimeout(() => {
      setIsFlashActive(false);
    }, 300);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const filename = `Captured_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;

      onImageAcquired(dataUrl, {
        name: filename,
        size: Math.round(dataUrl.length * 0.75),
        type: 'image/jpeg',
      });
    }
  };

  // Handle File Upload
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    soundEngine.playClick();

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageAcquired(dataUrl, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-2 sm:p-6 max-w-6xl mx-auto space-y-6 sm:space-y-8 select-none">
      {/* Top Header Bar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b ${isLight ? 'border-black/[0.08]' : 'border-white/[0.08]'}`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${themeTokens.textPrimary}`}>Image Acquisition Workbench</h1>
          <p className={`text-xs mt-0.5 ${themeTokens.textMuted}`}>Stream live camera video or import high-resolution visual datasets</p>
        </div>

        <div className={`flex items-center w-full sm:w-auto p-1 rounded-2xl backdrop-blur-xl border ${isLight ? 'bg-black/[0.04] border-black/[0.08]' : 'bg-white/[0.06] border-white/[0.1]'}`}>
          <Button
            variant={subTab === 'capture' ? 'primary' : 'ghost'}
            size="sm"
            icon={Camera}
            className="flex-1 sm:flex-initial min-h-[44px]"
            onClick={() => setSubTab('capture')}
          >
            Webcam Live
          </Button>
          <Button
            variant={subTab === 'upload' ? 'primary' : 'ghost'}
            size="sm"
            icon={Upload}
            className="flex-1 sm:flex-initial min-h-[44px]"
            onClick={() => setSubTab('upload')}
          >
            Upload & Presets
          </Button>
        </div>
      </div>

      {/* Mode 1: Webcam Viewfinder */}
      {subTab === 'capture' && (
        <div className="space-y-6">
          <GlassCard padding="none" className="relative overflow-hidden aspect-video max-h-[560px] mx-auto flex items-center justify-center border">
            {/* Flash Effect */}
            <AnimatePresence>
              {isFlashActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-40 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <motion.span
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="text-7xl font-extrabold text-blue-400 font-mono tracking-tighter"
                >
                  {countdown}
                </motion.span>
              </div>
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* AI Scanning Frame HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
              {/* Top HUD Badges */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className={`px-3 py-1 rounded-xl border backdrop-blur-md flex items-center space-x-2 ${themeTokens.accentSoft}`}>
                  <span className={`w-2 h-2 rounded-full ${themeTokens.accent.bg} animate-ping`} />
                  <span>1080p stream @ 60fps</span>
                </div>
                <div className={`px-3 py-1 rounded-xl border backdrop-blur-md ${themeTokens.accentSoft}`}>
                  AI Frame Overlay Active
                </div>
              </div>

              {/* Bounding Box Grid */}
              <div className="relative w-full h-full my-4 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400" />
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-400" />
                
                {/* Scanning Laser Line */}
                <motion.div
                  animate={{ y: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#0071E3]"
                />
              </div>

              {/* Bottom HUD */}
              <div className="text-center">
                <span className={`text-[11px] font-mono px-3 py-1 rounded-full border backdrop-blur-md ${themeTokens.textMuted} ${isLight ? 'bg-white/80 border-black/10' : 'bg-black/80 border-white/10'}`}>
                  Press Spacebar or Snap Capture
                </span>
              </div>
            </div>

            {/* Camera Error Fallback */}
            {cameraError && (
              <div className={`absolute inset-0 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-4 z-20 ${isLight ? 'bg-white/90' : 'bg-black/90'}`}>
                <AlertCircle className="w-10 h-10 text-amber-500" />
                <div className="max-w-md">
                  <h3 className={`text-base font-bold mb-1 ${themeTokens.textPrimary}`}>Webcam Offline or Permission Required</h3>
                  <p className={`text-xs leading-relaxed mb-4 ${themeTokens.textSecondary}`}>{cameraError}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => startCamera(selectedDeviceId)}
                  >
                    Retry Camera Stream
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Camera Controls Bar */}
          <GlassCard padding="sm" className="flex flex-wrap items-center justify-between gap-4">
            {/* Device Selector */}
            {devices.length > 0 ? (
              <div className="flex items-center space-x-2">
                <Video className={`w-4 h-4 ${themeTokens.accentText}`} />
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className={themeTokens.inputBg + " px-3 py-1.5 rounded-xl text-xs focus:outline-none cursor-pointer"}
                >
                  {devices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className={`text-xs ${themeTokens.textMuted}`}>Default Web Cam</span>
            )}

            {/* Capture Button */}
            <Button
              variant="primary"
              size="lg"
              icon={Camera}
              isLoading={countdown !== null}
              onClick={triggerCapture}
            >
              Snap Capture Image
            </Button>
          </GlassCard>
        </div>
      )}

      {/* Mode 2: Drag & Drop Upload & Presets */}
      {subTab === 'upload' && (
        <div className="space-y-8">
          {/* Glass Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-10 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-4 cursor-pointer relative overflow-hidden backdrop-blur-2xl ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(0,113,227,0.2)]'
                : isLight
                ? 'border-black/15 bg-white/60 hover:border-blue-500/50 hover:bg-white/80'
                : 'border-white/15 bg-[#121216]/60 hover:border-blue-400/50 hover:bg-[#121216]/80'
            }`}
          >
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${themeTokens.accentSoft}`}>
              <Upload className={`w-8 h-8 ${themeTokens.accentText}`} />
            </div>

            <div>
              <h3 className={`text-base font-bold mb-1 ${themeTokens.textPrimary}`}>Drag & Drop Image Here</h3>
              <p className={`text-xs max-w-sm mx-auto ${themeTokens.textMuted}`}>
                Supports PNG, JPEG, JPG, WEBP, or SVG files up to 25MB
              </p>
            </div>

            <Button variant="secondary" size="sm" className="pointer-events-none">
              Browse Local Files
            </Button>
          </div>

          {/* Quick Presets Section */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold tracking-wide flex items-center gap-2 ${themeTokens.textPrimary}`}>
              <Layers className={`w-4 h-4 ${themeTokens.accentText}`} />
              <span>Or Choose Test Dataset Preset</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {samplePresets.map((preset) => (
                <GlassCard
                  key={preset.id}
                  variant="interactive"
                  padding="sm"
                  onClick={() => {
                    soundEngine.playClick();
                    onImageAcquired(preset.dataUrl, {
                      name: `${preset.title.replace(/\s+/g, '_')}.svg`,
                      size: 150000,
                      type: 'image/svg+xml',
                    });
                  }}
                  className="group"
                >
                  <div className={`w-full h-28 rounded-xl overflow-hidden mb-2.5 border ${isLight ? 'bg-slate-100 border-black/10' : 'bg-slate-950 border-white/10'}`}>
                    <img
                      src={preset.dataUrl}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className={`text-xs font-bold truncate group-hover:${themeTokens.accentTextHover} ${themeTokens.textPrimary}`}>
                    {preset.title}
                  </h4>
                  <p className={`text-[10px] mt-0.5 ${themeTokens.textMuted}`}>{preset.category}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
