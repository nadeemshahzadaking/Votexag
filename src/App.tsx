/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
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
  Zap,
  Bot,
  Rocket,
  Ghost,
  Diamond,
  Star,
  Crown,
  Flame,
  Heart,
  Moon,
  Sun,
  Cloud,
  Compass,
  Anchor,
  Target,
  Trophy,
  Gift,
  Coffee,
  Music,
  Camera,
  Globe,
  Shield,
  Key,
  Bell,
  Mail,
  Map,
  Umbrella,
  Watch,
  Smartphone,
  Laptop,
  Cpu,
  Database,
  CloudLightning,
  Wind,
  Droplets,
  Leaf,
  TreePine,
  Mountain,
  Bird,
  Fish,
  Bug,
  PawPrint,
  Smile,
  Glasses,
  Palette,
  PenTool,
  Code2,
  Terminal,
  Binary,
  Atom
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

// --- Constants ---
const WEBSITE_NAME = "ProSlice AI";

const LOGO_ICONS = [
  { icon: Zap, name: "Flash", animation: "pulse" },
  { icon: Bot, name: "Robot", animation: "bounce" },
  { icon: Rocket, name: "Rocket", animation: "float" },
  { icon: Ghost, name: "Ghost", animation: "float" },
  { icon: Diamond, name: "Diamond", animation: "spin" },
  { icon: Star, name: "Star", animation: "pulse" },
  { icon: Crown, name: "Crown", animation: "bounce" },
  { icon: Flame, name: "Flame", animation: "pulse" },
  { icon: Heart, name: "Heart", animation: "pulse" },
  { icon: Moon, name: "Moon", animation: "float" },
  { icon: Sun, name: "Sun", animation: "spin" },
  { icon: Cloud, name: "Cloud", animation: "float" },
  { icon: Compass, name: "Compass", animation: "spin" },
  { icon: Anchor, name: "Anchor", animation: "bounce" },
  { icon: Target, name: "Target", animation: "pulse" },
  { icon: Trophy, name: "Trophy", animation: "bounce" },
  { icon: Gift, name: "Gift", animation: "bounce" },
  { icon: Coffee, name: "Coffee", animation: "float" },
  { icon: Music, name: "Music", animation: "pulse" },
  { icon: Camera, name: "Camera", animation: "bounce" },
  { icon: Globe, name: "Globe", animation: "spin" },
  { icon: Shield, name: "Shield", animation: "pulse" },
  { icon: Key, name: "Key", animation: "bounce" },
  { icon: Bell, name: "Bell", animation: "bounce" },
  { icon: Mail, name: "Mail", animation: "float" },
  { icon: Map, name: "Map", animation: "bounce" },
  { icon: Umbrella, name: "Umbrella", animation: "float" },
  { icon: Watch, name: "Watch", animation: "spin" },
  { icon: Smartphone, name: "Phone", animation: "bounce" },
  { icon: Laptop, name: "Laptop", animation: "pulse" },
  { icon: Cpu, name: "Chip", animation: "pulse" },
  { icon: Database, name: "Data", animation: "bounce" },
  { icon: CloudLightning, name: "Storm", animation: "pulse" },
  { icon: Wind, name: "Wind", animation: "float" },
  { icon: Droplets, name: "Water", animation: "float" },
  { icon: Leaf, name: "Leaf", animation: "float" },
  { icon: TreePine, name: "Tree", animation: "bounce" },
  { icon: Mountain, name: "Mountain", animation: "pulse" },
  { icon: Bird, name: "Bird", animation: "float" },
  { icon: Fish, name: "Fish", animation: "float" },
  { icon: Bug, name: "Bug", animation: "bounce" },
  { icon: PawPrint, name: "Paw", animation: "bounce" },
  { icon: Smile, name: "Smile", animation: "pulse" },
  { icon: Glasses, name: "Glasses", animation: "bounce" },
  { icon: Palette, name: "Art", animation: "pulse" },
  { icon: PenTool, name: "Design", animation: "bounce" },
  { icon: Code2, name: "Code", animation: "pulse" },
  { icon: Terminal, name: "Console", animation: "pulse" },
  { icon: Binary, name: "Binary", animation: "pulse" },
  { icon: Atom, name: "Atom", animation: "spin" }
];

const ANIMATED_LOGOS = LOGO_ICONS.map((item, i) => ({
  id: i + 1,
  ...item,
  color: [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500', 
    'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500'
  ][i % 10]
}));

