export type NavigationTab = 
  | 'home' 
  | 'capture' 
  | 'upload' 
  | 'analysis' 
  | 'inspector'
  | 'cv-studio' 
  | 'cnn-visualizer' 
  | '3d-cube' 
  | 'comparison' 
  | 'dashboard' 
  | 'history' 
  | 'documentation';

export type CVFilterType = 
  | 'normal' 
  | 'canny' 
  | 'gaussian' 
  | 'grayscale' 
  | 'threshold' 
  | 'sobel' 
  | 'invert' 
  | 'redChannel' 
  | 'greenChannel' 
  | 'blueChannel'
  | 'fastCorners'
  | 'harrisCorners'
  | 'orbFeatures'
  | 'contours'
  | 'morphology'
  | 'houghLines';

export type AdvancedCVAlgorithm = 
  | 'orb' 
  | 'fast' 
  | 'harris' 
  | 'blob' 
  | 'contours' 
  | 'watershed' 
  | 'morphology' 
  | 'otsu' 
  | 'adaptiveThreshold' 
  | 'houghLines' 
  | 'houghCircles' 
  | 'opticalFlow';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  gamma: number; // 0.1 to 3.0
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  sharpen: number; // 0 to 100
  noiseReduction: number; // 0 to 100
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface ComputerVisionMetrics {
  width: number;
  height: number;
  channels: number;
  aspectRatio: string;
  totalPixels: number;
  megapixels: number;
  fileSizeFormatted: string;
  fileType: string;
  colorSpace: string;
  meanRGB: { r: number; g: number; b: number };
  brightness: number; // 0-255
  contrast: number; // std dev
  sharpnessScore: number; // Laplacian variance
  blurIndex: number; // 0-100
  noiseEstimation: number; // 0-100
  entropy: number; // Shannon entropy bits
  orientation: 'Landscape' | 'Portrait' | 'Square';
  qualityScore: number; // Overall 0-100
  yoloReadiness?: number; // 0-100
  ocrReadiness?: number; // 0-100
  cnnSuitabilityScore?: number; // 0-100
}

export interface RGBHistogramData {
  intensity: number;
  red: number;
  green: number;
  blue: number;
  luminance: number;
}

export interface DominantColor {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
}

export interface AIInsightsData {
  summary: string;
  qualityScore: number;
  sharpnessRating: string;
  lightingRating: string;
  contrastRating: string;
  suitabilityForML: string;
  detectedObjects: string[];
  recommendedPreprocessing: string[];
  insights: string[];
  yoloReadiness?: string;
  ocrReadiness?: string;
  suggestedAugmentations?: string[];
  confidenceScore?: number;
  isSimulated?: boolean;
}

export interface ImageAnalysisData {
  id: string;
  title: string;
  dataUrl: string;
  capturedAt: string;
  savedPath: string;
  metrics: ComputerVisionMetrics;
  histogram: RGBHistogramData[];
  dominantColors: DominantColor[];
  aiInsights?: AIInsightsData;
  selectedFilter: CVFilterType;
  isFavorite?: boolean;
  tags?: string[];
  adjustments?: ImageAdjustments;
}

export interface ComparisonMetrics {
  ssim: number; // Structural Similarity Index 0 to 1
  psnr: number; // Peak Signal to Noise Ratio in dB
  mse: number; // Mean Squared Error
  histogramSimilarity: number; // 0 to 100%
  resolutionMatch: boolean;
  differenceHeatmapUrl: string;
  matchedKeypointsCount: number;
}

export interface AppSettings {
  appearance: 'dark' | 'light' | 'system';
  glassIntensity: 'low' | 'medium' | 'high';
  themeWallpaper: 'golden-gate' | 'mac-sonoma' | 'cyber-midnight' | 'deep-space' | 'monterey';
  accentColor: 'cyan' | 'purple' | 'emerald' | 'amber' | 'blue' | 'rose';
  animationSpeed: 'snappy' | 'spring' | 'cinematic';
  cameraResolution: '1080p' | '720p' | '4k';
  audioFeedback: boolean;
  autoSaveCaptured: boolean;
  aiQualityMode: 'fast' | 'balanced' | 'deep';
  language: 'en' | 'es' | 'ja' | 'de' | 'fr';
}

export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  dataUrl: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

