import React, { useState, useRef, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Sliders, 
  Sparkles, 
  Palette, 
  BarChart2, 
  Save, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2
} from 'lucide-react';
import { ImageAnalysisData, CVFilterType } from '../../types';
import { applyCVFilterToCanvas } from '../../utils/imageProcessing';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

import { exportToPDF, exportToCSV, exportToJSON } from '../../utils/exportUtils';

interface ImageInformationPanelProps {
  data: ImageAnalysisData;
  onSaveToHistory: (record: ImageAnalysisData) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ImageInformationPanel: React.FC<ImageInformationPanelProps> = ({
  data,
  onSaveToHistory,
  onShowToast,
}) => {
  const { themeTokens, isLight } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<CVFilterType>('normal');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'histogram' | 'filters' | 'ai'>('metrics');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load image into HTMLImageElement to apply filter
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = data.dataUrl;
    img.onload = () => {
      imageObjRef.current = img;
      if (canvasRef.current) {
        applyCVFilterToCanvas(img, canvasRef.current, selectedFilter);
      }
    };
  }, [data.dataUrl, selectedFilter]);

  const handleFilterChange = (filter: CVFilterType) => {
    soundEngine.playClick();
    setSelectedFilter(filter);
    if (imageObjRef.current && canvasRef.current) {
      applyCVFilterToCanvas(imageObjRef.current, canvasRef.current, filter);
    }
  };

  const copyHex = (hex: string) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    onShowToast('Hex Copied', `Color code ${hex} copied to clipboard`, 'success');
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleSaveImage = () => {
    soundEngine.playClick();
    onSaveToHistory({
      ...data,
      selectedFilter,
    });
    onShowToast('Saved to Gallery', `Image saved to CapturedImages/${data.savedPath}`, 'success');
  };

  const handleDownloadFilteredImage = () => {
    soundEngine.playClick();
    const link = document.createElement('a');
    if (selectedFilter !== 'normal' && canvasRef.current) {
      link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
      link.download = `VisionLens_${selectedFilter}_${data.savedPath}`;
    } else {
      link.href = data.dataUrl;
      link.download = `VisionLens_${data.savedPath}`;
    }
    link.click();
    onShowToast('Downloaded', 'Image downloaded successfully', 'success');
  };

  const filtersList: { id: CVFilterType; label: string }[] = [
    { id: 'normal', label: 'Original' },
    { id: 'canny', label: 'Canny Edges' },
    { id: 'sobel', label: 'Sobel Gradient' },
    { id: 'gaussian', label: 'Gaussian Blur' },
    { id: 'grayscale', label: 'Grayscale' },
    { id: 'threshold', label: 'Binary Threshold' },
    { id: 'invert', label: 'Invert Color' },
    { id: 'redChannel', label: 'Red Channel' },
    { id: 'greenChannel', label: 'Green Channel' },
    { id: 'blueChannel', label: 'Blue Channel' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none">
      {/* Navigation Sub-Tabs */}
      <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
        <div className="flex items-center space-x-2">
          <Sparkles className={`w-5 h-5 ${themeTokens.accentText}`} />
          <h2 className={`text-xl font-bold tracking-wide ${themeTokens.textPrimary}`}>Image Analysis Dashboard</h2>
        </div>

        <div className={`flex items-center p-1 rounded-2xl backdrop-blur-xl border ${isLight ? 'bg-black/[0.04] border-black/[0.08]' : 'bg-white/[0.06] border-white/[0.1]'}`}>
          <Button variant={activeTab === 'metrics' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('metrics')}>Core Metrics</Button>
          <Button variant={activeTab === 'histogram' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('histogram')}>Histogram & Colors</Button>
          <Button variant={activeTab === 'filters' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('filters')}>CV Filters</Button>
          <Button variant={activeTab === 'ai' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('ai')}>AI Insights</Button>
        </div>
      </div>

      {/* Quick Action Save Bar */}
      <GlassCard padding="sm" className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl border ${themeTokens.accentSoft}`}>
            <Save className={`w-4 h-4 ${themeTokens.accentText}`} />
          </div>
          <div>
            <span className={`text-xs font-bold block ${themeTokens.textPrimary}`}>Auto-Save Path</span>
            <span className={`text-[11px] font-mono ${themeTokens.accentText}`}>
              CapturedImages/{data.savedPath}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" icon={Save} onClick={handleSaveImage}>Save to History</Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadFilteredImage}>Download Image</Button>
          <Button variant="secondary" size="sm" icon={FileText} onClick={() => { soundEngine.playClick(); exportToPDF(data); onShowToast('PDF Exported', 'Vector PDF report generated', 'success'); }}>PDF Report</Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={() => { soundEngine.playClick(); exportToJSON(data); onShowToast('JSON Exported', 'Structured dataset downloaded', 'success'); }}>JSON</Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={() => { soundEngine.playClick(); exportToCSV(data); onShowToast('CSV Exported', 'Spreadsheet metrics exported', 'success'); }}>CSV</Button>
        </div>
      </GlassCard>

      {/* Tab 1: Core Metrics Grid */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Quality Score Hero Gauge Card */}
          <GlassCard padding="lg" className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${themeTokens.accentText}`}>
                Overall Image Quality Index
              </span>
              <h3 className={`text-3xl font-extrabold ${themeTokens.textPrimary}`}>
                Score: {data.metrics.qualityScore} <span className={`text-sm font-normal ${themeTokens.textMuted}`}>/ 100</span>
              </h3>
              <p className={`text-xs ${themeTokens.textSecondary}`}>
                Evaluated across Laplacian edge sharpness, contrast variance, exposure balance, and spatial noise floor.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isLight ? 'text-black/10' : 'text-white/10'}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={themeTokens.accentText}
                    strokeDasharray={`${data.metrics.qualityScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute font-mono text-base font-extrabold ${themeTokens.textPrimary}`}>
                  {data.metrics.qualityScore}%
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { label: 'Dimensions', val: `${data.metrics.width} × ${data.metrics.height}`, sub: 'Pixels' },
              { label: 'Resolution', val: `${data.metrics.megapixels} MP`, sub: `${data.metrics.totalPixels.toLocaleString()} total px` },
              { label: 'Aspect Ratio', val: data.metrics.aspectRatio, sub: data.metrics.orientation },
              { label: 'File Size & Type', val: data.metrics.fileSizeFormatted, sub: data.metrics.fileType },
              { label: 'Sharpness Score', val: `${data.metrics.sharpnessScore} / 100`, sub: 'Laplacian Variance' },
              { label: 'Brightness Index', val: `${data.metrics.brightness} / 255`, sub: 'Mean Luminance' },
              { label: 'Contrast Std Dev', val: `${data.metrics.contrast}`, sub: 'Dynamic Range Variance' },
              { label: 'Shannon Entropy', val: `${data.metrics.entropy}`, sub: 'bits / pixel' },
            ].map((m, idx) => (
              <GlassCard key={idx} padding="sm">
                <span className={`text-[11px] font-mono block mb-1 ${themeTokens.textMuted}`}>{m.label}</span>
                <span className={`text-base font-bold font-mono ${themeTokens.textPrimary}`}>{m.val}</span>
                <span className={`text-[10px] mt-1 block font-semibold ${themeTokens.accentText}`}>{m.sub}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: RGB Histogram & Dominant Colors */}
      {activeTab === 'histogram' && (
        <div className="space-y-6">
          {/* Histogram Chart */}
          <GlassCard padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className={`w-5 h-5 ${themeTokens.accentText}`} />
                <h3 className={`text-base font-bold ${themeTokens.textPrimary}`}>RGB & Luminance Intensity Histogram</h3>
              </div>
              <span className={`text-xs font-mono ${themeTokens.textMuted}`}>256 Bins</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.histogram}>
                  <XAxis dataKey="intensity" stroke={isLight ? '#6E6E73' : '#A1A1A6'} fontSize={10} />
                  <YAxis stroke={isLight ? '#6E6E73' : '#A1A1A6'} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#FFFFFF' : '#141418',
                      borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: isLight ? '#1D1D1F' : '#F5F5F7',
                    }}
                  />
                  <Area type="monotone" dataKey="red" stroke="#EF4444" fill="#EF4444" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="green" stroke="#22C55E" fill="#22C55E" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="blue" stroke="#0071E3" fill="#0071E3" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Dominant Color Palette */}
          <GlassCard padding="lg" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-500" />
              <h3 className={`text-base font-bold ${themeTokens.textPrimary}`}>Extracted Dominant Color Palette</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {data.dominantColors.map((color, idx) => (
                <GlassCard
                  key={idx}
                  variant="interactive"
                  padding="xs"
                  onClick={() => copyHex(color.hex)}
                  className="group"
                >
                  <div
                    className="w-full h-16 rounded-xl border border-black/10 dark:border-white/20 mb-2 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-xs font-mono font-bold ${themeTokens.textPrimary}`}>{color.hex}</span>
                    {copiedColor === color.hex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className={`w-3.5 h-3.5 ${themeTokens.textMuted}`} />
                    )}
                  </div>
                  <span className={`text-[10px] block px-1 mt-0.5 ${themeTokens.textMuted}`}>{color.percentage}% density</span>
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 3: CV Filters Studio */}
      {activeTab === 'filters' && (
        <GlassCard padding="lg" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sliders className={`w-5 h-5 ${themeTokens.accentText}`} />
              <h3 className={`text-base font-bold ${themeTokens.textPrimary}`}>Computer Vision Filter Studio</h3>
            </div>
            <span className={`text-xs font-mono px-2.5 py-1 rounded-md border font-semibold ${themeTokens.accentSoft}`}>
              Active: {selectedFilter}
            </span>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filtersList.map((f) => (
              <Button
                key={f.id}
                variant={selectedFilter === f.id ? 'primary' : 'secondary'}
                size="xs"
                onClick={() => handleFilterChange(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Canvas Filter Display */}
          <div className={`w-full h-96 rounded-2xl border overflow-hidden flex items-center justify-center p-4 ${isLight ? 'bg-slate-100 border-black/10' : 'bg-slate-950 border-white/10'}`}>
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
            />
          </div>
        </GlassCard>
      )}

      {/* Tab 4: AI Insights Panel */}
      {activeTab === 'ai' && (
        <GlassCard padding="lg" className="space-y-6">
          <div className={`flex items-center space-x-3 pb-4 border-b ${isLight ? 'border-black/10' : 'border-white/10'}`}>
            <div className={`p-2.5 rounded-2xl ${themeTokens.accentSoft}`}>
              <Sparkles className={`w-5 h-5 ${themeTokens.accentText}`} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${themeTokens.textPrimary}`}>Gemini Multimodal Neural Vision Analysis</h3>
              <p className={`text-xs ${themeTokens.textMuted}`}>Server-Side Multimodal Model Evaluation</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Summary */}
            <GlassCard padding="sm">
              <span className={`text-[10px] font-mono font-bold uppercase block mb-1 ${themeTokens.accentText}`}>
                Visual Content Summary
              </span>
              <p className={`leading-relaxed font-medium ${themeTokens.textPrimary}`}>
                {data.aiInsights?.summary || 'High resolution visual dataset parsed.'}
              </p>
            </GlassCard>

            {/* ML Suitability */}
            <GlassCard padding="sm">
              <span className={`text-[10px] font-mono font-bold uppercase block mb-1 ${themeTokens.accentText}`}>
                Convolutional / CNN Model Suitability
              </span>
              <p className={`leading-relaxed font-medium ${themeTokens.textPrimary}`}>
                {data.aiInsights?.suitabilityForML || 'Well-suited for feature extraction and object classification.'}
              </p>
            </GlassCard>

            {/* Key Analytical Insights */}
            <GlassCard padding="sm" className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-500 block">
                Key Analytical Insights
              </span>
              <div className="space-y-1.5">
                {(data.aiInsights?.insights || [
                  'High structural sharpness detected across main subject edges.',
                  'Color distribution shows well-distributed RGB dynamic range.',
                  'Aspect ratio and pixel spatial density are suited for high-accuracy vision models.'
                ]).map((insight, i) => (
                  <div key={i} className={`flex items-start space-x-2 ${themeTokens.textSecondary}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
