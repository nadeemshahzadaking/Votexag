/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Video, 
  Scissors, 
  Clock, 
  Download, 
  Play, 
  Info, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Layers,
  FileVideo,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface VideoMetadata {
  name: string;
  size: number;
  duration: number; // in seconds
  format: string;
  resolution: string;
}

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  label: string;
}

// --- Components ---

const Header = () => (
  <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Zap className="text-black w-5 h-5 fill-current" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">ProSlice <span className="text-emerald-500">AI</span></h1>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Dashboard</a>
        <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">History</a>
        <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</a>
        <div className="h-4 w-px bg-white/10" />
        <button className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-emerald-400 transition-all">
          Upgrade Pro
        </button>
      </nav>
    </div>
  </header>
);

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [splitMode, setSplitMode] = useState<'parts' | 'time'>('parts');
  const [partsCount, setPartsCount] = useState(5);
  const [timeValue, setTimeValue] = useState({ h: 0, m: 5, s: 0 });
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState('mp4');

  const videoRef = useRef<HTMLVideoElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setVideoFile(file);
      setIsAnalyzing(true);
      setClips([]);
      
      // Create a temporary video element to get metadata
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setMetadata({
          name: file.name,
          size: file.size,
          duration: video.duration,
          format: file.type.split('/')[1].toUpperCase(),
          resolution: `${video.videoWidth}x${video.videoHeight}`
        });
        setIsAnalyzing(false);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'video/*': [
        '.mp4', '.mkv', '.mov', '.avi', '.webm', '.flv', '.wmv', '.m4v', '.3gp', '.mpg', '.mpeg'
      ] 
    },
    multiple: false
  } as any);

  const handleSplit = () => {
    if (!metadata) return;
    setIsProcessing(true);
    setProgress(0);
    setClips([]);
    
    // Simulate processing progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    setTimeout(() => {
      const newClips: VideoClip[] = [];
      const totalDuration = metadata.duration;

      if (splitMode === 'parts') {
        const segmentDuration = totalDuration / partsCount;
        for (let i = 0; i < partsCount; i++) {
          newClips.push({
            id: `clip-${i}`,
            startTime: i * segmentDuration,
            endTime: (i + 1) * segmentDuration,
            duration: segmentDuration,
            label: `Part ${i + 1}`
          });
        }
      } else {
        const segmentDuration = (timeValue.h * 3600) + (timeValue.m * 60) + timeValue.s;
        if (segmentDuration <= 0) {
          setIsProcessing(false);
          clearInterval(interval);
          return;
        }
        
        let current = 0;
        let index = 1;
        while (current < totalDuration) {
          const end = Math.min(current + segmentDuration, totalDuration);
          newClips.push({
            id: `clip-${index}`,
            startTime: current,
            endTime: end,
            duration: end - current,
            label: `Clip ${index}`
          });
          current = end;
          index++;
        }
      }

      setClips(newClips);
      setIsProcessing(false);
      setProgress(0);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Analysis */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Hero Section */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">
                Professional <span className="text-emerald-500 italic">Video Slicing</span>
              </h2>
              <p className="text-white/50 max-w-lg">
                Analyze, split, and export high-resolution films into perfectly timed clips. 
                Fast, precise, and built for professionals.
              </p>
            </div>

            {/* Upload Area or Preview */}
            {!videoFile ? (
              <div 
                {...getRootProps()} 
                className={cn(
                  "relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300",
                  isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drop any video here</p>
                    <p className="text-sm text-white/40">Supports MP4, MKV, MOV, AVI, WEBM & more</p>
                  </div>
                  <button className="px-6 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-emerald-400 transition-colors">
                    Select Video File
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                  <div className="flex items-center gap-3">
                    <FileVideo className="text-emerald-500 w-5 h-5" />
                    <span className="font-medium truncate max-w-[300px] text-sm">{videoFile.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setVideoFile(null);
                      setMetadata(null);
                      setClips([]);
                    }}
                    className="px-3 py-1 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Remove
                  </button>
                </div>

                {/* Video Preview Player */}
                <div className="aspect-video bg-black relative group">
                  <video 
                    ref={videoRef}
                    src={URL.createObjectURL(videoFile)}
                    className="w-full h-full object-contain"
                    controls
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Analyzing Video...</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.01]">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Duration</p>
                    <p className="text-lg font-mono text-emerald-500">{metadata ? formatTime(metadata.duration) : '---'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Resolution</p>
                    <p className="text-lg font-mono">{metadata?.resolution || '---'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Size</p>
                    <p className="text-lg font-mono">{metadata ? formatSize(metadata.size) : '---'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Format</p>
                    <p className="text-lg font-mono uppercase">{metadata?.format || '---'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Clips List */}
            <AnimatePresence>
              {clips.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-500" />
                      Generated Clips ({clips.length})
                    </h3>
                    <button className="flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                      <Download className="w-4 h-4" />
                      Download All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clips.map((clip, idx) => (
                      <motion.div 
                        key={clip.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-white/[0.02] border border-white/10 p-4 rounded-2xl hover:border-emerald-500/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{clip.label}</span>
                          <span className="text-xs font-mono text-emerald-500">{formatTime(clip.duration)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-white/30 font-mono">
                            {formatTime(clip.startTime)} → {formatTime(clip.endTime)}
                          </div>
                          <button className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              
              {/* Slicing Controls */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-8">
                <div className="flex items-center gap-3">
                  <Scissors className="text-emerald-500 w-6 h-6" />
                  <h3 className="text-xl font-bold">Slicing Engine</h3>
                </div>

                {/* Mode Toggle */}
                <div className="flex p-1 bg-black rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setSplitMode('parts')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
                      splitMode === 'parts' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    )}
                  >
                    By Parts
                  </button>
                  <button 
                    onClick={() => setSplitMode('time')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
                      splitMode === 'time' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    )}
                  >
                    By Duration
                  </button>
                </div>

                {/* Input Fields */}
                <div className="space-y-6">
                  {splitMode === 'parts' ? (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Number of Parts</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="2" 
                          max="50" 
                          value={partsCount}
                          onChange={(e) => setPartsCount(parseInt(e.target.value))}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="w-12 text-center font-mono text-xl">{partsCount}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Clip Duration</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <input 
                            type="number" 
                            value={timeValue.h}
                            onChange={(e) => setTimeValue({...timeValue, h: parseInt(e.target.value) || 0})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:border-emerald-500 outline-none transition-colors"
                          />
                          <p className="text-[10px] text-center text-white/30 uppercase">Hours</p>
                        </div>
                        <div className="space-y-1">
                          <input 
                            type="number" 
                            value={timeValue.m}
                            onChange={(e) => setTimeValue({...timeValue, m: parseInt(e.target.value) || 0})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:border-emerald-500 outline-none transition-colors"
                          />
                          <p className="text-[10px] text-center text-white/30 uppercase">Minutes</p>
                        </div>
                        <div className="space-y-1">
                          <input 
                            type="number" 
                            value={timeValue.s}
                            onChange={(e) => setTimeValue({...timeValue, s: parseInt(e.target.value) || 0})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:border-emerald-500 outline-none transition-colors"
                          />
                          <p className="text-[10px] text-center text-white/30 uppercase">Seconds</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Format Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Output Format</label>
                    <select 
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 appearance-none focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="mp4">MP4 (High Compatibility)</option>
                      <option value="mkv">MKV (Lossless)</option>
                      <option value="mov">MOV (Apple ProRes)</option>
                      <option value="avi">AVI (Legacy)</option>
                    </select>
                  </div>
                </div>

                <button 
                  disabled={!videoFile || isProcessing}
                  onClick={handleSplit}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden",
                    !videoFile ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {isProcessing && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="absolute inset-0 bg-white/20 pointer-events-none"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Processing {progress}%
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5" />
                        Start Slicing
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Pro Features Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-black relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <h4 className="text-2xl font-bold leading-tight">Monetize Your <br />Video Content</h4>
                  <p className="text-black/70 text-sm font-medium">Get advanced AI analysis and direct YouTube/TikTok export with Pro.</p>
                  <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-black/80 transition-colors">
                    Learn More
                  </button>
                </div>
                <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-black/10 rotate-12 group-hover:scale-110 transition-transform" />
              </div>

            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-white/10 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-tighter">ProSlice AI Engine v2.4</span>
          </div>
          <p className="text-white/30 text-xs">© 2026 ProSlice Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
