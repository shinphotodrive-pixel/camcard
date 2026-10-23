import React, { useState, useEffect } from 'react';
import { BusinessCardData } from '../types';
import { CardVisual } from './CardVisual';
import { businessCardToVCard, downloadJsonFile, downloadVCard } from '../utils/vcard';
import {
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Tag,
  Share2,
  Download,
  Copy,
  Trash2,
  Edit3,
  QrCode,
  FileCode,
  Check,
  Star,
  ExternalLink,
  MessageSquare,
  Building,
  Briefcase,
  Save,
  Lock,
  FileText,
} from 'lucide-react';

interface CardDetailModalProps {
  card: BusinessCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (updated: BusinessCardData) => void;
  onDeleteCard: (id: string) => void;
  onShowQR: (card: BusinessCardData) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onShowQR,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<BusinessCardData | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'memo' | 'ocr' | 'photo'>('info');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [privateNotes, setPrivateNotes] = useState(card?.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (card) {
      setPrivateNotes(card.notes || '');
      setNotesSaved(false);
    }
  }, [card?.id, card?.notes]);

  const handleSavePrivateNotes = (textToSave?: string) => {
    if (!card) return;
    const finalNotes = typeof textToSave === 'string' ? textToSave : privateNotes;
    const updated: BusinessCardData = {
      ...card,
      notes: finalNotes,
      updatedAt: new Date().toISOString(),
    };
    onUpdateCard(updated);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2200);
  };

  const handleDownloadVCard = () => {
    if (card) {
      downloadVCard(card);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }
  };

  if (!isOpen || !card) return null;

  const handleStartEdit = () => {
    setEditForm(JSON.parse(JSON.stringify(card)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateCard({
        ...editForm,
        updatedAt: new Date().toISOString(),
      });
      setPrivateNotes(editForm.notes || '');
      setIsEditing(false);
    }
  };

  const handleToggleFavorite = () => {
    onUpdateCard({
      ...card,
      isFavorite: !card.isFavorite,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(card, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const primaryPhone = card.phones?.mobile || card.phones?.work;
  const primaryEmail = card.emails?.primary;
  const primaryWeb = card.websites?.[0];
  const mapsUrl = card.address?.formatted
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address.formatted)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top App Bar */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-full transition-colors ${
                card.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="즐겨찾기"
            >
              <Star className={`w-5 h-5 ${card.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <span className="font-semibold text-sm text-slate-100">명함 상세 정보</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadVCard}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Download vCard (.vcf) file"
            >
              {downloadSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-blue-400" />
              )}
            </button>

            <button
              onClick={() => onShowQR(card)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="vCard QR 코드"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={handleStartEdit}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="명함 수정"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Download Success Notification */}
          {downloadSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2 shadow-lg animate-in fade-in duration-150">
              <div className="flex items-center gap-2 truncate">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  <strong>{card.name.fullName || 'Contact'}.vcf</strong> 파일이 기기에 다운로드되었습니다.
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono shrink-0 bg-emerald-900/60 px-2 py-0.5 rounded">vCard 3.0</span>
            </div>
          )}

          {/* Card Visual Graphic */}
          <div className="w-full max-w-sm mx-auto">
            <CardVisual card={card} interactive={false} />
          </div>

          {/* Android Direct Action Quick-Launch Grid (Call, SMS, Email, Web, Map, vCard) */}
          <div className="grid grid-cols-6 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 text-center">
            {/* Call */}
            <a
              href={primaryPhone ? `tel:${primaryPhone}` : undefined}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                primaryPhone
                  ? 'hover:bg-slate-800 text-emerald-400 active:scale-95'
                  : 'opacity-30 pointer-events-none text-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">전화</span>
            </a>

            {/* SMS */}
            <a
              href={card.phones?.mobile ? `sms:${card.phones.mobile}` : undefined}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                card.phones?.mobile
                  ? 'hover:bg-slate-800 text-sky-400 active:scale-95'
                  : 'opacity-30 pointer-events-none text-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center mb-1">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">문자</span>
            </a>

            {/* Email */}
            <a
              href={primaryEmail ? `mailto:${primaryEmail}` : undefined}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                primaryEmail
                  ? 'hover:bg-slate-800 text-amber-400 active:scale-95'
                  : 'opacity-30 pointer-events-none text-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-1">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">이메일</span>
            </a>

            {/* Website */}
            <a
              href={primaryWeb ? (primaryWeb.startsWith('http') ? primaryWeb : `https://${primaryWeb}`) : undefined}
              target="_blank"
              rel="noreferrer"
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                primaryWeb
                  ? 'hover:bg-slate-800 text-indigo-400 active:scale-95'
                  : 'opacity-30 pointer-events-none text-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mb-1">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">웹</span>
            </a>

            {/* Map */}
            <a
              href={mapsUrl || undefined}
              target="_blank"
              rel="noreferrer"
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                mapsUrl
                  ? 'hover:bg-slate-800 text-rose-400 active:scale-95'
                  : 'opacity-30 pointer-events-none text-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mb-1">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">지도</span>
            </a>

            {/* Download vCard Button */}
            <button
              onClick={handleDownloadVCard}
              className={`flex flex-col items-center justify-center p-2 rounded-xl active:scale-95 transition-all ${
                downloadSuccess
                  ? 'bg-emerald-950/60 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'hover:bg-slate-800 text-blue-400'
              }`}
              title="Download vCard (.vcf) to device"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-1">
                {downloadSuccess ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-200">
                {downloadSuccess ? '저장됨' : 'vCard저장'}
              </span>
            </button>
          </div>

          {/* Tab Selector: Information vs Memo vs Raw OCR */}
          <div className="flex border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'info'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              상세 정보
            </button>
            <button
              onClick={() => setActiveTab('memo')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'memo'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              미팅 기록 & 메모
            </button>
            <button
              onClick={() => setActiveTab('ocr')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'ocr'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              JSON / OCR 원문
            </button>
            {card.photoUrl && (
              <button
                onClick={() => setActiveTab('photo')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'photo'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                촬영 원본 사진
              </button>
            )}
          </div>

          {/* TAB 1: Detailed Contact Information */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-3 text-xs">
              {/* Organization & Title */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-medium">회사 / 소속</span>
                </div>
                <div className="pl-5">
                  <p className="text-sm font-semibold text-slate-100">{card.company.name}</p>
                  {card.company.division && (
                    <p className="text-slate-400 text-xs mt-0.5">{card.company.division}</p>
                  )}
                  {card.industry && (
                    <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      업종: {card.industry}
                    </span>
                  )}
                </div>
              </div>

              {/* Position & Title */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-medium">직책 / 부서</span>
                </div>
                <div className="pl-5">
                  <p className="text-sm font-semibold text-slate-100">
                    {card.jobTitle || '직책 정보 없음'}
                  </p>
                  {card.department && (
                    <p className="text-slate-400 text-xs mt-0.5">{card.department}</p>
                  )}
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-medium">연락처</span>
                </div>
                <div className="pl-5 flex flex-col gap-1.5 font-mono">
                  {card.phones.mobile && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">휴대폰 (Mobile)</span>
                      <a href={`tel:${card.phones.mobile}`} className="text-slate-100 hover:text-emerald-400">
                        {card.phones.mobile}
                      </a>
                    </div>
                  )}
                  {card.phones.work && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">회사 전화 (Work)</span>
                      <a href={`tel:${card.phones.work}`} className="text-slate-100 hover:text-emerald-400">
                        {card.phones.work}
                      </a>
                    </div>
                  )}
                  {card.phones.fax && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">팩스 (Fax)</span>
                      <span className="text-slate-300">{card.phones.fax}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[11px] font-medium">이메일 주소</span>
                </div>
                <div className="pl-5 flex flex-col gap-1">
                  <a
                    href={`mailto:${card.emails.primary}`}
                    className="text-slate-100 hover:text-sky-400 font-mono"
                  >
                    {card.emails.primary || '이메일 없음'}
                  </a>
                  {card.emails.secondary && (
                    <a
                      href={`mailto:${card.emails.secondary}`}
                      className="text-slate-400 hover:text-sky-400 font-mono text-[11px]"
                    >
                      {card.emails.secondary} (보조)
                    </a>
                  )}
                </div>
              </div>

              {/* Address */}
              {card.address?.formatted && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[11px] font-medium">회사 주소</span>
                  </div>
                  <div className="pl-5 flex items-start justify-between gap-2">
                    <p className="text-slate-200 leading-relaxed">{card.address.formatted}</p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-rose-400 hover:text-rose-300 shrink-0 flex items-center gap-0.5 underline mt-0.5"
                      >
                        <span>지도보기</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Websites */}
              {card.websites && card.websites.length > 0 && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-medium">웹사이트</span>
                  </div>
                  <div className="pl-5 flex flex-col gap-1">
                    {card.websites.map((url, i) => (
                      <a
                        key={i}
                        href={url.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:text-indigo-100 truncate flex items-center gap-1"
                      >
                        <span>{url}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                {card.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Meeting notes & memo */}
          {activeTab === 'memo' && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-medium">미팅 일시 및 장소</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">미팅 일자</span>
                    <span className="text-slate-200 font-mono">
                      {card.meetingDate || '미팅 날짜 미기록'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">장소 / 행사명</span>
                    <span className="text-slate-200">
                      {card.meetingLocation || '장소 미기록'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                <span className="text-[11px] font-medium text-slate-400">상담 메모 및 특이사항</span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900 p-3 rounded-lg border border-slate-800/60 font-sans">
                  {card.notes || '등록된 메모가 없습니다. [명함 수정] 버튼을 눌러 미팅 기록을 추가해보세요.'}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                <span>등록일: {new Date(card.createdAt).toLocaleDateString()}</span>
                <span>최종 수정: {new Date(card.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* TAB 3: Raw JSON / CamCard2Json Output */}
          {activeTab === 'ocr' && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">ti-CamCard2Json Extracted Data:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyJson}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? '복사됨' : 'JSON 복사'}</span>
                  </button>
                  <button
                    onClick={() => downloadJsonFile(card, `${card.name.fullName}.json`)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-blue-400" />
                    <span>저장</span>
                  </button>
                </div>
              </div>

              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[300px]">
                {JSON.stringify(card, null, 2)}
              </pre>

              {card.rawText && (
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-400">OCR 원본 텍스트:</span>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 whitespace-pre-wrap">
                    {card.rawText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Original Scanned Photo */}
          {activeTab === 'photo' && card.photoUrl && (
            <div className="flex flex-col items-center gap-3 animate-in fade-in">
              <div className="w-full bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                <img
                  src={card.photoUrl}
                  alt="명함 원본 사진"
                  className="w-full max-h-[380px] object-contain rounded-xl shadow-lg"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                카메라로 촬영하여 스캔된 원본 명함 이미지입니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer Delete Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={() => {
              if (confirm('이 명함을 삭제하시겠습니까?')) {
                onDeleteCard(card.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>명함 삭제</span>
          </button>

          <button
            onClick={handleDownloadVCard}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shadow-md ${
              downloadSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-900/40 ring-2 ring-emerald-400/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 active:scale-95'
            }`}
            title="Download contact as vCard (.vcf) file"
          >
            {downloadSuccess ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            <span>{downloadSuccess ? 'vCard Saved (.vcf)!' : 'Download vCard (.vcf)'}</span>
          </button>
        </div>
      </div>

      {/* Edit Form Modal Sub-overlay */}
      {isEditing && editForm && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-sm text-slate-100">명함 정보 직접 수정</h4>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">성명 (Full Name)</label>
                <input
                  type="text"
                  value={editForm.name.fullName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: { ...editForm.name, fullName: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">직책 (Job Title)</label>
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">부서 (Department)</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">회사명 (Company)</label>
                <input
                  type="text"
                  value={editForm.company.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      company: { ...editForm.company, name: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">휴대폰 번호</label>
                  <input
                    type="text"
                    value={editForm.phones.mobile || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        phones: { ...editForm.phones, mobile: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">회사 유선전화</label>
                  <input
                    type="text"
                    value={editForm.phones.work || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        phones: { ...editForm.phones, work: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">이메일 주소</label>
                <input
                  type="email"
                  value={editForm.emails.primary}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      emails: { ...editForm.emails, primary: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">주소</label>
                <input
                  type="text"
                  value={editForm.address.formatted}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      address: { ...editForm.address, formatted: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">상담 메모</label>
                <textarea
                  rows={3}
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-md"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
