import React, { useState, useEffect, useMemo } from 'react';
import {
  AppTab,
  BusinessCardData,
  ViewMode,
} from './types';
import { SAMPLE_CARDS, MY_CARD_DEFAULT } from './data/sampleCards';
import { AndroidFrame } from './components/AndroidFrame';
import { CardVisual } from './components/CardVisual';
import { ScannerModal } from './components/ScannerModal';
import { CardDetailModal } from './components/CardDetailModal';
import { CamCard2JsonView } from './components/CamCard2JsonView';
import { MyCardView } from './components/MyCardView';
import { SettingsView } from './components/SettingsView';
import { QRCodeModal } from './components/QRCodeModal';
import { downloadVCard } from './utils/vcard';
import {
  Search,
  Camera,
  Star,
  SlidersHorizontal,
  Grid,
  List as ListIcon,
  Phone,
  Mail,
  QrCode,
  Share2,
  Plus,
  BookOpen,
  Layers,
  Settings,
  Sparkles,
  ArrowUpDown,
  Filter,
  CreditCard,
  User,
  ArrowRight,
} from 'lucide-react';

const STORAGE_KEY_CARDS = 'camcard_android_cards_v1';
const STORAGE_KEY_MYCARD = 'camcard_android_mycard_v1';

export default function App() {
  // Persistence state
  const [cards, setCards] = useState<BusinessCardData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARDS);
      return saved ? JSON.parse(saved) : SAMPLE_CARDS;
    } catch (e) {
      return SAMPLE_CARDS;
    }
  });

  const [myCard, setMyCard] = useState<BusinessCardData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MYCARD);
      return saved ? JSON.parse(saved) : MY_CARD_DEFAULT;
    } catch (e) {
      return MY_CARD_DEFAULT;
    }
  });

  // App Navigation & Modals
  const [currentTab, setCurrentTab] = useState<AppTab>('cards');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BusinessCardData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [qrModalCard, setQrModalCard] = useState<BusinessCardData | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'company'>('newest');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
    } catch (e) {
      console.warn('Storage quota error:', e);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MYCARD, JSON.stringify(myCard));
    } catch (e) {
      console.warn('Storage quota error:', e);
    }
  }, [myCard]);

  // Handle scanned card
  const handleCardScanned = (newCard: BusinessCardData) => {
    setCards((prev) => [newCard, ...prev]);
    setSelectedCard(newCard);
    setIsDetailOpen(true);
  };

  // Add card manually
  const handleAddCard = (newCard: BusinessCardData) => {
    setCards((prev) => [newCard, ...prev]);
  };

  // Update card
  const handleUpdateCard = (updated: BusinessCardData) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedCard?.id === updated.id) {
      setSelectedCard(updated);
    }
  };

  // Delete card
  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Reset to default sample collection
  const handleResetCards = () => {
    setCards(SAMPLE_CARDS);
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(SAMPLE_CARDS));
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      (c.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [cards]);

  // Filter & Sort cards
  const filteredCards = useMemo(() => {
    let result = cards.filter((card) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        card.name.fullName.toLowerCase().includes(q) ||
        card.company.name.toLowerCase().includes(q) ||
        card.jobTitle.toLowerCase().includes(q) ||
        (card.department && card.department.toLowerCase().includes(q)) ||
        (card.phones.mobile && card.phones.mobile.includes(q)) ||
        (card.phones.work && card.phones.work.includes(q)) ||
        (card.emails.primary && card.emails.primary.toLowerCase().includes(q)) ||
        (card.address.formatted && card.address.formatted.toLowerCase().includes(q)) ||
        (card.notes && card.notes.toLowerCase().includes(q)) ||
        (card.tags && card.tags.some((t) => t.toLowerCase().includes(q)));

      const matchTag =
        selectedTag === 'all'
          ? true
          : selectedTag === 'favorites'
          ? card.isFavorite
          : card.tags?.includes(selectedTag);

      return matchQuery && matchTag;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.fullName.localeCompare(b.name.fullName, 'ko-KR');
      }
      if (sortBy === 'company') {
        return a.company.name.localeCompare(b.company.name, 'ko-KR');
      }
      return 0;
    });

    return result;
  }, [cards, searchQuery, selectedTag, sortBy]);

  return (
    <AndroidFrame
      isPhoneFrame={isPhoneFrame}
      onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
    >
      {/* Top Application Bar */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-3 shrink-0 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>CamCard</span>
              <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700/50">
                JSON
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">ti-CamCard2Json Engine</p>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setQrModalCard(myCard);
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="내 명함 QR 열기"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/40 transition-transform active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>스캔</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* TAB 1: CARDS LIST / GALLERY */}
        {currentTab === 'cards' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Filter Toolbar */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800/60 flex flex-col gap-2 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="이름, 회사, 직책, 전화번호, 메모 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Tag Categories & Filter Pills */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSelectedTag('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedTag === 'all'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    전체 ({cards.length})
                  </button>

                  <button
                    onClick={() => setSelectedTag('favorites')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                      selectedTag === 'favorites'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>즐겨찾기</span>
                  </button>

                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                        selectedTag === tag
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* View Mode & Sort toggles */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    title={viewMode === 'grid' ? '리스트 뷰' : '그리드 뷰'}
                  >
                    {viewMode === 'grid' ? (
                      <ListIcon className="w-3.5 h-3.5" />
                    ) : (
                      <Grid className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-slate-900 text-slate-400 border border-slate-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                  >
                    <option value="newest">최신순</option>
                    <option value="name">이름순</option>
                    <option value="company">회사순</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cards Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {filteredCards.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <CreditCard className="w-12 h-12 text-slate-600 mb-3 stroke-1" />
                  <p className="text-sm font-semibold text-slate-300">일치하는 명함이 없습니다</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    검색어를 변경하거나 카메라로 새 명함을 스캔해보세요.
                  </p>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>명함 스캔 시작</span>
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-20">
                  {filteredCards.map((card) => (
                    <div key={card.id} className="relative group">
                      <CardVisual
                        card={card}
                        onClick={() => {
                          setSelectedCard(card);
                          setIsDetailOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* LIST VIEW */
                <div className="flex flex-col gap-2 pb-20">
                  {filteredCards.map((card) => {
                    const primaryPhone = card.phones.mobile || card.phones.work;
                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          setSelectedCard(card);
                          setIsDetailOpen(true);
                        }}
                        className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] shadow-sm"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {/* Avatar Initials */}
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
                            {card.name.lastName || card.name.fullName.charAt(0)}
                          </div>

                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-xs text-slate-100 truncate">
                                {card.name.fullName}
                              </h4>
                              {card.isFavorite && (
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {card.jobTitle} · {card.company.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">
                              {primaryPhone || card.emails.primary}
                            </p>
                          </div>
                        </div>

                        {/* Quick Contact Buttons */}
                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {primaryPhone && (
                            <a
                              href={`tel:${primaryPhone}`}
                              className="p-2 rounded-full bg-slate-950 hover:bg-emerald-950/40 text-emerald-400 transition-colors"
                              title="전화 걸기"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => setQrModalCard(card)}
                            className="p-2 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
                            title="vCard QR"
                          >
                            <QrCode className="w-3.5 h-3.5 text-sky-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Android Floating Action Button (FAB) */}
            <div className="absolute right-4 bottom-18 z-30">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                title="카메라로 명함 스캔"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CamCard2Json Studio */}
        {currentTab === 'camcard2json' && (
          <CamCard2JsonView cards={cards} onAddCard={handleAddCard} />
        )}

        {/* TAB 3: My Digital Card */}
        {currentTab === 'mycard' && (
          <MyCardView myCard={myCard} onUpdateMyCard={setMyCard} />
        )}

        {/* TAB 4: Settings & Data */}
        {currentTab === 'settings' && (
          <SettingsView
            cards={cards}
            onImportCards={(imported) => setCards((prev) => [...imported, ...prev])}
            onResetCards={handleResetCards}
          />
        )}
      </main>

      {/* Android Bottom Navigation Bar */}
      <nav className="h-16 bg-slate-900 border-t border-slate-800/80 px-2 flex items-center justify-around shrink-0 z-20">
        {/* Tab 1: Cards */}
        <button
          onClick={() => setCurrentTab('cards')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'cards'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition-colors ${
              currentTab === 'cards' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">명함첩</span>
        </button>

        {/* Tab 2: CamCard2Json Studio */}
        <button
          onClick={() => setCurrentTab('camcard2json')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'camcard2json'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition-colors ${
              currentTab === 'camcard2json' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">CamCard2Json</span>
        </button>

        {/* Middle Quick Scan Button */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 active:scale-95 transition-transform -mt-3">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 tracking-tight mt-0.5">스캔</span>
        </button>

        {/* Tab 3: My Digital Card */}
        <button
          onClick={() => setCurrentTab('mycard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'mycard'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition-colors ${
              currentTab === 'mycard' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">내 명함</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'settings'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition-colors ${
              currentTab === 'settings' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">설정</span>
        </button>
      </nav>

      {/* Camera OCR Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCardScanned={handleCardScanned}
      />

      {/* Card Detail Modal Sheet */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCard(null);
        }}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onShowQR={(c) => setQrModalCard(c)}
      />

      {/* Scannable vCard QR Modal */}
      <QRCodeModal
        card={qrModalCard}
        isOpen={!!qrModalCard}
        onClose={() => setQrModalCard(null)}
      />
    </AndroidFrame>
  );
}
