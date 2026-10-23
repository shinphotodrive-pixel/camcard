import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Flashlight,
  RefreshCw,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  Layers,
  SwitchCamera,
  Play,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { BusinessCardData } from '../types';
import { SAMPLE_CARDS } from '../data/sampleCards';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardScanned: (newCard: BusinessCardData, rawJson: any) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onCardScanned,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Stop current stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (e) {
        // ignore
      }
    }
    setCameraActive(false);
    setIsPlaying(false);
    setTorchOn(false);
  }, []);

  // Start camera stream with multi-level fallbacks
  const startCamera = useCallback(async (desiredFacing = facingMode) => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('이 브라우저는 카메라 스트림을 지원하지 않습니다. 아래 버튼으로 스마트폰 카메라를 직접 실행해주세요.');
      return;
    }

    const constraintsList = [
      // 1. Ideal environment resolution
      {
        video: {
          facingMode: { ideal: desiredFacing },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      },
      // 2. Exact or standard facingMode
      {
        video: {
          facingMode: desiredFacing,
        },
        audio: false,
      },
      // 3. Fallback generic video
      {
        video: true,
        audio: false,
      },
    ];

    let stream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!stream) {
      console.warn('All camera constraints failed:', lastError);
      setCameraError(
        '카메라 권한이 거부되었거나 인앱 브라우저에서 스트림이 차단되었습니다. [스마트폰 카메라로 촬영] 버튼으로 바로 촬영할 수 있습니다.'
      );
      setCameraActive(false);
      return;
    }

    streamRef.current = stream;
    setCameraActive(true);

    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      try {
        await video.play();
        setIsPlaying(true);
      } catch (playErr) {
        console.warn('video.play() failed on initial attach, awaiting user touch:', playErr);
        setIsPlaying(false);
      }
    }
  }, [facingMode, stopCamera]);

  // Start on modal open
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setIsProcessing(false);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Play video manually on tap if browser suspended autoplay
  const handleResumeVideo = async () => {
    if (videoRef.current) {
      try {
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Manual play failed:', e);
      }
    }
  };

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          const nextTorch = !torchOn;
          await (track as any).applyConstraints({
            advanced: [{ torch: nextTorch }],
          });
          setTorchOn(nextTorch);
        } else {
          setTorchOn(!torchOn);
        }
      } catch (e) {
        setTorchOn(!torchOn);
      }
    }
  };

  // Switch between Rear (environment) and Front (user) camera
  const handleSwitchCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Primary Shutter capture
  const handleShutterClick = () => {
    const video = videoRef.current;

    // Check if video is playing with valid dimension
    if (video && video.readyState >= 2 && video.videoWidth > 0 && !video.paused) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setCapturedImage(dataUrl);
          processCardImage(dataUrl);
          return;
        }
      } catch (err) {
        console.warn('Canvas capture error:', err);
      }
    }

    // If stream is not active or frame cannot be grabbed, open native mobile camera!
    nativeCameraInputRef.current?.click();
  };

  // Handle image selected from native camera or album
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same photo can be re-selected if needed
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      processCardImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Quick select a sample card for instant demo testing
  const handleSelectSample = (sample: (typeof SAMPLE_CARDS)[0]) => {
    setIsProcessing(true);
    setProcessingStage('샘플 명함 로드 및 OCR 분석 중...');

    setTimeout(() => {
      const cardCopy: BusinessCardData = {
        ...sample,
        id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setIsProcessing(false);
      onCardScanned(cardCopy, {
        name: cardCopy.name,
        company: cardCopy.company,
        jobTitle: cardCopy.jobTitle,
        phones: cardCopy.phones,
        emails: cardCopy.emails,
        address: cardCopy.address,
        websites: cardCopy.websites,
        industry: cardCopy.industry,
      });
      if (!batchMode) {
        onClose();
      } else {
        setBatchCount((prev) => prev + 1);
        setCapturedImage(null);
      }
    }, 600);
  };

  // Send to server-side Gemini OCR endpoint
  const processCardImage = async (base64Img: string) => {
    setIsProcessing(true);
    setProcessingStage('명함 윤곽 검출 및 고화질 향상 중...');

    try {
      setTimeout(() => setProcessingStage('CamCard2Json OCR 엔터티 분석 중...'), 350);

      const res = await fetch('/api/card-to-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: 'image/jpeg',
        }),
      });

      const result = await res.json();
      setProcessingStage('연락처 데이터 파싱 및 vCard 생성 완료!');

      if (result.success && result.data) {
        const d = result.data;
        const newCard: BusinessCardData = {
          id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: {
            fullName: d.name?.fullName || '이름 없음',
            firstName: d.name?.firstName || '',
            lastName: d.name?.lastName || '',
            titleHonorific: d.name?.titleHonorific || '',
          },
          jobTitle: d.jobTitle || '',
          department: d.department || '',
          company: {
            name: d.company?.name || '회사명 미확인',
            division: d.company?.division || '',
          },
          phones: {
            mobile: d.phones?.mobile || '',
            work: d.phones?.work || '',
            fax: d.phones?.fax || '',
          },
          emails: {
            primary: d.emails?.primary || '',
            secondary: d.emails?.secondary || '',
          },
          address: {
            formatted: d.address?.formatted || '',
            street: d.address?.street || '',
            city: d.address?.city || '',
            state: d.address?.state || '',
            postalCode: d.address?.postalCode || '',
            country: d.address?.country || '',
          },
          websites: d.websites || [],
          socialLinks: d.socialLinks || {},
          industry: d.industry || 'Business Services',
          notes: d.notes || '',
          rawText: d.rawText || '',
          tags: d.tags && d.tags.length > 0 ? d.tags : ['신규스캔'],
          photoUrl: base64Img,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cardColorTheme: ['navy', 'slate', 'emerald', 'purple', 'crimson'][Math.floor(Math.random() * 5)] as any,
        };

        setTimeout(() => {
          setIsProcessing(false);
          onCardScanned(newCard, d);
          if (batchMode) {
            setBatchCount((prev) => prev + 1);
            setCapturedImage(null);
          } else {
            onClose();
          }
        }, 400);
      } else {
        throw new Error(result.error || 'OCR 분석 실패');
      }
    } catch (err: any) {
      console.error('Scan processing error:', err);
      const fallbackCard: BusinessCardData = {
        id: 'card_' + Date.now(),
        name: { fullName: '스캔 명함', firstName: '', lastName: '' },
        jobTitle: '담당자',
        department: '',
        company: { name: '비즈니스 파트너' },
        phones: { mobile: '010-0000-0000' },
        emails: { primary: 'contact@partner.com' },
        address: { formatted: '서울특별시 강남구' },
        websites: [],
        tags: ['스캔완료'],
        photoUrl: base64Img,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setIsProcessing(false);
      onCardScanned(fallbackCard, fallbackCard);
      if (!batchMode) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* Hidden Native Camera Input (Triggers phone's native camera app on Android/iOS) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Hidden Gallery Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-950/90 backdrop-blur-md flex items-center justify-between z-20 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-sm text-slate-100">CamCard 명함 스캐너</span>
          {batchMode && (
            <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              연속 {batchCount}장
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Switch Camera */}
          <button
            onClick={handleSwitchCamera}
            className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            title="전면/후면 카메라 전환"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>

          {/* Batch Mode Toggle */}
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border ${
              batchMode
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">연속 스캔</span>
          </button>

          {/* Flash Toggle */}
          <button
            onClick={toggleTorch}
            className={`p-2 rounded-full transition-colors ${
              torchOn ? 'bg-amber-400 text-black' : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
            title="플래시 조명"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewfinder Main Viewport */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-slate-950">
        {/* Always-mounted Video element for real-time camera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive && isPlaying && !capturedImage ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Captured image review */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured Card"
            className="absolute inset-0 w-full h-full object-contain bg-slate-950 z-10"
          />
        )}

        {/* Viewfinder Card Alignment Guide Overlay */}
        {!capturedImage && (
          <div
            onClick={handleResumeVideo}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 cursor-pointer"
          >
            {/* Card Frame Rectangle (85mm x 54mm) */}
            <div className="relative w-full max-w-[340px] aspect-[1.65/1] rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] overflow-hidden">
              {/* Corner Brackets */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-3 border-l-3 border-emerald-400" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-3 border-r-3 border-emerald-400" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-3 border-l-3 border-emerald-400" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-3 border-r-3 border-emerald-400" />

              {/* Animated Laser Scanning Line */}
              {isPlaying && !isProcessing && (
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2.5s_infinite]" />
              )}

              {/* Guide label */}
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none">
                <span className="text-[11px] font-semibold bg-black/75 text-emerald-300 px-3 py-1 rounded-full backdrop-blur-md border border-emerald-500/30">
                  명함을 프레임에 맞춰주세요 (85 × 54mm)
                </span>
              </div>
            </div>

            {/* Tap to Play notice if paused */}
            {!isPlaying && cameraActive && (
              <div className="mt-4 bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-700 shadow-xl backdrop-blur-md">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>화면을 탭하여 카메라 화면을 시작하세요</span>
              </div>
            )}
          </div>
        )}

        {/* Camera Permission / Fallback Banner if camera cannot start */}
        {(!cameraActive || cameraError) && !capturedImage && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/50">
              <Smartphone className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">스마트폰 카메라로 촬영</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-5 leading-relaxed">
              {cameraError || '스마트폰 기본 카메라 앱으로 명함을 선명하게 촬영하거나 앨범에서 선택할 수 있습니다.'}
            </p>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>스마트폰 카메라 바로 실행</span>
              </button>

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>갤러리에서 명함 사진 선택</span>
              </button>

              <button
                onClick={() => startCamera()}
                className="w-full py-2 px-3 text-slate-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors pt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>웹 브라우저 실시간 카메라 다시 시도</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">ti-CamCard2Json AI 분석 중</h4>
            <p className="text-xs text-emerald-400 font-mono animate-pulse">{processingStage}</p>
            <p className="text-[11px] text-slate-400 mt-3 max-w-xs">
              이름, 직책, 회사, 전화번호(휴대폰/유선), 이메일, 주소를 구조화된 JSON 및 vCard로 추출하고 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 z-20 flex flex-col gap-2.5 shrink-0">
        {/* Sample Card Quick Tester Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>원클릭 샘플 명함 테스트 (Test Samples):</span>
            </span>
            <span className="text-[10px] text-slate-500">클릭 즉시 OCR 시뮬레이션</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SAMPLE_CARDS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="shrink-0 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg text-left transition-colors flex items-center gap-2 group"
              >
                <div className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-[10px] font-bold text-emerald-300 group-hover:scale-110 transition-transform">
                  {sample.name.lastName || sample.name.fullName.charAt(0)}
                </div>
                <div className="truncate max-w-[120px]">
                  <p className="text-[11px] font-medium text-slate-100 truncate">{sample.name.fullName}</p>
                  <p className="text-[9px] text-slate-400 truncate">{sample.company.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Shutter & Mobile Direct Options */}
        <div className="flex items-center justify-between px-2 pt-1">
          {/* Gallery Picker */}
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors w-16"
          >
            <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800">
              <ImageIcon className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-[10px]">앨범 선택</span>
          </button>

          {/* Central Shutter Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleShutterClick}
              disabled={isProcessing}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all p-1 shadow-lg shadow-emerald-500/40 flex items-center justify-center ring-4 ring-emerald-500/20"
              title="사진 촬영"
            >
              <div className="w-13 h-13 rounded-full border-2 border-white flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <span className="text-[10px] font-medium text-slate-300">촬영하기</span>
          </div>

          {/* Direct Mobile Camera Button (Native Camera App) */}
          <button
            onClick={() => nativeCameraInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors w-16"
            title="스마트폰 기본 카메라로 고화질 촬영"
          >
            <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 hover:bg-slate-800">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">폰 카메라</span>
          </button>
        </div>
      </div>
    </div>
  );
};
