import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  NavigationTab, 
  ImageAnalysisData, 
  NotificationItem,
} from './types';
import { analyzeImageElement, getSamplePresets } from './utils/imageProcessing';
import { useTheme } from './context/ThemeContext';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { SplashScreen } from './components/ui/SplashScreen';
import { LandingPage } from './components/views/LandingPage';
import { ImageAcquisition } from './components/views/ImageAcquisition';
import { LiveCameraHUD } from './components/views/LiveCameraHUD';
import { ImagePreview } from './components/views/ImagePreview';
import { MLAnalysisPanel } from './components/views/MLAnalysisPanel';
import { ImageInformationPanel } from './components/views/ImageInformationPanel';
import { ImageInspector } from './components/views/ImageInspector';
import { AdvancedCVStudio } from './components/views/AdvancedCVStudio';
import { CNNVisualizer } from './components/views/CNNVisualizer';
import { ThreeDColorCube } from './components/views/ThreeDColorCube';
import { ImageComparison } from './components/views/ImageComparison';
import { AIDashboard } from './components/views/AIDashboard';
import { DocumentationModal } from './components/views/DocumentationModal';
import { HistoryPage } from './components/views/HistoryPage';
import { SettingsModal } from './components/views/SettingsModal';
import { AboutModal } from './components/views/AboutModal';
import { KeyboardShortcutsDrawer } from './components/ui/KeyboardShortcutsDrawer';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  const { settings, isLight, themeTokens } = useTheme();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [acquisitionSubTab, setAcquisitionSubTab] = useState<'capture' | 'upload'>('capture');

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Active Analysis Data
  const [currentAnalysis, setCurrentAnalysis] = useState<ImageAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // History state with LocalStorage persistence
  const [historyRecords, setHistoryRecords] = useState<ImageAnalysisData[]>(() => {
    try {
      const saved = localStorage.getItem('visionlens_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Sample presets list
  const samplePresets = getSamplePresets();

  // Auto load first sample preset if currentAnalysis is empty
  useEffect(() => {
    if (!currentAnalysis && samplePresets.length > 0) {
      const preset = samplePresets[0];
      handleAcquireImage(preset.dataUrl, {
        name: `${preset.title.replace(/\s+/g, '_')}.svg`,
        size: 150000,
        type: 'image/svg+xml',
      });
    }
  }, []);

  const showToast = useCallback(
    (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const newNotif: NotificationItem = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        message,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Sync history to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('visionlens_history', JSON.stringify(historyRecords));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [historyRecords]);

  // Handle acquired image (from Webcam or Upload or Preset)
  const handleAcquireImage = async (
    dataUrl: string,
    fileMeta?: { name: string; size: number; type: string }
  ) => {
    setIsAnalyzing(true);
    setActiveTab('analysis');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;

    img.onload = async () => {
      try {
        const { metrics, histogram, dominantColors } = analyzeImageElement(img, fileMeta);
        const timestamp = new Date();
        const dateStr = `${timestamp.toISOString().split('T')[0]}_${timestamp.toTimeString().split(' ')[0].replace(/:/g, '-')}`;
        const savedPath = `${dateStr}.jpg`;

        const newRecord: ImageAnalysisData = {
          id: Math.random().toString(36).substring(2, 9),
          title: fileMeta?.name || `Captured Image ${dateStr}`,
          dataUrl,
          capturedAt: timestamp.toLocaleString(),
          savedPath,
          metrics,
          histogram,
          dominantColors,
          selectedFilter: 'normal',
        };

        setCurrentAnalysis(newRecord);

        // Fetch Gemini Vision Multimodal insights from backend
        try {
          let payloadBase64 = dataUrl;
          let payloadMime = fileMeta?.type || 'image/jpeg';

          const jpegCanvas = document.createElement('canvas');
          jpegCanvas.width = Math.min(img.naturalWidth || 800, 1024);
          jpegCanvas.height = Math.min(img.naturalHeight || 600, 1024);
          const jpegCtx = jpegCanvas.getContext('2d');

          if (jpegCtx) {
            jpegCtx.fillStyle = isLight ? '#F1F5F9' : '#0F172A';
            jpegCtx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
            jpegCtx.drawImage(img, 0, 0, jpegCanvas.width, jpegCanvas.height);
            payloadBase64 = jpegCanvas.toDataURL('image/jpeg', 0.85);
            payloadMime = 'image/jpeg';
          }

          const res = await fetch('/api/vision/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: payloadBase64,
              mimeType: payloadMime,
            }),
          });
          const aiData = await res.json();
          if (aiData?.success) {
            newRecord.aiInsights = aiData;
            setCurrentAnalysis({ ...newRecord });
          }
        } catch (aiErr) {
          console.warn('Gemini AI endpoint fallback:', aiErr);
        }

        if (settings.autoSaveCaptured) {
          setHistoryRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
        }

        showToast('Image Acquired', `Successfully analyzed ${metrics.width}×${metrics.height}px dataset`, 'success');
      } catch (err: any) {
        console.error('Image analysis error:', err);
        showToast('Analysis Error', 'Failed to decode image data', 'error');
      } finally {
        setIsAnalyzing(false);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00E5FF', '#38BDF8', '#A855F7'],
        });
      }
    };
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '?') {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsAboutOpen(false);
        setIsShortcutsOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setActiveTab('upload');
        setAcquisitionSubTab('upload');
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setActiveTab('history');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'home':
        return 'System Overview & Presets';
      case 'capture':
        return 'Live Webcam Image Acquisition';
      case 'upload':
        return 'Import & Drag-and-Drop Workspace';
      case 'analysis':
        return 'Computer Vision Inspection Workbench';
      case 'inspector':
        return 'Precision Image Inspector & Editor';
      case 'cv-studio':
        return 'Advanced OpenCV Feature Extraction Studio';
      case 'cnn-visualizer':
        return 'Convolutional Neural Network Feature Maps';
      case '3d-cube':
        return '3D RGB Spatial Color Cloud';
      case 'comparison':
        return 'Dual Image Structural Comparison';
      case 'dashboard':
        return 'AI Executive Computer Vision Dashboard';
      case 'history':
        return 'Saved Gallery & Inspection Records';
      case 'documentation':
        return 'System Architecture & OpenCV Specs';
      default:
        return 'VisionLens AI Workspace';
    }
  };

  // Adaptive Wallpaper Background Gradients
  const wallpaperGradientsDark: Record<string, string> = {
    'golden-gate': 'from-[#09090B] via-[#111827] to-[#1E293B]',
    'mac-sonoma': 'from-[#020617] via-[#0F172A] to-[#1E1B4B]',
    'cyber-midnight': 'from-[#05050A] via-[#090D16] to-[#0A1120]',
    'deep-space': 'from-[#020810] via-[#0B132B] to-[#1C2541]',
  };

  const wallpaperGradientsLight: Record<string, string> = {
    'golden-gate': 'from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]',
    'mac-sonoma': 'from-[#EFF6FF] via-[#DBEAFE] to-[#E0E7FF]',
    'cyber-midnight': 'from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]',
    'deep-space': 'from-[#ECFDF5] via-[#F0FDF4] to-[#E2E8F0]',
  };

  const bgGradient = isLight
    ? wallpaperGradientsLight[settings.themeWallpaper] || wallpaperGradientsLight['golden-gate']
    : wallpaperGradientsDark[settings.themeWallpaper] || wallpaperGradientsDark['golden-gate'];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} ${themeTokens.textPrimary} flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden transition-colors duration-500`}>
      {/* AI Startup Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onSearch={(q) => setSearchQuery(q)}
        activeTabTitle={getTabTitle(activeTab)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Floating Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'capture') setAcquisitionSubTab('capture');
            if (tab === 'upload') setAcquisitionSubTab('upload');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          historyCount={historyRecords.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-3 sm:p-4 md:p-6 lg:p-8 pb-20 md:pb-6">
          {activeTab === 'home' && (
            <LandingPage
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === 'capture') setAcquisitionSubTab('capture');
                if (tab === 'upload') setAcquisitionSubTab('upload');
              }}
              onOpenAbout={() => setIsAboutOpen(true)}
              onSelectPreset={(p) =>
                handleAcquireImage(p.dataUrl, {
                  name: `${p.title.replace(/\s+/g, '_')}.svg`,
                  size: 150000,
                  type: 'image/svg+xml',
                })
              }
              samplePresets={samplePresets}
            />
          )}

          {activeTab === 'capture' && (
            <LiveCameraHUD onCaptureImage={(url) => handleAcquireImage(url, { name: 'Webcam_Capture.jpg', size: 250000, type: 'image/jpeg' })} />
          )}

          {activeTab === 'upload' && (
            <ImageAcquisition
              activeSubTab="upload"
              onImageAcquired={handleAcquireImage}
              samplePresets={samplePresets}
            />
          )}

          {activeTab === 'analysis' && (
            <div className="max-w-7xl mx-auto space-y-8">
              {isAnalyzing && (
                <MLAnalysisPanel
                  isAnalyzing={isAnalyzing}
                  onAnalysisComplete={() => setIsAnalyzing(false)}
                />
              )}

              {currentAnalysis && (
                <div className="space-y-8">
                  <ImagePreview
                    dataUrl={currentAnalysis.dataUrl}
                    title={currentAnalysis.title}
                  />

                  <ImageInformationPanel
                    data={currentAnalysis}
                    onSaveToHistory={(rec) => {
                      setHistoryRecords((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);
                    }}
                    onShowToast={showToast}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'inspector' && currentAnalysis && (
            <ImageInspector
              imageData={currentAnalysis}
              onUpdateAdjustments={(adj) => {
                setCurrentAnalysis({ ...currentAnalysis, adjustments: adj });
              }}
            />
          )}

          {activeTab === 'cv-studio' && currentAnalysis && (
            <AdvancedCVStudio imageData={currentAnalysis} />
          )}

          {activeTab === 'cnn-visualizer' && currentAnalysis && (
            <CNNVisualizer imageData={currentAnalysis} />
          )}

          {activeTab === '3d-cube' && currentAnalysis && (
            <ThreeDColorCube imageData={currentAnalysis} />
          )}

          {activeTab === 'comparison' && currentAnalysis && (
            <ImageComparison
              currentImage={currentAnalysis}
              historyImages={historyRecords.length > 0 ? historyRecords : [currentAnalysis]}
            />
          )}

          {activeTab === 'dashboard' && currentAnalysis && (
            <AIDashboard imageData={currentAnalysis} />
          )}

          {activeTab === 'history' && (
            <HistoryPage
              historyRecords={historyRecords}
              onSelectRecord={(rec) => {
                setCurrentAnalysis(rec);
                setActiveTab('analysis');
              }}
              onDeleteRecord={(id) => {
                setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
                showToast('Record Deleted', 'Analysis record removed from history', 'info');
              }}
              onClearAll={() => {
                setHistoryRecords([]);
                showToast('History Cleared', 'All saved analysis logs removed', 'info');
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'documentation' && (
            <DocumentationModal onClose={() => setActiveTab('home')} />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowToast={showToast}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <KeyboardShortcutsDrawer
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Mobile Bottom Navigation & Drawer Sheet */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'capture') setAcquisitionSubTab('capture');
          if (tab === 'upload') setAcquisitionSubTab('upload');
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        historyCount={historyRecords.length}
        isDrawerOpen={isMobileDrawerOpen}
        onToggleDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer notifications={notifications} onDismiss={dismissToast} />
    </div>
  );
}

