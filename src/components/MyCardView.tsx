import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BusinessCardData } from '../types';
import { CardVisual } from './CardVisual';
import { businessCardToVCard, downloadVCard } from '../utils/vcard';
import { QrCode, Download, Share2, Edit3, Check, Sparkles, Smartphone, Mail, Phone, ExternalLink } from 'lucide-react';

interface MyCardViewProps {
  myCard: BusinessCardData;
  onUpdateMyCard: (updated: BusinessCardData) => void;
}

export const MyCardView: React.FC<MyCardViewProps> = ({
  myCard,
  onUpdateMyCard,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<BusinessCardData>(myCard);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const vcard = businessCardToVCard(myCard);
    QRCode.toDataURL(vcard, {
      margin: 2,
      width: 280,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((e) => console.error(e));
  }, [myCard]);

  const handleSave = () => {
    onUpdateMyCard({
      ...editForm,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${myCard.name.fullName}의 디지털 명함`,
          text: `${myCard.name.fullName} (${myCard.jobTitle}) - ${myCard.company.name}\n연락처: ${myCard.phones.mobile}\n이메일: ${myCard.emails.primary}`,
        });
      } catch (e) {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(businessCardToVCard(myCard));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const themes: Array<BusinessCardData['cardColorTheme']> = [
    'navy',
    'slate',
    'emerald',
    'purple',
    'crimson',
    'amber',
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-5">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-base text-slate-100">내 디지털 명함</h2>
          <p className="text-xs text-slate-400">네트워킹 현장에서 QR 코드로 상대방에게 즉시 전달하세요</p>
        </div>

        <button
          onClick={() => {
            setEditForm(JSON.parse(JSON.stringify(myCard)));
            setIsEditing(!isEditing);
          }}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isEditing ? '미리보기' : '명함 편집'}</span>
        </button>
      </div>

      {isEditing ? (
        /* Edit My Card Form */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 text-xs">
          <h3 className="font-bold text-sm text-slate-100">내 명함 정보 수정</h3>

          {/* Color Theme Selector */}
          <div>
            <label className="text-slate-400 block mb-1.5">명함 컬러 테마:</label>
            <div className="flex items-center gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, cardColorTheme: t })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    editForm.cardColorTheme === t ? 'scale-115 border-white ring-2 ring-emerald-500' : 'border-transparent'
                  } ${
                    t === 'navy'
                      ? 'bg-indigo-900'
                      : t === 'slate'
                      ? 'bg-zinc-800'
                      : t === 'emerald'
                      ? 'bg-emerald-900'
                      : t === 'purple'
                      ? 'bg-purple-900'
                      : t === 'crimson'
                      ? 'bg-rose-900'
                      : 'bg-amber-900'
                  }`}
                />
              ))}
            </div>
          </div>

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
              <label className="text-slate-400 block mb-1">부서 / 팀</label>
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
              <label className="text-slate-400 block mb-1">이메일</label>
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

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md"
            >
              저장하기
            </button>
          </div>
        </div>
      ) : (
        /* Preview Card & Live QR Exchange */
        <div className="flex flex-col items-center gap-4">
          {/* Card Surface */}
          <div className="w-full max-w-sm">
            <CardVisual card={myCard} interactive={false} />
          </div>

          {/* Scannable vCard QR Code Card */}
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>실시간 vCard 교환 QR</span>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200 mb-3">
              {qrUrl ? (
                <img src={qrUrl} alt="My vCard QR" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  QR 로딩 중...
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              상대방 카메라 앱으로 비추면 전화번호와 이메일이 스마트폰 주소록에 자동 등록됩니다.
            </p>

            <div className="w-full grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => downloadVCard(myCard)}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.vcf 저장</span>
              </button>

              <button
                onClick={handleShare}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
                <span>{copied ? '복사 완료' : '명함 공유'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
