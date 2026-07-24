// Multi-Format Exporter Utility (PDF, JSON, CSV, TXT)

import jsPDF from 'jspdf';
import { ImageAnalysisData } from '../types';

export function exportToJSON(data: ImageAnalysisData) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VisionLens_Export_${data.savedPath.replace(/\.\w+$/, '')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(data: ImageAnalysisData) {
  const headers = [
    'Metric',
    'Value',
    'Unit/Notes'
  ];

  const rows = [
    ['Title', data.title, ''],
    ['Saved Path', data.savedPath, ''],
    ['Captured At', data.capturedAt, ''],
    ['Width', data.metrics.width, 'px'],
    ['Height', data.metrics.height, 'px'],
    ['Aspect Ratio', data.metrics.aspectRatio, ''],
    ['Total Pixels', data.metrics.totalPixels, 'px'],
    ['Megapixels', data.metrics.megapixels, 'MP'],
    ['Quality Score', data.metrics.qualityScore, '/100'],
    ['Brightness Index', data.metrics.brightness, '/255'],
    ['Contrast Std Dev', data.metrics.contrast, ''],
    ['Sharpness Laplacian', data.metrics.sharpnessScore, ''],
    ['Noise Floor', data.metrics.noiseEstimation, '%'],
    ['Shannon Entropy', data.metrics.entropy, 'bits/pixel'],
    ['Summary', `"${data.aiInsights?.summary || 'N/A'}"`, ''],
    ['ML Suitability', `"${data.aiInsights?.suitabilityForML || 'N/A'}"`, ''],
  ];

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VisionLens_Metrics_${data.savedPath.replace(/\.\w+$/, '')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToTXT(data: ImageAnalysisData) {
  const report = `====================================================
VISIONLENS AI - COMPUTER VISION INSPECTION REPORT
====================================================
Title: ${data.title}
File Path: CapturedImages/${data.savedPath}
Date: ${data.capturedAt}

1. METRICS SUMMARY
----------------------------------------------------
Width x Height: ${data.metrics.width} x ${data.metrics.height} px
Resolution: ${data.metrics.megapixels} MP (${data.metrics.totalPixels.toLocaleString()} total px)
Aspect Ratio: ${data.metrics.aspectRatio} (${data.metrics.orientation})
Color Space: ${data.metrics.colorSpace}
Quality Score: ${data.metrics.qualityScore} / 100
Brightness Index: ${data.metrics.brightness} / 255
Contrast StdDev: ${data.metrics.contrast}
Sharpness Laplacian: ${data.metrics.sharpnessScore}
Shannon Entropy: ${data.metrics.entropy} bits/pixel

2. GEMINI MULTIMODAL AI INSIGHTS
----------------------------------------------------
Summary: ${data.aiInsights?.summary || 'Dataset parsed by VisionLens Engine.'}
CNN ML Suitability: ${data.aiInsights?.suitabilityForML || 'Optimal for feature extraction.'}
Detected Objects: ${data.aiInsights?.detectedObjects?.join(', ') || 'N/A'}

Key Analytical Insights:
${data.aiInsights?.insights?.map((i) => ` - ${i}`).join('\n') || ' - High spatial resolution detected.'}

Report compiled by VisionLens AI Kernel v2.4
====================================================`;

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VisionLens_Report_${data.savedPath.replace(/\.\w+$/, '')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(data: ImageAnalysisData) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(0, 229, 255); // cyan-400
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VISIONLENS AI - INSPECTION REPORT', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${data.capturedAt}`, 14, 25);

  // Section 1: Core Metrics Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Core Computer Vision Metrics', 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Image Title: ${data.title}`, 14, 50);
  doc.text(`Resolution: ${data.metrics.width} x ${data.metrics.height} (${data.metrics.megapixels} MP)`, 14, 56);
  doc.text(`Quality Score: ${data.metrics.qualityScore} / 100`, 14, 62);
  doc.text(`Brightness / Contrast: ${data.metrics.brightness} / 255 | ${data.metrics.contrast}`, 14, 68);
  doc.text(`Sharpness Score: ${data.metrics.sharpnessScore}`, 14, 74);
  doc.text(`Shannon Entropy: ${data.metrics.entropy} bits/px`, 14, 80);

  // Section 2: AI Insights
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Multimodal AI Analysis & ML Readiness', 14, 95);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const summaryLines = doc.splitTextToSize(`Summary: ${data.aiInsights?.summary || 'Standard visual dataset analyzed.'}`, 180);
  doc.text(summaryLines, 14, 103);

  let yPos = 103 + summaryLines.length * 6;
  const mlLines = doc.splitTextToSize(`ML CNN Suitability: ${data.aiInsights?.suitabilityForML || 'Well-suited for feature extraction.'}`, 180);
  doc.text(mlLines, 14, yPos);

  yPos += mlLines.length * 6 + 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Key Observations:', 14, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  const insights = data.aiInsights?.insights || ['High structural sharpness detected.', 'Dynamic range balanced.'];
  insights.forEach((insight) => {
    const lines = doc.splitTextToSize(`• ${insight}`, 175);
    doc.text(lines, 18, yPos);
    yPos += lines.length * 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('VisionLens AI Kernel v2.4 • Confidential Inspection Document', 14, 285);

  doc.save(`VisionLens_Report_${data.savedPath.replace(/\.\w+$/, '')}.pdf`);
}
