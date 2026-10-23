import React, { useState } from 'react';
import { BusinessCardData } from '../types';
import { businessCardToVCard, downloadJsonFile, downloadVCard, exportCardsToCsv } from '../utils/vcard';
import { Code2, Copy, Download, FileText, Check, ArrowRightLeft, Sparkles, Plus, ExternalLink, Terminal } from 'lucide-react';

interface CamCard2JsonViewProps {
  cards: BusinessCardData[];
  onAddCard: (card: BusinessCardData) => void;
}

export const CamCard2JsonView: React.FC<CamCard2JsonViewProps> = ({
  cards,
  onAddCard,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [mode, setMode] = useState<'cardToJson' | 'vcardToJson' | 'jsonToVcard'>('cardToJson');
  const [copied, setCopied] = useState(false);

  // vCard to JSON conversion playground state
  const [vcardInput, setVcardInput] = useState<string>(`BEGIN:VCARD
VERSION:3.0
N:홍;길동;;;
FN:홍길동
ORG:한국스마트테크 주식회사;신사업전략팀
TITLE:수석 엔지니어 (Chief Architect)
TEL;TYPE=CELL,VOICE:010-9988-7766
TEL;TYPE=WORK,VOICE:02-1234-5678
EMAIL;TYPE=PREF,INTERNET:gildong.hong@smarttech.kr
ADR;TYPE=WORK:;;테헤란로 500 한국IT센터 12층;서울시 강남구;서울특별시;06164;대한민국
URL:https://smarttech.kr
NOTE:ti-CamCard2Json 테스트용 vCard
CATEGORIES:VIP,테크,파트너
END:VCARD`);

  const [convertedJson, setConvertedJson] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleCopyJson = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConvertVCardToJson = async () => {
    try {
      const res = await fetch('/api/vcard-to-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vcardText: vcardInput }),
      });
      const data = await res.json();
      if (data.success) {
        setConvertedJson(JSON.stringify(data.data, null, 2));
      } else {
        alert('vCard 변환에 실패했습니다: ' + (data.error || ''));
      }
    } catch (e: any) {
      alert('오류 발생: ' + e.message);
    }
  };

  const handleSaveConvertedToContacts = () => {
    if (!convertedJson) return;
    try {
      const parsed = JSON.parse(convertedJson);
      const newCard: BusinessCardData = {
        id: 'card_' + Date.now(),
        name: {
          fullName: parsed.name?.fullName || '이름 없음',
          firstName: parsed.name?.firstName || '',
          lastName: parsed.name?.lastName || '',
        },
        jobTitle: parsed.jobTitle || '',
        department: parsed.department || '',
        company: { name: parsed.company?.name || '회사명' },
        phones: parsed.phones || {},
        emails: parsed.emails || { primary: '' },
        address: parsed.address || { formatted: '' },
        websites: parsed.websites || [],
        tags: parsed.tags || ['vCard-Imported'],
        notes: parsed.notes || 'Converted via ti-CamCard2Json',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cardColorTheme: 'emerald',
      };
      onAddCard(newCard);
      alert('명함첩에 저장되었습니다!');
    } catch (e) {
      alert('유효하지 않은 JSON 데이터입니다.');
    }
  };

  // Pre-generate JSON for active card
  const activeCardJson = currentCard ? JSON.stringify(currentCard, null, 2) : '{}';
  const activeCardVCard = currentCard ? businessCardToVCard(currentCard) : '';

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-5">
      {/* Reference Banner */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/60 border border-indigo-800/40 rounded-xl mb-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-white">ti-CamCard2Json Engine</span>
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                  vCard ↔ JSON
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                모바일 명함 스캔 결과를 구조화된 JSON 및 표준 vCard 3.0 규격으로 상호 변환합니다.
              </p>
            </div>
          </div>
          <a
            href="https://github.com/gtlaserbeast/ti-CamCard2Json"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-indigo-300 hover:text-indigo-100 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-indigo-800/50 hover:bg-slate-800 transition-colors shrink-0"
          >
            <span>GitHub 원작</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl mb-4 border border-slate-800 text-xs">
        <button
          onClick={() => setMode('cardToJson')}
          className={`py-2 px-2 rounded-lg font-medium transition-colors text-center ${
            mode === 'cardToJson'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          명함 ➔ JSON
        </button>
        <button
          onClick={() => setMode('vcardToJson')}
          className={`py-2 px-2 rounded-lg font-medium transition-colors text-center ${
            mode === 'vcardToJson'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          vCard ➔ JSON
        </button>
        <button
          onClick={() => setMode('jsonToVcard')}
          className={`py-2 px-2 rounded-lg font-medium transition-colors text-center ${
            mode === 'jsonToVcard'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          JSON ➔ vCard
        </button>
      </div>

      {/* Mode A: Card to JSON Inspector */}
      {mode === 'cardToJson' && (
        <div className="flex flex-col gap-3">
          {/* Card Selector Dropdown */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-slate-300">분석 대상 명함 선택:</label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[200px]"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.fullName} ({c.company.name})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Stats Grid */}
          {currentCard && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
                <span className="text-slate-500 block text-[10px]">이름 / 직책</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {currentCard.name.fullName} · {currentCard.jobTitle || '직책 미입력'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
                <span className="text-slate-500 block text-[10px]">회사명</span>
                <span className="font-semibold text-emerald-400 truncate block">
                  {currentCard.company.name}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
                <span className="text-slate-500 block text-[10px]">휴대폰 번호</span>
                <span className="font-semibold text-sky-400 truncate block">
                  {currentCard.phones.mobile || currentCard.phones.work || '미기재'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
                <span className="text-slate-500 block text-[10px]">이메일</span>
                <span className="font-semibold text-purple-400 truncate block">
                  {currentCard.emails.primary || '미기재'}
                </span>
              </div>
            </div>
          )}

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => handleCopyJson(activeCardJson)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨!' : 'JSON 복사'}</span>
            </button>

            <button
              onClick={() => downloadJsonFile(currentCard, `${currentCard.name.fullName || 'card'}.json`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>.json 다운로드</span>
            </button>

            <button
              onClick={() => downloadVCard(currentCard)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>.vcf (vCard 3.0) 다운로드</span>
            </button>

            <button
              onClick={() => exportCardsToCsv(cards)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>전체 엑셀 CSV ({cards.length}건)</span>
            </button>
          </div>

          {/* Code Blocks side-by-side or stacked */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Extracted BusinessCard JSON Payload</span>
              </span>
              <span className="text-[10px] text-slate-500">ti-CamCard2Json 규격</span>
            </div>

            <pre className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
              {activeCardJson}
            </pre>
          </div>
        </div>
      )}

      {/* Mode B: vCard to JSON Converter */}
      {mode === 'vcardToJson' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-400">
            CamCard API 또는 안드로이드 연락처에서 내보낸 <code className="text-emerald-400 font-mono">.vcf</code> 텍스트를 입력하면 즉시 JSON으로 변환합니다.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">vCard 3.0 소스 입력:</label>
            <textarea
              rows={8}
              value={vcardInput}
              onChange={(e) => setVcardInput(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              placeholder="BEGIN:VCARD..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConvertVCardToJson}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>JSON으로 파싱 변환하기</span>
            </button>

            {convertedJson && (
              <button
                onClick={handleSaveConvertedToContacts}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>내 명함첩에 저장</span>
              </button>
            )}
          </div>

          {convertedJson && (
            <div className="flex flex-col gap-2 mt-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-emerald-400">Parsed Output JSON</span>
                <button
                  onClick={() => handleCopyJson(convertedJson)}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>복사</span>
                </button>
              </div>
              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300 overflow-x-auto max-h-[300px] leading-relaxed">
                {convertedJson}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Mode C: JSON to vCard */}
      {mode === 'jsonToVcard' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-400">
            JSON 형태의 명함 데이터 객체를 표준 RFC vCard 3.0 포맷으로 즉시 생성합니다.
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-300">생성된 vCard 3.0 출력물:</span>
            <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300 overflow-x-auto max-h-[320px] leading-relaxed">
              {activeCardVCard}
            </pre>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyJson(activeCardVCard)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>vCard 텍스트 복사</span>
            </button>
            <button
              onClick={() => downloadVCard(currentCard)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.vcf 파일 다운로드</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
