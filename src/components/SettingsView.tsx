import React, { useRef } from 'react';
import { BusinessCardData } from '../types';
import { downloadAllVCards, downloadJsonFile, exportCardsToCsv } from '../utils/vcard';
import { SAMPLE_CARDS } from '../data/sampleCards';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

interface SettingsViewProps {
  cards: BusinessCardData[];
  onImportCards: (cards: BusinessCardData[]) => void;
  onResetCards: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  cards,
  onImportCards,
  onResetCards,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleBackupJson = () => {
    downloadJsonFile(cards, `CamCard_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportCards(parsed);
          alert(`성공적으로 ${parsed.length}개의 명함을 가져왔습니다!`);
        } else if (parsed && typeof parsed === 'object') {
          onImportCards([parsed]);
          alert('1개의 명함을 가져왔습니다!');
        }
      } catch (err) {
        alert('올바른 JSON 백업 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-emerald-400" />
        <h2 className="font-bold text-base text-slate-100">설정 및 데이터 관리</h2>
      </div>

      <div className="flex flex-col gap-4 text-xs">
        {/* Card Storage Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400" />
              <span>보관된 명함 통계</span>
            </span>
            <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-mono text-[11px]">
              총 {cards.length}장
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">즐겨찾기</span>
              <span className="text-sm font-bold text-amber-400">
                {cards.filter((c) => c.isFavorite).length}
              </span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">메모 포함</span>
              <span className="text-sm font-bold text-emerald-400">
                {cards.filter((c) => c.notes).length}
              </span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">전화번호 보유</span>
              <span className="text-sm font-bold text-sky-400">
                {cards.filter((c) => c.phones.mobile || c.phones.work).length}
              </span>
            </div>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
          <span className="font-semibold text-slate-200">데이터 백업 및 내보내기</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleBackupJson}
              className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors flex items-center gap-2.5 text-left"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-100">JSON 전체 백업</p>
                <p className="text-[10px] text-slate-400">구조화된 JSON 형식으로 다운로드</p>
              </div>
            </button>

            <button
              onClick={() => downloadAllVCards(cards)}
              className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors flex items-center gap-2.5 text-left"
            >
              <Download className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-100">vCard 3.0 일괄 내보내기</p>
                <p className="text-[10px] text-slate-400">안드로이드 스마트폰 주소록 연동용</p>
              </div>
            </button>

            <button
              onClick={() => exportCardsToCsv(cards)}
              className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors flex items-center gap-2.5 text-left"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-100">엑셀 CSV 내보내기</p>
                <p className="text-[10px] text-slate-400">Excel / 구글 스프레드시트 호환</p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors flex items-center gap-2.5 text-left"
            >
              <Upload className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-100">JSON 백업 파일 복원</p>
                <p className="text-[10px] text-slate-400">외부 JSON 파일 불러오기</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">기본 샘플 명함 데이터로 복원</span>
            <button
              onClick={() => {
                if (confirm('샘플 명함 데이터로 초기화하시겠습니까? 현재 추가된 명함이 대체됩니다.')) {
                  onResetCards();
                }
              }}
              className="px-3 py-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 rounded-lg text-[11px] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>샘플 데이터 초기화</span>
            </button>
          </div>
        </div>

        {/* Engine Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-slate-200">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">CamCard2Json AI 인식 엔진 사양</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] flex flex-col gap-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">AI 모델:</span>
              <span className="text-emerald-400">gemini-3.8-flash</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">구조화 규격:</span>
              <span className="text-sky-400">ti-CamCard2Json Standard</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">지원 언어:</span>
              <span className="text-slate-300">한국어, 영어, 일본어, 중국어</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">vCard 호환성:</span>
              <span className="text-slate-300">RFC 2426 vCard 3.0 / 4.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">서버 프록시:</span>
              <span className="text-emerald-300">Express /api/card-to-json</span>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">참조 오픈소스 및 라이선스</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            본 애플리케이션은 <strong>gtlaserbeast/ti-CamCard2Json</strong>의 명함 파싱 및 JSON 변환 설계 철학을 바탕으로 개발된 모바일 안드로이드 스타일 명함 스캐너 & 연락처 관리자입니다.
          </p>
          <a
            href="https://github.com/gtlaserbeast/ti-CamCard2Json"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] pt-1"
          >
            <span>GitHub: https://github.com/gtlaserbeast/ti-CamCard2Json</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
