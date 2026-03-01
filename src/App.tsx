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
  Atom,
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
import { GoogleGenAI, Modality } from "@google/genai";

const WEBSITE_NAME = "ProSlice AI";

const LANGUAGES = [
  { code: 'ur', name: 'Urdu' },
  { code: 'en', name: 'English' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'tr', name: 'Turkish' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ko', name: 'Korean' },
  { code: 'bn', name: 'Bengali' },
  { code: 'fa', name: 'Persian' },
  { code: 'ps', name: 'Pashto' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'cs', name: 'Czech' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'am', name: 'Amharic' },
  { code: 'sw', name: 'Swahili' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'zu', name: 'Zulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'hr', name: 'Croatian' },
  { code: 'et', name: 'Estonian' },
  { code: 'gl', name: 'Galician' },
  { code: 'ka', name: 'Georgian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'lo', name: 'Lao' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'so', name: 'Somali' },
  { code: 'tg', name: 'Tajik' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'cy', name: 'Welsh' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' }
];

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr (Deep)', gender: 'Male' },
  { id: 'Kore', name: 'Kore (Clear)', gender: 'Female' },
  { id: 'Fenrir', name: 'Fenrir (Bold)', gender: 'Male' },
  { id: 'Puck', name: 'Puck (Playful)', gender: 'Male' },
  { id: 'Charon', name: 'Charon (Steady)', gender: 'Male' },
  { id: 'Aoede', name: 'Aoede (Soft)', gender: 'Female' },
  { id: 'Nyx', name: 'Nyx (Mysterious)', gender: 'Female' },
  { id: 'Eos', name: 'Eos (Bright)', gender: 'Female' },
  { id: 'Aether', name: 'Aether (Airy)', gender: 'Male' },
  { id: 'Gaia', name: 'Gaia (Warm)', gender: 'Female' },
  { id: 'Helios', name: 'Helios (Radiant)', gender: 'Male' },
  { id: 'Selene', name: 'Selene (Calm)', gender: 'Female' },
  { id: 'Atlas', name: 'Atlas (Strong)', gender: 'Male' },
  { id: 'Iris', name: 'Iris (Colorful)', gender: 'Female' },
  { id: 'Hermes', name: 'Hermes (Fast)', gender: 'Male' },
  { id: 'Hestia', name: 'Hestia (Kind)', gender: 'Female' },
  { id: 'Apollo', name: 'Apollo (Musical)', gender: 'Male' },
  { id: 'Artemis', name: 'Artemis (Sharp)', gender: 'Female' },
  { id: 'Dionysus', name: 'Dionysus (Rich)', gender: 'Male' },
  { id: 'Athena', name: 'Athena (Wise)', gender: 'Female' }
];

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
  const [view, setView] = useState<'home' | 'slicer' | 'cult' | 'cult-voice' | 'cult-video-lang'>('home');
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

  // AI States
  const [voiceMode, setVoiceMode] = useState<'tts' | 'stt' | 'translate'>('tts');
  const [targetLang, setTargetLang] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [inputText, setInputText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiTextResult, setAiTextResult] = useState<string | null>(null);
  const [dubbedVideoUrl, setDubbedVideoUrl] = useState<string | null>(null);

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

  // AI Handlers
  const handleTTS = async () => {
    if (!inputText) return;
    setIsProcessingAI(true);
    setAiResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say in ${LANGUAGES.find(l => l.code === targetLang)?.name}: ${inputText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice as any },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        setAiResult(audioUrl);
        setNotification({ message: "Speech generated!", type: 'success' });
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setNotification({ message: "Failed to generate speech.", type: 'error' });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText) return;
    setIsProcessingAI(true);
    setAiTextResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following to ${LANGUAGES.find(l => l.code === targetLang)?.name}: ${inputText}`,
      });
      setAiTextResult(response.text);
      setNotification({ message: "Translation complete!", type: 'success' });
    } catch (err) {
      console.error("Translate Error:", err);
      setNotification({ message: "Failed to translate.", type: 'error' });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSTT = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingAI(true);
    setAiTextResult(null);
    setNotification({ message: "Transcribing audio...", type: 'info' });
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { inlineData: { data: base64, mimeType: file.type } },
                { text: `Transcribe this audio and translate it to ${LANGUAGES.find(l => l.code === targetLang)?.name} if it's in a different language.` }
              ]
            }
          ]
        });
        setAiTextResult(response.text);
        setNotification({ message: "Transcription complete!", type: 'success' });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("STT Error:", err);
      setNotification({ message: "Failed to transcribe audio.", type: 'error' });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleVideoDub = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingAI(true);
    setNotification({ message: "Extracting audio from video...", type: 'info' });
    
    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input_video.mp4';
      const audioName = 'output_audio.mp3';
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // Extract audio
      await ffmpeg.exec(['-i', inputName, '-vn', '-ab', '128k', '-ar', '44100', '-y', audioName]);
      const audioData = await ffmpeg.readFile(audioName);
      const audioBase64 = btoa(new Uint8Array(audioData as ArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      
      setNotification({ message: "Translating and generating new voice...", type: 'info' });
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // 1. Transcribe & Translate
      const transResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { inlineData: { data: audioBase64, mimeType: 'audio/mp3' } },
              { text: `Transcribe this video's audio and translate it to ${LANGUAGES.find(l => l.code === targetLang)?.name}. Return ONLY the translated text.` }
            ]
          }
        ]
      });
      
      const translatedText = transResponse.text;
      
      // 2. TTS
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: translatedText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice as any },
            },
          },
        },
      });
      
      const newAudioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!newAudioBase64) throw new Error("TTS failed");
      
      const newAudioData = Uint8Array.from(atob(newAudioBase64), c => c.charCodeAt(0));
      await ffmpeg.writeFile('new_audio.mp3', newAudioData);
      
      setNotification({ message: "Merging new audio with video...", type: 'info' });
      
      // 3. Merge (Replace original audio)
      await ffmpeg.exec([
        '-i', inputName, 
        '-i', 'new_audio.mp3', 
        '-c:v', 'copy', 
        '-map', '0:v:0', 
        '-map', '1:a:0', 
        '-shortest', 
        '-y', 'dubbed_video.mp4'
      ]);
      
      const dubbedData = await ffmpeg.readFile('dubbed_video.mp4');
      const dubbedUrl = URL.createObjectURL(new Blob([dubbedData], { type: 'video/mp4' }));
      
      setDubbedVideoUrl(dubbedUrl);
      setNotification({ message: "Video dubbed successfully!", type: 'success' });
      
    } catch (err) {
      console.error("Dubbing Error:", err);
      setNotification({ message: "Failed to dub video.", type: 'error' });
    } finally {
      setIsProcessingAI(false);
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <p className="text-white/40 leading-relaxed">High-precision AI slicing for long videos. Up to 1,000 clips in seconds.</p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-8 h-8 text-emerald-500" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('cult')}
                className="group relative aspect-[4/3] bg-white/[0.02] border border-white/10 rounded-[40px] p-10 text-left flex flex-col justify-between overflow-hidden transition-all hover:border-purple-500/50 hover:bg-purple-500/[0.02]"
              >
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:-rotate-12 transition-transform">
                  <Zap className="text-black w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">Cult of What</h3>
                  <p className="text-white/40 leading-relaxed">AI Multi-Tool: TTS, STT, Translation, and Video Language Changing.</p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-8 h-8 text-purple-500" />
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {view === 'cult' && (
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Home
              </button>
              <h2 className="text-2xl font-black italic tracking-tighter text-purple-500">CULT OF WHAT</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => setView('cult-voice')}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-left space-y-6 hover:border-purple-500/50 transition-all group"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Music className="text-black w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Voice & Text AI</h4>
                  <p className="text-xs text-white/40 mt-1">TTS, STT, and Translation</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => setView('cult-video-lang')}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-left space-y-6 hover:border-blue-500/50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="text-black w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Video Language</h4>
                  <p className="text-xs text-white/40 mt-1">Change Video Language</p>
                </div>
              </motion.button>

              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 text-left space-y-6 opacity-40 cursor-not-allowed">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Video className="text-white/40 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Video Pro</h4>
                  <p className="text-xs text-white/40 mt-1">Coming Soon</p>
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 text-left space-y-6 opacity-40 cursor-not-allowed">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Settings className="text-white/40 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Future Tool</h4>
                  <p className="text-xs text-white/40 mt-1">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'cult-voice' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setView('cult')}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Folder
              </button>
              <h2 className="text-2xl font-black italic tracking-tighter text-purple-500">VOICE & TEXT AI</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6">
                  <div className="flex p-1 bg-black rounded-2xl border border-white/5">
                    {['tts', 'stt', 'translate'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setVoiceMode(mode as any)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                          voiceMode === mode ? "bg-purple-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Target Language</label>
                      <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-colors"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>

                    {voiceMode === 'tts' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Voice Selection</label>
                        <div className="grid grid-cols-2 gap-2">
                          {VOICES.map(voice => (
                            <button
                              key={voice.id}
                              onClick={() => setSelectedVoice(voice.id)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all",
                                selectedVoice === voice.id ? "bg-purple-500/20 border-purple-500 text-purple-400" : "bg-black border-white/5 text-white/40 hover:border-white/20"
                              )}
                            >
                              <p className="text-[10px] font-bold truncate">{voice.name}</p>
                              <p className="text-[8px] opacity-60">{voice.gender}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 min-h-[400px] flex flex-col">
                  {voiceMode === 'tts' || voiceMode === 'translate' ? (
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={voiceMode === 'tts' ? "Enter text to convert to speech..." : "Enter text to translate..."}
                      className="flex-1 bg-transparent border-none outline-none resize-none text-xl font-medium placeholder:text-white/10"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                      <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                        <Music className="w-10 h-10 text-purple-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">Upload Audio for STT</p>
                        <p className="text-white/40 text-sm">Supports MP3, WAV, M4A</p>
                      </div>
                      <button 
                        onClick={() => document.getElementById('audio-upload')?.click()}
                        className="px-8 py-3 bg-purple-500 text-black rounded-full font-bold hover:bg-purple-400 transition-all"
                      >
                        Select Audio File
                      </button>
                      <input 
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleSTT}
                      />
                    </div>
                  )}

                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {voiceMode === 'tts' && (
                        <button 
                          onClick={handleTTS}
                          disabled={!inputText || isProcessingAI}
                          className="px-8 py-3 bg-purple-500 text-black rounded-full font-bold hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          {isProcessingAI ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
                          Generate & Test
                        </button>
                      )}
                      {voiceMode === 'translate' && (
                        <button 
                          onClick={handleTranslate}
                          disabled={!inputText || isProcessingAI}
                          className="px-8 py-3 bg-purple-500 text-black rounded-full font-bold hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          {isProcessingAI ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Globe className="w-4 h-4" />}
                          Translate
                        </button>
                      )}
                    </div>
                    {aiResult && (
                      <div className="flex items-center gap-4">
                        {voiceMode === 'tts' && <audio src={aiResult} controls className="h-10" />}
                        <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {aiTextResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-500/10 border border-purple-500/20 rounded-3xl p-8"
                  >
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-4">AI Result</p>
                    <p className="text-lg leading-relaxed">{aiTextResult}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'cult-video-lang' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setView('cult')}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Folder
              </button>
              <h2 className="text-2xl font-black italic tracking-tighter text-blue-500">VIDEO LANGUAGE CHANGER</h2>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-12 text-center space-y-8">
              {dubbedVideoUrl ? (
                <div className="space-y-8">
                  <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/10">
                    <video src={dubbedVideoUrl} controls className="w-full h-full" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => setDubbedVideoUrl(null)}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-full font-bold transition-all"
                    >
                      Try Another
                    </button>
                    <a 
                      href={dubbedVideoUrl} 
                      download="dubbed_video.mp4"
                      className="px-8 py-4 bg-blue-500 text-black rounded-full font-bold hover:bg-blue-400 transition-all flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Dubbed Video
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-blue-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-blue-500/20">
                    <Globe className="w-12 h-12 text-blue-500" />
                  </div>
                  <div className="max-w-md mx-auto space-y-4">
                    <h3 className="text-3xl font-bold">Dub Your Video</h3>
                    <p className="text-white/40">Change the spoken language of your video while keeping the original background sounds.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Source Language</label>
                      <select className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all">
                        <option>Auto-Detect</option>
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Target Language</label>
                      <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button 
                      onClick={() => document.getElementById('video-dub-upload')?.click()}
                      disabled={isProcessingAI}
                      className="px-12 py-5 bg-blue-500 text-black rounded-full font-black text-lg hover:bg-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 mx-auto"
                    >
                      {isProcessingAI ? <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" /> : <Upload className="w-6 h-6" />}
                      {isProcessingAI ? "Processing..." : "Upload & Change Language"}
                    </button>
                    <input 
                      id="video-dub-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoDub}
                    />
                  </div>
                </>
              )}
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