const AnimatedCharacter = ({ logoId, size = "w-8 h-8", className = "" }: { logoId: number, size?: string, className?: string }) => {
  const logo = ANIMATED_LOGOS.find(l => l.id === logoId) || ANIMATED_LOGOS[0];
  const Icon = logo.icon;

  const getAnimation = () => {
    switch (logo.animation) {
      case 'spin': return { rotate: 360 };
      case 'bounce': return { y: [0, -10, 0] };
      case 'float': return { y: [0, -5, 0], x: [0, 2, 0] };
      case 'pulse': return { scale: [1, 1.1, 1] };
      default: return {};
    }
  };

  const getTransition = () => {
    return { duration: logo.animation === 'spin' ? 4 : 2, repeat: Infinity, ease: "easeInOut" };
  };

  return (
    <motion.div 
      animate={getAnimation()}
      transition={getTransition()}
      className={cn(size, "rounded-lg flex items-center justify-center shadow-lg", logo.color, className)}
    >
      <Icon className="text-black w-3/5 h-3/5 fill-current" />
    </motion.div>
  );
};

// --- Components ---

const Header = ({ selectedLogo }: { selectedLogo: number }) => {
  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AnimatedCharacter logoId={selectedLogo} />
          <h1 className="text-xl font-bold tracking-tight text-white">{WEBSITE_NAME} <span className="text-emerald-500">PRO</span></h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Dashboard</a>
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">History</a>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Active Character: #{selectedLogo}</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

const formatTime = (seconds: number, showMs = false) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  let result = `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  if (showMs) {
    result += `.${ms.toString().padStart(3, '0')}`;
  }
  return result;
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
  const [selectedLogo, setSelectedLogo] = useState(1);
  const [downloadedClips, setDownloadedClips] = useState<Set<string>>(new Set());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setFfmpegLoaded(true);
  };

  // Live Calculations
  const getLiveStats = () => {
    if (!metadata) return null;
    let totalClips = 0;
    let durationPerClip = 0;

    if (splitMode === 'parts') {
      totalClips = partsCount;
      durationPerClip = metadata.duration / partsCount;
    } else {
      const segmentSec = (timeValue.h * 3600) + (timeValue.m * 60) + timeValue.s;
      if (segmentSec > 0) {
        totalClips = Math.ceil(metadata.duration / segmentSec);
        durationPerClip = segmentSec;
      }
    }
    return { totalClips, durationPerClip };
  };

  const liveStats = getLiveStats();

  const downloadClip = async (clip: VideoClip) => {
    if (!videoFile || !ffmpegLoaded) return;
    
    setIsProcessing(true);
    const ffmpeg = ffmpegRef.current;
    const websiteName = WEBSITE_NAME.replace(/\s+/g, '_');
    const fileName = `${websiteName}_Part${clip.id.split('-')[1]}.${outputFormat}`;

    try {
      // Write the file to FFmpeg's virtual file system
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      // Execute the slice command
      // -ss: start time, -to: end time, -c copy: fast slicing without re-encoding
      await ffmpeg.exec([
        '-ss', clip.startTime.toString(),
        '-to', clip.endTime.toString(),
        '-i', 'input.mp4',
        '-c', 'copy',
        'output.' + outputFormat
      ]);

      // Read the result
      const data = await ffmpeg.readFile('output.' + outputFormat);
      const url = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: `video/${outputFormat}` }));
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadedClips(prev => new Set(prev).add(clip.id));
    } catch (error) {
      console.error('Slicing error:', error);
      alert('Error slicing video. Please try a different format or smaller clip.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    for (const clip of clips) {
      await downloadClip(clip);
    }
  };

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
    
    // Use requestAnimationFrame for high-speed UI updates
    const startTime = performance.now();
    
    // Immediate calculation for "Power"
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
      // High precision duration calculation (ms)
      const segmentDuration = (timeValue.h * 3600) + (timeValue.m * 60) + timeValue.s + (0.001); // Add precision
      if (segmentDuration <= 0.001) {
        setIsProcessing(false);
        return;
      }
      
      let current = 0;
      let index = 1;
      // Limit to 100,000 to prevent infinite loops but allow massive scale
      while (current < totalDuration && index <= 100000) {
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

    // Fast progress simulation that matches the "Powerful" feel
    let currentProgress = 0;
    const animateProgress = () => {
      currentProgress += 10; // Jump fast
      if (currentProgress <= 100) {
        setProgress(currentProgress);
        requestAnimationFrame(animateProgress);
      } else {
        setClips(newClips);
        setIsProcessing(false);
        setProgress(0);
        console.log(`Processed ${newClips.length} clips in ${performance.now() - startTime}ms`);
      }
    };
    requestAnimationFrame(animateProgress);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30">
      <Header selectedLogo={selectedLogo} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Logo Selection Section */}
        <section className="mb-12 bg-white/[0.02] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-500" />
              Select Brand Character
            </h3>
            <span className="text-xs text-white/40 font-mono">50 Unique Animated Characters</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {ANIMATED_LOGOS.map(logo => (
              <button
                key={logo.id}
                onClick={() => setSelectedLogo(logo.id)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center transition-all relative group",
                  selectedLogo === logo.id ? "ring-2 ring-emerald-500 scale-95 bg-white/5" : "hover:bg-white/5"
                )}
              >
                <AnimatedCharacter logoId={logo.id} size="w-10 h-10" />
                {selectedLogo === logo.id && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3 text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {!videoFile ? (
          <div className="max-w-3xl mx-auto space-y-12 py-20">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-block"
              >
                <AnimatedCharacter logoId={selectedLogo} size="w-24 h-24" className="mx-auto mb-8" />
              </motion.div>
              <h2 className="text-5xl font-bold tracking-tight">
                Ready to <span className="text-emerald-500 italic">Slice?</span>
              </h2>
              <p className="text-white/50 text-lg">
                Upload your video to unlock the world's most powerful slicing engine.
              </p>
            </div>

            <div 
              {...getRootProps()} 
              className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-[40px] p-20 transition-all duration-500",
                isDragActive ? "border-emerald-500 bg-emerald-500/5 scale-105" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Upload className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Drop your masterpiece here</p>
                  <p className="text-white/40 mt-2">Supports any video format, up to 5 hours long</p>
                </div>
                <button className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all">
                  Select Video File
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Analysis & Preview */}
            <div className="lg:col-span-7 space-y-8">
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
                      <button 
                        onClick={downloadAll}
                        className="flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download All Clips
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {clips.slice(0, 1000).map((clip, idx) => {
                        const isDownloaded = downloadedClips.has(clip.id);
                        return (
                          <motion.div 
                            key={clip.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "group bg-white/[0.02] border border-white/10 p-4 rounded-2xl transition-all cursor-pointer",
                              isDownloaded ? "opacity-50 border-emerald-500/20" : "hover:border-emerald-500/50"
                            )}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{clip.label}</span>
                                {isDownloaded && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              </div>
                              <span className="text-xs font-mono text-emerald-500">{formatTime(clip.duration, true)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] text-white/30 font-mono">
                                {formatTime(clip.startTime, true)} → {formatTime(clip.endTime, true)}
                              </div>
                              <button 
                                onClick={() => downloadClip(clip)}
                                disabled={isDownloaded || isProcessing}
                                className={cn(
                                  "p-2 rounded-lg transition-all",
                                  isDownloaded ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 group-hover:bg-emerald-500 group-hover:text-black"
                                )}
                              >
                                {isDownloaded ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                      {clips.length > 1000 && (
                        <div className="col-span-full p-4 text-center text-white/40 text-sm italic">
                          Showing first 1,000 of {clips.length.toLocaleString()} clips. All are ready for download.
                        </div>
                      )}
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
                            max="1000" 
                            value={partsCount}
                            onChange={(e) => setPartsCount(parseInt(e.target.value))}
                            className="flex-1 accent-emerald-500"
                          />
                          <span className="w-16 text-center font-mono text-xl">{partsCount}</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {[10, 50, 100, 500, 1000].map(val => (
                            <button 
                              key={val}
                              onClick={() => setPartsCount(val)}
                              className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold hover:bg-emerald-500 hover:text-black transition-all"
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                        {liveStats && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4"
                          >
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                              <Clock className="text-black w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Animated Calculation</p>
                              <p className="text-sm text-white/80">
                                Each part: <span className="text-emerald-400 font-mono font-bold">{formatTime(liveStats.durationPerClip, true)}</span>
                              </p>
                            </div>
                          </motion.div>
                        )}
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
                        {liveStats && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4"
                          >
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                              <Layers className="text-black w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Animated Calculation</p>
                              <p className="text-sm text-white/80">
                                Total Clips: <span className="text-emerald-400 font-mono font-bold">{liveStats.totalClips}</span>
                              </p>
                            </div>
                          </motion.div>
                        )}
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
                    disabled={!videoFile || isProcessing || !ffmpegLoaded}
                    onClick={handleSplit}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden",
                      !videoFile || !ffmpegLoaded ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
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
                  {!ffmpegLoaded && (
                    <p className="text-[10px] text-center text-white/40 animate-pulse">Initializing Slicing Engine...</p>
                  )}
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
        )}
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
