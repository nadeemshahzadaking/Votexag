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
  FolderOpen,
  Timer
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

const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4 (Standard)' },
  { value: 'mkv', label: 'MKV (High Quality)' },
  { value: 'mov', label: 'MOV (Apple)' },
  { value: 'avi', label: 'AVI (Legacy)' },
  { value: 'webm', label: 'WebM (Web)' },
  { value: 'flv', label: 'FLV (Flash)' },
  { value: 'wmv', label: 'WMV (Windows)' },
  { value: '3gp', label: '3GP (Mobile)' },
  { value: 'm4v', label: 'M4V (iTunes)' },
  { value: 'mpg', label: 'MPG (MPEG-1)' },
  { value: 'mpeg', label: 'MPEG (MPEG-2)' },
  { value: 'ts', label: 'TS (Transport Stream)' },
  { value: 'vob', label: 'VOB (DVD)' },
  { value: 'asf', label: 'ASF (Advanced Systems)' },
  { value: 'ogv', label: 'OGV (Ogg Video)' },
  { value: 'm2ts', label: 'M2TS (Blu-ray)' },
  { value: 'f4v', label: 'F4V (Flash HD)' },
  { value: 'divx', label: 'DivX (High Speed)' },
  { value: 'xvid', label: 'Xvid (Open Source)' },
  { value: 'rm', label: 'RealMedia (Classic)' }
];

// --- Components ---

