import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BusinessCardData } from '../types';
import { businessCardToVCard, downloadVCard } from '../utils/vcard';
import { X, QrCode, Download, Share2, Check, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  card: BusinessCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  card,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (card && isOpen) {
      const vcard = businessCardToVCard(card);
      QRCode.toDataURL(vcard, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [card, isOpen]);

  if (!isOpen || !card) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.name.fullName} - ${card.company.name}`,
          text: `${card.name.fullName} (${card.jobTitle}) - ${card.company.name}\n전화: ${card.phones.mobile || card.phones.work}\n이메일: ${card.emails.primary}`,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(businessCardToVCard(card));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1 text-slate-200">
          <QrCode className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base">vCard 디지털 명함 QR</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          상대방 스마트폰 카메라로 비추면 연락처에 즉시 저장됩니다.
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-200 mb-4 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="vCard QR Code" className="w-56 h-56 object-contain" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
              QR 생성 중...
            </div>
          )}
        </div>

        {/* Card Owner Quick Bio */}
        <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4 text-left">
          <div className="flex items-baseline justify-between">
            <h4 className="font-bold text-sm text-slate-100">{card.name.fullName}</h4>
            <span className="text-xs text-emerald-400 font-medium">{card.jobTitle}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{card.company.name}</p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{card.phones.mobile || card.phones.work}</span>
            <span className="truncate max-w-[140px]">{card.emails.primary}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => downloadVCard(card)}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30"
          >
            <Download className="w-4 h-4" />
            <span>.vcf 저장</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-sky-400" />}
            <span>{copied ? '복사 완료' : '명함 공유'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
