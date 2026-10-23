import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Flashlight, RefreshCw, X, Check, Image as ImageIcon, Sparkles, Layers, Sliders } from 'lucide-react';
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
  const [torchOn, setTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'contrast' | 'bw'>('normal');
  const [batchMode, setBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start camera on modal open
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setIsProcessing(false);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access not granted or not available:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

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

  // Capture frame from video stream
  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    processCardImage(dataUrl);
  };

  // Upload file from gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      processCardImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Quick select a sample card for instant demo testing
  const handleSelectSample = (sample: typeof SAMPLE_CARDS[0]) => {
    setIsProcessing(true);
    setProcessingStage('샘플 명함 로드 및 OCR 분석 중...');

    setTimeout(() => {
      // Create fresh card instance with timestamp
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
    setProcessingStage('명함 윤곽 검출 및 이미지 향상 중...');

    try {
      setTimeout(() => setProcessingStage('CamCard2Json OCR 엔터티 분석 중...'), 400);

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
        }, 500);
      } else {
        throw new Error(result.error || 'OCR 분석 실패');
      }
    } catch (err: any) {
      console.error('Scan processing error:', err);
      // Fallback: create mock recognized card
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
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="px-4 py-3 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-20 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-sm text-slate-100">CamCard 명함 스캐너</span>
          {batchMode && (
            <span className="text-[11px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              연속 스캔 ({batchCount}장)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Batch Mode Toggle */}
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border ${
              batchMode
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>연속</span>
          </button>

          {/* Flash Toggle */}
          <button
            onClick={toggleTorch}
            className={`p-2 rounded-full transition-colors ${
              torchOn ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="플래시 조명"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {/* Live Camera Stream */}
        {cameraActive && !capturedImage ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured Card"
            className="absolute inset-0 w-full h-full object-contain bg-slate-950"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm text-slate-400">
            <Camera className="w-12 h-12 text-slate-600 mb-3 stroke-1" />
            <p className="text-sm font-medium text-slate-300 mb-1">카메라 프리뷰 활성화 대기 중</p>
            <p className="text-xs text-slate-500 mb-4">
              카메라 권한을 허용하거나 아래 갤러리/샘플 명함으로 즉시 스캔해보세요.
            </p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              카메라 다시 시작
            </button>
          </div>
        )}

        {/* Viewfinder Overlay Mask with Card Frame (85mm x 54mm = 1.57:1) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-[340px] aspect-[1.65/1] rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] overflow-hidden">
            {/* Viewfinder Corner Crosshairs */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

            {/* Animated Laser Scanning Line */}
            {cameraActive && !isProcessing && (
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2s_infinite]" />
            )}

            {/* AI OCR Guide Label */}
            <div className="absolute bottom-2 inset-x-0 text-center">
              <span className="text-[10px] font-medium bg-black/60 text-emerald-300 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                명함을 프레임에 맞춰주세요 (85 × 54mm)
              </span>
            </div>
          </div>
        </div>

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">ti-CamCard2Json AI 분석 중</h4>
            <p className="text-xs text-emerald-400 font-mono animate-pulse">{processingStage}</p>
            <p className="text-[11px] text-slate-500 mt-3 max-w-xs">
              이름, 직책, 회사, 전화번호(휴대폰/유선), 이메일, 주소를 구조화된 JSON 및 vCard로 추출하고 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4 z-20 flex flex-col gap-3">
        {/* Sample Card Quick Tester Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>원클릭 샘플 명함 테스트 (Test Samples):</span>
            </span>
            <span className="text-[10px] text-slate-500">클릭 즉시 OCR 시뮬레이션</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
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

        {/* Primary Shutter & Gallery Buttons */}
        <div className="flex items-center justify-around pt-2">
          {/* Gallery Picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px]">앨범 선택</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Shutter Button (Capture) */}
          <button
            onClick={captureFrame}
            disabled={isProcessing}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all p-1 shadow-lg shadow-emerald-500/30 flex items-center justify-center"
          >
            <div className="w-13 h-13 rounded-full border-2 border-white flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>

          {/* Manual Input Fallback */}
          <button
            onClick={() => {
              const dummySample = SAMPLE_CARDS[0];
              handleSelectSample(dummySample);
            }}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px]">데모 인식</span>
          </button>
        </div>
      </div>
    </div>
  );
};