const Header = () => {
  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="text-black w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{WEBSITE_NAME} <span className="text-emerald-500">PRO</span></h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">System Ready</span>
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
  const [view, setView] = useState<'home' | 'slicer'>('home');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [splitMode, setSplitMode] = useState<'parts' | 'time'>('parts');
  const [partsCount, setPartsCount] = useState<number | string>(2);
  const [timeValue, setTimeValue] = useState({ h: '', m: '', s: '' });
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [downloadedClips, setDownloadedClips] = useState<Set<string>>(new Set());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);
  const [lastGeneratedSettings, setLastGeneratedSettings] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const stopQueueRef = useRef(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("FFmpeg Load Error:", err);
      setNotification({ message: "Failed to load slicing engine. Please refresh.", type: 'error' });
    }
  };

  const resetSystem = async () => {
    stopQueueRef.current = true;
    setIsBulkDownloading(false);
    setIsProcessing(false);
    
    if (videoFile) {
      try {
        await ffmpegRef.current.deleteFile('input.mp4');
      } catch (e) {}
    }
    setVideoFile(null);
    setMetadata(null);
    setClips([]);
    setDownloadedClips(new Set());
    setDirectoryHandle(null);
    setLastGeneratedSettings('');
    setProgress(0);
    setNotification({ message: "System reset. All processes stopped.", type: 'info' });
  };

  const selectFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker();
        setDirectoryHandle(handle);
        setNotification({ message: `Output folder set to: ${handle.name}`, type: 'success' });
      } else {
        setNotification({ message: "Folder selection not supported on this device. Using default downloads.", type: 'info' });
      }
    } catch (err) {
      console.error("Folder selection error:", err);
    }
  };

  // Live Calculations
  const getLiveStats = () => {
    if (!metadata) return null;
    let totalClips = 0;
    let durationPerClip = 0;

    const currentParts = typeof partsCount === 'string' ? parseInt(partsCount) || 0 : partsCount;

    if (splitMode === 'parts') {
      if (currentParts >= 2) {
        totalClips = currentParts;
        durationPerClip = metadata.duration / currentParts;
      }
    } else {
      const h = parseInt(timeValue.h as string) || 0;
      const m = parseInt(timeValue.m as string) || 0;
      const s = parseInt(timeValue.s as string) || 0;
      const segmentSec = (h * 3600) + (m * 60) + s;
      if (segmentSec >= 1) {
        totalClips = Math.ceil(metadata.duration / segmentSec);
        durationPerClip = segmentSec;
      }
    }

    // Estimated time: 1s of video takes roughly 0.1s to process on ultrafast
    const estimatedTime = totalClips * (durationPerClip * 0.15);
    const allocatedDuration = totalClips * durationPerClip;
    const remainingDuration = Math.max(0, metadata.duration - allocatedDuration);

    return { totalClips, durationPerClip, estimatedTime, remainingDuration };
  };

  const liveStats = getLiveStats();

  const downloadClip = async (clip: VideoClip) => {
    if (!videoFile || !ffmpegLoaded || stopQueueRef.current) return;
    if (downloadedClips.has(clip.id)) return;
    
    setIsProcessing(true);
    const ffmpeg = ffmpegRef.current;
    const websiteName = WEBSITE_NAME.replace(/\s+/g, '_');
    
    // Pad the part number for correct file system sorting (e.g., Part001 instead of Part1)
    const partNum = clip.id.split('-')[1];
    const paddedNum = partNum.padStart(3, '0');
    const fileName = `${websiteName}_Part${paddedNum}.${outputFormat}`;

    try {
      setNotification({ message: `Slicing ${clip.label}...`, type: 'info' });
      
      try {
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      } catch (e) {}

      if (stopQueueRef.current) return;

      await ffmpeg.exec([
        '-ss', clip.startTime.toFixed(3),
        '-to', clip.endTime.toFixed(3),
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'fastdecode',
        '-crf', '24',
        '-c:a', 'aac',
        '-b:a', '128k',
        'output.' + outputFormat
      ]);

      if (stopQueueRef.current) return;

      const data = await ffmpeg.readFile('output.' + outputFormat);
      const blob = new Blob([(data as Uint8Array).buffer], { type: `video/${outputFormat}` });

      if (directoryHandle) {
        try {
          const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          console.error("Direct save error, falling back to download:", err);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setDownloadedClips(prev => new Set(prev).add(clip.id));
      setNotification({ message: `${clip.label} ready!`, type: 'success' });
      
      await ffmpeg.deleteFile('output.' + outputFormat);
    } catch (error) {
      console.error('Slicing error:', error);
      if (!stopQueueRef.current) {
        setNotification({ message: `Error slicing ${clip.label}.`, type: 'error' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    stopQueueRef.current = false;
    setIsBulkDownloading(true);
    setNotification({ message: "Processing all clips...", type: 'info' });
    
    for (const clip of clips) {
      if (stopQueueRef.current) break;
      if (!downloadedClips.has(clip.id)) {
        await downloadClip(clip);
      }
    }
    
    setIsBulkDownloading(false);
    if (!stopQueueRef.current) {
      setNotification({ message: "All clips processed!", type: 'success' });
    }
  };

  const cancelDownloads = () => {
    stopQueueRef.current = true;
    setIsBulkDownloading(false);
    setIsProcessing(false);
    setNotification({ message: "Downloads cancelled.", type: 'info' });
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
    
    const currentParts = typeof partsCount === 'string' ? parseInt(partsCount) || 0 : partsCount;
    const h = parseInt(timeValue.h as string) || 0;
    const m = parseInt(timeValue.m as string) || 0;
    const s = parseInt(timeValue.s as string) || 0;

    const currentSettings = JSON.stringify({ splitMode, partsCount, timeValue, metadataName: metadata.name });
    if (currentSettings === lastGeneratedSettings && clips.length > 0) {
      setNotification({ message: "Clips already generated for these settings.", type: 'info' });
      return;
    }

    const segmentDuration = splitMode === 'parts' 
      ? Number((metadata.duration / currentParts).toFixed(3))
      : Number(((h * 3600) + (m * 60) + s).toFixed(3));

    if (segmentDuration < 1) {
      setNotification({ message: "Clip duration must be at least 1 second.", type: 'error' });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setClips([]);
    
    const newClips: VideoClip[] = [];
    const totalDuration = metadata.duration;

    if (splitMode === 'parts') {
      for (let i = 0; i < currentParts; i++) {
        newClips.push({
          id: `clip-${i + 1}`,
          startTime: i * segmentDuration,
          endTime: Math.min((i + 1) * segmentDuration, totalDuration),
          duration: Math.min((i + 1) * segmentDuration, totalDuration) - (i * segmentDuration),
          label: `Part ${i + 1}`
        });
      }
    } else {
      let current = 0;
      let index = 1;
      while (current < totalDuration && index <= 100000) {
        const end = Math.min(current + segmentDuration, totalDuration);
        if (end - current >= 1) {
          newClips.push({
            id: `clip-${index}`,
            startTime: current,
            endTime: end,
            duration: end - current,
            label: `Clip ${index}`
          });
        }
        current = end;
        index++;
      }
    }

    let currentProgress = 0;
    const animateProgress = () => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
        requestAnimationFrame(animateProgress);
      } else {
        setClips(newClips);
        setLastGeneratedSettings(currentSettings);
        setIsProcessing(false);
        setProgress(0);
        setNotification({ message: `Generated ${newClips.length} clips!`, type: 'success' });
      }
    };
    requestAnimationFrame(animateProgress);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30">
      <Header />

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
              notification.type === 'success' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
              notification.type === 'error' ? "bg-red-500/20 border-red-500/50 text-red-400" :
              "bg-blue-500/20 border-blue-500/50 text-blue-400"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
             notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
             <Info className="w-5 h-5" />}
            <span className="text-sm font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'home' && (
          <div className="max-w-4xl mx-auto py-20 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-black tracking-tighter">
                CHOOSE YOUR <span className="text-emerald-500 italic">POWER</span>
              </h2>
              <p className="text-white/40 text-lg">The world's most advanced AI media toolkit at your fingertips.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('slicer')}
                className="group relative aspect-[4/3] bg-white/[0.02] border border-white/10 rounded-[40px] p-10 text-left flex flex-col justify-between overflow-hidden transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                  <Scissors className="text-black w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">Video Slicer</h3>
                  <p className="text-white/40 leading-relaxed">High-precision AI slicing for your videos.</p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-8 h-8 text-emerald-500" />
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {view === 'slicer' && (
          <div className="space-y-8">
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Home
            </button>
            {!videoFile ? (
              <div className="max-w-3xl mx-auto space-y-12 py-20">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 animate-bounce">
                    <Video className="text-black w-12 h-12" />
                  </div>
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
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xl font-bold text-emerald-500 animate-pulse">Processing Video...</p>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
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
                    onClick={resetSystem}
                    className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Continue with Other
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
                      <div className="flex items-center gap-4">
                        {isBulkDownloading ? (
                          <button 
                            onClick={cancelDownloads}
                            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Cancel All
                          </button>
                        ) : (
                          <button 
                            onClick={downloadAll}
                            className="flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download All
                          </button>
                        )}
                      </div>
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
                            type="number" 
                            min="2" 
                            max="1000" 
                            placeholder="Example: 2"
                            value={partsCount}
                            onFocus={(e) => { if (e.target.value === '0' || e.target.value === '2') setPartsCount(''); }}
                            onBlur={(e) => { if (e.target.value === '') setPartsCount(2); }}
                            onChange={(e) => setPartsCount(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-emerald-500 outline-none transition-colors"
                          />
                        </div>
                        {liveStats && (
                          <div className="space-y-4">
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4"
                            >
                              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                                <Clock className="text-black w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Animated Calculation</p>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-white/80">
                                    Each part: <span className="text-emerald-400 font-mono font-bold">{formatTime(liveStats.durationPerClip, true)}</span>
                                  </p>
                                  <p className="text-[10px] text-white/40 font-mono">
                                    Remaining: {formatTime(liveStats.remainingDuration)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                <Timer className="w-4 h-4 text-emerald-500" />
                                <div>
                                  <p className="text-[8px] uppercase text-white/40 font-bold">Est. Time</p>
                                  <p className="text-xs font-mono text-emerald-400">~{Math.ceil(liveStats.estimatedTime)}s</p>
                                </div>
                              </div>
                              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                <Zap className="w-4 h-4 text-emerald-500" />
                                <div>
                                  <p className="text-[8px] uppercase text-white/40 font-bold">Speed</p>
                                  <p className="text-xs font-mono text-emerald-400">Ultra Fast</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Clip Duration</label>
                        <div className="grid grid-cols-3 gap-3">
                          {metadata && metadata.duration >= 3600 && (
                            <div className="space-y-1">
                              <input 
                                type="number" 
                                placeholder="0"
                                value={timeValue.h}
                                onFocus={(e) => { if (e.target.value === '0') setTimeValue({...timeValue, h: ''}); }}
                                onBlur={(e) => { if (e.target.value === '') setTimeValue({...timeValue, h: '0'}); }}
                                onChange={(e) => setTimeValue({...timeValue, h: e.target.value})}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:border-emerald-500 outline-none transition-colors"
                              />
                              <p className="text-[10px] text-center text-white/30 uppercase">Hours</p>
                            </div>
                          )}
                          {metadata && metadata.duration >= 60 && (
                            <div className="space-y-1">
                              <input 
                                type="number" 
                                placeholder="0"
                                value={timeValue.m}
                                onFocus={(e) => { if (e.target.value === '0') setTimeValue({...timeValue, m: ''}); }}
                                onBlur={(e) => { if (e.target.value === '') setTimeValue({...timeValue, m: '0'}); }}
                                onChange={(e) => setTimeValue({...timeValue, m: e.target.value})}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:border-emerald-500 outline-none transition-colors"
                              />
                              <p className="text-[10px] text-center text-white/30 uppercase">Minutes</p>
                            </div>
                          )}
                          <div className="space-y-1">
                            <input 
                              type="number" 
                              placeholder="0"
                              value={timeValue.s}
                              onFocus={(e) => { if (e.target.value === '0') setTimeValue({...timeValue, s: ''}); }}
                              onBlur={(e) => { if (e.target.value === '') setTimeValue({...timeValue, s: '0'}); }}
                              onChange={(e) => setTimeValue({...timeValue, s: e.target.value})}
                              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:border-emerald-500 outline-none transition-colors"
                            />
                            <p className="text-[10px] text-center text-white/30 uppercase">Seconds</p>
                          </div>
                        </div>
                        {liveStats && (
                          <div className="space-y-4">
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4"
                            >
                              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                                <Layers className="text-black w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Animated Calculation</p>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-white/80">
                                    Total Clips: <span className="text-emerald-400 font-mono font-bold">{liveStats.totalClips}</span>
                                  </p>
                                  <p className="text-[10px] text-white/40 font-mono">
                                    Remaining: {formatTime(liveStats.remainingDuration)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                <Timer className="w-4 h-4 text-emerald-500" />
                                <div>
                                  <p className="text-[8px] uppercase text-white/40 font-bold">Est. Time</p>
                                  <p className="text-xs font-mono text-emerald-400">~{Math.ceil(liveStats.estimatedTime)}s</p>
                                </div>
                              </div>
                              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                <Zap className="w-4 h-4 text-emerald-500" />
                                <div>
                                  <p className="text-[8px] uppercase text-white/40 font-bold">Speed</p>
                                  <p className="text-xs font-mono text-emerald-400">Ultra Fast</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Format Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Output Format</label>
                        <select 
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 appearance-none focus:border-emerald-500 outline-none transition-colors"
                        >
                          {VIDEO_FORMATS.map(fmt => (
                            <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Output Folder</label>
                        <button 
                          onClick={selectFolder}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                            directoryHandle ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-black border-white/10 text-white/40 hover:border-white/20"
                          )}
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-sm font-medium truncate">
                            {directoryHandle ? directoryHandle.name : "Select Folder"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={!videoFile || isProcessing || !ffmpegLoaded || (JSON.stringify({ splitMode, partsCount, timeValue, metadataName: metadata?.name }) === lastGeneratedSettings && clips.length > 0)}
                    onClick={handleSplit}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden",
                      !videoFile || !ffmpegLoaded || (JSON.stringify({ splitMode, partsCount, timeValue, metadataName: metadata?.name }) === lastGeneratedSettings && clips.length > 0) ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
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

              </div>
            </div>
          </div>
        )}
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
        </div>
      </footer>
    </div>
  );
}
